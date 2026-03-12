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
