// Generated from: tests/features/positions.feature
import { test } from "playwright-bdd";

test.describe('Position Board Kanban Management', () => {

  test.beforeEach('Background', async ({ Given, And, page }, testInfo) => { if (testInfo.error) return;
    await Given('I navigate to the positions page', null, { page }); 
    await And('the position board has loaded with all interview stages', null, { page }); 
  });
  
  test('Position board loads correctly with all stages and candidates', { tag: ['@happy'] }, async ({ Then, And, page }) => { 
    await Then('I see the position title is displayed', null, { page }); 
    await And('all interview stages are rendered as columns', null, { page }); 
    await And('each candidate appears in the column matching their current interview stage', null, { page }); 
  });

  test('A candidate is moved to the next interview stage', { tag: ['@happy'] }, async ({ When, Then, And, page }) => { 
    await When('I move the candidate from "Applied" to "Interview"', null, { page }); 
    await Then('the candidate appears in the "Interview" column', null, { page }); 
    await And('a PUT request was made to update the candidate stage'); 
    await And('the request body contains the correct applicationId and currentInterviewStep'); 
    await And('the backend responds with a 2xx status'); 
  });

  test('Backend fails to update candidate stage', { tag: ['@sad'] }, async ({ When, Then, And, page }) => { 
    await When('I attempt to move a candidate to a new stage', null, { page }); 
    await And('the backend returns a 500 error'); 
    await Then('the candidate remains in their original stage', null, { page }); 
    await And('an error message is displayed to the user', null, { page }); 
  });

  test('Reordering candidate within the same interview stage', { tag: ['@edge'] }, async ({ When, Then, And, page }) => { 
    await When('I reorder a candidate within the same "Interview" stage', null, { page }); 
    await Then('no PUT request is made to the backend'); 
    await And('the candidate\'s position in the column is updated', null, { page }); 
  });

  test('Empty interview stages render as drop targets', { tag: ['@edge'] }, async ({ Then, And, page }) => { 
    await Then('I see the "Offer" stage column is displayed', null, { page }); 
    await And('the "Offer" column has no candidates', null, { page }); 
    await And('the "Offer" column is a valid drop target for drag-and-drop', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/features/positions.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":11,"pickleLine":8,"tags":["@happy"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I navigate to the positions page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"And the position board has loaded with all interview stages","isBg":true,"stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"Then I see the position title is displayed","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"And all interview stages are rendered as columns","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"And each candidate appears in the column matching their current interview stage","stepMatchArguments":[]}]},
  {"pwTestLine":17,"pickleLine":14,"tags":["@happy"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I navigate to the positions page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"And the position board has loaded with all interview stages","isBg":true,"stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"When I move the candidate from \"Applied\" to \"Interview\"","stepMatchArguments":[{"group":{"start":26,"value":"\"Applied\"","children":[{"start":27,"value":"Applied","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"},{"group":{"start":39,"value":"\"Interview\"","children":[{"start":40,"value":"Interview","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":19,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Then the candidate appears in the \"Interview\" column","stepMatchArguments":[{"group":{"start":29,"value":"\"Interview\"","children":[{"start":30,"value":"Interview","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And a PUT request was made to update the candidate stage","stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"And the request body contains the correct applicationId and currentInterviewStep","stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"And the backend responds with a 2xx status","stepMatchArguments":[]}]},
  {"pwTestLine":25,"pickleLine":22,"tags":["@sad"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I navigate to the positions page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"And the position board has loaded with all interview stages","isBg":true,"stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"When I attempt to move a candidate to a new stage","stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":24,"keywordType":"Action","textWithKeyword":"And the backend returns a 500 error","stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"Then the candidate remains in their original stage","stepMatchArguments":[]},{"pwStepLine":29,"gherkinStepLine":26,"keywordType":"Outcome","textWithKeyword":"And an error message is displayed to the user","stepMatchArguments":[]}]},
  {"pwTestLine":32,"pickleLine":29,"tags":["@edge"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I navigate to the positions page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"And the position board has loaded with all interview stages","isBg":true,"stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":30,"keywordType":"Action","textWithKeyword":"When I reorder a candidate within the same \"Interview\" stage","stepMatchArguments":[{"group":{"start":38,"value":"\"Interview\"","children":[{"start":39,"value":"Interview","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":34,"gherkinStepLine":31,"keywordType":"Outcome","textWithKeyword":"Then no PUT request is made to the backend","stepMatchArguments":[]},{"pwStepLine":35,"gherkinStepLine":32,"keywordType":"Outcome","textWithKeyword":"And the candidate's position in the column is updated","stepMatchArguments":[]}]},
  {"pwTestLine":38,"pickleLine":35,"tags":["@edge"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I navigate to the positions page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"And the position board has loaded with all interview stages","isBg":true,"stepMatchArguments":[]},{"pwStepLine":39,"gherkinStepLine":36,"keywordType":"Outcome","textWithKeyword":"Then I see the \"Offer\" stage column is displayed","stepMatchArguments":[{"group":{"start":10,"value":"\"Offer\"","children":[{"start":11,"value":"Offer","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":40,"gherkinStepLine":37,"keywordType":"Outcome","textWithKeyword":"And the \"Offer\" column has no candidates","stepMatchArguments":[{"group":{"start":4,"value":"\"Offer\"","children":[{"start":5,"value":"Offer","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":41,"gherkinStepLine":38,"keywordType":"Outcome","textWithKeyword":"And the \"Offer\" column is a valid drop target for drag-and-drop","stepMatchArguments":[{"group":{"start":4,"value":"\"Offer\"","children":[{"start":5,"value":"Offer","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end