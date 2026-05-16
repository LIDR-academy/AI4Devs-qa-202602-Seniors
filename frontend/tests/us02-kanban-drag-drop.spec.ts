import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Fixture data — used exclusively by edge-case (mock) tests
// ---------------------------------------------------------------------------

const fixtureInterviewFlow = {
  interviewFlow: {
    positionName: 'Senior Frontend Engineer',
    interviewFlow: {
      interviewSteps: [
        { id: 1, name: 'CV Screening' },
        { id: 2, name: 'Phone Screen' },
        { id: 3, name: 'Technical Interview' },
        { id: 4, name: 'Offer' },
      ],
    },
  },
};

const fixtureCandidates = [
  {
    candidateId: 101,
    fullName: 'Alice Martín',
    currentInterviewStep: 'CV Screening',
    applicationId: 201,
    averageScore: 3,
  },
  {
    candidateId: 102,
    fullName: 'Bob Fernández',
    currentInterviewStep: 'CV Screening',
    applicationId: 202,
    averageScore: 2,
  },
  {
    candidateId: 103,
    fullName: 'Carol López',
    currentInterviewStep: 'Phone Screen',
    applicationId: 203,
    averageScore: 4,
  },
  {
    candidateId: 104,
    fullName: 'David García',
    currentInterviewStep: 'Technical Interview',
    applicationId: 204,
    averageScore: 1,
  },
];

// ---------------------------------------------------------------------------
// Helper — keyboard-based drag via react-beautiful-dnd's accessibility API
// Focuses the card, Space to lift, ArrowRight/Left n times, Space to drop.
// ---------------------------------------------------------------------------
async function keyboardDrag(
  page: Page,
  cardLocator: ReturnType<Page['locator']>,
  direction: 'ArrowRight' | 'ArrowLeft',
  steps = 1,
) {
  await cardLocator.focus();
  await cardLocator.press('Space');
  for (let i = 0; i < steps; i++) {
    await page.keyboard.press(direction);
  }
  await page.keyboard.press('Space');
}

// ---------------------------------------------------------------------------
// Helper — mock both GET endpoints then navigate
// ---------------------------------------------------------------------------
async function setupMockedBoard(page: Page) {
  await page.route('**/positions/1/interviewFlow', (route) =>
    route.fulfill({ json: fixtureInterviewFlow }),
  );
  await page.route('**/positions/1/candidates', (route) =>
    route.fulfill({ json: fixtureCandidates }),
  );
  await page.goto('http://localhost:3000/positions/1');
  await page.waitForSelector('[data-testid="stage-column"]');
}

// ---------------------------------------------------------------------------
// Helper — find the candidate card containing a given name
// ---------------------------------------------------------------------------
function candidateCardByName(page: Page, name: string) {
  return page
    .getByTestId('candidate-card')
    .filter({ hasText: name });
}

// ---------------------------------------------------------------------------
// Helper — find the stage column whose header matches a given stage name
// ---------------------------------------------------------------------------
function columnByName(page: Page, name: string) {
  return page
    .getByTestId('stage-column')
    .filter({ has: page.getByTestId('stage-header').filter({ hasText: name }) });
}

