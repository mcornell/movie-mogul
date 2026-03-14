# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start Vite dev server
npm run build    # TypeScript compile + Vite build
npm run test     # run Vitest (watch mode)
npx vitest run   # run tests once (CI-style)
npx vitest run src/some/file.test.ts  # run a single test file
```

## Project Goal

Converting a Commodore 64 BASIC game ("Movie Mogul", LoadStar floppy, late 1980s) into a browser-based game. The original source lives in `c64/` and is the ground truth for all game mechanics.

## Reference Files

- `c64/movie mogul.prg` — the original untouched C64 BASIC listing; the authoritative source for all formulas and logic
- `c64/movie mogul formatted.prg` — annotated copy of the above with variable legend and inline comments; easier for humans to read but not authoritative
- `c64/pseudocode.txt` — early translation attempt; may have errors
- `docs/game-analysis.md` — verified analysis of the BASIC source: variable/array mappings, scoring formulas, known bugs

## C64 Source Files (`c64/`)

Files marked **[D64]** are extracted from `MOVIEMOG.D64` (some were renamed on extraction). All others were created locally.

| File | Description |
|------|-------------|
| `MOVIEMOG.D64` | Original D64 disk image — the canonical source for all other D64 files |
| `movie mogul orig.prg` | **[D64]** Raw binary of the main game as extracted from the disk (C64 BASIC, ~14 KB); the truly untouched original |
| `movie mogul.prg` | **[D64]** `petcat`-decoded ASCII text of the BASIC source (17 KB); authoritative ground truth for game logic — clean and unannotated |
| `movie mogul formatted.prg` | Hand-annotated copy of `movie mogul.prg` with a variable legend and inline REM comments; for human readability only — not authoritative |
| `movie mogul dox.prg` | **[D64]** Machine code documentation viewer (~3.5 KB, entry at SYS 2061); displays the game manual interactively on the C64 |
| `mm.title.prg` | **[D64]** Machine code title screen program (~2.7 KB, loads at $8000); `screenshots/title.png` shows what it renders |
| `unpacker.prg` | **[D64]** Machine code utility (loads at $C900); decompresses the main game from a packed form when loading from disk |
| `reset mm.scores.prg` | **[D64]** Short BASIC utility that deletes and reinitialises `mm.high scores` with blank placeholder entries (4 categories × 5 slots) |
| `actor data.seq` | **[D64]** Sequential data file — 140 actors (IDs 1–76 male, 77–140 female); consumed by `src/data/actors.ts` (originally `actordata` on disk) |
| `movie data.seq` | **[D64]** Sequential data file — 12 movies with descriptions, roles, and requirements; consumed by `src/data/movies.ts` (originally `moviedata` on disk) |
| `mm.high scores.seq` | **[D64]** Sequential data file — persisted high scores written/read by the game at runtime; not used by the web version |
| `t.movie mogul.prg` | **[D64]** LoadStar magazine article / game manual stored as a C64 text file; includes credits (© 1985 Chiang Brothers Software), gameplay instructions, and section headers used verbatim in the web UI |
| `pseudocode.txt` | Early hand-written translation of the BASIC game logic; useful for orientation but may contain inaccuracies — always verify against `movie mogul.prg` |
| `screenshots/title.png` | PNG screenshot of the title screen as rendered in VICE, used as the hero image in the web game and blog post |

## Architecture

The game is plain TypeScript (no framework) rendered into a terminal-style `<div id="output">` in `index.html`. Output is built by appending `<div>` elements via `print()` in `src/main.ts`.

### Data layer (`src/data/`, `src/types/`)
- `src/types/index.ts` — canonical TypeScript types (`Actor`, `Movie`, `Role`, `CastSelection`, `CastResult`, `Gender`); these match the C64 data exactly. `GameState` lives in `src/game/gameState.ts`.
- `src/data/actors.ts` — all 140 actors (IDs 1–76 male, 77–140 female) from `c64/actor data.seq`
- `src/data/movies.ts` — all 12 movies from `c64/movie data.seq` plus budget data from the `.prg` DATA statements

### Game layer (`src/game/`)
- `src/game/gameState.ts` — defines `GameState`, `GamePhase`, `CastResult`, and `initialGameState()`; this is the authoritative `GameState` definition (not `src/types/index.ts`)
- `src/game/gameEngine.ts` — pure functions for all game logic: `pickMovieChoices`, `pickActorPool`, `calculatePay`, `calculateQualityScore`, `simulateRelease`, Oscar checks, `calculateReRelease`
- `src/game/phaseHelpers.ts` — helpers for production events, reviews, budget overrun, and release summary
- `src/game/highScores.ts` — 4-category leaderboard system with localStorage persistence

### UI layer (`src/ui/`)
- `src/ui/renderer.ts` — terminal-style rendering: `print()`, `clearScreen()`, `readLine()`, `waitForKey()`, `pressAnyKey()`; includes mobile virtual keyboard and touch input support
- `src/ui/format.ts` — money formatting helpers

### Entry point
- `src/main.ts` — full game loop across all 8 phases; supports `?seed=N` URL param for deterministic RNG (used in E2E tests) and `?cheat` param to reveal actor stats

## Game Phases (from BASIC source)

1. **Movie selection** — draw 3 random movies from 12; player picks one
2. **Casting** — draw 12 random actors (4–8 male, remainder female); player casts 3 roles
3. **Budget** — player sets production budget (capped at `budgetIdeal` for scoring)
4. **Release** — box office run computed week-by-week using `mq = 38*(aq+bq) + cq + dq`
5. **Awards** — Oscar scoring with a known bug: `ao(3)` used for all 3 actors instead of `tw(3)`/`tr(3)`
6. **High scores** — 4 categories × 5 slots

## Key Formulas (verified from BASIC)

- **Pay**: `int(stats[1]/2 + stats[2]) * random(31..330)` — INT() truncates the **base value** before multiplying; matters when stats[1] is odd. Stats are 1-indexed in BASIC (`an%[j,3]` and `an%[j,4]`)
- **Box office**: `mq = 38*(aq+bq) + cq + dq`, then `wt = (mq - x) * 8`
- **Budget cap**: spending above `budgetIdeal` gives no benefit (`mn = hh` when `mm > hh`)

## Development Technique

When writing production code, write the unit test first and use test driven development to help drive out the low level design using both London and Detroit schools of TDD as appropriate.

## Sources

Please always provide sources when responding. That way I can look at the source of truth if I want to learn more details.

