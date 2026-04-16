import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    calculateGameScores,
    qualifiesFor,
    playerQualifiesFor,
    insertEntry,
    buildInitials,
    emptyHighScores,
    defaultHighScores,
    loadHighScores,
    saveHighScores,
    fetchLeaderboardsFromApi,
} from './highScores';
import type { HighScoreEntry, HighScoreData } from './highScores';

// ── localStorage mock ─────────────────────────────────────────────────────────

function makeLocalStorageMock() {
    let store: Record<string, string> = {};
    return {
        getItem:    (key: string) => store[key] ?? null,
        setItem:    (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear:      () => { store = {}; },
    };
}

const localStorageMock = makeLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

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

    it('skips entries with same movie but non-matching initials prefix (line 104 continue)', () => {
        const d = data();
        // Same movie, but initials 'XYZ' does not start with 'MCG' — should not conflict
        d.highestProfit = [{ movieTitle: 'SPACE WARS', initials: 'XYZ', score: 100 }];
        expect(buildInitials('SPACE WARS', 'MCG', d)).toBe('MCG');
    });

    it('appends "b" when only a length-4 "MCGa" entry exists (no bare 3-char seen first)', () => {
        // First conflict encountered is length-4 — covers highestSuffix === " " branch on line 110
        const d = data();
        d.highestProfit = [{ movieTitle: 'SPACE WARS', initials: 'MCGa', score: 100 }];
        expect(buildInitials('SPACE WARS', 'MCG', d)).toBe('MCGb');
    });
});

// ── defaultHighScores ─────────────────────────────────────────────────────────

describe('defaultHighScores', () => {
    // Mirrors C64 reset mm.scores.prg:
    //   for i=1to4: for j=1to5
    //     print#2, "No Movie-" + chr$(64+i)   → "No Movie-A"..."No Movie-D"
    //     print#2, "bo" + chr$(64+j)          → "boA"..."boE"
    //     print#2, 0
    //   next j: next i

    it('each category has exactly 5 entries', () => {
        const d = defaultHighScores();
        expect(d.highestProfit.length).toBe(5);
        expect(d.greatestRevenue.length).toBe(5);
        expect(d.bestPctReturned.length).toBe(5);
        expect(d.biggestBomb.length).toBe(5);
    });

    it('all entries have score 0', () => {
        const d = defaultHighScores();
        const all = [...d.highestProfit, ...d.greatestRevenue, ...d.bestPctReturned, ...d.biggestBomb];
        expect(all.every(e => e.score === 0)).toBe(true);
    });

    it('initials cycle boA–boE within each category', () => {
        const d = defaultHighScores();
        expect(d.highestProfit.map(e => e.initials)).toEqual(['boA', 'boB', 'boC', 'boD', 'boE']);
        expect(d.biggestBomb.map(e => e.initials)).toEqual(['boA', 'boB', 'boC', 'boD', 'boE']);
    });

    it('each category has a unique "No Movie-X" title (A–D)', () => {
        const d = defaultHighScores();
        expect(d.highestProfit[0].movieTitle).toBe('No Movie-A');
        expect(d.greatestRevenue[0].movieTitle).toBe('No Movie-B');
        expect(d.bestPctReturned[0].movieTitle).toBe('No Movie-C');
        expect(d.biggestBomb[0].movieTitle).toBe('No Movie-D');
    });

    it('a positive score always beats a default entry (qualifiesFor)', () => {
        const d = defaultHighScores();
        expect(qualifiesFor(d.highestProfit, 1)).toBe(true);
    });
});

// ── loadHighScores / saveHighScores ───────────────────────────────────────────

describe('loadHighScores', () => {
    beforeEach(() => localStorageMock.clear());

    it('returns defaultHighScores() when localStorage is empty', () => {
        const d = loadHighScores();
        expect(d.highestProfit[0].movieTitle).toBe('No Movie-A');
        expect(d.highestProfit).toHaveLength(5);
    });

    it('returns previously saved data', () => {
        const custom: HighScoreData = {
            ...defaultHighScores(),
            highestProfit: [{ movieTitle: 'SPACE WARS', initials: 'MCG', score: 99999 }],
        };
        saveHighScores(custom);
        const loaded = loadHighScores();
        expect(loaded.highestProfit[0].movieTitle).toBe('SPACE WARS');
        expect(loaded.highestProfit[0].score).toBe(99999);
    });

    it('returns defaultHighScores() when stored JSON is corrupt', () => {
        localStorageMock.setItem('movieMogulHighScores', 'not-valid-json{{{');
        const d = loadHighScores();
        expect(d.highestProfit[0].movieTitle).toBe('No Movie-A');
    });
});

