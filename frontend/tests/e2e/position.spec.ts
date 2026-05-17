import { test, expect } from '@playwright/test';

const mockBoardData = async (page) => {
  await page.route('http://localhost:3010/positions/1/interviewFlow', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        interviewFlow: {
          positionName: 'QA Engineer',
          interviewFlow: {
            interviewSteps: [
              { id: 1, name: 'Applied' },
              { id: 2, name: 'Interview' },
            ],
          },
        },
      }),
    });
  });

  await page.route('http://localhost:3010/positions/1/candidates', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          fullName: 'Jane Doe',
          currentInterviewStep: 'Applied',
          candidateId: 1,
          applicationId: 101,
          averageScore: 4,
        },
      ]),
    });
  });
};

test('position board exposes a stable title hook for the drag flow', async ({ page }) => {
  await mockBoardData(page);

  await page.goto('/positions/1', { waitUntil: 'domcontentloaded' });

  await expect(page.getByTestId('position-title')).toBeVisible();
  await expect(page.getByTestId('position-title')).toHaveText('QA Engineer');
});

test('position board renders stages and candidates in their current column', async ({ page }) => {
  await mockBoardData(page);

  await page.goto('/positions/1', { waitUntil: 'domcontentloaded' });

  await expect(page.getByTestId('phase-column-applied')).toBeVisible();
  await expect(page.getByTestId('phase-column-interview')).toBeVisible();
  await expect(page.getByTestId('candidate-card-1')).toBeVisible();
  await expect(page.getByTestId('phase-column-applied')).toContainText('Jane Doe');
});

test('position board moves a candidate and sends the backend update request', async ({ page }) => {
  await mockBoardData(page);
  await page.route('http://localhost:3010/candidates/1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });

  const requestPromise = page.waitForRequest((request) =>
    request.method() === 'PUT' && request.url() === 'http://localhost:3010/candidates/1',
  );

  await page.goto('/positions/1', { waitUntil: 'domcontentloaded' });
  const candidateCard = page.getByTestId('candidate-card-1');
  const interviewColumn = page.getByTestId('phase-column-interview');

  await expect(candidateCard).toBeVisible();
  await expect(interviewColumn).toBeVisible();

  const sourceBox = await candidateCard.boundingBox();
  const targetBox = await interviewColumn.boundingBox();

  if (!sourceBox || !targetBox) {
    throw new Error('Drag and drop targets were not measurable');
  }

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 20 });
  await page.mouse.up();

  const request = await requestPromise;

  await expect(interviewColumn).toContainText('Jane Doe');
  await expect(page.getByTestId('phase-column-applied')).not.toContainText('Jane Doe');
  await expect(request.postDataJSON()).toMatchObject({
    applicationId: 101,
    currentInterviewStep: 2,
  });
});
