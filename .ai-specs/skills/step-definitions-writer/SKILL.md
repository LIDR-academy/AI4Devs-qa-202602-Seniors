---
name: "step-definitions-writer"
description: Authors features/steps/position.steps.ts using createBdd() from playwright-bdd, role-based Playwright locators, waitForResponse for PUT interception, and drag simulation matched to the library in repo-summary.md. Follows /senior-qa-playwright-bdd step definition conventions. Use when you need to implement step definitions for position.feature.
---

# Step Definitions Writer

## Description

Authors `features/steps/position.steps.ts` using `createBdd()` from `playwright-bdd`, following the step definition patterns defined in `/senior-qa-playwright-bdd` and the Playwright locator conventions from `/senior-qa`.

## Inputs

- `features/position.feature` — step patterns to implement
- `analysis/repo-summary.md` — drag-and-drop library API, candidate API shape
- `snapshots/position.yaml` — `derived_selectors` for phase columns, candidate cards, drag handles
- `analysis/env-summary.md` — base URL

## Steps

1. Verify all four input files exist; if any are missing, emit `BLOCKED: <file> missing — run the appropriate upstream skill first` and halt.
2. Read `position.feature` to extract every unique step pattern (`Given`, `When`, `Then`) that needs an implementation.
3. Read `repo-summary.md` to extract:
   - The drag-and-drop library name and its specific API for simulating a drag (e.g. `dragTo`, `dispatchEvent('dragstart')`, DnD Kit pointer events).
   - The `PUT /candidate/:id` URL pattern and expected request body shape.
4. Read `snapshots/position.yaml` `derived_selectors` for phase columns, candidate cards, and drag handles.
5. Author `features/steps/position.steps.ts`:
   ```typescript
   import { createBdd } from 'playwright-bdd';
   import { test } from '@playwright/test';

   const { Given, When, Then } = createBdd(test);
   ```
   - One implementation per unique step pattern from `position.feature`.
   - `Given`: navigate to the position page URL, wait for `networkidle`.
   - `Then` (page load): `expect(page.getByRole(...)).toBeVisible()` for title, columns, and cards using `derived_selectors`.
   - `When` (drag-and-drop): simulate drag using the library-specific API from `repo-summary.md`. Never use `waitForTimeout`.
   - `Then` (API assertion): use `page.waitForResponse(resp => resp.url().includes('/candidate/') && resp.request().method() === 'PUT')` and assert status 2xx and body shape.
   - `Then` (card position): assert card appears inside the target column using role-based locators from `derived_selectors`.
6. Write the file to `features/steps/position.steps.ts`.
7. Print status: `step-definitions-writer: DONE — features/steps/position.steps.ts written`.

## Output

- `features/steps/position.steps.ts`
- Status line printed to chat

## Guardrails

- Emit `BLOCKED: <file> missing — run the appropriate upstream skill first` if any input file is absent.
- Must use `createBdd()` from `playwright-bdd` — never `@cucumber/cucumber`.
- Must use role-based Playwright locators — never CSS selectors or XPath.
- Must never use `waitForTimeout`.
- Drag simulation must use the library-specific API from `repo-summary.md` — never assume a generic drag API.
- Must not write plain `.spec.ts` files.
- Must not use the Playwright MCP server.
- One implementation per unique step pattern — no duplicated matching logic.
