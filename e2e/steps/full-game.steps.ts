import { When } from '../fixtures';

When('I play through a complete game', async ({
    titleScreen,
    movieSelectionScreen,
    castingScreen,
    budgetScreen,
    reviewsScreen,
    releaseScreen,
    highScoresScreen,
}) => {
    await titleScreen.advance();
    await movieSelectionScreen.advancePastCredits();
    await movieSelectionScreen.select(1);
    await movieSelectionScreen.advance();
    await castingScreen.castAllRoles();
    await castingScreen.advance();
    await budgetScreen.enter(10000);
    await reviewsScreen.drive();
    await releaseScreen.drive();
    await highScoresScreen.driveFromAwards();
});

When('I play through to the summary screen', async ({
    page,
    titleScreen,
    movieSelectionScreen,
    castingScreen,
    budgetScreen,
    reviewsScreen,
    releaseScreen,
}) => {
    await titleScreen.advance();
    await movieSelectionScreen.advancePastCredits();
    await movieSelectionScreen.select(1);
    await movieSelectionScreen.advance();
    await castingScreen.castAllRoles();
    await castingScreen.advance();
    await budgetScreen.enter(10000);
    await reviewsScreen.drive();
    await releaseScreen.drive();

    // Drive through awards until the summary screen appears
    const deadline = Date.now() + 90_000;
    while (Date.now() < deadline) {
        const text = await page.locator('#output').textContent() ?? '';
        if (text.includes('Total cost') && text.includes('Total revenue')) return;
        if (text.includes('Press any key')) await page.keyboard.press('Space');
        await page.waitForTimeout(400);
    }
    throw new Error('Timed out waiting for summary screen');
});
