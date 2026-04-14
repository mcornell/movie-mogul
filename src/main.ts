import './styles/main.css';
import { movies } from './data/movies';
import { actors } from './data/actors';
import {
    pickMovieChoices,
    pickActorPool,
    calculatePay,
    calculateQualityScore,
    simulateRelease,
    checkOscarActress,
    checkOscarActor,
    checkBestPicture,
    calculateReRelease,
} from './game/gameEngine';
import { initialGameState } from './game/gameState';
import type { GameState } from './game/gameState';
import { reviewVerdict, budgetOverrun, pullFromTheatersLine, profitLossResult, productionEvent } from './game/phaseHelpers';
import {
    calculateGameScores,
    qualifiesFor,
    insertEntry,
    buildInitials,
    loadHighScores,
    saveHighScores,
    defaultHighScores,
    fetchLeaderboardsFromApi,
} from './game/highScores';

import type { HighScoreData, HighScoreEntry } from './game/highScores';
import {
    apiPost,
    toHighScoreData,
} from './api/client';
import type {
    StartResponse,
    MovieApiResponse,
    CastApiResponse,
    BudgetApiResponse,
    FinishApiResponse,
} from './api/client';
import {
    print,
    printBlank,
    printSeparator,
    printSlow,
    printHeading,
    clearScreen,
    waitForKey,
    readLine,
    pressAnyKey,
    formatMoney,
    sleep,
} from './ui/renderer';

// ── Cheat mode ────────────────────────────────────────────────────────────────

const params = new URLSearchParams(window.location.search);
// cheatMode is always false in the global deployment (VITE_SCORES_API is set)
const cheatMode = !import.meta.env.VITE_SCORES_API && params.has('cheat');

// Seeded RNG for deterministic E2E testing — inject via ?seed=N
const seedParam = params.get('seed');
if (seedParam !== null) {
    const seed = parseInt(seedParam, 10);
    let s = (isNaN(seed) ? 0 : seed) >>> 0;
    Math.random = () => {
        s = (Math.imul(1664525, s) + 1013904223) >>> 0;
        return s / 0x100000000;
    };
}


// ── Title screen ──────────────────────────────────────────────────────────────

const titleScreen = document.getElementById('title-screen')!;
const screen      = document.getElementById('screen')!;

async function showTitleScreen(): Promise<void> {
    await new Promise<void>(resolve => {
        const advance = () => resolve();
        window.addEventListener('keydown', advance, { once: true });
        titleScreen.addEventListener('click', advance, { once: true });
    });
    titleScreen.classList.add('hidden');
    screen.classList.remove('hidden');
}

// ── Game phases ───────────────────────────────────────────────────────────────

async function phaseMovieSelection(state: GameState): Promise<void> {
    clearScreen();
    state.movieChoices = pickMovieChoices(movies, Math.random);
    state.phase = 'movie-selection';

    for (let i = 0; i < 3; i++) {
        const movie = state.movieChoices[i];
        print(`${i + 1})  ${movie.title}`, 'bright');
        print(`    ${movie.descriptionLines.join(' ')}`);
        print(`    *roles==> ${movie.roles[0].name}`);
        print(`              ${movie.roles[1].name}`);
        print(`              ${movie.roles[2].name}`);
        printBlank();
    }

    print('You have been sent three scripts.', 'bright');
    let choice = 0;
    while (choice < 1 || choice > 3) {
        const input = await readLine('Which do you want to produce (1-3)?');
        choice = parseInt(input, 10);
    }

    state.selectedMovie = state.movieChoices[choice - 1];
    print(state.selectedMovie.title, 'bright', 'center');
}

