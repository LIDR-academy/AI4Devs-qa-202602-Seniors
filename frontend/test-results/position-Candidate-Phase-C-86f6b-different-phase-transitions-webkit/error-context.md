# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: position.spec.ts >> Candidate Phase Change >> Drag and drop works across different phase transitions
- Location: tests/e2e/position.spec.ts:409:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="phase-column-prueba-técnica"]').locator('[data-testid="candidate-1595"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="phase-column-prueba-técnica"]').locator('[data-testid="candidate-1595"]')

```

```yaml
- button "Volver a Posiciones"
- heading "Senior Backend Engineer" [level=2]
- text: Aplicado Entrevista
- button "David Wilson"
- text: Prueba Técnica Oferta Contratado Rechazado You have dropped the item. You have moved the item from position 1 to position 1
```

# Test source

```ts
  338 |     const candidates = await dataManager.getCandidates(positionId);
  339 |     const candidateId = candidates[0].candidateId;
  340 |     const phases = await discoverPhaseColumns(page, positionId);
  341 | 
  342 |     expect(phases.length).toBeGreaterThanOrEqual(2);
  343 | 
  344 |     // Intercept the PUT request
  345 |     const putPromise = page.waitForRequest(
  346 |       (request) =>
  347 |         request.method() === 'PUT' && request.url().includes(candidateId)
  348 |     );
  349 | 
  350 |     const candidateCard = page.locator(
  351 |       `[data-testid="candidate-${candidateId}"]`
  352 |     );
  353 |     const targetColumn = phases[1].locator;
  354 |     const targetPhaseId = phases[1].stepId;
  355 | 
  356 |     await dragCandidateCard(page, candidateCard, targetColumn);
  357 | 
  358 |     const request = await putPromise;
  359 |     const postData = request.postDataJSON();
  360 |     expect(postData.currentInterviewStep).toBe(targetPhaseId);
  361 |   });
  362 | 
  363 |   test('Successful backend response (2xx) keeps card in new column', async ({
  364 |     page,
  365 |   }) => {
  366 |     const candidates = await dataManager.getCandidates(positionId);
  367 |     const candidateId = candidates[0].candidateId;
  368 |     const phases = await discoverPhaseColumns(page, positionId);
  369 | 
  370 |     expect(phases.length).toBeGreaterThanOrEqual(2);
  371 | 
  372 |     const candidateCard = page.locator(
  373 |       `[data-testid="candidate-${candidateId}"]`
  374 |     );
  375 |     const targetColumn = phases[1].locator;
  376 | 
  377 |     // Set up listeners for request and response before drag
  378 |     const requestPromise = page.waitForRequest(
  379 |       (request) =>
  380 |         request.method() === 'PUT' && request.url().includes(candidateId)
  381 |     );
  382 | 
  383 |     const responsePromise = page.waitForResponse(
  384 |       (response) =>
  385 |         response.url().includes(candidateId) && response.request().method() === 'PUT'
  386 |     );
  387 | 
  388 |     // Drag and drop
  389 |     await dragCandidateCard(page, candidateCard, targetColumn);
  390 | 
  391 |     // Await and verify the network request
  392 |     const request = await requestPromise;
  393 |     expect(request.method()).toBe('PUT');
  394 | 
  395 |     // Await and verify the network response
  396 |     const response = await responsePromise;
  397 |     expect(response.status()).toBeGreaterThanOrEqual(200);
  398 |     expect(response.status()).toBeLessThan(300);
  399 | 
  400 |     // Wait a bit for the DOM to update
  401 |     await page.waitForTimeout(200);
  402 | 
  403 |     // Verify card remains in new column (UI state)
  404 |     await expect(
  405 |       targetColumn.locator(`[data-testid="candidate-${candidateId}"]`)
  406 |     ).toBeVisible();
  407 |   });
  408 | 
  409 |   test('Drag and drop works across different phase transitions', async ({
  410 |     page,
  411 |   }) => {
  412 |     const candidates = await dataManager.getCandidates(positionId);
  413 |     const candidateId = candidates[0].candidateId;
  414 |     const phases = await discoverPhaseColumns(page, positionId);
  415 | 
  416 |     expect(phases.length).toBeGreaterThanOrEqual(3);
  417 | 
  418 |     // Verify candidate starts in first column
  419 |     const candidateCard = page.locator(
  420 |       `[data-testid="candidate-${candidateId}"]`
  421 |     );
  422 |     await expect(
  423 |       phases[0].locator.locator(`[data-testid="candidate-${candidateId}"]`)
  424 |     ).toBeVisible();
  425 | 
  426 |     // Move through multiple phases (at least 3 transitions)
  427 |     for (let i = 1; i < Math.min(4, phases.length); i++) {
  428 |       const targetColumn = phases[i].locator;
  429 |       const card = page.locator(`[data-testid="candidate-${candidateId}"]`);
  430 | 
  431 |       await dragCandidateCard(page, card, targetColumn);
  432 | 
  433 |       // Wait a bit for the DOM to update
  434 |       await page.waitForTimeout(100);
  435 | 
  436 |       await expect(
  437 |         targetColumn.locator(`[data-testid="candidate-${candidateId}"]`)
> 438 |       ).toBeVisible();
      |         ^ Error: expect(locator).toBeVisible() failed
  439 |     }
  440 |   });
  441 | });
  442 | 
```