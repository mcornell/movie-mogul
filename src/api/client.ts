/**
 * API client for the global (Worker-backed) deployment.
 * Provides types for every API response shape and helpers for making calls
 * and converting the leaderboard wire format to HighScoreData.
 */
import type { HighScoreData, HighScoreEntry } from '../game/highScores';

// ── Wire types (what the Worker returns) ─────────────────────────────────────

export type ApiLeaderboard = Array<{
    movie_title: string;
    initials:    string;
    score:       number;
}>;

export interface ApiLeaderboards {
    highestProfit:   ApiLeaderboard;
    greatestRevenue: ApiLeaderboard;
    bestPctReturned: ApiLeaderboard;
    biggestBomb:     ApiLeaderboard;
}

export interface StartResponse {
    sessionId:    string;
    movieChoices: Array<{
        id:               number;
        title:            string;
        descriptionLines: string[];
        roles:            Array<{ name: string; requirements: number[] }>;
    }>;
}

export interface MovieApiResponse {
    actorPool: Array<{ id: number; name: string; gender: string; pay: number }>;
}

export interface CastApiResponse {
    castSummary: Array<{ roleName: string; actorName: string; pay: number }>;
    salaryCost:  number;
    budgetMin:   number;
    budgetIdeal: number;
}

export interface BudgetApiResponse {
    event:         { message: string; reviewDelta: number; costDelta: number } | null;
    overrunText:   string;
    overrun:       number;
    totalCost:     number;
    reviews:       Array<{ reviewer: string; text: string }>;
    rating:        string;
    vx: string; vy: string; vz: string;
    weeklyGross:   number[];
    totalGross:    number;
    actressResult: { winnerName: string; winnerMovie: string; isPlayerWin: boolean };
    actorResult:   { winnerName: string; winnerMovie: string; isPlayerWin: boolean };
    pictureResult: { winnerName: string; winnerMovie: string; isPlayerWin: boolean };
    reReleaseGross: number;
    oscarsWon:     number;
    presenter1:    string;
    presenter2:    string;
    presenter3:    string;
    qualifies:     boolean;
    scores:        { profit: number; revenue: number; pctReturned: number; bomb: number };
    movieTitle:    string;
}

export interface FinishApiResponse {
    leaderboards: ApiLeaderboards;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** POST to a Worker API endpoint; throws on non-2xx. */
export async function apiPost<T>(path: string, body: object = {}): Promise<T> {
    const res = await fetch(path, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json() as Promise<T>;
}

/** Convert the Worker's snake_case leaderboard rows to HighScoreData. */
export function toHighScoreData(api: ApiLeaderboards): HighScoreData {
    const toEntries = (rows: ApiLeaderboard): HighScoreEntry[] =>
        rows.map(r => ({ movieTitle: r.movie_title, initials: r.initials, score: r.score }));
    return {
        highestProfit:   toEntries(api.highestProfit   ?? []),
        greatestRevenue: toEntries(api.greatestRevenue ?? []),
        bestPctReturned: toEntries(api.bestPctReturned ?? []),
        biggestBomb:     toEntries(api.biggestBomb     ?? []),
    };
}
