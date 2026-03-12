import { test, expect } from '@playwright/test';
import { loadGame, advancePastTitle } from './helpers';

test.describe('Title screen', () => {
    test('shows title image and PRESS ANY KEY prompt', async ({ page }) => {
        await loadGame(page);
        await expect(page.locator('#title-screen')).toBeVisible();
        await expect(page.locator('#title-image')).toBeVisible();
        await expect(page.locator('#title-prompt')).toContainText('PRESS ANY KEY TO CONTINUE');
        // Game screen should be hidden until a key is pressed
        await expect(page.locator('#screen')).toBeHidden();
    });

    test('keypress hides title and shows game screen', async ({ page }) => {
        await loadGame(page);
        await advancePastTitle(page);
        await expect(page.locator('#title-screen')).toBeHidden();
        await expect(page.locator('#screen')).toBeVisible();
    });

    test('game screen shows copyright credits after title', async ({ page }) => {
        await loadGame(page);
        await advancePastTitle(page);
        await expect(page.locator('#output')).toContainText('MOVIE MOGUL');
        await expect(page.locator('#output')).toContainText('Copyright 1985 Chiang Brothers Software');
    });
});
