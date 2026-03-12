import { Page } from '@playwright/test';
import { TerminalScreen } from './TerminalScreen';

export class HighScoresScreen extends TerminalScreen {
    constructor(page: Page) { super(page); }

    /**
     * Drive from the awards invitation through the summary screen and into
     * the high scores screen (until "P)lay Again" is visible).
     *
     * Handles:
     *  - "Press any key to attend" (awards invitation)
     *  - Sleep-based awards ceremony (no key required between awards)
     *  - Re-release and summary pressAnyKey calls
     *  - Optional initials readLine before the high score table appears
     */
    async driveFromAwards(initials = 'TST', maxWaitMs = 90_000): Promise<void> {
        const deadline = Date.now() + maxWaitMs;
        while (Date.now() < deadline) {
            const text   = await this.page.locator('#output').textContent() ?? '';
            const prompt = await this.page.locator('#prompt').textContent() ?? '';

            if (text.includes('P)lay Again')) return;

            if (prompt.includes('initials')) {
                await this.page.locator('#text-input').fill(initials);
                await this.page.keyboard.press('Enter');
                await this.page.waitForTimeout(500);
                continue;
            }

            if (text.includes('Press any key')) await this.page.keyboard.press('Space');
            await this.page.waitForTimeout(400);
        }
        throw new Error('HighScoresScreen.driveFromAwards timed out waiting for "P)lay Again"');
    }
}
