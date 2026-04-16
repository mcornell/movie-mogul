import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiPost, toHighScoreData } from './client';
import type { ApiLeaderboards } from './client';

// ── toHighScoreData ───────────────────────────────────────────────────────────

describe('toHighScoreData', () => {
    const apiLeaderboards: ApiLeaderboards = {
        highestProfit:   [{ movie_title: 'SLASHER NIGHTS', initials: 'AAA', score: 5000 }],
        greatestRevenue: [{ movie_title: 'BONKERS!',       initials: 'BBB', score: 8000 }],
        bestPctReturned: [{ movie_title: 'SLASHER NIGHTS', initials: 'CCC', score: 250  }],
        biggestBomb:     [{ movie_title: 'BONKERS!',       initials: 'DDD', score: -100 }],
    };

    it('converts snake_case movie_title to camelCase movieTitle', () => {
        const result = toHighScoreData(apiLeaderboards);
        expect(result.highestProfit[0].movieTitle).toBe('SLASHER NIGHTS');
    });

    it('maps all four leaderboard categories', () => {
        const result = toHighScoreData(apiLeaderboards);
        expect(result.highestProfit[0].initials).toBe('AAA');
        expect(result.greatestRevenue[0].initials).toBe('BBB');
        expect(result.bestPctReturned[0].initials).toBe('CCC');
        expect(result.biggestBomb[0].initials).toBe('DDD');
    });

    it('preserves score values', () => {
        const result = toHighScoreData(apiLeaderboards);
        expect(result.highestProfit[0].score).toBe(5000);
        expect(result.biggestBomb[0].score).toBe(-100);
    });

    it('handles empty leaderboard arrays', () => {
        const empty: ApiLeaderboards = {
            highestProfit:   [],
            greatestRevenue: [],
            bestPctReturned: [],
            biggestBomb:     [],
        };
        const result = toHighScoreData(empty);
        expect(result.highestProfit).toEqual([]);
        expect(result.greatestRevenue).toEqual([]);
    });

    it('handles missing categories gracefully (nullish coalescing)', () => {
        const partial = {
            highestProfit:   null,
            greatestRevenue: undefined,
            bestPctReturned: null,
            biggestBomb:     undefined,
        } as unknown as ApiLeaderboards;
        const result = toHighScoreData(partial);
        expect(result.highestProfit).toEqual([]);
        expect(result.greatestRevenue).toEqual([]);
        expect(result.bestPctReturned).toEqual([]);
        expect(result.biggestBomb).toEqual([]);
    });

    it('maps multiple entries in a single category', () => {
        const multi: ApiLeaderboards = {
            highestProfit: [
                { movie_title: 'FILM A', initials: 'AAA', score: 9000 },
                { movie_title: 'FILM B', initials: 'BBB', score: 7000 },
            ],
            greatestRevenue: [],
            bestPctReturned: [],
            biggestBomb:     [],
        };
        const result = toHighScoreData(multi);
        expect(result.highestProfit).toHaveLength(2);
        expect(result.highestProfit[1].movieTitle).toBe('FILM B');
    });
});

// ── apiPost ───────────────────────────────────────────────────────────────────

describe('apiPost', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('POSTs JSON and returns parsed response body', async () => {
        const payload = { sessionId: 'abc', movieId: 1 };
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok:   true,
            json: () => Promise.resolve(payload),
        }));

        const result = await apiPost<typeof payload>('/api/scores', { movieId: 1 });
        expect(result).toEqual(payload);
        expect(fetch).toHaveBeenCalledWith('/api/scores', expect.objectContaining({
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ movieId: 1 }),
        }));
    });

    it('throws on non-2xx response', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok:     false,
            status: 500,
        }));

        await expect(apiPost('/api/scores')).rejects.toThrow('API error 500');
    });

    it('defaults body to empty object when not provided', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok:   true,
            json: () => Promise.resolve({}),
        }));

        await apiPost('/api/scores');
        expect(fetch).toHaveBeenCalledWith('/api/scores', expect.objectContaining({
            body: '{}',
        }));
    });
});
