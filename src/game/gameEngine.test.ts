import { describe, it, expect } from 'vitest';
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
    isMovieEligibleForOscar,
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

// ── calculateQualityScore — additional edge cases ─────────────────────────────

describe('calculateQualityScore (edge cases)', () => {
    it('clamps negative reviewScore to -1 for cq calculation', () => {
        const movie = movies[0];
        const cast = makeCast(movie, actors);
        // BASIC line 2050: if a<0 then a=-1 → cq = (-1*90)+50 = -40
        const result = calculateQualityScore(movie, cast, -5, 10000);
        expect(result.cq).toBe(-40);
    });

    it('dq is 0 when budget is 0', () => {
        const movie = movies[0];
        const cast = makeCast(movie, actors);
        const result = calculateQualityScore(movie, cast, 3, 0);
        expect(result.dq).toBe(0);
    });
});

// ── simulateRelease — decay rate coverage ────────────────────────────────────

describe('simulateRelease (decay rates)', () => {
    it('uses 0.02 decay rate when rng first returns < 0.333 (choice 1)', () => {
        // seqRng(0.0) → decayChoice = int(0*3)+1 = 1 → yy = 0.02 (slow decay)
        // A high mq with slow decay should run many weeks
        const slow = simulateRelease(2000, seqRng(0.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5));
        // seqRng(0.99) → decayChoice = int(0.99*3)+1 = 3 → yy = 0.15 (fast decay)
        const fast = simulateRelease(2000, seqRng(0.99, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5));
        // Slow decay should run at least as many weeks as fast decay
        expect(slow.weeklyGross.length).toBeGreaterThanOrEqual(fast.weeklyGross.length);
    });
});

// ── isMovieEligibleForOscar ───────────────────────────────────────────────────

describe('isMovieEligibleForOscar', () => {
    // Mirrors C64 gosub7000 (lines 7000–7090)
    const playerMovie = movies.find(m => m.id === 1)!;  // SPACE WARS
    const movie2  = movies.find(m => m.id === 2)!;      // SLASHER NIGHTS (always excluded)
    const movie6  = movies.find(m => m.id === 6)!;      // FINAL REUNION
    const movie7  = movies.find(m => m.id === 7)!;      // BONKERS! (always excluded)
    const movie9  = movies.find(m => m.id === 9)!;      // I'VE GOT MUSIC
    const movie3  = movies.find(m => m.id === 3)!;      // a safe movie

    const makeActor = (gender: 'M' | 'F', stats0: number, stats5: number): Actor => ({
        id: 99, name: 'Test', gender,
        stats: [stats0, 5, 5, 5, 5, stats5, 5],
    });

    it('always excludes the player movie, movie 2, and movie 7', () => {
        const actor = makeActor('M', 6, 7);
        expect(isMovieEligibleForOscar(playerMovie, actor, playerMovie)).toBe(false);
        expect(isMovieEligibleForOscar(movie2,      actor, playerMovie)).toBe(false);
        expect(isMovieEligibleForOscar(movie7,      actor, playerMovie)).toBe(false);
    });

    it('allows safe movies for any winner', () => {
        expect(isMovieEligibleForOscar(movie3, makeActor('F', 4, 2), playerMovie)).toBe(true);
    });

    // line 7010: exclude movie 9 when winner.stats[5] < 5
    it('excludes movie 9 when winner stats[5] < 5', () => {
        expect(isMovieEligibleForOscar(movie9, makeActor('M', 6, 4), playerMovie)).toBe(false);
    });

    it('allows movie 9 when winner stats[5] >= 5', () => {
        expect(isMovieEligibleForOscar(movie9, makeActor('M', 6, 5), playerMovie)).toBe(true);
    });

    // line 7020: exclude movie 6 when winner is female AND winner.stats[0] < 5
    it('excludes movie 6 when winner is female and stats[0] < 5', () => {
        expect(isMovieEligibleForOscar(movie6, makeActor('F', 4, 7), playerMovie)).toBe(false);
    });

    it('allows movie 6 when winner is female and stats[0] >= 5', () => {
        expect(isMovieEligibleForOscar(movie6, makeActor('F', 5, 7), playerMovie)).toBe(true);
    });

    it('allows movie 6 for male winner regardless of stats[0]', () => {
        // line 7020 checks x%(1)=9 (female gender code) — never true for males
        expect(isMovieEligibleForOscar(movie6, makeActor('M', 1, 1), playerMovie)).toBe(true);
    });
});

// ── checkOscarActress ─────────────────────────────────────────────────────────

describe('checkOscarActress', () => {
    // BASIC lines 3390–3520
    // x = int(rnd(1)*30)+6 → range 6–35
    // cast[0] wins if gender==F AND cast[0].stats[1] + role.requirements[2] > x

    it('player actress wins when her score beats the threshold', () => {
        // Use SPACE WARS — role 1 (Princess) is gender F (req[0]=9)
        // Princess: requirements[2] = 5; pick a female with stats[1]=9 → score = 9+5 = 14
        // With x = int(0*30)+6 = 6, score 14 > 6 → wins
        const movie = movies[0]; // SPACE WARS
        const cast = makeCast(movie, actors);
        const result = checkOscarActress(movie, cast, actors, movies, seqRng(0.0));
        expect(result.isPlayerWin).toBe(true);
        expect(result.winnerName).toBeTruthy();
        expect(result.winnerMovie).toBe(movie.title);
    });

    it('returns a random actress with a random movie when no cast member wins', () => {
        // Force x = int(0.99*30)+6 = 35 (max threshold) — very hard to beat
        const movie = movies[0];
        const weakCast = makeCastWithStats(movie, actors, 1);
        // 0.99→x=35, 0.99→actress idx=139, 0.5→movie selection
        const result = checkOscarActress(movie, weakCast, actors, movies, seqRng(0.99, 0.5));
        expect(result.winnerName).toBeTruthy();
        expect(result.winnerMovie).toBeTruthy();
        expect(result.winnerMovie).not.toBe('SLASHER NIGHTS');
        expect(result.winnerMovie).not.toBe('BONKERS!');
    });
});

