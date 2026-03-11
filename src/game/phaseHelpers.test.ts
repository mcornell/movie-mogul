import { describe, it, expect } from 'vitest';
import {
    reviewVerdict,
    budgetOverrun,
    pullFromTheatersLine,
    profitLossResult,
    productionEvent,
} from './phaseHelpers';

// ── productionEvent ───────────────────────────────────────────────────────────

describe('productionEvent', () => {
    const a1 = 'Stallone';
    const a2 = 'Streep';
    const a3 = 'Hanks';

    it('roll 1 → actor1 cocaine arrest, reviewDelta -2', () => {
        const r = productionEvent(a1, a2, a3, 1)!;
        expect(r.message).toContain('Stallone');
        expect(r.message).toContain('cocaine');
        expect(r.reviewDelta).toBe(-2);
        expect(r.costDelta).toBe(0);
    });

    it('roll 2 → actor2 suing Enquirer, reviewDelta +3', () => {
        const r = productionEvent(a1, a2, a3, 2)!;
        expect(r.message).toContain('Streep');
        expect(r.message).toContain('Enquirer');
        expect(r.reviewDelta).toBe(3);
        expect(r.costDelta).toBe(0);
    });

    it('roll 3 → stunt death, reviewDelta -2', () => {
        const r = productionEvent(a1, a2, a3, 3)!;
        expect(r.message).toContain('stunt');
        expect(r.reviewDelta).toBe(-2);
        expect(r.costDelta).toBe(0);
    });

    it('roll 4 → actor3 car accident, costDelta +200', () => {
        const r = productionEvent(a1, a2, a3, 4)!;
        expect(r.message).toContain('Hanks');
        expect(r.message).toContain('$200,000');
        expect(r.reviewDelta).toBe(0);
        expect(r.costDelta).toBe(200);
    });

    it('roll 5 → actor1 fires director, costDelta +450', () => {
        const r = productionEvent(a1, a2, a3, 5)!;
        expect(r.message).toContain('Stallone');
        expect(r.message).toContain('$450,000');
        expect(r.reviewDelta).toBe(0);
        expect(r.costDelta).toBe(450);
    });

    it('roll 6 → actor2 dating athlete, reviewDelta +2', () => {
        const r = productionEvent(a1, a2, a3, 6)!;
        expect(r.message).toContain('Streep');
        expect(r.message).toContain('athlete');
        expect(r.reviewDelta).toBe(2);
        expect(r.costDelta).toBe(0);
    });

    it('roll 7 → actor1 autobiography, reviewDelta +1', () => {
        const r = productionEvent(a1, a2, a3, 7)!;
        expect(r.message).toContain('Stallone');
        expect(r.message).toContain('autobiography');
        expect(r.reviewDelta).toBe(1);
        expect(r.costDelta).toBe(0);
    });

    it('roll 8 → no event (null)', () => {
        expect(productionEvent(a1, a2, a3, 8)).toBeNull();
    });

    it('roll 9 → no event (null)', () => {
        expect(productionEvent(a1, a2, a3, 9)).toBeNull();
    });

    it('roll 10 → no event (null)', () => {
        expect(productionEvent(a1, a2, a3, 10)).toBeNull();
    });
});

// ── reviewVerdict ─────────────────────────────────────────────────────────────

