// spec: specs/position-details.plan.md
// seed: tests/e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

const INTERVIEW_FLOW_URL = 'http://localhost:3010/positions/1/interviewFlow';
const CANDIDATES_URL = 'http://localhost:3010/positions/1/candidates';

const mockInterviewFlow = {
  interviewFlow: {
    positionName: 'Senior Frontend Engineer',
    interviewFlow: {
      interviewSteps: [
        { id: 1, name: 'CV Review' },
        { id: 2, name: 'Technical Interview' },
      ],
    },
  },
};

const mockCandidates = [
  { candidateId: 101, fullName: 'Alice Dupont', currentInterviewStep: 'CV Review', averageScore: 3, applicationId: 201 },
  { candidateId: 104, fullName: 'David Lopez',  currentInterviewStep: 'CV Review', averageScore: 1, applicationId: 204 },
];

test.describe('Position Details Page', () => {
  test('Multiple candidates in the same stage column are all displayed', async ({ page }) => {
    // 1. Intercept GET interviewFlow with two stages
    await page.route(INTERVIEW_FLOW_URL, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockInterviewFlow) })
    );

    // 2. Intercept GET candidates with two candidates both in 'CV Review'
    await page.route(CANDIDATES_URL, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCandidates) })
    );

    // 3. Navigate to the position details page
    await page.goto('http://localhost:3000/positions/1');

    const cvReviewColumn    = page.locator('.card.mb-4').filter({ has: page.locator('.card-header', { hasText: 'CV Review' }) });
    const technicalColumn   = page.locator('.card.mb-4').filter({ has: page.locator('.card-header', { hasText: 'Technical Interview' }) });

    // 4. Inspect the 'CV Review' column — should contain both candidates
    await expect(cvReviewColumn.locator('.card-title')).toHaveCount(2);
    await expect(cvReviewColumn.getByRole('button', { name: 'Alice Dupont' })).toBeVisible();
    await expect(cvReviewColumn.getByRole('button', { name: 'David Lopez' })).toBeVisible();

    // 5. Inspect the 'Technical Interview' column — should be empty
    await expect(technicalColumn.locator('.card-title')).toHaveCount(0);
  });
});