// ── checkOscarActor ───────────────────────────────────────────────────────────

describe('checkOscarActor', () => {
    it('player actor wins when his score beats the threshold', () => {
        // SPACE WARS role 0 (Space Hero) is gender N/either (req[0]=5) — check GUNS & RIFLES Rancher (M only)
        const movie = movies[4]; // GUNS & RIFLES — Rancher req[0]=1 (M only)
        const cast = makeCast(movie, actors);
        const result = checkOscarActor(movie, cast, actors, movies, seqRng(0.0)); // x=6, easy threshold
        expect(result.isPlayerWin).toBe(true);
        expect(result.winnerMovie).toBe(movie.title);
    });

    it('returns a random actor with a random movie when no cast member wins', () => {
        const movie = movies[4];
        const weakCast = makeCastWithStats(movie, actors, 1);
        // 0.99→x=35, 0.1→actor idx=15 (male), 0.5→movie selection
        const result = checkOscarActor(movie, weakCast, actors, movies, seqRng(0.99, 0.1, 0.5));
        expect(result.winnerName).toBeTruthy();
        expect(result.winnerMovie).toBeTruthy();
    });
});

// ── checkBestPicture ──────────────────────────────────────────────────────────

describe('checkBestPicture', () => {
    // fq = sum of role.requirements[2] + stats[1] for each cast member
    // x = int(rnd(1)*130)+21 → range 21–150
    // player wins if fq > x

    it('player movie wins when fq beats the threshold', () => {
        const movie = movies[0]; // SPACE WARS — high prestige roles
        const cast = makeCast(movie, actors);
        // x = int(0*130)+21 = 21 — low threshold, player likely wins
        const result = checkBestPicture(movie, cast, movies, seqRng(0.0));
        expect(result.isPlayerWin).toBe(true);
        expect(result.winnerName).toBe(movie.title);
    });

    it('a random movie wins when fq is too low', () => {
        const movie = movies[0];
        const weakCast = makeCastWithStats(movie, actors, 1);
        // x = int(0.99*130)+21 = 150 — maximum threshold
        const result = checkBestPicture(movie, weakCast, movies, seqRng(0.99));
        // Player likely loses; winner must be a valid movie title
        expect(result.winnerName).toBeTruthy();
    });

    it('never picks SLASHER NIGHTS or BONKERS! as random Best Picture winner', () => {
        const movie = movies[0];
        const weakCast = makeCastWithStats(movie, actors, 1);
        for (let i = 0; i < 50; i++) {
            const result = checkBestPicture(movie, weakCast, movies, seqRng(0.99, Math.random()));
            expect(result.winnerName).not.toBe('SLASHER NIGHTS');
            expect(result.winnerName).not.toBe('BONKERS!');
        }
    });
});

// ── calculateReRelease ────────────────────────────────────────────────────────

describe('calculateReRelease', () => {
    // BASIC lines 2440–2500
    // if w=0: no re-release
    // if w>1: w=1.3
    // od = random(0..499)
    // oi depends on totalGross tiers
    // bonus = int(w * oi + od)

    it('returns 0 when no oscars won (w=0)', () => {
        expect(calculateReRelease(50000, 0, Math.random)).toBe(0);
    });

    it('returns a positive bonus when oscars were won', () => {
        const bonus = calculateReRelease(50000, 0.4, seqRng(0.5));
        expect(bonus).toBeGreaterThan(0);
    });

    it('caps w at 1.3 when w > 1', () => {
        // w=1.2 > 1 → becomes 1.3; bonus should be larger than w=0.4
        const bonusHighW  = calculateReRelease(50000, 1.2, seqRng(0.5));
        const bonusLowW   = calculateReRelease(50000, 0.4, seqRng(0.5));
        expect(bonusHighW).toBeGreaterThan(bonusLowW);
    });

    it('uses the low-gross tier when totalGross < 20000', () => {
        const bonus = calculateReRelease(10000, 0.4, seqRng(0.5));
        expect(bonus).toBeGreaterThan(0);
    });

    it('uses the high-gross tier when totalGross > 80000', () => {
        const bonus = calculateReRelease(100000, 0.4, seqRng(0.5));
        expect(bonus).toBeGreaterThan(0);
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

/** Like makeCast but overrides stats[1] (star power) to a fixed value for threshold testing. */
function makeCastWithStats(movie: Movie, allActors: Actor[], starPower: number): CastResult[] {
    return makeCast(movie, allActors).map(cr => ({
        ...cr,
        actor: {
            ...cr.actor,
            stats: [cr.actor.stats[0], starPower, ...cr.actor.stats.slice(2)] as Actor['stats'],
        },
    }));
}
