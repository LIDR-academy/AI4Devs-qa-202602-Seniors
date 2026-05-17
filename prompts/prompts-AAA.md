# 1) AI Harness boostrap master prompt 

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

---

# 2) Launch the E2E pipeline

````markdown
# Role
You are a senior QA engineer working in a Claude Code session with full filesystem and shell access to the AI4Devs-qa repository.

# Objective
Implement two Playwright BDD E2E test scenarios for the position interface by running the skill and agent pipeline already scaffolded in `.ai-specs/`.

# Context
The repository is AI4Devs-qa. The `.ai-specs/` directory contains a fully scaffolded pipeline ready to drive the implementation:

- **Entry point:** `/playwright-bdd-e2e-harness`
- **Coordinator agent:** `.ai-specs/agents/playwright-bdd-pipeline.agent.md`
- **Pipeline skills (in order):** `/repo-analysis` → `/env-validation` → `/playwright-bdd-setup` → `/ui-discovery` → `/feature-writer` → `/step-definitions-writer` → `/bdd-code-review` → `/bdd-test-runner` 

The two E2E scenarios to implement are:

**Scenario 1 — Page load validation**
Validate that after navigating to the position page:
- The position title is visible.
- All phase columns are displayed (e.g. Aplicado, Entrevista, Prueba Técnica, Oferta, Contratado, Rechazado).
- Each candidate card appears in the column that matches their current phase.

**Scenario 2 — Drag-and-drop phase change**
Simulate moving a candidate card between columns and validate:
- A `PUT /candidate/:id` request fires with the correct candidate ID and the new phase in the body.
- The backend returns a 2xx response.
- The candidate card appears in the destination column.

The tests use `playwright-bdd` (Gherkin `.feature` files + `createBdd()` step definitions) executed via `npx bddgen && npx playwright test`. Playwright must be installed inside the
`/frontend` directory.

**Delivery requirements:**
- All tests passing headless with an HTML report generated.

# Instructions

1. Read `.ai-specs/agents/playwright-bdd-pipeline.agent.md` first to understand the full pipeline, handoff contracts, and gate conditions before invoking anything.
2. Invoke `/playwright-bdd-e2e-harness` to run the full pipeline. The coordinator agent defines the exact execution order.
3. Follow each step in sequence. If any skill emits a `BLOCKED:` message, halt immediately and surface the blocker — do not skip or guess past it.
4. After `/bdd-test-runner` completes successfully, confirm completion by printing the final `npx bddgen && npx playwright test` exit status and the path to the generated HTML report.

# Constraints
- All browser interaction must use Playwright CLI (`@playwright/cli`) — never the Playwright MCP server.
- All E2E tests must be Gherkin `.feature` files with `createBdd()` step definitions — never plain `.spec.ts` files.
- Never use `waitForTimeout` in step definitions — use `waitForLoadState`, `waitForResponse`, or `waitForSelector`.
- Never write CSS selectors or UI imperatives in Gherkin step text — domain language only.
- Drag-and-drop simulation must use the library-specific API identified by `/repo-analysis` from `package.json`.
````

---

# 3) Produce script to run E2E seed/teardown, use Page Object pattern with data-testid locators

````markdown
# Role
You are a senior QA engineer and Playwright BDD specialist embedded in a Claude Code session with full filesystem and shell access to the AI4Devs-qa repository.

# Objective
Introduce two improvements to the existing Playwright BDD E2E implementation: an npm lifecycle script that fully bootstraps and tears down the test environment, and a Page Object layer that centralises all UI locators using `data-testid` attributes.

# Context
The Playwright BDD E2E harness and test implementation for the `position` interface are already in place. The tests use `playwright-bdd`, Gherkin `.feature` files, and `createBdd()` step definitions. The frontend is React. The full environment involves a backend, a frontend, a database, and Docker Compose.

Before making any changes, read the existing implementation in full:
- All `.feature` files and step definition files under `features/`.
- `playwright.config.ts`.
- `package.json` at the root and inside `/frontend`.
- `docker-compose.yml` or equivalent Docker Compose files.
- Any existing database seed scripts or setup scripts.

Use the findings to make every change concrete — actual service names, ports, script paths, and component file locations — rather than leaving placeholders.

# Part 1 — Environment bootstrap and teardown npm script

