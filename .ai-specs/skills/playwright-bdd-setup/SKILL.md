---
name: "playwright-bdd-setup"
description: Installs @playwright/test, playwright-bdd, and @playwright/cli, runs npx playwright install --with-deps, and creates playwright.config.ts with the correct defineBddConfig block. Use when setting up the Playwright BDD toolchain before authoring any feature files.
---

# Playwright BDD Setup

## Description

Installs the Playwright BDD toolchain and creates `playwright.config.ts` configured with the `defineBddConfig` block from `/senior-qa-playwright-bdd` conventions.

## Inputs

- `analysis/env-summary.md` — for the `baseURL` value to inject into `playwright.config.ts`
- Repository root (working directory)

## Steps

1. Verify `analysis/env-summary.md` exists; if not, emit `BLOCKED: analysis/env-summary.md missing — run /env-validation first` and halt.
2. Read `env-summary.md` to extract the confirmed frontend base URL.
3. Install packages if not already present:
   ```bash
   npm install --save-dev @playwright/test playwright-bdd @playwright/cli
   npx playwright install --with-deps
   ```
4. Create or overwrite `playwright.config.ts` at the project root following the `/senior-qa-playwright-bdd` `defineBddConfig` template, substituting the actual `baseURL` from `env-summary.md`:
   ```typescript
   import { defineConfig } from '@playwright/test';
   import { defineBddConfig } from 'playwright-bdd';

   const testDir = defineBddConfig({
     features: 'features/*.feature',
     steps: 'features/steps/*.ts',
   });

   export default defineConfig({
     testDir,
     use: {
       baseURL: '<confirmed-base-url>',
       headless: true,
     },
     reporter: [['html', { outputFolder: 'playwright-report' }]],
   });
   ```
5. Verify the config type-checks:
   ```bash
   npx tsc --noEmit playwright.config.ts
   ```
   Fix any errors before proceeding.
6. Create `features/` and `features/steps/` directories if they do not exist.
7. Verify `bddgen` is available:
   ```bash
   npx bddgen --version
   ```
   If unavailable, emit `BLOCKED: bddgen not available — check playwright-bdd installation` and halt.
8. Print status: `playwright-bdd-setup: DONE — playwright.config.ts written, bddgen available`.

## Output

- `playwright.config.ts` (created or updated)
- `features/` and `features/steps/` directories
- Status line printed to chat

## Guardrails

- Emit `BLOCKED: analysis/env-summary.md missing — run /env-validation first` if the file is absent.
- Must confirm `playwright.config.ts` type-checks before marking setup done.
- Must confirm `bddgen` is available before marking setup done.
- Must not write plain `.spec.ts` E2E files.
- Must not use the Playwright MCP server.
