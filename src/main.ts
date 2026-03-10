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
import { reviewVerdict, budgetOverrun, pullFromTheatersLine, profitLossResult } from './game/phaseHelpers';
import {
    print,
    printBlank,
    printSeparator,
    printSlow,
    printHeading,
    waitForKey,
    readLine,
    pressAnyKey,
    formatMoney,
} from './ui/renderer';

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
    state.movieChoices = pickMovieChoices(movies, Math.random);
    state.phase = 'movie-selection';

    print('You have been sent three scripts.', 'bright');
    printBlank();

    for (let i = 0; i < 3; i++) {
        const movie = state.movieChoices[i];
        print(`${i + 1})  ${movie.title}`, 'bright');
        print(`    ${movie.descriptionLines.join(' ')}`);
        print(`    *roles==> ${movie.roles[0].name}`);
        print(`              ${movie.roles[1].name}`);
        print(`              ${movie.roles[2].name}`);
        printBlank();
    }

    let choice = 0;
    while (choice < 1 || choice > 3) {
        const input = await readLine('Which do you want to produce (1-3)?');
        choice = parseInt(input, 10);
    }

    state.selectedMovie = state.movieChoices[choice - 1];
    print(state.selectedMovie.title, 'bright', 'center');
}

async function phaseCasting(state: GameState): Promise<void> {
    const movie = state.selectedMovie!;
    state.phase = 'casting';

    printHeading(`Casting Call for "${movie.title}"`);
    print('Please wait...', 'dim');

    state.actorPool = pickActorPool(actors, Math.random);
    state.actorPays = state.actorPool.map(a => calculatePay(a, Math.random));

    printBlank();
    print('      NAME                      PAY', 'bright');
    printBlank();

    state.actorPool.forEach((actor, i) => {
        const num = String(i + 1).padStart(2);
        const pay = formatMoney(state.actorPays[i]);
        print(`${num}) ${actor.name.padEnd(24)} ${pay}`);
    });

    printBlank();

    const pickedPoolIndices: number[] = [];

    for (let roleIdx = 0 as 0 | 1 | 2; roleIdx < 3; roleIdx++) {
        const role = movie.roles[roleIdx];
        let poolIdx = -1;

        while (poolIdx === -1) {
            const input = await readLine(`Who will you cast as the ${role.name}?`);
            const n = parseInt(input, 10);
            if (n < 1 || n > 12 || pickedPoolIndices.includes(n - 1)) {
                print('Invalid selection.', 'red');
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

        // Reconstruct full name for Schwarzenegger
        const displayName = actor.name === 'Schwarzenegger' ? 'Arnold Schwarzenegger' : actor.name;
        print(`${role.name}: ${displayName}`, 'bright');

        state.cast.push({ roleIndex: roleIdx, actor, pay: state.actorPays[poolIdx] });
    }

    state.salaryCost = state.cast.reduce((sum, cr) => sum + cr.pay, 0);
    printBlank();
    print(`Total cost of salaries: ${formatMoney(state.salaryCost)}`);
}

async function phaseBudget(state: GameState): Promise<void> {
    const movie = state.selectedMovie!;
    state.phase = 'budget';

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

    const { text: overrunText, overrun } = budgetOverrun(budget, Math.trunc(Math.random() * 100));
    print(overrunText, overrun > 0 ? 'red' : 'green');

    state.productionBudget = budget + overrun;
    state.totalCost = state.salaryCost + state.productionBudget;
    printBlank();
    print(`Total cost: ${formatMoney(state.totalCost)}`);
    await pressAnyKey();

    // Store effective budget for quality score
    state.productionBudget = effectiveBudget + overrun;
}

async function phaseReviews(state: GameState): Promise<void> {
    state.phase = 'reviews';
    state.reviewScore = 3; // BASIC line 180

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
        await printSlow(`${reviewer} ${text}`);
    }

    printBlank();
    await pressAnyKey();
}

async function phaseRelease(state: GameState): Promise<void> {
    const movie = state.selectedMovie!;
    state.phase = 'release';

    printHeading(`MAJOR STUDIO SNEAK PREVIEW of "${movie.title}"`);
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
        print(`WEEK ${wk + 1}`, 'bright', 'center');
        print(`Weekly gross  - ${formatMoney(weeklyGross[wk])}`);
        const running = weeklyGross.slice(0, wk + 1).reduce((a, b) => a + b, 0);
        print(`Total gross   - ${formatMoney(running)}`);
        await pressAnyKey();
    }

    const names = state.cast.map(cr =>
        cr.actor.name === 'Schwarzenegger' ? 'Arnold Schwarzenegger' : cr.actor.name
    );
    print(pullFromTheatersLine(movie.title, names, weeklyGross.length));
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
    state.phase = 'awards';

    // C64 lines 2315–2318: invitation screen
    printBlank();
    print('The Academy of Motion Pictures', 'center');
    print('invites you to attend its annual', 'center');
    print('Academy Awards ceremony.', 'bright', 'bold', 'center');
    printBlank();
    await pressAnyKey();

    // C64 line 2340
    print('Welcome to the annual Academy');
    print('Awards presentation.');
    printBlank();

    const movie = state.selectedMovie!;
    let w = 0;

    // ── Best Actress (C64 lines 2350–2361) ───────────────────────────────────
    print(`Here to present the first award is ${pickPresenter(state.cast)}`);
    printBlank();
    print('The winner of the Oscar for Best');
    print('Actress is ');
    await pressAnyKey();

    const actressResult = checkOscarActress(movie, state.cast, actors, Math.random);
    print(actressResult.winnerName, 'bright', 'bold');
    if (actressResult.isPlayerWin) {
        state.oscarsWon++;
        w += actressResult.weight;
    }
    printBlank();
    await pressAnyKey();

    // ── Best Actor (C64 lines 2370–2381) ─────────────────────────────────────
    print(`Here to present the next Oscar is ${pickPresenter(state.cast)}`);
    printBlank();
    print('The winner of the Oscar for Best');
    print('Actor is ');
    await pressAnyKey();

    const actorResult = checkOscarActor(movie, state.cast, actors, Math.random);
    print(actorResult.winnerName, 'bright', 'bold');
    if (actorResult.isPlayerWin) {
        state.oscarsWon++;
        w += actorResult.weight;
    }
    printBlank();
    await pressAnyKey();

    // ── Best Picture (C64 lines 2390–2401) ───────────────────────────────────
    print(`Here to award the final oscar is ${pickPresenter(state.cast)}`);
    printBlank();
    print('The award for Best Picture goes to');
    await pressAnyKey();

    const pictureResult = checkBestPicture(movie, state.cast, movies, Math.random);
    print(pictureResult.winnerName, 'bright', 'bold');
    if (pictureResult.isPlayerWin) {
        state.oscarsWon++;
        w += pictureResult.weight;
    }
    printBlank();
    await pressAnyKey();

    // ── Re-release (C64 lines 2420–2510) ─────────────────────────────────────
    if (w > 0) {
        print('Because of the Oscars, your movie');
        print('will be re-released.');
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

async function runGame(): Promise<void> {
    const state = initialGameState();

    await showTitleScreen();

    print('MOVIE MOGUL', 'bright', 'bold', 'center');
    printBlank();
    print('Written by Anthony Chiang', 'dim', 'center');
    print('Converted to the C-64 by Alan Gardner', 'dim', 'center');
    print('Copyright 1985 Chiang Brothers Software', 'dim', 'center');
    printBlank();
    await pressAnyKey();

    await phaseMovieSelection(state);
    await pressAnyKey();
    await phaseCasting(state);
    await pressAnyKey();
    await phaseBudget(state);
    await phaseReviews(state);
    await phaseRelease(state);
    await phaseAwards(state);
    await phaseSummary(state);

    printBlank();
    print('Play again? Press any key to restart.', 'dim', 'center');
    await waitForKey();
    window.location.reload();
}

runGame();