async function phaseCasting(state: GameState): Promise<void> {
    clearScreen();
    const movie = state.selectedMovie!;
    state.phase = 'casting';

    printHeading(`Casting Call for "${movie.title}"`);
    if (cheatMode) print('★ CHEAT MODE ACTIVE ★', 'bright', 'center');
    print('Please wait...', 'dim');

    state.actorPool = pickActorPool(actors, Math.random);
    state.actorPays = state.actorPool.map(a => calculatePay(a, Math.random));

    printBlank();
    if (cheatMode) {
        movie.roles.forEach((role, i) => print(`  R${i + 1} = ${role.name}`, 'dim'));
        printBlank();
    }
    const PAY_WIDTH = 14; // wide enough for $10,000,000
    const COL_WIDTH = 6;
    const actorHeader = '  ' + 'NAME'.padEnd(26) + 'PAY'.padStart(PAY_WIDTH)
        + (cheatMode ? 'R1'.padStart(COL_WIDTH) + 'R2'.padStart(COL_WIDTH) + 'R3'.padStart(COL_WIDTH) : '');
    print(actorHeader, 'bright');
    printBlank();

    state.actorPool.forEach((actor, i) => {
        const num = String(i + 1).padStart(2);
        const pay = formatMoney(state.actorPays[i]).padStart(PAY_WIDTH);
        let line = `${num}) ${actor.name.padEnd(24)} ${pay}`;
        if (cheatMode) {
            for (const role of movie.roles) {
                const genderCode = role.requirements[0];
                const genderOk =
                    genderCode === 5 ||
                    (genderCode === 1 && actor.gender === 'M') ||
                    (genderCode === 9 && actor.gender === 'F');
                let cell: string;
                if (!genderOk) {
                    cell = 'X';
                } else {
                    let deficit = 0;
                    for (let si = 2; si <= 7; si++) {
                        const diff = actor.stats[si - 1] - role.requirements[si];
                        if (diff < 0) deficit += diff;
                    }
                    cell = deficit === 0 ? '✓' : String(deficit);
                }
                line += cell.padStart(COL_WIDTH);
            }
        }
        print(line);
    });

    printBlank();

    const pickedPoolIndices: number[] = [];

    for (let roleIdx = 0 as 0 | 1 | 2; roleIdx < 3; roleIdx++) {
        const role = movie.roles[roleIdx];
        let poolIdx = -1;

        while (poolIdx === -1) {
            const input = await readLine(`Who will you cast as the ${role.name}?`);
            const n = parseInt(input, 10);
            if (isNaN(n) || n < 1 || n > 12) {
                print('Invalid selection.', 'red');
                continue;
            }
            if (pickedPoolIndices.includes(n - 1)) {
                print('That actor is already cast in another role.', 'red');
                continue;
            }
            const candidate = state.actorPool[n - 1];
            const genderCode = role.requirements[0];
            const genderOk =
                genderCode === 5 ||
                (genderCode === 1 && candidate.gender === 'M') ||
                (genderCode === 9 && candidate.gender === 'F');

            if (!genderOk) {
                print('That actor is the wrong gender for this role.', 'red');
                continue;
            }
            poolIdx = n - 1;
        }

        pickedPoolIndices.push(poolIdx);
        const actor = state.actorPool[poolIdx];

        print(actor.name, 'bright');

        state.cast.push({ roleIndex: roleIdx, actor, pay: state.actorPays[poolIdx] });
    }

    state.salaryCost = state.cast.reduce((sum, cr) => sum + cr.pay, 0);
    printBlank();
    print(`Total cost of salaries: ${formatMoney(state.salaryCost)}`);
}

async function phaseBudget(state: GameState): Promise<void> {
    clearScreen();
    const movie = state.selectedMovie!;
    state.phase = 'budget';

    // BASIC lines 1501–1502: remind player of salary commitment before budget input
    print(`Total cost of salaries: ${formatMoney(state.salaryCost)}`, 'bright');
    printBlank();
    print(`How much do you want to spend on production?`);
    print(`(${formatMoney(movie.budgetMin)} - $30,000,000)`, 'dim');

    let budget = 0;
    while (budget < movie.budgetMin || budget > 30000) {
        const input = await readLine('$ (enter amount in thousands)');
        budget = parseInt(input, 10);
        if (isNaN(budget) || budget < movie.budgetMin || budget > 30000) {
            print(`Please enter a value between ${movie.budgetMin} and 30,000.`, 'red');
            budget = 0;
        }
    }

    state.productionBudget = budget;
    // Cap at budgetIdeal for scoring purposes (BASIC line 1540)
    const effectiveBudget = Math.min(budget, movie.budgetIdeal);

    // Production events (BASIC lines 1560–1570) — happen before overrun
    const castNames = state.cast.map(cr => cr.actor.name);
    const eventRoll = Math.trunc(Math.random() * 10) + 1;
    const event = productionEvent(castNames[0], castNames[1], castNames[2], eventRoll);
    let eventCostDelta = 0;
    if (event) {
        printBlank();
        print(event.message, event.reviewDelta < 0 || event.costDelta > 0 ? 'red' : 'green');
        state.reviewScore += event.reviewDelta;
        eventCostDelta = event.costDelta;
        await pressAnyKey();
    }

    const { text: overrunText, overrun } = budgetOverrun(budget, Math.trunc(Math.random() * 100));
    print(overrunText, overrun > 0 ? 'red' : 'green');

    state.productionBudget = budget + overrun;
    state.totalCost = state.salaryCost + eventCostDelta + state.productionBudget;
    printBlank();
    print(`Total cost: ${formatMoney(state.totalCost)}`);
    await pressAnyKey();

    // Store effective budget for quality score — overrun adds to cost but not to quality
    // (C64: mn = min(budget, ideal) is set before overrun, quality score uses mn)
    state.productionBudget = effectiveBudget;
}

