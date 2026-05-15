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

test.describe('Position Details Page', () => {
  test('Position page loads with no candidates', async ({ page }) => {
    // 1. Intercept GET interviewFlow with two stages
    await page.route(INTERVIEW_FLOW_URL, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockInterviewFlow) })
    );

    // 2. Intercept GET candidates and return empty array
    await page.route(CANDIDATES_URL, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );

    // 3. Navigate to the position details page
    await page.goto('http://localhost:3000/positions/1');

    // 4. Inspect each stage column — columns are rendered but empty, title is shown, no errors
    await expect(page.getByRole('heading', { name: 'Senior Frontend Engineer', level: 2 })).toBeVisible();

    const cvReviewColumn  = page.locator('.card.mb-4').filter({ has: page.locator('.card-header', { hasText: 'CV Review' }) });
    const technicalColumn = page.locator('.card.mb-4').filter({ has: page.locator('.card-header', { hasText: 'Technical Interview' }) });

    await expect(cvReviewColumn).toBeVisible();
    await expect(technicalColumn).toBeVisible();
    await expect(cvReviewColumn.locator('.card-title')).toHaveCount(0);
    await expect(technicalColumn.locator('.card-title')).toHaveCount(0);
  });
});
