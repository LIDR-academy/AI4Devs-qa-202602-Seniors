---
name: playwright-bdd-runner
description: Conventions for wiring playwright-bdd into this project — `defineBddConfig`, `createBdd()`, fixtures, page objects, and the planner / generator / healer test agents. Loaded by `playwright-bdd-tester` during Phase 4 / 5.
---

# File layout

```
tests/
├── features/
│   └── positions.feature
├── steps/
│   └── positions.steps.ts
├── fixtures/
│   ├── api.fixture.ts        # network-interception helpers
│   └── seed.fixture.ts       # DB / API seeding via REST
├── pages/
│   └── positionPage.ts       # Page Object for the kanban board
└── .auth/                    # storage state, if any
```

# `playwright.config.ts` — additions only

Do not rewrite the existing config. Add (alongside the existing `projects`):

```ts
import { defineConfig } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';

const bddProject = defineBddProject({
  name: 'bdd-chromium',
  features: 'tests/features/*.feature',
  steps:    'tests/steps/*.ts',
});

export default defineConfig({
  // …existing config…
  projects: [
    bddProject,
    // …keep the existing chromium / firefox / webkit projects…
  ],
  webServer: [
    { command: 'cd backend  && npm run dev', port: 3010, reuseExistingServer: true },
    { command: 'cd frontend && npm start',   port: 3000, reuseExistingServer: true },
  ],
});
```

# Step definitions — must use `createBdd()` with fixtures

```ts
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures';      // exports a `test` extended with PositionPage + apiFixture

const { Given, When, Then } = createBdd(test);

Given('the recruiter opens the position board for {string}', async ({ positionPage }, title) => {
  await positionPage.gotoByTitle(title);
});

When('the recruiter moves the candidate {string} to {string}', async ({ positionPage }, candidate, stage) => {
  await positionPage.moveCandidate(candidate, stage);
});

Then('the candidate {string} appears under {string}', async ({ positionPage }, candidate, stage) => {
  await positionPage.expectCandidateInStage(candidate, stage);
});

Then('a stage update is persisted for {string} to {string}', async ({ apiFixture }, candidate, stage) => {
  const req = await apiFixture.lastPutCandidate();
  apiFixture.expectRequestMatches(req, { candidateName: candidate, newStage: stage });
});
```

The `apiFixture` wraps `page.waitForRequest(/\/candidates\/\d+$/)` and reads `applicationId` + `currentInterviewStep` from the body so the Gherkin sentence stays domain-level while the implementation enforces the backend contract.

# Reuse before authoring

Before writing a new step, `grep -n "^(Given|When|Then|And)\\('" tests/steps/`. If a phrasing already exists, reuse it. Synonyms are forbidden (see `bdd-gherkin-authoring`).

# Running the suite

```bash
npx bddgen                       # generates intermediate .spec.ts from .feature
npx playwright test --project=bdd-chromium
npx playwright show-report       # opens HTML report (Phase 6 input)
```

# Playwright test agents

After `npx playwright init-agents --loop=claude`:

| Agent | Phase | Command |
|---|---|---|
| `planner` | start of Phase 4 — outputs a Markdown test plan | `npx playwright run-agent planner` |
| `generator` | end of Phase 4 — emits `.feature` and steps from the plan | `npx playwright run-agent generator` |
| `healer` | during Phase 5 — repairs flaky failures once before defect logging | `npx playwright run-agent healer` |

# Drag-and-drop with react-beautiful-dnd

`react-beautiful-dnd` does **not** respond to native `mousedown`/`mousemove`/`mouseup` reliably. In the page object, use a keyboard-driven move (the library's accessibility path): focus the candidate card, press `Space`, arrow to the target column, press `Space` again. This is robust across browsers.
