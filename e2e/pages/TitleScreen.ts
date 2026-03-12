import { Page, expect } from '@playwright/test';
import { TerminalScreen } from './TerminalScreen';

export class TitleScreen extends TerminalScreen {
    constructor(page: Page) { super(page); }

    async load(seed?: number): Promise<void> {
        const url = seed !== undefined ? `/?seed=${seed}` : '/';
        await this.page.goto(url);
        await this.page.evaluate(() => localStorage.removeItem('movieMogulHighScores'));
        await expect(this.page.locator('#title-screen')).toBeVisible();
    }

    async isVisible(): Promise<void> {
        await expect(this.page.locator('#title-screen')).toBeVisible();
    }

    async isHidden(): Promise<void> {
        await expect(this.page.locator('#title-screen')).toBeHidden();
    }

    async gameScreenIsVisible(): Promise<void> {
        await expect(this.page.locator('#screen')).toBeVisible();
    }

    async gameScreenIsHidden(): Promise<void> {
        await expect(this.page.locator('#screen')).toBeHidden();
    }

    async promptShows(text: string): Promise<void> {
        await expect(this.page.locator('#title-prompt')).toContainText(text);
    }

    /** Press any key to dismiss the title screen and enter the game. */
    async advance(): Promise<void> {
        await this.page.keyboard.press('Space');
        await expect(this.page.locator('#screen')).toBeVisible();
        await expect(this.page.locator('#title-screen')).toBeHidden();
    }
}
