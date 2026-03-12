/**
 * Full game integration tests.
 *
 * Uses ?seed=42 so every run produces identical randomness:
 * same movie choices, same actor pool, same box office results.
 * These are regression tests — if the game flow breaks, they catch it.
 */
import { test, expect } from '@playwright/test';
import {
    loadGame,
    advancePastTitle,
    advancePastCredits,
    selectMovie,
    castAllRoles,
    enterBudget,
    driveReviews,
    driveRelease,
    driveToHighScores,
    typeAndEnter,
} from './helpers';

async function runFullGame(page: Parameters<typeof loadGame>[0]): Promise<void> {
    await loadGame(page, 42);
    await advancePastTitle(page);
    await advancePastCredits(page);

    await selectMovie(page, 1);
    await expect(page.locator('#output')).toContainText('Press any key to continue');
    await page.keyboard.press('Space');

    await expect(page.locator('#output')).toContainText('Casting Call for');
    await castAllRoles(page);
    await expect(page.locator('#output')).toContainText('Total cost of salaries:');
    await expect(page.locator('#output')).toContainText('Press any key to continue');
    await page.keyboard.press('Space');

    await expect(page.locator('#output')).toContainText('How much do you want to spend');
    await enterBudget(page, 10000);

    // Budget may have 1–2 pressAnyKey calls (optional event + cost).
    // Drive until reviews start.
    await driveReviews(page);

    await expect(page.locator('#output')).toContainText('MAJOR STUDIO SNEAK PREVIEW');
    await driveRelease(page);

    await driveToHighScores(page);
}

test('full game completes from title to high scores', async ({ page }) => {
    await runFullGame(page);

    await expect(page.locator('#output')).toContainText('P)lay Again');
    await expect(page.locator('#output')).toContainText('Q)uit');

    await page.keyboard.press('q');
    await expect(page.locator('#output')).toContainText('Thanks for playing Movie Mogul!');
});

test('high scores page shows expected categories', async ({ page }) => {
    await runFullGame(page);

    await expect(page.locator('#output')).toContainText('HIGH SCORES');
    // Page 1 categories
    await expect(page.locator('#output')).toContainText('HIGHEST PROFIT');
    await expect(page.locator('#output')).toContainText('GREATEST REVENUES');

    // View page 2
    await page.keyboard.press('v');
    await expect(page.locator('#output')).toContainText('BEST PERCENTAGE RETURNED');
    await expect(page.locator('#output')).toContainText('BIGGEST BOMBS');

    await page.keyboard.press('q');
    await expect(page.locator('#output')).toContainText('Thanks for playing Movie Mogul!');
});

test('play again loops back to movie selection', async ({ page }) => {
    await runFullGame(page);
    await page.keyboard.press('p');
    // Should be back at movie selection with new 3 choices
    await expect(page.locator('#output')).toContainText('You have been sent three scripts');
});

test('summary shows profit or loss result', async ({ page }) => {
    await loadGame(page, 42);
    await advancePastTitle(page);
    await advancePastCredits(page);
    await selectMovie(page, 1);
    await expect(page.locator('#output')).toContainText('Press any key to continue');
    await page.keyboard.press('Space');
    await castAllRoles(page);
    await expect(page.locator('#output')).toContainText('Press any key to continue');
    await page.keyboard.press('Space');
    await enterBudget(page, 10000);
    await driveReviews(page);
    await driveRelease(page);

    // Drive through awards (invitation + ceremony + re-release)
    // Stop when summary appears (shows "Total cost" and "Total revenue")
    await expect.poll(async () => {
        const text = await page.locator('#output').textContent() ?? '';
        if (text.includes('Total cost') && text.includes('Total revenue')) return true;
        if (text.includes('Press any key')) await page.keyboard.press('Space');
        await page.waitForTimeout(400);
        return false;
    }, { timeout: 90_000 }).toBe(true);

    await expect(page.locator('#output')).toContainText('Total cost');
    await expect(page.locator('#output')).toContainText('Total revenue');

    const summaryText = await page.locator('#output').textContent() ?? '';
    const hasProfitOrLoss =
        summaryText.includes('profit') ||
        summaryText.includes('lost')   ||
        summaryText.includes('even');
    expect(hasProfitOrLoss).toBe(true);
});
