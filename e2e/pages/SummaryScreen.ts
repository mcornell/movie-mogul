import { Page, expect } from '@playwright/test';
import { TerminalScreen } from './TerminalScreen';

export class SummaryScreen extends TerminalScreen {
    constructor(page: Page) { super(page); }

    async outputShowsProfitOrLoss(): Promise<void> {
        const text = await this.page.locator('#output').textContent() ?? '';
        const hasProfitOrLoss =
            text.includes('profit') ||
            text.includes('lost')   ||
            text.includes('even');
        expect(hasProfitOrLoss).toBe(true);
    }

    async advance(): Promise<void> {
        await expect(this.page.locator('#output')).toContainText('Press any key to continue');
        await this.page.keyboard.press('Space');
    }
}
