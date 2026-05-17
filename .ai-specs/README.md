# AI Specs — Playwright BDD E2E Harness

This directory contains the skill and agent definitions for the Playwright BDD E2E test pipeline targeting the position
interface.

**Prerequisite:** `senior-qa` must already be installed before invoking any skill in this harness.

**Browser interaction:** All browser exploration uses the **Playwright CLI** (`@playwright/cli`). The Playwright MCP
server is not used anywhere in this pipeline.

**Test format:** All E2E tests use `playwright-bdd`: Gherkin `.feature` files + `createBdd()` step definitions +
`npx bddgen && npx playwright test`.

---

## Skills

| Slug                         | Description                                                                                                                                                  | Delegates to                             | Required Inputs                                                          |
|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|--------------------------------------------------------------------------|
| `senior-qa`                  | Base QA skill: unit/integration/E2E test generation, coverage analysis, code review                                                                          | —                                        | Repository source                                                        |
| `senior-qa-playwright-bdd`   | Extends `senior-qa` with Gherkin `.feature` files, `playwright-bdd` setup, `createBdd()` step definitions, Playwright CLI exploration, and `bddgen` pipeline | `senior-qa`                              | Repository source                                                        |
| `repo-analysis`              | Reads frontend structure, position components, drag-and-drop library, and API client                                                                         | `senior-qa`                              | Repository root                                                          |
| `env-validation`             | Starts services, confirms reachability, documents base URLs and env vars                                                                                     | `senior-qa`                              | `repo-summary.md`                                                        |
| `playwright-bdd-setup`       | Installs `@playwright/test`, `playwright-bdd`, `@playwright/cli`; creates `playwright.config.ts`                                                             | `senior-qa-playwright-bdd`               | `env-summary.md`                                                         |
| `ui-discovery`               | Opens position page via Playwright CLI, captures YAML snapshot, derives role-based selectors                                                                 | `senior-qa-playwright-bdd`               | `env-summary.md`, `repo-summary.md`, live service                        |
| `feature-writer`             | Authors `features/position.feature` with page-load and drag-and-drop scenarios                                                                               | `senior-qa-playwright-bdd`               | `repo-summary.md`, `position.yaml`, `env-summary.md`                     |
| `step-definitions-writer`    | Authors `features/steps/position.steps.ts` with `createBdd()` implementations                                                                                | `senior-qa-playwright-bdd`               | `position.feature`, `repo-summary.md`, `position.yaml`, `env-summary.md` |
| `bdd-code-review`            | Reviews `.feature` and `.steps.ts` files; returns PASS/FAIL verdict                                                                                          | `senior-qa` + `senior-qa-playwright-bdd` | `position.feature`, `position.steps.ts`, `repo-summary.md`               |
| `bdd-test-runner`            | Runs `bddgen && playwright test`, analyses failures, applies fixes, generates HTML report                                                                    | `senior-qa` + `senior-qa-playwright-bdd` | `position.feature`, `position.steps.ts`, `playwright.config.ts`          |
| `playwright-bdd-e2e-harness` | Master orchestration entry point — coordinates all agents                                                                                                    | `senior-qa` + `senior-qa-playwright-bdd` | All upstream outputs                                                     |

---

## Agents

| Agent                  | Role                                             | Skills Used               | Underlying QA Skill                      |
|------------------------|--------------------------------------------------|---------------------------|------------------------------------------|
| Repo Analyst           | Reads codebase, produces `repo-summary.md`       | `repo-analysis`           | `senior-qa`                              |
| Environment Agent      | Starts services, produces `env-summary.md`       | `env-validation`          | `senior-qa`                              |
| Setup Agent            | Installs tooling, creates `playwright.config.ts` | `playwright-bdd-setup`    | `senior-qa-playwright-bdd`               |
| UI Discovery Agent     | Captures snapshots, derives selectors            | `ui-discovery`            | `senior-qa-playwright-bdd`               |
| Feature Writer Agent   | Authors `position.feature`                       | `feature-writer`          | `senior-qa-playwright-bdd`               |
| Step Definitions Agent | Authors `position.steps.ts`                      | `step-definitions-writer` | `senior-qa-playwright-bdd`               |
| Code Review Agent      | Reviews files, emits PASS/FAIL                   | `bdd-code-review`         | `senior-qa` + `senior-qa-playwright-bdd` |
| Test Execution Agent   | Runs tests, applies fixes, generates report      | `bdd-test-runner`         | `senior-qa` + `senior-qa-playwright-bdd` |

---

## Invocation

### Full pipeline (recommended)

```
/playwright-bdd-e2e-harness
```

Runs all agents in order. Each agent must complete before the next starts.

### Individual agents

```
/repo-analysis          # Step 1 — analyse codebase
/env-validation         # Step 2 — validate environment
/playwright-bdd-setup   # Step 3 — install tooling and configure Playwright BDD
/ui-discovery           # Step 4 — capture snapshots and derive selectors
/feature-writer         # Step 5 — write Gherkin feature file
/step-definitions-writer # Step 6 — write step definitions
/bdd-code-review        # Step 7 — review feature and step files
/bdd-test-runner        # Step 8 — run tests and iterate until passing
```

Each individual agent may be re-run in isolation if you need to re-do a specific step, provided all its required inputs
already exist.

---

## Pipeline Data Flow

```
repo-summary.md ──────────────────────────────────────────────┐
                                                               ▼
env-summary.md ──────────────────┬──────────────────────── feature-writer
                                 ▼                             │
                          playwright-bdd-setup                 ▼
                                 │                    step-definitions-writer
                                 ▼                             │
                          ui-discovery                         ▼
                                 │                      bdd-code-review
                                 ▼                             │
                          position.yaml ──────────────── (PASS only)
                                                               ▼
                                                        bdd-test-runner
                                                               │
                                                               ▼
                                                    playwright-report/index.html
```

---

## Failure Protocol

Any agent that cannot proceed emits:

```
BLOCKED: <reason> — <what is needed to unblock>
```

The pipeline halts. No agent guesses or silently skips a blocker. The developer receives a clear description of what is
needed to resume.

---

## Notes

- `senior-qa` must be installed before running any skill in this harness.
- All browser interaction uses Playwright CLI — the Playwright MCP server is not used.
- All E2E tests are Gherkin `.feature` files run via `npx bddgen && npx playwright test`.
- Step definitions use `createBdd()` from `playwright-bdd` — never `@cucumber/cucumber`.
- `npx bddgen` must always run before `npx playwright test`.
