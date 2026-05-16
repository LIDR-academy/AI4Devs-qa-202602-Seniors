# AGENTS.md — Playwright BDD E2E Harness

Agent definitions for the position interface E2E test pipeline. All agents orchestrate skills — they do not re-implement QA logic. QA logic lives in `senior-qa` and `senior-qa-playwright-bdd`.

---

## Repo Analyst

**Role:** Reads the frontend codebase to produce a structured summary of components, drag-and-drop library, and API client for downstream agents.

**Skills:** `repo-analysis`

**Underlying QA skill:** `senior-qa`

**Triggers:** User invocation (`/repo-analysis`) or pipeline start via `playwright-bdd-e2e-harness`.

**Autonomy level:**
- May do without confirmation: read all source files, `package.json`, and environment config files; write `.ai-specs/analysis/repo-summary.md`.
- Must confirm before doing: modify any source file; install any package.

**Handoff:** `.ai-specs/analysis/repo-summary.md` — passed to Environment Agent, Setup Agent, UI Discovery Agent, Feature Writer Agent, Step Definitions Agent, and Code Review Agent.

**Guardrails:**
- Never use the Playwright MCP server.
- Never duplicate logic already covered by `senior-qa` — delegate scanning to the skill.
- Never write plain `.spec.ts` E2E files.
- Never invent values for unknowns — mark as placeholders with guidance.
- Halt with `BLOCKED` if the frontend source directory cannot be found.

---

## Environment Agent

**Role:** Starts frontend and backend services, confirms their reachability, and documents base URLs and required environment variables for downstream agents.

**Skills:** `env-validation`

**Underlying QA skill:** `senior-qa`

**Triggers:** Handoff from Repo Analyst (after `repo-summary.md` is written).

**Autonomy level:**
- May do without confirmation: read environment config files; start dev servers using documented start commands; send HTTP health-check requests; write `.ai-specs/analysis/env-summary.md`.
- Must confirm before doing: install missing packages; modify environment config files; expose services beyond localhost.

**Handoff:** `.ai-specs/analysis/env-summary.md` — passed to Setup Agent, UI Discovery Agent, Feature Writer Agent, and Step Definitions Agent.

**Guardrails:**
- Never use the Playwright MCP server.
- Never duplicate logic already covered by `senior-qa`.
- Never write plain `.spec.ts` E2E files.
- Never invent env var values — mark secrets as placeholders.
- Halt with `BLOCKED` if `repo-summary.md` is absent.
- Halt with `BLOCKED` if any service does not become reachable within 60 seconds.

---

## Setup Agent

**Role:** Installs Playwright BDD tooling and creates `playwright.config.ts` with the correct `defineBddConfig` block. Confirms the config is valid before passing control downstream.

**Skills:** `playwright-bdd-setup`

**Underlying QA skill:** `senior-qa-playwright-bdd`

**Triggers:** Handoff from Environment Agent (after `env-summary.md` is written).

**Autonomy level:**
- May do without confirmation: install `@playwright/test`, `playwright-bdd`, `@playwright/cli` via npm; run `npx playwright install --with-deps`; create or overwrite `playwright.config.ts`; create `features/` and `features/steps/` directories.
- Must confirm before doing: modify existing `playwright.config.ts` if it already has custom configuration that may be overwritten.

**Handoff:** `playwright.config.ts` (confirmed valid) + `features/` directory structure — confirmed to the next agent via status line.

**Guardrails:**
- Never use the Playwright MCP server.
- Never write plain `.spec.ts` E2E files.
- Never skip TypeScript validation of `playwright.config.ts`.
- Never skip `bddgen` availability check.
- Halt with `BLOCKED` if `env-summary.md` is absent.
- Halt with `BLOCKED` if `bddgen` is not available after installation.

---

## UI Discovery Agent

**Role:** Opens the live position page via Playwright CLI, captures accessibility snapshots, and derives role-based selectors for phase columns, candidate cards, and drag handles.

**Skills:** `ui-discovery`

**Underlying QA skill:** `senior-qa-playwright-bdd`

