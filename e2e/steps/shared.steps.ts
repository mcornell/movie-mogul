/**
 * Steps shared across all feature files.
 * Uses screen-specific page objects via fixtures.
 */
import { Given, When, Then } from '../fixtures';

// ── Game setup ─────────────────────────────────────────────────────────────────

Given('I open the game', async ({ titleScreen }) => {
    await titleScreen.load();
});

Given('I open the game with seed {int}', async ({ titleScreen }, seed: number) => {
    await titleScreen.load(seed);
});

Given('I open the game with seed {int} and cheat mode', async ({ page }, seed: number) => {
    await page.goto(`/?seed=${seed}&cheat`);
    await page.evaluate(() => localStorage.removeItem('movieMogulHighScores'));
});

Given('I advance past the title screen', async ({ titleScreen }) => {
    await titleScreen.advance();
});

Given('I advance past the credits', async ({ movieSelectionScreen }) => {
    await movieSelectionScreen.advancePastCredits();
});

Given('I select movie {int}', async ({ movieSelectionScreen }, choice: number) => {
    await movieSelectionScreen.select(choice as 1 | 2 | 3);
});

Given('I advance past the movie selection screen', async ({ movieSelectionScreen }) => {
    await movieSelectionScreen.advance();
});

Given('I cast all roles and advance past casting', async ({ castingScreen }) => {
    await castingScreen.castAllRoles();
    await castingScreen.advance();
});

Given('I enter a budget of {int}', async ({ budgetScreen }, amount: number) => {
    await budgetScreen.enter(amount);
});

Given('I drive through the reviews', async ({ reviewsScreen }) => {
    await reviewsScreen.drive();
});

Given('I drive through the release', async ({ releaseScreen }) => {
    await releaseScreen.drive();
});

When('I attend the awards ceremony', async ({ page }) => {
    // Press Space to accept the invitation, then wait for the re-release screen
    // (ceremony is auto-timed — no keypresses between the three awards)
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
        const text = await page.locator('#output').textContent() ?? '';
        if (text.includes('re-released')) return;
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);
    }
    throw new Error('Timed out waiting for re-release screen');
});

// ── Input ──────────────────────────────────────────────────────────────────────

When('I press any key', async ({ titleScreen }) => {
    await titleScreen.pressKey('Space');
});

When('I press {string}', async ({ titleScreen }, key: string) => {
    await titleScreen.pressKey(key);
});

When('I enter {string}', async ({ titleScreen }, text: string) => {
    await titleScreen.typeAndEnter(text);
});

// ── Common assertions ──────────────────────────────────────────────────────────

Then('the output contains {string}', async ({ titleScreen }, text: string) => {
    await titleScreen.outputContains(text);
});

Then('the prompt asks {string}', async ({ titleScreen }, text: string) => {
    await titleScreen.promptAsks(text);
});
