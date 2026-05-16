// Generated from: tests/features/positions.feature
import { test } from "playwright-bdd";

test.describe('Position Board - Candidate Progression through Interview Stages', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('a position board with existing candidates and interview stages', null, { page }); 
  });
  
  test('Position board loads with all stages and candidates', { tag: ['@happy'] }, async ({ When, Then, And, page }) => { 
    await When('the recruiter views the position board', null, { page }); 
    await Then('the position title is displayed', null, { page }); 
    await And('all interview stages appear as columns', null, { page }); 
    await And('each candidate is shown in the column for its current interview stage', null, { page }); 
  });

  test('A candidate is moved to the next interview stage', { tag: ['@happy'] }, async ({ When, Then, And, page }) => { 
    await When('the recruiter moves a candidate to the next stage', null, { page }); 
    await Then('the candidate visually appears in the new stage column', null, { page }); 
    await And('a PUT request updates the candidate with applicationId and currentInterviewStep'); 
    await And('the backend responds with status 200'); 
  });

  test('Backend failure prevents stage change', { tag: ['@sad'] }, async ({ When, Then, And, page }) => { 
    await When('the recruiter attempts to move a candidate with backend error', null, { page }); 
    await Then('the candidate reverts to its original stage', null, { page }); 
    await And('an error message is displayed', null, { page }); 
  });

  test('Reordering candidate within the same stage', { tag: ['@edge'] }, async ({ When, Then, And, page }) => { 
    await When('the recruiter reorders a candidate within its current stage', null, { page }); 
    await Then('no PUT request is sent'); 
    await And('the candidate remains in the same stage', null, { page }); 
  });

  test('Empty interview stage renders as a drop target', { tag: ['@edge'] }, async ({ When, Then, And, page }) => { 
    await When('the recruiter views the position board', null, { page }); 
    await Then('stages with no candidates still appear as columns', null, { page }); 
    await And('these empty columns accept drag-and-drop actions', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/features/positions.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":7,"tags":["@happy"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given a position board with existing candidates and interview stages","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"When the recruiter views the position board","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"Then the position title is displayed","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"And all interview stages appear as columns","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"And each candidate is shown in the column for its current interview stage","stepMatchArguments":[]}]},
  {"pwTestLine":17,"pickleLine":14,"tags":["@happy"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given a position board with existing candidates and interview stages","isBg":true,"stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"When the recruiter moves a candidate to the next stage","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Then the candidate visually appears in the new stage column","stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And a PUT request updates the candidate with applicationId and currentInterviewStep","stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"And the backend responds with status 200","stepMatchArguments":[{"group":{"start":33,"value":"200","children":[]},"parameterTypeName":"int"}]}]},
  {"pwTestLine":24,"pickleLine":21,"tags":["@sad"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given a position board with existing candidates and interview stages","isBg":true,"stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":22,"keywordType":"Action","textWithKeyword":"When the recruiter attempts to move a candidate with backend error","stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":23,"keywordType":"Outcome","textWithKeyword":"Then the candidate reverts to its original stage","stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"And an error message is displayed","stepMatchArguments":[]}]},
  {"pwTestLine":30,"pickleLine":27,"tags":["@edge"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given a position board with existing candidates and interview stages","isBg":true,"stepMatchArguments":[]},{"pwStepLine":31,"gherkinStepLine":28,"keywordType":"Action","textWithKeyword":"When the recruiter reorders a candidate within its current stage","stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":29,"keywordType":"Outcome","textWithKeyword":"Then no PUT request is sent","stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":30,"keywordType":"Outcome","textWithKeyword":"And the candidate remains in the same stage","stepMatchArguments":[]}]},
  {"pwTestLine":36,"pickleLine":33,"tags":["@edge"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given a position board with existing candidates and interview stages","isBg":true,"stepMatchArguments":[]},{"pwStepLine":37,"gherkinStepLine":34,"keywordType":"Action","textWithKeyword":"When the recruiter views the position board","stepMatchArguments":[]},{"pwStepLine":38,"gherkinStepLine":35,"keywordType":"Outcome","textWithKeyword":"Then stages with no candidates still appear as columns","stepMatchArguments":[]},{"pwStepLine":39,"gherkinStepLine":36,"keywordType":"Outcome","textWithKeyword":"And these empty columns accept drag-and-drop actions","stepMatchArguments":[]}]},
]; // bdd-data-end