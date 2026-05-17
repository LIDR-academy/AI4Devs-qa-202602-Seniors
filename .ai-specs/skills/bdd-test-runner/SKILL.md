---
name: "bdd-test-runner"
description: Runs npx bddgen && npx playwright test, reads Playwright traces on failure, applies fixes to feature and step definition files, and re-runs until all tests pass or 3 fix cycles are exhausted. Generates the HTML report. Use as the final execution step once /bdd-code-review has passed.
---

# BDD Test Runner

## Description

Runs the BDD pipeline (`npx bddgen && npx playwright test`), analyses failures from Playwright traces, applies fixes following `/senior-qa-playwright-bdd` conventions, and iterates until all tests pass. Generates the final HTML report.

## Inputs

- `features/position.feature`
- `features/steps/position.steps.ts`
- `playwright.config.ts`
- `/bdd-code-review` verdict must be **PASS** before this skill runs

## Steps

1. Confirm `/bdd-code-review` verdict was **PASS**; if not, emit `BLOCKED: /bdd-code-review did not pass — fix all review issues first` and halt.
2. Verify `features/position.feature` and `features/steps/position.steps.ts` exist.
3. Run the BDD pipeline:
   ```bash
   npx bddgen && npx playwright test
   ```
4. **If all tests pass**: confirm the HTML report was generated, then proceed to output.
5. **If any test fails**:
   - Read Playwright error output and trace file (`test-results/`).
   - Analyse the failure to determine root cause:
     - Step definition error (wrong selector, wrong async pattern, wrong drag simulation).
     - Gherkin scenario error (wrong step text, missing step, wrong `Examples` data).
     - Environment issue (service not running, wrong base URL).
   - If root cause is an environment issue, emit `BLOCKED: environment issue — <description> — fix environment and re-run` and halt.
   - Otherwise apply the fix to the relevant file(s) following `/senior-qa-playwright-bdd` conventions.
   - Re-run from step 3. Repeat up to **3 fix-and-retry cycles**.
   - After 3 failed cycles, emit `BLOCKED: tests failing after 3 fix attempts — <last error> — manual intervention required` and halt.
6. Generate the final HTML report:
   ```bash
   npx playwright show-report
   ```
7. Print status: `bdd-test-runner: DONE — all tests pass, HTML report at playwright-report/index.html`.

## Output

- `playwright-report/` directory with HTML report
- Status line printed to chat

## Guardrails

- Must not run if `/bdd-code-review` verdict was **FAIL**.
- Must always run `npx bddgen` before `npx playwright test` — never skip `bddgen`.
- Must not skip or mark failing tests as `.skip` / `.fixme` — fix the root cause.
- Must not use `waitForTimeout` in any fixes.
- Must not use the Playwright MCP server.
- Must halt after 3 failed fix-and-retry cycles — never loop indefinitely.
- All fixes must preserve the Gherkin best practices from `/senior-qa-playwright-bdd`.
