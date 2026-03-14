// Pure helpers extracted from game phases so they can be unit-tested
// independently of the DOM/renderer.

// ── Phase 3: Production events ────────────────────────────────────────────────

export interface ProductionEventResult {
    message: string;
    reviewDelta: number;  // change to reviewScore (0 if none)
    costDelta: number;    // additional cost in thousands (0 if none)
}

/**
 * Determine the production event for a given roll (1–10).
 * Mirrors BASIC lines 1560–1570 and subroutines 3900–3970.
 *
 * roll 1–7  → one of 7 events (see below)
 * roll 8–10 → no event (returns null)
 *
 * actor1/2/3 are the display names for the 3 cast members (role order).
 */
export function productionEvent(
    actor1: string,
    actor2: string,
    actor3: string,
    roll: number,
): ProductionEventResult | null {
    switch (roll) {
        case 1: return {
            message:     `${actor1} has been arrested for possesion of cocaine. The bad publicity could hurt the movie.`,
            reviewDelta: -2, costDelta: 0,
        };
        case 2: return {
            message:     `${actor2} is suing the National Enquirer. The publicity could be good for the movie.`,
            reviewDelta: +3, costDelta: 0,
        };
        case 3: return {
            message:     'A stunt man is killed while filming. The publicity could be bad.',
            reviewDelta: -2, costDelta: 0,
        };
        case 4: return {
            message:     `${actor3} is injured in a car accident. The delay will cost you $200,000.`,
            reviewDelta: 0, costDelta: 200,
        };
        case 5: return {
            message:     `${actor1} hates the director. Getting a new one will cost $450,000.`,
            reviewDelta: 0, costDelta: 450,
        };
        case 6: return {
            message:     `${actor2} has started dating a famous athlete. The publicity could be good for the movie.`,
            reviewDelta: +2, costDelta: 0,
        };
        case 7: return {
            message:     `${actor1} has just written an autobiography. The publicity could be good for the movie.`,
            reviewDelta: +1, costDelta: 0,
        };
        default: return null;
    }
}

// ── Phase 4: Reviews ──────────────────────────────────────────────────────────

export interface ReviewVerdict {
    text: string;      // e.g. "loved it!"
    scoreDelta: number; // amount added to reviewScore
}

/**
 * Map a dice roll (1–10) to a critic verdict.
 * Mirrors the conditions in BASIC lines 1820–1890.
 *
 * roll 9–10 → loved it!   (+2)
 * roll 6–8  → liked it.   (+1)
 * roll 3–5  → didn't like it. (−1)
 * roll 1–2  → hated it!   (−3)
 */
export function reviewVerdict(roll: number): ReviewVerdict {
    if (roll >= 9) return { text: 'loved it!',        scoreDelta: +2 };
    if (roll >= 6) return { text: 'liked it.',         scoreDelta: +1 };
    if (roll >= 3) return { text: "didn't like it.",   scoreDelta: -1 };
    return             { text: 'hated it!',           scoreDelta: -3 };
}

// ── Phase 3: Budget overrun ───────────────────────────────────────────────────

export interface OverrunResult {
    text: string;       // message to display
    overrun: number;    // additional cost in thousands (may be 0)
}

/**
 * Determine production cost overrun from a 0–99 roll.
 * Mirrors BASIC lines 1540–1610 (approximate thresholds).
 *
 * roll  0–2  → 30% over budget  (BASIC line 1640)
 * roll  3–6  → 20% over budget  (BASIC line 1630)
 * roll  7–14 → 10% over budget  (BASIC line 1620)
 * roll 15–29 → 5% over budget   (BASIC line 1610)
 * roll 30–69 → 2% over budget   (BASIC line 1600)
 * roll 70–99 → on budget        (BASIC line 1590)
 */
export function budgetOverrun(budget: number, roll: number): OverrunResult {
    const trunc = Math.trunc;
    if (roll < 3)  return { text: 'The production went 30% over budget.', overrun: trunc(budget * 0.30) };
    if (roll < 7)  return { text: 'The production went 20% over budget.', overrun: trunc(budget * 0.20) };
    if (roll < 15) return { text: 'The production went 10% over budget.', overrun: trunc(budget * 0.10) };
    if (roll < 30) return { text: 'The production went 5% over budget.',  overrun: trunc(budget * 0.05) };
    if (roll < 70) return { text: 'The production went 2% over budget.',  overrun: trunc(budget * 0.02) };
    return             { text: 'The movie comes in on budget.',           overrun: 0 };
}

// ── Phase 5: Release ──────────────────────────────────────────────────────────

/**
 * Build the "pulled from theaters" closing line.
 * Mirrors BASIC lines 2270–2280.
 */
export function pullFromTheatersLine(title: string, castNames: string[], weeks: number): string {
    // C64 line 2281: a1$ + ", " + a2$ + " and " + a3$
    const names = castNames.length < 2
        ? castNames[0] ?? ''
        : `${castNames.slice(0, -1).join(', ')} and ${castNames[castNames.length - 1]}`;
    return `"${title}" starring ${names} has been pulled from theaters after ${weeks} weeks.`;
}

// ── Phase 6: Summary ──────────────────────────────────────────────────────────

export interface ProfitLossResult {
    profit: number;   // positive = profit, negative = loss, 0 = break-even
    /** C64-exact verdict text */
    text: string;
}

/**
 * Calculate profit/loss and return the verdict text.
 * Mirrors BASIC lines 2560–2590.
 */
export function profitLossResult(totalGross: number, totalCost: number): ProfitLossResult {
    const profit = totalGross - totalCost;
    if (profit > 0) return { profit, text: `You made a profit of $${(profit * 1000).toLocaleString('en-US')}` };
    if (profit < 0) return { profit, text: `You lost $${(Math.abs(profit) * 1000).toLocaleString('en-US')}` };
    return              { profit, text: 'You came out even!' };
}
