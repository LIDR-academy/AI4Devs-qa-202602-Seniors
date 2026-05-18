import { Page, Locator } from '@playwright/test';

export class KanbanColumn {
  readonly page: Page;
  readonly phaseName: string;
  readonly header: Locator;
  readonly column: Locator;

  constructor(page: Page, phaseName: string) {
    this.page = page;
    this.phaseName = phaseName;
    // StageColumn renders <div class="card-header text-center">{stage.title}</div>
    this.header = page.locator('.card-header', { hasText: phaseName });
    // Parent .card is the Droppable container (only column cards have .card-header)
    this.column = page
      .locator('.card', { has: page.locator('.card-header', { hasText: phaseName }) })
      .first();
  }

  // CandidateCard is a [data-rbd-draggable-id] element inside the column
  getCandidateCard(candidateName: string): Locator {
    return this.column
      .locator('[data-rbd-draggable-id]')
      .filter({ hasText: candidateName });
  }

  async hasCandidate(candidateName: string): Promise<boolean> {
    return (await this.getCandidateCard(candidateName).count()) > 0;
  }

  // react-beautiful-dnd ignores native HTML5 drag events.
  // Use mouse pointer sequence: mousedown → small nudge (activates rbd) → move to target → mouseup.
  async dragCardTo(candidateName: string, target: KanbanColumn): Promise<void> {
    const card = this.getCandidateCard(candidateName);
    await card.waitFor({ state: 'visible' });

    const cardBox = await card.boundingBox();
    const targetBody = target.column.locator('.card-body').first();
    const targetBox = await targetBody.boundingBox();

    if (!cardBox || !targetBox) {
      throw new Error(
        `dragCardTo: bounding boxes not resolved — "${candidateName}" → "${target.phaseName}"`
      );
    }

    const fromX = cardBox.x + cardBox.width / 2;
    const fromY = cardBox.y + cardBox.height / 2;
    const toX   = targetBox.x + targetBox.width / 2;
    const toY   = targetBox.y + targetBox.height / 2;

    await this.page.mouse.move(fromX, fromY);
    await this.page.mouse.down();
    // Small nudge to cross rbd's drag-activation threshold
    await this.page.mouse.move(fromX, fromY - 4, { steps: 4 });
    // Slow move to target so rbd registers the droppable hover
    await this.page.mouse.move(toX, toY, { steps: 30 });
    await this.page.mouse.up();
  }

  // Drag card but release at the top of the page (outside any column)
  async dragCardOutsideBoard(candidateName: string): Promise<void> {
    const card = this.getCandidateCard(candidateName);
    await card.waitFor({ state: 'visible' });

    const cardBox = await card.boundingBox();
    if (!cardBox) throw new Error(`dragCardOutsideBoard: card "${candidateName}" not found`);

    const fromX = cardBox.x + cardBox.width / 2;
    const fromY = cardBox.y + cardBox.height / 2;

    await this.page.mouse.move(fromX, fromY);
    await this.page.mouse.down();
    await this.page.mouse.move(fromX, fromY - 4, { steps: 4 });
    // Release near the page top, well outside the kanban area
    await this.page.mouse.move(fromX, 10, { steps: 20 });
    await this.page.mouse.up();
  }

  // Drag card within the same column (no phase change)
  async dragCardWithinColumn(candidateName: string): Promise<void> {
    const card = this.getCandidateCard(candidateName);
    await card.waitFor({ state: 'visible' });

    const cardBox = await card.boundingBox();
    const columnBox = await this.column.boundingBox();
    if (!cardBox || !columnBox) throw new Error(`dragCardWithinColumn: bounding box not resolved`);

    const fromX = cardBox.x + cardBox.width / 2;
    const fromY = cardBox.y + cardBox.height / 2;
    // Drop at the bottom of the same column body
    const toX = columnBox.x + columnBox.width / 2;
    const toY = columnBox.y + columnBox.height - 10;

    await this.page.mouse.move(fromX, fromY);
    await this.page.mouse.down();
    await this.page.mouse.move(fromX, fromY - 4, { steps: 4 });
    await this.page.mouse.move(toX, toY, { steps: 20 });
    await this.page.mouse.up();
  }
}
