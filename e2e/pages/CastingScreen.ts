import { Page, expect } from '@playwright/test';
import { TerminalScreen } from './TerminalScreen';

export class CastingScreen extends TerminalScreen {
    constructor(page: Page) { super(page); }

    /**
     * Attempt to cast one actor by number.
     * Returns true if accepted, false if rejected (wrong gender or duplicate/invalid).
     */
    async tryCastActor(actorNum: number): Promise<boolean> {
        const prevCount = await this.page.locator('#output > div').count();
        await this.page.locator('#text-input').fill(String(actorNum));
        await this.page.keyboard.press('Enter');

        // Use poll because after the 3rd role is accepted, extra lines (blank +
        // salary total) appear immediately, making exact count checks flaky.
        await expect.poll(
            () => this.page.locator('#output > div').count(),
            { timeout: 5_000 },
        ).toBeGreaterThanOrEqual(prevCount + 2);

        const lines = await this.page.locator('#output > div').allTextContents();
        return !lines.slice(prevCount).some(
            l => l.includes('Invalid selection') || l.includes('wrong gender'),
        );
    }

    /** Cast all 3 roles by trying actors 1–12 in order until each is filled. */
    async castAllRoles(): Promise<void> {
        const picked: number[] = [];
        for (let roleIdx = 0; roleIdx < 3; roleIdx++) {
            await expect(this.page.locator('#prompt')).toContainText('cast as', { timeout: 10_000 });
            for (let actorNum = 1; actorNum <= 12; actorNum++) {
                if (picked.includes(actorNum)) continue;
                if (await this.tryCastActor(actorNum)) { picked.push(actorNum); break; }
            }
        }
    }

    /**
     * Cast the first valid actor for the currently-prompted role.
     * @param exclude  Actor numbers to skip (e.g. already cast).
     * @returns The actor number that was successfully cast.
     */
    async castFirstAvailableActor(exclude: number[] = []): Promise<number> {
        await expect(this.page.locator('#prompt')).toContainText('cast as', { timeout: 10_000 });
        for (let actorNum = 1; actorNum <= 12; actorNum++) {
            if (exclude.includes(actorNum)) continue;
            if (await this.tryCastActor(actorNum)) return actorNum;
        }
        throw new Error('No valid actor found for the current role');
    }

    /** Advance past the "Press any key to continue" shown after all roles are cast. */
    async advance(): Promise<void> {
        await expect(this.page.locator('#output')).toContainText('Total cost of salaries:');
        await expect(this.page.locator('#output')).toContainText('Press any key to continue');
        await this.page.keyboard.press('Space');
    }
}
