---
name: "ui-discovery"
description: Opens the live position page via Playwright CLI, captures an accessibility snapshot as YAML, and derives role-based selectors for phase columns, candidate cards, and drag handles. Saves output as snapshots/position.yaml. Use when live browser exploration is needed to determine accessible locators before writing feature files.
---

# UI Discovery

## Description

Opens the live position page using Playwright CLI, captures an accessibility snapshot, and produces `snapshots/position.yaml` containing the exact role-based selectors for phase columns, candidate cards, and drag handles, following `/senior-qa-playwright-bdd` locator conventions.

## Inputs

- `analysis/env-summary.md` — for the live position page base URL
- `analysis/repo-summary.md` — for component structure hints (column identity, card identity, drag handle location)
- Live frontend service running and reachable

## Steps

1. Verify both input files exist; if either is missing, emit `BLOCKED: <file> missing — run the appropriate upstream skill first` and halt.
2. Read `env-summary.md` to get the frontend base URL. Construct the position page URL (e.g. `<baseURL>/position/1` — use the first available position ID or a known test fixture ID from `repo-summary.md`).
3. Open the position page using Playwright CLI:
   ```bash
   playwright-cli open <position-page-url>
   ```
4. Capture an accessibility snapshot:
   ```bash
   playwright-cli snapshot snapshots/position.yaml
   ```
5. Capture a screenshot for visual reference:
   ```bash
   playwright-cli screenshot snapshots/position.png
   ```
6. Read `position.yaml` and `repo-summary.md` together to derive, following `/senior-qa-playwright-bdd` locator conventions:
   - The accessible role and name for each phase column (e.g. `region`, `listitem`, or `group` with aria-label matching the phase name).
   - The accessible role and name pattern for candidate cards (e.g. `article` or `listitem` containing the candidate name).
   - The accessible role and name for the drag handle within each card, if present.
   - The exact `page.getByRole(...)` or `page.getByLabel(...)` Playwright expressions for each element.
7. Append the derived selectors to `snapshots/position.yaml` under a `derived_selectors` key as a YAML map.
8. Print status: `ui-discovery: DONE — snapshots/position.yaml written with derived selectors`.

## Output

- `snapshots/position.yaml` (accessibility snapshot + `derived_selectors` map)
- `snapshots/position.png` (visual reference)
- Status line printed to chat

## Guardrails

- Emit `BLOCKED: <file> missing — run the appropriate upstream skill first` if input files are absent.
- Emit `BLOCKED: position page not reachable at <url> — confirm /env-validation ran and the service is still up` if the page cannot be opened.
- Emit `BLOCKED: position page requires auth — provide auth state file path or credentials` if the page requires authentication.
- Must only use Playwright CLI — never use the Playwright MCP server.
- Must derive role-based selectors only — never output CSS selectors or XPath.
- Must not write any test files — discovery and snapshot capture only.
