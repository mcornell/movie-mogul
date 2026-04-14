// Generated from: e2e/features/api-game.feature
import { test } from "../../../e2e/fixtures.ts";

test.describe('API-driven game (global deployment)', () => {

  test.beforeEach('Background', async ({ Given, And, page, titleScreen }, testInfo) => { if (testInfo.error) return;
    await Given('the API endpoints are mocked', null, { page }); 
    await And('I open the game', null, { titleScreen }); 
    await And('I advance past the title screen', null, { titleScreen }); 
  });
  
  test('Pressing Play calls the game start API', async ({ When, Then, And, page, titleScreen }) => { 
    await When('I press "p"', null, { titleScreen }); 
    await Then('the game called the start API', null, { page }); 
    await And('the output contains "You have been sent three scripts"', null, { titleScreen }); 
  });

  test('Movie choices are displayed from the API response', async ({ When, Then, titleScreen }) => { 
    await When('I press "p"', null, { titleScreen }); 
    await Then('the output contains "SWORD AND SORCERY"', null, { titleScreen }); 
  });

  test('Choosing a movie calls the movie API and shows the actor pool', async ({ When, Then, And, titleScreen }) => { 
    await When('I press "p"', null, { titleScreen }); 
    await Then('the output contains "You have been sent three scripts"', null, { titleScreen }); 
    await When('I enter "1"', null, { titleScreen }); 
    await And('I press any key', null, { titleScreen }); 
    await Then('the output contains "John Wayne"', null, { titleScreen }); 
  });

  test('Casting actors calls the cast API and shows the budget prompt', async ({ When, Then, And, titleScreen }) => { 
    await When('I press "p"', null, { titleScreen }); 
    await Then('the output contains "You have been sent three scripts"', null, { titleScreen }); 
    await When('I enter "1"', null, { titleScreen }); 
    await And('I press any key', null, { titleScreen }); 
    await Then('the output contains "Casting Call"', null, { titleScreen }); 
    await When('I enter "1"', null, { titleScreen }); 
    await And('I enter "2"', null, { titleScreen }); 
    await And('I enter "9"', null, { titleScreen }); 
    await Then('the output contains "Total cost of salaries"', null, { titleScreen }); 
  });

  test('Cheat mode is disabled even with ?cheat in the URL', async ({ Given, When, Then, And, page, titleScreen }) => { 
    await Given('I open the game with cheat param', null, { titleScreen }); 
    await And('I advance past the title screen', null, { titleScreen }); 
    await When('I press "p"', null, { titleScreen }); 
    await Then('the output does not contain "CHEAT MODE ACTIVE"', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/api-game.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":12,"pickleLine":13,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Given the API endpoints are mocked","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":10,"keywordType":"Context","textWithKeyword":"And I open the game","isBg":true,"stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":11,"keywordType":"Context","textWithKeyword":"And I advance past the title screen","isBg":true,"stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":14,"keywordType":"Action","textWithKeyword":"When I press \"p\"","stepMatchArguments":[{"group":{"start":8,"value":"\"p\"","children":[{"start":9,"value":"p","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":14,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"Then the game called the start API","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"And the output contains \"You have been sent three scripts\"","stepMatchArguments":[{"group":{"start":20,"value":"\"You have been sent three scripts\"","children":[{"start":21,"value":"You have been sent three scripts","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":18,"pickleLine":18,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Given the API endpoints are mocked","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":10,"keywordType":"Context","textWithKeyword":"And I open the game","isBg":true,"stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":11,"keywordType":"Context","textWithKeyword":"And I advance past the title screen","isBg":true,"stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":19,"keywordType":"Action","textWithKeyword":"When I press \"p\"","stepMatchArguments":[{"group":{"start":8,"value":"\"p\"","children":[{"start":9,"value":"p","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"Then the output contains \"SWORD AND SORCERY\"","stepMatchArguments":[{"group":{"start":20,"value":"\"SWORD AND SORCERY\"","children":[{"start":21,"value":"SWORD AND SORCERY","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":23,"pickleLine":22,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Given the API endpoints are mocked","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":10,"keywordType":"Context","textWithKeyword":"And I open the game","isBg":true,"stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":11,"keywordType":"Context","textWithKeyword":"And I advance past the title screen","isBg":true,"stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"When I press \"p\"","stepMatchArguments":[{"group":{"start":8,"value":"\"p\"","children":[{"start":9,"value":"p","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":25,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"Then the output contains \"You have been sent three scripts\"","stepMatchArguments":[{"group":{"start":20,"value":"\"You have been sent three scripts\"","children":[{"start":21,"value":"You have been sent three scripts","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":26,"gherkinStepLine":25,"keywordType":"Action","textWithKeyword":"When I enter \"1\"","stepMatchArguments":[{"group":{"start":8,"value":"\"1\"","children":[{"start":9,"value":"1","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":27,"gherkinStepLine":26,"keywordType":"Action","textWithKeyword":"And I press any key","stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":27,"keywordType":"Outcome","textWithKeyword":"Then the output contains \"John Wayne\"","stepMatchArguments":[{"group":{"start":20,"value":"\"John Wayne\"","children":[{"start":21,"value":"John Wayne","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":31,"pickleLine":29,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Given the API endpoints are mocked","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":10,"keywordType":"Context","textWithKeyword":"And I open the game","isBg":true,"stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":11,"keywordType":"Context","textWithKeyword":"And I advance past the title screen","isBg":true,"stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":30,"keywordType":"Action","textWithKeyword":"When I press \"p\"","stepMatchArguments":[{"group":{"start":8,"value":"\"p\"","children":[{"start":9,"value":"p","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":33,"gherkinStepLine":31,"keywordType":"Outcome","textWithKeyword":"Then the output contains \"You have been sent three scripts\"","stepMatchArguments":[{"group":{"start":20,"value":"\"You have been sent three scripts\"","children":[{"start":21,"value":"You have been sent three scripts","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":34,"gherkinStepLine":32,"keywordType":"Action","textWithKeyword":"When I enter \"1\"","stepMatchArguments":[{"group":{"start":8,"value":"\"1\"","children":[{"start":9,"value":"1","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":35,"gherkinStepLine":33,"keywordType":"Action","textWithKeyword":"And I press any key","stepMatchArguments":[]},{"pwStepLine":36,"gherkinStepLine":34,"keywordType":"Outcome","textWithKeyword":"Then the output contains \"Casting Call\"","stepMatchArguments":[{"group":{"start":20,"value":"\"Casting Call\"","children":[{"start":21,"value":"Casting Call","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":37,"gherkinStepLine":35,"keywordType":"Action","textWithKeyword":"When I enter \"1\"","stepMatchArguments":[{"group":{"start":8,"value":"\"1\"","children":[{"start":9,"value":"1","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":38,"gherkinStepLine":36,"keywordType":"Action","textWithKeyword":"And I enter \"2\"","stepMatchArguments":[{"group":{"start":8,"value":"\"2\"","children":[{"start":9,"value":"2","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":39,"gherkinStepLine":37,"keywordType":"Action","textWithKeyword":"And I enter \"9\"","stepMatchArguments":[{"group":{"start":8,"value":"\"9\"","children":[{"start":9,"value":"9","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":40,"gherkinStepLine":38,"keywordType":"Outcome","textWithKeyword":"Then the output contains \"Total cost of salaries\"","stepMatchArguments":[{"group":{"start":20,"value":"\"Total cost of salaries\"","children":[{"start":21,"value":"Total cost of salaries","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":43,"pickleLine":40,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Given the API endpoints are mocked","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":10,"keywordType":"Context","textWithKeyword":"And I open the game","isBg":true,"stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":11,"keywordType":"Context","textWithKeyword":"And I advance past the title screen","isBg":true,"stepMatchArguments":[]},{"pwStepLine":44,"gherkinStepLine":41,"keywordType":"Context","textWithKeyword":"Given I open the game with cheat param","stepMatchArguments":[]},{"pwStepLine":45,"gherkinStepLine":42,"keywordType":"Context","textWithKeyword":"And I advance past the title screen","stepMatchArguments":[]},{"pwStepLine":46,"gherkinStepLine":43,"keywordType":"Action","textWithKeyword":"When I press \"p\"","stepMatchArguments":[{"group":{"start":8,"value":"\"p\"","children":[{"start":9,"value":"p","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":47,"gherkinStepLine":44,"keywordType":"Outcome","textWithKeyword":"Then the output does not contain \"CHEAT MODE ACTIVE\"","stepMatchArguments":[{"group":{"start":28,"value":"\"CHEAT MODE ACTIVE\"","children":[{"start":29,"value":"CHEAT MODE ACTIVE","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end