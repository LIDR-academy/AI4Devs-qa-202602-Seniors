# bug-fix-validation

## Purpose

Define the procedure agents follow to read, reproduce, fix, retest, and close defects related to the `position` E2E workflow without introducing regressions or unrelated refactors.

## When to Use This Skill

Use this skill whenever:

- An open bug under `docs/bugs/` must be addressed.
- A previously reported defect needs revalidation after a code change.
- A defect requires a decision about whether to keep it `Open`, mark it `Blocked`, or close it as `Fixed`.

## Required Inputs

- Bug files under `docs/bugs/<defect-id>.md`.
- Approved specifications under `docs/specs/e2e/`.
- Playwright tests under `frontend/tests/e2e/`.
- Reports under `docs/reports/`.
- `.cursor/rules/20-project-standards.mdc`.
- Output of `position-interface-analysis` when the bug touches routes, components, or endpoints.

## Procedure

1. List all bug files in `docs/bugs/` and filter those with status `Open` or `In Progress` linked to the `position` interface.
2. Read the bug file end to end:
   - Confirm preconditions, steps, expected result, and evidence.
   - Confirm severity and impact on Scenario 1 or Scenario 2.
3. Reproduce the bug:
   - Start the required services (frontend, backend, database, seeds).
   - Run the referenced Playwright test (or scenario subset) using `cd frontend && npx playwright test <path-or-grep>`.
   - Capture the failing output.
4. Identify the smallest safe fix:
   - Prefer fixing test code (selector, assertion, fixture) when the defect is a test issue.
   - Apply minimal application code changes only when the orchestrator authorizes them.
   - Avoid unrelated refactors, abstractions, or architectural changes.
5. Apply the fix and document it:
   - Add or update JSDoc/TSDoc on every modified or new export.
   - Update the spec only if behavior must legitimately change (and re-approve through `e2e-spec-writer`).
6. Rerun the affected Playwright tests:
   - Use `cd frontend && npx playwright test <path-or-grep>`.
   - Capture the HTML report via `npx playwright show-report`.
7. Update the bug file:
   - Set status to `Fixed`, `Open`, `In Progress`, `Blocked`, `Won't Fix`, or `Deferred` based on the result.
   - Fill `Retest Notes` with the commands rerun, results, and report links.
   - Fill `Fix Validation Result` with `Verified`, `Partial`, `Failed`, or `N/A`.
8. Update the corresponding `docs/reports/<report-id>.md` entry to reflect the revalidation outcome.
9. Decide the final outcome:
   - `Fixed` — defect reproduced, fix applied, retest verified, evidence recorded.
   - `Blocked` — fix requires product decision, backend change, or shared infrastructure outside the authorized scope.
   - `Open` — defect remains reproducible and the fix is incomplete.
10. Escalate to the orchestrator when:
    - The bug cannot be reproduced.
    - The fix requires a product decision.
    - The fix requires changing public behavior not covered by the specification.
    - The test cannot be rerun (missing services or seed data).
    - Evidence cannot be recorded.

## Quality Checklist

- [ ] Bug file was fully read and reproduction was attempted.
- [ ] Fix is the smallest safe change.
- [ ] No unrelated refactors were introduced.
- [ ] Modified or new exports have documentation.
- [ ] Affected Playwright tests were rerun and evidence captured.
- [ ] Bug status, retest notes, and fix validation result are updated.
- [ ] Related `docs/reports/<report-id>.md` entry reflects the revalidation outcome.
- [ ] Sensitive data is not exposed in updated evidence.

## Expected Outputs

- Updated `docs/bugs/<defect-id>.md` with retest evidence and final status.
- Updated `docs/reports/<report-id>.md` cross-reference.
- Minimal code changes scoped to the defect (test code, helpers, fixtures, or — when authorized — application code).
- Escalation notes for any defect that cannot be closed.

## Failure Conditions

- Bug marked `Fixed` without rerun evidence or fix validation result.
- Bug fix introduces unrelated refactors or architectural changes.
- Bug fix changes public behavior not covered by the specification.
- Test cannot be rerun and the limitation is not documented.
- Evidence cannot be recorded.
- Sensitive data is exposed in the updated evidence.