describe('saveHighScores', () => {
    beforeEach(() => localStorageMock.clear());

    it('persists data that survives a load round-trip', () => {
        const entry: HighScoreEntry = { movieTitle: 'GALAXY QUEST', initials: 'TIM', score: 42000 };
        const data: HighScoreData = { ...defaultHighScores(), greatestRevenue: [entry] };
        saveHighScores(data);
        const loaded = loadHighScores();
        expect(loaded.greatestRevenue[0]).toEqual(entry);
    });

    it('persists cheat flag through JSON round-trip', () => {
        const entry: HighScoreEntry = { movieTitle: 'CHEAT FILM', initials: 'XYZ', score: 1, cheat: true };
        const data: HighScoreData = { ...defaultHighScores(), highestProfit: [entry] };
        saveHighScores(data);
        const loaded = loadHighScores();
        expect(loaded.highestProfit[0].cheat).toBe(true);
    });
});

// ── playerQualifiesFor ────────────────────────────────────────────────────────

describe('playerQualifiesFor', () => {
    const entry = (score: number) => ({ score });

    it('qualifies when all boards are empty', () => {
        const boards = { highestProfit: [], greatestRevenue: [], bestPctReturned: [], biggestBomb: [] };
        expect(playerQualifiesFor(boards, calculateGameScores(5000, 3000))).toBe(true);
    });

    it('qualifies when boards have fewer than 5 entries — mirrors production board state for BONKERS!', () => {
        // Replicates the actual production leaderboard state when the BONKERS! game was played:
        // DEMON DUSTERS (MAC): profit 56704, revenue 79034, pct 354
        // SLASHER NIGHTS (MAC): revenue 14039, pct 67, bomb 6801
        const boards = {
            highestProfit:   [entry(56704)],
            greatestRevenue: [entry(79034), entry(14039)],
            bestPctReturned: [entry(354),   entry(67)],
            biggestBomb:     [entry(6801)],
        };
        // BONKERS! game: totalGross=4500, totalCost=2800 → profit=1700, pct=161
        expect(playerQualifiesFor(boards, calculateGameScores(4500, 2800))).toBe(true);
    });

    it('does not qualify when all boards are full and no score makes the top 5', () => {
        const full = [entry(5000), entry(4000), entry(3000), entry(2000), entry(1000)];
        const boards = { highestProfit: full, greatestRevenue: full, bestPctReturned: full, biggestBomb: full };
        // profit=60, revenue=110, pct=220, bomb<0 — revenue and pct do not beat 1000
        expect(playerQualifiesFor(boards, calculateGameScores(110, 50))).toBe(false);
    });

    it('qualifies via biggestBomb even when the movie loses money', () => {
        const boards = { highestProfit: [], greatestRevenue: [], bestPctReturned: [], biggestBomb: [] };
        expect(playerQualifiesFor(boards, calculateGameScores(1000, 5000))).toBe(true);
    });

    it('qualifies via greatestRevenue regardless of profit/loss', () => {
        const boards = { highestProfit: [], greatestRevenue: [], bestPctReturned: [], biggestBomb: [] };
        // Movie lost money (profit < 0) but still qualifies on revenue/pct
        expect(playerQualifiesFor(boards, calculateGameScores(2000, 3000))).toBe(true);
    });

    it('qualifies via bestPctReturned when profit ≤ 0 and greatestRevenue board is full and above score', () => {
        // profit <= 0 (first condition false), revenue < 5th place (second false), pct qualifies (third true)
        const highRevenue = [entry(9000), entry(8000), entry(7000), entry(6000), entry(5000)];
        const boards = {
            highestProfit:   highRevenue,
            greatestRevenue: highRevenue, // revenue=2000 < 5000 floor, does not qualify
            bestPctReturned: [],           // empty — qualifies
            biggestBomb:     highRevenue,
        };
        // profit=-1000 (<=0), revenue=2000, pctReturned=67
        expect(playerQualifiesFor(boards, calculateGameScores(2000, 3000))).toBe(true);
    });
});

// ── fetchLeaderboardsFromApi ───────────────────────────────────────────────────

describe('fetchLeaderboardsFromApi', () => {
    it('converts snake_case API rows to HighScoreData camelCase entries', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                highestProfit:   [{ movie_title: 'SPACE WARS', initials: 'ABC', score: 5000 }],
                greatestRevenue: [{ movie_title: 'SPACE WARS', initials: 'ABC', score: 8000 }],
                bestPctReturned: [{ movie_title: 'SPACE WARS', initials: 'ABC', score: 125  }],
                biggestBomb:     [{ movie_title: 'BOMB FILM',  initials: 'XYZ', score: 1000 }],
            }),
        }));

        const data = await fetchLeaderboardsFromApi('');

        expect(data.highestProfit[0]).toEqual({ movieTitle: 'SPACE WARS', initials: 'ABC', score: 5000 });
        expect(data.greatestRevenue[0].score).toBe(8000);
        expect(data.bestPctReturned[0].score).toBe(125);
        expect(data.biggestBomb[0].movieTitle).toBe('BOMB FILM');
    });

    it('returns empty arrays for missing categories', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({}),
        }));

        const data = await fetchLeaderboardsFromApi('');

        expect(data.highestProfit).toEqual([]);
        expect(data.greatestRevenue).toEqual([]);
        expect(data.bestPctReturned).toEqual([]);
        expect(data.biggestBomb).toEqual([]);
    });
});
