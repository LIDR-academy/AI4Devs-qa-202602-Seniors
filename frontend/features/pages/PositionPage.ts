import { type Page, type Response } from '@playwright/test';

// Slug helper — matches the data-testid encoding in StageColumn.js
function columnSlug(phaseName: string): string {
  return phaseName.toLowerCase().replace(/\s+/g, '-');
}

export class PositionPage {
  constructor(private readonly page: Page) {}

  // ── Navigation ─────────────────────────────────────────────────────────────

  async navigate(positionId: number | string = 1): Promise<void> {
    // Register response listeners before goto so they capture the post-mount useEffect fetches
    const interviewFlowDone = this.page.waitForResponse(
      (resp) => resp.url().includes('/interviewFlow') && resp.status() === 200,
    );
    const candidatesDone = this.page.waitForResponse(
      (resp) =>
        resp.url().includes('/candidates') &&
        resp.request().method() === 'GET' &&
        resp.status() === 200,
    );
    await this.page.goto(`/positions/${positionId}`);
    await Promise.all([interviewFlowDone, candidatesDone]);
  }

  // ── Locators ───────────────────────────────────────────────────────────────

  title() {
    return this.page.getByTestId('position-title');
  }

  // data-testid="column-initial-screening", "column-technical-interview", etc.
  column(phaseName: string) {
    return this.page.getByTestId(`column-${columnSlug(phaseName)}`);
  }

  // data-testid="candidate-card-{candidateId}"
  candidateCard(candidateId: string) {
    return this.page.getByTestId(`candidate-card-${candidateId}`);
  }

  // Candidate card scoped within a specific phase column
  candidateInColumn(phaseName: string, candidateId: string) {
    return this.column(phaseName).getByTestId(`candidate-card-${candidateId}`);
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  // Drags a candidate card to a destination column and returns the captured PUT response.
  // Registers the waitForResponse listener BEFORE the drag so no race condition occurs.
  async dragCandidateToColumn(candidateId: string, destPhaseName: string): Promise<Response> {
    const card = this.candidateCard(candidateId);
    const target = this.column(destPhaseName);

    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/candidates/') && resp.request().method() === 'PUT',
      { timeout: 15000 },
    );

    const cardBox = await card.boundingBox();
    const targetBox = await target.boundingBox();
    if (!cardBox || !targetBox) {
      throw new Error(
        `Bounding box unavailable — card: ${!!cardBox}, target: ${!!targetBox}`,
      );
    }

    const startX = cardBox.x + cardBox.width / 2;
    const startY = cardBox.y + cardBox.height / 2;
    const endX = targetBox.x + targetBox.width / 2;
    // Target the upper portion of the column to avoid landing on an existing card
    const endY = targetBox.y + 30;

    // react-beautiful-dnd v13 requires a pointer-event sequence:
    // hover → mousedown → small shift (triggers drag start) → move to target → mouseup
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX, startY - 5, { steps: 2 });
    await this.page.mouse.move(endX, endY, { steps: 30 });
    await this.page.mouse.up();

    return responsePromise;
  }
}
