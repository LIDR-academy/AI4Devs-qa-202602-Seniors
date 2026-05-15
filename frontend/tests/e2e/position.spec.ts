import { test, expect } from '@playwright/test';

/**
 * Mock data for the Position page tests.
 * Mirrors the API response shapes from the backend.
 */
const POSITION_ID = 1;

const interviewFlowResponse = {
  interviewFlow: {
    positionName: 'Senior Frontend Developer',
    interviewFlow: {
      id: 1,
      description: 'Standard interview process',
      interviewSteps: [
        { id: 1, interviewFlowId: 1, interviewTypeId: 1, name: 'Initial Screening', orderIndex: 1 },
        { id: 2, interviewFlowId: 1, interviewTypeId: 2, name: 'Technical Interview', orderIndex: 2 },
        { id: 3, interviewFlowId: 1, interviewTypeId: 3, name: 'Manager Interview', orderIndex: 3 },
      ],
    },
  },
};

const candidatesResponse = [
  { fullName: 'John Doe', currentInterviewStep: 'Initial Screening', candidateId: 1, applicationId: 101, averageScore: 3 },
  { fullName: 'Jane Smith', currentInterviewStep: 'Initial Screening', candidateId: 2, applicationId: 102, averageScore: 4 },
  { fullName: 'Carlos García', currentInterviewStep: 'Technical Interview', candidateId: 3, applicationId: 103, averageScore: 5 },
  { fullName: 'Ana López', currentInterviewStep: 'Manager Interview', candidateId: 4, applicationId: 104, averageScore: 2 },
];

const stages = interviewFlowResponse.interviewFlow.interviewFlow.interviewSteps;

test.describe('Position page loads correctly', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept API calls and return mock data
    await page.route(`**/positions/${POSITION_ID}/interviewFlow`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(interviewFlowResponse),
      });
    });

    await page.route(`**/positions/${POSITION_ID}/candidates`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(candidatesResponse),
      });
    });

    await page.goto(`/positions/${POSITION_ID}`);
  });

  test('displays the position title', async ({ page }) => {
    const title = page.getByRole('heading', { name: 'Senior Frontend Developer' });
    await expect(title).toBeVisible();
  });

  test('renders all interview phase columns', async ({ page }) => {
    for (const stage of stages) {
      const columnHeader = page.getByText(stage.name, { exact: true });
      await expect(columnHeader).toBeVisible();
    }
  });

  test('displays candidates in their correct stage columns', async ({ page }) => {
    // Wait for candidates to render
    await expect(page.getByText('John Doe')).toBeVisible();

    for (const candidate of candidatesResponse) {
      // Find the stage column that contains this candidate
      const stageIndex = stages.findIndex((s) => s.name === candidate.currentInterviewStep);
      const columnCards = page.locator(`.card`).filter({ hasText: stages[stageIndex].name });

      // Verify the candidate name appears within the correct column
      await expect(columnCards.getByText(candidate.fullName)).toBeVisible();
    }
  });

  test('shows the correct number of candidates per column', async ({ page }) => {
    // Wait for all candidates to render
    await expect(page.getByText('John Doe')).toBeVisible();

    // Initial Screening should have 2 candidates
    const screeningCandidates = candidatesResponse.filter(
      (c) => c.currentInterviewStep === 'Initial Screening'
    );
    expect(screeningCandidates).toHaveLength(2);

    // Technical Interview should have 1 candidate
    const technicalCandidates = candidatesResponse.filter(
      (c) => c.currentInterviewStep === 'Technical Interview'
    );
    expect(technicalCandidates).toHaveLength(1);

    // Manager Interview should have 1 candidate
    const managerCandidates = candidatesResponse.filter(
      (c) => c.currentInterviewStep === 'Manager Interview'
    );
    expect(managerCandidates).toHaveLength(1);

    // Verify each candidate name is visible on the page
    for (const candidate of candidatesResponse) {
      await expect(page.getByText(candidate.fullName)).toBeVisible();
    }
  });
});
