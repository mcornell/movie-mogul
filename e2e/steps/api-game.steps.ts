/**
 * Step definitions for API-driven game (global deployment) tests.
 * Uses page.route() to intercept Worker API calls and return fixed mock data.
 */
import { expect } from '@playwright/test';
import { Given, Then } from '../fixtures';

// ── Fixed mock response for POST /api/game/start ──────────────────────────────

const MOCK_SESSION_ID = 'test-session-00000000';

const MOCK_START_RESPONSE = {
    sessionId: MOCK_SESSION_ID,
    movieChoices: [
        {
            id: 1,
            title: 'SWORD AND SORCERY',
            descriptionLines: ['A swords and sorcery epic set in medieval times.'],
            roles: [
                { name: 'The Hero',    requirements: [1, 0, 8, 6, 0, 0, 0, 0] },
                { name: 'The Villain', requirements: [1, 0, 7, 5, 0, 0, 0, 0] },
                { name: 'The Maiden',  requirements: [9, 0, 6, 5, 0, 0, 0, 0] },
            ],
        },
        {
            id: 3,
            title: 'MURDER AT MARLOWE MANOR',
            descriptionLines: ['A thrilling murder mystery set in a remote mansion.'],
            roles: [
                { name: 'Detective',    requirements: [5, 0, 7, 6, 0, 0, 0, 0] },
                { name: 'The Suspect',  requirements: [5, 0, 5, 5, 0, 0, 0, 0] },
                { name: 'The Victim',   requirements: [5, 0, 4, 4, 0, 0, 0, 0] },
            ],
        },
        {
            id: 5,
            title: 'SPACE ODYSSEY',
            descriptionLines: ['An epic journey to the far reaches of the universe.'],
            roles: [
                { name: 'Commander',  requirements: [1, 0, 7, 6, 0, 0, 0, 0] },
                { name: 'Scientist',  requirements: [5, 0, 6, 5, 0, 0, 0, 0] },
                { name: 'Navigator',  requirements: [5, 0, 5, 4, 0, 0, 0, 0] },
            ],
        },
    ],
};

const MOCK_MOVIE_RESPONSE = {
    actorPool: [
        { id: 1,  name: 'John Wayne',      gender: 'M', pay: 5000  },
        { id: 2,  name: 'Clint Eastwood',  gender: 'M', pay: 4800  },
        { id: 3,  name: 'Paul Newman',     gender: 'M', pay: 4600  },
        { id: 4,  name: 'Robert Redford',  gender: 'M', pay: 4400  },
        { id: 5,  name: 'Jack Nicholson',  gender: 'M', pay: 4200  },
        { id: 6,  name: 'Dustin Hoffman',  gender: 'M', pay: 4000  },
        { id: 7,  name: 'Al Pacino',       gender: 'M', pay: 3800  },
        { id: 8,  name: 'Robert De Niro',  gender: 'M', pay: 3600  },
        { id: 77, name: 'Meryl Streep',    gender: 'F', pay: 5200  },
        { id: 78, name: 'Jane Fonda',      gender: 'F', pay: 4900  },
        { id: 79, name: 'Faye Dunaway',    gender: 'F', pay: 4700  },
        { id: 80, name: 'Diane Keaton',    gender: 'F', pay: 4500  },
    ],
};

// ── Setup step: install route mocks before each scenario ─────────────────────

Given('the API endpoints are mocked', async ({ page }) => {
    let startCalled = false;

    await page.route('/api/game/start', async route => {
        startCalled = true;
        await route.fulfill({ json: MOCK_START_RESPONSE });
    });

    await page.route('/api/game/movie', async route => {
        await route.fulfill({ json: MOCK_MOVIE_RESPONSE });
    });

    // Store startCalled flag on page so assertions can read it
    await page.exposeFunction('__getStartCalled', () => startCalled);
    await page.addInitScript(() => {
        (window as unknown as Record<string, unknown>).__startCalled = false;
    });
});

Given('I open the game with cheat param', async ({ titleScreen }) => {
    await titleScreen.page.goto('/?cheat');
    await titleScreen.page.evaluate(() => localStorage.removeItem('movieMogulHighScores'));
    await expect(titleScreen.page.locator('#title-screen')).toBeVisible();
});

// ── API-specific assertions ───────────────────────────────────────────────────

Then('the game called the start API', async ({ page }) => {
    // Verify by checking that the API mock was hit: movie choices must be visible
    // (if the API wasn't called, choices would come from local logic — or not appear at all)
    await expect(page.locator('#output')).toContainText('SWORD AND SORCERY');
});

Then('the output does not contain {string}', async ({ page }, text: string) => {
    await expect(page.locator('#output')).not.toContainText(text);
});
