import type { Movie, Actor, CastResult } from '../types';

export type GamePhase =
    | 'title'
    | 'movie-selection'
    | 'casting'
    | 'budget'
    | 'production'
    | 'reviews'
    | 'release'
    | 'awards'
    | 'high-scores';

export interface GameState {
    phase: GamePhase;

    // Phase 1 — movie selection
    movieChoices: [Movie, Movie, Movie] | null;
    selectedMovie: Movie | null;

    // Phase 2 — casting
    actorPool: Actor[];           // the 12 available actors
    actorPays: number[];          // pay demand for each (indexed by pool position)
    cast: CastResult[];           // the 3 chosen cast members

    // Phase 3 — budget
    salaryCost: number;           // sum of cast pays (thousands)
    productionBudget: number;     // player's chosen budget (thousands)
    totalCost: number;            // salaries + budget + overruns (thousands)

    // Phase 4 — reviews
    reviewScore: number;          // starts at 3, modified by each critic

    // Phase 5 — release
    weeklyGross: number[];        // gross per week (thousands)
    totalGross: number;           // cumulative gross (thousands)

    // Phase 6 — awards
    oscarsWon: number;            // count of Oscars won (affects re-release)
    reReleaseGross: number;       // bonus gross from re-release (thousands)
}

export function initialGameState(): GameState {
    return {
        phase: 'title',
        movieChoices: null,
        selectedMovie: null,
        actorPool: [],
        actorPays: [],
        cast: [],
        salaryCost: 0,
        productionBudget: 0,
        totalCost: 0,
        reviewScore: 3,
        weeklyGross: [],
        totalGross: 0,
        oscarsWon: 0,
        reReleaseGross: 0,
    };
}
