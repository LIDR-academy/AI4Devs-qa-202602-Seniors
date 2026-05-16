import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

const fixtureInterviewFlow = {
  interviewFlow: {
    positionName: 'Senior Frontend Engineer',
    interviewFlow: {
      interviewSteps: [
        { id: 1, name: 'CV Screening' },
        { id: 2, name: 'Technical Interview' },
        { id: 3, name: 'Culture Fit' },
        { id: 4, name: 'Offer' },
      ],
    },
  },
};

const fixtureCandidates = [
  {
    candidateId: 101,
    applicationId: 201,
    fullName: 'Alice Ramos',
    averageScore: 3,
    currentInterviewStep: 'CV Screening',
  },
  {
    candidateId: 102,
    applicationId: 202,
    fullName: 'Bruno Salas',
    averageScore: 5,
    currentInterviewStep: 'CV Screening',
  },
  {
    candidateId: 103,
    applicationId: 203,
    fullName: 'Carmen Vidal',
    averageScore: 0,
    currentInterviewStep: 'Technical Interview',
  },
  {
    candidateId: 104,
    applicationId: 204,
    fullName: 'David Nieto',
    averageScore: 2,
    currentInterviewStep: 'Culture Fit',
  },
  {
    candidateId: 105,
    applicationId: 205,
    fullName: 'Elena Cruz',
    averageScore: 4,
    currentInterviewStep: 'UNKNOWN_STEP',
  },
];

const APP_URL = 'http://localhost:3000';
const POSITION_URL = `${APP_URL}/positions/1`;

// ---------------------------------------------------------------------------

