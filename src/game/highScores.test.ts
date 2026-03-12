import { describe, it, expect } from 'vitest';
import {
    calculateGameScores,
    qualifiesFor,
    insertEntry,
    buildInitials,
    emptyHighScores,
} from './highScores';
import type { HighScoreEntry, HighScoreData } from './highScores';

// ── calculateGameScores ───────────────────────────────────────────────────────

describe('calculateGameScores', () => {
    it('calculates profit as gross - cost', () => {
        expect(calculateGameScores(50000, 30000).profit).toBe(20000);
    });

    it('calculates loss as negative profit', () => {
        expect(calculateGameScores(20000, 30000).profit).toBe(-10000);
    });

    it('revenue equals totalGross', () => {
        expect(calculateGameScores(50000, 30000).revenue).toBe(50000);
    });

    it('pctReturned = int((gross/cost)*100 + 0.5) — mirrors C64 line 10020', () => {
        // 50000/30000 = 1.6667 → *100 = 166.67 → +0.5 = 167.17 → trunc = 167
        expect(calculateGameScores(50000, 30000).pctReturned).toBe(167);
    });

    it('pctReturned rounds to nearest percent', () => {
        // 20000/30000 = 0.6667 → *100 = 66.67 → +0.5 = 67.17 → trunc = 67
        expect(calculateGameScores(20000, 30000).pctReturned).toBe(67);
    });

    it('bomb = cost - gross (positive when at a loss)', () => {
        expect(calculateGameScores(20000, 30000).bomb).toBe(10000);
    });

    it('bomb is negative when profitable (not used in that case)', () => {
        expect(calculateGameScores(50000, 30000).bomb).toBe(-20000);
    });
});

// ── qualifiesFor ──────────────────────────────────────────────────────────────

describe('qualifiesFor', () => {
    const entry = (score: number): HighScoreEntry => ({ movieTitle: 'T', initials: 'AAA', score });

    it('qualifies when list has fewer than 5 entries', () => {
        expect(qualifiesFor([entry(100), entry(50)], 1)).toBe(true);
    });

    it('qualifies when score beats the 5th entry', () => {
        const list = [entry(500), entry(400), entry(300), entry(200), entry(100)];
        expect(qualifiesFor(list, 101)).toBe(true);
    });

    it('does not qualify when score equals the 5th entry', () => {
        const list = [entry(500), entry(400), entry(300), entry(200), entry(100)];
        expect(qualifiesFor(list, 100)).toBe(false);
    });

    it('does not qualify when score is below the 5th entry', () => {
        const list = [entry(500), entry(400), entry(300), entry(200), entry(100)];
        expect(qualifiesFor(list, 50)).toBe(false);
    });
});

// ── insertEntry ───────────────────────────────────────────────────────────────

describe('insertEntry', () => {
    const entry = (score: number, title = 'T'): HighScoreEntry => ({ movieTitle: title, initials: 'AAA', score });

    it('inserts into an empty list', () => {
        const result = insertEntry([], entry(100));
        expect(result).toHaveLength(1);
        expect(result[0].score).toBe(100);
    });

    it('inserts at the correct position', () => {
        const list = [entry(500), entry(300), entry(100)];
        const result = insertEntry(list, entry(400));
        expect(result.map(e => e.score)).toEqual([500, 400, 300, 100]);
    });

    it('keeps only top 5 entries', () => {
        const list = [entry(500), entry(400), entry(300), entry(200), entry(100)];
        const result = insertEntry(list, entry(250));
        expect(result).toHaveLength(5);
        expect(result.map(e => e.score)).toEqual([500, 400, 300, 250, 200]);
    });

    it('does not mutate the original list', () => {
        const list = [entry(100)];
        insertEntry(list, entry(200));
        expect(list).toHaveLength(1);
    });
});

// ── buildInitials ─────────────────────────────────────────────────────────────

describe('buildInitials', () => {
    const data = (): HighScoreData => emptyHighScores();

    it('returns bare initials when no conflict exists', () => {
        expect(buildInitials('SPACE WARS', 'MCG', data())).toBe('MCG');
    });

    it('appends "a" when same movie+initials already appear (bare 3-char)', () => {
        const d = data();
        d.highestProfit = [{ movieTitle: 'SPACE WARS', initials: 'MCG', score: 100 }];
        expect(buildInitials('SPACE WARS', 'MCG', d)).toBe('MCGa');
    });

    it('appends "b" when "MCGa" already exists', () => {
        const d = data();
        d.highestProfit = [
            { movieTitle: 'SPACE WARS', initials: 'MCG',  score: 200 },
            { movieTitle: 'SPACE WARS', initials: 'MCGa', score: 100 },
        ];
        expect(buildInitials('SPACE WARS', 'MCG', d)).toBe('MCGb');
    });

    it('does not conflict with same initials on a different movie', () => {
        const d = data();
        d.highestProfit = [{ movieTitle: 'OTHER FILM', initials: 'MCG', score: 100 }];
        expect(buildInitials('SPACE WARS', 'MCG', d)).toBe('MCG');
    });

    it('checks across all four categories', () => {
        const d = data();
        d.biggestBomb = [{ movieTitle: 'SPACE WARS', initials: 'MCG', score: 100 }];
        expect(buildInitials('SPACE WARS', 'MCG', d)).toBe('MCGa');
    });
});
