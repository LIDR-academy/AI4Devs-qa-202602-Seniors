---
name: "feature-writer"
description: Authors features/position.feature covering page-load validation and drag-and-drop phase change as Gherkin scenarios, following /senior-qa-playwright-bdd BDD conventions. Use when you need to write the Gherkin feature file for the position interface E2E tests.
---

# Feature Writer

## Description

Authors `features/position.feature` covering the two required E2E scenarios for the position interface, following the Gherkin conventions defined in `/senior-qa-playwright-bdd`.

## Inputs

- `analysis/repo-summary.md` — component structure, phase column names, candidate data shape, API endpoint
- `snapshots/position.yaml` — accessible element roles and `derived_selectors`
- `analysis/env-summary.md` — base URL for scenario context

## Steps

1. Verify all three input files exist; if any are missing, emit `BLOCKED: <file> missing — run the appropriate upstream skill first` and halt.
2. Read `repo-summary.md` to understand: position structure, phase column names, candidate data shape, API endpoint.
3. Read `snapshots/position.yaml` (specifically the `derived_selectors` section) to understand accessible element identifiers.
4. Author `features/position.feature` covering exactly these two scenarios:
   - **Scenario 1 — Page load validation**: assert that the position title, all phase columns, and candidate cards in their correct columns render successfully after page load.
   - **Scenario 2 — Drag-and-drop phase change**: a candidate card is moved between columns; a `PUT /candidate/:id` request fires with the correct candidate ID and new phase; the backend returns a 2xx; the card appears in the destination column.
5. Apply all Gherkin best practices from `/senior-qa-playwright-bdd`:
   - One `When` per scenario.
   - Domain language only — no UI imperatives, no CSS selectors in step text.
   - `Background` for the shared precondition (position page loaded with candidates).
   - `Scenario Outline` + `Examples` for the drag-and-drop scenario.
6. Write the file to `features/position.feature`.
7. Print status: `feature-writer: DONE — features/position.feature written (2 scenarios)`.

## Output

- `features/position.feature`
- Status line printed to chat

## Guardrails

- Emit `BLOCKED: <file> missing — run the appropriate upstream skill first` if any input file is absent.
- Must cover exactly the two scenarios specified — do not add scenarios beyond scope.
- Must not write plain `.spec.ts` files.
- Must not include CSS selectors or UI imperatives in Gherkin step text.
- Must not use the Playwright MCP server.
- Step text must use domain language (recruitment/HR domain) — not browser interaction language.
