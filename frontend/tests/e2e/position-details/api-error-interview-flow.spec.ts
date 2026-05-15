// spec: specs/position-details.plan.md
// seed: tests/e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

const INTERVIEW_FLOW_URL = 'http://localhost:3010/positions/1/interviewFlow';
const CANDIDATES_URL = 'http://localhost:3010/positions/1/candidates';

test.describe('Position Details Page', () => {
  test('Page handles API error for interview flow gracefully', async ({ page }) => {
    // 1. Intercept GET interviewFlow and return HTTP 500 error
    await page.route(INTERVIEW_FLOW_URL, (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Internal Server Error' }) })
    );

    // 2. Intercept GET candidates and return empty array
    await page.route(CANDIDATES_URL, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );

    // 3. Navigate to the position details page — page must not crash
    await page.goto('http://localhost:3000/positions/1');

    // 4. Observe page state: no stage columns, no position title, back button still visible
    await expect(page.locator('.card.mb-4')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Volver a Posiciones' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('');
  });
});
