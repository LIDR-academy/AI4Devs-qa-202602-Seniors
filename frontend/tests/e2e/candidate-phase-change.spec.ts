import { test, expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * Scenario 2 — Candidate Phase Change (approved spec: `docs/specs/e2e/candidate-phase-change.md`).
 *
 * Prerequisites:
 * - CRA at `http://localhost:3000`, API at `http://localhost:3010`, seeded DB (`backend/prisma/seed.ts`).
 *
 * Drags **Carlos García** from **Initial Screening** to **Technical Interview**, asserts `PUT /candidates/:id`,
 * then drags back to restore seed-stable state for reruns.
 */

/**
 * Performs a drag compatible with `react-beautiful-dnd` using pointer moves between bounding boxes.
 *
 * @param page Active Playwright page.
 * @param sourceCard Locator for the draggable candidate card.
 * @param destinationColumn Locator for the column root (has `data-testid="board-column-body"`).
 */
async function dragCandidateCardToColumn(page: Page, sourceCard: Locator, destinationColumn: Locator): Promise<void> {
  const destBody = destinationColumn.getByTestId('board-column-body');
  await sourceCard.scrollIntoViewIfNeeded();
  await destBody.scrollIntoViewIfNeeded();

  const srcBox = await sourceCard.boundingBox();
  const dstBox = await destBody.boundingBox();
  if (!srcBox || !dstBox) {
    throw new Error('Could not compute bounding boxes for drag simulation.');
  }

  const startX = srcBox.x + srcBox.width / 2;
  const startY = srcBox.y + srcBox.height / 2;
  const endX = dstBox.x + dstBox.width / 2;
  const endY = dstBox.y + Math.min(120, dstBox.height / 2);

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY, { steps: 25 });
  await page.mouse.up();
}

test.describe('Candidate phase change', () => {
  test('recruiter moves candidate between hiring phases with persisted API update', async ({ page, request }) => {
    const base = 'http://localhost:3000';

    const positionsRes = await request.get('http://localhost:3010/positions');
    expect(positionsRes.ok()).toBeTruthy();
    const positions = (await positionsRes.json()) as Array<{ id: number; title: string }>;
    const engineering = positions.find((p) => p.title === 'Senior Full-Stack Engineer');
    expect(engineering, 'seeded engineering position').toBeTruthy();

    const flowRes = await request.get(`http://localhost:3010/positions/${engineering!.id}/interviewflow`);
    expect(flowRes.ok()).toBeTruthy();
    const flowPayload = (await flowRes.json()) as {
      interviewFlow: {
        interviewFlow: { interviewSteps: Array<{ id: number; name: string }> };
      };
    };
    const steps = flowPayload.interviewFlow.interviewFlow.interviewSteps;
    const technicalStep = steps.find((s) => s.name === 'Technical Interview');
    expect(technicalStep, 'Technical Interview step').toBeTruthy();
    const initialStep = steps.find((s) => s.name === 'Initial Screening');
    expect(initialStep, 'Initial Screening step').toBeTruthy();

    const candidatesRes = await request.get(`http://localhost:3010/positions/${engineering!.id}/candidates`);
    expect(candidatesRes.ok()).toBeTruthy();
    const candidates = (await candidatesRes.json()) as Array<{
      fullName: string;
      candidateId: number;
      applicationId: number;
      currentInterviewStep: string;
    }>;
    const carlos = candidates.find((c) => c.fullName === 'Carlos García');
    expect(carlos, 'Carlos García in seed').toBeTruthy();

    await page.goto(`${base}/positions`);
    const engineeringCard = page.getByTestId(`position-list-card-${engineering!.id}`);
    await engineeringCard.getByRole('button', { name: 'Ver proceso' }).click();
    await expect(page.getByRole('heading', { name: 'Senior Full-Stack Engineer' })).toBeVisible();

    const initialColumn = page.getByTestId(`board-column-${initialStep!.id}`);
    const technicalColumn = page.getByTestId(`board-column-${technicalStep!.id}`);

    const carlosCard = page.getByTestId(`candidate-card-${carlos!.candidateId}`);
    await expect(carlosCard).toBeVisible();

    const putPromise = page.waitForRequest((r) => {
      return (
        r.method() === 'PUT' &&
        r.url().includes(`http://localhost:3010/candidates/${carlos!.candidateId}`)
      );
    });

    await dragCandidateCardToColumn(page, carlosCard, technicalColumn);

    const putReq = await putPromise;
    const body = putReq.postDataJSON() as { applicationId: number; currentInterviewStep: number };
    expect(body.applicationId).toBe(carlos!.applicationId);
    expect(body.currentInterviewStep).toBe(technicalStep!.id);

    const putResp = await putReq.response();
    expect(putResp?.status()).toBe(200);

    await expect(technicalColumn.getByTestId(`candidate-card-${carlos!.candidateId}`)).toBeVisible({
      timeout: 15000,
    });

    /** Restore Initial Screening so Scenario 1 / reruns stay aligned with seed expectations. */
    const carlosAfterMove = technicalColumn.getByTestId(`candidate-card-${carlos!.candidateId}`);
    await expect(carlosAfterMove).toBeVisible();

    const restorePutPromise = page.waitForRequest((r) => {
      return (
        r.method() === 'PUT' &&
        r.url().includes(`http://localhost:3010/candidates/${carlos!.candidateId}`)
      );
    });

    await dragCandidateCardToColumn(page, carlosAfterMove, initialColumn);

    const restorePut = await restorePutPromise;
    const restoreBody = restorePut.postDataJSON() as { applicationId: number; currentInterviewStep: number };
    expect(restoreBody.applicationId).toBe(carlos!.applicationId);
    expect(restoreBody.currentInterviewStep).toBe(initialStep!.id);
    expect((await restorePut.response())?.status()).toBe(200);

    await expect(initialColumn.getByTestId(`candidate-card-${carlos!.candidateId}`)).toBeVisible({
      timeout: 15000,
    });
  });
});
