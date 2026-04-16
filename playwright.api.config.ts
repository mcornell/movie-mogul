import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

// When BASE_URL is set, tests run against a deployed (or externally started) server.
// The local wrangler server is skipped entirely — set this to point at Cloudflare preview
// or production: BASE_URL=https://your-site.pages.dev npm run test:e2e:api
//
// Locally, this config builds the API-enabled bundle then serves it via wrangler pages dev,
// which runs both the static frontend and the Cloudflare Pages Functions (Worker + D1).
// The api-game.feature uses page.route() mocks so it works against any server.
const BASE_URL = process.env.BASE_URL;
const LOCAL_URL = 'http://localhost:3001';

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
        ['junit', { outputFile: 'test-results/junit-api.xml' }],
    ],
    use: {
        baseURL: BASE_URL ?? LOCAL_URL,
        headless: true,
        screenshot: 'only-on-failure',
    },
    webServer: BASE_URL ? undefined : {
        // Build the API-enabled bundle, then serve with wrangler pages dev so the
        // Cloudflare Pages Functions (Worker) and the D1 preview DB are both live.
        command: 'npm run build:global && npx wrangler pages dev dist --port 3001',
        url: LOCAL_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,   // build + wrangler startup is slower than a plain dev server
    },
    projects: [
        { name: 'api-chrome', use: { ...devices['Desktop Chrome'] } },
    ],
});
