# Playwright BDD Pipeline Agent

Coordinator agent for the position interface E2E test pipeline. Invokes pipeline skills in order, enforces handoff contracts, and applies the failure protocol. Does not implement QA logic — that lives in `/senior-qa` and `/senior-qa-playwright-bdd`.

---

## Trigger

- Invoked by `/playwright-bdd-e2e-harness`
- Or directly when the user wants to run the full pipeline

---

## Pipeline

Run skills in this order. Each skill must complete successfully before the next starts.

### 1. `/repo-analysis`

**Runs:** Reads `package.json` and frontend source to map components, drag-and-drop library, and `PUT /candidate/:id` API client.
**Produces:** `analysis/repo-summary.md`
**Gate:** Halt if `repo-summary.md` is not written or contains unresolved `BLOCKED`.

---

### 2. `/env-validation`

**Consumes:** `analysis/repo-summary.md`
**Runs:** Starts frontend and backend services, confirms reachability, documents base URLs and env vars.
**Produces:** `analysis/env-summary.md`
**Gate:** Halt if `env-summary.md` is not written or any service failed to become reachable.

---

### 3. `/playwright-bdd-setup`

**Consumes:** `analysis/env-summary.md`
**Runs:** Installs `@playwright/test`, `playwright-bdd`, `@playwright/cli`; creates `playwright.config.ts` with `defineBddConfig`; confirms `bddgen` is available.
**Produces:** `playwright.config.ts`, `features/`, `features/steps/`
**Gate:** Halt if `playwright.config.ts` does not type-check or `bddgen` is unavailable.

---

### 4. `/ui-discovery`

**Consumes:** `analysis/env-summary.md`, `analysis/repo-summary.md`, live frontend service
**Runs:** Opens the position page via Playwright CLI; captures `snapshots/position.yaml` and `snapshots/position.png`; derives role-based selectors into `derived_selectors`.
**Produces:** `snapshots/position.yaml`, `snapshots/position.png`
**Gate:** Halt if `position.yaml` does not contain a `derived_selectors` section.

---

### 5. `/feature-writer`

**Consumes:** `analysis/repo-summary.md`, `snapshots/position.yaml`, `analysis/env-summary.md`
**Runs:** Authors `features/position.feature` with page-load and drag-and-drop scenarios following `/senior-qa-playwright-bdd` Gherkin conventions.
**Produces:** `features/position.feature`
**Gate:** Halt if file is absent or contains fewer than 2 scenarios.

---

### 6. `/step-definitions-writer`

**Consumes:** `features/position.feature`, `analysis/repo-summary.md`, `snapshots/position.yaml`, `analysis/env-summary.md`
**Runs:** Authors `features/steps/position.steps.ts` with `createBdd()` implementations for every step in `position.feature`.
**Produces:** `features/steps/position.steps.ts`
**Gate:** Halt if file is absent or any step in `position.feature` has no matching implementation.

---

### 7. `/bdd-code-review`

**Consumes:** `features/position.feature`, `features/steps/position.steps.ts`, `analysis/repo-summary.md`
**Runs:** Applies `/senior-qa` Playwright quality rules and `/senior-qa-playwright-bdd` Gherkin guardrails. Emits annotated PASS or FAIL verdict.
**Produces:** Verdict printed to chat
**Gate:** **Hard block** — do not proceed to step 8 if verdict is FAIL.

---

### 8. `/bdd-test-runner`

**Consumes:** `features/position.feature`, `features/steps/position.steps.ts`, `playwright.config.ts`
**Runs:** `npx bddgen && npx playwright test`; reads traces on failure; applies fixes; retries up to 3 cycles; generates HTML report.
**Produces:** `playwright-report/index.html`
**Gate:** Halt if tests still fail after 3 fix cycles.

---

---

## Handoff contract

Each skill receives the output files of all preceding skills. No skill is invoked unless all its required inputs exist on disk. If a skill emits a `BLOCKED:` message, the agent halts immediately and surfaces it to the developer — no guessing, no silent skipping.

---

## Success condition

All three must be true:

1. `npx bddgen && npx playwright test` exits 0 headless.
2. `playwright-report/index.html` exists.

---

## Failure protocol

Any skill that cannot proceed emits:

```
BLOCKED: <reason> — <what is needed to unblock>
```

The agent surfaces this message verbatim and halts. The developer receives a precise description of what is needed to resume from that step.

---

## Autonomy boundaries

**May do without confirmation:**
- Invoke any pipeline skill in order.
- Read any file in the repository.
- Write analysis files (`analysis/`, `snapshots/`), test files (`features/`), and config files (`playwright.config.ts`).
- Install npm packages listed in the pipeline skills.
- Start local dev servers using documented `package.json` scripts.

**Must confirm before doing:**
- Modifying `package.json` scripts or CI configuration.
- Exposing services beyond localhost.
- Running destructive operations (dropping data, resetting state).
- Adding scenarios or test files beyond the two specified E2E scenarios.

---

## Guardrails

- Never use the Playwright MCP server — Playwright CLI only.
- Never write plain `.spec.ts` E2E files — `.feature` + `createBdd()` step definitions only.
- Never run `npx playwright test` without `npx bddgen` preceding it.
- Never duplicate QA logic from `/senior-qa` or `/senior-qa-playwright-bdd` — invoke those skills.
- Never skip a `BLOCKED` state — halt and surface it.