async function phaseReviews(state: GameState): Promise<void> {
    clearScreen();
    state.phase = 'reviews';
    // reviewScore already initialized to 3 in initialGameState;
    // production events may have already modified it — do not reset here.

    const reviewers = [
        'The NY Times',
        'Entertainment Tonight',
        'Gene Siskel',
        'Roger Ebert',
        'Sneak Previews',
        'Rex Reed',
        'Time Magazine',
        'Newsweek',
        'LA Times',
    ];

    printHeading('The reviews are in...');

    for (const reviewer of reviewers) {
        const { text, scoreDelta } = reviewVerdict(Math.trunc(Math.random() * 10) + 1);
        state.reviewScore += scoreDelta;
        await sleep(800); // C64 had a ~500-iteration delay loop before each verdict (line 3840)
        await printSlow(`${reviewer} ${text}`);
    }

    printBlank();
    print('Press any key to release the movie', 'dim');
    await waitForKey();
    printBlank();
}

async function phaseRelease(state: GameState): Promise<void> {
    clearScreen();
    const movie = state.selectedMovie!;
    state.phase = 'release';

    // Build display names (C64 lines 1731–1770): Schwarzenegger sorted first
    let [vx, vy, vz] = state.cast.map(cr =>
        cr.actor.name === 'Schwarzenegger' ? 'Arnold Schwarzenegger' : cr.actor.name
    );
    if (vy.length === 21) { [vx, vy] = [vy, vx]; }
    if (vz.length === 21) { [vx, vz] = [vz, vx]; }

    // Pick rating once for the run (C64 lines 1780–1810)
    const ratings = ['PG', 'PG-13', 'R'];
    const rating = ratings[Math.trunc(Math.random() * 3)];

    function printSneakPreviewHeader(week?: number): void {
        print('MAJOR STUDIO SNEAK PREVIEW', 'bright', 'bold', 'center');
        print('of', 'center');
        print(movie.title, 'bright', 'bold', 'center');
        printBlank();
        print('starring', 'center');
        print(vx, 'bright', 'center');
        print(`${vy} & ${vz}`, 'center');
        printBlank();
        print(`Rated ${rating}`, 'dim', 'center');
        printBlank();
        if (week !== undefined) {
            print(`WEEK ${week}`, 'bright', 'bold', 'center');
        }
    }

    printSneakPreviewHeader();
    await pressAnyKey();

    const { mq } = calculateQualityScore(
        movie,
        state.cast,
        state.reviewScore,
        state.productionBudget,
    );

    const { weeklyGross, totalGross } = simulateRelease(mq, Math.random);
    state.weeklyGross = weeklyGross;
    state.totalGross  = totalGross;

    for (let wk = 0; wk < weeklyGross.length; wk++) {
        clearScreen();
        printSneakPreviewHeader(wk + 1);
        print(`Weekly gross  - ${formatMoney(weeklyGross[wk])}`);
        const running = weeklyGross.slice(0, wk + 1).reduce((a, b) => a + b, 0);
        print(`Total gross   - ${formatMoney(running)}`);
        await pressAnyKey();
    }

    clearScreen();
    print(pullFromTheatersLine(movie.title, [vx, vy, vz], weeklyGross.length));
    printBlank();
    print(`Subtotal: ${formatMoney(totalGross)}`);
    await pressAnyKey();
}

/** Pick a random actor not in the cast to serve as a presenter. */
function pickPresenter(cast: GameState['cast']): string {
    const castNames = new Set(cast.map(cr => cr.actor.name));
    let presenter: typeof actors[0] | undefined;
    do {
        const idx = Math.trunc(Math.random() * 140) + 1;
        presenter = actors.find(a => a.id === idx);
    } while (!presenter || castNames.has(presenter.name));
    return presenter.name === 'Schwarzenegger' ? 'Arnold Schwarzenegger' : presenter.name;
}

