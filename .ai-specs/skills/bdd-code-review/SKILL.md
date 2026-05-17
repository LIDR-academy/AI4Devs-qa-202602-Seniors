---
name: "bdd-code-review"
description: Reviews features/position.feature and features/steps/position.steps.ts against /senior-qa Playwright quality rules and /senior-qa-playwright-bdd Gherkin guardrails. Returns an annotated PASS or FAIL verdict. The pipeline must not proceed if the verdict is FAIL.
---

# BDD Code Review

## Description

Reviews `features/position.feature` and `features/steps/position.steps.ts`, applying Playwright code quality rules from `/senior-qa` and Gherkin guardrails from `/senior-qa-playwright-bdd`. Returns an annotated PASS or FAIL verdict.

## Inputs

- `features/position.feature`
- `features/steps/position.steps.ts`
- `analysis/repo-summary.md` — for API shape verification

## Steps

1. Verify all three input files exist; if any are missing, emit `BLOCKED: <file> missing — run the appropriate upstream skill first` and halt.
2. Apply `/senior-qa` Playwright quality rules to `position.steps.ts`:
   - Correct `await` usage everywhere — no floating promises.
   - Role-based accessible locators only — no CSS selectors, no XPath, no `getByTestId` unless genuinely unavoidable.
   - No `waitForTimeout` usage.
   - `waitForResponse` used correctly for API interception.
   - TypeScript type correctness — no implicit `any`.
3. Apply `/senior-qa-playwright-bdd` Gherkin guardrails to `position.feature`:
   - One `When` per scenario.
   - Domain language only in step text — no UI imperatives, no selectors.
   - `Background` present and used correctly.
   - `Scenario Outline` + `Examples` used for the drag-and-drop scenario.
   - Every step in `position.feature` has a corresponding implementation in `position.steps.ts`.
4. Verify `position.steps.ts` does not import from `@cucumber/cucumber`.
5. Compile the review into an annotated verdict:
   - **PASS**: all checks passed — list what was verified.
   - **FAIL**: list each issue with file, line number (if known), rule violated, and required fix.
6. Print the verdict to chat. If **FAIL**, halt — do not proceed further.
7. Print status: `bdd-code-review: PASS` or `bdd-code-review: FAIL — <N> issues found`.

## Output

- Annotated verdict printed to chat
- Status line printed to chat
- No files written (review only)

## Guardrails

- Emit `BLOCKED: <file> missing — run the appropriate upstream skill first` if any input file is absent.
- Must halt on **FAIL** — never silently proceed past issues.
- Must apply both `/senior-qa` and `/senior-qa-playwright-bdd` rule sets — neither alone is sufficient.
- Must not modify source files.
- Must not use the Playwright MCP server.
