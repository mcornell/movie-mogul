import { Page, expect } from '@playwright/test';
import { TerminalScreen } from './TerminalScreen';

export class ReleaseScreen extends TerminalScreen {
    constructor(page: Page) { super(page); }

    /**
     * Drive through the entire box office run.
     * Presses Space for the initial sneak preview and each weekly screen,
     * then advances past the final "pulled from theaters" subtotal.
     */
    async drive(): Promise<void> {
        await this.driveUntilText('pulled from theaters');
        await expect(this.page.locator('#output')).toContainText('Press any key to continue');
        await this.page.keyboard.press('Space');
    }
}
