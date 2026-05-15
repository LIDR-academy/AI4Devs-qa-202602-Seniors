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

test.describe('Position Details Page', () => {
  test('All interview stage columns are rendered', async ({ page }) => {
    // 1. Intercept GET interviewFlow with three interview steps
    await page.route(INTERVIEW_FLOW_URL, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockInterviewFlow) })
    );

    // 2. Intercept GET candidates and return empty array
    await page.route(CANDIDATES_URL, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );

    // 3. Navigate to the position details page
    await page.goto('http://localhost:3000/positions/1');

    // 4. Verify exactly 3 stage columns are present with correct headers in order
    const stageColumns = page.locator('.card.mb-4');
    await expect(stageColumns).toHaveCount(3);
    await expect(stageColumns.nth(0).locator('.card-header')).toHaveText('CV Review');
    await expect(stageColumns.nth(1).locator('.card-header')).toHaveText('Technical Interview');
    await expect(stageColumns.nth(2).locator('.card-header')).toHaveText('HR Interview');

    // 5. Verify each column body is empty because no candidates were returned
    await expect(stageColumns.nth(0).locator('.card-title')).toHaveCount(0);
    await expect(stageColumns.nth(1).locator('.card-title')).toHaveCount(0);
    await expect(stageColumns.nth(2).locator('.card-title')).toHaveCount(0);
  });
});
