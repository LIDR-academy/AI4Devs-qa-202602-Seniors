import { test, expect, Page, Locator } from '@playwright/test';

function toSlug(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-');
}

async function dragTo(page: Page, source: Locator, target: Locator): Promise<void> {
  const sourceBB = await source.boundingBox();
  const targetBB = await target.boundingBox();

  if (!sourceBB || !targetBB) {
    throw new Error('Could not get bounding box for drag source or target');
  }

  const sx = sourceBB.x + sourceBB.width / 2;
  const sy = sourceBB.y + sourceBB.height / 2;
  const tx = targetBB.x + targetBB.width / 2;
  const ty = targetBB.y + targetBB.height / 2;

  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.mouse.move(sx + 3, sy + 3, { steps: 5 });
  await page.waitForTimeout(150);
  await page.mouse.move(tx, ty, { steps: 30 });
  await page.waitForTimeout(150);
  await page.mouse.up();
}

// Fixed mock data: tests never depend on real DB state
const MOCK_INTERVIEW_FLOW = {
  interviewFlow: {
    positionName: 'Senior Full-Stack Engineer',
    interviewFlow: {
      interviewSteps: [
        { id: 1, name: 'Initial Screening' },
        { id: 2, name: 'Technical Interview' },
        { id: 3, name: 'Manager Interview' },
      ],
    },
  },
};

const MOCK_CANDIDATES = [
  { candidateId: 3, fullName: 'Carlos García',  currentInterviewStep: 'Initial Screening',  applicationId: 4, averageScore: 0 },
  { candidateId: 1, fullName: 'John Doe',        currentInterviewStep: 'Technical Interview', applicationId: 1, averageScore: 5 },
  { candidateId: 2, fullName: 'Jane Smith',      currentInterviewStep: 'Technical Interview', applicationId: 3, averageScore: 4 },
];

test.describe('Position Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    // Mock GET responses so every test starts with a known, fixed state
    // regardless of what other tests or manual actions did to the real DB.
    await page.route('**/positions/*/interviewFlow', route =>
      route.fulfill({ json: MOCK_INTERVIEW_FLOW })
    );
    await page.route('**/positions/*/candidates', route =>
      route.fulfill({ json: MOCK_CANDIDATES })
    );

    await page.goto('/positions/1');
    await expect(page.getByTestId('position-title')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('[data-testid^="candidate-card-"]', { timeout: 10000 });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Escenario 1: Carga de la página de Position
  // ──────────────────────────────────────────────────────────────────────────
  test('Escenario 1: la página de Position carga con título, columnas y candidatos', async ({ page }) => {
    // 1. El título de la posición se muestra correctamente
    const title = page.getByTestId('position-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('Senior Full-Stack Engineer');

    // 2. Las columnas de fases se muestran
    const expectedPhases = ['Initial Screening', 'Technical Interview', 'Manager Interview'];
    for (const phase of expectedPhases) {
      const column = page.getByTestId(`phase-column-${toSlug(phase)}`);
      await expect(column).toBeVisible();
      await expect(column).toContainText(phase);
    }

    // 3. Las tarjetas aparecen en la columna correcta según su fase actual
    const screeningColumn = page.getByTestId('phase-column-initial-screening');
    await expect(screeningColumn.getByText('Carlos García')).toBeVisible();

    const technicalColumn = page.getByTestId('phase-column-technical-interview');
    await expect(technicalColumn.getByText('John Doe')).toBeVisible();
    await expect(technicalColumn.getByText('Jane Smith')).toBeVisible();

    // Verificar que los candidatos NO están en una columna incorrecta
    await expect(screeningColumn.getByText('John Doe')).not.toBeVisible();
    await expect(technicalColumn.getByText('Carlos García')).not.toBeVisible();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Escenario 2: Cambio de fase de un candidato
  // ──────────────────────────────────────────────────────────────────────────
  test('Escenario 2: mover una tarjeta actualiza la columna y dispara PUT /candidates/:id', async ({ page }) => {
    const screeningColumn  = page.getByTestId('phase-column-initial-screening');
    const technicalColumn  = page.getByTestId('phase-column-technical-interview');

    // Mock the PUT so the drag never permanently changes the real DB.
    // We still capture and validate every part of the request before fulfilling.
    let capturedPutUrl  = '';
    let capturedPutBody: Record<string, unknown> = {};

    await page.route('**/candidates/**', async route => {
      if (route.request().method() === 'PUT') {
        capturedPutUrl  = route.request().url();
        capturedPutBody = JSON.parse(route.request().postData() ?? '{}');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Candidate stage updated successfully', data: {} }),
        });
      } else {
        await route.continue();
      }
    });

    // Locate Carlos García's card inside Initial Screening
    const carlosCard = screeningColumn
      .locator('[data-testid^="candidate-card-"]')
      .filter({ hasText: 'Carlos García' });
    await expect(carlosCard).toBeVisible();

    // Extract candidate ID from data-testid to assert the PUT URL later
    const testId      = await carlosCard.getAttribute('data-testid');
    const candidateId = testId?.replace('candidate-card-', '');
    expect(candidateId).toBeTruthy();

    // Register the response listener BEFORE triggering the drag
    const putResponsePromise = page.waitForResponse(
      res => res.request().method() === 'PUT' && res.url().includes(`/candidates/${candidateId}`),
      { timeout: 5000 }
    );

    // Drag Carlos García from Initial Screening → Technical Interview
    await dragTo(page, carlosCard, technicalColumn);

    // Wait for the mocked PUT response first — this is the synchronization point
    // that guarantees the route handler has already fired and populated
    // capturedPutUrl / capturedPutBody before we assert on them.
    const putResponse = await putResponsePromise;

    // ── Validate the PUT request ──────────────────────────────────────────

    expect(capturedPutUrl).toContain(`/candidates/${candidateId}`);

    expect(typeof capturedPutBody.applicationId).toBe('number');
    expect(typeof capturedPutBody.currentInterviewStep).toBe('number');
    expect(capturedPutBody.currentInterviewStep as number).toBeGreaterThan(0);

    // ── Validate the backend response ─────────────────────────────────────

    expect(putResponse.status()).toBe(200);

    const responseBody = await putResponse.json();
    expect(responseBody).toMatchObject({ message: expect.stringContaining('success') });

    // ── Validate the visual state ─────────────────────────────────────────

    await expect(technicalColumn.getByText('Carlos García')).toBeVisible();
    await expect(screeningColumn.getByText('Carlos García')).not.toBeVisible();
  });
});
