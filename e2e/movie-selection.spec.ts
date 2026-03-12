import { test, expect } from '@playwright/test';
import { loadGame, advancePastTitle, advancePastCredits, typeAndEnter } from './helpers';

test.describe('Movie selection', () => {
    test.beforeEach(async ({ page }) => {
        await loadGame(page, 42);
        await advancePastTitle(page);
        await advancePastCredits(page);
    });

    test('shows three numbered movie choices', async ({ page }) => {
        await expect(page.locator('#output')).toContainText('1)');
        await expect(page.locator('#output')).toContainText('2)');
        await expect(page.locator('#output')).toContainText('3)');
        await expect(page.locator('#output')).toContainText('You have been sent three scripts');
    });

    test('each movie shows its roles', async ({ page }) => {
        await expect(page.locator('#output')).toContainText('*roles==>');
    });

    test('choice out of range (0 or 4) re-prompts without advancing', async ({ page }) => {
        await expect(page.locator('#prompt')).toContainText('Which do you want to produce');

        await typeAndEnter(page, '4');
        // Prompt stays — still asking for movie choice
        await expect(page.locator('#prompt')).toContainText('Which do you want to produce');

        await typeAndEnter(page, '0');
        await expect(page.locator('#prompt')).toContainText('Which do you want to produce');
    });

    test('valid choice (1) advances to casting phase', async ({ page }) => {
        await typeAndEnter(page, '1');
        // "Press any key to continue" appears after movie is selected
        await expect(page.locator('#output')).toContainText('Press any key to continue');
        await page.keyboard.press('Space');
        // Casting Call heading appears
        await expect(page.locator('#output')).toContainText('Casting Call for');
    });
});
