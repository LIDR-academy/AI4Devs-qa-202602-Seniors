// Generated from: features/smoke.feature
import { test } from "playwright-bdd";

test.describe('Application smoke test', () => {

  test('Application loads successfully', async ({ Given, Then, page }) => { 
    await Given('the application is running', null, { page }); 
    await Then('the page title should be visible', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('features/smoke.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":3,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given the application is running","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":5,"keywordType":"Outcome","textWithKeyword":"Then the page title should be visible","stepMatchArguments":[]}]},
]; // bdd-data-end