import { Page, expect } from '@playwright/test';
import { TerminalScreen } from './TerminalScreen';

export class MovieSelectionScreen extends TerminalScreen {
    constructor(page: Page) { super(page); }

    /** Advance past the credits that appear right after the title screen. */
    async advancePastCredits(): Promise<void> {
        await expect(this.page.locator('#output')).toContainText('MOVIE MOGUL');
        await expect(this.page.locator('#output')).toContainText('Press any key to continue');
        await this.page.keyboard.press('Space');
    }

    /** Enter a movie number (1–3) to select it. */
    async select(choice: 1 | 2 | 3): Promise<void> {
        await expect(this.page.locator('#output')).toContainText('You have been sent three scripts');
        await expect(this.page.locator('#prompt')).toContainText('Which do you want to produce');
        await this.typeAndEnter(String(choice));
    }

    /**
     * Advance past the "Press any key to continue" that follows movie selection
     * and wait for the Casting Call screen to appear.
     */
    async advance(): Promise<void> {
        await expect(this.page.locator('#output')).toContainText('Press any key to continue');
        await this.page.keyboard.press('Space');
        await expect(this.page.locator('#output')).toContainText('Casting Call for');
    }
}
