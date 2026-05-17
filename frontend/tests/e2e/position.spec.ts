import { test, expect, Page } from '@playwright/test';
import { TestDataManager } from './helpers';
import { TestCleanup } from './cleanup';

async function discoverPhaseColumns(page: Page): Promise<{ name: string; locator: ReturnType<Page['locator']> }[]> {
  const columnHeaders = page.locator('[data-testid^="phase-column-"]');
  const count = await columnHeaders.count();
  const phases = [];

  for (let i = 0; i < count; i++) {
    const header = columnHeaders.nth(i);
    const testId = await header.getAttribute('data-testid');
    const text = await header.textContent();
    const phaseText = text?.trim() || '';

    if (testId && phaseText) {
      phases.push({
        name: phaseText,
        locator: page.locator(`[data-testid="${testId}"]`),
      });
    }
  }

  return phases;
}

test.describe('Position Page', () => {
  let dataManager: TestDataManager;
  let cleanup: TestCleanup;
  let positionId: string;

  test.beforeEach(async ({ page }) => {
    dataManager = new TestDataManager(page);
    cleanup = new TestCleanup(page);

    // Create a test position
    const position = await dataManager.createPosition('Senior Frontend Engineer');
    positionId = position.id;
    cleanup.trackPosition(positionId);

    // Navigate to position page
    await page.goto(`/position/${positionId}`);
  });

  test.afterEach(async () => {
    await cleanup.cleanup();
  });

  test('Position title is displayed correctly', async ({ page }) => {
    const titleElement = page.locator('[data-testid="position-title"]');
    await expect(titleElement).toBeVisible();
    await expect(titleElement).toContainText('Senior Frontend Engineer');
  });

  test('All hiring phase columns are rendered', async ({ page }) => {
    const phases = await discoverPhaseColumns(page);
    expect(phases.length).toBeGreaterThan(0);

    for (const phase of phases) {
      await expect(phase.locator).toBeVisible();
      await expect(page.locator(`[data-testid^="phase-column-"]`).filter({ hasText: phase.name })).toBeVisible();
    }
  });

  test('Candidate cards appear in correct columns based on their phase', async ({
    page,
  }) => {
    // Create candidates in different phases
    const candidate1 = await dataManager.createCandidate(
      positionId,
      'Alice Johnson',
      'alice@example.com',
      'Aplicado'
    );
    cleanup.trackCandidate(candidate1.id);

    const candidate2 = await dataManager.createCandidate(
      positionId,
      'Bob Smith',
      'bob@example.com',
      'Entrevista'
    );
    cleanup.trackCandidate(candidate2.id);

    const candidate3 = await dataManager.createCandidate(
      positionId,
      'Charlie Brown',
      'charlie@example.com',
      'Oferta'
    );
    cleanup.trackCandidate(candidate3.id);

    // Reload to see the candidates
    await page.reload();

    // Verify candidates are in correct columns
    const aplicadoColumn = page.locator(
      '[data-testid="phase-column-aplicado"]'
    );
    await expect(
      aplicadoColumn.locator(`[data-testid="candidate-${candidate1.id}"]`)
    ).toBeVisible();

    const entrevistaColumn = page.locator(
      '[data-testid="phase-column-entrevista"]'
    );
    await expect(
      entrevistaColumn.locator(`[data-testid="candidate-${candidate2.id}"]`)
    ).toBeVisible();

    const ofertaColumn = page.locator(
      '[data-testid="phase-column-oferta"]'
    );
    await expect(
      ofertaColumn.locator(`[data-testid="candidate-${candidate3.id}"]`)
    ).toBeVisible();
  });

  test('Empty columns are displayed gracefully', async ({ page }) => {
    const phases = await discoverPhaseColumns(page);
    expect(phases.length).toBeGreaterThan(0);

    // All columns should be visible even if empty
    for (const phase of phases) {
      await expect(phase.locator).toBeVisible();
    }

    // Verify at least one column is empty (no candidates)
    const firstColumn = phases[0].locator;
    const candidateCards = firstColumn.locator('[data-testid^="candidate-"]');
    const count = await candidateCards.count();
    expect(count).toBe(0);
  });
});

