import './styles/main.css';
import { movies } from './data/movies';
import { actors } from './data/actors';
import {
    pickMovieChoices,
    pickActorPool,
    calculatePay,
    calculateQualityScore,
    simulateRelease,
} from './game/gameEngine';
import { initialGameState } from './game/gameState';
import type { GameState } from './game/gameState';
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

    // Production overrun event (simplified — full events in a later phase)
    const roll = Math.random() * 100;
    let overrun = 0;
    if (roll < 3)        { print('The production went 30% over budget.', 'red');  overrun = Math.trunc(budget * 0.30); }
    else if (roll < 7)   { print('The production went 20% over budget.', 'red');  overrun = Math.trunc(budget * 0.20); }
    else if (roll < 15)  { print('The production went 10% over budget.', 'red');  overrun = Math.trunc(budget * 0.10); }
    else if (roll < 30)  { print('The production went 2% over budget.');           overrun = Math.trunc(budget * 0.02); }
    else                 { print('The movie comes in on budget.', 'green'); }

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
        const roll = Math.trunc(Math.random() * 10) + 1;
        let verdict: string;
        if (roll >= 9)      { verdict = 'loved it!';        state.reviewScore += 2; }
        else if (roll >= 6) { verdict = 'liked it.';        state.reviewScore += 1; }
        else if (roll >= 3) { verdict = "didn't like it.";  state.reviewScore -= 1; }
        else                { verdict = 'hated it!';        state.reviewScore -= 3; }

        await printSlow(`${reviewer} ${verdict}`);
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
    print(`"${movie.title}" starring ${names.join(', ')} has been pulled from theaters after ${weeklyGross.length} weeks.`);
    printBlank();
    print(`Subtotal: ${formatMoney(totalGross)}`);
    await pressAnyKey();
}

async function phaseSummary(state: GameState): Promise<void> {
    const profit = state.totalGross - state.totalCost;
    printHeading(state.selectedMovie!.title);
    print(`Total cost:    ${formatMoney(state.totalCost)}`);
    print(`Total revenue: ${formatMoney(state.totalGross)}`);
    printSeparator();
    if (profit > 0)      print(`You made a profit of ${formatMoney(profit)}`, 'green');
    else if (profit < 0) print(`You lost ${formatMoney(Math.abs(profit))}`, 'red');
    else                 print('You came out even!');
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
    await phaseSummary(state);

    printBlank();
    print('Play again? Press any key to restart.', 'dim', 'center');
    await waitForKey();
    window.location.reload();
}

runGame();
