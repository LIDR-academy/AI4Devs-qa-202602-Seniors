// Generated from: features/candidate-phase-change.feature
import { test } from "playwright-bdd";

test.describe('Candidate moves between interview phases', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('the recruiter navigates to the position page', null, { page }); 
  });
  
  test('Candidate card moves to a new phase column', async ({ When, Then, And, page }) => { 
    await When('the recruiter drags a candidate to a different phase column', null, { page }); 
    await Then('the candidate card should appear in the destination column', null, { page }); 
    await And('the candidate card should no longer be in the source column', null, { page }); 
  });

  test('Phase change triggers a PUT request with correct data', async ({ When, Then, And, page }) => { 
    await When('the recruiter drags a candidate to a different phase column', null, { page }); 
    await Then('a PUT request should be sent to the candidates endpoint'); 
    await And('the request body should contain the new interview step'); 
    await And('the request body should contain the application id'); 
  });

  test('Backend confirms the phase change', async ({ When, Then, page }) => { 
    await When('the recruiter drags a candidate to a different phase column', null, { page }); 
    await Then('the backend should respond with a successful status'); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('features/candidate-phase-change.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":6,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given the recruiter navigates to the position page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":7,"keywordType":"Action","textWithKeyword":"When the recruiter drags a candidate to a different phase column","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"Then the candidate card should appear in the destination column","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"And the candidate card should no longer be in the source column","stepMatchArguments":[]}]},
  {"pwTestLine":16,"pickleLine":11,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given the recruiter navigates to the position page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"When the recruiter drags a candidate to a different phase column","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"Then a PUT request should be sent to the candidates endpoint","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"And the request body should contain the new interview step","stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"And the request body should contain the application id","stepMatchArguments":[]}]},
  {"pwTestLine":23,"pickleLine":17,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given the recruiter navigates to the position page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":18,"keywordType":"Action","textWithKeyword":"When the recruiter drags a candidate to a different phase column","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"Then the backend should respond with a successful status","stepMatchArguments":[]}]},
]; // bdd-data-end