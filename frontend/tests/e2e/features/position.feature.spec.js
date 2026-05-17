// Generated from: features\position.feature
import { test } from "playwright-bdd";

test.describe('Tablero Kanban de gestión de candidatos por fase de entrevista', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('el reclutador accede al tablero de la posición "Senior Full-Stack Engineer"', null, { page }); 
  });
  
  test('Carga correcta del tablero Kanban con fases y candidatos', async ({ Then, And, page }) => { 
    await Then('el título de la posición es visible en la página', null, { page }); 
    await And('todas las fases del proceso de selección están representadas como columnas', null, { page }); 
    await And('cada candidato aparece en la columna correspondiente a su fase actual', null, { page }); 
  });

  test('Mover un candidato a la siguiente fase del proceso', async ({ Given, When, Then, And, page }) => { 
    await Given('el candidato "Carlos García" se encuentra en la fase "Initial Screening"', null, { page }); 
    await When('el reclutador mueve al candidato "Carlos García" a la fase "Technical Interview"', null, { page }); 
    await Then('el candidato "Carlos García" aparece en la columna "Technical Interview"', null, { page }); 
    await And('el sistema registra el cambio de fase del candidato en el backend'); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('features\\position.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":10,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given el reclutador accede al tablero de la posición \"Senior Full-Stack Engineer\"","isBg":true,"stepMatchArguments":[{"group":{"start":47,"value":"\"Senior Full-Stack Engineer\"","children":[{"start":48,"value":"Senior Full-Stack Engineer","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":11,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"Then el título de la posición es visible en la página","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"And todas las fases del proceso de selección están representadas como columnas","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"And cada candidato aparece en la columna correspondiente a su fase actual","stepMatchArguments":[]}]},
  {"pwTestLine":16,"pickleLine":15,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given el reclutador accede al tablero de la posición \"Senior Full-Stack Engineer\"","isBg":true,"stepMatchArguments":[{"group":{"start":47,"value":"\"Senior Full-Stack Engineer\"","children":[{"start":48,"value":"Senior Full-Stack Engineer","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":17,"gherkinStepLine":16,"keywordType":"Context","textWithKeyword":"Given el candidato \"Carlos García\" se encuentra en la fase \"Initial Screening\"","stepMatchArguments":[{"group":{"start":13,"value":"\"Carlos García\"","children":[{"start":14,"value":"Carlos García","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"},{"group":{"start":53,"value":"\"Initial Screening\"","children":[{"start":54,"value":"Initial Screening","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":18,"gherkinStepLine":17,"keywordType":"Action","textWithKeyword":"When el reclutador mueve al candidato \"Carlos García\" a la fase \"Technical Interview\"","stepMatchArguments":[{"group":{"start":33,"value":"\"Carlos García\"","children":[{"start":34,"value":"Carlos García","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"},{"group":{"start":59,"value":"\"Technical Interview\"","children":[{"start":60,"value":"Technical Interview","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":19,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"Then el candidato \"Carlos García\" aparece en la columna \"Technical Interview\"","stepMatchArguments":[{"group":{"start":13,"value":"\"Carlos García\"","children":[{"start":14,"value":"Carlos García","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"},{"group":{"start":51,"value":"\"Technical Interview\"","children":[{"start":52,"value":"Technical Interview","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"And el sistema registra el cambio de fase del candidato en el backend","stepMatchArguments":[]}]},
]; // bdd-data-end