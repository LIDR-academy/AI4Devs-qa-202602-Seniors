import { expect, Page, test } from '@playwright/test';

const position = {
  id: 1,
  title: 'Senior Frontend Engineer',
};

const interviewSteps = [
  { id: 1, name: 'Aplicado' },
  { id: 2, name: 'Entrevista' },
  { id: 3, name: 'Oferta' },
];

const candidates = [
  {
    candidateId: 101,
    fullName: 'Ada Lovelace',
    averageScore: 3,
    applicationId: 5001,
    currentInterviewStep: 'Aplicado',
  },
  {
    candidateId: 102,
    fullName: 'Grace Hopper',
    averageScore: 4,
    applicationId: 5002,
    currentInterviewStep: 'Entrevista',
  },
];

async function mockPositionBoardApi(page: Page) {
  await page.route('**/positions/1/interviewFlow', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        interviewFlow: {
          positionName: position.title,
          interviewFlow: {
            interviewSteps,
          },
        },
      }),
    });
  });

  await page.route('**/positions/1/candidates', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(candidates),
    });
  });

  await page.route('**/candidate/101', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Candidate stage updated successfully',
      }),
    });
  });
}

async function dragCandidateToPhase(page: Page, candidateTestId: string, phaseTestId: string) {
  const candidate = page.getByTestId(candidateTestId);
  const targetPhase = page.getByTestId(phaseTestId);

  const sourceBox = await candidate.boundingBox();
  const targetBox = await targetPhase.boundingBox();

  if (!sourceBox || !targetBox) {
    throw new Error('Could not resolve drag source or destination bounds');
  }

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 12 });
  await page.mouse.up();
}

test.describe('Position board', () => {
  test.beforeEach(async ({ page }) => {
    await mockPositionBoardApi(page);
  });

  test('loads the position page with phases and candidates in their current phase', async ({ page }) => {
    await page.goto('/positions/1');

    await expect(page.getByTestId('position-title')).toHaveText(position.title);
    await expect(page.getByTestId('phase-column-aplicado')).toBeVisible();
    await expect(page.getByTestId('phase-column-entrevista')).toBeVisible();
    await expect(page.getByTestId('phase-column-oferta')).toBeVisible();

    await expect(page.getByTestId('phase-column-aplicado').getByTestId('candidate-card-101')).toContainText('Ada Lovelace');
    await expect(page.getByTestId('phase-column-entrevista').getByTestId('candidate-card-102')).toContainText('Grace Hopper');
  });

  test('moves a candidate to another phase and sends the stage update to the backend', async ({ page }) => {
    await page.goto('/positions/1');
    await expect(page.getByTestId('candidate-card-101')).toBeVisible();

    const updateRequest = page.waitForRequest((request) =>
      request.method() === 'PUT' && request.url().endsWith('/candidate/101')
    );
    const updateResponse = page.waitForResponse((response) =>
      response.request().method() === 'PUT' && response.url().endsWith('/candidate/101')
    );

    await dragCandidateToPhase(page, 'candidate-card-101', 'phase-column-entrevista');

    const request = await updateRequest;
    const response = await updateResponse;

    expect(request.postDataJSON()).toEqual({
      applicationId: 5001,
      currentInterviewStep: 2,
    });
    expect(response.ok()).toBeTruthy();
    await expect(page.getByTestId('phase-column-entrevista').getByTestId('candidate-card-101')).toContainText('Ada Lovelace');
  });
});
