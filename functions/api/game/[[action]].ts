import { movies } from '../../../src/data/movies';
import { actors } from '../../../src/data/actors';
import {
    pickMovieChoices,
    pickActorPool,
    calculatePay,
    calculateQualityScore,
    simulateRelease,
    checkOscarActress,
    checkOscarActor,
    checkBestPicture,
    calculateReRelease,
} from '../../../src/game/gameEngine';
import { productionEvent, reviewVerdict, budgetOverrun } from '../../../src/game/phaseHelpers';
import { calculateGameScores } from '../../../src/game/highScores';
import { initialGameState } from '../../../src/game/gameState';
import type { GameState } from '../../../src/game/gameState';
import type { Actor } from '../../../src/types';

// ── Env / helpers ─────────────────────────────────────────────────────────────

interface Env {
    DB: D1Database;
}

interface ScoreRow {
    movie_title: string;
    initials:    string;
    score:       number;
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: unknown, status = 200): Response {
    return Response.json(data, { status, headers: CORS_HEADERS });
}

function err(message: string, status = 400): Response {
    return json({ error: message }, status);
}

// ── Session persistence ────────────────────────────────────────────────────────

async function loadSession(db: D1Database, sessionId: string): Promise<GameState | null> {
    const row = await db.prepare(
        'SELECT state, created_at FROM sessions WHERE id = ?'
    ).bind(sessionId).first<{ state: string; created_at: string }>();
    if (!row) return null;
    // Reject sessions older than 24 hours (handles abandoned games)
    const ageMs = Date.now() - new Date(row.created_at).getTime();
    if (ageMs > 24 * 60 * 60 * 1000) {
        await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
        return null;
    }
    return JSON.parse(row.state) as GameState;
}

async function saveSession(db: D1Database, id: string, phase: string, state: GameState): Promise<void> {
    await db.prepare(
        'INSERT OR REPLACE INTO sessions (id, phase, state, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
    ).bind(id, phase, JSON.stringify(state)).run();
}

// ── Leaderboard helpers ────────────────────────────────────────────────────────

async function fetchLeaderboard(
    db: D1Database,
    cat: string,
): Promise<ScoreRow[]> {
    const { results } = await db.prepare(
        'SELECT movie_title, initials, score FROM scores WHERE category = ? ORDER BY score DESC LIMIT 5'
    ).bind(cat).all<ScoreRow>();
    return results;
}

function qualifies(list: ScoreRow[], score: number): boolean {
    return list.length < 5 || score > (list[4]?.score ?? -Infinity);
}

function disambiguateInitials(movieTitle: string, raw3: string, allRows: ScoreRow[]): string {
    let highestSuffix = ' ';
    for (const row of allRows) {
        if (row.movie_title !== movieTitle || !row.initials.startsWith(raw3)) continue;
        if (row.initials.length === 3) {
            if (highestSuffix === ' ') highestSuffix = String.fromCharCode('a'.charCodeAt(0) - 1);
        } else if (row.initials.length === 4) {
            const suffix = row.initials[3];
            if (highestSuffix === ' ' || suffix > highestSuffix) highestSuffix = suffix;
        }
    }
    if (highestSuffix === ' ') return raw3;
    return raw3 + String.fromCharCode(highestSuffix.charCodeAt(0) + 1);
}

// ── Presenter picker ───────────────────────────────────────────────────────────

function pickPresenter(castNames: Set<string>): string {
    let presenter: Actor | undefined;
    do {
        const idx = Math.trunc(Math.random() * 140) + 1;
        presenter = actors.find(a => a.id === idx);
    } while (!presenter || castNames.has(presenter.name));
    return presenter.name === 'Schwarzenegger' ? 'Arnold Schwarzenegger' : presenter.name;
}

// ── Phase handlers ─────────────────────────────────────────────────────────────

