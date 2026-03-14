# Changelog

All notable changes to Movie Mogul are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.1.0] — 2026-03-12

### Fixed
- **Pay formula operator precedence** (`gameEngine.ts`): BASIC line 3800 truncates
  the base value *before* multiplying by the random multiplier — `int(stats[1]/2 + stats[2]) * x`,
  not `int((stats[1]/2 + stats[2]) * x)`. The difference shows up when `stats[1]` is odd
  (e.g., Marlon Brando, Tom Hanks). Corrected along with updated tests.
- **Budget overrun missing 5% tier** (`phaseHelpers.ts`): BASIC line 1610 defines a
  5%-over-budget outcome (rolls 15–29). This tier was absent; rolls 15–29 were incorrectly
  mapped to 2% and the on-budget threshold was set to 30 instead of 70. Fixed to match all
  six tiers from BASIC lines 1590–1640.
- **"P" key leaking onto movie selection screen**: pressing Play Again caused the letter "P"
  to appear in the next movie-selection input. Fixed with `e.preventDefault()` in the
  `waitForKey` keydown handler.
- **"Tap to type" placeholder visible on desktop**: placeholder text is now hidden on
  pointer/hover devices via `@media (hover: hover) and (pointer: fine)`.

### Added
- **Default high score entries**: leaderboard now pre-populates with "No Movie-A/B/C/D" /
  "boA–boE" / 0 placeholder entries when no scores are stored, matching the C64
  `reset mm.scores.prg` behaviour. Defaults are written to `localStorage` on first
  game load; Highest Profit and Biggest Bombs no longer show blank boards.
- **Version display**: game version shown in the credits screen, sourced from `package.json`
  at build time via Vite's `define`.
- **Help/instructions screen**: press H on the title screen to page through the original
  LoadStar magazine manual (8 sections: intro, script, casting, production cost, reviews,
  box office, Academy Awards, high scores).
- **High score reset**: press R on the high score screen; confirms with Y/N before wiping
  the leaderboard back to blank placeholder entries.
- **Duplicate cast error**: casting now distinguishes "That actor is already cast in another
  role." from a plain out-of-range "Invalid selection." message.
- **Arnold Schwarzenegger full name**: stored directly in `actors.ts`; removed all runtime
  name-concatenation special-cases from game code.
- **`actors.ts` column alignment**: all 140 actor rows now align on `gender`/`stats` columns.
- **Firefox browser support** in the Playwright E2E test suite (desktop-firefox project).
- **C64 source file inventory**: all files in `c64/` documented in `CLAUDE.md` with
  D64 provenance noted.

## [1.0.0] — 2026-02-14

### Added
- Full game loop across all phases: movie selection, casting, production budget,
  production events, nine critic reviews, week-by-week box office simulation,
  Academy Awards (Best Actress, Best Actor, Best Picture), and re-release bonus.
- High score leaderboard: four categories (Highest Profit, Greatest Revenue,
  Best % Returned, Biggest Bomb) × five slots, persisted in `localStorage`.
- Terminal-style amber-on-black UI rendered into `<div id="output">`.
- C64 title screen graphic (`mm.title.prg`) rendered via VICE screenshot.
- Mobile support: virtual keyboard, touch-friendly input, viewport meta tag.
- Deterministic RNG via `?seed=N` URL parameter (used in E2E tests).
- `?cheat` URL parameter to reveal actor stats during casting.
- Multi-browser Playwright E2E test suite (Chrome, iOS WebKit, Android Chromium).
- Full unit test coverage of all pure game-logic functions with Vitest.
