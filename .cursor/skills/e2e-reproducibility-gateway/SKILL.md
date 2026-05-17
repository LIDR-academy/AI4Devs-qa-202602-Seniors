# e2e-reproducibility-gateway

## Purpose

Verify that the `position` E2E suite runs locally with the project commands, is independent of execution order and mutable external state, and produces traceable evidence on failure.

## When to Use This Skill

Use this skill:

- When the `e2e-quality-gateway` agent runs.
- After every iteration of test implementation or bug fixing.
- Before the orchestrator emits a final workflow summary.

## Required Inputs

- `frontend/playwright.config.ts`
- `frontend/tests/e2e/`
- `docs/reports/`
- `.cursor/rules/20-project-standards.mdc`
- Output of `test-data-fixtures`.

## Procedure

1. Confirm Playwright commands were executed and recorded in the active report:
   - `cd frontend && npx playwright test` (or `--ui` for interactive runs).
   - `cd frontend && npx playwright show-report`.
2. Confirm tests pass when run independently:
   - Spot-check by running a single spec (`npx playwright test <path>`).
   - Spot-check by running a single test name (`npx playwright test -g "<title>"`).
3. Confirm tests do not depend on order:
   - No global mutable state shared between tests.
   - No reliance on a prior test leaving the system in a specific state.
4. Confirm tests do not depend on mutable external state:
   - Seed data, fixtures, or factories are used.
   - When mutation is required (for example, moving a candidate), the test owns its data lifecycle.
5. Confirm traces and screenshots are available on failure per `playwright.config.ts` (`trace: 'on-first-retry'`).
6. Confirm selectors avoid generated Bootstrap class names and rely on roles, accessible names, stable text, or `data-testid`.
7. Confirm `npx playwright show-report` produced an HTML report and it is referenced from `docs/reports/<report-id>.md`.
8. Append a `PASS` or `BLOCKED` verdict for the reproducibility gate to the active report.

## Quality Checklist

- [ ] Required Playwright commands were executed and recorded.
- [ ] Tests pass when run in isolation.
- [ ] Tests do not depend on execution order.
- [ ] Tests do not depend on mutable external state.
- [ ] Traces and screenshots are available on failure.
- [ ] Selectors avoid generated Bootstrap class names.
- [ ] HTML report is referenced from the active report.

## Expected Outputs

- A reproducibility verdict (`PASS` or `BLOCKED`) appended to `docs/reports/<report-id>.md`.
- A summary of services, seed data, and isolation considerations required to reproduce the run.
- A list of any reproducibility risk with recommended actions.

## Failure Conditions

- Required Playwright commands were not executed.
- Tests fail when run in isolation.
- Tests depend on execution order.
- Tests depend on mutable external state without explicit setup or teardown.
- Selectors rely solely on generated Bootstrap class names.
- HTML report is missing or not referenced from the active report.
