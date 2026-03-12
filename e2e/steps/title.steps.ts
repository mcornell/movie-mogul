import { Then } from '../fixtures';

Then('the title screen is visible', async ({ titleScreen }) => {
    await titleScreen.isVisible();
});

Then('the title screen is hidden', async ({ titleScreen }) => {
    await titleScreen.isHidden();
});

Then('the game screen is visible', async ({ titleScreen }) => {
    await titleScreen.gameScreenIsVisible();
});

Then('the game screen is hidden', async ({ titleScreen }) => {
    await titleScreen.gameScreenIsHidden();
});

Then('the title prompt shows {string}', async ({ titleScreen }, text: string) => {
    await titleScreen.promptShows(text);
});
