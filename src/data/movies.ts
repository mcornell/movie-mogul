// Movie data combined from two sources:
//   c64/movie data.seq    — description lines, role names, role requirements (29 lines per movie)
//   util/convert_movie.rb — titles and budget values (from C64 BASIC DATA statements)
// See src/types/index.ts for field documentation.
//
// Role requirements tuple: [genderCode, ignored, awardsSkill, releaseSkill, ...4 more]
//   genderCode: 1=Male only, 5=Either, 9=Female only

import type { Movie } from '../types';

export const movies: Movie[] = [
    {
        id: 1,
        title: 'SPACE WARS',
        descriptionLines: ['A sci-fi spectacular set in a galaxy', 'far away.'],
        budgetMin: 5000,
        budgetIdeal: 30000,
        roles: [
            { name: 'Space Hero',      requirements: [5, 2, 7, 9, 7, 7, 1, 9] },
            { name: 'Princess',        requirements: [9, 2, 5, 7, 7, 6, 1, 6] },
            { name: 'Alien Sidekick',  requirements: [5, 4, 6, 8, 5, 8, 1, 7] },
        ],
    },
    {
        id: 2,
        title: 'SLASHER NIGHTS',
        descriptionLines: ['Chilling horror story about an', 'escaped psycho in a small town.'],
        budgetMin: 500,
        budgetIdeal: 12000,
        roles: [
            { name: 'Threatened Independant Woman', requirements: [9, 4, 6, 5, 7, 1, 1, 8] },
            { name: 'Boyfriend',                    requirements: [1, 4, 4, 4, 5, 1, 1, 9] },
            { name: 'Psycho',                       requirements: [5, 4, 6, 6, 7, 1, 1, 9] },
        ],
    },
    {
        id: 3,
        title: 'DEMON DUSTERS',
        descriptionLines: ['Funny adventures of a trio of', 'demon fighters.'],
        budgetMin: 1500,
        budgetIdeal: 26000,
        roles: [
            { name: 'Demon Duster #1', requirements: [5, 4, 7, 9, 2, 9, 1, 7] },
            { name: 'Demon Duster #2', requirements: [5, 4, 7, 9, 2, 9, 1, 7] },
            { name: 'Demon Duster #3', requirements: [5, 4, 6, 8, 2, 9, 1, 7] },
        ],
    },
    {
        id: 4,
        title: 'THE LAST BATTLE',
        descriptionLines: ['The story of brave Americans fighting', 'in Europe during World War II.'],
        budgetMin: 2500,
        budgetIdeal: 19000,
        roles: [
            { name: 'Compassionate Lieutenant', requirements: [1, 4, 9, 7, 9, 2, 1, 9] },
            { name: 'French Farm Girl',          requirements: [9, 2, 7, 6, 7, 2, 1, 9] },
            { name: 'Tough Sergeant',            requirements: [1, 6, 7, 7, 8, 5, 1, 9] },
        ],
    },
    {
        id: 5,
        title: 'GUNS & RIFLES',
        descriptionLines: ['A rancher fights off cattle rustlers', 'indians and bankers in the old west.'],
        budgetMin: 2000,
        budgetIdeal: 17000,
        roles: [
            { name: 'Rancher',       requirements: [1, 4, 8, 8, 9, 1, 1, 9] },
            { name: 'Wife',          requirements: [9, 4, 6, 6, 7, 1, 1, 7] },
            { name: 'Greedy Banker', requirements: [1, 4, 7, 6, 8, 1, 1, 8] },
        ],
    },
    {
        id: 6,
        title: 'FINAL REUNION',
        descriptionLines: ['A dramatic story of a family facing', 'an old dark secret.'],
        budgetMin: 1000,
        budgetIdeal: 15000,
        roles: [
            { name: 'Widowed Matriarch', requirements: [9, 6, 9, 9, 9, 1, 1, 4] },
            { name: 'Older Son',         requirements: [1, 4, 8, 8, 9, 1, 1, 5] },
            { name: 'Younger Son',       requirements: [1, 2, 8, 8, 9, 1, 1, 5] },
        ],
    },
    {
        id: 7,
        title: 'BONKERS!',
        descriptionLines: ['Teenagers go wild over surfing', 'video games and sex.'],
        budgetMin: 250,
        budgetIdeal: 7000,
        roles: [
            { name: 'Innocent Hero', requirements: [1, 2, 6, 4, 2, 6, 1, 5] },
            { name: 'Girlfriend',    requirements: [9, 2, 4, 5, 1, 6, 1, 6] },
            { name: 'Funny Slob',    requirements: [5, 4, 5, 5, 1, 9, 1, 5] },
        ],
    },
    {
        id: 8,
        title: 'QUEST FOR HONOR',
        descriptionLines: ["An adventurer must rescue a friend's", 'daughter from an evil warlord.'],
        budgetMin: 3000,
        budgetIdeal: 27000,
        roles: [
            { name: 'Archeologist Hero',   requirements: [1, 4, 8, 9, 7, 5, 1, 9] },
            { name: 'Kidnapped Daughter',  requirements: [9, 2, 5, 5, 4, 5, 1, 7] },
            { name: 'Villainous Warlord',  requirements: [5, 4, 8, 8, 7, 1, 1, 8] },
        ],
    },
    {
        id: 9,
        title: "I'VE GOT MUSIC",
        descriptionLines: ['A young song writer tries to make it', 'big in this old-fashioned musical.'],
        budgetMin: 1200,
        budgetIdeal: 16000,
        roles: [
            { name: 'Song Writer',  requirements: [1, 2, 9, 9, 7, 7, 9, 7] },
            { name: 'Big Producer', requirements: [5, 6, 6, 6, 5, 5, 9, 5] },
            { name: 'Femme Fatale', requirements: [9, 4, 6, 7, 5, 5, 9, 5] },
        ],
    },
    {
        id: 10,
        title: 'CONSENT TO KILL',
        descriptionLines: ['Story of a detective investigating', 'a strange double murder.'],
        budgetMin: 750,
        budgetIdeal: 18000,
        roles: [
            { name: 'Detective',             requirements: [5, 4, 8, 8, 8, 2, 1, 9] },
            { name: 'Rich Female Socialite', requirements: [9, 4, 6, 7, 7, 2, 1, 7] },
            { name: 'Partner',               requirements: [5, 4, 6, 6, 7, 2, 1, 9] },
        ],
    },
    {
        id: 11,
        title: 'EXECUTIVE DECISIONS',
        descriptionLines: ['A middle-aged business woman must deal', 'with divorce and corporate takeover.'],
        budgetMin: 1000,
        budgetIdeal: 15000,
        roles: [
            { name: 'Business Woman', requirements: [9, 4, 8, 8, 8, 5, 1, 3] },
            { name: 'Ex-Husband',     requirements: [1, 4, 7, 6, 8, 2, 1, 5] },
            { name: 'Young Stud',     requirements: [1, 2, 7, 6, 7, 2, 1, 6] },
        ],
    },
    {
        id: 12,
        title: 'STRANGE BEDFELLOWS',
        descriptionLines: ['Based on the hilarious play about', 'a marriage in mid-life crisis.'],
        budgetMin: 1000,
        budgetIdeal: 15000,
        roles: [
            { name: 'Husband',     requirements: [1, 4, 7, 8, 6, 7, 1, 1] },
            { name: 'Wife',        requirements: [9, 4, 7, 8, 6, 7, 1, 1] },
            { name: 'Best Friend', requirements: [5, 4, 6, 5, 4, 6, 1, 1] },
        ],
    },
];