async function phaseAwards(state: GameState): Promise<void> {
    clearScreen();
    state.phase = 'awards';

    // C64 lines 2300–2319: invitation screen with frame
    const border = '+----------------------------------+';
    const row = (s: string) => `! ${s.padEnd(32)} !`;
    print(border, 'bright', 'center');
    print(row(''), 'bright', 'center');
    print(row('  * I n v i t a t i o n *'), 'bright', 'center');
    print(row('  ======================='), 'bright', 'center');
    print(row(''), 'bright', 'center');
    print(row(' The Academy of Motion Pictures'), 'bright', 'center');
    print(row(' Arts and Sciences cordially'), 'bright', 'center');
    print(row(' invites you to attend its annual'), 'bright', 'center');
    print(row(' Academy Awards ceremony.'), 'bright', 'center');
    print(row(''), 'bright', 'center');
    print(border, 'bright', 'center');
    printBlank();
    print('Press any key to attend', 'dim', 'center');
    await waitForKey();
    printBlank();

    const movie = state.selectedMovie!;
    let w = 0;

    // ── Best Actress (C64 lines 2350–2361) ───────────────────────────────────
    // C64: delay loop before reveal (fordl=1to500:nextdl), no keypress between awards
    clearScreen();
    print('Welcome to the annual Academy Awards presentation.');
    printBlank();
    print(`Here to present the first award is ${pickPresenter(state.cast)}`);
    printBlank();
    print('The winner of the Oscar for Best Actress is...');
    await sleep(1500);

    const actressResult = checkOscarActress(movie, state.cast, actors, movies, Math.random);
    print(`${actressResult.winnerName} for "${actressResult.winnerMovie}"`, 'bright', 'bold');
    if (actressResult.isPlayerWin) {
        state.oscarsWon++;
        w += actressResult.weight;
    }

    // ── Best Actor (C64 lines 2370–2381) ─────────────────────────────────────
    await sleep(2500);
    clearScreen();
    print(`Here to present the next Oscar is ${pickPresenter(state.cast)}`);
    printBlank();
    print('The winner of the Oscar for Best Actor is...');
    await sleep(1500);

    const actorResult = checkOscarActor(movie, state.cast, actors, movies, Math.random);
    print(`${actorResult.winnerName} for "${actorResult.winnerMovie}"`, 'bright', 'bold');
    if (actorResult.isPlayerWin) {
        state.oscarsWon++;
        w += actorResult.weight;
    }

    // ── Best Picture (C64 lines 2390–2401) ───────────────────────────────────
    await sleep(2500);
    clearScreen();
    print(`Here to award the final oscar is ${pickPresenter(state.cast)}`);
    printBlank();
    print('The award for Best Picture goes to...');
    await sleep(1500);

    const pictureResult = checkBestPicture(movie, state.cast, movies, Math.random);
    print(pictureResult.winnerName, 'bright', 'bold');
    if (pictureResult.isPlayerWin) {
        state.oscarsWon++;
        w += pictureResult.weight;
    }

    // ── Re-release (C64 lines 2420–2510) ─────────────────────────────────────
    await sleep(2500);
    clearScreen();
    if (w > 0) {
        print('Because of the Oscars, your movie will be re-released.');
        const bonus = calculateReRelease(state.totalGross, w, Math.random);
        state.reReleaseGross = bonus;
        state.totalGross += bonus;
        print(`The re-release grosses ${formatMoney(bonus)}`, 'bright');
    } else {
        print('Your movie will not be re-released.', 'dim');
    }
    printBlank();
    await pressAnyKey();
}

async function phaseSummary(state: GameState): Promise<void> {
    clearScreen();
    printHeading(state.selectedMovie!.title);
    print(`Total cost - ${formatMoney(state.totalCost)}`);
    print(`Total revenue - ${formatMoney(state.totalGross)}`);
    printSeparator();
    const { text: verdict, profit } = profitLossResult(state.totalGross, state.totalCost);
    print(verdict, profit > 0 ? 'green' : profit < 0 ? 'red' : 'bright');
    printBlank();
    await pressAnyKey();
}

// ── Main game loop ────────────────────────────────────────────────────────────

// ── High score display ────────────────────────────────────────────────────────

function printHighScorePage(data: HighScoreData, page: 1 | 2): void {
    printHeading('HIGH SCORES');

    const fmtEntry = (e: HighScoreEntry, scoreStr: string) => {
        const flag = e.cheat ? '*' : ' ';
        print(`${e.movieTitle.padEnd(21)}${(e.initials + flag).padEnd(6)}${scoreStr}`);
    };

    if (page === 1) {
        print('HIGHEST PROFIT', 'bright', 'center');
        printBlank();
        data.highestProfit.forEach(e => fmtEntry(e, formatMoney(e.score)));
        printBlank();
        print('GREATEST REVENUES', 'bright', 'center');
        printBlank();
        data.greatestRevenue.forEach(e => fmtEntry(e, formatMoney(e.score)));
    } else {
        print('BEST PERCENTAGE RETURNED', 'bright', 'center');
        printBlank();
        data.bestPctReturned.forEach(e => fmtEntry(e, `${e.score}%`));
        printBlank();
        print('BIGGEST BOMBS', 'bright', 'center');
        printBlank();
        data.biggestBomb.forEach(e => fmtEntry(e, formatMoney(e.score)));
    }

    if (cheatMode) {
        printBlank();
        print('* score achieved with cheat mode enabled', 'dim');
    }
}

