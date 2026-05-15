import { Page, Locator, expect } from '@playwright/test';

export class PositionDetailsPage {
  readonly page: Page;
  readonly title: Locator;
  readonly stageColumns: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('position-title');
    this.stageColumns = page.locator('[data-testid^="stage-column-"]:not([data-testid="stage-column-header"])');
  }

  async goto(positionId: number) {
    await this.page.goto(`/positions/${positionId}`);
    await expect(this.title).toBeVisible();
  }

  stageColumn(index: number): Locator {
    return this.page.getByTestId(`stage-column-${index}`);
  }

  stageColumnHeader(index: number): Locator {
    return this.stageColumn(index).getByTestId('stage-column-header');
  }

  candidateCard(id: string): Locator {
    return this.page.getByTestId(`candidate-card-${id}`);
  }

  candidateName(id: string): Locator {
    return this.candidateCard(id).getByTestId('candidate-name');
  }

  async getStageColumnCount(): Promise<number> {
    return this.stageColumns.count();
  }

  async getCandidateIdsInColumn(index: number): Promise<string[]> {
    const column = this.stageColumn(index);
    const cards = column.locator('[data-testid^="candidate-card-"]');
    const count = await cards.count();
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      const testId = await cards.nth(i).getAttribute('data-testid');
      if (testId) {
        ids.push(testId.replace('candidate-card-', ''));
      }
    }
    return ids;
  }

  async dragCandidateToColumn(candidateId: string, targetColumnIndex: number) {
    const card = this.candidateCard(candidateId);
    const targetColumn = this.stageColumn(targetColumnIndex).locator('.card-body');

    const cardBox = await card.boundingBox();
    const targetBox = await targetColumn.boundingBox();

    if (!cardBox || !targetBox) {
      throw new Error('Cannot get bounding boxes for drag operation');
    }

    const startX = cardBox.x + cardBox.width / 2;
    const startY = cardBox.y + cardBox.height / 2;
    const endX = targetBox.x + targetBox.width / 2;
    const endY = targetBox.y + targetBox.height / 2;

    // react-beautiful-dnd requires: mousedown → small move to start drag → move to target → drop
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    // Small initial move to trigger drag detection
    await this.page.mouse.move(startX + 5, startY + 5, { steps: 5 });
    await this.page.waitForTimeout(200);
    // Move to target
    await this.page.mouse.move(endX, endY, { steps: 20 });
    await this.page.waitForTimeout(200);
    await this.page.mouse.up();
    await this.page.waitForTimeout(300);
  }
}
