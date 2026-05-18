import { Page, Locator } from '@playwright/test';
import { KanbanColumn } from '../components/KanbanColumn';
import { POSITION_ID } from '../fixtures/hiring-pipeline';

export class PositionPipelinePage {
  readonly page: Page;
  readonly positionTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    // PositionDetails renders <h2 className="text-center mb-4">{positionName}</h2>
    this.positionTitle = page.getByRole('heading', { level: 2 });
  }

  async navigate(positionId: string = POSITION_ID): Promise<void> {
    await this.page.goto(`/positions/${positionId}`);
    await this.positionTitle.waitFor({ state: 'visible' });
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.positionTitle.waitFor({ state: 'visible' });
  }

  getColumn(phaseName: string): KanbanColumn {
    return new KanbanColumn(this.page, phaseName);
  }

  async waitForPhases(phases: string[]): Promise<void> {
    for (const phase of phases) {
      await this.page
        .locator('.card-header', { hasText: phase })
        .waitFor({ state: 'visible' });
    }
  }
}
