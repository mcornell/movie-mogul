// TypeScript type definitions for the Movie Mogul game
//
// Data shapes are derived from the original C64 seq files:
//   c64/actor data.seq  — 140 actors, 9 lines each (name + 8 values)
//   c64/movie data.seq  — 12 movies, each with description + roles + casting data
// See c64/pseudocode.txt for the original game logic.

// Gender values matching the C64 original encoding: 1=Male, 5=Either, 9=Female
export type Gender = 'M' | 'F' | 'N';

// An actor from the C64 actor data file.
// stats[0]    — unknown (always 1 or 2 in data)
// stats[1]    — pay seed (used in pay formula: stats[1]/2 + stats[2])
// stats[2]    — pay additive
// stats[3..6] — additional attributes used in scoring/awards
export interface Actor {
    id: number;
    name: string;
    gender: Gender;
    stats: [number, number, number, number, number, number, number]; // exactly 7 values
}

// A single role within a movie script, with casting requirements.
// requirements[0] — required gender (1=M, 5=either, 9=F)
// requirements[1] — unknown/ignored in original
// requirements[2] — actor skill weighting for awards
// requirements[3] — actor skill weighting for initial release
// requirements[4..7] — additional scoring attributes
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
export interface CastSelection {
    roleIndex: 0 | 1 | 2; // which of the 3 roles
    actorId: number;
    pay: number; // in thousands (e.g. 150 = $150,000)
}

// The full state of a game session, organized by phase.
export interface GameState {
    // Phase 1 — Movie selection
    // 3 random movies are drawn from the 12 available; player picks one.
    movieChoices: [Movie, Movie, Movie] | null;
    selectedMovie: Movie | null;

    // Phase 2 — Casting
    // 12 random actors are drawn (4–10 men, remainder women) for the player to cast.
    availableActors: Actor[];
    castSelections: CastSelection[];
}
