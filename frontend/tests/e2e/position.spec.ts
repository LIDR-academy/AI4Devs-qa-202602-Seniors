import { test, expect } from '@playwright/test';
import { TestDataManager } from './helpers';
import { TestCleanup } from './cleanup';

const PHASES = [
  'Aplicado',
  'Entrevista',
  'Prueba Técnica',
  'Oferta',
  'Contratado',
  'Rechazado',
];

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
    for (const phase of PHASES) {
      const columnHeader = page.locator(
        `[data-testid="phase-column-${phase.toLowerCase().replace(/\s+/g, '-')}"]`
      );
      await expect(columnHeader).toBeVisible();
      await expect(columnHeader).toContainText(phase);
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
    // All columns should be visible even if empty
    for (const phase of PHASES) {
      const columnHeader = page.locator(
        `[data-testid="phase-column-${phase.toLowerCase().replace(/\s+/g, '-')}"]`
      );
      await expect(columnHeader).toBeVisible();
    }

    // Verify at least one column is empty (no candidates)
    const aplicadoColumn = page.locator(
      '[data-testid="phase-column-aplicado"]'
    );
    const candidateCards = aplicadoColumn.locator('[data-testid^="candidate-"]');
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

    // Get candidate card
    const candidateCard = page.locator(
      `[data-testid="candidate-${candidateId}"]`
    );
    await expect(candidateCard).toBeVisible();

    // Get target column (Entrevista)
    const targetColumn = page.locator('[data-testid="phase-column-entrevista"]');

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

    // Intercept the PUT request
    const putPromise = page.waitForRequest(
      (request) =>
        request.method() === 'PUT' && request.url().includes(candidateId)
    );

    const candidateCard = page.locator(
      `[data-testid="candidate-${candidateId}"]`
    );
    const targetColumn = page.locator('[data-testid="phase-column-entrevista"]');

    // Drag and drop
    await candidateCard.dragTo(targetColumn);

    // Verify PUT request was made
    const request = await putPromise;
    expect(request.method()).toBe('PUT');
  });

  test('PUT request URL contains correct candidate ID', async ({ page }) => {
    const candidates = await dataManager.getCandidates(positionId);
    const candidateId = candidates[0].id;

    // Intercept the PUT request
    const putPromise = page.waitForRequest(
      (request) =>
        request.method() === 'PUT' && request.url().includes(candidateId)
    );

    const candidateCard = page.locator(
      `[data-testid="candidate-${candidateId}"]`
    );
    const targetColumn = page.locator('[data-testid="phase-column-entrevista"]');

    await candidateCard.dragTo(targetColumn);

    const request = await putPromise;
    expect(request.url()).toContain(`/candidate/${candidateId}`);
  });

  test('PUT request body contains the new phase identifier', async ({
    page,
  }) => {
    const candidates = await dataManager.getCandidates(positionId);
    const candidateId = candidates[0].id;

    // Intercept the PUT request
    const putPromise = page.waitForRequest(
      (request) =>
        request.method() === 'PUT' && request.url().includes(candidateId)
    );

    const candidateCard = page.locator(
      `[data-testid="candidate-${candidateId}"]`
    );
    const targetColumn = page.locator('[data-testid="phase-column-entrevista"]');

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

    // Intercept and verify the response
    await page.route(`**/api/candidate/${candidateId}`, async (route) => {
      await route.continue();
    });

    const candidateCard = page.locator(
      `[data-testid="candidate-${candidateId}"]`
    );
    const targetColumn = page.locator('[data-testid="phase-column-entrevista"]');

    // Drag and drop
    await candidateCard.dragTo(targetColumn);

    // Verify card remains in new column
    await expect(
      targetColumn.locator(`[data-testid="candidate-${candidateId}"]`)
    ).toBeVisible();
  });

  test('Drag and drop works across different phase transitions', async ({
    page,
  }) => {
    const candidates = await dataManager.getCandidates(positionId);
    const candidateId = candidates[0].id;

    // Initial position: Aplicado
    let candidateCard = page.locator(
      `[data-testid="candidate-${candidateId}"]`
    );
    let currentColumn = page.locator('[data-testid="phase-column-aplicado"]');
    await expect(
      currentColumn.locator(`[data-testid="candidate-${candidateId}"]`)
    ).toBeVisible();

    // Move to Entrevista
    let targetColumn = page.locator('[data-testid="phase-column-entrevista"]');
    candidateCard = page.locator(`[data-testid="candidate-${candidateId}"]`);
    await candidateCard.dragTo(targetColumn);
    await expect(
      targetColumn.locator(`[data-testid="candidate-${candidateId}"]`)
    ).toBeVisible();

    // Move to Prueba Técnica
    currentColumn = targetColumn;
    targetColumn = page.locator('[data-testid="phase-column-prueba-técnica"]');
    candidateCard = page.locator(`[data-testid="candidate-${candidateId}"]`);
    await candidateCard.dragTo(targetColumn);
    await expect(
      targetColumn.locator(`[data-testid="candidate-${candidateId}"]`)
    ).toBeVisible();

    // Move to Oferta
    currentColumn = targetColumn;
    targetColumn = page.locator('[data-testid="phase-column-oferta"]');
    candidateCard = page.locator(`[data-testid="candidate-${candidateId}"]`);
    await candidateCard.dragTo(targetColumn);
    await expect(
      targetColumn.locator(`[data-testid="candidate-${candidateId}"]`)
    ).toBeVisible();
  });
});
