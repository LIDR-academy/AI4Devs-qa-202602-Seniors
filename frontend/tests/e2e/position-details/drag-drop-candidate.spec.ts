// spec: specs/candidate-drag-drop.plan.md
// seed: tests/e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

const INTERVIEW_FLOW_URL = 'http://localhost:3010/positions/1/interviewFlow';
const CANDIDATES_URL    = 'http://localhost:3010/positions/1/candidates';

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

test.describe('Candidate Drag-and-Drop Between Stages', () => {
  test('Moving a candidate forward updates the UI and calls the correct API endpoint', async ({ page }) => {
    // 1. Intercept GET interviewFlow with three stages
    await page.route(INTERVIEW_FLOW_URL, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockInterviewFlow) })
    );

    // 2. Intercept GET candidates — Alice starts in CV Review
    await page.route(CANDIDATES_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { candidateId: 101, fullName: 'Alice Dupont', currentInterviewStep: 'CV Review', averageScore: 3, applicationId: 201 },
        ]),
      })
    );

    // 3. Intercept PUT /candidates/101 — respond with 200 OK
    await page.route('http://localhost:3010/candidates/101', (route) => {
      if (route.request().method() === 'PUT') {
        route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      } else {
        route.continue();
      }
    });

    // 4. Navigate to the position details page
    await page.goto('http://localhost:3000/positions/1');

    const cvReviewColumn  = page.locator('.card.mb-4').filter({ has: page.locator('.card-header', { hasText: 'CV Review' }) });
    const technicalColumn = page.locator('.card.mb-4').filter({ has: page.locator('.card-header', { hasText: 'Technical Interview' }) });

    // Verify Alice starts in the CV Review column
    await expect(cvReviewColumn.getByRole('button', { name: /Alice Dupont/ })).toBeVisible();

    // 5. Set up a promise to capture the PUT request BEFORE triggering the drag
    const putRequestPromise = page.waitForRequest(
      (req) => req.url() === 'http://localhost:3010/candidates/101' && req.method() === 'PUT'
    );

    // 6-8. Focus the card, press Space to lift, ArrowRight to move to Technical Interview, Space to drop
    await cvReviewColumn.getByRole('button', { name: /Alice Dupont/ }).focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');

    // 9. Wait for the PUT request and verify the endpoint and body
    const putRequest = await putRequestPromise;
    const putBody = putRequest.postDataJSON() as { applicationId: number; currentInterviewStep: number };

    expect(putBody.applicationId).toBe(201);
    expect(putBody.currentInterviewStep).toBe(2); // id of 'Technical Interview'

    // Verify the backend responded with 200 OK
    const putResponse = await putRequest.response();
    expect(putResponse?.status()).toBe(200);

    // Verify Alice is now in Technical Interview and gone from CV Review
    await expect(technicalColumn.getByRole('button', { name: /Alice Dupont/ })).toBeVisible();
    await expect(cvReviewColumn.getByRole('button', { name: /Alice Dupont/ })).not.toBeVisible();
  });

  test('Moving a candidate backward updates the UI and calls the correct API endpoint', async ({ page }) => {
    // 1. Intercept GET interviewFlow with three stages
    await page.route(INTERVIEW_FLOW_URL, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockInterviewFlow) })
    );

    // 2. Intercept GET candidates — Bob starts in HR Interview (last stage)
    await page.route(CANDIDATES_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { candidateId: 102, fullName: 'Bob Martin', currentInterviewStep: 'HR Interview', averageScore: 4, applicationId: 202 },
        ]),
      })
    );

    // 3. Intercept PUT /candidates/102 — respond with 200 OK
    await page.route('http://localhost:3010/candidates/102', (route) => {
      if (route.request().method() === 'PUT') {
        route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      } else {
        route.continue();
      }
    });

    // 4. Navigate to the position details page
    await page.goto('http://localhost:3000/positions/1');

    const hrColumn       = page.locator('.card.mb-4').filter({ has: page.locator('.card-header', { hasText: 'HR Interview' }) });
    const cvReviewColumn = page.locator('.card.mb-4').filter({ has: page.locator('.card-header', { hasText: 'CV Review' }) });

    // Verify Bob starts in the HR Interview column
    await expect(hrColumn.getByRole('button', { name: /Bob Martin/ })).toBeVisible();

    // 5. Set up a promise to capture the PUT request BEFORE triggering the drag
    const putRequestPromise = page.waitForRequest(
      (req) => req.url() === 'http://localhost:3010/candidates/102' && req.method() === 'PUT'
    );

    // 6. Focus the card, press Space to lift, ArrowLeft twice to move to CV Review, Space to drop
    await hrColumn.getByRole('button', { name: /Bob Martin/ }).focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Space');

    // 7. Wait for the PUT request and verify the endpoint and body
    const putRequest = await putRequestPromise;
    const putBody = putRequest.postDataJSON() as { applicationId: number; currentInterviewStep: number };

    expect(putBody.applicationId).toBe(202);
    expect(putBody.currentInterviewStep).toBe(1); // id of 'CV Review'

    // Verify the backend responded with 200 OK
    const putResponse = await putRequest.response();
    expect(putResponse?.status()).toBe(200);

    // Verify Bob is now in CV Review and gone from HR Interview
    await expect(cvReviewColumn.getByRole('button', { name: /Bob Martin/ })).toBeVisible();
    await expect(hrColumn.getByRole('button', { name: /Bob Martin/ })).not.toBeVisible();
  });
});
