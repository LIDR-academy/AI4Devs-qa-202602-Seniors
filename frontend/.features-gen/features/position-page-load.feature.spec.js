// Generated from: features/position-page-load.feature
import { test } from "playwright-bdd";

test.describe('Position page displays correctly', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('the recruiter navigates to the position page', null, { page }); 
  });
  
  test('Position title is visible', async ({ Then, page }) => { 
    await Then('the position title should be displayed', null, { page }); 
  });

  test('All interview phase columns are displayed', async ({ Then, And, page }) => { 
    await Then('all phase columns should be visible', null, { page }); 
    await And('each column should display its phase name', null, { page }); 
  });

  test('Candidate cards appear in their correct phase column', async ({ Then, And, page }) => { 
    await Then('each candidate card should be inside its corresponding phase column', null, { page }); 
    await And('each candidate card should display the candidate name', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('features/position-page-load.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":6,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given the recruiter navigates to the position page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then the position title should be displayed","stepMatchArguments":[]}]},
  {"pwTestLine":14,"pickleLine":9,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given the recruiter navigates to the position page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then all phase columns should be visible","stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"And each column should display its phase name","stepMatchArguments":[]}]},
  {"pwTestLine":19,"pickleLine":13,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given the recruiter navigates to the position page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"Then each candidate card should be inside its corresponding phase column","stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"And each candidate card should display the candidate name","stepMatchArguments":[]}]},
]; // bdd-data-end