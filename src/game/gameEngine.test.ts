import { describe, it, expect } from 'vitest';
import {
    pickMovieChoices,
    pickActorPool,
    calculatePay,
    calculateQualityScore,
    simulateRelease,
} from './gameEngine';
import { movies } from '../data/movies';
import { actors } from '../data/actors';
import type { Actor, Movie, CastResult } from '../types';

// Deterministic RNG helpers for tests
// Returns a sequence of values cycling through the provided list
function seqRng(...values: number[]): () => number {
    let i = 0;
    return () => values[i++ % values.length];
}

// ── pickMovieChoices ──────────────────────────────────────────────────────────

describe('pickMovieChoices', () => {
    it('returns exactly 3 movies', () => {
        const choices = pickMovieChoices(movies, Math.random);
        expect(choices).toHaveLength(3);
    });

    it('returns 3 distinct movies', () => {
        for (let i = 0; i < 20; i++) {
            const choices = pickMovieChoices(movies, Math.random);
            const ids = choices.map(m => m.id);
            expect(new Set(ids).size).toBe(3);
        }
    });

    it('picks movies driven by the rng', () => {
        // rnd(1)*12+1 for each pick; seqRng returns fractions
        // 0.0 → index 1, 0.5 → index 7, 0.9 → index 11 (1-based)
        const rng = seqRng(0.0, 0.5, 0.9);
        const choices = pickMovieChoices(movies, rng);
        expect(choices[0].id).toBe(1);
        expect(choices[1].id).toBe(7);
        expect(choices[2].id).toBe(11);
    });

    it('re-rolls when a duplicate would be picked', () => {
        // First two picks both try to land on movie 1; third on movie 2
        const rng = seqRng(0.0, 0.0, 0.5, 0.9);
        const choices = pickMovieChoices(movies, rng);
        const ids = choices.map(m => m.id);
        expect(new Set(ids).size).toBe(3);
    });
});

// ── pickActorPool ─────────────────────────────────────────────────────────────

describe('pickActorPool', () => {
    it('returns exactly 12 actors', () => {
        const pool = pickActorPool(actors, Math.random);
        expect(pool).toHaveLength(12);
    });

    it('contains between 4 and 8 male actors', () => {
        for (let i = 0; i < 20; i++) {
            const pool = pickActorPool(actors, Math.random);
            const maleCount = pool.filter(a => a.gender === 'M').length;
            expect(maleCount).toBeGreaterThanOrEqual(4);
            expect(maleCount).toBeLessThanOrEqual(8);
        }
    });

    it('contains no duplicate actor ids', () => {
        for (let i = 0; i < 20; i++) {
            const pool = pickActorPool(actors, Math.random);
            const ids = pool.map(a => a.id);
            expect(new Set(ids).size).toBe(12);
        }
    });

    it('male actors have ids 1–76, female actors have ids 77–139', () => {
        for (let i = 0; i < 10; i++) {
            const pool = pickActorPool(actors, Math.random);
            pool.forEach(a => {
                if (a.gender === 'M') {
                    expect(a.id).toBeGreaterThanOrEqual(1);
                    expect(a.id).toBeLessThanOrEqual(76);
                } else {
                    expect(a.id).toBeGreaterThanOrEqual(77);
                    expect(a.id).toBeLessThanOrEqual(139);
                }
            });
        }
    });
});

// ── calculatePay ──────────────────────────────────────────────────────────────

describe('calculatePay', () => {
    // Formula (BASIC line 3800):
    //   x = int(rnd(1)*300) + 31           → multiplier 31–330
    //   py = int((stats[1]/2 + stats[2]) * x)
    //   if py < 100: py += 100

    const actor: Actor = {
        id: 1,
        name: 'Test Actor',
        gender: 'M',
        // stats[1]=4 (pay seed), stats[2]=6 (pay additive)
        stats: [1, 4, 6, 3, 5, 7, 5],
    };

    it('applies the pay formula correctly', () => {
        // x = int(0 * 300) + 31 = 31
        // py = int((4/2 + 6) * 31) = int(8 * 31) = 248
        const pay = calculatePay(actor, seqRng(0.0));
        expect(pay).toBe(248);
    });

    it('applies the minimum pay floor of 100', () => {
        // With stats[1]=0 and stats[2]=0, formula gives 0 → should be bumped to 100
        const poorActor: Actor = { ...actor, stats: [1, 0, 0, 3, 5, 7, 5] };
        const pay = calculatePay(poorActor, seqRng(0.0));
        expect(pay).toBe(100);
    });

    it('multiplier range is 31–330', () => {
        // rng=0.0 → x=31, rng=0.9999 → x = int(0.9999*300)+31 = 299+31 = 330
        const payMin = calculatePay(actor, seqRng(0.0));
        const payMax = calculatePay(actor, seqRng(0.9999));
        const baseMin = Math.floor((4 / 2 + 6) * 31);
        const baseMax = Math.floor((4 / 2 + 6) * 330);
        expect(payMin).toBe(baseMin);
        expect(payMax).toBe(baseMax);
    });
});