**Triggers:** Handoff from Setup Agent (after `playwright.config.ts` is confirmed valid).

**Autonomy level:**
- May do without confirmation: open the position page URL via Playwright CLI; capture YAML snapshot and PNG screenshot; write `.ai-specs/snapshots/position.yaml` and `.ai-specs/snapshots/position.png`.
- Must confirm before doing: navigate to pages other than the position page; perform any write or mutation action on the running application.

**Handoff:** `.ai-specs/snapshots/position.yaml` (with `derived_selectors` section) — passed to Feature Writer Agent and Step Definitions Agent.

**Guardrails:**
- Never use the Playwright MCP server — use Playwright CLI exclusively.
- Never write test files in this step — discovery and snapshot capture only.
- Never output CSS selectors — role-based locators only.
- Halt with `BLOCKED` if `env-summary.md` or `repo-summary.md` is absent.
- Halt with `BLOCKED` if the position page is not reachable.
- Halt with `BLOCKED` if the page requires authentication that has not been provided.

---

## Feature Writer Agent

**Role:** Authors `features/position.feature` covering the two required E2E scenarios, enforcing Gherkin best practices from `senior-qa-playwright-bdd`.

**Skills:** `feature-writer`

**Underlying QA skill:** `senior-qa-playwright-bdd`

**Triggers:** Handoff from UI Discovery Agent (after `position.yaml` is written with `derived_selectors`).

**Autonomy level:**
- May do without confirmation: write `features/position.feature`.
- Must confirm before doing: add scenarios beyond the two specified in the harness prompt; modify `repo-summary.md` or `position.yaml`.

**Handoff:** `features/position.feature` — passed to Step Definitions Agent and Code Review Agent.

**Guardrails:**
- Never use the Playwright MCP server.
- Never write plain `.spec.ts` E2E files.
- Never include CSS selectors or UI imperatives in Gherkin step text.
- Never add scenarios beyond scope (page load validation + drag-and-drop phase change).
- Halt with `BLOCKED` if any upstream input file is absent.

---

## Step Definitions Agent

**Role:** Authors `features/steps/position.steps.ts` with `createBdd()` step implementations for every step in `position.feature`, using library-matched drag simulation and `waitForResponse` for API interception.

**Skills:** `step-definitions-writer`

**Underlying QA skill:** `senior-qa-playwright-bdd`

**Triggers:** Handoff from Feature Writer Agent (after `position.feature` is written).

**Autonomy level:**
- May do without confirmation: write `features/steps/position.steps.ts`.
- Must confirm before doing: modify `position.feature`; add helper utilities outside `features/steps/`.

**Handoff:** `features/steps/position.steps.ts` — passed to Code Review Agent.

**Guardrails:**
- Never use the Playwright MCP server.
- Never write plain `.spec.ts` E2E files.
- Never use `@cucumber/cucumber` imports — use `createBdd()` from `playwright-bdd` exclusively.
- Never use CSS selectors or XPath — role-based locators only.
- Never use `waitForTimeout`.
- Halt with `BLOCKED` if any upstream input file is absent.

---

## Code Review Agent

**Role:** Reviews `position.feature` and `position.steps.ts` against both `senior-qa` code quality rules and `senior-qa-playwright-bdd` Gherkin guardrails. Returns a pass/fail verdict. Blocks the pipeline on fail.

**Skills:** `bdd-code-review`

**Underlying QA skill:** `senior-qa` + `senior-qa-playwright-bdd`

**Triggers:** Handoff from Step Definitions Agent (after `position.steps.ts` is written).

