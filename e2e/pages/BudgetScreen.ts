import { Page, expect } from '@playwright/test';
import { TerminalScreen } from './TerminalScreen';

export class BudgetScreen extends TerminalScreen {
    constructor(page: Page) { super(page); }

    /**
     * Enter a production budget (in thousands) and drive through all subsequent
     * budget-phase prompts (production event and overrun confirmation) until the
     * reviews phase starts. Leaves the game on the "The reviews are in" screen.
     */
    async enter(amount = 10000): Promise<void> {
        await expect(this.page.locator('#prompt')).toContainText('enter amount in thousands', { timeout: 10_000 });
        await this.typeAndEnter(String(amount));
        // Drive through any production-event and overrun "Press any key" prompts
        await this.driveUntilText('The reviews are in');
    }
}