test.describe('US-01 — View Candidate Pipeline as Kanban Board', () => {

  // -------------------------------------------------------------------------
  test.describe('Happy Path — real backend', () => {

    test('TC-US01-01 — Position title is displayed as a centred heading', async ({ page }) => {
      await page.goto(POSITION_URL);
      const title = page.getByTestId('position-title');
      await expect(title).toBeVisible();
      const text = await title.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
      await expect(title).toHaveClass(/text-center/);
    });

    test('TC-US01-02 — Stage columns are rendered in API order with correct headers', async ({ page }) => {
      // Fetch the expected order directly from the API
      const apiResponse = await page.request.get('http://localhost:3010/positions/1/interviewFlow');
      const data = await apiResponse.json();
      const expectedSteps: string[] = data.interviewFlow.interviewFlow.interviewSteps.map(
        (s: { name: string }) => s.name
      );

      await page.goto(POSITION_URL);
      await expect(page.getByTestId('stage-header').first()).toBeVisible();

      const headers = page.getByTestId('stage-header');
      const count = await headers.count();
      expect(count).toBe(expectedSteps.length);

      for (let i = 0; i < count; i++) {
        await expect(headers.nth(i)).toHaveText(expectedSteps[i]);
      }
    });

    test('TC-US01-03 — Each candidate card appears in the column matching their current interview step', async ({ page }) => {
      const apiCandidates = await page.request.get('http://localhost:3010/positions/1/candidates');
      const candidates: Array<{ fullName: string; currentInterviewStep: string }> = await apiCandidates.json();

      await page.goto(POSITION_URL);
      await expect(page.getByTestId('stage-header').first()).toBeVisible();

      for (const candidate of candidates) {
        const matchingColumn = page
          .getByTestId('stage-column')
          .filter({ has: page.getByTestId('stage-header').filter({ hasText: candidate.currentInterviewStep }) });

        const columnExists = (await matchingColumn.count()) > 0;
        if (columnExists) {
          // Candidate should be inside the correct column
          await expect(
            matchingColumn.getByTestId('candidate-card').filter({ hasText: candidate.fullName })
          ).toBeVisible();
        } else {
          // Candidate's step does not match any column — they must not appear on the board
          await expect(page.getByText(candidate.fullName)).not.toBeVisible();
        }
      }
    });

    test('TC-US01-04 — Candidate card shows full name and correct number of score icons', async ({ page }) => {
      const apiCandidates = await page.request.get('http://localhost:3010/positions/1/candidates');
      const candidates: Array<{ fullName: string; averageScore: number; currentInterviewStep: string }> =
        await apiCandidates.json();

      // Find a candidate with averageScore > 0 that is in a known column
      const apiFlow = await page.request.get('http://localhost:3010/positions/1/interviewFlow');
      const flowData = await apiFlow.json();
      const stepNames: string[] = flowData.interviewFlow.interviewFlow.interviewSteps.map(
        (s: { name: string }) => s.name
      );

      const scoredCandidate = candidates.find(
        (c) => c.averageScore > 0 && stepNames.includes(c.currentInterviewStep)
      );
      expect(scoredCandidate).toBeDefined();

      await page.goto(POSITION_URL);
      await expect(page.getByTestId('stage-header').first()).toBeVisible();

      const card = page
        .getByTestId('candidate-card')
        .filter({ hasText: scoredCandidate!.fullName });
      await expect(card).toBeVisible();

      const icons = card.locator('span[role="img"][aria-label="rating"]');
      await expect(icons).toHaveCount(scoredCandidate!.averageScore);
    });

    test('TC-US01-05 — "Volver a Posiciones" link navigates to /positions', async ({ page }) => {
      await page.goto(POSITION_URL);
      await page.getByTestId('back-to-positions').click();
      await expect(page).toHaveURL(`${APP_URL}/positions`);
    });

    test('TC-US01-06 — Empty stage column still renders with its header visible', async ({ page }) => {
      const apiFlow = await page.request.get('http://localhost:3010/positions/1/interviewFlow');
      const flowData = await apiFlow.json();
      const steps: Array<{ name: string }> = flowData.interviewFlow.interviewFlow.interviewSteps;

      const apiCandidates = await page.request.get('http://localhost:3010/positions/1/candidates');
      const candidates: Array<{ currentInterviewStep: string }> = await apiCandidates.json();
      const occupiedSteps = new Set(candidates.map((c) => c.currentInterviewStep));

      const emptyStep = steps.find((s) => !occupiedSteps.has(s.name));
      expect(emptyStep, 'Expected at least one empty stage in the backend data').toBeDefined();

      await page.goto(POSITION_URL);
      await expect(page.getByTestId('stage-header').first()).toBeVisible();

      const emptyColumn = page
        .getByTestId('stage-column')
        .filter({ has: page.getByTestId('stage-header').filter({ hasText: emptyStep!.name }) });
      await expect(emptyColumn).toBeVisible();
      await expect(emptyColumn.getByTestId('candidate-card')).toHaveCount(0);
    });

  });

  // -------------------------------------------------------------------------
  test.describe('Edge Cases — mocked API', () => {

    test('TC-US01-07 — Empty stage column renders header when all stages have zero candidates (mock)', async ({ page }) => {
      await page.route('**/positions/1/interviewFlow', (route) =>
        route.fulfill({ json: fixtureInterviewFlow })
      );
      await page.route('**/positions/1/candidates', (route) =>
        route.fulfill({ json: [] })
      );

      await page.goto(POSITION_URL);
      const headers = page.getByTestId('stage-header');
      await expect(headers.first()).toBeVisible();

      const expectedHeaders = ['CV Screening', 'Technical Interview', 'Culture Fit', 'Offer'];
      await expect(headers).toHaveCount(4);
      for (let i = 0; i < expectedHeaders.length; i++) {
        await expect(headers.nth(i)).toHaveText(expectedHeaders[i]);
      }

      await expect(page.getByTestId('candidate-card')).toHaveCount(0);
    });

    test('TC-US01-08 — Candidate with averageScore of 0 shows no score icons', async ({ page }) => {
      await page.route('**/positions/1/interviewFlow', (route) =>
        route.fulfill({ json: fixtureInterviewFlow })
      );
      await page.route('**/positions/1/candidates', (route) =>
        route.fulfill({ json: fixtureCandidates })
      );

      await page.goto(POSITION_URL);

      const technicalColumn = page
        .getByTestId('stage-column')
        .filter({ has: page.getByTestId('stage-header').filter({ hasText: 'Technical Interview' }) });
      await expect(technicalColumn).toBeVisible();

      const carmenCard = technicalColumn.getByTestId('candidate-card').filter({ hasText: 'Carmen Vidal' });
      await expect(carmenCard).toBeVisible();

      const icons = carmenCard.locator('span[role="img"][aria-label="rating"]');
      await expect(icons).toHaveCount(0);
    });

    test('TC-US01-09 — Candidate with averageScore of 5 shows exactly 5 score icons', async ({ page }) => {
      await page.route('**/positions/1/interviewFlow', (route) =>
        route.fulfill({ json: fixtureInterviewFlow })
      );
      await page.route('**/positions/1/candidates', (route) =>
        route.fulfill({ json: fixtureCandidates })
      );

      await page.goto(POSITION_URL);

      const cvColumn = page
        .getByTestId('stage-column')
        .filter({ has: page.getByTestId('stage-header').filter({ hasText: 'CV Screening' }) });
      await expect(cvColumn).toBeVisible();

      const brunoCard = cvColumn.getByTestId('candidate-card').filter({ hasText: 'Bruno Salas' });
      await expect(brunoCard).toBeVisible();

      const icons = brunoCard.locator('span[role="img"][aria-label="rating"]');
      await expect(icons).toHaveCount(5);
    });

    test('TC-US01-10 — Candidate with unmatched currentInterviewStep does not appear on the board', async ({ page }) => {
      await page.route('**/positions/1/interviewFlow', (route) =>
        route.fulfill({ json: fixtureInterviewFlow })
      );
      await page.route('**/positions/1/candidates', (route) =>
        route.fulfill({ json: fixtureCandidates })
      );

      await page.goto(POSITION_URL);
      await expect(page.getByTestId('stage-header').first()).toBeVisible();

      await expect(page.getByText('Elena Cruz')).not.toBeVisible();

      // Alice, Bruno, Carmen, David — 4 cards
      await expect(page.getByTestId('candidate-card')).toHaveCount(4);
    });

    test('TC-US01-11 — Stage columns appear in the exact order defined by the API', async ({ page }) => {
      await page.route('**/positions/1/interviewFlow', (route) =>
        route.fulfill({ json: fixtureInterviewFlow })
      );
      await page.route('**/positions/1/candidates', (route) =>
        route.fulfill({ json: [] })
      );

      await page.goto(POSITION_URL);
      const headers = page.getByTestId('stage-header');
      await expect(headers.first()).toBeVisible();

      const expectedOrder = ['CV Screening', 'Technical Interview', 'Culture Fit', 'Offer'];
      await expect(headers).toHaveCount(4);
      for (let i = 0; i < expectedOrder.length; i++) {
        await expect(headers.nth(i)).toHaveText(expectedOrder[i]);
      }
    });

    test('TC-US01-12 — Position name from API is reflected in the page heading', async ({ page }) => {
      await page.route('**/positions/1/interviewFlow', (route) =>
        route.fulfill({ json: fixtureInterviewFlow })
      );
      await page.route('**/positions/1/candidates', (route) =>
        route.fulfill({ json: [] })
      );

      await page.goto(POSITION_URL);
      const title = page.getByTestId('position-title');
      await expect(title).toBeVisible();
      await expect(title).toHaveText('Senior Frontend Engineer');
    });

  });

});
