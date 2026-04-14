# Global High Scores — Server-Side Game Engine on Cloudflare

## Overview

A second Cloudflare Pages deployment runs the game with all logic (including randomness) on a Cloudflare Worker. The browser is a pure terminal UI: it displays output and sends player choices, but never computes scores or generates random events. This makes it impossible to fake a score without compromising the Cloudflare account.

**Cost: $0/month** — everything fits in Cloudflare's permanent free tier.

The existing localStorage deployment (`/games/movie-mogul/`) is untouched.

---

## Architecture

```
BEFORE (localStorage deployment)
  Browser: game engine + UI + localStorage
  Server:  none (pure static site)

AFTER (global deployment)
  Browser: terminal UI only (print/readLine/waitForKey)
           sends player choices → receives data to display
  Worker:  full game engine (imports src/game/gameEngine.ts)
           holds all RNG and game state
  D1:      session state (ephemeral) + leaderboards (permanent)
```

The browser never sees the raw game state — only what needs to be displayed.

---

## API Design

Each game phase maps to one API call. Session state lives in D1 between calls.

| Phase | Client sends | Worker returns |
|-------|-------------|----------------|
| Start game | `POST /api/game/start` | `{ sessionId, movieChoices[3] }` |
| Choose movie | `POST /api/game/movie { sessionId, choice }` | `{ actorPool[12] }` |
| Cast actors | `POST /api/game/cast { sessionId, actorIndices[3] }` | `{ castSummary, budgetRange }` |
| Set budget | `POST /api/game/budget { sessionId, budget }` | `{ events, reviews, weeklyGross[], oscarResults, ... }` |
| Submit initials | `POST /api/game/finish { sessionId, initials }` | `{ leaderboards }` |

`GET /api/scores` → current top-5 per category (no session needed).

The Worker generates all randomness server-side. Session state is a JSON blob in D1. Only display data is sent to the browser — actor stats and RNG state are never exposed.

---

## D1 Schema (`schema.sql`)

```sql
-- Ephemeral: one row per active game session (deleted on finish)
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT    PRIMARY KEY,   -- UUID
  phase       TEXT    NOT NULL,      -- 'movie-selection'|'casting'|'budget'|'high-scores'
  state       TEXT    NOT NULL,      -- JSON blob of full GameState
  created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Permanent: leaderboard entries
CREATE TABLE IF NOT EXISTS scores (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category    TEXT    NOT NULL,   -- 'highestProfit'|'greatestRevenue'|'bestPctReturned'|'biggestBomb'
  movie_title TEXT    NOT NULL,
  initials    TEXT    NOT NULL,
  score       INTEGER NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scores_category ON scores(category, score DESC);
```

Session rows are deleted when the game finishes. A TTL check on read handles abandoned sessions (reject sessions older than 24 hours).

---

## Files Created / Modified

### New files
| File | Purpose |
|------|---------|
| `functions/api/game/[[action]].ts` | Pages Function: all game phase endpoints |
| `functions/api/scores.ts` | Pages Function: `GET /api/scores` leaderboard read |
| `functions/tsconfig.json` | TypeScript config for Cloudflare Workers context |
| `schema.sql` | D1 schema — applied once via `wrangler d1 execute` |
| `wrangler.toml` | D1 binding `DB`, used for local dev via `wrangler pages dev` |
| `src/env.d.ts` | Vite env var type declarations |
| `docs/global-leaderboard.md` | This file — setup steps + architecture reference |

### Modified files
| File | Change |
|------|--------|
| `src/main.ts` | Branch on `import.meta.env.VITE_SCORES_API`: if truthy, run API-driven game loop; `?cheat` disabled |
| `src/game/highScores.ts` | Add `fetchLeaderboardsFromApi(apiBase)` async function |
| `package.json` | Add `@cloudflare/workers-types` devDependency |

### Unchanged files
`src/ui/renderer.ts`, `src/data/`, `src/types/`, `src/game/gameEngine.ts`, `src/game/gameState.ts`, `src/game/phaseHelpers.ts`

---

## Worker Imports from Existing Code

The Worker (Pages Function) imports these directly — no rewriting:

