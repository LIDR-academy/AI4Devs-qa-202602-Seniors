---
name: playwright-e2e
description: Playwright test automation for E2E testing. Use when setting up Playwright, writing E2E tests, running browser automation, or integrating Playwright with CI/CD.
trigger: /playwright
author: AI4Devs
version: 1.0.0
prerequisites:
  - bdd-e2e
---

# Playwright E2E Testing

## When to Use

- Setting up Playwright for E2E testing
- Writing browser automation tests
- Running E2E tests in CI/CD
- Testing React/Vue/Angular applications
- Automating form submissions, navigation, user flows
- Taking screenshots and videos for bug reports

## Quick Start

```bash
# Install Playwright
pnpm add -D @playwright/test
npx playwright install

# Run E2E tests
pnpm test:e2e

# Open Playwright UI
npx playwright test --ui
```

## Project Configuration

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-reports' }],
    ['json', { outputFile: 'playwright-reports/results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
});
```

## Test Structure

```
tests/
├── e2e/
│   ├── features/
│   │   └── candidate/
│   │       ├── add-candidate.feature
│   │       └── search-candidate.feature
│   │
│   ├── pages/
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   └── DashboardPage.ts
│   │
│   ├── step_definitions/
│   │   └── candidate.steps.ts
│   │
│   └── playwright.config.ts
```

## Page Object Pattern

```typescript
// tests/e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="email-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.submitButton = page.locator('[data-testid="submit-button"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}
```

## Step Definitions (Gherkin to Playwright)

```typescript
// tests/e2e/step_definitions/candidate.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage, DashboardPage, CandidatePage } from '../pages';

let loginPage: LoginPage;
let dashboardPage: DashboardPage;
let candidatePage: CandidatePage;

Given('I am logged in as {string}', async function(role: string) {
  loginPage = new LoginPage(this.page);
  await loginPage.goto();

  const credentials = getCredentialsForRole(role);
  await loginPage.login(credentials.email, credentials.password);
});

When('I navigate to add candidate page', async function() {
  dashboardPage = new DashboardPage(this.page);
  await dashboardPage.clickAddCandidate();
  candidatePage = new CandidatePage(this.page);
});

When('I fill in candidate details:', async function(dataTable) {
  const candidate = dataTable.rowsHash();
  await candidatePage.fillName(candidate.Name);
  await candidatePage.fillEmail(candidate.Email);
  await candidatePage.selectPosition(candidate.Position);
});

Then('I should see candidate in the list', async function() {
  await expect(candidatePage.getCandidateList()).toContainText('John Doe');
});
```

## BDD Feature Example

```gherkin
# tests/e2e/features/candidate/add-candidate.feature
@e2e @candidate @smoke
Feature: Add Candidate

  Background:
    Given I am logged in as "recruiter"
    And I navigate to candidates page

  @smoke
  Scenario: Add candidate with valid data
    When I click "Add Candidate" button
    And I fill in the form:
      | Name     | Email            | Position   |
      | John Doe | john@example.com | Developer  |
    And I click "Save" button
    Then I should see success message "Candidate added"
    And I should see "John Doe" in the candidate list

  @sad-path
  Scenario: Show error for invalid email
    When I click "Add Candidate" button
    And I fill in the form:
      | Name     | Email      | Position |
      | John Doe | not-an-email | Developer |
    And I click "Save" button
    Then I should see error "Invalid email format"
    And I should remain on the form page

  @edge-case
  Scenario: Handle duplicate email
    When I add a candidate with email "john@example.com"
    And I try to add another candidate with the same email
    Then I should see error "Candidate with this email already exists"
```

## Playwright CLI Commands

```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI mode
pnpm test:e2e --ui

# Run specific feature
pnpm test:e2e features/candidate/add-candidate.feature

# Run with tags
pnpm test:e2e --grep "@smoke"

# Run in headed mode (see browser)
pnpm test:e2e --headed

# Debug with Playwright inspector
pnpm test:e2e --debug

# Generate test
pnpm playwright test --generate

# Show report
pnpm playwright show-report
```

## CI/CD Integration

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm test:e2e
        env:
          CI: true
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-reports/
```

## Integration with BDD

This skill works with `bdd-e2e` skill:

1. **bdd-e2e** defines the Gherkin feature files and step definitions
2. **playwright-e2e** provides the browser automation layer
3. **harness-engineering** enforces E2E tests as quality gates

```typescript
// Cucumber integrates with Playwright as the browser automation layer
import { Before, After } from '@cucumber/cucumber';

Before(async function() {
  // Launch browser before each scenario
  this.browser = await chromium.launch();
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

After(async function() {
  // Close browser after each scenario
  await this.browser.close();
});
```

## Quality Gates

All E2E tests MUST pass before marking feature complete:

```bash
# 1. Type check
pnpm tsc --noEmit

# 2. Lint
pnpm lint

# 3. Unit tests
pnpm test

# 4. E2E tests
pnpm test:e2e

# Coverage: Critical paths ≥ 90%
```

## Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Using sleep() instead of wait | Flaky, slow tests | Use `await waitForSelector()` |
| Testing implementation details | Brittle tests | Test user-visible behavior |
| Not using page objects | Duplicate selectors | Use Page Object pattern |
| No retry for network failures | Flaky tests | Use `apiRequestContext` with retries |
| Hardcoded URLs | Not portable | Use `baseURL` config |
| Skipping E2E for "quick" features | Misses integration bugs | E2E is mandatory for user flows |

## Commands Reference

| Command | Description |
|---------|-------------|
| `npx playwright install` | Install browsers |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm test:e2e --ui` | Run with UI |
| `pnpm test:e2e --headed` | Run in headed mode |
| `pnpm playwright show-report` | Show HTML report |
| `npx playwright test --grep "@smoke"` | Run tagged tests |

## References

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test Runner](https://playwright.dev/docs/test-runners)
- [BDD E2E Skill](../bdd-e2e/SKILL.md)
- [Harness Engineering Skill](../harness-engineering/SKILL.md)