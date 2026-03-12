// Pure game logic functions — no I/O, no side effects.
// All randomness is injected via the `rng` parameter (a function returning [0, 1))
// so that every function is fully testable with deterministic inputs.
//
// Formulas are verified against the C64 BASIC source (c64/movie mogul.prg).

import type { Actor, Movie, CastResult } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** C64 INT() — truncates toward zero (same as Math.trunc for positive numbers). */
const int = Math.trunc;

/** Pick a unique set of indices into an array using the injected rng. */
function pickUniqueIndices(count: number, max: number, rng: () => number): number[] {
    const picked: number[] = [];
    while (picked.length < count) {
        const idx = int(rng() * max) + 1; // 1-based, like C64 BASIC
        if (!picked.includes(idx)) picked.push(idx);
    }
    return picked;
}

// ── Phase 1: Movie selection ──────────────────────────────────────────────────

/**
 * Draw 3 unique movies for the player to choose from.
 * Mirrors BASIC lines 350–420.
 */
export function pickMovieChoices(
    allMovies: Movie[],
    rng: () => number,
): [Movie, Movie, Movie] {
    const indices = pickUniqueIndices(3, allMovies.length, rng);
    return indices.map(i => allMovies[i - 1]) as [Movie, Movie, Movie];
}

// ── Phase 2: Casting ──────────────────────────────────────────────────────────

/**
 * Draw the casting pool of 12 actors: 4–8 male (IDs 1–76) + remainder female (IDs 77–139).
 * Mirrors BASIC lines 880–1030.
 */
export function pickActorPool(allActors: Actor[], rng: () => number): Actor[] {
    const maleCount = int(rng() * 5) + 4; // 4–8

    const maleIndices   = pickUniqueIndices(maleCount,      76,  rng);
    const femaleIndices = pickUniqueIndices(12 - maleCount, 63,  rng).map(i => i + 76); // 77–139

    const byId = (id: number) => allActors.find(a => a.id === id)!;
    return [
        ...maleIndices.map(byId),
        ...femaleIndices.map(byId),
    ];
}

/**
 * Calculate an actor's salary demand.
 * Mirrors BASIC lines 3790–3802.
 *
 * @returns pay in thousands (e.g. 248 = $248,000)
 */
export function calculatePay(actor: Actor, rng: () => number): number {
    const x = int(rng() * 300) + 31;                     // multiplier 31–330
    let py  = int(actor.stats[1] / 2 + actor.stats[2]) * x; // INT truncates base before multiply (BASIC line 3800)
    if (py < 100) py += 100;
    return py;
}

// ── Phase 4: Box office quality score ────────────────────────────────────────

export interface QualityScoreResult {
    aq: number; // role requirements score (compounded)
    bq: number; // casting fit penalty
    cq: number; // critic review score component
    dq: number; // budget component
    mq: number; // master quality score
}

/**
 * Calculate the master quality score that drives box office performance.
 * Mirrors BASIC lines 1960–2080.
 *
 * @param budget - production budget in thousands
 * @param reviewScore - review tally (starts at 3, modified by critics: +2 loved, +1 liked, -1 didn't, -3 hated)
 */
export function calculateQualityScore(
    movie: Movie,
    cast: CastResult[],
    reviewScore: number,
    budget: number,
): QualityScoreResult {
    // aq: compounding role prestige/quality score
    let aq = 0;
    for (const role of movie.roles) {
        aq = int((aq + role.requirements[2] + role.requirements[3]) * 1.10);
    }

    // bq: penalty when actor stats fall below role requirements (indices 2–7, 0-based)
    let bq = 0;
    for (let si = 2; si <= 7; si++) {
        for (const cr of cast) {
            const roleReq  = movie.roles[cr.roleIndex].requirements[si];
            const actorStat = cr.actor.stats[si - 1]; // stats is 0-based; stats[1..6] maps to requirements[2..7]
            if (actorStat < roleReq) bq += actorStat - roleReq;
        }
    }

    const clampedReview = reviewScore < 0 ? -1 : reviewScore;
    const cq = clampedReview * 90 + 50;          // BASIC line 2060: (a*90)+50
    const dq = int(budget / 100);               // BASIC line 2070: int(mn/100)
    const mq = 38 * (aq + bq) + cq + dq;        // BASIC line 2080

    return { aq, bq, cq, dq, mq };
}