async function handleStart(db: D1Database): Promise<Response> {
    const state = initialGameState();
    state.movieChoices = pickMovieChoices(movies, Math.random);
    state.phase = 'movie-selection';

    const sessionId = crypto.randomUUID();
    await saveSession(db, sessionId, 'movie-selection', state);

    return json({
        sessionId,
        movieChoices: state.movieChoices.map(m => ({
            id:               m.id,
            title:            m.title,
            descriptionLines: m.descriptionLines,
            roles:            m.roles.map(r => ({ name: r.name, requirements: r.requirements })),
        })),
    });
}

async function handleMovie(
    db: D1Database,
    body: { sessionId?: string; choice?: number },
): Promise<Response> {
    const { sessionId, choice } = body;
    if (!sessionId || typeof choice !== 'number' || choice < 1 || choice > 3) return err('Invalid request');

    const state = await loadSession(db, sessionId);
    if (!state || state.phase !== 'movie-selection') return err('Invalid session or phase', 404);

    state.selectedMovie = state.movieChoices![choice - 1];
    state.actorPool  = pickActorPool(actors, Math.random);
    state.actorPays  = state.actorPool.map(a => calculatePay(a, Math.random));
    state.phase      = 'casting';

    await saveSession(db, sessionId, 'casting', state);

    return json({
        actorPool: state.actorPool.map((a, i) => ({
            id:     a.id,
            name:   a.name,
            gender: a.gender,
            pay:    state.actorPays[i],
        })),
    });
}

async function handleCast(
    db: D1Database,
    body: { sessionId?: string; actorIndices?: number[] },
): Promise<Response> {
    const { sessionId, actorIndices } = body;
    if (!sessionId || !Array.isArray(actorIndices) || actorIndices.length !== 3) return err('Invalid request');

    const state = await loadSession(db, sessionId);
    if (!state || state.phase !== 'casting') return err('Invalid session or phase', 404);

    const movie = state.selectedMovie!;

    // Validate picks
    const seen = new Set<number>();
    for (let i = 0; i < 3; i++) {
        const poolIdx = actorIndices[i] - 1; // 0-based
        if (poolIdx < 0 || poolIdx >= 12)    return err(`Invalid actor index: ${actorIndices[i]}`);
        if (seen.has(poolIdx))               return err('Duplicate actor');
        seen.add(poolIdx);

        const actor      = state.actorPool[poolIdx];
        const genderCode = movie.roles[i].requirements[0];
        const genderOk   =
            genderCode === 5 ||
            (genderCode === 1 && actor.gender === 'M') ||
            (genderCode === 9 && actor.gender === 'F');
        if (!genderOk) return err(`Actor ${actorIndices[i]} is wrong gender for role ${i + 1}`);
    }

    state.cast = actorIndices.map((poolIdx1, roleIdx) => ({
        roleIndex: roleIdx as 0 | 1 | 2,
        actor:     state.actorPool[poolIdx1 - 1],
        pay:       state.actorPays[poolIdx1 - 1],
    }));
    state.salaryCost = state.cast.reduce((sum, cr) => sum + cr.pay, 0);
    state.phase      = 'budget';

    await saveSession(db, sessionId, 'budget', state);

    return json({
        castSummary: state.cast.map(cr => ({
            roleName:  movie.roles[cr.roleIndex].name,
            actorName: cr.actor.name,
            pay:       cr.pay,
        })),
        salaryCost: state.salaryCost,
        budgetMin:  movie.budgetMin,
        budgetIdeal: movie.budgetIdeal,
    });
}

