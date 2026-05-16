## Why

The position page is a critical feature for candidate management, but lacks automated E2E test coverage. Without tests, visual regressions, Kanban column rendering, and drag-and-drop interactions cannot be reliably verified. This change implements comprehensive E2E tests using Playwright with headless parallel workers to ensure the position page loads correctly and candidate phase transitions work as expected, with fast, reliable execution.

## What Changes

- Add E2E test suite for the position page using Playwright with headless browser mode
- Create `frontend/tests/e2e/position.spec.ts` with two core test scenarios
- Configure Playwright with `playwright.config.ts` for automated headless parallel testing with multiple workers
- Tests validate both UI state and backend API communication
- Tests run in parallel workers for faster execution in CI/CD environments

## Capabilities

### New Capabilities

- `position-page-load`: Validates that the position page loads with correct title, hiring phase columns, and candidate cards in their appropriate columns
- `candidate-phase-change`: Tests drag-and-drop functionality to move candidates between phases and verifies the PUT `/candidate/:id` API call with correct phase data

### Modified Capabilities

<!-- No existing capabilities require specification changes -->

## Impact

- **Code**: `frontend/tests/e2e/position.spec.ts`, `frontend/playwright.config.ts`, `frontend/tests/e2e/` directory structure
- **Testing Infrastructure**: Adds Playwright as dev dependency with headless browser mode and parallel worker configuration for efficient test execution
- **CI/CD**: Tests configured to run in headless mode with parallel workers, optimized for CI/CD pipelines
- **Team Documentation**: Provides template for future E2E test development in the project using Playwright parallel execution patterns
