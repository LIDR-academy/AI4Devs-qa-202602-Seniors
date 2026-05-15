# Page Object Model (POM)

Pattern for encapsulating page interactions behind a clean API. Tests read like specifications, POMs handle mechanics.

## Rules

1. **Extract page interactions into POM classes**: Tests should not contain raw selectors or page interactions.
2. **Steps are thin wrappers**: Step definitions call POM methods, nothing else.
3. **Update POM, not tests**: When UI changes, modify the POM. Tests remain stable.
4. **One POM per page/view**: Each significant page gets its own class.

## Discovery Process (2-step)

**Step 1**: Explore with Playwright MCP
```bash
playwright-cli goto http://localhost:3000/<page>
playwright-cli snapshot
# Identify interactive elements, their roles, and testids
```

**Step 2**: Generate POM from exploration
```typescript
// pages/PositionKanbanPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class PositionKanbanPage {
  readonly page: Page;
  readonly title: Locator;
  readonly columns: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('position-title');
    this.columns = page.getByTestId(/^phase-column-/);
    this.backButton = page.getByRole('link', { name: /back/i });
  }

  async goto(positionId: number) {
    await this.page.goto(`/positions/${positionId}`);
    await expect(this.title).toBeVisible();
  }

  candidateCard(id: number): Locator {
    return this.page.getByTestId(`candidate-card-${id}`);
  }

  column(phase: string): Locator {
    return this.page.getByTestId(`phase-column-${phase}`);
  }
}
```

## POM Conventions

| Convention | Example |
|-----------|---------|
| File location | `frontend/pages/<PageName>Page.ts` |
| Class name | `<PageName>Page` |
| Navigation method | `async goto(params)` |
| Element access | `readonly` Locator properties |
| Actions | Methods named by business intent (`submitForm`, `filterByPhase`) |
| Assertions | `async expectVisible()`, `async expectError(msg)` |

## Step Definitions Using POM

```typescript
import { createBdd } from 'playwright-bdd';
import { PositionKanbanPage } from '../pages/PositionKanbanPage';

const { Given, When, Then } = createBdd();

Given('the recruiter views position {int}', async ({ page }, id: number) => {
  const kanban = new PositionKanbanPage(page);
  await kanban.goto(id);
});

Then('the candidate {string} is in column {string}', async ({ page }, name: string, column: string) => {
  const kanban = new PositionKanbanPage(page);
  await expect(kanban.column(column).getByText(name)).toBeVisible();
});
```
