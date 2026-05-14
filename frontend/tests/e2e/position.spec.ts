import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

// Annotate entire file as serial.
test.describe.configure({ mode: 'serial' });

test.use({ baseURL: 'http://localhost:3000' });

const positionUrl = '/positions/1';
const backendBaseUrl = 'http://localhost:3010';

const selectors = {
  positionTitle: '[data-testid="position-title"]',
  initialColumn: '[data-testid="phase-column-initial-screening"]',
  technicalColumn: '[data-testid="phase-column-technical-interview"]',
  managerColumn: '[data-testid="phase-column-manager-interview"]',
  candidate1: '[data-testid="candidate-card-1"]',
  candidate2: '[data-testid="candidate-card-2"]',
  candidate3: '[data-testid="candidate-card-3"]',
};

async function dragCandidateToColumn(page: Page, candidateSelector: string, destinationColumnSelector: string) {
  const candidate = page.locator(candidateSelector);
  const destinationDropArea = page.locator(`${destinationColumnSelector} .card-body`);

  await candidate.waitFor({ state: 'visible' });
  await destinationDropArea.waitFor({ state: 'visible' });
  await candidate.scrollIntoViewIfNeeded();
  await destinationDropArea.scrollIntoViewIfNeeded();

  const sourceBox = await candidate.boundingBox();
  const destinationBox = await destinationDropArea.boundingBox();

  if (!sourceBox || !destinationBox) {
    throw new Error('Unable to compute drag-and-drop coordinates.');
  }

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(destinationBox.x + destinationBox.width / 2, destinationBox.y + destinationBox.height / 2, {
    steps: 20,
  });
  await page.mouse.up();
}

async function resetBoardState(request: APIRequestContext) {
  const resets = [
    { candidateId: 1, applicationId: 1, currentInterviewStep: 2 },
    { candidateId: 2, applicationId: 3, currentInterviewStep: 2 },
    { candidateId: 3, applicationId: 4, currentInterviewStep: 1 },
  ];

  for (const payload of resets) {
    const response = await request.put(`${backendBaseUrl}/candidates/${payload.candidateId}`, {
      data: {
        applicationId: payload.applicationId,
        currentInterviewStep: payload.currentInterviewStep,
      },
    });
    expect(response.ok()).toBeTruthy();
  }
}

test.describe('Position kanban board', () => {
  test.afterEach(async ({ request }) => {
    await resetBoardState(request);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(positionUrl);
    await expect(page.locator(selectors.positionTitle)).toHaveText('Senior Full-Stack Engineer');
  });

  test('renders the seeded position title', async ({ page }) => {
    await expect(page.locator(selectors.positionTitle)).toHaveText('Senior Full-Stack Engineer');
  });

  test('renders the three interview columns', async ({ page }) => {
    const columns = page.locator('[data-testid^="phase-column-"]');

    await expect(columns).toHaveCount(3);
    await expect(page.locator(`${selectors.initialColumn} .card-header`)).toHaveText('Initial Screening');
    await expect(page.locator(`${selectors.technicalColumn} .card-header`)).toHaveText('Technical Interview');
    await expect(page.locator(`${selectors.managerColumn} .card-header`)).toHaveText('Manager Interview');
  });

  test('shows Carlos García in Initial Screening', async ({ page }) => {
    const initialColumn = page.locator(selectors.initialColumn);
    const candidateCards = initialColumn.locator('[data-testid^="candidate-card-"]');
    const carlosCard = initialColumn.locator(selectors.candidate3);

    await expect(candidateCards).toHaveCount(1);
    await expect(carlosCard).toBeVisible();
    await expect(carlosCard).toContainText('Carlos García');
  });

  test('shows Jane Smith and John Doe in Technical Interview', async ({ page }) => {
    const technicalColumn = page.locator(selectors.technicalColumn);
    const candidateCards = technicalColumn.locator('[data-testid^="candidate-card-"]');
    const johnCard = technicalColumn.locator(selectors.candidate1);
    const janeCard = technicalColumn.locator(selectors.candidate2);

    await expect(candidateCards).toHaveCount(2);
    await expect(johnCard).toContainText('John Doe');
    await expect(janeCard).toContainText('Jane Smith');
  });

  test('keeps Manager Interview empty', async ({ page }) => {
    const managerColumn = page.locator(selectors.managerColumn);

    await expect(managerColumn.locator('[data-testid^="candidate-card-"]')).toHaveCount(0);
  });

  test('moves Carlos from Initial Screening to Manager Interview', async ({ page }) => {
    const initialColumn = page.locator(selectors.initialColumn);
    const managerColumn = page.locator(selectors.managerColumn);
    const updateResponsePromise = page.waitForResponse((response) => {
      return response.request().method() === 'PUT' && response.url() === `${backendBaseUrl}/candidates/3`;
    });

    await dragCandidateToColumn(page, selectors.candidate3, selectors.managerColumn);
    const updateResponse = await updateResponsePromise;
    expect(updateResponse.status()).toBe(200);

    await expect(initialColumn.locator('[data-testid^="candidate-card-"]')).toHaveCount(0);
    await expect(managerColumn.locator(selectors.candidate3)).toBeVisible();
  });

  test('sends expected update request when moving Jane to Manager Interview', async ({ page }) => {
    const updateRequestPromise = page.waitForRequest((request) => {
      return (
        request.method() === 'PUT' &&
        request.url() === `${backendBaseUrl}/candidates/2`
      );
    });

    await dragCandidateToColumn(page, selectors.candidate2, selectors.managerColumn);

    const updateRequest = await updateRequestPromise;
    const requestPayload = updateRequest.postDataJSON();

    expect(requestPayload).toEqual({
      applicationId: 3,
      currentInterviewStep: 3,
    });
  });

  test('keeps John in Manager Interview after reload', async ({ page }) => {
    const managerColumn = page.locator(selectors.managerColumn);
    const updateResponsePromise = page.waitForResponse((response) => {
      return response.request().method() === 'PUT' && response.url() === `${backendBaseUrl}/candidates/1`;
    });

    await dragCandidateToColumn(page, selectors.candidate1, selectors.managerColumn);
    const updateResponse = await updateResponsePromise;
    expect(updateResponse.status()).toBe(200);
    await page.reload();

    await expect(page.locator(selectors.positionTitle)).toHaveText('Senior Full-Stack Engineer');
    await expect(managerColumn.locator(selectors.candidate1)).toBeVisible();
    await expect(managerColumn.locator(selectors.candidate1)).toContainText('John Doe');
  });
});