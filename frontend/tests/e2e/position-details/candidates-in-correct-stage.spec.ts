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
        { id: 3, name: 'HR Interview' },
      ],
    },
  },
};

const mockCandidates = [
  { candidateId: 101, fullName: 'Alice Dupont',  currentInterviewStep: 'CV Review',           averageScore: 3, applicationId: 201 },
  { candidateId: 102, fullName: 'Bob Martin',    currentInterviewStep: 'Technical Interview',  averageScore: 4, applicationId: 202 },
  { candidateId: 103, fullName: 'Carol Smith',   currentInterviewStep: 'HR Interview',         averageScore: 2, applicationId: 203 },
];

test.describe('Position Details Page', () => {
  test('Candidates appear in their correct stage column', async ({ page }) => {
    // 1. Intercept GET interviewFlow with three stages
    await page.route(INTERVIEW_FLOW_URL, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockInterviewFlow) })
    );

    // 2. Intercept GET candidates with one candidate per stage
    await page.route(CANDIDATES_URL, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCandidates) })
    );

    // 3. Navigate to the position details page
    await page.goto('http://localhost:3000/positions/1');

    const cvReviewColumn        = page.locator('.card.mb-4').filter({ has: page.locator('.card-header', { hasText: 'CV Review' }) });
    const technicalColumn       = page.locator('.card.mb-4').filter({ has: page.locator('.card-header', { hasText: 'Technical Interview' }) });
    const hrColumn              = page.locator('.card.mb-4').filter({ has: page.locator('.card-header', { hasText: 'HR Interview' }) });

    // 4. Verify the 'CV Review' column contains only Alice Dupont with 3 rating indicators
    await expect(cvReviewColumn.locator('.card-title')).toHaveCount(1);
    await expect(cvReviewColumn.getByRole('button', { name: 'Alice Dupont' })).toBeVisible();
    await expect(cvReviewColumn.getByRole('img', { name: 'rating' })).toHaveCount(3);

    // 5. Verify the 'Technical Interview' column contains only Bob Martin with 4 rating indicators
    await expect(technicalColumn.locator('.card-title')).toHaveCount(1);
    await expect(technicalColumn.getByRole('button', { name: 'Bob Martin' })).toBeVisible();
    await expect(technicalColumn.getByRole('img', { name: 'rating' })).toHaveCount(4);

    // 6. Verify the 'HR Interview' column contains only Carol Smith with 2 rating indicators
    await expect(hrColumn.locator('.card-title')).toHaveCount(1);
    await expect(hrColumn.getByRole('button', { name: 'Carol Smith' })).toBeVisible();
    await expect(hrColumn.getByRole('img', { name: 'rating' })).toHaveCount(2);

    // 7. Verify no candidate appears in a column other than their own stage
    await expect(cvReviewColumn.getByRole('button', { name: 'Bob Martin' })).not.toBeVisible();
    await expect(cvReviewColumn.getByRole('button', { name: 'Carol Smith' })).not.toBeVisible();
    await expect(technicalColumn.getByRole('button', { name: 'Alice Dupont' })).not.toBeVisible();
    await expect(technicalColumn.getByRole('button', { name: 'Carol Smith' })).not.toBeVisible();
    await expect(hrColumn.getByRole('button', { name: 'Alice Dupont' })).not.toBeVisible();
    await expect(hrColumn.getByRole('button', { name: 'Bob Martin' })).not.toBeVisible();
  });
});
