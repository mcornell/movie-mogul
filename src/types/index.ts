// TypeScript type definitions for the Movie Mogul game

interface Actor {
    id: number;
    name: string;
    age: number;
    films: Movie[];
}

interface Role {
    id: number;
    name: string;
    description: string;
}

interface Movie {
    id: number;
    title: string;
    releaseYear: number;
    genre: string;
    cast: Actor[];
}

interface CastSelection {
    actorId: number;
    roleId: number;
}

interface GameState {
    currentTurn: number;
    players: string[];
    availableMovies: Movie[];
    selectedRoles: CastSelection[];
}