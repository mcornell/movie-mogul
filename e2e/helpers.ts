import { Page, expect } from '@playwright/test';

// ── Navigation helpers ──────────────────────────────────────────────────────

export async function loadGame(page: Page, seed?: number): Promise<void> {
    const url = seed !== undefined ? `/?seed=${seed}` : '/';
    await page.goto(url);
    // Clear localStorage so high scores from previous tests don't interfere
    await page.evaluate(() => localStorage.removeItem('movieMogulHighScores'));
    await expect(page.locator('#title-screen')).toBeVisible();
}

export async function advancePastTitle(page: Page): Promise<void> {
    await page.keyboard.press('Space');
    await expect(page.locator('#screen')).toBeVisible();
    await expect(page.locator('#title-screen')).toBeHidden();
}

// ── Input helpers ───────────────────────────────────────────────────────────

export async function typeAndEnter(page: Page, text: string): Promise<void> {
    await page.locator('#text-input').fill(text);
    await page.keyboard.press('Enter');
}

// ── Phase driver ────────────────────────────────────────────────────────────

/**
 * Keeps watching the #output div and pressing Space whenever "Press any key
 * to continue" is visible, until `targetText` appears.
 *
 * Handles all variable-length press-any-key sequences (budget events, weekly
 * box office, award ceremony, etc.) without needing to know how many there are.
 */
export async function driveUntilText(
    page: Page,
    targetText: string,
    maxWaitMs = 90_000,
): Promise<void> {
    const deadline = Date.now() + maxWaitMs;
    while (Date.now() < deadline) {
        const text = await page.locator('#output').textContent() ?? '';
        if (text.includes(targetText)) return;

        // Matches all variants: "Press any key to continue", "Press any key to attend",
        // "Press any key to release the movie", etc.
        if (text.includes('Press any key')) {
            await page.keyboard.press('Space');
        }
        await page.waitForTimeout(400);
    }
    throw new Error(`driveUntilText timed out waiting for: "${targetText}"`);
}

// ── Phase helpers ───────────────────────────────────────────────────────────

export async function advancePastCredits(page: Page): Promise<void> {
    // Credits screen: "MOVIE MOGUL" heading + "Press any key to continue"
    await expect(page.locator('#output')).toContainText('MOVIE MOGUL');
    await expect(page.locator('#output')).toContainText('Press any key to continue');
    await page.keyboard.press('Space');
}

export async function selectMovie(page: Page, choice: 1 | 2 | 3): Promise<void> {
    await expect(page.locator('#output')).toContainText('You have been sent three scripts');
    await expect(page.locator('#prompt')).toContainText('Which do you want to produce');
    await typeAndEnter(page, String(choice));
}

/**
 * Attempt to cast one actor for a role.
 * Returns true if accepted, false if rejected (wrong gender or invalid).
 */
export async function tryCastActor(page: Page, actorNum: number): Promise<boolean> {
    const prevCount = await page.locator('#output > div').count();
    await page.locator('#text-input').fill(String(actorNum));
    await page.keyboard.press('Enter');

    // Wait for at least 2 new lines: the echo and the response.
    // Use poll (not exact count) because after the 3rd role is accepted,
    // the game immediately appends blank + salary total (4 lines, not 2).
    await expect.poll(
        () => page.locator('#output > div').count(),
        { timeout: 5_000 },
    ).toBeGreaterThanOrEqual(prevCount + 2);

    // Check all new lines for error text
    const lines = await page.locator('#output > div').allTextContents();
    const newLines = lines.slice(prevCount);
    return !newLines.some(l => l.includes('Invalid selection') || l.includes('wrong gender'));
}

/**
 * Cast all 3 roles by trying actors 1–12 in order until each role is filled.
 */
export async function castAllRoles(page: Page): Promise<void> {
    const picked: number[] = [];
    for (let roleIdx = 0; roleIdx < 3; roleIdx++) {
        await expect(page.locator('#prompt')).toContainText('cast as', { timeout: 10_000 });
        for (let actorNum = 1; actorNum <= 12; actorNum++) {
            if (picked.includes(actorNum)) continue;
            const accepted = await tryCastActor(page, actorNum);
            if (accepted) {
                picked.push(actorNum);
                break;
            }
        }
    }
}

export async function enterBudget(page: Page, amount = 10000): Promise<void> {
    await expect(page.locator('#prompt')).toContainText('enter amount in thousands', { timeout: 10_000 });
    await typeAndEnter(page, String(amount));
}

export async function driveReviews(page: Page): Promise<void> {
    // Reviewers print slowly (printSlow + sleep). Wait for the final "Press any key" after all 9.
    await driveUntilText(page, 'Press any key to release the movie');
    await page.keyboard.press('Space');
}

export async function driveRelease(page: Page): Promise<void> {
    // Initial sneak preview header → press any key, then weekly screens, then "pulled from theaters"
    await driveUntilText(page, 'pulled from theaters');
    // One more press to advance past the subtotal screen
    await expect(page.locator('#output')).toContainText('Press any key to continue');
    await page.keyboard.press('Space');
}

/**
 * Drive from the awards phase (invitation screen) all the way through
 * summary and high scores until "P)lay Again" is visible.
 *
 * Handles:
 *  - All "Press any key" variants (invitation, between awards, re-release, summary)
 *  - The optional initials readLine in the high scores phase
 */
export async function driveToHighScores(page: Page, initials = 'TST', maxWaitMs = 90_000): Promise<void> {
    const deadline = Date.now() + maxWaitMs;
    while (Date.now() < deadline) {
        const text   = await page.locator('#output').textContent() ?? '';
        const prompt = await page.locator('#prompt').textContent() ?? '';

        if (text.includes('P)lay Again')) return;

        // Handle the initials readLine before the high score table is shown
        if (prompt.includes('initials')) {
            await page.locator('#text-input').fill(initials);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);
            continue;
        }

        if (text.includes('Press any key')) {
            await page.keyboard.press('Space');
        }
        await page.waitForTimeout(400);
    }
    throw new Error('driveToHighScores timed out waiting for "P)lay Again"');
}
