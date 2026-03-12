import { Page, expect } from '@playwright/test';

/**
 * Base class for all game screen page objects.
 * Provides common terminal UI interactions shared across every phase.
 */
export abstract class TerminalScreen {
    constructor(protected readonly page: Page) {}

    async outputContains(text: string): Promise<void> {
        await expect(this.page.locator('#output')).toContainText(text);
    }

    async promptAsks(text: string): Promise<void> {
        await expect(this.page.locator('#prompt')).toContainText(text);
    }

    async typeAndEnter(text: string): Promise<void> {
        await this.page.locator('#text-input').fill(text);
        await this.page.keyboard.press('Enter');
    }

    async pressKey(key: string): Promise<void> {
        await this.page.keyboard.press(key);
    }

    /**
     * Keep pressing Space whenever "Press any key" is visible until
     * `targetText` appears in the output.
     */
    protected async driveUntilText(targetText: string, maxWaitMs = 90_000): Promise<void> {
        const deadline = Date.now() + maxWaitMs;
        while (Date.now() < deadline) {
            const text = await this.page.locator('#output').textContent() ?? '';
            if (text.includes(targetText)) return;
            if (text.includes('Press any key')) await this.page.keyboard.press('Space');
            await this.page.waitForTimeout(400);
        }
        throw new Error(`driveUntilText timed out waiting for: "${targetText}"`);
    }
}
