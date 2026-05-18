import { test, expect, Page, Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// Test data — edit here to update all tests at once
// ---------------------------------------------------------------------------

const POSITION_ID = 1;

const MOCK_INTERVIEW_FLOW = {
  interviewFlow: {
    positionName: 'Senior Backend Engineer',
    interviewFlow: {
      interviewSteps: [
        { id: 1, name: 'CV Review' },
        { id: 2, name: 'Technical Interview' },
        { id: 3, name: 'HR Interview' },
      ],
    },
  },
};

const MOCK_CANDIDATES = [
  {
    candidateId: 101,
    fullName: 'Alice Johnson',
    currentInterviewStep: 'CV Review',
    averageScore: 3,
    applicationId: 201,
  },
  {
    candidateId: 102,
    fullName: 'Bob Smith',
    currentInterviewStep: 'Technical Interview',
    averageScore: 4,
    applicationId: 202,
  },
];

const MOCK_PUT_RESPONSE = {
  message: 'Candidate updated successfully',
  data: {
    id: 201,
    positionId: POSITION_ID,
    candidateId: 101,
    currentInterviewStep: 2,
    applicationDate: '2024-01-15T10:00:00Z',
    notes: null,
  },
};

// ---------------------------------------------------------------------------
// Locator helpers
// ---------------------------------------------------------------------------

function candidateInColumn(page: Page, columnTestId: string, cardTestId: string): Locator {
  return page.getByTestId(columnTestId).getByTestId(cardTestId);
}

// ---------------------------------------------------------------------------
// Action helpers
// ---------------------------------------------------------------------------

async function dragCandidateRight(page: Page, candidateTestId: string): Promise<void> {
  const card = page.getByTestId(candidateTestId);
  await card.focus();
  await card.press('Space');             // activate drag mode
  await page.keyboard.press('ArrowRight'); // move one column right
  await page.keyboard.press('Space');    // drop
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Position Details Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/positions/*/interviewFlow', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_INTERVIEW_FLOW),
      })
    );

    await page.route('**/positions/*/candidates', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CANDIDATES),
      })
    );

    await page.goto(`/positions/${POSITION_ID}`);
    await page.waitForLoadState('networkidle');
  });

  test('should display position title, stage columns and candidates in correct column', async ({
    page,
  }) => {
    await expect(page.getByTestId('position-title')).toHaveText(
      MOCK_INTERVIEW_FLOW.interviewFlow.positionName
    );

    await expect(page.getByTestId('phase-column-cv-review')).toBeVisible();
    await expect(page.getByTestId('phase-column-technical-interview')).toBeVisible();
    await expect(page.getByTestId('phase-column-hr-interview')).toBeVisible();

    await expect(candidateInColumn(page, 'phase-column-cv-review', 'candidate-card-101')).toBeVisible();
    await expect(candidateInColumn(page, 'phase-column-technical-interview', 'candidate-card-102')).toBeVisible();
    await expect(candidateInColumn(page, 'phase-column-technical-interview', 'candidate-card-101')).not.toBeVisible();
  });

  test('should move candidate to another column and call PUT /candidates/:id with correct body', async ({
    page,
  }) => {
    await page.route('**/candidates/101', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PUT_RESPONSE),
      })
    );

    await expect(candidateInColumn(page, 'phase-column-cv-review', 'candidate-card-101')).toBeVisible();

    const [request] = await Promise.all([
      page.waitForRequest(
        (req) => req.url().includes('/candidates/101') && req.method() === 'PUT'
      ),
      dragCandidateRight(page, 'candidate-card-101'),
    ]);

    const body = JSON.parse(request.postData() ?? '{}');

    await expect(candidateInColumn(page, 'phase-column-technical-interview', 'candidate-card-101')).toBeVisible();
    await expect(candidateInColumn(page, 'phase-column-cv-review', 'candidate-card-101')).not.toBeVisible();

    expect(body.applicationId).toBe(201);
    expect(body.currentInterviewStep).toBe(2);
  });
});