Add an npm script to `package.json` (root level, or `/frontend/package.json` if that is where the E2E scripts live — determine this from the existing setup) named `test:e2e`.

This script must perform the following steps in order:

1. **Bootstrap** — start all required services via Docker Compose (database, backend, frontend). Wait until each service is healthy before proceeding to the next. Use Docker Compose health checks or a polling mechanism (`wait-on` or equivalent) — do not use fixed `sleep` delays.
2. **Database seed** — run the database seed script to populate the data required by the E2E scenarios. Determine the correct seed command from the existing codebase.
3. **Run E2E tests** — execute `npx bddgen && npx playwright test`.
4. **Teardown** — stop and remove all Docker Compose services regardless of whether the tests passed or failed. Teardown must always run, even on test failure. Use a `finally`-equivalent pattern (e.g. a shell `trap`, a Node.js script with `try/finally`, or a Makefile `.PHONY` target with guaranteed cleanup).

The script must exit with the same exit code as the test run so that CI pipelines correctly detect failures.

If the environment cannot be fully bootstrapped with a single npm script (e.g. secrets or external dependencies are required), document the gap in a `# Manual steps required` comment inside the script rather than silently ignoring it.

# Part 2 — Page Object layer with data-testid locators

## Step 1 — Add data-testid attributes to the frontend
Modify the React component files that render the `position` page to add `data-testid` attributes to every interactive and observable element needed by the E2E tests. At minimum, add `data-testid` to:
- The position title element.
- Each phase column container, with the phase name encoded in the attribute value (e.g. `data-testid="column-applied"`).
- Each candidate card, with the candidate ID encoded in the attribute value (e.g. `data-testid="candidate-card-42"`).
- Each drag handle, if separate from the card.

Use a consistent naming convention derived from the existing codebase conventions (kebab-case preferred). Do not remove or replace existing accessibility attributes (`aria-*`, `role`) — add `data-testid` alongside them.

## Step 2 — Create Page Object files
Create a Page Object for the `position` page at `features/pages/PositionPage.ts`.

The Page Object must:
- Encapsulate all locators for the `position` page using `getByTestId()` exclusively, referencing the `data-testid` values added in Step 1.
- Expose typed methods for every action and assertion performed in the step definitions: navigating to the page, reading the position title, listing phase columns, reading candidate cards per column, performing the drag-and-drop, and awaiting the `PUT /candidate/:id` response.
- Accept a Playwright `Page` fixture as a constructor argument.
- Contain no test assertions itself — assertions remain in the step definitions.

## Step 3 — Refactor step definitions to use the Page Object
Update all step definition files under `features/steps/` to:
- Import and instantiate `PositionPage` from the Page Object.
- Replace all inline locator calls (`getByRole`, `getByLabel`, `getByText`, etc.) with calls to the Page Object methods.
- Preserve all existing `waitForResponse` interception logic for the PUT call — move it into a Page Object method rather than removing it.
- Preserve all existing Gherkin step signatures unchanged so that `.feature` files require no modification.

# Constraints
- Do not modify any `.feature` file.
- Do not add fixed `sleep` or `waitForTimeout` calls anywhere.
- Do not remove existing `aria-*` or `role` attributes from the frontend HTML.
- The `test:e2e` script must work from a clean environment with no services pre-running.
- All new locators in the Page Object must use `getByTestId()` — no CSS class selectors, no XPath, no auto-generated IDs.
- The agent may freely modify frontend React component files to add `data-testid` attributes.

# Output format
After all changes are complete, print a structured summary containing:
- List of frontend component files modified with the `data-testid` attributes added.
- The full `test:e2e` script definition and the `package.json` file it was added to.
- List of Page Object files created with their paths.
- List of step definition files refactored and a summary of what changed in each.
- Any manual steps required that could not be automated, with explanation.
````

---

# 4) Fix the E2E seed data to be idempotent and unique

````markdown
# Role
You are a senior QA engineer and Playwright BDD specialist embedded in a Claude Code session with full filesystem and shell access to the AI4Devs-qa repository.

# Objective
Replace the existing shared database seed used by the E2E tests with a dedicated TypeScript E2E seed script that creates identifiable test data on bootstrap and removes it completely on teardown.

