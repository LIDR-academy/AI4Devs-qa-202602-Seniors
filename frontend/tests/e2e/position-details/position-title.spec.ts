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
  test('Position title is displayed after page load', async ({ page }) => {
    // 1. Intercept GET interviewFlow and return mock response
    await page.route(INTERVIEW_FLOW_URL, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockInterviewFlow) })
    );

    // 2. Intercept GET candidates and return empty array
    await page.route(CANDIDATES_URL, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );

    // 3. Navigate to the position details page
    await page.goto('http://localhost:3000/positions/1');

    // 4. Look for an <h2> element with the text 'Senior Frontend Engineer'
    await expect(page.getByRole('heading', { name: 'Senior Frontend Engineer', level: 2 })).toBeVisible();
  });
});
