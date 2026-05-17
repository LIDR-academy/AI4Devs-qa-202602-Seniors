import { createBdd } from 'playwright-bdd';
import { expect, Page, Request } from '@playwright/test';

const { Given, When, Then } = createBdd();

// Module-level variable to capture the PUT request across steps within a scenario
let capturedPutRequest: Request | null = null;

/**
 * Resolves the numeric position id from the positions API by matching the
 * position name.  This avoids hardcoding the auto-incremented Postgres id.
 */
async function getPositionIdByName(page: Page, positionName: string): Promise<number> {
  const response = await page.request.get('http://localhost:3010/positions');
  const positions: Array<{ id: number; title: string }> = await response.json();
  const position = positions.find((p) => p.title === positionName);
  if (!position) {
    throw new Error(`Position "${positionName}" not found in /positions response`);
  }
  return position.id;
}

/**
 * Helper: perform a mouse-based drag from one element to another.
 *
 * react-beautiful-dnd v13 ignores the HTML5 drag API and relies entirely on
 * pointer / mouse events, so page.dragAndDrop() does not work reliably.
 * We must:
 *   1. Move over the source element
 *   2. Press the mouse button
 *   3. Move slowly (with steps) to keep the pointer sensor alive
 *   4. Release the mouse button over the destination
 */
async function dragTo(
  page: Page,
  sourceSelector: string,
  destSelector: string,
): Promise<void> {
  const source = page.locator(sourceSelector);
  const dest = page.locator(destSelector);

  const sourceBBox = await source.boundingBox();
  const destBBox = await dest.boundingBox();

  if (!sourceBBox || !destBBox) {
    throw new Error(
      `Could not get bounding box for source="${sourceSelector}" or dest="${destSelector}"`,
    );
  }

  const sx = sourceBBox.x + sourceBBox.width / 2;
  const sy = sourceBBox.y + sourceBBox.height / 2;
  const dx = destBBox.x + destBBox.width / 2;
  const dy = destBBox.y + destBBox.height / 2;

  // Move over the card so that react-beautiful-dnd registers the cursor position
  await page.mouse.move(sx, sy);
  // Small pause to let the component register hover
  await page.waitForTimeout(100);
  // Press the mouse button to start the drag
  await page.mouse.down();
  // Wait so rbd recognises the drag gesture has started
  await page.waitForTimeout(300);
  // Move slightly upward first then move gradually to destination
  await page.mouse.move(sx, sy - 5, { steps: 5 });
  await page.mouse.move(dx, dy, { steps: 30 });
  // Brief pause before releasing so rbd can compute the drop target
  await page.waitForTimeout(200);
  // Release to complete the drop
  await page.mouse.up();
  // Allow the PUT request and React state update to settle
  await page.waitForTimeout(500);
}

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------

Given(
  'el reclutador accede al tablero de la posición {string}',
  async ({ page }, positionName: string) => {
    // Reset captured request for each scenario
    capturedPutRequest = null;

    // Intercept PUT /candidates/* to capture the request AND return a mocked
    // 200 without persisting the change in the real DB. This keeps the test
    // idempotent: the drag is still validated visually and the request body is
    // verified, but Carlos García stays in "Initial Screening" for future runs.
    await page.route('**/candidates/**', async (route) => {
      const request = route.request();
      if (request.method() === 'PUT') {
        capturedPutRequest = request;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Candidate updated successfully' }),
        });
      } else {
        await route.continue();
      }
    });

    // Resolve position id dynamically from the API
    const positionId = await getPositionIdByName(page, positionName);

    await page.goto(`/positions/${positionId}`);

    // Wait until the Kanban board has loaded: at least one stage column must
    // be visible before we proceed.
    await page.waitForSelector('[data-testid^="stage-column-"]', { timeout: 15000 });
  },
);

// ---------------------------------------------------------------------------
// Scenario 1: Carga correcta del tablero
// ---------------------------------------------------------------------------

Then('el título de la posición es visible en la página', async ({ page }) => {
  const title = page.getByTestId('position-title');
  await expect(title).toBeVisible();
  await expect(title).not.toBeEmpty();
});

