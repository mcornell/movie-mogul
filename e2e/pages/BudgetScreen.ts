import { Page, expect } from '@playwright/test';
import { TerminalScreen } from './TerminalScreen';

export class BudgetScreen extends TerminalScreen {
    constructor(page: Page) { super(page); }

    /** Enter a production budget (in thousands). */
    async enter(amount = 10000): Promise<void> {
        await expect(this.page.locator('#prompt')).toContainText('enter amount in thousands', { timeout: 10_000 });
        await this.typeAndEnter(String(amount));
    }
}