describe('reviewVerdict', () => {
    it('roll 9 → loved it! (+2)', () => {
        const v = reviewVerdict(9);
        expect(v.text).toBe('loved it!');
        expect(v.scoreDelta).toBe(2);
    });

    it('roll 10 → loved it! (+2)', () => {
        expect(reviewVerdict(10).scoreDelta).toBe(2);
    });

    it('roll 6 → liked it. (+1)', () => {
        const v = reviewVerdict(6);
        expect(v.text).toBe('liked it.');
        expect(v.scoreDelta).toBe(1);
    });

    it('roll 8 → liked it. (+1)', () => {
        expect(reviewVerdict(8).scoreDelta).toBe(1);
    });

    it("roll 3 → didn't like it. (−1)", () => {
        const v = reviewVerdict(3);
        expect(v.text).toBe("didn't like it.");
        expect(v.scoreDelta).toBe(-1);
    });

    it("roll 5 → didn't like it. (−1)", () => {
        expect(reviewVerdict(5).scoreDelta).toBe(-1);
    });

    it('roll 1 → hated it! (−3)', () => {
        const v = reviewVerdict(1);
        expect(v.text).toBe('hated it!');
        expect(v.scoreDelta).toBe(-3);
    });

    it('roll 2 → hated it! (−3)', () => {
        expect(reviewVerdict(2).scoreDelta).toBe(-3);
    });
});

// ── budgetOverrun ─────────────────────────────────────────────────────────────

describe('budgetOverrun', () => {
    const budget = 10000; // $10M in thousands

    it('roll 0 → 30% overrun', () => {
        const r = budgetOverrun(budget, 0);
        expect(r.overrun).toBe(3000);
        expect(r.text).toContain('30%');
    });

    it('roll 2 → 30% overrun (boundary)', () => {
        expect(budgetOverrun(budget, 2).overrun).toBe(3000);
    });

    it('roll 3 → 20% overrun', () => {
        const r = budgetOverrun(budget, 3);
        expect(r.overrun).toBe(2000);
        expect(r.text).toContain('20%');
    });

    it('roll 6 → 20% overrun (boundary)', () => {
        expect(budgetOverrun(budget, 6).overrun).toBe(2000);
    });

    it('roll 7 → 10% overrun', () => {
        const r = budgetOverrun(budget, 7);
        expect(r.overrun).toBe(1000);
        expect(r.text).toContain('10%');
    });

    it('roll 15 → 2% overrun', () => {
        const r = budgetOverrun(budget, 15);
        expect(r.overrun).toBe(200);
        expect(r.text).toContain('2%');
    });

    it('roll 30 → on budget (0 overrun)', () => {
        const r = budgetOverrun(budget, 30);
        expect(r.overrun).toBe(0);
        expect(r.text).toContain('on budget');
    });

    it('roll 99 → on budget (0 overrun)', () => {
        expect(budgetOverrun(budget, 99).overrun).toBe(0);
    });

    it('truncates fractional overruns', () => {
        // 10% of 10001 = 1000.1 → truncated to 1000
        expect(budgetOverrun(10001, 7).overrun).toBe(1000);
    });
});

// ── pullFromTheatersLine ──────────────────────────────────────────────────────

describe('pullFromTheatersLine', () => {
    it('formats the closing line with title, cast, and week count', () => {
        const line = pullFromTheatersLine('SPACE WARS', ['Ford', 'Fisher', 'Hamill'], 8);
        expect(line).toBe('"SPACE WARS" starring Ford, Fisher, Hamill has been pulled from theaters after 8 weeks.');
    });

    it('handles a single week', () => {
        expect(pullFromTheatersLine('BOMB', ['Actor'], 1)).toContain('after 1 weeks.');
    });
});

// ── profitLossResult ──────────────────────────────────────────────────────────

describe('profitLossResult', () => {
    it('returns profit when gross > cost', () => {
        const r = profitLossResult(50000, 30000);
        expect(r.profit).toBe(20000);
        expect(r.text).toContain('profit');
        expect(r.text).toContain('20,000,000');
    });

    it('returns loss when gross < cost', () => {
        const r = profitLossResult(20000, 30000);
        expect(r.profit).toBe(-10000);
        expect(r.text).toContain('lost');
        expect(r.text).toContain('10,000,000');
    });

    it('returns break-even when gross === cost', () => {
        const r = profitLossResult(30000, 30000);
        expect(r.profit).toBe(0);
        expect(r.text).toBe('You came out even!');
    });

    it('profit text uses absolute value (no negative sign)', () => {
        const r = profitLossResult(20000, 30000);
        expect(r.text).not.toContain('-');
    });
});