// ── Phase 4: Weekly box office simulation ────────────────────────────────────

export interface ReleaseResult {
    weeklyGross: number[];  // gross per week (in thousands)
    totalGross: number;     // sum of all weeks (in thousands)
}

/**
 * Simulate the theatrical run week-by-week.
 * Mirrors BASIC lines 2090–2270.
 *
 * @param mq - master quality score from calculateQualityScore
 */
export function simulateRelease(mq: number, rng: () => number): ReleaseResult {
    // Choose decay rate at start of run (BASIC line 2110: xx=int(rnd(1)*3)+1)
    const decayChoice = int(rng() * 3) + 1; // 1, 2, or 3
    const decayRates: Record<number, number> = { 1: 0.02, 2: 0.07, 3: 0.15 };
    const yy = decayRates[decayChoice] ?? 0.07;

    // Initial weekly gross (BASIC lines 2090–2100)
    const x0 = int(rng() * 950) + 1;
    let wt = (mq - x0) * 8;

    const weeklyGross: number[] = [];

    do {
        const weeklyNoise = int(rng() * 1200) + 100; // BASIC line 2140
        wt = wt - weeklyNoise;
        wt = wt - int(wt * yy);
        if (wt < 200) wt = 200;

        weeklyGross.push(wt);
    } while (wt >= 500);

    return {
        weeklyGross,
        totalGross: weeklyGross.reduce((sum, w) => sum + w, 0),
    };
}

// ── Phase 6: Academy Awards ───────────────────────────────────────────────────

/**
 * Implements C64 gosub7000 — determines whether a randomly selected movie is
 * eligible to appear as the award-winning film for a non-player actress/actor winner.
 *
 * BASIC lines 7000–7090:
 *   7010 if x=9 and x%(7)<5 then n%=1   ← exclude movie 9 if winner.stats[5] < 5
 *   7020 if x=6 and x%(1)=9 and x%(2)<5 then n%=1  ← exclude movie 6 if female winner with stats[0] < 5
 *   7030 if player's movie OR id=2 OR id=7 then n%=1
 *
 * x%() is populated from the winner actor's an%() array just before gosub7000 is called
 * (lines 3475 / 3615): x%(1)=gender, x%(2)=stats[0], x%(7)=stats[5].
 */
export function isMovieEligibleForOscar(movie: Movie, winner: Actor, playerMovie: Movie): boolean {
    if (movie.id === playerMovie.id || movie.id === 2 || movie.id === 7) return false;
    if (movie.id === 9 && winner.stats[5] < 5) return false;
    if (movie.id === 6 && winner.gender === 'F' && winner.stats[0] < 5) return false;
    return true;
}

export interface OscarResult {
    winnerName: string;
    /** Movie the winner is cited for — "[name] for [winnerMovie]" (C64 lines 3410/3470/3500) */
    winnerMovie: string;
    isPlayerWin: boolean;
    /** Oscar weight added to w (0.4 per acting award, 1.0 for best picture) */
    weight: number;
}

/**
 * Determine the Best Actress winner.
 * Mirrors BASIC lines 3390–3520.
 *
 * NOTE: The original has a known bug — lines 3420 and 3430 use ao(3) (cast[0]'s
 * star power) instead of tw(3)/tr(3) for cast members 2 and 3. We replicate it faithfully.
 */
export function checkOscarActress(
    movie: Movie,
    cast: CastResult[],
    allActors: Actor[],
    allMovies: Movie[],
    rng: () => number,
): OscarResult {
    const x = int(rng() * 30) + 6; // 6–35
    const starPowerActor0 = cast[0].actor.stats[1]; // ao(3) — used for all 3 (C64 bug)

    for (const cr of cast) {
        if (cr.actor.gender !== 'F') continue;
        const prestige = movie.roles[cr.roleIndex].requirements[2];
        if (starPowerActor0 + prestige > x) {
            const name = cr.actor.name === 'Schwarzenegger' ? 'Arnold Schwarzenegger' : cr.actor.name;
            return { winnerName: name, winnerMovie: movie.title, isPlayerWin: true, weight: 0.4 };
        }
    }

    // No cast member won — pick a random actress and random movie (BASIC lines 3440–3500)
    const castNames = new Set(cast.map(cr => cr.actor.name));
    let winner: Actor;
    do {
        const idx = int(rng() * 140) + 1;
        winner = allActors.find(a => a.id === idx)!;
    } while (!winner || winner.gender !== 'F' || castNames.has(winner.name));

    const eligible = allMovies.filter(m => isMovieEligibleForOscar(m, winner, movie));
    const winnerMovie = eligible[int(rng() * eligible.length)].title;

    return { winnerName: winner.name, winnerMovie, isPlayerWin: false, weight: 0 };
}

