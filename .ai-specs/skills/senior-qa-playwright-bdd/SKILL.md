---
name: "senior-qa-playwright-bdd"
description: Extends senior-qa with Playwright BDD conventions for React/Next.js applications. Installs playwright-bdd and @playwright/cli, configures playwright.config.ts with defineBddConfig, authors Gherkin .feature files, writes createBdd() step definitions, and runs npx bddgen && npx playwright test. Use when E2E tests must be written as Gherkin scenarios rather than plain .spec.ts files, when setting up playwright-bdd, when writing .feature files or step definitions, or when enforcing BDD best practices (domain language, Scenario Outline, Background, one When per scenario).
---

# Senior QA — Playwright BDD Extension

## Description

Extends `senior-qa` with Playwright BDD conventions: Gherkin `.feature` files, `playwright-bdd` tooling, `bddgen` pipeline, and browser exploration via Playwright CLI. Invoke whenever E2E tests must be written as Gherkin scenarios rather than plain `.spec.ts` files.

## Extends

`senior-qa` — all capabilities of `senior-qa` are inherited unchanged:
- Codebase analysis and component scanning
- Jest + React Testing Library unit/integration test generation
- Istanbul/LCOV coverage analysis
- MSW API mocking patterns
- Playwright locator conventions (role-based, accessible selectors)
- Accessibility testing with jest-axe and @axe-core/playwright
- Code review and quality guardrails

This skill adds **only** what `senior-qa` does not cover.

---

## What This Skill Adds

### 1. Installation

Install alongside `@playwright/test`:

```bash
npm install --save-dev playwright-bdd @playwright/cli
npx playwright install --with-deps
```

### 2. `playwright.config.ts` — `defineBddConfig` block

All Playwright BDD projects must include a `defineBddConfig` block:

```typescript
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/steps/*.ts',
});

export default defineConfig({
  testDir,
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    headless: true,
  },
  reporter: [['html', { outputFolder: 'playwright-report' }]],
});
```

The `features` glob points to `.feature` files; `steps` points to step definition files. Never combine with plain `.spec.ts` E2E tests in the same `testDir`.

### 3. Feature files — Gherkin conventions

All E2E tests must be written as Gherkin in `.feature` files. Never write plain `.spec.ts` files for E2E scenarios covered here.

**Gherkin best practices enforced by this skill:**

| Rule | Correct | Wrong |
|------|---------|-------|
| One `When` per scenario | `When the candidate is moved to "Hired"` | `When I click the card / And I drag it / And I drop it` |
| Domain language, not UI imperatives | `When the candidate advances to the next phase` | `When I click the drag handle and drop it on column 2` |
| No CSS selectors or element attributes in steps | `When the recruiter opens the position` | `When I click "#position-btn.active"` |
| `Scenario Outline` + `Examples` for data-driven cases | See example below | Copying the same scenario N times |
| `Background` for shared preconditions | `Background: Given the position page is loaded` | Repeating `Given` in every scenario |

**Example `.feature` file structure:**

```gherkin
Feature: Position board

  Background:
    Given the position page is loaded with its candidates

  Scenario: Initial board renders correctly
    Then the position title is visible
    And all phase columns are displayed
    And each candidate appears in their assigned column

  Scenario Outline: Candidate advances to a new phase
    When the candidate "<candidate>" moves to the "<target_phase>" column
    Then a phase-change request is sent for "<candidate>" with phase "<target_phase>"
    And the candidate appears in the "<target_phase>" column

    Examples:
      | candidate   | target_phase |
      | Jane Doe    | Interview    |
      | John Smith  | Offer        |
```

### 4. Step definitions — `createBdd()` pattern

Step definitions must use `createBdd()` from `playwright-bdd` with Playwright fixtures:

```typescript
import { createBdd } from 'playwright-bdd';
import { test } from '@playwright/test';

const { Given, When, Then } = createBdd(test);

Given('the position page is loaded with its candidates', async ({ page }) => {
  await page.goto('/position/1');
  await page.waitForLoadState('networkidle');
});

When('the candidate {string} moves to the {string} column', async ({ page }, candidate, targetPhase) => {
  // use role-based locators; drag via library-matched simulation
});

Then('a phase-change request is sent for {string} with phase {string}', async ({ page }, candidate, targetPhase) => {
  // use page.waitForResponse to intercept PUT /candidate/:id
});
```

**Step definition rules:**
- Always use `createBdd(test)` — never import `Given/When/Then` from `@cucumber/cucumber`.
- Use `page.waitForResponse` for API interception, not `page.route` alone.
- Use role-based Playwright locators (from `senior-qa` conventions) — never hardcode CSS selectors.
- Never use `waitForTimeout`. Use `waitForLoadState`, `waitForResponse`, or `waitForSelector`.
- Drag simulation must match the library identified in `repo-summary.md` (see `repo-analysis` skill).

### 5. Execution pipeline

Always run both steps in order:

```bash
npx bddgen          # generates Playwright test files from .feature files
npx playwright test # executes the generated tests
```

Never run `npx playwright test` alone for BDD tests — `bddgen` must run first to regenerate test files from the current `.feature` source.

### 6. Browser exploration during authoring

All live browser exploration must use the **Playwright CLI** (`@playwright/cli`):

```bash
playwright-cli open <url>
playwright-cli snapshot <output.yaml>
playwright-cli click "<selector>"
playwright-cli type "<selector>" "<value>"
playwright-cli screenshot <output.png>
playwright-cli state-save <auth.json>
```

Snapshots are saved as YAML files to disk. Agents read them selectively to derive accessible role-based selectors. Do not use the Playwright MCP server.

---

## Guardrails

Inherited from `senior-qa`:
- Use role-based accessible selectors; avoid CSS selectors and test IDs unless unavoidable.
- Never use `waitForTimeout`.
- Do not duplicate test logic across files — use fixtures and `Background` for shared setup.

BDD-specific additions:
- **Never** write plain `.spec.ts` E2E files — all E2E scenarios go in `.feature` files.
- **Never** use the Playwright MCP server — always use Playwright CLI.
- **Never** describe UI clicks or CSS selectors in Gherkin steps.
- **Never** run `npx playwright test` without running `npx bddgen` first.
- **Never** use `@cucumber/cucumber` imports — use `createBdd()` from `playwright-bdd`.
- One `When` clause per scenario — split scenarios if more are needed.
