# Playwright-BDD Configuration

Technical reference for the playwright-bdd integration in this project.

## Stack

- **Runner**: Playwright (`@playwright/test`)
- **BDD layer**: `playwright-bdd` — Gherkin features executed directly by Playwright
- **Test data**: `@faker-js/faker`
- **Browser automation**: Playwright MCP + `playwright-cli`

## File Layout

```
frontend/
├── playwright.config.ts          # Playwright + BDD config
├── features/                     # Gherkin feature files
│   ├── *.feature
│   └── steps/                    # Step definitions
│       └── *.ts
├── pages/                        # Page Object Models
│   └── *Page.ts
├── fixtures/                     # Test data factories
│   └── *.ts
└── .features-gen/                # Auto-generated (gitignored)
    └── *.spec.js
```

## Step Definition API

```typescript
// Use playwright-bdd's createBdd(), NOT @cucumber/cucumber
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

Given('the user is on {string}', async ({ page }, path: string) => {
  await page.goto(path);
});
```

## Commands

```bash
# Generate specs from features (required before running)
npx bddgen

# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run with debug mode
npm run test:e2e:debug

# Run specific feature
npx bddgen && npx playwright test --grep "feature name"

# Stability check (3 passes)
npx bddgen && npx playwright test <file> --repeat-each=3
```

## Config Reference

```typescript
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'features/steps/**/*.ts',
});

export default defineConfig({
  testDir,  // Points to .features-gen/ (auto-generated)
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Workflow: AI-Assisted E2E

```
1. Developer describes scenario in natural language (Given/When/Then)
2. Agent navigates the live app via Playwright MCP/CLI
3. Agent writes .feature + step definitions
4. Agent runs `npx bddgen && npx playwright test`
5. Agent refines until 3 consecutive passes
6. Developer reviews and approves
```