# Context
The Playwright BDD E2E harness is already in place, including a `test:e2e` npm script that bootstraps the environment, runs the tests, and tears down. The project uses TypeScript throughout. The current setup uses a shared database seed. This must be replaced with an isolated E2E-specific seed that is safe to create and destroy independently of any other environment data.

Before making any changes, read the existing implementation in full:
- The current seed script(s), their TypeScript configuration, and their invocation in `test:e2e`.
- `tsconfig.json` (root and any project-specific ones) to determine the compiler options, module system, and path aliases in use.
- The database access layer — ORM, query builder, or raw client in use (e.g. Prisma, TypeORM, Knex, pg) — and how existing scripts import and use it.
- The database schema to identify which tables and columns store names, emails, and any other user-identifying fields relevant to the E2E scenarios.
- The existing `.feature` files and Page Object to understand exactly which data the E2E tests depend on (positions, candidates, phases, users).

Use the findings to make every change consistent with the existing TypeScript conventions, ORM usage, and script execution pattern — rather than leaving placeholders.

# Part 1 — E2E seed script

Create a dedicated seed script at `scripts/seed-e2e.ts` following the same TypeScript and ORM conventions as existing scripts in the codebase.

All seeded records must carry an `e2e` discriminator embedded in every human-readable field:
- Names must follow the pattern `E2E <Name>` (e.g. `E2E Alice`, `E2E Position Frontend`).
- Email addresses must use the format `<handle>+e2e@<domain>` or `e2e-<handle>@<domain>` — determine the exact format from the existing email conventions in the codebase and apply it consistently.
- Any other user-identifying or label fields (usernames, slugs, display names) must include `e2e` as a prefix, suffix, or infix following the same convention as names and emails.

The seed script must be idempotent: if records with the `e2e` discriminator already exist, skip insertion rather than creating duplicates.

Use `tsx` to execute the script (e.g. `npx tsx scripts/seed-e2e.ts`) unless the existing seed scripts use a different TypeScript runner — in that case match the existing pattern exactly.

# Part 2 — E2E teardown script

Create a dedicated teardown script at `scripts/teardown-e2e.ts` using the same TypeScript and ORM conventions as the seed script.

The teardown script must:
- Delete records by matching the `e2e` discriminator in the relevant fields — not by ID, timestamp, or any other fragile identifier.
- Delete in dependency order to respect foreign key constraints (child records before parent records).
- Be idempotent — no errors if records do not exist.
- Never delete records that do not carry the `e2e` discriminator.

# Part 3 — Wire into the test:e2e script

Update the existing `test:e2e` npm script to:
1. Replace the current seed invocation with `npx tsx scripts/seed-e2e.ts` (or the existing TypeScript runner equivalent).
2. Replace the current teardown invocation with `npx tsx scripts/teardown-e2e.ts`.
3. Ensure `scripts/teardown-e2e.ts` runs in the `finally` block — after both passing and failing test runs — alongside the Docker Compose teardown.

The exit code of the `test:e2e` script must still reflect the Playwright test result, not the teardown result.

# Part 4 — Update Page Object and step definitions if needed

If any hardcoded names, emails, or identifiers in the Page Object (`features/pages/PositionPage.ts`) or step definitions (`features/steps/*.ts`) reference the old seed data, update them to match the new `e2e`-discriminated values. Preserve all TypeScript types and interfaces — do not introduce `any`. Do not modify any `.feature` file.

# Constraints
- All new scripts must be valid TypeScript consistent with the project's `tsconfig.json`.
- Never delete database records that do not carry the `e2e` discriminator in the teardown script.
- The seed and teardown scripts must be runnable independently of the full `test:e2e` pipeline for local debugging.
- Do not use fixed `sleep` or `waitForTimeout` anywhere.
- Do not introduce `any` types where the existing codebase uses typed models.
- Do not modify any `.feature` file.

# Output format
After all changes are complete, print a structured summary containing:
- The TypeScript runner used and how it was determined from the existing codebase.
- The seed script path and a table of every record type it creates, with example field values showing the `e2e` discriminator pattern applied.
- The teardown script path and the deletion order with rationale for each step.
- The updated `test:e2e` script showing exactly where seed and teardown are invoked.
- Any step definition or Page Object files updated, with a summary of what changed.
````