test.describe('Candidate Phase Change', () => {
  let dataManager: TestDataManager;
  let cleanup: TestCleanup;
  let positionId: string;

  test.beforeEach(async ({ page }) => {
    dataManager = new TestDataManager(page);
    cleanup = new TestCleanup(page);

    // Create a test position
    const position = await dataManager.createPosition(
      'Senior Backend Engineer'
    );
    positionId = position.id;
    cleanup.trackPosition(positionId);

    // Create a test candidate
    const candidate = await dataManager.createCandidate(
      positionId,
      'David Wilson',
      'david@example.com',
      'Aplicado'
    );
    cleanup.trackCandidate(candidate.id);

    // Navigate to position page
    await page.goto(`/position/${positionId}`);
  });

  test.afterEach(async () => {
    await cleanup.cleanup();
  });

  test('Candidate card can be dragged from one column to another', async ({
    page,
  }) => {
    const candidates = await dataManager.getCandidates(positionId);
    const candidateId = candidates[0].id;
    const phases = await discoverPhaseColumns(page);

    expect(phases.length).toBeGreaterThanOrEqual(2);

    // Get candidate card from first column
    const candidateCard = page.locator(
      `[data-testid="candidate-${candidateId}"]`
    );
    await expect(candidateCard).toBeVisible();

    // Get target column (second phase)
    const targetColumn = phases[1].locator;

    // Drag and drop
    await candidateCard.dragTo(targetColumn);

    // Verify card moved to new column
    await expect(
      targetColumn.locator(`[data-testid="candidate-${candidateId}"]`)
    ).toBeVisible();
  });

  test('PUT /candidate/:id is called with correct HTTP method', async ({
    page,
  }) => {
    const candidates = await dataManager.getCandidates(positionId);
    const candidateId = candidates[0].id;
    const phases = await discoverPhaseColumns(page);

    expect(phases.length).toBeGreaterThanOrEqual(2);

    // Intercept the PUT request
    const putPromise = page.waitForRequest(
      (request) =>
        request.method() === 'PUT' && request.url().includes(candidateId)
    );

    const candidateCard = page.locator(
      `[data-testid="candidate-${candidateId}"]`
    );
    const targetColumn = phases[1].locator;

    // Drag and drop
    await candidateCard.dragTo(targetColumn);

    // Verify PUT request was made
    const request = await putPromise;
    expect(request.method()).toBe('PUT');
  });

  test('PUT request URL contains correct candidate ID', async ({ page }) => {
    const candidates = await dataManager.getCandidates(positionId);
    const candidateId = candidates[0].id;
    const phases = await discoverPhaseColumns(page);

    expect(phases.length).toBeGreaterThanOrEqual(2);

    // Intercept the PUT request
    const putPromise = page.waitForRequest(
      (request) =>
        request.method() === 'PUT' && request.url().includes(candidateId)
    );

    const candidateCard = page.locator(
      `[data-testid="candidate-${candidateId}"]`
    );
    const targetColumn = phases[1].locator;

    await candidateCard.dragTo(targetColumn);

    const request = await putPromise;
    expect(request.url()).toContain(`/candidate/${candidateId}`);
  });

  test('PUT request body contains the new phase identifier', async ({
    page,
  }) => {
    const candidates = await dataManager.getCandidates(positionId);
    const candidateId = candidates[0].id;
    const phases = await discoverPhaseColumns(page);

    expect(phases.length).toBeGreaterThanOrEqual(2);

    // Intercept the PUT request
    const putPromise = page.waitForRequest(
      (request) =>
        request.method() === 'PUT' && request.url().includes(candidateId)
    );

    const candidateCard = page.locator(
      `[data-testid="candidate-${candidateId}"]`
    );
    const targetColumn = phases[1].locator;

    await candidateCard.dragTo(targetColumn);

    const request = await putPromise;
    const postData = request.postDataJSON();
    expect(postData.phase).toBeTruthy();
  });

  test('Successful backend response (2xx) keeps card in new column', async ({
    page,
  }) => {
    const candidates = await dataManager.getCandidates(positionId);
    const candidateId = candidates[0].id;
    const phases = await discoverPhaseColumns(page);

    expect(phases.length).toBeGreaterThanOrEqual(2);

    const candidateCard = page.locator(
      `[data-testid="candidate-${candidateId}"]`
    );
    const targetColumn = phases[1].locator;

    // Set up listeners for request and response before drag
    const requestPromise = page.waitForRequest(
      (request) =>
        request.method() === 'PUT' && request.url().includes(candidateId)
    );

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(candidateId) && response.request().method() === 'PUT'
    );

    // Drag and drop
    await candidateCard.dragTo(targetColumn);

    // Await and verify the network request
    const request = await requestPromise;
    expect(request.method()).toBe('PUT');

    // Await and verify the network response
    const response = await responsePromise;
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(300);

    // Verify card remains in new column (UI state)
    await expect(
      targetColumn.locator(`[data-testid="candidate-${candidateId}"]`)
    ).toBeVisible();
  });

  test('Drag and drop works across different phase transitions', async ({
    page,
  }) => {
    const candidates = await dataManager.getCandidates(positionId);
    const candidateId = candidates[0].id;
    const phases = await discoverPhaseColumns(page);

    expect(phases.length).toBeGreaterThanOrEqual(3);

    // Verify candidate starts in first column
    const candidateCard = page.locator(
      `[data-testid="candidate-${candidateId}"]`
    );
    await expect(
      phases[0].locator.locator(`[data-testid="candidate-${candidateId}"]`)
    ).toBeVisible();

    // Move through multiple phases (at least 3 transitions)
    for (let i = 1; i < Math.min(4, phases.length); i++) {
      const targetColumn = phases[i].locator;
      const card = page.locator(`[data-testid="candidate-${candidateId}"]`);

      await card.dragTo(targetColumn);

      await expect(
        targetColumn.locator(`[data-testid="candidate-${candidateId}"]`)
      ).toBeVisible();
    }
  });
});
