# Playwright Foundation And Exercise Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the repository for the E2E exercise by first creating documentation, prompt traceability, local agent/skill assets, and then implementing Playwright coverage for the `position` flow.

**Architecture:** Work in layers. First add repo guidance and reusable AI workflow assets so later implementation stays consistent and traceable. Then make the UI testable with stable selectors, add Playwright configuration and fixtures, and finally implement and validate the E2E scenario against the running frontend/backend stack.

**Tech Stack:** Node.js, React 18, Express, Prisma, Jest, Playwright, Markdown documentation, local Codex agent/skill assets.

---

## File Structure
- Create: `AGENTS.md`
- Create: `docs/project-baseline.md`
- Create: `docs/superpowers/plans/2026-05-17-playwright-foundation-plan.md`
- Create: `prompts/prompts-mjtr.md`
- Create: `.agents/skills/playwright-e2e-helper/SKILL.md`
- Create: `.agents/skills/ai-prompt-log/SKILL.md`
- Create: `.agents/agents/e2e-investigator.md`
- Create: `.agents/agents/e2e-implementer.md`
- Create: `frontend/playwright.config.ts`
- Create: `frontend/tests/e2e/position.spec.ts`
- Modify: `frontend/package.json`
- Modify: `frontend/src/components/PositionDetails.js`
- Modify: `frontend/src/components/StageColumn.js`
- Modify: `frontend/src/components/CandidateCard.js`

### Task 1: Documentation Baseline

**Files:**
- Create: `AGENTS.md`
- Create: `docs/project-baseline.md`
- Create: `prompts/prompts-mjtr.md`

- [ ] **Step 1: Write the repo guide**

```md
# Repository Guidelines

## Project Structure & Module Organization
- backend Express + Prisma
- frontend React + drag and drop
- prompts prompt traceability
```

- [ ] **Step 2: Add the baseline context document**

```md
# Project Baseline

## Exercise-Relevant Findings
- No Playwright config yet
- No frontend/tests/e2e directory yet
- Position flow lives in frontend/src/components/PositionDetails.js
```

- [ ] **Step 3: Start the AI prompt log**

```md
# Prompts utilizados - MJTR

1. "Clona el repo del ejercicio al mismo nivel del directorio actual."
2. "Haz un plan con Superpowers para crear primero agentes y skills de utilidad."
```

- [ ] **Step 4: Verify docs exist**

Run: `rg --files AGENTS.md docs prompts`
Expected: paths for the three files above

- [ ] **Step 5: Commit**

```bash
git add AGENTS.md docs/project-baseline.md prompts/prompts-mjtr.md
git commit -m "docs: add project baseline and prompt log"
```

### Task 2: Local Agents And Skills For The Exercise

**Files:**
- Create: `.agents/skills/playwright-e2e-helper/SKILL.md`
- Create: `.agents/skills/ai-prompt-log/SKILL.md`
- Create: `.agents/agents/e2e-investigator.md`
- Create: `.agents/agents/e2e-implementer.md`

- [ ] **Step 1: Create the Playwright helper skill**

```md
---
name: playwright-e2e-helper
description: Use for selector strategy, drag-and-drop stability, request assertions, and evidence capture in this repository.
---

Checklist:
1. Confirm frontend route and backend endpoint.
2. Prefer data-testid selectors.
3. Capture both UI movement and PUT request payload.
```

- [ ] **Step 2: Create the prompt-log skill**

```md
---
name: ai-prompt-log
description: Use before and after major exercise changes to append prompts to prompts/prompts-mjtr.md.
---

Rules:
1. Append prompts in chronological order.
2. Do not include AI responses.
3. Keep one numbered list only.
```

- [ ] **Step 3: Create lightweight agent role docs**

```md
# e2e-investigator
- Inspect routes, selectors, and current failures.

# e2e-implementer
- Apply focused UI and Playwright changes after investigation.
```

- [ ] **Step 4: Verify agent assets**

Run: `rg --files .agents`
Expected: four new files under `.agents/skills` and `.agents/agents`

- [ ] **Step 5: Commit**

```bash
git add .agents prompts/prompts-mjtr.md
git commit -m "chore: add local agent and skill assets for e2e"
```

### Task 3: Make The UI Automation-Friendly

