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
    let py  = int((actor.stats[1] / 2 + actor.stats[2]) * x);
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
