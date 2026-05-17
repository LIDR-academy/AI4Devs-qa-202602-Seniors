import { test, expect } from '@playwright/test';
import {
  HIRING_PHASES,
  mockCandidate,
  mockInterviewFlowResponse,
} from './fixtures/hiringPipeline';
import { createHiringApiMock, readLastPut } from './helpers/mockHiringApi';

const POSITION_ID = 2;
const PIPELINE_PATH = `/positions/${POSITION_ID}`;
const POSITION_TITLE =
  mockInterviewFlowResponse.interviewFlow.positionName;

/** Simula drag para react-beautiful-dnd (dragTo nativo suele fallar). */
async function dragBeautifulDnd(
  page: import('@playwright/test').Page,
  source: import('@playwright/test').Locator,
  target: import('@playwright/test').Locator
) {
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();
  if (!sourceBox || !targetBox) {
    throw new Error('No se pudo obtener bounding box para drag');
  }
  await page.mouse.move(
    sourceBox.x + sourceBox.width / 2,
    sourceBox.y + sourceBox.height / 2
  );
  await page.mouse.down();
  await page.mouse.move(
    targetBox.x + targetBox.width / 2,
    targetBox.y + targetBox.height / 2,
    { steps: 12 }
  );
  await page.mouse.up();
}

function kanbanColumn(page: import('@playwright/test').Page, phaseName: string) {
  return page.locator('.card.mb-4').filter({
    has: page.locator('.card-header', { hasText: phaseName }),
  });
}

test.describe('Position pipeline (Kanban)', () => {
  const apiMock = createHiringApiMock();

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.textContent =
        '#webpack-dev-server-client-overlay { display: none !important; pointer-events: none !important; }';
      document.head.appendChild(style);
    });
    apiMock.reset();
    await apiMock.install(page, POSITION_ID);
    await page.goto(PIPELINE_PATH, { waitUntil: 'networkidle' });
    await expect(page.locator('h2', { hasText: POSITION_TITLE })).toBeVisible({
      timeout: 15_000,
    });
  });

  test('Escenario 1: carga la pantalla de position con título, fases y candidatos', async ({
    page,
  }) => {
    await expect(page.locator('h2', { hasText: POSITION_TITLE })).toBeVisible();

    for (const phase of HIRING_PHASES) {
      await expect(page.locator('.card-header', { hasText: phase })).toBeVisible();
    }

    const initialColumn = kanbanColumn(page, 'Initial Screening');
    const technicalColumn = kanbanColumn(page, 'Technical Interview');

    await expect(initialColumn.getByText(mockCandidate.fullName)).toBeVisible();
    await expect(technicalColumn.getByText(mockCandidate.fullName)).not.toBeVisible();
  });

  test('Escenario 2: arrastra candidato a otra fase y persiste con PUT al backend', async ({
    page,
  }) => {
    const targetPhase = 'Technical Interview';
    const targetStepId =
      mockInterviewFlowResponse.interviewFlow.interviewFlow.interviewSteps.find(
        (s) => s.name === targetPhase
      )!.id;

    const card = page.locator(
      `[data-rbd-draggable-id="${mockCandidate.candidateId}"]`
    );
    const targetDroppable = page.locator('[data-rbd-droppable-id="1"]');

    await expect(card).toBeVisible();
    await dragBeautifulDnd(page, card, targetDroppable);

    await expect
      .poll(async () => readLastPut(page))
      .toMatchObject({
        body: {
          applicationId: mockCandidate.applicationId,
          currentInterviewStep: targetStepId,
        },
        status: 200,
      });

    const technicalColumn = kanbanColumn(page, targetPhase);
    const initialColumn = kanbanColumn(page, 'Initial Screening');

    await expect(technicalColumn.getByText(mockCandidate.fullName)).toBeVisible();
    await expect(initialColumn.getByText(mockCandidate.fullName)).not.toBeVisible();
  });
});
