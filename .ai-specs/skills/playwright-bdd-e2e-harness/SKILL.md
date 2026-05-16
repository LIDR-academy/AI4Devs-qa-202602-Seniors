---
name: "playwright-bdd-e2e-harness"
description: Entry point that triggers the full Playwright BDD E2E pipeline for the position interface. Hands off immediately to the playwright-bdd-pipeline agent, which coordinates all pipeline skills in order. Use when you want to run the complete pipeline end-to-end in a single invocation.
---

# Playwright BDD E2E Harness

## Description

Entry point for the full Playwright BDD E2E pipeline. Invoking `/playwright-bdd-e2e-harness` hands control to the `playwright-bdd-pipeline` agent, which runs all skills in order and produces passing Gherkin E2E tests plus an HTML report.

## Prerequisites

- `/senior-qa` must be installed.
- `/senior-qa-playwright-bdd` must be installed.
- Node.js and npm must be available.
- The frontend source directory must exist in the working tree.

## What runs

The `playwright-bdd-pipeline` agent executes these skills in sequence:

1. `/repo-analysis`
2. `/env-validation`
3. `/playwright-bdd-setup`
4. `/ui-discovery`
5. `/feature-writer`
6. `/step-definitions-writer`
7. `/bdd-code-review`
8. `/bdd-test-runner`

See `.ai-specs/agents/playwright-bdd-pipeline.agent.md` for the full coordination logic, handoff contracts, and failure protocol.

## Success condition

- `npx bddgen && npx playwright test` exits 0 with all tests passing headless.
- `playwright-report/index.html` generated.

## Failure protocol

Any skill that cannot proceed emits:

```
BLOCKED: <reason> — <what is needed to unblock>
```

The pipeline halts and returns control to the developer with a clear description of what is needed.
