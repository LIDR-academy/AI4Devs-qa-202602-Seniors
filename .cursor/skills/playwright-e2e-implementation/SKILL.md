# playwright-e2e-implementation

## Purpose

Define how agents map approved BDD specifications under `docs/specs/e2e/` to Playwright tests under `frontend/tests/e2e/` for the `position` interface, with a focus on accessible selectors, drag-and-drop validation, real network assertions, isolation, and CodeRabbit-friendly documentation.

## When to Use This Skill

Use this skill whenever:

- An approved specification needs Playwright implementation.
- A test must be updated to match an updated specification.
- A bug requires changes to test code (selector, assertion, fixture).
- A new helper, fixture, or page object is introduced for the `position` interface.

## Required Inputs

- Approved files under `docs/specs/e2e/`.
- `.cursor/rules/20-project-standards.mdc`.
- `frontend/playwright.config.ts`.
- `frontend/src/App.js`, `frontend/src/components/PositionDetails.js`, `frontend/src/components/Positions.tsx`, `frontend/src/components/StageColumn.js`, `frontend/src/components/CandidateCard.js`.
- Output of `position-interface-analysis`.
- Existing fixtures/factories, when present.

## Procedure

1. Place Playwright spec files under `frontend/tests/e2e/`, matching the `testDir` from `playwright.config.ts`. Suggested filenames:
   - `position-page-load.spec.ts` for Scenario 1.
   - `candidate-phase-change.spec.ts` for Scenario 2.
2. Add a module-level docstring describing the scope, prerequisites (frontend on `http://localhost:3000`, backend on `http://localhost:3010`, seeded database), and the approved spec ID.
3. Use selectors in this priority order:
   1. `getByRole` + accessible name.
   2. Stable visible text (e.g., position title, hiring phase title).
   3. `data-testid` already present in the component or, when justified, a minimal new `data-testid` added with the orchestrator's approval.
   4. CSS classes as a last resort, never relying on generated Bootstrap utility classes alone.
4. For **Scenario 1 — Position Page Load**:
   - Navigate to `/positions/:id` for a deterministic seeded position ID.
   - Assert the position title (`h2` rendered by `PositionDetails.js`).
   - Assert each hiring phase column is present using the phase title from the backend (no hardcoded list — derive from observed UI or from the captured `position-interface-analysis` notes).
   - Assert candidate cards appear under the column matching their `currentInterviewStep`.
5. For **Scenario 2 — Candidate Phase Change**:
   - Trigger drag-and-drop by simulating the pointer interaction `react-beautiful-dnd` requires (mouse down on the draggable, sequential mouse moves over the target droppable, mouse up). Prefer Playwright's `dragTo` only after confirming it works with the library; otherwise use explicit pointer events via `page.mouse`.
   - Use `page.waitForRequest` (or `page.waitForResponse`) to intercept the real `PUT http://localhost:3010/candidates/:id` triggered by `updateCandidateStep`.
   - Assert the candidate ID in the URL matches the moved card.
   - Assert the JSON body contains `applicationId` (numeric) and `currentInterviewStep` (numeric, equal to the destination column's interview step ID).
   - Assert the response status is successful (`200`).
   - Assert the card is visually rendered inside the destination column after the drop.
6. Use deterministic data:
   - Prefer seed data from `backend/prisma/seed.ts` when available.
   - Otherwise use a documented fixture; introduce `@faker-js/faker` only when generated data must vary and seeds must change. Document any new dependency in the test report.
7. Keep tests independent:
   - Reset application state between tests when needed (page reload, deterministic IDs).
   - Avoid order dependencies; rely on Playwright's worker isolation.
8. Document helpers, fixtures, and page objects:
   - JSDoc/TSDoc on every export.
   - Module-level header on every spec file.
   - Spanish UI copy in assertions is allowed when the UI uses Spanish.
9. Avoid hardcoding secrets, tokens, credentials, or production URLs. Use `http://localhost:3000` and `http://localhost:3010` as established by the project standards.
10. Run the Playwright commands required by the project:
    - `cd frontend && npx playwright test` (or `--ui` interactively).
    - `cd frontend && npx playwright show-report`.

## Quality Checklist

- [ ] Spec files live under `frontend/tests/e2e/`.
- [ ] Each spec has a module-level docstring.
- [ ] Selectors prioritize roles, accessible names, and stable text over CSS.
- [ ] Drag-and-drop is exercised in a way compatible with `react-beautiful-dnd`.
- [ ] Network assertions target `PUT /candidates/:id` with `applicationId` and `currentInterviewStep`.
- [ ] Tests are independent and reproducible.
- [ ] Helpers and fixtures are documented for CodeRabbit Docstring Coverage.
- [ ] No secrets or environment-specific values are hardcoded beyond project defaults.
- [ ] HTML report was generated via `npx playwright show-report`.

## Expected Outputs

- New or updated Playwright spec files under `frontend/tests/e2e/`.
- Optional documented helpers, fixtures, or page objects under `frontend/tests/e2e/` (no production source changes).
- Captured HTML report under the configured Playwright report location.
- Notes for the `test-reporting` skill to consume.

## Failure Conditions

- A spec lives outside `frontend/tests/e2e/`.
- Selectors rely solely on generated Bootstrap class names.
- Drag-and-drop assertions verify only visual movement or only the network call, but not both.
- The candidate update request is asserted against `PUT /candidate/:id` (incorrect) instead of `PUT /candidates/:id` (real).
- Helpers or fixtures lack documentation.
- Sensitive data is committed to test code.
