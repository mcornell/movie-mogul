// Pure helpers extracted from game phases so they can be unit-tested
// independently of the DOM/renderer.

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
 * roll  0–2  → 30% over budget
 * roll  3–6  → 20% over budget
 * roll  7–14 → 10% over budget
 * roll 15–29 → 2% over budget
 * roll 30–99 → on budget
 */
export function budgetOverrun(budget: number, roll: number): OverrunResult {
    const trunc = Math.trunc;
    if (roll < 3)  return { text: 'The production went 30% over budget.', overrun: trunc(budget * 0.30) };
    if (roll < 7)  return { text: 'The production went 20% over budget.', overrun: trunc(budget * 0.20) };
    if (roll < 15) return { text: 'The production went 10% over budget.', overrun: trunc(budget * 0.10) };
    if (roll < 30) return { text: 'The production went 2% over budget.',  overrun: trunc(budget * 0.02) };
    return             { text: 'The movie comes in on budget.',           overrun: 0 };
}

// ── Phase 5: Release ──────────────────────────────────────────────────────────

/**
 * Build the "pulled from theaters" closing line.
 * Mirrors BASIC lines 2270–2280.
 */
export function pullFromTheatersLine(title: string, castNames: string[], weeks: number): string {
    return `"${title}" starring ${castNames.join(', ')} has been pulled from theaters after ${weeks} weeks.`;
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
