# defect-reporting

## Purpose

Define the required structure of bug reports stored in `docs/bugs/<defect-id>.md` so every defect detected by the `position` E2E workflow is reproducible, auditable, and free of sensitive information.

## When to Use This Skill

Use this skill when:

- A Playwright test fails because of a product defect, testability issue, route mismatch, endpoint mismatch, selector instability, or behavior mismatch.
- A spec cannot be implemented because of an underlying defect.
- A bug discovered during MCP debugging must be tracked.

## Required Inputs

- The failing test file path under `frontend/tests/e2e/`.
- The related specification under `docs/specs/e2e/<scenario-id>.md`.
- The related Playwright HTML report and trace.
- Output of `position-interface-analysis` (for accurate endpoint and component references).

## Procedure

1. Choose a defect ID using the format `BUG-<scenario-id>-<incrementing-number>` (for example, `BUG-candidate-phase-change-001`). Keep IDs deterministic and easy to sort.
2. Create or update `docs/bugs/<defect-id>.md` with the following structure:

   ```md
   # <Defect ID> — <Short title>

   ## Title
   <One-line summary of the defect.>

   ## Related Scenario ID
   <Scenario ID from docs/specs/e2e/>

   ## Related Specification File
   <Path to docs/specs/e2e/<scenario-id>.md>

   ## Related Test File
   <Path to frontend/tests/e2e/<spec-file>.spec.ts>

   ## Environment
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3010
   - Branch / commit: <commit SHA or branch name>
   - Browser: <chromium | firefox | webkit>
   - Date: <ISO 8601 UTC>

   ## Preconditions
   <List required services, seed data, and configuration.>

   ## Steps to Reproduce
   1. <Step>
   2. <Step>

   ## Expected Result
   <Observable, domain-driven expectation.>

   ## Actual Result
   <Observed behavior.>

   ## Evidence
   - Playwright report: <path>
   - Trace: <path>
   - Screenshot: <path>
   - Network log: <path or summary>

   ## Suspected Area
   <File, component, route, or backend service most likely involved.>

   ## Severity
   <Blocker | Critical | Major | Minor | Trivial>

   ## Status
   <Open | In Progress | Blocked | Fixed | Won't Fix | Deferred>

   ## Retest Notes
   <Commands rerun, results, and links to the latest report.>

   ## Fix Validation Result
   <Verified | Partial | Failed | N/A>
   ```

3. Cite the real endpoint when the defect is API-related (`PUT /candidates/:id`), and document any discrepancy with `PUT /candidate/:id` in the Suspected Area section.
4. Scrub all evidence:
   - Remove tokens, credentials, secrets, OAuth headers, cookies, session IDs.
   - Remove private URLs or internal-only configuration.
   - Replace personally identifiable data beyond seed values with `[REDACTED]`.
5. Link the defect to the related `docs/reports/<report-id>.md` entry so the loop is traceable.

## Quality Checklist

- [ ] File path is `docs/bugs/<defect-id>.md`.
- [ ] All required fields are present.
- [ ] Related scenario, specification, and test files are cited.
- [ ] Environment is documented with commit/branch information.
- [ ] Steps to reproduce produce the documented actual result.
- [ ] Evidence references exist (report, trace, screenshot, or network log).
- [ ] Severity and status reflect the current state.
- [ ] Retest notes and fix validation result are present, even if `N/A`.
- [ ] No secrets, credentials, or private URLs appear in the file.

## Expected Outputs

- A complete `docs/bugs/<defect-id>.md` entry ready for `e2e-bug-fixer` consumption.
- An updated `docs/reports/<report-id>.md` cross-reference.

## Failure Conditions

- Bug file is missing required fields.
- Evidence includes secrets, credentials, private URLs, or PII beyond seed values.
- Status is `Fixed` without retest notes and fix validation result.
- Defect references `PUT /candidate/:id` instead of the real `PUT /candidates/:id` when the latter is the project contract.
- Defect cannot be traced back to a specific scenario, specification, or test file.
