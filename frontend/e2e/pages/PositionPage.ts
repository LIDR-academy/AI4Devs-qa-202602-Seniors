import { expect, type Locator, type Page } from '@playwright/test';

export class PositionPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(positionId: string): Promise<void> {
    await this.page.goto(`/positions/${positionId}`);
  }

  title(): Locator {
    return this.page.getByTestId('position-title');
  }

  loadingIndicator(): Locator {
    return this.page.getByTestId('position-loading');
  }

  emptyState(): Locator {
    return this.page.getByTestId('position-empty');
  }

  columnHeaders(): Locator {
    return this.page.getByTestId('stage-column-header');
  }

  column(phaseName: string): Locator {
    return this.page.getByTestId(`stage-column-${phaseName}`);
  }

  cardsIn(phaseName: string): Locator {
    return this.column(phaseName).locator('[data-testid^="candidate-card-"]');
  }

  card(candidateId: number | string): Locator {
    return this.page.getByTestId(`candidate-card-${candidateId}`);
  }

  async expectPositionTitle(expected: string): Promise<void> {
    await expect(this.title()).toHaveText(expected);
  }

  async expectColumnsInOrder(phaseNames: string[]): Promise<void> {
    const headers = this.columnHeaders();
    await expect(headers).toHaveCount(phaseNames.length);
    for (let i = 0; i < phaseNames.length; i++) {
      await expect(headers.nth(i)).toHaveText(phaseNames[i]);
    }
  }

  async expectCardInColumn(candidateId: number | string, phaseName: string): Promise<void> {
    const inColumn = this.column(phaseName).locator(`[data-testid="candidate-card-${candidateId}"]`);
    await expect(inColumn).toHaveCount(1);
  }

  async expectCardNotInColumn(candidateId: number | string, phaseName: string): Promise<void> {
    const inColumn = this.column(phaseName).locator(`[data-testid="candidate-card-${candidateId}"]`);
    await expect(inColumn).toHaveCount(0);
  }
}
