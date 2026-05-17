# test-reporting

## Purpose

Define the required structure of execution reports stored in `docs/reports/<report-id>.md` so every Playwright execution of the `position` E2E suite is auditable, reproducible, and free of sensitive information.

## When to Use This Skill

Use this skill when:

- The `position` E2E suite (or a subset of it) is executed.
- A defect is re-validated after a fix.
- The orchestrator needs a single artifact summarizing scope, results, and follow-ups.

## Required Inputs

- Approved files under `docs/specs/e2e/`.
- Playwright tests under `frontend/tests/e2e/`.
- Playwright HTML report and trace artifacts.
- Open and revalidated bug files in `docs/bugs/`.
- Output of `position-interface-analysis`.

## Procedure

1. Choose a report ID using the format `RPT-<YYYYMMDD>-<short-context>-<HHMMSS>` (UTC): `<YYYYMMDD>` and `<HHMMSS>` must be derived from **the same UTC clock instant** used as the authoritative start (or finalize) time for that execution so the suffix is repeatable from the chosen instant and distinguishes same-day reruns—for example `RPT-20260517-position-suite-143052` for a run keyed to `2026-05-17T14:30:52Z`. **New execution** (new Markdown file): always include `-<HHMMSS>`. **Update** an existing artifact: reuse its existing `<report-id>` and filename unless the user explicitly forks a new report.
2. Create or update `docs/reports/<report-id>.md` with the following structure:

   ```md
   # <Report ID> — <Short title>

   ## Report ID
   <RPT-YYYYMMDD-short-context-HHMMSS> (UTC; date and clock suffix sort lexicographically within a day.)

   ## Execution Date
   <ISO 8601 UTC>

   ## Scope
   <Short paragraph describing which scenarios were executed and why.>

   ## Scenario IDs
   - <position-page-load>
   - <candidate-phase-change>

   ## Specification Files
   - docs/specs/e2e/position-page-load.md
   - docs/specs/e2e/candidate-phase-change.md

   ## Test Files
   - frontend/tests/e2e/position-page-load.spec.ts
   - frontend/tests/e2e/candidate-phase-change.spec.ts

   ## Commands Executed
   - cd frontend && npx playwright test
   - cd frontend && npx playwright show-report
   - (optional) cd frontend && npx playwright test --ui

   ## Execution Result
   <PASS | FAIL | PARTIAL>

   ## Passed Tests
   - <test name>

   ## Failed Tests
   - <test name>

   ## Skipped Tests
   - <test name>

   ## Bugs Created
   - docs/bugs/<defect-id>.md

   ## Bugs Revalidated
   - docs/bugs/<defect-id>.md (status: Fixed | Open | Blocked)

   ## Playwright Report Location
   <Path to the HTML report.>

   ## Trace or Screenshot Evidence
   - <path or summary>

   ## Reproducibility Notes
   <Service prerequisites, seed data assumptions, isolation considerations.>

   ## Security Review Notes
   <Confirmation that no secrets, credentials, private URLs, or sensitive data were exposed.>

   ## Final Recommendation
   <Proceed to merge | Re-run after fixes | Block until product decision | Escalate to orchestrator>
   ```

3. Link the report to every bug it references and vice versa.
4. Append the `e2e-quality-gateway` verdict (`PASS` or `BLOCKED`) and supporting evidence when the gateway runs.
5. Avoid exposing sensitive data in any field; scrub artifacts before referencing them.
6. Keep prior report entries immutable unless the user explicitly requests log repair.

## Quality Checklist

- [ ] File path is `docs/reports/<report-id>.md`.
- [ ] All required fields are present.
- [ ] Scenario IDs, spec files, and test files are cross-referenced.
- [ ] Commands executed are explicit and reproducible.
- [ ] Execution result is consistent with the listed passed/failed/skipped tests.
- [ ] Bug references are bi-directional with `docs/bugs/`.
- [ ] Playwright report location is provided.
- [ ] Reproducibility and security notes are documented.
- [ ] No secrets, credentials, or private URLs appear in the report.

## Expected Outputs

- A complete `docs/reports/<report-id>.md` entry.
- Updated cross-references in related `docs/bugs/<defect-id>.md` files.
- Updated cross-references in related `docs/specs/e2e/<scenario-id>.md` files when scope changes.

## Failure Conditions

- Required fields are missing.
- Bug references are not bi-directional.
- Sensitive data appears in execution output, traces, or screenshots referenced by the report.
- Report claims execution without listing the commands actually executed.
- Report contradicts the Playwright HTML report.