/**
 * Determine the Best Actor winner.
 * Mirrors BASIC lines 3530–3660. Same logic as checkOscarActress but gender M.
 */
export function checkOscarActor(
    movie: Movie,
    cast: CastResult[],
    allActors: Actor[],
    allMovies: Movie[],
    rng: () => number,
): OscarResult {
    const x = int(rng() * 30) + 6;
    const starPowerActor0 = cast[0].actor.stats[1]; // ao(3) — C64 bug applies here too

    for (const cr of cast) {
        if (cr.actor.gender !== 'M') continue;
        const prestige = movie.roles[cr.roleIndex].requirements[2];
        if (starPowerActor0 + prestige > x) {
            return { winnerName: cr.actor.name, winnerMovie: movie.title, isPlayerWin: true, weight: 0.4 };
        }
    }

    const castNames = new Set(cast.map(cr => cr.actor.name));
    let winner: Actor;
    do {
        const idx = int(rng() * 140) + 1;
        winner = allActors.find(a => a.id === idx)!;
    } while (!winner || winner.gender !== 'M' || castNames.has(winner.name));

    const eligible = allMovies.filter(m => isMovieEligibleForOscar(m, winner, movie));
    const winnerMovie = eligible[int(rng() * eligible.length)].title;

    return { winnerName: winner.name, winnerMovie, isPlayerWin: false, weight: 0 };
}

/**
 * Determine the Best Picture winner.
 * Mirrors BASIC lines 3670–3770.
 */
export function checkBestPicture(
    movie: Movie,
    cast: CastResult[],
    allMovies: Movie[],
    rng: () => number,
): OscarResult {
    // fq = sum of role prestige requirements + star power of all 3 cast members
    const fq =
        movie.roles.reduce((sum, r) => sum + r.requirements[2], 0) +
        cast.reduce((sum, cr) => sum + cr.actor.stats[1], 0);

    const x = int(rng() * 130) + 21; // 21–150

    if (fq > x) {
        return { winnerName: movie.title, winnerMovie: movie.title, isPlayerWin: true, weight: 1.0 };
    }

    // Random movie wins — not SLASHER NIGHTS (id=2) or BONKERS! (id=7)
    const eligible = allMovies.filter(m => m.id !== movie.id && m.id !== 2 && m.id !== 7);
    const winner = eligible[int(rng() * eligible.length)];
    return { winnerName: winner.title, winnerMovie: winner.title, isPlayerWin: false, weight: 0 };
}

// ── Phase 6: Re-release ───────────────────────────────────────────────────────

/**
 * Calculate the re-release bonus gross when at least one Oscar was won.
 * Mirrors BASIC lines 2440–2500.
 *
 * @param totalGross - total theatrical gross so far (thousands)
 * @param w - accumulated Oscar weight (0.4 per acting award, 1.0 for picture)
 * @returns bonus gross in thousands, or 0 if w=0
 */
export function calculateReRelease(totalGross: number, w: number, rng: () => number): number {
    if (w === 0) return 0;
    if (w > 1) w = 1.3;

    const od = int(rng() * 500); // 0–499

    let oi: number;
    if (totalGross < 20000) {
        oi = int(rng() * 20000) + 9501;          // 9501–29500
    } else if (totalGross > 80000) {
        oi = (int(rng() * 6) + 15) / 100 * totalGross; // 15–20% of total
    } else {
        oi = (int(rng() * 20) + 20) / 100 * totalGross; // 20–39% of total
    }

    return int(w * oi + od);
}
