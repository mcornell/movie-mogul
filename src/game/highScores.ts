// High score logic — pure functions only; no localStorage side-effects.
// Storage is handled by the caller (main.ts) so these remain fully testable.

export interface HighScoreEntry {
    movieTitle: string;
    initials: string;   // 3 chars, or 4 if a suffix was added to disambiguate
    score: number;
    cheat?: boolean;
}

export interface HighScoreData {
    highestProfit:    HighScoreEntry[]; // sorted desc by (totalGross - totalCost)
    greatestRevenue:  HighScoreEntry[]; // sorted desc by totalGross
    bestPctReturned:  HighScoreEntry[]; // sorted desc by int((totalGross/totalCost)*100 + .5)
    biggestBomb:      HighScoreEntry[]; // sorted desc by (totalCost - totalGross)
}

export interface GameScores {
    profit:      number; // totalGross - totalCost (positive = profit)
    revenue:     number; // totalGross
    pctReturned: number; // int((totalGross / totalCost) * 100 + .5) — mirrors C64 line 10020
    bomb:        number; // totalCost - totalGross (positive = loss, used for biggest bomb list)
}

// ── Score calculation ─────────────────────────────────────────────────────────

/**
 * Derive the four leaderboard scores from raw game totals.
 * Mirrors C64 lines 10005–10030.
 */
export function calculateGameScores(totalGross: number, totalCost: number): GameScores {
    return {
        profit:      totalGross - totalCost,
        revenue:     totalGross,
        pctReturned: Math.trunc((totalGross / totalCost) * 100 + 0.5),
        bomb:        totalCost - totalGross,
    };
}

// ── Leaderboard helpers ───────────────────────────────────────────────────────

/** Return true if score beats the 5th-place entry (qualifying for the list). */
export function qualifiesFor(list: HighScoreEntry[], score: number): boolean {
    if (list.length < 5) return true;
    return score > list[4].score;
}

/**
 * Insert an entry into a top-5 list sorted descending, returning the new list.
 * The original list is not mutated.
 */
export function insertEntry(list: HighScoreEntry[], entry: HighScoreEntry): HighScoreEntry[] {
    const updated = [...list, entry].sort((a, b) => b.score - a.score);
    return updated.slice(0, 5);
}

// ── Initials disambiguation ───────────────────────────────────────────────────

/**
 * Given a 3-char initials string and the full score data, return the initials to
 * store — appending a suffix letter if the same movie+initials already appear.
 * Mirrors C64 lines 10400–10499.
 *
 * The suffix cycles: no suffix → 'a' → 'b' → ... (one past the highest existing suffix).
 */
export function buildInitials(
    movieTitle: string,
    initials3: string,
    data: HighScoreData,
): string {
    const allEntries = [
        ...data.highestProfit,
        ...data.greatestRevenue,
        ...data.bestPctReturned,
        ...data.biggestBomb,
    ];

    // Find existing suffix letters for this movie+initials combo
    let highestSuffix = ' '; // ' ' means no suffix found yet (C64 ec$=" ")
    for (const entry of allEntries) {
        if (entry.movieTitle !== movieTitle) continue;
        if (!entry.initials.startsWith(initials3)) continue;
        if (entry.initials.length === 3) {
            // Bare 3-char initials exist — suffix starts at 'a'
            if (highestSuffix === ' ') highestSuffix = String.fromCharCode('a'.charCodeAt(0) - 1);
        } else if (entry.initials.length === 4) {
            const suffix = entry.initials[3];
            if (highestSuffix === ' ' || suffix > highestSuffix) highestSuffix = suffix;
        }
    }

    if (highestSuffix === ' ') return initials3;                        // no conflict
    return initials3 + String.fromCharCode(highestSuffix.charCodeAt(0) + 1);
}

// ── Persistence helpers (pure data, side-effect-free) ────────────────────────

const STORAGE_KEY = 'movieMogulHighScores';

export function emptyHighScores(): HighScoreData {
    return {
        highestProfit:   [],
        greatestRevenue: [],
        bestPctReturned: [],
        biggestBomb:     [],
    };
}

/**
 * Return the blank placeholder entries used to pre-populate the leaderboard.
 * Mirrors C64 reset mm.scores.prg: 4 categories × 5 slots, all score=0.
 *
 *   movieTitle: "No Movie-A" … "No Movie-D"  (chr$(64+i) for i=1..4)
 *   initials:   "boA" … "boE"               (chr$(64+j) for j=1..5)
 */
export function defaultHighScores(): HighScoreData {
    const slots = (i: number): HighScoreEntry[] =>
        Array.from({ length: 5 }, (_, j) => ({
            movieTitle: `No Movie-${String.fromCharCode(64 + i)}`,
            initials:   `bo${String.fromCharCode(65 + j)}`,
            score:      0,
        }));
    return {
        highestProfit:   slots(1),
        greatestRevenue: slots(2),
        bestPctReturned: slots(3),
        biggestBomb:     slots(4),
    };
}

export function loadHighScores(): HighScoreData {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as HighScoreData;
    } catch { /* ignore */ }
    return defaultHighScores();
}

export function saveHighScores(data: HighScoreData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── API leaderboard fetch (global deployment) ─────────────────────────────────

type ApiRow = { movie_title: string; initials: string; score: number };

function rowsToEntries(rows: ApiRow[] | undefined): HighScoreEntry[] {
    return (rows ?? []).map(r => ({ movieTitle: r.movie_title, initials: r.initials, score: r.score }));
}

/**
 * Fetch the global leaderboard from the Worker API and convert it to HighScoreData.
 * Used by the API-driven game loop in main.ts.
 */
export async function fetchLeaderboardsFromApi(apiBase: string): Promise<HighScoreData> {
    const res  = await fetch(`${apiBase}/api/scores`);
    const data = await res.json() as Record<string, ApiRow[]>;
    return {
        highestProfit:   rowsToEntries(data.highestProfit),
        greatestRevenue: rowsToEntries(data.greatestRevenue),
        bestPctReturned: rowsToEntries(data.bestPctReturned),
        biggestBomb:     rowsToEntries(data.biggestBomb),
    };
}
