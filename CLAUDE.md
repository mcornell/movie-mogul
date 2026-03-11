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

- `c64/movie mogul formatted.prg` — annotated C64 BASIC listing; the authoritative source for all formulas and logic
- `c64/pseudocode.txt` — early translation attempt; may have errors
- `docs/game-analysis.md` — verified analysis of the BASIC source: variable/array mappings, scoring formulas, known bugs

## Architecture

The game is plain TypeScript (no framework) rendered into a terminal-style `<div id="output">` in `index.html`. Output is built by appending `<div>` elements via `print()` in `src/main.ts`.

### Data layer (`src/data/`, `src/types/`)
- `src/types/index.ts` — canonical TypeScript types (`Actor`, `Movie`, `Role`, `GameState`, `CastSelection`); these match the C64 data exactly
- `src/data/actors.ts` — all 140 actors (IDs 1–76 male, 77–140 female) from `c64/actor data.seq`
- `src/data/movies.ts` — all 12 movies from `c64/movie data.seq` plus budget data from the `.prg` DATA statements

### Game layer (`src/game/`) — stubs, needs implementation
- `src/game/gameState.ts` — currently a generic placeholder; should use `GameState` from `src/types/`
- `src/game/gameEngine.ts` — currently a generic placeholder with a known TS error (`this.state` not declared); should orchestrate the game phases

### UI layer (`src/ui/`) — stub, needs implementation
- `src/ui/renderer.ts` — should drive the terminal-style output in `index.html`

## Game Phases (from BASIC source)

1. **Movie selection** — draw 3 random movies from 12; player picks one
2. **Casting** — draw 12 random actors (4–8 male, remainder female); player casts 3 roles
3. **Budget** — player sets production budget (capped at `budgetIdeal` for scoring)
4. **Release** — box office run computed week-by-week using `mq = 38*(aq+bq) + cq + dq`
5. **Awards** — Oscar scoring with a known bug: `ao(3)` used for all 3 actors instead of `tw(3)`/`tr(3)`
6. **High scores** — 4 categories × 5 slots

## Key Formulas (verified from BASIC)

- **Pay**: `int((stats[1]/2 + stats[2]) * random(31..330))`  — stats are 1-indexed in BASIC (`an%[j,3]` and `an%[j,4]`)
- **Box office**: `mq = 38*(aq+bq) + cq + dq`, then `wt = (mq - x) * 8`
- **Budget cap**: spending above `budgetIdeal` gives no benefit (`mn = hh` when `mm > hh`)

## Development Technique

When writing production code, write the unit test first and use test driven development to help drive out the low level design using both London and Detroit schools of TDD as appropriate

## Known Issues

- `src/game/gameEngine.ts` line 5: `TS2339 Property 'state' does not exist` — pre-existing stub error, not introduced by working code
- `src/game/gameState.ts` uses a generic score/level/lives shape that does not match the actual `GameState` type in `src/types/`; both files need to be rewritten together
