import { test, expect, APIRequestContext, Page } from '@playwright/test';

const API_BASE = 'http://localhost:3010';
const POSITION_ID = '1';
const POSITION_PATH = `/positions/${POSITION_ID}`;

/** Seed fixture: Carlos García on position 1 — starts in Initial Screening */
const CARLOS = {
  candidateId: 3,
  applicationId: 4,
  initialInterviewStep: 1,
  technicalInterviewStep: 2,
};

test.describe.configure({ mode: 'serial' });

async function resetCarlosToInitialScreening(request: APIRequestContext) {
  const response = await request.put(
    `${API_BASE}/candidates/${CARLOS.candidateId}`,
    {
      data: {
        applicationId: CARLOS.applicationId,
        currentInterviewStep: CARLOS.initialInterviewStep,
      },
    },
  );
  expect(
    response.ok(),
    `Setup failed: could not reset candidate ${CARLOS.candidateId} (HTTP ${response.status()})`,
  ).toBeTruthy();
}

async function restoreCarlosToInitialScreening(request: APIRequestContext) {
  const response = await request.put(
    `${API_BASE}/candidates/${CARLOS.candidateId}`,
    {
      data: {
        applicationId: CARLOS.applicationId,
        currentInterviewStep: CARLOS.initialInterviewStep,
      },
    },
  );
  if (!response.ok()) {
    console.warn(
      `[E2E teardown] Could not restore candidate ${CARLOS.candidateId} to Initial Screening ` +
        `(HTTP ${response.status()}). Re-run may fail until state is fixed via PUT or re-seed.`,
    );
  }
}

async function waitForBoardReady(page: Page) {
  await expect(page.getByTestId('position-title')).toBeVisible();
  await expect(page.getByTestId('phase-column-initial-screening')).toBeVisible();
  await expect(
    page
      .getByTestId('phase-column-initial-screening')
      .getByTestId('candidate-card-3'),
  ).toBeVisible();
}

test.beforeEach(async ({ request }) => {
  await resetCarlosToInitialScreening(request);
});

test.describe('Position Kanban — page load', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(POSITION_PATH);
    await waitForBoardReady(page);
  });

  test('shows position title and interview phase columns', async ({ page }) => {
    await expect(page.getByTestId('position-title')).toBeVisible();
    await expect(page.getByTestId('phase-column-initial-screening')).toBeVisible();
    await expect(page.getByTestId('phase-column-technical-interview')).toBeVisible();
    await expect(page.getByTestId('phase-column-manager-interview')).toBeVisible();
  });

  test('shows candidate cards in their current phase columns', async ({ page }) => {
    await expect(
      page.getByTestId('phase-column-initial-screening').getByTestId('candidate-card-3'),
    ).toBeVisible();
    await expect(
      page.getByTestId('phase-column-technical-interview').getByTestId('candidate-card-1'),
    ).toBeVisible();
    await expect(
      page.getByTestId('phase-column-technical-interview').getByTestId('candidate-card-2'),
    ).toBeVisible();
  });
});

test.describe('Position Kanban — drag and drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(POSITION_PATH);
    await waitForBoardReady(page);
  });

  test.afterEach(async ({ request }, testInfo) => {
    if (testInfo.status === testInfo.expectedStatus) {
      await restoreCarlosToInitialScreening(request);
    }
  });

  test('moves a candidate and sends PUT /candidates/:id with new step', async ({
    page,
  }) => {
    const sourceCard = page.getByTestId('candidate-card-3');
    const destColumn = page.getByTestId('phase-column-technical-interview');

    await expect(sourceCard).toBeVisible();
    await expect(destColumn).toBeVisible();

    const putPromise = page.waitForResponse(
      (res) =>
        res.request().method() === 'PUT' &&
        /\/candidates\/3$/.test(new URL(res.url()).pathname) &&
        res.ok(),
    );

    const sourceBox = await sourceCard.boundingBox();
    const destBox = await destColumn.boundingBox();
    if (!sourceBox || !destBox) {
      throw new Error('Could not resolve drag source or drop target bounds');
    }
    await page.mouse.move(
      sourceBox.x + sourceBox.width / 2,
      sourceBox.y + sourceBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      destBox.x + destBox.width / 2,
      destBox.y + destBox.height / 2,
      { steps: 12 },
    );
    await page.mouse.up();

    const response = await putPromise;
    const body = response.request().postDataJSON();
    expect(body).toMatchObject({
      applicationId: CARLOS.applicationId,
      currentInterviewStep: CARLOS.technicalInterviewStep,
    });

    await expect(destColumn.getByTestId('candidate-card-3')).toBeVisible();
  });
});
