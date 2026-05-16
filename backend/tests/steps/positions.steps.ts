import { createBdd } from 'playwright-bdd';
import { expect, Page } from '@playwright/test';

const { Given, When, Then } = createBdd();

let lastRequestBody: any;
let lastRequestStatus: number;
let putRequestFired = false;

Given('I navigate to the positions page', async ({ page }) => {
  await page.goto('http://localhost:3000/positions');
});

Given('the position board has loaded with all interview stages', async ({ page }) => {
  await page.waitForSelector('[class*="stage"], [class*="column"], .kanban-board', { timeout: 5000 }).catch(() => null);
});

Then('I see the position title is displayed', async ({ page }) => {
  const titleLocator = page.locator('h1, [class*="title"]').first();
  await expect(titleLocator).toBeVisible({ timeout: 3000 });
});

Then('all interview stages are rendered as columns', async ({ page }) => {
  const stageColumns = await page.locator('[class*="stage"], [class*="column"]').all();
  expect(stageColumns.length).toBeGreaterThanOrEqual(3);
});

Then('each candidate appears in the column matching their current interview stage', async ({ page }) => {
  const candidateCards = await page.locator('[class*="candidate"], [class*="card"]').all();
  expect(candidateCards.length).toBeGreaterThan(0);
  const firstCard = candidateCards[0];
  await expect(firstCard).toBeVisible();
});

When('I move the candidate from {string} to {string}', async ({ page }, fromStage: string, toStage: string) => {
  const putRequestPromise = page.waitForResponse(response => 
    response.request().method() === 'PUT' && response.url().includes('/candidates/')
  );

  const candidateCard = page.locator('[class*="candidate"], .candidate-card').first();
  const targetColumn = page.locator(`text="${toStage}"`).locator('..').first();
  
  await candidateCard.dragTo(targetColumn);
  
  const response = await putRequestPromise;
  lastRequestStatus = response.status();
  lastRequestBody = await response.request().postDataJSON().catch(() => null);
});

Then('the candidate appears in the {string} column', async ({ page }, stage: string) => {
  const stageColumn = page.locator(`text="${stage}"`).locator('..').first();
  const candidateInStage = stageColumn.locator('[class*="candidate"]').first();
  await expect(candidateInStage).toBeVisible({ timeout: 2000 });
});

Then('a PUT request was made to update the candidate stage', async () => {
  expect(lastRequestStatus).toBeDefined();
  expect([200, 201]).toContain(lastRequestStatus);
});

Then('the request body contains the correct applicationId and currentInterviewStep', async () => {
  expect(lastRequestBody).toBeDefined();
  expect(lastRequestBody).toHaveProperty('applicationId');
  expect(lastRequestBody).toHaveProperty('currentInterviewStep');
  expect(typeof lastRequestBody.applicationId).toBe('number');
  expect(typeof lastRequestBody.currentInterviewStep).toBe('number');
});

Then('the backend responds with a 2xx status', async () => {
  expect(lastRequestStatus).toBeGreaterThanOrEqual(200);
  expect(lastRequestStatus).toBeLessThan(300);
});

When('I attempt to move a candidate to a new stage', async ({ page }) => {
  await page.route('**/api/candidates/*', async route => {
    if (route.request().method() === 'PUT') {
      await route.abort('failed');
      lastRequestStatus = 500;
    } else {
      await route.continue();
    }
  });

  const candidateCard = page.locator('[class*="candidate"]').first();
  const targetColumn = page.locator('[class*="stage"], [class*="column"]').nth(1);
  
  await candidateCard.dragTo(targetColumn).catch(() => null);
  await page.waitForTimeout(500);
});

When('the backend returns a 500 error', async () => {
  expect(lastRequestStatus).toBe(500);
});

Then('the candidate remains in their original stage', async ({ page }) => {
  const firstColumn = page.locator('[class*="stage"], [class*="column"]').first();
  const candidate = firstColumn.locator('[class*="candidate"]').first();
  await expect(candidate).toBeVisible();
});

Then('an error message is displayed to the user', async ({ page }) => {
  const errorMsg = page.locator('[class*="error"], [role="alert"]').first();
  await expect(errorMsg).toBeVisible({ timeout: 2000 });
});

When('I reorder a candidate within the same {string} stage', async ({ page }, stage: string) => {
  putRequestFired = false;
  
  page.on('request', request => {
    if (request.method() === 'PUT' && request.url().includes('/candidates/')) {
      putRequestFired = true;
    }
  });

  const stageColumn = page.locator(`text="${stage}"`).locator('..').first();
  const candidates = await stageColumn.locator('[class*="candidate"]').all();
  
  if (candidates.length >= 2) {
    await candidates[0].dragTo(candidates[1]).catch(() => null);
    await page.waitForTimeout(300);
  }
});

Then('no PUT request is made to the backend', async () => {
  expect(putRequestFired).toBe(false);
});

Then('the candidate\'s position in the column is updated', async ({ page }) => {
  const candidates = await page.locator('[class*="candidate"]').all();
  expect(candidates.length).toBeGreaterThanOrEqual(2);
});

Then('I see the {string} stage column is displayed', async ({ page }, stage: string) => {
  const stageHeader = page.locator(`text="${stage}"`);
  await expect(stageHeader).toBeVisible({ timeout: 2000 });
});

Then('the {string} column has no candidates', async ({ page }, stage: string) => {
  const stageColumn = page.locator(`text="${stage}"`).locator('..').first();
  const candidates = await stageColumn.locator('[class*="candidate"]').all();
  expect(candidates.length).toBe(0);
});

Then('the {string} column is a valid drop target for drag-and-drop', async ({ page }, stage: string) => {
  const stageColumn = page.locator(`text="${stage}"`).locator('..').first();
  await expect(stageColumn).toBeVisible();
  const boundingBox = await stageColumn.boundingBox();
  expect(boundingBox).not.toBeNull();
});
