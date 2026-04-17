/**
 * Step definitions specific to the API-driven game (global deployment).
 * All scenarios run against the real Cloudflare Worker — no mocks.
 */
import { expect } from '@playwright/test';
import { Then, When } from '../fixtures';

Then('the output does not contain {string}', async ({ page }, text: string) => {
    await expect(page.locator('#output')).not.toContainText(text);
});

/**
 * Drive through the game by pressing Space on every "Press any key" prompt
 * and entering dummy initials when the high score readLine appears,
 * until targetText appears in the output.
 */
When('I drive through prompts until {string}', async ({ page }, text: string) => {
    const deadline = Date.now() + 180_000;
    while (Date.now() < deadline) {
        const output = await page.locator('#output').textContent() ?? '';
        if (output.includes(text)) return;
        const prompt = await page.locator('#prompt').textContent() ?? '';
        if (prompt.includes('initials')) {
            await page.locator('#text-input').fill('TST');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);
            continue;
        }
        if (output.includes('Press any key')) await page.keyboard.press('Space');
        await page.waitForTimeout(400);
    }
    throw new Error(`Timed out driving to: "${text}"`);
});
