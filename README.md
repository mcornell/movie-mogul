# Movie Mogul

Movie mogul is an ancient C=64 game that came on a LoadStar floppy in the late 80s.

I used to play this game all of the time as a teenager.

Back in 2015, I found the code, and had the idea of creating a web based game out of it.

I never did it.

Now that it's 2026, I thought it might be fun to look at this using some of the tools that are available now to see if I could convert this and bring myself, and maybe others, some joy.

## Development

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run test     # unit tests (Vitest, watch mode)
npx vitest run   # unit tests (CI-style, single run)
npm run deploy   # build and rsync to deploy target (see below)
```

### Deploy target

Copy `.env.local.example` to `.env.local` and set `DEPLOY_TARGET` to your rsync destination. If not set, `npm run deploy` will prompt you each time.

```bash
cp .env.local.example .env.local
# edit .env.local and set DEPLOY_TARGET
```

## E2E Tests (Playwright)

Tests run across desktop Chrome, desktop Firefox, mobile iOS (WebKit), and mobile Android (Chromium).

### First-time setup

1. Install Node dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npm run install:browsers
   ```

3. **WebKit (iOS) requires system-level libraries on Linux.** Install them via:
   ```bash
   npx playwright install-deps webkit
   ```
   If that fails, install manually:
   ```bash
   sudo apt-get install -y libavif16
   ```

### Running tests

```bash
npm run test:e2e          # headless (all browsers)
npm run test:e2e:headed   # headed (useful for debugging)
npm run test:e2e:ui       # Playwright UI mode (interactive)
```

Reports are written to `playwright-report/` (HTML) and `test-results/junit.xml` (JUnit XML). Screenshots are captured automatically on failure.

## Project Organization

The C64 directory contains the original D64 program (movie mogul.prg), which includes the Commodore 64 Basic program, as well as two sequential files that include "actor" and "movie" data.

The psuedocode.txt was my original effort to translate what the program was doing. It may or may not be correct.

Util contains some ruby programs I wrote to convert the seq files into a modern data structure. I've left them for reference. I would like to rewrite into a consistent tool across the project
