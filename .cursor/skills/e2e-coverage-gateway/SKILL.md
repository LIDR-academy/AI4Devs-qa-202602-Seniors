# e2e-coverage-gateway

## Purpose

Verify that every approved BDD scenario under `docs/specs/e2e/` has matching Playwright coverage under `frontend/tests/e2e/` and that every acceptance criterion is exercised by at least one assertion before the `position` E2E workflow can complete.

## When to Use This Skill

Use this skill:

- When the `e2e-quality-gateway` agent runs.
- After every iteration of test implementation or bug fixing.
- Before the orchestrator emits a final workflow summary.

## Required Inputs

- `docs/specs/e2e/`
- `frontend/tests/e2e/`
- `docs/reports/`
- `.cursor/rules/20-project-standards.mdc`
- Output of `position-interface-analysis`.

## Procedure

1. List every approved specification under `docs/specs/e2e/` and extract:
   - Scenario ID.
   - Success criteria.
   - Real endpoint references (especially `PUT /candidates/:id`).
2. List every Playwright spec under `frontend/tests/e2e/` and map each scenario ID to one or more `test(...)` blocks.
3. For each scenario, verify all success criteria are asserted:
   - **Scenario 1 — Position Page Load**:
     - Position title is asserted from the live DOM.
     - Hiring phase columns are asserted by their backend-provided title.
     - Candidate cards are asserted under the column matching their `currentInterviewStep`.
   - **Scenario 2 — Candidate Phase Change**:
     - Drag-and-drop is exercised between two hiring phase columns.
     - The candidate card is asserted in the destination column after the drop.
     - The outbound `PUT /candidates/:id` request is asserted (URL contains the candidate ID, body contains numeric `applicationId` and `currentInterviewStep`).
     - The response status is asserted to be successful.
4. Confirm no unrelated E2E scope was introduced (no tests outside the approved scope).
5. Confirm every assertion is observable from the user perspective — no private component state or framework-internal hooks.
6. Record findings in the report (`docs/reports/<report-id>.md`) and append a `PASS` or `BLOCKED` verdict for the coverage gate.

## Quality Checklist

- [ ] Every approved scenario has at least one Playwright test.
- [ ] Every acceptance criterion has at least one assertion.
- [ ] Scenario 1 covers title, columns, and card placement.
- [ ] Scenario 2 covers drag-and-drop, visual movement, the real PUT request, candidate ID, new phase, and successful backend response.
- [ ] No out-of-scope E2E tests were introduced.
- [ ] Coverage findings are recorded in the active report.

## Expected Outputs

- A coverage verdict (`PASS` or `BLOCKED`) appended to `docs/reports/<report-id>.md`.
- A mapping table of scenarios → tests → assertions.
- A list of any uncovered acceptance criteria with recommended actions.

## Failure Conditions

- A scenario in `docs/specs/e2e/` is not implemented.
- An acceptance criterion lacks an assertion.
- A test asserts against `PUT /candidate/:id` instead of the real `PUT /candidates/:id`.
- Unrelated E2E scope was introduced without authorization.
- The verdict is appended without observed evidence.
