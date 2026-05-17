import { expect, test } from '@playwright/test';
import { PositionPage } from '../pages/PositionPage';
import { cancelDrag, dragCardAcrossColumns, dropOnSameColumn } from '../utils/dnd';
import {
  cloneCandidates,
  POSITION_ID,
  setupPositionRoutes,
  stepIdFor,
  type Candidate,
  type UpdateLog,
} from '../fixtures/mockApi';

/**
 * Helper — load the position and return the captured PUT-log array plus the
 * PositionPage. Each test gets its own array so logs do not leak across tests.
 */
async function loadPosition(
  page: import('@playwright/test').Page,
  options: Parameters<typeof setupPositionRoutes>[1] = {},
): Promise<{ positionPage: PositionPage; updates: UpdateLog[] }> {
  const updates = await setupPositionRoutes(page, options);
  const positionPage = new PositionPage(page);
  await positionPage.goto(POSITION_ID);
  // Wait for the board to be hydrated with cards (or at least the columns)
  await positionPage.columnHeaders().first().waitFor();
  return { positionPage, updates };
}

test.describe('Scenario 2 — Changing a Candidate\'s Phase', () => {
  test.describe('Happy path', () => {
    test('[S2-TC01] should visually move a card from a source column to an adjacent target column', async ({ page }) => {
      // Arrange
      const { positionPage } = await loadPosition(page);
      const candidate = cloneCandidates().find((c) => c.currentInterviewStep === 'Applied')!;
      await positionPage.expectCardInColumn(candidate.candidateId, 'Applied');

      // Act
      await dragCardAcrossColumns(page, positionPage.card(candidate.candidateId), 1);

      // Assert
      await positionPage.expectCardInColumn(candidate.candidateId, 'Interview');
      await positionPage.expectCardNotInColumn(candidate.candidateId, 'Applied');
    });

    test('[S2-TC02] should trigger PUT /candidates/:id with the correct URL and body on a successful drop', async ({ page }) => {
      // Arrange
      const { positionPage, updates } = await loadPosition(page);
      const candidate = cloneCandidates().find((c) => c.currentInterviewStep === 'Applied')!;
      const targetStepId = stepIdFor('Interview');
      const putWaiter = page.waitForRequest(
        (req) =>
          req.method() === 'PUT' &&
          req.url().endsWith(`/candidates/${candidate.candidateId}`),
      );

      // Act
      await dragCardAcrossColumns(page, positionPage.card(candidate.candidateId), 1);
      const putRequest = await putWaiter;

      // Assert — request shape
      expect(putRequest.method()).toBe('PUT');
      expect(putRequest.url()).toMatch(new RegExp(`/candidates/${candidate.candidateId}$`));
      const body = JSON.parse(putRequest.postData() ?? '{}');
      expect(body).toEqual({
        applicationId: candidate.applicationId,
        currentInterviewStep: targetStepId,
      });

      // Assert — exactly one PUT was issued
      expect(updates).toHaveLength(1);
      expect(updates[0].candidateId).toBe(String(candidate.candidateId));
    });

    test('[S2-TC03] should keep the UI consistent with the backend response after a successful drop', async ({ page }) => {
      // Arrange
      const { positionPage } = await loadPosition(page);
      const candidate = cloneCandidates().find((c) => c.currentInterviewStep === 'Applied')!;

      // Act
      await dragCardAcrossColumns(page, positionPage.card(candidate.candidateId), 1);
      // Give the PUT a moment to settle
      await page.waitForTimeout(200);

      // Assert — no duplicate, card in destination only
      await expect(positionPage.card(candidate.candidateId)).toHaveCount(1);
      await positionPage.expectCardInColumn(candidate.candidateId, 'Interview');
    });
  });

  test.describe('Corner cases', () => {
    test('[S2-TC04] should persist the final destination when a card is dragged across multiple columns', async ({ page }) => {
      // Arrange — drag from Applied to Offer (3 columns within the first row).
      // The catalog uses "e.g. Applied → Hired" as an example; the invariant
      // being verified is "final destination is persisted, exactly one PUT
      // with the destination step id". Multi-row drags (e.g. Applied → Hired)
      // are blocked by the wrapped Bootstrap grid in this layout — see
      // OQ-9 in docs/position-e2e-test-cases.md.
      const { positionPage, updates } = await loadPosition(page);
      const candidate = cloneCandidates().find((c) => c.currentInterviewStep === 'Applied')!;
      const offerStepId = stepIdFor('Offer');

      // Act — keyboard ArrowRight × 3 lands in Offer
      await dragCardAcrossColumns(page, positionPage.card(candidate.candidateId), 3);

      // Assert
      await positionPage.expectCardInColumn(candidate.candidateId, 'Offer');
      expect(updates).toHaveLength(1);
      expect(updates[0].body).toEqual({
        applicationId: candidate.applicationId,
        currentInterviewStep: offerStepId,
      });
    });

    test('[S2-TC05] should keep the card in place when dropped back onto the original column', async ({ page }) => {
      // Arrange
      const { positionPage, updates } = await loadPosition(page);
      const candidate = cloneCandidates().find((c) => c.currentInterviewStep === 'Applied')!;
      const appliedStepId = stepIdFor('Applied');

      // Act — lift and drop immediately
      await dropOnSameColumn(page, positionPage.card(candidate.candidateId));
      await page.waitForTimeout(200);

      // Assert — card stays in Applied
      await positionPage.expectCardInColumn(candidate.candidateId, 'Applied');

      // The current implementation issues a PUT even when source = destination
      // (no equality short-circuit in onDragEnd). Per catalog OQ-5, either
      // outcome is acceptable as long as the network call is a no-op.
      // Allow 0 or 1 PUTs; if a PUT was sent, its body must target the same
      // step (effectively a no-op).
      expect(updates.length, 'PUT count should be 0 (ideal) or 1 (current impl no-op)').toBeLessThanOrEqual(1);
      if (updates.length === 1) {
        expect(updates[0].body.currentInterviewStep).toBe(appliedStepId);
        expect(updates[0].body.applicationId).toBe(candidate.applicationId);
      }
    });

    test('[S2-TC06] should not trigger any PUT and should return the card to its source when the drag is cancelled (Escape)', async ({ page }) => {
      // Arrange
      const { positionPage, updates } = await loadPosition(page);
      const candidate = cloneCandidates().find((c) => c.currentInterviewStep === 'Applied')!;

      // Act
      await cancelDrag(page, positionPage.card(candidate.candidateId));
      await page.waitForTimeout(200);

      // Assert
      await positionPage.expectCardInColumn(candidate.candidateId, 'Applied');
      expect(updates).toHaveLength(0);
    });

    test('[S2-TC07] should issue one correct PUT per move when several candidates are moved sequentially', async ({ page }) => {
      // Arrange
      const { positionPage, updates } = await loadPosition(page);
      const c1 = cloneCandidates().find((c) => c.candidateId === 101)!; // Applied → Offer
      const c2 = cloneCandidates().find((c) => c.candidateId === 103)!; // Interview → Technical Test

      // Act — move c1 (Applied idx 0 → Offer idx 3 → delta +3)
      await dragCardAcrossColumns(page, positionPage.card(c1.candidateId), 3);
      await page.waitForTimeout(150);
      // Move c2 (Interview idx 1 → Technical Test idx 2 → delta +1)
      await dragCardAcrossColumns(page, positionPage.card(c2.candidateId), 1);

      // Assert — both cards in expected columns
      await positionPage.expectCardInColumn(c1.candidateId, 'Offer');
      await positionPage.expectCardInColumn(c2.candidateId, 'Technical Test');

      // Assert — two PUTs, one per candidate, with correct payloads
      expect(updates).toHaveLength(2);
      const log1 = updates.find((u) => u.candidateId === String(c1.candidateId));
      const log2 = updates.find((u) => u.candidateId === String(c2.candidateId));
      expect(log1?.body).toEqual({ applicationId: c1.applicationId, currentInterviewStep: stepIdFor('Offer') });
      expect(log2?.body).toEqual({ applicationId: c2.applicationId, currentInterviewStep: stepIdFor('Technical Test') });
    });

    test('[S2-TC08] should issue an independent PUT each time the same candidate is moved consecutively across phases', async ({ page }) => {
      // Arrange
      const { positionPage, updates } = await loadPosition(page);
      const candidate = cloneCandidates().find((c) => c.candidateId === 101)!; // starts in Applied

      // Act
      await dragCardAcrossColumns(page, positionPage.card(candidate.candidateId), 1); // → Interview
      await page.waitForTimeout(150);
      await dragCardAcrossColumns(page, positionPage.card(candidate.candidateId), 1); // → Technical Test
      await page.waitForTimeout(150);
      await dragCardAcrossColumns(page, positionPage.card(candidate.candidateId), 1); // → Offer

      // Assert — final position and three independent PUTs in order
      await positionPage.expectCardInColumn(candidate.candidateId, 'Offer');
      expect(updates).toHaveLength(3);
      expect(updates.map((u) => u.body.currentInterviewStep)).toEqual([
        stepIdFor('Interview'),
        stepIdFor('Technical Test'),
        stepIdFor('Offer'),
      ]);
      expect(updates.every((u) => u.candidateId === String(candidate.candidateId))).toBe(true);
      expect(updates.every((u) => u.body.applicationId === candidate.applicationId)).toBe(true);
    });

    test('[S2-TC09] should serialize drags so the UI never enters an inconsistent state under rapid interaction', async ({ page }) => {
      // Arrange
      const { positionPage, updates } = await loadPosition(page);
      const c1 = cloneCandidates().find((c) => c.candidateId === 101)!; // Applied → Interview
      const c2 = cloneCandidates().find((c) => c.candidateId === 102)!; // Applied → Interview

      // Act — drive two drags back-to-back without overlapping (the library
      // serializes drags by design; we verify no UI corruption results from
      // rapid sequential interaction).
      await dragCardAcrossColumns(page, positionPage.card(c1.candidateId), 1);
      await dragCardAcrossColumns(page, positionPage.card(c2.candidateId), 1);

      // Assert — both cards end up in Interview, exactly one instance each,
      // and two PUTs were issued in total.
      await positionPage.expectCardInColumn(c1.candidateId, 'Interview');
      await positionPage.expectCardInColumn(c2.candidateId, 'Interview');
      await expect(positionPage.card(c1.candidateId)).toHaveCount(1);
      await expect(positionPage.card(c2.candidateId)).toHaveCount(1);
      expect(updates).toHaveLength(2);
    });
  });

  test.describe('Error cases', () => {
    test('[S2-TC10] should revert the card and notify the user when the PUT returns 4xx', async ({ page }) => {
      // The current implementation does NOT revert and does NOT notify on
      // PUT failure (only console.error). The catalog (OQ-6) defines this as
      // a defect; we mark the test as expected-to-fail so CI stays green
      // while the gap is documented.
      test.fail(true, 'Bug: PositionDetails.js:72-77 only logs to console; UI is not reverted and no toast is shown.');

      const { positionPage, updates } = await loadPosition(page, {
        updateCandidate: { status: 400, body: { message: 'Bad request' } },
      });
      const candidate = cloneCandidates().find((c) => c.currentInterviewStep === 'Applied')!;

      // Act
      await dragCardAcrossColumns(page, positionPage.card(candidate.candidateId), 1);
      await page.waitForTimeout(400);

      // Assert (desired behaviour)
      expect(updates).toHaveLength(1);
      await positionPage.expectCardInColumn(candidate.candidateId, 'Applied');
      await positionPage.expectCardNotInColumn(candidate.candidateId, 'Interview');
      await expect(page.getByRole('alert')).toBeVisible();
    });

    test('[S2-TC11] should revert the card and notify the user when the PUT returns 5xx', async ({ page }) => {
      // Same defect path as S2-TC10. See catalog OQ-6.
      test.fail(true, 'Bug: PositionDetails.js:72-77 only logs to console; UI is not reverted and no toast is shown.');

      const { positionPage, updates } = await loadPosition(page, {
        updateCandidate: { status: 500, body: { message: 'Internal error' } },
      });
      const candidate = cloneCandidates().find((c) => c.currentInterviewStep === 'Applied')!;

      // Act
      await dragCardAcrossColumns(page, positionPage.card(candidate.candidateId), 1);
      await page.waitForTimeout(400);

      // Assert (desired behaviour)
      expect(updates).toHaveLength(1);
      await positionPage.expectCardInColumn(candidate.candidateId, 'Applied');
      await expect(page.getByRole('alert')).toBeVisible();
    });

    test('[S2-TC12] should remain responsive without orphaned drag overlay when the PUT request is aborted', async ({ page }) => {
      // Arrange — PUT route is aborted at the network layer
      const { positionPage, updates } = await loadPosition(page, {
        updateCandidate: { abort: 'failed' },
      });
      const candidate = cloneCandidates().find((c) => c.currentInterviewStep === 'Applied')!;

      // Act
      await dragCardAcrossColumns(page, positionPage.card(candidate.candidateId), 1);
      await page.waitForTimeout(400);

      // Assert — exactly one PUT attempted; UI is not frozen (subsequent drag works)
      expect(updates).toHaveLength(1);
      // No leftover drag-overlay class should be active on body
      // (react-beautiful-dnd cleans up `data-rbd-drag-handle-context-id` styles).
      // A subsequent drag must still succeed:
      const other = cloneCandidates().find((c) => c.candidateId === 102)!;
      await dragCardAcrossColumns(page, positionPage.card(other.candidateId), 1);
      await positionPage.expectCardInColumn(other.candidateId, 'Interview');
    });

    test('[S2-TC13] should send exactly one PUT per drag even when the response is slow', async ({ page }) => {
      // Arrange — 1500 ms delay on PUT but eventual success
      const { positionPage, updates } = await loadPosition(page, {
        updateCandidate: { status: 200, body: { message: 'ok' }, delayMs: 1500 },
      });
      const candidate = cloneCandidates().find((c) => c.currentInterviewStep === 'Applied')!;

      // Act
      await dragCardAcrossColumns(page, positionPage.card(candidate.candidateId), 1);

      // Assert — card moves optimistically (before the response lands)
      await positionPage.expectCardInColumn(candidate.candidateId, 'Interview');

      // Wait for the slow response to arrive and verify a single PUT
      await page.waitForTimeout(1800);
      expect(updates).toHaveLength(1);
      await positionPage.expectCardInColumn(candidate.candidateId, 'Interview');
    });
  });
});