async function phaseHighScores(state: GameState): Promise<boolean> {
    clearScreen();
    state.phase = 'high-scores';
    const movie = state.selectedMovie!;
    const scores = calculateGameScores(state.totalGross, state.totalCost);

    let data = loadHighScores();
    const qualifies =
        (scores.profit > 0 && qualifiesFor(data.highestProfit, scores.profit)) ||
        qualifiesFor(data.greatestRevenue, scores.revenue)     ||
        qualifiesFor(data.bestPctReturned, scores.pctReturned) ||
        (scores.bomb > 0 && qualifiesFor(data.biggestBomb, scores.bomb));

    // Show score (C64 lines 10300–10360)
    printBlank();
    const { profit } = profitLossResult(state.totalGross, state.totalCost);
    print(`Your score - ${formatMoney(Math.abs(profit))} ${profit >= 0 ? 'profit' : 'loss'}`, 'bright', 'center');
    print(`${scores.pctReturned}% returned`, 'center');
    printBlank();

    if (qualifies) {
        // Prompt for initials (C64 lines 10400–10499)
        let raw = '';
        while (!raw) {
            raw = (await readLine('Enter your initials (3 chars)', 3)).trim().toUpperCase();
        }
        const initials = buildInitials(movie.title, raw, data);
        const mkEntry = (score: number) => ({ movieTitle: movie.title, initials, score, cheat: cheatMode || undefined });

        if (scores.profit > 0 && qualifiesFor(data.highestProfit, scores.profit))
            data.highestProfit   = insertEntry(data.highestProfit,   mkEntry(scores.profit));
        if (qualifiesFor(data.greatestRevenue, scores.revenue))
            data.greatestRevenue = insertEntry(data.greatestRevenue, mkEntry(scores.revenue));
        if (qualifiesFor(data.bestPctReturned, scores.pctReturned))
            data.bestPctReturned = insertEntry(data.bestPctReturned, mkEntry(scores.pctReturned));
        if (scores.bomb > 0 && qualifiesFor(data.biggestBomb, scores.bomb))
            data.biggestBomb     = insertEntry(data.biggestBomb,     mkEntry(scores.bomb));

        saveHighScores(data);
    }

    // Display high scores with P/V/Q navigation (C64 lines 10500–10560)
    let page: 1 | 2 = 1;
    printHighScorePage(data, page);
    printBlank();

    while (true) {
        print('P)lay Again   V)iew other page   R)eset scores   Q)uit', 'dim', 'center');
        const key = (await waitForKey()).toLowerCase();
        if (key === 'p') return true;
        if (key === 'q') return false;
        if (key === 'v') {
            page = page === 1 ? 2 : 1;
            clearScreen();
            printHighScorePage(data, page);
            printBlank();
        }
        if (key === 'r') {
            print('Reset all high scores? Y)es   N)o', 'red', 'center');
            const confirm = (await waitForKey()).toLowerCase();
            if (confirm === 'y') {
                data = defaultHighScores();
                saveHighScores(data);
                clearScreen();
                printHighScorePage(data, page);
                printBlank();
            }
        }
    }
}

// ── Help screen ───────────────────────────────────────────────────────────────
// Text verbatim from c64/t.movie mogul.prg (LoadStar magazine article, 1985).

const HELP_PAGES: { heading: string; paragraphs: string[] }[] = [
    {
        heading: 'MOVIE MOGUL',
        paragraphs: [
            'MOVIE MOGUL sets you up as a big cheese producer. The resources of Hollywood are at your disposal. Name stars are clamoring to do your pictures. Scripts are flooding in.',
            'What will you do? Which script will benefit from your magic touch? Which stars will you employ? How much money will you spend?',
            "Will your pic have legs or be N.S.G. (not so good, as they say in Daily Variety). Was your casting astute enough to capture some Academy Awards?",
            "Here's your big chance to find out. As they say in the biz, BREAK A LEG.",
        ],
    },
    {
        heading: 'SCRIPT',
        paragraphs: [
            'At the beginning of the game, you will be handed the scripts to three different movies. Read the descriptions carefully and decide which of the three you want to produce.',
        ],
    },
    {
        heading: 'CASTING',
        paragraphs: [
            'After selecting a script, you must hire actors to star in your film. A list of twelve available actors and actresses and their salary demands will appear on the screen. You may hire only three.',
            'Consider how well an actor is suited for the part. Talent is important, especially during Oscar time. A big star demands a big salary but attracts a big audience.',
            "Some parts are restricted by sex while others aren't. Experiment to see which roles can be portrayed by either an actor or an actress.",
        ],
    },
    {
        heading: 'PRODUCTION COST',
        paragraphs: [
            'Decide how much you want to spend making your movie. The money you allot directly reflects its quality.',
            'A high-quality picture will normally outperform a cheap, low-budget movie. However, a small movie can make a huge profit and a big film can turn into an expensive failure.',
            'Total cost = production budget + star salaries + any cost overruns.',
        ],
    },
    {
        heading: 'REVIEWS',
        paragraphs: [
            'After your film is shot and before it is released to the public, there will be a special screening for the critics.',
            "What the critics say may affect your film's popularity at the box office. Unfortunately, you have no control over them, so just read 'em and weep.",
        ],
    },
    {
        heading: 'BOX OFFICE',
        paragraphs: [
            'Your picture is now ready for wide release. You will see a weekly total and a running grand total of revenues.',
            "Some films will have 'legs' and their weekly take will drop very slowly. Others may have a big opening week, then fade away quickly.",
            "The smallest a film can generate is $200,000. If that is all it has made, you have what we in the biz call a 'bomb'.",
        ],
    },
    {
        heading: 'ACADEMY AWARDS',
        paragraphs: [
            'No matter how poorly your film did, it will have a chance to win an Academy Award.',
            "Taking home an Oscar means an opportunity to re-release your movie. The revenue from a re-release could be the difference between making and losing money.",
        ],
    },
    {
        heading: 'HIGH SCORES',
        paragraphs: [
            'At the end of the game you will be told how much you made or lost. If you did exceptionally well, you and your film will enter the high score list.',
            'A really poor performance will give you the dishonorable distinction of making the low score list.',
            'When identical movie titles appear with the same initials, a marker is added to distinguish them.',
            'To reset the leaderboard, press R on the high score screen.',
        ],
    },
];

