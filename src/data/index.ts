// game data structure for movies and actors

interface Actor {
    id: number;
    name: string;
    birthDate: string;
    nationality: string;
    films: number[]; // film IDs
}

interface Movie {
    id: number;
    title: string;
    releaseDate: string;
    genre: string[];
    actors: number[]; // actor IDs
}

const movies: Movie[] = [
    {
        id: 1,
        title: 'Inception',
        releaseDate: '2010-07-16',
        genre: ['Sci-Fi', 'Action'],
        actors: [1, 2]
    },
    {
        id: 2,
        title: 'The Shawshank Redemption',
        releaseDate: '1994-09-23',
        genre: ['Drama'],
        actors: [3]
    }
];

const actors: Actor[] = [
    {
        id: 1,
        name: 'Leonardo DiCaprio',
        birthDate: '1974-11-11',
        nationality: 'American',
        films: [1]
    },
    {
        id: 2,
        name: 'Joseph Gordon-Levitt',
        birthDate: '1981-02-17',
        nationality: 'American',
        films: [1]
    },
    {
        id: 3,
        name: 'Tim Robbins',
        birthDate: '1958-10-16',
        nationality: 'American',
        films: [2]
    }
];

export { movies, actors };