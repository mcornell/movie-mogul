// TypeScript type definitions for the Movie Mogul game
//
// Data shapes are derived from the original C64 seq files:
//   c64/actor data.seq  — 140 actors, 9 lines each (name + 8 values)
//   c64/movie data.seq  — 12 movies, each with description + roles + casting data
// See c64/pseudocode.txt for the original game logic.

// Gender values matching the C64 original encoding: 1=Male, 5=Either, 9=Female
export type Gender = 'M' | 'F' | 'N';

// An actor from the C64 actor data file.
//
// stats[0] — unused; never read by game logic
// stats[1] — STAR POWER: used in pay formula (÷2), Oscar award threshold, Best Picture score
// stats[2] — PAY ADDITIVE: combined with stats[1] in pay formula; high = expensive actor
// stats[3] — DRAMATIC RANGE: matched against role requirements[4]; low = miscast penalty
// stats[4] — COMEDIC ABILITY: matched against role requirements[5]; low = miscast penalty
// stats[5] — CHARM / SEX APPEAL: matched against role requirements[6]; low = miscast penalty
// stats[6] — ACTION / PHYSICALITY: matched against role requirements[7]; low = miscast penalty
//
// All stat values are 1–9. The bq penalty loop compares stats[1..6] against requirements[2..7].
// A casting score of 0 means perfectly matched; negative bq means actor is under-qualified.
//
// Notable examples (star power, dramatic, comedic, action):
//   Arnold Schwarzenegger [4, 3, 7, 3, 5, 1, 9] — low star power but maxed-out action
//   Meryl Streep          [4, 9, 9, 9, 3, 6, 6] — top dramatic + comedic range
//   Eddie Murphy          [2, 9, 9, 5, 9, 7, 7] — star power, comedy, and physicality
//   Dustin Hoffman        [4, 9, 9, 9, 8, 1, 6] — elite across the board except charm
export interface Actor {
    id: number;
    name: string;
    gender: Gender;
    stats: [number, number, number, number, number, number, number]; // exactly 7 values
}

// A single role within a movie script, with casting requirements.
//
// requirements[0] — GENDER RESTRICTION: 1=male only, 5=either, 9=female only
// requirements[1] — unused/reserved; populated from seq file but never read by game logic
// requirements[2] — ROLE PRESTIGE: contributes to aq (compounding quality score) and Oscar
//                   award threshold; higher = more prestigious role
// requirements[3] — ROLE QUALITY: also contributes to aq; reflects production value of role
// requirements[4] — DRAMATIC RANGE NEEDED: matched against actor.stats[3]
// requirements[5] — COMEDIC ABILITY NEEDED: matched against actor.stats[4]
// requirements[6] — CHARM NEEDED: matched against actor.stats[5]; almost always 1 (rarely binding)
// requirements[7] — ACTION NEEDED: matched against actor.stats[6]
//
// When an actor's stat is below the role's requirement, the difference is subtracted from bq,
// reducing the master quality score (mq) and hurting box office performance.
export interface Role {
    name: string;
    requirements: [number, number, number, number, number, number, number, number]; // exactly 8 values
}

// A movie script the player can choose to produce.
// Title and budget come from DATA statements in the original .prg file (not the seq file).
// The seq file provides the description and role data.
export interface Movie {
    id: number;
    title: string;
    descriptionLines: [string, string]; // two-line description from seq file
    roles: [Role, Role, Role];          // exactly 3 roles
    budgetMin: number;                  // minimum budget (in thousands)
    budgetIdeal: number;                // ideal/target budget (in thousands)
}

// An actor the player has cast in a specific role, with their negotiated pay.
// Note: actor pool draws 12 actors total — 4–8 male (IDs 1–76), remainder female (IDs 77–140).
export interface CastSelection {
    roleIndex: 0 | 1 | 2; // which of the 3 roles
    actorId: number;
    pay: number; // in thousands (e.g. 150 = $150,000)
}

// A fully-resolved cast member: actor data + role index + pay.
// Used in game logic calculations (box office, awards).
export interface CastResult {
    roleIndex: 0 | 1 | 2;
    actor: Actor;
    pay: number;
}

// GameState is defined in src/game/gameState.ts, which is the authoritative source.