Then(
  'todas las fases del proceso de selección están representadas como columnas',
  async ({ page }) => {
    // Fetch the interview flow for this position to know the expected stages.
    // Derive the position id from the current URL.
    const url = page.url();
    const match = url.match(/\/positions\/(\d+)/);
    if (!match) throw new Error(`Unexpected URL: ${url}`);
    const positionId = match[1];

    const response = await page.request.get(
      `http://localhost:3010/positions/${positionId}/interviewFlow`,
    );
    const data = await response.json();
    const steps: Array<{ name: string }> =
      data.interviewFlow.interviewFlow.interviewSteps;

    for (const step of steps) {
      const column = page.getByTestId(`stage-column-${step.name}`);
      await expect(column).toBeVisible();
    }
  },
);

Then(
  'cada candidato aparece en la columna correspondiente a su fase actual',
  async ({ page }) => {
    const url = page.url();
    const match = url.match(/\/positions\/(\d+)/);
    if (!match) throw new Error(`Unexpected URL: ${url}`);
    const positionId = match[1];

    const response = await page.request.get(
      `http://localhost:3010/positions/${positionId}/candidates`,
    );
    const candidates: Array<{
      candidateId: number;
      fullName: string;
      currentInterviewStep: string;
    }> = await response.json();

    for (const candidate of candidates) {
      const column = page.getByTestId(`stage-column-${candidate.currentInterviewStep}`);
      const card = column.getByTestId(`candidate-card-${candidate.candidateId}`);
      await expect(card).toBeVisible();
    }
  },
);

// ---------------------------------------------------------------------------
// Scenario 2: Mover un candidato
// ---------------------------------------------------------------------------

Given(
  'el candidato {string} se encuentra en la fase {string}',
  async ({ page }, candidateName: string, stageName: string) => {
    // Verify that the candidate is indeed visible inside the expected column
    const column = page.getByTestId(`stage-column-${stageName}`);
    await expect(column).toBeVisible();

    const card = column.locator('[data-testid^="candidate-card-"]').filter({
      hasText: candidateName,
    });
    await expect(card).toBeVisible();
  },
);

When(
  'el reclutador mueve al candidato {string} a la fase {string}',
  async ({ page }, candidateName: string, destStageName: string) => {
    // Find the source card regardless of which column it is in
    const sourceCard = page
      .locator('[data-testid^="candidate-card-"]')
      .filter({ hasText: candidateName });

    const destColumn = page.getByTestId(`stage-column-${destStageName}`);

    await expect(sourceCard).toBeVisible();
    await expect(destColumn).toBeVisible();

    // Retrieve the data-testid values to build precise CSS attribute selectors
    const cardTestId = await sourceCard.getAttribute('data-testid');
    const colTestId = await destColumn.getAttribute('data-testid');

    if (!cardTestId || !colTestId) {
      throw new Error('Could not retrieve data-testid attributes for drag operation');
    }

    await dragTo(
      page,
      `[data-testid="${cardTestId}"]`,
      `[data-testid="${colTestId}"]`,
    );
  },
);

Then(
  'el candidato {string} aparece en la columna {string}',
  async ({ page }, candidateName: string, stageName: string) => {
    const column = page.getByTestId(`stage-column-${stageName}`);
    await expect(column).toBeVisible();

    const card = column.locator('[data-testid^="candidate-card-"]').filter({
      hasText: candidateName,
    });
    await expect(card).toBeVisible();
  },
);

Then(
  'el sistema registra el cambio de fase del candidato en el backend',
  async () => {
    // The PUT request must have been captured by the listener set up in Background
    expect(capturedPutRequest).not.toBeNull();

    const postData = capturedPutRequest!.postData();
    expect(postData).not.toBeNull();

    const body = JSON.parse(postData!);

    // Both fields must be present and be numbers
    expect(typeof body.applicationId).toBe('number');
    expect(typeof body.currentInterviewStep).toBe('number');
  },
);