// ===========================================================================
test.describe('US-02 — Move Candidate to a Different Interview Stage', () => {
  // =========================================================================
  test.describe('Happy Path — real backend', () => {
    test.describe.configure({ mode: 'serial' });
    const POSITION_URL = 'http://localhost:3000/positions/1';

    // Reset Carlos García (candidateId 3, applicationId 4) back to
    // "Initial Screening" (step id 1) before every test so the first column
    // is never empty regardless of what a previous test did.
    test.beforeEach(async ({ request }) => {
      await request.put('http://localhost:3010/candidates/3', {
        data: { applicationId: 4, currentInterviewStep: 1 },
      });
    });

    test('TC-US02-01 — Candidate card can be dragged to a different column', async ({ page }) => {
      await page.goto(POSITION_URL);
      await page.waitForSelector('[data-testid="candidate-card"]');

      const sourceColumn = page.getByTestId('stage-column').first();
      const card = sourceColumn.getByTestId('candidate-card').first();
      const cardName = await card.locator('.card-title').innerText();

      await keyboardDrag(page, card, 'ArrowRight', 1);

      await expect(sourceColumn.getByTestId('candidate-card').filter({ hasText: cardName })).toHaveCount(0);
      const destColumn = page.getByTestId('stage-column').nth(1);
      await expect(destColumn.getByTestId('candidate-card').filter({ hasText: cardName })).toHaveCount(1);
    });

    test('TC-US02-02 — PUT request is fired to the correct candidate URL after drop', async ({ page }) => {
      let capturedUrl = '';
      await page.route('**/candidates/**', async (route) => {
        if (route.request().method() === 'PUT') capturedUrl = route.request().url();
        await route.continue();
      });

      await page.goto(POSITION_URL);
      await page.waitForSelector('[data-testid="candidate-card"]');

      const sourceColumn = page.getByTestId('stage-column').first();
      const card = sourceColumn.getByTestId('candidate-card').first();
      const candidateId = await card.getAttribute('data-rbd-draggable-id');

      const putFired = page.waitForRequest((req) => req.method() === 'PUT' && req.url().includes('/candidates/'));
      await keyboardDrag(page, card, 'ArrowRight', 1);
      await putFired;

      expect(capturedUrl).toContain(`/candidates/${candidateId}`);
    });

    test('TC-US02-03 — PUT body contains correct currentInterviewStep (numeric stage id)', async ({ page }) => {
      let capturedBody: Record<string, unknown> = {};
      await page.route('**/candidates/**', async (route) => {
        if (route.request().method() === 'PUT') capturedBody = route.request().postDataJSON() as Record<string, unknown>;
        await route.continue();
      });

      await page.goto(POSITION_URL);
      await page.waitForSelector('[data-testid="candidate-card"]');

      const interviewFlowResp = await page.evaluate(async () => {
        const r = await fetch('http://localhost:3010/positions/1/interviewFlow');
        return r.json();
      });
      // Destination is the second column (index 1)
      const destStageId: number =
        interviewFlowResp.interviewFlow.interviewFlow.interviewSteps[1].id;

      const sourceColumn = page.getByTestId('stage-column').first();
      const card = sourceColumn.getByTestId('candidate-card').first();

      const putFired = page.waitForRequest((req) => req.method() === 'PUT' && req.url().includes('/candidates/'));
      await keyboardDrag(page, card, 'ArrowRight', 1);
      await putFired;

      expect(capturedBody.currentInterviewStep).toBe(destStageId);
    });

    test('TC-US02-04 — PUT body contains applicationId as a number (not a string)', async ({ page }) => {
      let capturedBody: Record<string, unknown> = {};
      await page.route('**/candidates/**', async (route) => {
        if (route.request().method() === 'PUT') capturedBody = route.request().postDataJSON() as Record<string, unknown>;
        await route.continue();
      });

      await page.goto(POSITION_URL);
      await page.waitForSelector('[data-testid="candidate-card"]');

      const sourceColumn = page.getByTestId('stage-column').first();
      const card = sourceColumn.getByTestId('candidate-card').first();

      const putFired = page.waitForRequest((req) => req.method() === 'PUT' && req.url().includes('/candidates/'));
      await keyboardDrag(page, card, 'ArrowRight', 1);
      await putFired;

      expect(typeof capturedBody.applicationId).toBe('number');
      expect(typeof capturedBody.currentInterviewStep).toBe('number');
    });

    test('TC-US02-05 — Backend returns 2xx after a successful drag-and-drop', async ({ page }) => {
      await page.goto(POSITION_URL);
      await page.waitForSelector('[data-testid="candidate-card"]');

      const sourceColumn = page.getByTestId('stage-column').first();
      const card = sourceColumn.getByTestId('candidate-card').first();

      const putFired = page.waitForResponse(
        (resp) => resp.request().method() === 'PUT' && resp.url().includes('/candidates/'),
      );
      await keyboardDrag(page, card, 'ArrowRight', 1);
      const putResponse = await putFired;

      expect(putResponse.status()).toBeGreaterThanOrEqual(200);
      expect(putResponse.status()).toBeLessThan(300);
    });
  });

  // =========================================================================
  test.describe('Edge Cases — mocked API', () => {
    test('TC-US02-06 — Dropping card into the same column fires a PUT with the same stage id', async ({ page }) => {
      let capturedBody: Record<string, unknown> = {};

      await setupMockedBoard(page);

      await page.route('**/candidates/**', async (route) => {
        if (route.request().method() === 'PUT') {
          capturedBody = route.request().postDataJSON() as Record<string, unknown>;
        }
        await route.continue();
      });

      // Alice Martín and Bob Fernández are both in CV Screening (stage id 1).
      // Drag Alice to a different position within the same column by pressing
      // ArrowDown (moves within the same droppable) then dropping.
      const aliceCard = candidateCardByName(page, 'Alice Martín');
      await aliceCard.focus();
      await aliceCard.press('Space');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Space');

      // Allow time for any network request to be dispatched.
      await page.waitForTimeout(1000);

      expect(capturedBody.currentInterviewStep).toBe(1);
    });

    test('TC-US02-07 — Dropping card outside any column returns it to original position with no PUT fired', async ({ page }) => {
      let putFired = false;

      await setupMockedBoard(page);

      await page.route('**/candidates/**', async (route) => {
        if (route.request().method() === 'PUT') {
          putFired = true;
        }
        await route.continue();
      });

      // Begin a drag and cancel it with Escape to simulate dropping outside
      // any valid droppable. react-beautiful-dnd cancels the drag and returns
      // the card to its origin on Escape.
      const aliceCard = candidateCardByName(page, 'Alice Martín');
      await aliceCard.focus();
      await aliceCard.press('Space');
      await page.keyboard.press('Escape');

      // Wait 1 s for any potential PUT to appear.
      await page.waitForTimeout(1000);

      // Alice is still in CV Screening.
      const cvScreeningColumn = columnByName(page, 'CV Screening');
      await expect(cvScreeningColumn.getByTestId('candidate-card').filter({ hasText: 'Alice Martín' })).toHaveCount(1);

      expect(putFired).toBe(false);
    });

    test('TC-US02-08 — UI is NOT rolled back when PUT returns 500', async ({ page }) => {
      await setupMockedBoard(page);

      // Mock PUT to return HTTP 500.
      await page.route('**/candidates/**', (route) => {
        if (route.request().method() === 'PUT') {
          route.fulfill({ status: 500, body: 'Internal Server Error' });
        } else {
          route.continue();
        }
      });

      const carolCard = candidateCardByName(page, 'Carol López');

      // Carol is in Phone Screen (column index 1). Move her right to
      // Technical Interview (column index 2).
      await keyboardDrag(page, carolCard, 'ArrowRight', 1);

      // Wait for the mocked PUT to settle.
      await page.waitForTimeout(500);

      // Carol should be visible in Technical Interview, not Phone Screen.
      const phoneScreenColumn = columnByName(page, 'Phone Screen');
      const technicalColumn = columnByName(page, 'Technical Interview');

      await expect(phoneScreenColumn.getByTestId('candidate-card').filter({ hasText: 'Carol López' })).toHaveCount(0);
      await expect(technicalColumn.getByTestId('candidate-card').filter({ hasText: 'Carol López' })).toHaveCount(1);
    });

    test('TC-US02-09 — PUT body currentInterviewStep is the numeric stage id, not the stage name', async ({ page }) => {
      let capturedBody: Record<string, unknown> = {};

      await setupMockedBoard(page);

      await page.route('**/candidates/**', async (route) => {
        if (route.request().method() === 'PUT') {
          capturedBody = route.request().postDataJSON() as Record<string, unknown>;
          await route.fulfill({ status: 200, json: {} });
        } else {
          await route.continue();
        }
      });

      // David García is in Technical Interview (stage id 3). Move him right
      // to Offer (stage id 4).
      const davidCard = candidateCardByName(page, 'David García');
      await keyboardDrag(page, davidCard, 'ArrowRight', 1);

      await page.waitForTimeout(500);

      expect(capturedBody.currentInterviewStep).toBe(4);
      expect(capturedBody.currentInterviewStep).not.toBe('Offer');
      expect(capturedBody.currentInterviewStep).not.toBe('Technical Interview');
    });
  });
});
