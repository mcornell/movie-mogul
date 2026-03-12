import { test as base, createBdd } from 'playwright-bdd';
import { TitleScreen }          from './pages/TitleScreen';
import { MovieSelectionScreen } from './pages/MovieSelectionScreen';
import { CastingScreen }        from './pages/CastingScreen';
import { BudgetScreen }         from './pages/BudgetScreen';
import { ReviewsScreen }        from './pages/ReviewsScreen';
import { ReleaseScreen }        from './pages/ReleaseScreen';
import { SummaryScreen }        from './pages/SummaryScreen';
import { HighScoresScreen }     from './pages/HighScoresScreen';

type Fixtures = {
    titleScreen:          TitleScreen;
    movieSelectionScreen: MovieSelectionScreen;
    castingScreen:        CastingScreen;
    budgetScreen:         BudgetScreen;
    reviewsScreen:        ReviewsScreen;
    releaseScreen:        ReleaseScreen;
    summaryScreen:        SummaryScreen;
    highScoresScreen:     HighScoresScreen;
    /** Mutable per-test casting state (avoids module-level variables). */
    castingState:         { lastCastActorNum: number };
};

export const test = base.extend<Fixtures>({
    titleScreen:          async ({ page }, use) => use(new TitleScreen(page)),
    movieSelectionScreen: async ({ page }, use) => use(new MovieSelectionScreen(page)),
    castingScreen:        async ({ page }, use) => use(new CastingScreen(page)),
    budgetScreen:         async ({ page }, use) => use(new BudgetScreen(page)),
    reviewsScreen:        async ({ page }, use) => use(new ReviewsScreen(page)),
    releaseScreen:        async ({ page }, use) => use(new ReleaseScreen(page)),
    summaryScreen:        async ({ page }, use) => use(new SummaryScreen(page)),
    highScoresScreen:     async ({ page }, use) => use(new HighScoresScreen(page)),
    castingState:         async ({}, use) => use({ lastCastActorNum: -1 }),
});

export const { Given, When, Then } = createBdd(test);