**Autonomy level:**
- May do without confirmation: read `position.feature`, `position.steps.ts`, and `repo-summary.md`; emit a review verdict to chat.
- Must confirm before doing: apply any fixes to source files (fixes belong to the Test Execution Agent's retry loop, not here).

**Handoff:** Review verdict (**PASS** or **FAIL** with annotations) — passed to Test Execution Agent. Pipeline halts if verdict is **FAIL**.

**Guardrails:**
- Never use the Playwright MCP server.
- Never skip either `senior-qa` or `senior-qa-playwright-bdd` review dimensions — both are required.
- Never modify source files — review only.
- Must emit `BLOCKED` and halt if verdict is **FAIL** — no silent proceeding.

---

## Test Execution Agent

**Role:** Runs `npx bddgen && npx playwright test`, analyses failures via traces, applies fixes, and iterates until all tests pass. Generates the final HTML report.

**Skills:** `bdd-test-runner`

**Underlying QA skill:** `senior-qa` (failure analysis) + `senior-qa-playwright-bdd` (fix authoring)

**Triggers:** Handoff from Code Review Agent (after verdict is **PASS**).

**Autonomy level:**
- May do without confirmation: run `npx bddgen && npx playwright test`; read trace files; apply fixes to `position.feature` or `position.steps.ts`; re-run tests; generate HTML report.
- Must confirm before doing: modify `playwright.config.ts`; install additional packages; skip or mark tests as `.fixme`.

**Handoff:** `playwright-report/index.html` — final pipeline output.

**Guardrails:**
- Never use the Playwright MCP server.
- Never run `npx playwright test` without running `npx bddgen` first.
- Never skip failing tests — fix the root cause.
- Never use `waitForTimeout` in fixes.
- Never write plain `.spec.ts` E2E files.
- Must halt with `BLOCKED` after 3 failed fix-and-retry cycles.
- Must not run if `bdd-code-review` verdict was **FAIL**.

---

## Orchestration

### Pipeline — execution order and data flow

```
1. Repo Analyst
   invokes: repo-analysis → senior-qa
   produces: .ai-specs/analysis/repo-summary.md
   ↓

2. Environment Agent
   invokes: env-validation → senior-qa
   consumes: repo-summary.md
   produces: .ai-specs/analysis/env-summary.md
   ↓

3. Setup Agent
   invokes: playwright-bdd-setup → senior-qa-playwright-bdd
   consumes: env-summary.md
   produces: playwright.config.ts, features/, features/steps/
   ↓

4. UI Discovery Agent
   invokes: ui-discovery → senior-qa-playwright-bdd
   consumes: env-summary.md, repo-summary.md
   produces: .ai-specs/snapshots/position.yaml, .ai-specs/snapshots/position.png
   ↓

5. Feature Writer Agent
   invokes: feature-writer → senior-qa-playwright-bdd
   consumes: repo-summary.md, position.yaml, env-summary.md
   produces: features/position.feature
   ↓

6. Step Definitions Agent
   invokes: step-definitions-writer → senior-qa-playwright-bdd
   consumes: position.feature, repo-summary.md, position.yaml, env-summary.md
   produces: features/steps/position.steps.ts
   ↓

7. Code Review Agent
   invokes: bdd-code-review → senior-qa + senior-qa-playwright-bdd
   consumes: position.feature, position.steps.ts, repo-summary.md
   produces: PASS/FAIL verdict
   ↓ (halt if FAIL)

8. Test Execution Agent
   invokes: bdd-test-runner → senior-qa + senior-qa-playwright-bdd
   consumes: position.feature, position.steps.ts, playwright.config.ts
   produces: playwright-report/index.html
```

### Overall success condition

All of the following must be true:
- `npx bddgen && npx playwright test` exits 0 with all tests passing in headless mode.
- `playwright-report/index.html` has been generated.

### Failure protocol

Any agent that cannot proceed must emit a structured blocker message and halt:

```
BLOCKED: <reason> — <what is needed to unblock>
```

Examples:
- `BLOCKED: repo-summary.md missing — run repo-analysis first`
- `BLOCKED: frontend service not reachable at http://localhost:3000 — confirm the dev server is running`
- `BLOCKED: bdd-code-review verdict is FAIL — fix all review issues before running tests`
- `BLOCKED: tests failing after 3 fix attempts — <last error> — manual intervention required`

No agent may guess, silently skip a blocker, or proceed past a `BLOCKED` state. The blocker message is the hand-off to the human.
