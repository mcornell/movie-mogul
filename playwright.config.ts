import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

// When BASE_URL is set, tests run against a deployed (or externally started) server.
// The local dev server is skipped entirely — set this to point at Cloudflare preview
// or production: BASE_URL=https://your-site.pages.dev npm run test:e2e
const BASE_URL = process.env.BASE_URL;
const LOCAL_URL = 'http://localhost:3000';

const testDir = defineBddConfig({
    features: ['e2e/features/**/*.feature', '!e2e/features/api-*.feature'],
    // fixtures.ts is included first so all step files can import Given/When/Then from it
    steps: ['e2e/fixtures.ts', 'e2e/steps/**/*.ts'],
});

export default defineConfig({
    testDir,
    timeout: 120_000,       // full game with award sleeps can take ~30s
    expect: { timeout: 30_000 },
    forbidOnly: !!process.env.CI,
    reporter: [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
    ],
    use: {
        baseURL: BASE_URL ?? LOCAL_URL,
        headless: true,
        screenshot: 'only-on-failure',
        video: 'off',
    },
    webServer: BASE_URL ? undefined : {
        command: 'npm run dev',
        url: LOCAL_URL,
        reuseExistingServer: !process.env.CI,
    },
    projects: [
        { name: 'desktop-chrome',  use: { ...devices['Desktop Chrome'] } },
        { name: 'desktop-firefox', use: { ...devices['Desktop Firefox'] } },
        // iOS uses WebKit; Android uses Chromium with a Pixel 7 device profile.
        { name: 'mobile-ios',      use: { ...devices['iPhone 15'] } },
        { name: 'mobile-android',  use: { ...devices['Pixel 7'],    browserName: 'chromium' } },
    ],
});
