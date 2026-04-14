import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
    features: 'e2e/features/api-*.feature',
    steps:    ['e2e/fixtures.ts', 'e2e/steps/shared.steps.ts', 'e2e/steps/api-game.steps.ts'],
    outputDir: '.features-gen-api',
});

export default defineConfig({
    testDir,
    timeout: 60_000,
    expect:  { timeout: 15_000 },
    forbidOnly: !!process.env.CI,
    reporter: [
        ['list'],
        ['html', { outputFolder: 'playwright-report-api', open: 'never' }],
    ],
    use: {
        baseURL: 'http://localhost:3001',
        headless: true,
        screenshot: 'only-on-failure',
    },
    webServer: {
        // Run Vite dev server in API mode on port 3001 (separate from standard port 3000)
        command: 'VITE_SCORES_API=1 npx vite --port 3001',
        url: 'http://localhost:3001',
        reuseExistingServer: !process.env.CI,
    },
    projects: [
        { name: 'api-chrome', use: { ...devices['Desktop Chrome'] } },
    ],
});