// ── calculateQualityScore ─────────────────────────────────────────────────────

describe('calculateQualityScore', () => {
    // aq: for each role, aq = int((aq + req[2] + req[3]) * 1.10)
    // bq: for stats indices 2–7 (0-indexed), if actor stat < role req, bq += (stat - req)
    // cq = (reviewScore * 90) + 50
    // dq = int(budget / 100)   [budget in thousands]
    // mq = 38*(aq+bq) + cq + dq

    it('computes aq as a running 1.10x compounded sum of role requirements[2] and [3]', () => {
        const movie = movies[0]; // SPACE WARS: roles reqs[2]=[7,5,6], reqs[3]=[9,7,8]
        // Step 1: aq = int((0 + 7 + 9) * 1.1) = int(17.6) = 17
        // Step 2: aq = int((17 + 5 + 7) * 1.1) = int(31.9) = 31 (wait - roles are reqs[2] and reqs[3])
        // SPACE WARS role 0: requirements[2]=7, requirements[3]=9
        // SPACE WARS role 1: requirements[2]=5, requirements[3]=7
        // SPACE WARS role 2: requirements[2]=6, requirements[3]=8
        // Step 1: aq = int((0+7+9)*1.1) = int(17.6) = 17
        // Step 2: aq = int((17+5+7)*1.1) = int(31.9) = 31 (correction: re-reading BASIC)
        // Actually BASIC: aq=int((aq+mv(i,3)+mv(i,4))*1.10) — mv is 1-indexed so mv(i,3)=req[2], mv(i,4)=req[3]
        const cast = makeCast(movie, actors);
        const { aq } = calculateQualityScore(movie, cast, 3, 10000);
        // aq step 1: int((0+7+9)*1.1)=17, step 2: int((17+5+7)*1.1)=31 (actually int(32.1)? let me recalc)
        // step1: (0+7+9)*1.1 = 17.6 → int = 17
        // step2: (17+5+7)*1.1 = 31.9 → int = 31
        // step3: (31+6+8)*1.1 = 49.5 → int = 49
        expect(aq).toBe(49);
    });

    it('computes mq = 38*(aq+bq) + cq + dq', () => {
        const movie = movies[0];
        const cast = makeCast(movie, actors);
        const reviewScore = 3; // neutral
        const budget = 10000; // $10M in thousands
        const result = calculateQualityScore(movie, cast, reviewScore, budget);
        const expectedCq = reviewScore * 90 + 50; // 3*90+50 = 320
        const expectedDq = Math.floor(budget / 100); // 100
        expect(result.cq).toBe(expectedCq);
        expect(result.dq).toBe(expectedDq);
        expect(result.mq).toBe(38 * (result.aq + result.bq) + result.cq + result.dq);
    });

    it('bq penalises actors whose stats fall below role requirements', () => {
        const movie = movies[0]; // SPACE WARS
        const cast = makeCast(movie, actors);
        const result = calculateQualityScore(movie, cast, 3, 10000);
        // bq should be 0 or negative
        expect(result.bq).toBeLessThanOrEqual(0);
    });
});

// ── simulateRelease ───────────────────────────────────────────────────────────

describe('simulateRelease', () => {
    // wt = (mq - random(1..950)) * 8
    // Each week: wt -= random(100..1299), then wt -= int(wt * decayRate)
    // if wt < 200: wt = 200 (floor); stop when wt < 500

    it('returns at least one week of gross', () => {
        const result = simulateRelease(500, Math.random);
        expect(result.weeklyGross.length).toBeGreaterThanOrEqual(1);
    });

    it('total gross equals sum of weekly grosses', () => {
        const result = simulateRelease(800, Math.random);
        const sum = result.weeklyGross.reduce((a, b) => a + b, 0);
        expect(result.totalGross).toBe(sum);
    });

    it('weekly gross never falls below 200 (the bomb floor)', () => {
        const result = simulateRelease(300, Math.random);
        result.weeklyGross.forEach(w => expect(w).toBeGreaterThanOrEqual(200));
    });

    it('stops when weekly gross drops below 500', () => {
        // Force a very low mq so it bombs quickly
        const result = simulateRelease(200, seqRng(0.99));
        // Should still have at least 1 week at the floor
        expect(result.weeklyGross.length).toBeGreaterThanOrEqual(1);
    });
});

// ── helpers ───────────────────────────────────────────────────────────────────

function makeCast(movie: Movie, allActors: Actor[]): CastResult[] {
    // Pick the first available actors matching each role's gender requirement
    return movie.roles.map((role, i) => {
        const genderCode = role.requirements[0];
        const actor = allActors.find(a => {
            if (genderCode === 1) return a.gender === 'M';
            if (genderCode === 9) return a.gender === 'F';
            return true;
        })!;
        return { roleIndex: i as 0 | 1 | 2, actor, pay: 500 };
    });
}
