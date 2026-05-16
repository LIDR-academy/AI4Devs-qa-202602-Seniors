# AI Harness boostrap master prompt 

````markdown
# Role
You are a senior AI tooling engineer embedded in a Claude Code session with full filesystem and shell access to the AI4Devs-qa repository.

# Objective
Scaffold a `senior-qa-playwright-bdd` skill, a set of orchestration skills, and an AGENTS.md definition inside `.ai-specs/` that extend the existing `senior-qa` skill with Playwright BDD conventions, and coordinate it through a full agent pipeline to implement Gherkin E2E tests for the `position` interface.

# Context
The repository is AI4Devs-qa. It already has the `senior-qa` skill installed from https://github.com/alirezarezvani/claude-skills/tree/main/engineering-team/skills/senior-qa. Read that skill's SKILL.md before creating anything — all new skills and agents must delegate QA execution to `senior-qa` rather than duplicate its logic.

The `senior-qa` skill covers this tech stack:
- **Unit/Integration:** Jest, React Testing Library
- **E2E:** Playwright
- **Coverage:** Istanbul, NYC, LCOV
- **API Mocking:** MSW (Mock Service Worker)
- **Accessibility:** jest-axe, @axe-core/playwright

The two E2E scenarios that must ultimately be covered are:
1. **Page load validation** — position title, all phase columns, and candidate cards in their correct columns render successfully.
2. **Drag-and-drop phase change** — a candidate card is dragged between columns; a `PUT /candidate/:id` fires with the correct candidate ID and new phase in the body; the backend returns a 2xx; the card appears in the destination column.