async function handleBudget(
    db: D1Database,
    body: { sessionId?: string; budget?: number },
): Promise<Response> {
    const { sessionId, budget } = body;
    if (!sessionId || typeof budget !== 'number') return err('Invalid request');

    const state = await loadSession(db, sessionId);
    if (!state || state.phase !== 'budget') return err('Invalid session or phase', 404);

    const movie = state.selectedMovie!;
    if (budget < movie.budgetMin || budget > 30000) return err('Budget out of range');

    const effectiveBudget = Math.min(budget, movie.budgetIdeal);

    // Production event
    const castNames   = state.cast.map(cr => cr.actor.name);
    const event       = productionEvent(castNames[0], castNames[1], castNames[2], Math.trunc(Math.random() * 10) + 1);
    let eventCostDelta = 0;
    if (event) {
        state.reviewScore += event.reviewDelta;
        eventCostDelta     = event.costDelta;
    }

    // Budget overrun
    const { text: overrunText, overrun } = budgetOverrun(budget, Math.trunc(Math.random() * 100));
    const rawBudget = budget + overrun;
    state.totalCost = state.salaryCost + eventCostDelta + rawBudget;

    // Reviews (9 critics)
    const REVIEWERS = [
        'The NY Times', 'Entertainment Tonight', 'Gene Siskel', 'Roger Ebert',
        'Sneak Previews', 'Rex Reed', 'Time Magazine', 'Newsweek', 'LA Times',
    ];
    const reviews = REVIEWERS.map(reviewer => {
        const { text, scoreDelta } = reviewVerdict(Math.trunc(Math.random() * 10) + 1);
        state.reviewScore += scoreDelta;
        return { reviewer, text };
    });

    // Rating + cast display names
    const RATINGS = ['PG', 'PG-13', 'R'];
    const rating  = RATINGS[Math.trunc(Math.random() * 3)];
    let [vx, vy, vz] = state.cast.map(cr =>
        cr.actor.name === 'Schwarzenegger' ? 'Arnold Schwarzenegger' : cr.actor.name
    );
    if (vy.length === 21) [vx, vy] = [vy, vx];
    if (vz.length === 21) [vx, vz] = [vz, vx];

    // Quality score + release simulation
    state.productionBudget = effectiveBudget;
    const { mq } = calculateQualityScore(movie, state.cast, state.reviewScore, effectiveBudget);
    const { weeklyGross, totalGross } = simulateRelease(mq, Math.random);
    state.weeklyGross = weeklyGross;
    state.totalGross  = totalGross;

    // Academy Awards
    let w = 0;
    const actressResult = checkOscarActress(movie, state.cast, actors, movies, Math.random);
    if (actressResult.isPlayerWin) { state.oscarsWon++; w += actressResult.weight; }
    const actorResult   = checkOscarActor(movie, state.cast, actors, movies, Math.random);
    if (actorResult.isPlayerWin)   { state.oscarsWon++; w += actorResult.weight; }
    const pictureResult = checkBestPicture(movie, state.cast, movies, Math.random);
    if (pictureResult.isPlayerWin) { state.oscarsWon++; w += pictureResult.weight; }

    // Re-release
    let reReleaseGross = 0;
    if (w > 0) {
        reReleaseGross    = calculateReRelease(state.totalGross, w, Math.random);
        state.reReleaseGross = reReleaseGross;
        state.totalGross  += reReleaseGross;
    }

    // Presenters (picked after all award RNG is consumed)
    const castNameSet = new Set(castNames);
    const presenter1  = pickPresenter(castNameSet);
    const presenter2  = pickPresenter(castNameSet);
    const presenter3  = pickPresenter(castNameSet);

    // Leaderboard qualification check
    const gameScores = calculateGameScores(state.totalGross, state.totalCost);
    const CATS = ['highestProfit', 'greatestRevenue', 'bestPctReturned', 'biggestBomb'] as const;
    const boards: Record<string, ScoreRow[]> = {};
    for (const cat of CATS) boards[cat] = await fetchLeaderboard(db, cat);

    const playerQualifies =
        (gameScores.profit > 0      && qualifies(boards.highestProfit,   gameScores.profit))      ||
        qualifies(boards.greatestRevenue,  gameScores.revenue)                                      ||
        qualifies(boards.bestPctReturned,  gameScores.pctReturned)                                 ||
        (gameScores.bomb > 0        && qualifies(boards.biggestBomb,     gameScores.bomb));

    // Persist final state
    state.phase = 'high-scores';
    await saveSession(db, sessionId, 'high-scores', state);

    return json({
        event: event
            ? { message: event.message, reviewDelta: event.reviewDelta, costDelta: event.costDelta }
            : null,
        overrunText,
        overrun,
        totalCost:  state.totalCost,
        reviews,
        rating,
        vx, vy, vz,
        weeklyGross,
        totalGross: state.totalGross,
        actressResult: { winnerName: actressResult.winnerName, winnerMovie: actressResult.winnerMovie, isPlayerWin: actressResult.isPlayerWin },
        actorResult:   { winnerName: actorResult.winnerName,   winnerMovie: actorResult.winnerMovie,   isPlayerWin: actorResult.isPlayerWin   },
        pictureResult: { winnerName: pictureResult.winnerName, winnerMovie: pictureResult.winnerMovie, isPlayerWin: pictureResult.isPlayerWin },
        reReleaseGross,
        oscarsWon:  state.oscarsWon,
        presenter1,
        presenter2,
        presenter3,
        qualifies:  playerQualifies,
        scores:     gameScores,
        movieTitle: movie.title,
    });
}

