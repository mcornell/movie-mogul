import { Page } from '@playwright/test';
import { TerminalScreen } from './TerminalScreen';

export class ReviewsScreen extends TerminalScreen {
    constructor(page: Page) { super(page); }

    /**
     * Drive through the entire reviews phase.
     * Handles the budget-phase pressAnyKey calls that precede the reviewers,
     * then waits for "Press any key to release the movie" and advances past it.
     */
    async drive(): Promise<void> {
        await this.driveUntilText('Press any key to release the movie');
        await this.page.keyboard.press('Space');
    }
}
