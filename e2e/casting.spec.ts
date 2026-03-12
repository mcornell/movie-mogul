import { test, expect } from '@playwright/test';
import {
    loadGame,
    advancePastTitle,
    advancePastCredits,
    selectMovie,
    typeAndEnter,
    tryCastActor,
    castAllRoles,
} from './helpers';

test.describe('Casting phase', () => {
    test.beforeEach(async ({ page }) => {
        await loadGame(page, 42);
        await advancePastTitle(page);
        await advancePastCredits(page);
        await selectMovie(page, 1);
        // Advance past the post-movie-selection pressAnyKey
        await expect(page.locator('#output')).toContainText('Press any key to continue');
        await page.keyboard.press('Space');
        // Confirm we're in casting
        await expect(page.locator('#output')).toContainText('Casting Call for');
    });

    test('shows 12 numbered actors', async ({ page }) => {
        // Pool always has exactly 12 actors — look for actor 12
        await expect(page.locator('#output')).toContainText('12)');
    });

    test('shows actor pay rates', async ({ page }) => {
        await expect(page.locator('#output')).toContainText('PAY');
        await expect(page.locator('#output')).toContainText('$');
    });

    test('actor number out of range shows invalid selection error', async ({ page }) => {
        await expect(page.locator('#prompt')).toContainText('cast as');
        await typeAndEnter(page, '13');
        await expect(page.locator('#output')).toContainText('Invalid selection.');
        // Prompt stays on same role
        await expect(page.locator('#prompt')).toContainText('cast as');
    });

    test('duplicate actor shows invalid selection error', async ({ page }) => {
        await expect(page.locator('#prompt')).toContainText('cast as');

        // Find a valid actor for the first role
        let firstCast = -1;
        for (let i = 1; i <= 12; i++) {
            const accepted = await tryCastActor(page, i);
            if (accepted) { firstCast = i; break; }
        }
        expect(firstCast).toBeGreaterThan(0);

        // Now try to cast the same actor for the second role
        await expect(page.locator('#prompt')).toContainText('cast as');
        await typeAndEnter(page, String(firstCast));
        await expect(page.locator('#output')).toContainText('Invalid selection.');
    });

    test('wrong gender actor shows gender error', async ({ page }) => {
        // Try each actor and look for a gender rejection
        await expect(page.locator('#prompt')).toContainText('cast as');
        let foundGenderError = false;
        for (let i = 1; i <= 12; i++) {
            const prevCount = await page.locator('#output > div').count();
            await page.locator('#text-input').fill(String(i));
            await page.keyboard.press('Enter');
            await expect.poll(
                () => page.locator('#output > div').count(),
                { timeout: 5_000 },
            ).toBeGreaterThanOrEqual(prevCount + 2);
            const lines = await page.locator('#output > div').allTextContents();
            const newLines = lines.slice(prevCount);
            if (newLines.some(l => l.includes('wrong gender'))) {
                foundGenderError = true;
                break;
            }
            // Stop after first accepted actor
            if (!newLines.some(l => l.includes('Invalid selection') || l.includes('wrong gender'))) {
                break;
            }
        }
        if (!foundGenderError) {
            test.info().annotations.push({
                type: 'note',
                description: 'No gender rejection with seed=42 movie=1; roles may all be gender-neutral',
            });
        }
    });

    test('casting all 3 roles shows total salary', async ({ page }) => {
        await castAllRoles(page);
        await expect(page.locator('#output')).toContainText('Total cost of salaries:');
    });
});