async function handleFinish(
    db: D1Database,
    body: { sessionId?: string; initials?: string },
): Promise<Response> {
    const { sessionId, initials } = body;
    if (!sessionId) return err('Invalid request');

    const state = await loadSession(db, sessionId);
    if (!state || state.phase !== 'high-scores') return err('Invalid session or phase', 404);

    const movie      = state.selectedMovie!;
    const gameScores = calculateGameScores(state.totalGross, state.totalCost);
    const CATS       = ['highestProfit', 'greatestRevenue', 'bestPctReturned', 'biggestBomb'] as const;

    // Load current boards
    const boards: Record<string, ScoreRow[]> = {};
    for (const cat of CATS) boards[cat] = await fetchLeaderboard(db, cat);

    // Insert qualifying scores (only if initials provided)
    const raw3 = (initials ?? '').trim().toUpperCase().slice(0, 3);
    if (raw3.length === 3) {
        const allRows   = [...boards.highestProfit, ...boards.greatestRevenue, ...boards.bestPctReturned, ...boards.biggestBomb];
        const finalInit = disambiguateInitials(movie.title, raw3, allRows);

        const inserts: Promise<D1Result>[] = [];
        const tryInsert = (cat: string, score: number, condition: boolean) => {
            if (condition && qualifies(boards[cat], score)) {
                inserts.push(
                    db.prepare('INSERT INTO scores (category, movie_title, initials, score) VALUES (?, ?, ?, ?)')
                        .bind(cat, movie.title, finalInit, score)
                        .run()
                );
            }
        };
        tryInsert('highestProfit',   gameScores.profit,      gameScores.profit > 0);
        tryInsert('greatestRevenue', gameScores.revenue,     true);
        tryInsert('bestPctReturned', gameScores.pctReturned, true);
        tryInsert('biggestBomb',     gameScores.bomb,        gameScores.bomb > 0);
        await Promise.all(inserts);
    }

    // Delete session
    await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();

    // Return updated leaderboard
    const updated: Record<string, ScoreRow[]> = {};
    for (const cat of CATS) updated[cat] = await fetchLeaderboard(db, cat);

    return json({ leaderboards: updated });
}

// ── Router ─────────────────────────────────────────────────────────────────────

export const onRequest: PagesFunction<Env> = async (ctx) => {
    if (ctx.request.method === 'OPTIONS') {
        return new Response(null, { headers: CORS_HEADERS });
    }
    if (ctx.request.method !== 'POST') {
        return json({ error: 'Method not allowed' }, 405);
    }

    const url    = new URL(ctx.request.url);
    const action = url.pathname.split('/').pop();
    const body   = await ctx.request.json().catch(() => ({})) as Record<string, unknown>;
    const db     = ctx.env.DB;

    switch (action) {
        case 'start':  return handleStart(db);
        case 'movie':  return handleMovie(db,  body as { sessionId?: string; choice?: number });
        case 'cast':   return handleCast(db,   body as { sessionId?: string; actorIndices?: number[] });
        case 'budget': return handleBudget(db, body as { sessionId?: string; budget?: number });
        case 'finish': return handleFinish(db, body as { sessionId?: string; initials?: string });
        default:       return json({ error: 'Not found' }, 404);
    }
};
