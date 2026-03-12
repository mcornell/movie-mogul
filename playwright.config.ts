import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
    features: 'e2e/features/**/*.feature',
    // fixtures.ts is included first so all step files can import Given/When/Then from it
    steps: ['e2e/fixtures.ts', 'e2e/steps/**/*.ts'],
});

export default defineConfig({
    testDir,
    timeout: 120_000,       // full game with award sleeps can take ~30s
    expect: { timeout: 30_000 },
    forbidOnly: !!process.env.CI,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:3000',
        headless: true,
    },
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
});
