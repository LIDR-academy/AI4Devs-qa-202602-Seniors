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
3. Create a temporary discovery script at `scripts/discover-ui.ts` with the following structure:
   ```ts
   import { chromium } from '@playwright/test';
   import fs from 'fs';

   const url = process.argv[2] ?? 'http://localhost:3000/positions/1';

   (async () => {
     const browser = await chromium.launch();
     const page = await browser.newPage();
     await page.goto(url);
     await page.waitForLoadState('networkidle');

     const snapshot = await page.accessibility.snapshot();
     fs.mkdirSync('snapshots', { recursive: true });
     fs.writeFileSync('snapshots/position-raw.json', JSON.stringify(snapshot, null, 2));

     await page.screenshot({ path: 'snapshots/position.png', fullPage: true });

     await browser.close();
   })();
   ```
4. Run the script using a real runner:
   ```bash
   npx ts-node scripts/discover-ui.ts <position-page-url>
   ```
   If `ts-node` is unavailable, transpile first with `npx tsc scripts/discover-ui.ts --outDir scripts/dist` and run `node scripts/dist/discover-ui.js <url>`.
5. Confirm `snapshots/position-raw.json` and `snapshots/position.png` were written; if either is missing, check that the frontend service is reachable at the target URL.
6. Read `snapshots/position-raw.json` and `repo-summary.md` together to derive, following `/senior-qa-playwright-bdd` locator conventions:
   - The accessible role and name for each phase column (e.g. `region`, `listitem`, or `group` with aria-label matching the phase name).
   - The accessible role and name pattern for candidate cards (e.g. `article` or `listitem` containing the candidate name).
   - The accessible role and name for the drag handle within each card, if present.
   - The exact `page.getByRole(...)` or `page.getByLabel(...)` Playwright expressions for each element.
7. Append the derived selectors to `snapshots/position.yaml` under a `derived_selectors` key as a YAML map (the raw JSON from `position-raw.json` serves as the source for this mapping step).
8. Print status: `ui-discovery: DONE — snapshots/position.yaml written with derived selectors`.

## Output

- `snapshots/position-raw.json` (raw accessibility snapshot from `page.accessibility.snapshot()`)
- `snapshots/position.png` (visual reference from `page.screenshot()`)
- Status line printed to chat

## Guardrails

- Emit `BLOCKED: <file> missing — run the appropriate upstream skill first` if input files are absent.
- Emit `BLOCKED: position page not reachable at <url> — confirm /env-validation ran and the service is still up` if the page cannot be opened.
- Emit `BLOCKED: position page requires auth — provide auth state file path or credentials` if the page requires authentication.
- Must use `scripts/discover-ui.ts` (via `page.accessibility.snapshot()` and `page.screenshot()`) for browser interaction — never use the Playwright MCP server or non-existent `playwright-cli` shell commands.
- Must derive role-based selectors only — never output CSS selectors or XPath.
- Must not write any test files — discovery and snapshot capture only.