async function showHelp(): Promise<void> {
    for (let i = 0; i < HELP_PAGES.length; i++) {
        clearScreen();
        const page = HELP_PAGES[i];
        print(`HELP  (${i + 1}/${HELP_PAGES.length})`, 'dim', 'center');
        printBlank();
        print(page.heading, 'bright', 'center');
        printBlank();
        for (const para of page.paragraphs) {
            print(para);
            printBlank();
        }
        const isLast = i === HELP_PAGES.length - 1;
        print(isLast ? 'Press any key to return' : 'Press any key for next page', 'dim', 'center');
        await waitForKey();
    }
}

async function runGame(): Promise<void> {
    // Seed localStorage with blank placeholder entries on first ever load,
    // mirroring what reset mm.scores.prg does on the C64.
    if (!localStorage.getItem('movieMogulHighScores')) {
        saveHighScores(defaultHighScores());
    }

    await showTitleScreen();

    while (true) {
        clearScreen();
        print('MOVIE MOGUL', 'bright', 'bold', 'center');
        printBlank();
        print('Written by Anthony Chiang', 'dim', 'center');
        print('Converted to the C-64 by Alan Gardner', 'dim', 'center');
        print('Copyright 1985 Chiang Brothers Software', 'dim', 'center');
        print(`v${__APP_VERSION__}`, 'dim', 'center');
        printBlank();
        print('P)lay   H)elp', 'dim', 'center');
        const key = (await waitForKey()).toLowerCase();
        if (key === 'p') break;
        if (key === 'h') await showHelp();
    }

    while (true) {
        const state = initialGameState();
        await phaseMovieSelection(state);
        await pressAnyKey();
        await phaseCasting(state);
        await pressAnyKey();
        await phaseBudget(state);
        await phaseReviews(state);
        await phaseRelease(state);
        await phaseAwards(state);
        await phaseSummary(state);
        const playAgain = await phaseHighScores(state);
        if (!playAgain) break;
    }

    clearScreen();
    printBlank();
    print('Thanks for playing Movie Mogul!', 'bright', 'center');
    printBlank();
    print('Copyright 1985 Chiang Brothers Software', 'dim', 'center');
}

// ── API-driven game loop (global deployment) ──────────────────────────────────

// ── Single API game ───────────────────────────────────────────────────────────