**Files:**
- Modify: `frontend/src/components/PositionDetails.js`
- Modify: `frontend/src/components/StageColumn.js`
- Modify: `frontend/src/components/CandidateCard.js`

- [ ] **Step 1: Add failing E2E expectations as a checklist**

```ts
// Expected selectors after UI instrumentation:
// [data-testid="position-title"]
// [data-testid="phase-column-<stage-slug>"]
// [data-testid="candidate-card-<candidate-id>"]
```

- [ ] **Step 2: Add a stable title selector**

```jsx
<h2 className="text-center mb-4" data-testid="position-title">{positionName}</h2>
```

- [ ] **Step 3: Add stable stage and card selectors**

```jsx
<Card data-testid={`phase-column-${stage.title.toLowerCase().replace(/\s+/g, '-')}`}>
```

```jsx
<div data-testid={`candidate-card-${candidate.id}`}>
```

- [ ] **Step 4: Run the frontend test/build smoke check**

Run: `npm test -- --watchAll=false`
Expected: existing tests pass or no selector-related regressions appear

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/PositionDetails.js frontend/src/components/StageColumn.js frontend/src/components/CandidateCard.js
git commit -m "test: add stable selectors for position e2e"
```

### Task 4: Add Playwright Tooling

**Files:**
- Create: `frontend/playwright.config.ts`
- Modify: `frontend/package.json`

- [ ] **Step 1: Add Playwright dependency and scripts**

```json
{
  "scripts": {
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.60.0"
  }
}
```

- [ ] **Step 2: Create the Playwright config**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' }
});
```

- [ ] **Step 3: Install browsers and verify config**

Run: `npx playwright install`
Expected: browser binaries installed successfully

- [ ] **Step 4: Dry-run test discovery**

Run: `npx playwright test --list`
Expected: Playwright loads config and lists specs without syntax errors

- [ ] **Step 5: Commit**

```bash
git add frontend/package.json frontend/playwright.config.ts
git commit -m "test: add playwright configuration"
```

### Task 5: Implement The Position E2E Flow

**Files:**
- Create: `frontend/tests/e2e/position.spec.ts`

- [ ] **Step 1: Write the failing page-load test**

```ts
import { test, expect } from '@playwright/test';

test('loads the position board with stages and candidates', async ({ page }) => {
  await page.goto('/positions/1');
  await expect(page.getByTestId('position-title')).toBeVisible();
});
```

- [ ] **Step 2: Write the failing drag-and-drop assertion**

```ts
test('moves a candidate and sends the update request', async ({ page }) => {
  await page.goto('/positions/1');
  const requestPromise = page.waitForRequest(req => req.method() === 'PUT' && req.url().includes('/candidates/'));
});
```

- [ ] **Step 3: Implement the full scenario**

```ts
await page.getByTestId('candidate-card-1').dragTo(page.getByTestId('phase-column-interview'));
const request = await requestPromise;
expect(request.postDataJSON()).toMatchObject({ currentInterviewStep: expect.any(Number) });
```

- [ ] **Step 4: Run the spec**

Run: `npx playwright test tests/e2e/position.spec.ts`
Expected: both scenarios pass and HTML report is generated

- [ ] **Step 5: Commit**

```bash
git add frontend/tests/e2e/position.spec.ts prompts/prompts-mjtr.md
git commit -m "test: cover position flow with playwright"
```

### Task 6: Evidence And Delivery

**Files:**
- Modify: `README.md`
- Modify: `prompts/prompts-mjtr.md`

- [ ] **Step 1: Add exact execution instructions if needed**

```md
cd backend && npm run dev
cd frontend && npm start
cd frontend && npx playwright test
```

- [ ] **Step 2: Capture final evidence**

Run: `npx playwright show-report`
Expected: report opens with passing tests for the `position` flow

- [ ] **Step 3: Update the prompt log with the final prompts used**

```md
3. "Añade data-testid estables para la vista position."
4. "Configura Playwright y crea la prueba E2E para el flujo completo."
```

- [ ] **Step 4: Final verification**

Run: `npm test && npx playwright test`
Expected: Jest and Playwright suites pass for the modified scope

- [ ] **Step 5: Commit**

```bash
git add README.md prompts/prompts-mjtr.md
git commit -m "docs: add execution evidence and delivery notes"
```
