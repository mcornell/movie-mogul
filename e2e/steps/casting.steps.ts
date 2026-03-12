import { When, Then } from '../fixtures';

When('I cast the first available actor for the current role', async ({ castingScreen, castingState }) => {
    castingState.lastCastActorNum = await castingScreen.castFirstAvailableActor();
});

When('I try to cast that same actor again', async ({ castingScreen, castingState }) => {
    await castingScreen.typeAndEnter(String(castingState.lastCastActorNum));
});

When('I cast all roles', async ({ castingScreen }) => {
    await castingScreen.castAllRoles();
});

Then('the output shows a profit or loss result', async ({ summaryScreen }) => {
    await summaryScreen.outputShowsProfitOrLoss();
});