| Import | From | Used for |
|--------|------|---------|
| `pickMovieChoices` | `src/game/gameEngine.ts` | Server-side movie selection |
| `pickActorPool` | `src/game/gameEngine.ts` | Server-side actor pool generation |
| `calculatePay` | `src/game/gameEngine.ts` | Actor salary computation |
| `calculateQualityScore` | `src/game/gameEngine.ts` | aq/bq/cq/dq scores |
| `simulateRelease` | `src/game/gameEngine.ts` | Week-by-week box office |
| `checkOscarActress` | `src/game/gameEngine.ts` | Best Actress check |
| `checkOscarActor` | `src/game/gameEngine.ts` | Best Actor check |
| `checkBestPicture` | `src/game/gameEngine.ts` | Best Picture check |
| `calculateReRelease` | `src/game/gameEngine.ts` | Oscar re-release bonus |
| `productionEvent` | `src/game/phaseHelpers.ts` | Production event generation |
| `reviewVerdict` | `src/game/phaseHelpers.ts` | Critic review generation |
| `budgetOverrun` | `src/game/phaseHelpers.ts` | Budget overrun calculation |
| `calculateGameScores` | `src/game/highScores.ts` | Derive 4 leaderboard scores |
| `initialGameState` | `src/game/gameState.ts` | Initial state factory |

---

## Cheat Mode

```typescript
// src/main.ts
const cheatMode = !import.meta.env.VITE_SCORES_API && params.has('cheat');
```

In the global deployment `VITE_SCORES_API` is set, so `cheatMode` is always `false`. No conditional build needed.

---

## Implementation Order (BDD Dual-Loop TDD)

Each slice: failing Playwright scenario → inner Vitest unit tests → commit on each green step.

### Slice 1 — Leaderboard read
- **Playwright**: visiting global deployment shows leaderboard fetched from API
- **Inner**: unit tests for `GET /api/scores` handler + `fetchLeaderboardsFromApi()`

### Slice 2 — Start game
- **Playwright**: game start calls `POST /api/game/start` and displays 3 movie choices
- **Inner**: unit tests for Worker `start` handler

### Slice 3 — Movie selection
- **Playwright**: player chooses a movie, actor pool appears
- **Inner**: unit tests for Worker `movie` handler

### Slice 4 — Casting
- **Playwright**: player casts 3 actors, cast summary and budget prompt appear
- **Inner**: unit tests for Worker `cast` handler

### Slice 5 — Budget + release
- **Playwright**: player sets budget, box office and Oscar results appear
- **Inner**: unit tests for Worker `budget` handler

### Slice 6 — Finish + leaderboard update
- **Playwright**: player enters initials, leaderboard updates and persists across fresh session
- **Inner**: unit tests for Worker `finish` handler

### Slice 7 — Cheat mode disabled
- **Playwright**: `?cheat` in URL does NOT reveal actor stats in global deployment
- **Inner**: one unit test asserting `cheatMode` is always false when `VITE_SCORES_API` is set

---

## One-Time Setup (global deployment)

```bash
# 1. Install Wrangler if needed
npm install -g wrangler

# 2. Create D1 database and note the database_id
wrangler d1 create movie-mogul-scores

# 3. Update wrangler.toml with the database_id from step 2
#    Replace REPLACE_WITH_YOUR_DATABASE_ID in wrangler.toml

# 4. Apply the schema
wrangler d1 execute movie-mogul-scores --file=schema.sql

# 5. In Cloudflare Pages dashboard:
#    - Create new Pages project from same repo
#    - Set build command: npm run build
#    - Set output directory: dist
#    - Set env var: VITE_SCORES_API=1
#    - Bind D1 database as "DB"
#    - Deploy

# 6. Verify
wrangler d1 execute movie-mogul-scores --command "SELECT * FROM scores LIMIT 5"
```

---

## Local Development

```bash
# Build the frontend first
npm run build

# Run Pages dev server with D1 local simulation
wrangler pages dev dist --d1 DB=<local-db-id>

# In a separate terminal, set the env var
VITE_SCORES_API=1 npm run dev
```

Or use `.env.local`:
```
VITE_SCORES_API=1
```

---

## Verification Checklist

1. `npm run dev` (no env var) → localStorage game works, all existing Playwright tests pass
2. `wrangler pages dev` with `VITE_SCORES_API=1` → full game runs via Worker, D1 rows written
3. `wrangler d1 execute ... --command "SELECT * FROM scores"` → score row present after completed game
4. Submit same `sessionId` twice to `/finish` → second call rejected (session deleted)
5. Abandon a game → session cleaned up after 24h TTL check
6. `?cheat` in URL → actor stats never shown in global deployment
7. Deploy second Pages project → leaderboard persists across browsers and fresh sessions

---

## Security Model

- All randomness happens in the Worker — client never sees seeds or RNG state
- Actor stats omitted from actor pool API response — client sees only name, gender, pay
- Session deleted immediately on `finish` — replay attacks rejected
- Scoring computed server-side from stored `GameState` — client-submitted scores rejected
- `?cheat` disabled in global deployment via `VITE_SCORES_API` env var check