async function playOneGameApi(): Promise<boolean> {
    // ── Phase 1: Movie Selection ──────────────────────────────────────────────
    clearScreen();
    print('Please wait...', 'dim');
    const { sessionId, movieChoices } = await apiPost<StartResponse>('/api/game/start');

    clearScreen();
    for (let i = 0; i < 3; i++) {
        const m = movieChoices[i];
        print(`${i + 1})  ${m.title}`, 'bright');
        print(`    ${m.descriptionLines.join(' ')}`);
        print(`    *roles==> ${m.roles[0].name}`);
        print(`              ${m.roles[1].name}`);
        print(`              ${m.roles[2].name}`);
        printBlank();
    }
    print('You have been sent three scripts.', 'bright');

    let choice = 0;
    while (choice < 1 || choice > 3) {
        const input = await readLine('Which do you want to produce (1-3)?');
        choice = parseInt(input, 10);
    }
    const selectedMovie = movieChoices[choice - 1];
    print(selectedMovie.title, 'bright', 'center');
    await pressAnyKey();

    // ── Phase 2: Casting ──────────────────────────────────────────────────────
    clearScreen();
    printHeading(`Casting Call for "${selectedMovie.title}"`);
    print('Please wait...', 'dim');

    const { actorPool } = await apiPost<MovieApiResponse>('/api/game/movie', { sessionId, choice });

    printBlank();
    const PAY_WIDTH = 14;
    print('  ' + 'NAME'.padEnd(26) + 'PAY'.padStart(PAY_WIDTH), 'bright');
    printBlank();
    actorPool.forEach((actor, i) => {
        const num = String(i + 1).padStart(2);
        const pay = formatMoney(actor.pay).padStart(PAY_WIDTH);
        print(`${num}) ${actor.name.padEnd(24)} ${pay}`);
    });
    printBlank();

    const pickedPoolIndices: number[] = [];
    for (let roleIdx = 0; roleIdx < 3; roleIdx++) {
        const role = selectedMovie.roles[roleIdx];
        let poolIdx = -1;
        while (poolIdx === -1) {
            const input = await readLine(`Who will you cast as the ${role.name}?`);
            const n = parseInt(input, 10);
            if (isNaN(n) || n < 1 || n > 12) { print('Invalid selection.', 'red'); continue; }
            if (pickedPoolIndices.includes(n - 1)) { print('That actor is already cast in another role.', 'red'); continue; }
            const candidate = actorPool[n - 1];
            const genderCode = role.requirements[0];
            const genderOk =
                genderCode === 5 ||
                (genderCode === 1 && candidate.gender === 'M') ||
                (genderCode === 9 && candidate.gender === 'F');
            if (!genderOk) { print('That actor is the wrong gender for this role.', 'red'); continue; }
            poolIdx = n - 1;
        }
        pickedPoolIndices.push(poolIdx);
        print(actorPool[poolIdx].name, 'bright');
    }
    const actorIndices = pickedPoolIndices.map(i => i + 1); // 1-based
    printBlank();

    const castResp = await apiPost<CastApiResponse>('/api/game/cast', { sessionId, actorIndices });
    print(`Total cost of salaries: ${formatMoney(castResp.salaryCost)}`);
    await pressAnyKey();

    // ── Phase 3: Budget ───────────────────────────────────────────────────────
    clearScreen();
    print(`Total cost of salaries: ${formatMoney(castResp.salaryCost)}`, 'bright');
    printBlank();
    print('How much do you want to spend on production?');
    print(`(${formatMoney(castResp.budgetMin)} - $30,000,000)`, 'dim');

    let budget = 0;
    while (budget < castResp.budgetMin || budget > 30000) {
        const input = await readLine('$ (enter amount in thousands)');
        budget = parseInt(input, 10);
        if (isNaN(budget) || budget < castResp.budgetMin || budget > 30000) {
            print(`Please enter a value between ${castResp.budgetMin} and 30,000.`, 'red');
            budget = 0;
        }
    }

    print('Please wait...', 'dim');
    const budgetResp = await apiPost<BudgetApiResponse>('/api/game/budget', { sessionId, budget });

    // Display production event (if any)
    if (budgetResp.event) {
        printBlank();
        const isNegative = budgetResp.event.reviewDelta < 0 || budgetResp.event.costDelta > 0;
        print(budgetResp.event.message, isNegative ? 'red' : 'green');
        await pressAnyKey();
    }
    print(budgetResp.overrunText, budgetResp.overrun > 0 ? 'red' : 'green');
    printBlank();
    print(`Total cost: ${formatMoney(budgetResp.totalCost)}`);
    await pressAnyKey();

    // ── Phase 4: Reviews ──────────────────────────────────────────────────────
    clearScreen();
    printHeading('The reviews are in...');
    for (const r of budgetResp.reviews) {
        await sleep(800);
        await printSlow(`${r.reviewer} ${r.text}`);
    }
    printBlank();
    print('Press any key to release the movie', 'dim');
    await waitForKey();
    printBlank();

    // ── Phase 5: Release ──────────────────────────────────────────────────────
    clearScreen();
    const { rating, vx, vy, vz, weeklyGross, movieTitle: mTitle } = budgetResp;

    function printSneakPreviewHeader(week?: number): void {
        print('MAJOR STUDIO SNEAK PREVIEW', 'bright', 'bold', 'center');
        print('of', 'center');
        print(mTitle, 'bright', 'bold', 'center');
        printBlank();
        print('starring', 'center');
        print(vx, 'bright', 'center');
        print(`${vy} & ${vz}`, 'center');
        printBlank();
        print(`Rated ${rating}`, 'dim', 'center');
        printBlank();
        if (week !== undefined) print(`WEEK ${week}`, 'bright', 'bold', 'center');
    }

    printSneakPreviewHeader();
    await pressAnyKey();

    for (let wk = 0; wk < weeklyGross.length; wk++) {
        clearScreen();
        printSneakPreviewHeader(wk + 1);
        print(`Weekly gross  - ${formatMoney(weeklyGross[wk])}`);
        const running = weeklyGross.slice(0, wk + 1).reduce((a, b) => a + b, 0);
        print(`Total gross   - ${formatMoney(running)}`);
        await pressAnyKey();
    }

    clearScreen();
    print(pullFromTheatersLine(mTitle, [vx, vy, vz], weeklyGross.length));
    printBlank();
    print(`Subtotal: ${formatMoney(weeklyGross.reduce((a, b) => a + b, 0))}`);
    await pressAnyKey();

    // ── Phase 6: Awards ───────────────────────────────────────────────────────
    clearScreen();
    const border = '+----------------------------------+';
    const row = (s: string) => `! ${s.padEnd(32)} !`;
    print(border, 'bright', 'center');
    print(row(''), 'bright', 'center');
    print(row('  * I n v i t a t i o n *'), 'bright', 'center');
    print(row('  ======================='), 'bright', 'center');
    print(row(''), 'bright', 'center');
    print(row(' The Academy of Motion Pictures'), 'bright', 'center');
    print(row(' Arts and Sciences cordially'), 'bright', 'center');
    print(row(' invites you to attend its annual'), 'bright', 'center');
    print(row(' Academy Awards ceremony.'), 'bright', 'center');
    print(row(''), 'bright', 'center');
    print(border, 'bright', 'center');
    printBlank();
    print('Press any key to attend', 'dim', 'center');
    await waitForKey();
    printBlank();

    const { actressResult, actorResult, pictureResult, reReleaseGross, oscarsWon } = budgetResp;

    clearScreen();
    print('Welcome to the annual Academy Awards presentation.');
    printBlank();
    print(`Here to present the first award is ${budgetResp.presenter1}`);
    printBlank();
    print('The winner of the Oscar for Best Actress is...');
    await sleep(1500);
    print(`${actressResult.winnerName} for "${actressResult.winnerMovie}"`, 'bright', 'bold');

    await sleep(2500);
    clearScreen();
    print(`Here to present the next Oscar is ${budgetResp.presenter2}`);
    printBlank();
    print('The winner of the Oscar for Best Actor is...');
    await sleep(1500);
    print(`${actorResult.winnerName} for "${actorResult.winnerMovie}"`, 'bright', 'bold');

    await sleep(2500);
    clearScreen();
    print(`Here to award the final oscar is ${budgetResp.presenter3}`);
    printBlank();
    print('The award for Best Picture goes to...');
    await sleep(1500);
    print(pictureResult.winnerName, 'bright', 'bold');

    await sleep(2500);
    clearScreen();
    if (oscarsWon > 0) {
        print('Because of the Oscars, your movie will be re-released.');
        print(`The re-release grosses ${formatMoney(reReleaseGross)}`, 'bright');
    } else {
        print('Your movie will not be re-released.', 'dim');
    }
    printBlank();
    await pressAnyKey();

    // ── Phase 7: Summary ──────────────────────────────────────────────────────
    clearScreen();
    printHeading(mTitle);
    print(`Total cost - ${formatMoney(budgetResp.totalCost)}`);
    print(`Total revenue - ${formatMoney(budgetResp.totalGross)}`);
    printSeparator();
    const { text: verdict, profit } = profitLossResult(budgetResp.totalGross, budgetResp.totalCost);
    print(verdict, profit > 0 ? 'green' : profit < 0 ? 'red' : 'bright');
    printBlank();
    await pressAnyKey();

    // ── Phase 8: High Scores ──────────────────────────────────────────────────
    clearScreen();
    const { qualifies, scores } = budgetResp;
    printBlank();
    print(`Your score - ${formatMoney(Math.abs(scores.profit))} ${scores.profit >= 0 ? 'profit' : 'loss'}`, 'bright', 'center');
    print(`${scores.pctReturned}% returned`, 'center');
    printBlank();

    let initials = '';
    if (qualifies) {
        while (!initials) {
            initials = (await readLine('Enter your initials (3 chars)', 3)).trim().toUpperCase();
        }
    }

    print('Please wait...', 'dim');
    const finishResp = await apiPost<FinishApiResponse>('/api/game/finish', { sessionId, initials });
    let data = toHighScoreData(finishResp.leaderboards);

    clearScreen();
    let page: 1 | 2 = 1;
    printHighScorePage(data, page);
    printBlank();

    while (true) {
        print('P)lay Again   V)iew other page   Q)uit', 'dim', 'center');
        const key = (await waitForKey()).toLowerCase();
        if (key === 'p') return true;
        if (key === 'q') return false;
        if (key === 'v') {
            page = page === 1 ? 2 : 1;
            clearScreen();
            printHighScorePage(data, page);
            printBlank();
        }
    }
}

async function runGameApi(): Promise<void> {
    await showTitleScreen();

    while (true) {
        clearScreen();
        print('MOVIE MOGUL', 'bright', 'bold', 'center');
        printBlank();
        print('Written by Anthony Chiang', 'dim', 'center');
        print('Converted to the C-64 by Alan Gardner', 'dim', 'center');
        print('Copyright 1985 Chiang Brothers Software', 'dim', 'center');
        print(`v${__APP_VERSION__}`, 'dim', 'center');
        printBlank();
        print('P)lay   H)elp', 'dim', 'center');
        const key = (await waitForKey()).toLowerCase();
        if (key === 'p') break;
        if (key === 'h') await showHelp();
    }

    while (true) {
        const playAgain = await playOneGameApi();
        if (!playAgain) break;
    }

    clearScreen();
    printBlank();
    print('Thanks for playing Movie Mogul!', 'bright', 'center');
    printBlank();
    print('Copyright 1985 Chiang Brothers Software', 'dim', 'center');
}

// ── Entry point ───────────────────────────────────────────────────────────────

if (import.meta.env.VITE_SCORES_API) {
    runGameApi();
} else {
    runGame();
}
