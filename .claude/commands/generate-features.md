---
description: Phase 4 — delegate to `playwright-bdd-tester` to author Gherkin features and step definitions for the Position kanban interface.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
argument-hint: "(no arguments)"
---

# Phase 4 — Author BDD coverage

1. Delegate to the sub-agent `playwright-bdd-tester` (loads `bdd-gherkin-authoring` and `playwright-bdd-runner`).
2. Run the Playwright **planner** agent against a running dev environment (`docker compose up -d` from Phase 0 must still be active; `frontend` and `backend` must be running).
3. Run the **generator** agent to scaffold `tests/features/positions.feature` and `tests/steps/positions.steps.ts`.
4. Refactor by hand to satisfy:
   - Single `When` per scenario.
   - Ubiquitous domain language (`candidate`, `position`, `interview stage`).
   - Scenario Outline + Examples wherever cases share structure.
   - `@happy`, `@sad`, `@edge` tags applied consistently.
5. Mandatory scenarios (from `master_prompt.md`):
   - **Happy 1** — Position board loads correctly.
   - **Happy 2** — A candidate is moved to a new stage (asserts visual move + `PUT /candidates/:id` body + 2xx).
   - **Sad** — Backend returns 500 on stage change; UI must revert.
   - **Edge** — Drop on the same column (no PUT fired); empty stage column rendered.
6. Wire `playwright.config.ts` with the `playwright-bdd` project + `webServer` block defined in the `playwright-bdd-runner` skill. Do **not** overwrite the existing `chromium / firefox / webkit` projects — merge.
7. Delete `tests/example.spec.ts` once `positions.feature` lands.

# Verification

```bash
npx bddgen >/dev/null
test -s tests/features/positions.feature && test -s tests/steps/positions.steps.ts && echo OK
```