All E2E tests must be written as Gherkin scenarios in `.feature` files executed via **playwright-bdd** (https://vitalets.github.io/playwright-bdd/#/), using `createBdd()` from `playwright-bdd` for step definitions. This is the only convention that `senior-qa` does not already cover and that the new skill layer must add.

**Playwright interaction strategy:** All live browser exploration during test authoring must use the **Playwright CLI** (`@playwright/cli`). Do not use or reference the Playwright MCP server anywhere. The CLI saves snapshots and screenshots as YAML files to disk, which agents read selectively.

Playwright CLI command reference:
```bash
playwright-cli open <url>
playwright-cli snapshot <output.yaml>
playwright-cli click "<selector>"
playwright-cli type "<selector>" "<value>"
playwright-cli screenshot <output.png>
playwright-cli state-save <auth.json>
```

playwright-bdd execution pipeline (must be used verbatim in all setup and runner skills):
```bash
npx bddgen          # generates Playwright test files from .feature files
npx playwright test # executes the generated tests
```

# Workflow

## Step 1 — Read existing skills before writing anything
- Read the installed `senior-qa` SKILL.md in full.
- Identify exactly what `senior-qa` already handles (codebase analysis, test writing, review, coverage) and what it does not (Gherkin format, `.feature` files, `playwright-bdd` setup, `bddgen` pipeline).
- Use this gap analysis to scope every new skill and agent precisely — orchestrate and extend, never duplicate.

## Step 2 — Create the `senior-qa-playwright-bdd` extension skill
Create `.ai-specs/skills/senior-qa-playwright-bdd/SKILL.md`.

This skill wraps `senior-qa` and adds Playwright BDD conventions. It must:
- Explicitly declare that it extends `senior-qa` and list which of `senior-qa`'s capabilities it delegates to unchanged.
- Add only what `senior-qa` does not cover:
  - Installing `playwright-bdd` and `@playwright/cli` alongside `@playwright/test`.
  - Configuring `playwright.config.ts` with the `defineBddConfig` block pointing to `features/*.feature` and `features/steps/*.ts`.
  - Instructing that all E2E tests must be written as Gherkin in `.feature` files, not as plain `.spec.ts` files.
  - Instructing that step definitions use `createBdd()` from `playwright-bdd` with Playwright fixtures.
  - Enforcing Gherkin best practices: one `When` per scenario, domain language (not UI imperative language), `Scenario Outline` + `Examples` where data varies, `Background` for shared preconditions.
  - Using `npx bddgen && npx playwright test` as the execution pipeline instead of `npx playwright test` alone.
  - Using Playwright CLI for all browser exploration during authoring.
- Include guardrails inherited from `senior-qa` plus BDD-specific additions: never write Gherkin steps that describe UI clicks or CSS selectors; never use `waitForTimeout`; never use the Playwright MCP server.

## Step 3 — Design the orchestration skill set
Create the following thin orchestration skills that coordinate the agent pipeline. Each skill's job is to invoke the right underlying skill (`senior-qa` or `senior-qa-playwright-bdd`) at the right moment with the right inputs — not to re-implement QA logic.

- **repo-analysis** — delegates to `senior-qa` to read and summarise the frontend structure, the position page components, the drag-and-drop library in use, and the API client for `PUT /candidate/:id`. Saves output as `.ai-specs/analysis/repo-summary.md` for downstream agents.
- **env-validation** — delegates to `senior-qa` to start frontend and backend, confirm reachability, and document base URLs and required env vars. Saves output as `.ai-specs/analysis/env-summary.md`.
- **playwright-bdd-setup** — delegates to `senior-qa-playwright-bdd` to install `@playwright/test`, `playwright-bdd`, and `@playwright/cli`; run `npx playwright install --with-deps`; and create `playwright.config.ts` with the correct `defineBddConfig` block.
- **ui-discovery** — uses Playwright CLI to open the live position page, capture accessibility snapshots, and produce `.ai-specs/snapshots/position.yaml` with the exact role-based selectors for phase columns, candidate cards, and drag handles. Delegates selector interpretation to `senior-qa-playwright-bdd`.
- **feature-writer** — delegates to `senior-qa-playwright-bdd` to write `features/position.feature` consuming `repo-summary.md` and `position.yaml` as inputs. Enforces Gherkin best practices from the extension skill.
- **step-definitions-writer** — delegates to `senior-qa-playwright-bdd` to write `features/steps/position.steps.ts` using `createBdd()`, Playwright fixtures, accessible selectors, `waitForResponse` for PUT interception, and drag simulation matched to the library identified in `repo-summary.md`.
- **bdd-code-review** — delegates to `senior-qa` for general code review plus applies `senior-qa-playwright-bdd` Gherkin guardrails. Reviews both `position.feature` and `position.steps.ts`. Returns a pass/fail verdict with inline annotations.
- **bdd-test-runner** — runs `npx bddgen && npx playwright test`, reads Playwright trace on failure, delegates root-cause analysis to `senior-qa`, applies fixes to feature and/or step definition files, re-runs until all tests pass, generates HTML report.

For each skill, create `.ai-specs/skills/<skill-slug>/SKILL.md` following this structure:

```
# <Skill Name>

## Description
<One sentence: what this skill does, which underlying skill it delegates to, and when to invoke it.>

## Delegates to
<senior-qa | senior-qa-playwright-bdd | both — and which specific capability.>

## Inputs
<List of inputs — file paths, URLs, summaries from upstream skills. Mark optional ones.>

## Steps
<Numbered steps. Each step either reads an input, invokes an underlying skill with
specific instructions, or writes an output. No QA logic re-implemented here.>

## Output
<Files created or updated. Always includes a one-line status summary printed to chat.>

## Guardrails
<Constraints specific to this orchestration step — e.g. must not proceed if
repo-summary.md is absent; must not write .spec.ts files (use .feature only);
must not use the Playwright MCP server.>
```

## Step 4 — Create the AGENTS.md definition
Create `.ai-specs/AGENTS.md`.

### Agent definitions
Define one agent per pipeline stage. Each agent orchestrates one or more skills and has clear autonomy boundaries. For each agent:

```markdown
## <Agent Name>

**Role:** <One sentence — what this agent is responsible for in the pipeline.>

**Skills:** <Comma-separated skill slugs this agent invokes.>

**Underlying QA skill:** <senior-qa | senior-qa-playwright-bdd | both.>

**Triggers:** <What activates this agent — either a user invocation or a handoff from the previous agent.>

**Autonomy level:**
- May do without confirmation: <list>
- Must confirm before doing: <list>

**Handoff:** <Output this agent produces and the exact file paths or summaries passed to the next agent.>

**Guardrails:** <Hard constraints. Always include: never use Playwright MCP server; never
duplicate logic already covered by senior-qa; never write plain .spec.ts E2E files —
use .feature + step definitions only.>
```

Define agents for:
- **Repo Analyst** — invokes `repo-analysis`, produces `repo-summary.md`.
- **Environment Agent** — invokes `env-validation`, produces `env-summary.md`.
- **Setup Agent** — invokes `playwright-bdd-setup`, confirms config file is correct before proceeding.
- **UI Discovery Agent** — invokes `ui-discovery` via Playwright CLI, produces `position.yaml`.
- **Feature Writer Agent** — invokes `feature-writer`, consumes `repo-summary.md` + `position.yaml`, produces `features/position.feature`.
- **Step Definitions Agent** — invokes `step-definitions-writer`, consumes all upstream outputs, produces `features/steps/position.steps.ts`.
- **Code Review Agent** — invokes `bdd-code-review`, returns annotated verdict; blocks pipeline if verdict is fail.
- **Test Execution Agent** — invokes `bdd-test-runner`, iterates until all tests pass, produces HTML report.

### Orchestration section
Add an `## Orchestration` section with:
- Numbered pipeline showing agent execution order and data flow between handoffs.
- Overall success condition: all BDD tests pass headless, HTML report generated, prompts file written.
- Failure protocol: any agent that cannot proceed must emit a structured blocker message (`BLOCKED: <reason> — <what is needed to unblock>`) and halt. No guessing, no silent skipping.

## Step 5 — Create the master orchestration skill
Create `.ai-specs/skills/playwright-bdd-e2e-harness/SKILL.md` as the single developer entry point. It must:
- List the full agent pipeline in order with their skill delegations.
- State that QA execution is handled by `senior-qa` and `senior-qa-playwright-bdd`; this skill only coordinates.
- State that all browser interaction uses Playwright CLI, not the Playwright MCP server.
- State that all E2E tests are Gherkin `.feature` files run via `npx bddgen && npx playwright test`.
- State the success condition and failure protocol.

## Step 6 — Create a README
Create `.ai-specs/README.md` with:
- A skills table: slug, description, delegates-to, required inputs.
- An agents table: name, role, skills used, underlying QA skill.
- Invocation instructions for the master orchestration skill and for each individual agent.
- A note that `senior-qa` must already be installed before invoking any skill in this harness.
- A note that all browser interaction uses Playwright CLI; Playwright MCP server is not used.
- A note that all E2E tests use `playwright-bdd`: `.feature` files + `createBdd()` step definitions + `npx bddgen && npx playwright test`.

# Output format
After all files are written, print a structured summary containing:
- Full list of files created with their relative paths.
- The agent execution order as defined in AGENTS.md.
- The gap between `senior-qa` and `senior-qa-playwright-bdd` as identified in Step 1.
- Any values left as placeholders because they could not be determined from the codebase, with guidance on how to fill them in.
````

```markdown
Add YAML frontmatters to all the skills created, take as a reference @.ai-specs/skills/senior-qa/SKILL.md
```

```markdown
Almost all the skills have references to `.ai-specs` directory - just use slash commands to reference other skills if that is needed. 
Usually a skill should not reference another one. That's where agents come in - they orchestrate the skills and pass the outputs/inputs between them.
Re-review the skills generated and evaluate if a coordinator agent (`.ai-specs/agents/whatever.agent.md`) is needed
```
