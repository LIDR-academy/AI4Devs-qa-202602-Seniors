---
name: bdd-e2e
description: >
  BDD (Behavior-Driven Development) for end-to-end testing with Gherkin scenarios.
  Trigger: When writing E2E tests using BDD frameworks (Cucumber, Behave, SpecFlow), creating feature files, or structuring BDD test suites.
license: Apache-2.0
metadata:
  version: "1.0"
---

## When to Use

- Writing E2E tests using BDD frameworks (Cucumber.js, Behave, SpecFlow, Godog)
- Creating Gherkin feature files from requirements
- Structuring a BDD test suite with page objects and step definitions
- Integrating BDD tests into CI/CD pipelines
- Managing test data and fixtures in BDD scenarios

## Critical Patterns

### Given-When-Then Structure

```
Given → Preconditions (known state)
When  → Actions (user interaction)
Then  → Assertions (expected outcomes)
And/But → Chain same-type steps
```

**Rule**: One assertion per Then. Steps should be user-focused, not implementation details.

### Feature File Conventions

- One feature per file, grouped by domain (`auth/`, `checkout/`, etc.)
- Tags for filtering: `@smoke`, `@regression`, `@auth`, `@slow`
- Background for shared preconditions across scenarios
- Scenario Outline for data-driven tests with Examples tables
- Descriptive scenario names: "Successful login with valid credentials"

### Step Definition Pattern

```typescript
// Step definitions map Gherkin to code
Given("I am on the login page", async function() {
  await this.loginPage.visit();
});

When("I enter {string} and {string}", async function(email, password) {
  await this.loginPage.fillEmail(email);
  await this.loginPage.fillPassword(password);
});

Then("I should be redirected to the dashboard", async function() {
  await expect(page).toHaveURL('/dashboard');
});
```

### World Pattern (Shared State)

```typescript
// Use World for shared state across steps
class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.testData = { users: new Map(), sessions: [] };
    this.apiClient = new ApiClient();
  }
}
setWorldConstructor(CustomWorld);
```

### Page Object with BDD

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="email"]');
    this.submitButton = page.locator('[data-testid="submit"]');
  }

  async login(email: string, password: string) {
    await this.visit();
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }
}
```

## Feature File Template

```gherkin
@e2e @domain @tag
Feature: Feature Title

  Background:
    Given I am not authenticated
    And the database is seeded

  @smoke
  Scenario: Happy path description
    Given I am on the "<page>" page
    When I perform "<action>"
    Then I should see "<expected>"

  @sad-path
  Scenario: Error case description
    Given I am on the "<page>" page
    When I perform "<action>" with invalid data
    Then I should see error "<message>"
    And I should remain on the "<page>" page

  @slow
  Scenario Outline: Data-driven test
    Given I am on the "<page>" page
    When I login as "<role>"
    Then I should see the "<expectedPage>" page

    Examples:
      | role   | page     | expectedPage |
      | admin  | /login   | /admin      |
      | user   | /login   | /dashboard  |
```

## Directory Structure

```
tests/
├── e2e/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login.feature
│   │   │   └── logout.feature
│   │   ├── checkout/
│   │   │   └── payment.feature
│   │   └── common/
│   │       └── navigation.feature
│   │
│   ├── step_definitions/
│   │   ├── auth/
│   │   │   └── login.steps.ts
│   │   ├── common/
│   │   │   └── navigation.steps.ts
│   │   └── world.ts
│   │
│   ├── hooks/
│   │   ├── before-hooks.ts
│   │   └── after-hooks.ts
│   │
│   ├── pages/
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   └── BasePage.ts
│   │
│   └── fixtures/
│       ├── test-users.json
│       └── test-data.json
│
└── config/
    └── cucumber.js
```

## Framework Commands

### Cucumber.js

```bash
# Run with tags
npx cucumber-js --tags "@smoke and not @wip"

# Parallel execution
npx cucumber-js --parallel 4

# Generate reports
npx cucumber-js --format html:reports/cucumber-report.html --format json:reports/results.json

# Run specific feature
npx cucumber-js features/auth/login.feature
```

### Behave (Python)

```bash
# Run all features
behave

# Run with tags
behave --tags="@smoke,@auth"

# Generate reports
behave --format html --outdir=reports
behave --format json --outfile=reports/results.json
```

## CI Integration

```yaml
# GitHub Actions
name: E2E Tests
on: [push, pull_request]
jobs:
  cucumber-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx cucumber-js --format html:reports/cucumber-report.html
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: cucumber-reports
          path: reports/
```

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Testing UI details in steps | "When I click the blue button" | Use semantic: "When I submit the form" |
| Long scenarios (>10 steps) | Hard to maintain | Split into multiple scenarios |
| Shared mutable state | Flaky tests | Use dependency injection, reset between scenarios |
| Copy-paste Scenario Outlines | Maintenance burden | Use Examples tables |
| Skipping Then assertions | Unclear pass/fail | Always assert meaningful outcomes |
| BDD for unit tests | Overkill | Use TDD for unit, BDD for integration/E2E |

## Resources

- [Cucumber.js Documentation](https://github.com/cucumber/cucumber-js)
- [Gherkin Language](https://cucumber.io/docs/gherkin/)
- [Playwright Test Runner](references/playwright-tests.md) — for underlying browser automation
