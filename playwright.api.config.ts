import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

// CI config: runs the full game suite against the Cloudflare Pages deployment.
// Set BASE_URL to point at any deployed build:
//   BASE_URL=https://your-site.pages.dev npm run test:e2e:api
//
// Locally, this config builds the API-enabled bundle then serves it via
// wrangler pages dev, which runs both the static frontend and the Cloudflare
// Pages Functions (Worker + D1 preview DB).
const BASE_URL = process.env.BASE_URL;
const LOCAL_URL = 'http://localhost:3001';

const testDir = defineBddConfig({
    features: 'e2e/features/**/*.feature',
    steps:    ['e2e/fixtures.ts', 'e2e/steps/**/*.ts'],
    tags:     'not @standalone-only',
    outputDir: '.features-gen-api',
});

export default defineConfig({
    testDir,
    timeout: 120_000,       // full game with award sleeps can take ~30s
    expect:  { timeout: 30_000 },
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
        // Build the API-enabled bundle, then serve with wrangler pages dev so the
        // Cloudflare Pages Functions (Worker) and the D1 preview DB are both live.
        command: 'npm run build:global && npx wrangler pages dev dist --port 3001',
        url: LOCAL_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,   // build + wrangler startup is slower than a plain dev server
    },
    projects: [
        { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
    ],
});
