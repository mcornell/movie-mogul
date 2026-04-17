/**
 * Step definitions specific to the API-driven game (global deployment).
 * All scenarios run against the real Cloudflare Worker — no mocks.
 */
import { expect } from '@playwright/test';
import { Then, When } from '../fixtures';

Then('the output does not contain {string}', async ({ page }, text: string) => {
    await expect(page.locator('#output')).not.toContainText(text);
});

/** Press Space whenever "Press any key" is visible until targetText appears. */
When('I drive through prompts until {string}', async ({ page }, text: string) => {
    const deadline = Date.now() + 90_000;
    while (Date.now() < deadline) {
        const output = await page.locator('#output').textContent() ?? '';
        if (output.includes(text)) return;
        if (output.includes('Press any key')) await page.keyboard.press('Space');
        await page.waitForTimeout(400);
    }
    throw new Error(`Timed out driving to: "${text}"`);
});
