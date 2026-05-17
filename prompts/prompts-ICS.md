# Prompts log

## Prompt - 2026-05-17T01:54:52Z
### Agent: agent
#### Model: Composer 2

# Persona

You are a **Senior Frontend Engineering Specialist** with strong experience in modern frontend architectures, E2E testing, maintainable UI codebases, Playwright, component-driven development, documentation standards, and AI-assisted development workflows in Cursor.

You are responsible for analyzing the existing project before making recommendations. Your goal is not to invent new standards, but to **extract, formalize, and improve the standards already present in the repository** so future frontend and QA agents can implement E2E tests consistently.

# Context

We are working on an existing project that already has established conventions, architecture decisions, testing practices, documentation patterns, and coding standards.

The immediate implementation goal is to add a series of **End-to-End tests for the `position` interface**. Before implementing those tests, the project needs a formal Cursor rule file that documents the project standards clearly enough for other agents to follow.

You must inspect the repository carefully before writing the output. Pay special attention to:

- Existing frontend folder structure.
- Existing UI architecture and component organization.
- Existing routing, state management, API integration, and data-fetching patterns.
- Existing testing setup, especially E2E, integration, and unit testing conventions.
- Existing Playwright configuration, fixtures, helpers, page objects, selectors, and test data patterns.
- Existing documentation conventions.
- Existing naming conventions for files, components, hooks, utilities, tests, mocks, and fixtures.
- Existing linting, formatting, typing, and code quality standards.
- Existing Cursor rules, agents, skills, or documentation files that define project behavior.
- Existing implementation patterns related to the `position` interface.
- Existing CodeRabbit or automated review expectations, if present.

The final output must help future frontend and QA agents implement E2E tests for the `position` interface without breaking project conventions.

# Desired Outcome

Create or update the following file:

```txt
.cursor/rules/20-project-standards.mdc
```

The file must define the official frontend project standards to be followed by Cursor agents.

The rule must include, at minimum:

1. **Project Overview**
   - Short description of the frontend project.
   - Main technology stack inferred from the repository.
   - Main application domains or modules, including the `position` interface if present.

2. **Architecture Standards**
   - Frontend architecture used in the project.
   - Folder and module organization.
   - Component structure.
   - Separation of concerns.
   - Routing conventions.
   - State management conventions.
   - API/client/data access conventions.
   - Error handling conventions.
   - Accessibility expectations.
   - Performance considerations.

3. **Engineering Principles**
   - KISS: keep implementations simple and avoid unnecessary abstractions.
   - DRY: avoid duplication when it improves maintainability.
   - YAGNI: do not introduce infrastructure or abstractions before they are needed.
   - SOLID where applicable to frontend code.
   - High cohesion and low coupling.
   - Readability over cleverness.
   - Testability as a first-class design concern.

4. **Frontend Coding Standards**
   - Naming conventions.
   - File organization.
   - Component guidelines.
   - Hook guidelines.
   - Utility/helper guidelines.
   - Styling conventions.
   - Type safety expectations.
   - Validation patterns.
   - Error and loading states.
   - Comments and inline documentation expectations.

5. **Documentation Standards**
   - When frontend code must include comments.
   - When files, components, hooks, helpers, or tests need documentation.
   - Preferred documentation style.
   - How to document non-obvious business logic.
   - How to document test intent.
   - How to keep documentation useful and not redundant.

6. **Testing Standards**
   - Unit testing standards.
   - Integration testing standards.
   - E2E testing standards.
   - Test file naming conventions.
   - Test data and fixture conventions.
   - Mocking/stubbing conventions.
   - Page Object Model or screen object conventions, if used.
   - Selector strategy, prioritizing stable user-facing selectors.
   - Accessibility-aware selectors where possible.
   - How to avoid flaky tests.
   - How to structure tests for the `position` interface.
   - How to document generated or modified tests.

7. **Playwright E2E Standards**
   - Preferred Playwright patterns already used in the project.
   - Use of fixtures, page objects, helpers, and setup/teardown.
   - Browser/context/page lifecycle conventions.
   - Authentication/session handling if present.
   - Network mocking or test backend strategy if present.
   - Test isolation rules.
   - Retry and timeout guidelines.
   - Screenshot, trace, and video usage guidelines.
   - How to run, debug, and validate E2E tests locally.
   - How to use the Playwright MCP in Cursor if available in the environment.

8. **Position Interface E2E Guidance**
   - Identify the relevant files, routes, components, services, and tests related to the `position` interface.
   - Define the expected E2E test scope for this interface.
   - Recommend critical user flows to cover.
   - Recommend edge cases to cover.
   - Define what should not be tested at the E2E level because it belongs to unit or integration tests.
   - Define expected test documentation and reporting expectations.

9. **Quality Gates**
   - Required commands to run before considering the work complete.
   - Lint/typecheck/test/build commands inferred from the project.
   - E2E validation command.
   - Coverage expectations if present.
   - CodeRabbit or automated review expectations if present.

10. **Agent Execution Rules**
    - Agents must inspect existing patterns before modifying code.
    - Agents must avoid introducing new architecture unless justified.
    - Agents must keep changes focused on the requested scope.
    - Agents must document generated code and tests according to this rule.
    - Agents must update related documentation when standards or behavior change.
    - Agents must preserve existing public APIs unless explicitly asked to change them.

# Options

Follow these decision rules:

- If the project already has a standard, document and follow it.
- If the project has conflicting standards, document the most recent and most consistently used pattern, then add a short note explaining the chosen convention.
- If a standard is missing, propose a conservative default aligned with the existing stack.
- If the project does not currently use Playwright but E2E testing is required, define a minimal Playwright standard without over-engineering.
- If the `position` interface is not clearly identifiable, search for related terms such as `position`, `positions`, `Position`, `PositionPage`, route names, labels, API endpoints, schemas, and tests.
- If required scripts are missing from `package.json`, document the missing gap instead of inventing commands.
- If the repository contains existing Cursor rules, this file must align with them and must not contradict them.
- If CodeRabbit requirements are present, include them as quality expectations.
- If unsure about a convention, mark it as `Project-specific assumption` and explain the evidence from the repository.

# Output Style

Generate only the content needed for the file:

```txt
.cursor/rules/20-project-standards.mdc
```

The output must be written in clear, professional English.

Use this format:

```mdc
---
description: Frontend project standards for architecture, documentation, and testing
globs:
  - "frontend/**/*"
  - "tests/**/*"
alwaysApply: false
---

# Frontend Project Standards

...
```

The file must be concise but complete.

Use Markdown headings, short paragraphs, and actionable bullet points.

Avoid generic advice that is not grounded in the repository.

Use mandatory language where appropriate:

- `MUST` for required standards.
- `SHOULD` for recommended standards.
- `MAY` for optional practices.
- `MUST NOT` for prohibited practices.

Do not modify application code.

Do not implement the E2E tests yet.

Do not create additional files unless the repository explicitly requires them.

At the end of the file, include a section named:

```md
## Validation Checklist
```

The checklist must help future agents verify that generated E2E tests for the `position` interface comply with the project standards.

---
## Prompt - 2026-05-17T17:31:56Z
### Agent: agent
#### Model: Claude 4.7 Opus

# Persona

You are a **Senior Frontend QA Automation Architect** with deep expertise in:

- Cursor agents and reusable skills.
- Frontend E2E testing with Playwright.
- Behavior-Driven Development using Gherkin.
- React application testing.
- Drag-and-drop UI validation.
- Network request assertions.
- QA reporting and defect lifecycle management.
- CodeRabbit-friendly documentation standards.
- Secure test automation practices.

Your job is to create the Cursor agents and skills required to specify, implement, validate, report, fix, and revalidate E2E tests for the `position` interface.


You MUST inspect the repository before creating or updating any agent or skill.

# Context

The project already has frontend standards, testing expectations, documentation rules, and security requirements defined in:

```txt
.cursor/rules/20-project-standards.mdc
```

The `position` interface is the main target for the E2E workflow. According to the project standards, this interface is related to:

- `/positions`
- `/positions/:id`
- `frontend/src/App.js`
- `frontend/src/components/Positions.tsx`
- `frontend/src/components/PositionDetails.js`
- `frontend/src/components/StageColumn.js`
- `frontend/src/components/CandidateCard.js`
- Playwright tests under `frontend/tests/e2e/`

The project standards also mention that the actual backend update endpoint may be:

```txt
PUT /candidates/:id
```

while the requested scenario states:

```txt
PUT /candidate/:id
```

The agents MUST verify the real endpoint in the frontend and backend code before implementing network assertions. If the project uses `PUT /candidates/:id`, the agents MUST follow the actual project contract, document the discrepancy, and avoid relying on outdated or incorrect prose.

The workflow must support these phases:

1. Specify the E2E scenarios using BDD/Gherkin.
2. Implement the tests with Playwright.
3. Execute tests and collect evidence.
4. Register defects in `docs/bugs/`.
5. Fix defects from `docs/bugs/`.
6. Re-run tests to validate fixes.
7. Generate reports in `docs/reports/`.
8. Run quality gateways for coverage, reproducibility, documentation, and security.
9. Coordinate the workflow using an orchestrator agent.
10. Run independent work in parallel only when safe.

# Desired Outcome

Create or update the Cursor agents and skills needed to run a complete E2E workflow for the `position` interface.

The final repository changes for this task MUST be limited to Cursor agent and skill definitions.

Do NOT implement E2E tests in this task.

Do NOT create BDD scenario specifications in this task.

Do NOT modify application code in this task.

Do NOT modify unrelated rules, agents, or skills unless strictly required to avoid contradiction with existing project standards.

## Required Agent Files

Create or update:

```txt
.cursor/agents/e2e-spec-writer.md
.cursor/agents/e2e-test-developer.md
.cursor/agents/e2e-quality-gateway.md
.cursor/agents/e2e-bug-fixer.md
.cursor/agents/e2e-orchestrator.md
```

## Required Skill Files

Create or update:

```txt
.cursor/skills/project-standards-review/SKILL.md
.cursor/skills/prompt-tracking-compliance/SKILL.md
.cursor/skills/position-interface-analysis/SKILL.md
.cursor/skills/e2e-bdd-specification/SKILL.md
.cursor/skills/playwright-e2e-implementation/SKILL.md
.cursor/skills/playwright-mcp-debugging/SKILL.md
.cursor/skills/test-data-fixtures/SKILL.md
.cursor/skills/defect-reporting/SKILL.md
.cursor/skills/bug-fix-validation/SKILL.md
.cursor/skills/test-reporting/SKILL.md
.cursor/skills/e2e-coverage-gateway/SKILL.md
.cursor/skills/e2e-reproducibility-gateway/SKILL.md
.cursor/skills/security-config-review/SKILL.md
.cursor/skills/e2e-workflow-orchestration/SKILL.md
```

# E2E Scenarios the Workflow Must Support

The agents and skills must be able to support the following scenarios.

## Scenario 1: Position Page Load

Create a test that validates that the `position` screen loads correctly.

The test must verify:

1. The position title is displayed correctly.
2. The columns corresponding to each hiring process phase are displayed.
3. Candidate cards are displayed in the correct column according to their current phase.

Possible phases may include:

- Applied
- Interview
- Technical Test
- Offer
- Hired
- Rejected

The exact phases MUST match the phases implemented in the interface.

## Scenario 2: Candidate Phase Change

Create a test that simulates moving a candidate from one phase to another.

The test must verify:

1. A candidate card can be dragged from one column to another.
2. The candidate card is visually displayed in the new column.
3. The candidate phase is correctly updated in the backend through the real project endpoint.

The requested endpoint is:

```txt
PUT /candidate/:id
```

However, the project standards indicate that the actual endpoint may be:

```txt
PUT /candidates/:id
```

The agent MUST inspect the actual frontend request and backend route before implementing the assertion.

The test must validate that when the candidate is moved:

- A PUT request is triggered.
- The candidate ID matches the moved candidate.
- The request body contains the new phase according to the real project contract.
- The backend response is successful.

# Required Workflow

The generated agents and skills MUST support the following workflow.

## 1. Specify

The specification workflow MUST:

- Inspect the project standards in `.cursor/rules/20-project-standards.mdc`.
- Identify the actual `position` interface files, routes, components, data models, and API contracts.
- Identify required test data and expected hiring phases.
- Define success criteria for each scenario.
- Write BDD specifications using Gherkin.
- Store each specification in:

```txt
docs/specs/e2e/<scenario-id>.md
```

The Gherkin specification MUST support:

- `Feature`
- `Background`
- `Scenario`
- `Scenario Outline`
- `Examples`
- `Given`
- `When`
- `Then`
- `And`
- `But`

The specification MUST avoid:

- Imperative scenarios.
  - Avoid: `When I click the submit button`
  - Prefer: `When the candidate is moved to another hiring phase`
- References to DOM IDs, JSON payloads, or database column names.
- Multiple `When`/`Then` pairs in one scenario.
- Missing `Examples` when `Scenario Outline` is appropriate.
- Overspecified data that should be parameterized.
- Inconsistent language across features.
- Phantom scenarios that cannot be mapped to a real interface, route, component, API, or user flow.
- Loss of ubiquitous domain language.
  - Avoid: `user`, `item`, `element`
  - Prefer: `candidate`, `position`, `hiring phase`, `vacancy`, or the exact project domain term.

## 2. Implement and Execute

The implementation workflow MUST:

- Read the approved files in `docs/specs/e2e/`.
- Implement Playwright tests under the project E2E location, expected by the current standard as:

```txt
frontend/tests/e2e/
```

- Use accessible selectors before fragile CSS selectors.
- Use existing `data-testid` conventions if present.
- Prefer `getByRole`, accessible names, labels, and stable visible text.
- Avoid brittle selectors based on generated Bootstrap classes.
- Use realistic and deterministic data through existing fixtures, factories, seed data, or `@faker-js/faker` when appropriate.
- Keep tests independent and reproducible.
- Use traces and screenshots on failures according to the Playwright config.
- Use the Playwright MCP available in Cursor when useful to inspect UI, selectors, drag-and-drop, and network traffic.
- Document generated test code and helper code so CodeRabbit docstring checks pass.
- Ask for clarification when the specification, UI behavior, or backend contract is ambiguous.
- MUST NOT silently assume missing behavior before executing a developed test.

The implementation workflow MUST support these commands:

```bash
npx playwright test --ui
```

or:

```bash
npx playwright test
```

and:

```bash
npx playwright show-report
```

The report summary MUST be stored in:

```txt
docs/reports/<report-id>.md
```

## 3. Register Defects

When a test fails because of a product defect, testability issue, route mismatch, endpoint mismatch, selector instability, or behavior mismatch, the agent MUST create a bug report in:

```txt
docs/bugs/<defect-id>.md
```

Each bug report MUST include:

- Defect ID.
- Title.
- Related scenario ID.
- Related specification file.
- Related test file.
- Environment.
- Preconditions.
- Steps to reproduce.
- Expected result.
- Actual result.
- Evidence.
- Suspected area.
- Severity.
- Status.
- Retest notes.
- Fix validation result.

## 4. Fix Bugs and Revalidate

The bug-fixing workflow MUST:

- Read each bug file under `docs/bugs/`.
- Identify open bugs that are relevant to the `position` E2E workflow.
- Reproduce the bug when possible.
- Correct the bug using the smallest safe change.
- Avoid unrelated refactors.
- Document any generated or modified code.
- Run the relevant Playwright tests again.
- Update the bug status in `docs/bugs/<defect-id>.md`.
- Add retest evidence and fix validation result.
- Update the corresponding report in `docs/reports/<report-id>.md`.

The agent MUST NOT mark a bug as fixed unless the relevant test has been re-run and evidence has been recorded.

## 5. Validate Through Quality Gateways

The validation workflow MUST verify:

- Every approved BDD scenario has automated Playwright coverage.
- Each acceptance criterion has a matching assertion.
- Tests are independent.
- Tests are reproducible.
- Required Playwright commands were executed.
- `npx playwright show-report` was executed.
- The result is summarized in `docs/reports/`.
- Defects are documented in `docs/bugs/`.
- Corrected defects are revalidated.
- No secrets, tokens, credentials, private URLs, or sensitive configuration are exposed.
- No hardcoded environment-specific URLs are newly introduced unless already required by project standards and explicitly documented.
- Existing project gaps are documented instead of hidden.
- CodeRabbit documentation/docstring expectations are respected.

# Required Agents

## 1. `.cursor/agents/e2e-spec-writer.md`

The agent file MUST use this structure:

```md
# e2e-spec-writer

## Role

## Goal

## Responsibilities

## Required Inputs

## Required Skills

## Workflow

## Quality Gates

## Documentation Requirements

## Security Requirements

## When to Ask for Clarification

## Expected Outputs

## Prohibited Actions
```

The `e2e-spec-writer` agent MUST:

- Act as a BDD E2E specification specialist.
- Read `.cursor/rules/20-project-standards.mdc`.
- Use `project-standards-review`.
- Use `prompt-tracking-compliance`.
- Use `position-interface-analysis`.
- Use `e2e-bdd-specification`.
- Inspect the real `position` interface before writing specs.
- Identify routes, components, candidate model, hiring phase model, and API behavior.
- Identify whether the real endpoint is `PUT /candidate/:id` or `PUT /candidates/:id`.
- Produce specs in `docs/specs/e2e/<scenario-id>.md`.
- Include interface mapping, test data needs, success criteria, risks, assumptions, and open questions.
- Ask questions only when ambiguity blocks safe specification.
- MUST NOT create implementation-specific Gherkin.

## 2. `.cursor/agents/e2e-test-developer.md`

The agent file MUST use this structure:

```md
# e2e-test-developer

## Role

## Goal

## Responsibilities

## Required Inputs

## Required Skills

## Workflow

## Quality Gates

## Documentation Requirements

## Security Requirements

## When to Ask for Clarification

## Expected Outputs

## Prohibited Actions
```

The `e2e-test-developer` agent MUST:

- Act as a Playwright E2E implementation specialist.
- Read `.cursor/rules/20-project-standards.mdc`.
- Use `project-standards-review`.
- Use `playwright-e2e-implementation`.
- Use `playwright-mcp-debugging`.
- Use `test-data-fixtures`.
- Use `defect-reporting`.
- Use `test-reporting`.
- Implement tests from approved specs only.
- Use accessible selectors first.
- Use deterministic fixtures, factories, seed data, or `@faker-js/faker` where appropriate.
- Validate candidate drag-and-drop behavior.
- Validate candidate movement between hiring phase columns.
- Validate the actual PUT request used by the project.
- Validate candidate ID and new phase in the request.
- Validate successful backend response.
- Use Playwright MCP when helpful.
- Document test code and exported helpers.
- Register defects in `docs/bugs/`.
- Generate reports in `docs/reports/`.
- MUST NOT assume behavior when the spec or implementation is unclear.

## 3. `.cursor/agents/e2e-quality-gateway.md`

The agent file MUST use this structure:

```md
# e2e-quality-gateway

## Role

## Goal

## Responsibilities

## Required Inputs

## Required Skills

## Workflow

## Quality Gates

## Documentation Requirements

## Security Requirements

## When to Ask for Clarification

## Expected Outputs

## Prohibited Actions
```

The `e2e-quality-gateway` agent MUST:

- Act as the final validation gate.
- Read `.cursor/rules/20-project-standards.mdc`.
- Use `project-standards-review`.
- Use `e2e-coverage-gateway`.
- Use `e2e-reproducibility-gateway`.
- Use `security-config-review`.
- Use `test-reporting`.
- Compare `docs/specs/e2e/` with implemented Playwright tests.
- Verify that Scenario 1 and Scenario 2 are covered.
- Verify commands executed:
  - `npx playwright test --ui` or `npx playwright test`
  - `npx playwright show-report`
- Verify reports are stored in `docs/reports/`.
- Verify open bugs are documented.
- Verify fixed bugs are revalidated.
- Verify generated code is documented.
- Verify no sensitive information is exposed.
- Block completion if coverage, reproducibility, documentation, reporting, or security gates fail.

## 4. `.cursor/agents/e2e-bug-fixer.md`

The agent file MUST use this structure:

```md
# e2e-bug-fixer

## Role

## Goal

## Responsibilities

## Required Inputs

## Required Skills

## Workflow

## Quality Gates

## Documentation Requirements

## Security Requirements

## When to Ask for Clarification

## Expected Outputs

## Prohibited Actions
```

The `e2e-bug-fixer` agent MUST:

- Act as a defect resolution specialist for bugs reported by the E2E workflow.
- Read `.cursor/rules/20-project-standards.mdc`.
- Use `project-standards-review`.
- Use `defect-reporting`.
- Use `bug-fix-validation`.
- Use `playwright-e2e-implementation`.
- Use `test-reporting`.
- Use `security-config-review`.
- Inspect all relevant bug files in `docs/bugs/`.
- Prioritize open bugs related to the `position` E2E scenarios.
- Reproduce each bug when possible.
- Apply the smallest safe fix.
- Avoid unrelated refactors.
- Run the affected E2E tests.
- Update the bug file status and retest notes.
- Update the test report.
- MUST NOT mark a bug as fixed without rerun evidence.
- MUST NOT expose secrets, private URLs, credentials, or internal configuration in bug evidence.

## 5. `.cursor/agents/e2e-orchestrator.md`

The agent file MUST use this structure:

```md
# e2e-orchestrator

## Role

## Goal

## Responsibilities

## Required Inputs

## Required Skills

## Workflow

## Parallelization Strategy

## Quality Gates

## Documentation Requirements

## Security Requirements

## When to Ask for Clarification

## Expected Outputs

## Prohibited Actions
```

The `e2e-orchestrator` agent MUST:

- Act as the coordinator for the complete position E2E workflow.
- Read `.cursor/rules/20-project-standards.mdc`.
- Use `e2e-workflow-orchestration`.
- Use `project-standards-review`.
- Use `prompt-tracking-compliance`.
- Use `test-reporting`.
- Use `e2e-coverage-gateway`.
- Use `e2e-reproducibility-gateway`.
- Use `security-config-review`.
- Coordinate these agents:
  1. `e2e-spec-writer`
  2. `e2e-test-developer`
  3. `e2e-bug-fixer`
  4. `e2e-quality-gateway`

The orchestrator MUST follow this order:

1. Review project standards and prompt tracking requirements.
2. Analyze the `position` interface.
3. Generate BDD specs for Scenario 1 and Scenario 2.
4. Confirm there are no blocking ambiguities.
5. Implement Playwright tests from approved specs.
6. Execute the tests.
7. Create bug reports for failures.
8. Fix bugs from `docs/bugs/`.
9. Re-run tests to validate fixes.
10. Generate reports in `docs/reports/`.
11. Run final coverage, reproducibility, documentation, and security gateways.
12. Produce a final workflow summary.

## Parallelization Strategy

The orchestrator MUST run work in parallel only when safe.

Parallelizable tasks MAY include:

- Independent repository inspection tasks.
- Writing separate BDD specs for Scenario 1 and Scenario 2 after shared interface analysis is complete.
- Implementing independent test files only when they do not modify the same helper, fixture, or configuration file.
- Fixing multiple bugs only when they affect different files or isolated behavior.
- Running independent validation checks after tests are implemented.

Non-parallelizable tasks MUST remain sequential:

- Project standards review before any change.
- Interface analysis before BDD specification.
- BDD specification before test implementation.
- Test implementation before quality gateway.
- Bug reproduction before bug fix.
- Bug fix before retest.
- Final gateway after all test, report, and bug updates are complete.

# Required Skills

Each skill file MUST use this structure:

```md
# <skill-name>

## Purpose

## When to Use This Skill

## Required Inputs

## Procedure

## Quality Checklist

## Expected Outputs

## Failure Conditions
```

## `.cursor/skills/project-standards-review/SKILL.md`

This skill MUST instruct agents to:

- Read `.cursor/rules/20-project-standards.mdc`.
- Inspect existing rules, agents, skills, README files, package scripts, Playwright config, and test folders.
- Follow existing project conventions before proposing new ones.
- Treat the rule as the source of truth for:
  - E2E location.
  - Playwright commands.
  - documentation requirements.
  - CodeRabbit expectations.
  - security constraints.
- Document any project-specific assumptions in specs, bugs, or reports.

## `.cursor/skills/prompt-tracking-compliance/SKILL.md`

This skill MUST instruct agents to:

- Read the project prompt tracking rule if present.
- Follow `.cursor/rules/10-prompt-tracking.mdc` when it exists.
- Log user prompts in the expected prompt tracking file defined by the project.
- Avoid inventing a new prompt tracking location.
- Document any inability to update prompt tracking.

## `.cursor/skills/position-interface-analysis/SKILL.md`

This skill MUST instruct agents to inspect:

- `/positions`
- `/positions/:id`
- `frontend/src/App.js`
- `frontend/src/components/Positions.tsx`
- `frontend/src/components/PositionDetails.js`
- `frontend/src/components/StageColumn.js`
- `frontend/src/components/CandidateCard.js`
- `frontend/playwright.config.ts`
- Existing E2E tests under `frontend/tests/e2e/`
- Backend routes and OpenAPI docs related to positions and candidates.
- The real endpoint used to update a candidate phase.
- The real request payload used to update a candidate phase.
- The implemented hiring phase terminology.

The skill MUST require agents to document:

- Relevant files found.
- Route or navigation path.
- Candidate and hiring phase terminology.
- API behavior evidence.
- Endpoint discrepancy if present.
- Open questions.

## `.cursor/skills/e2e-bdd-specification/SKILL.md`

This skill MUST define:

- The required structure for `docs/specs/e2e/<scenario-id>.md`.
- How to write Gherkin using domain language.
- How to use `Feature`, `Background`, `Scenario`, `Scenario Outline`, and `Examples`.
- How to avoid imperative steps.
- How to avoid DOM IDs, JSON payloads, and database column names.
- How to avoid multiple `When`/`Then` pairs.
- How to avoid phantom scenarios.
- How to define success criteria.
- How to map scenarios to interface evidence.
- How to define out-of-scope checks.

## `.cursor/skills/playwright-e2e-implementation/SKILL.md`

This skill MUST define:

- How to map approved BDD specs to Playwright tests.
- How to place E2E tests according to project standards.
- How to use accessible selectors first.
- How to avoid fragile CSS selectors.
- How to validate position title rendering.
- How to validate hiring phase columns.
- How to validate candidate cards by phase.
- How to implement drag-and-drop tests.
- How to assert visual movement between columns.
- How to intercept and validate the actual PUT request.
- How to validate candidate ID and new phase in the request.
- How to validate successful backend response.
- How to isolate tests.
- How to document tests and helpers for CodeRabbit.
- How to avoid hardcoded secrets, private URLs, or environment-specific configuration.

## `.cursor/skills/playwright-mcp-debugging/SKILL.md`

This skill MUST define when to use Playwright MCP for:

- Inspecting rendered UI.
- Verifying accessible selectors.
- Testing drag-and-drop behavior.
- Observing network traffic.
- Capturing traces or screenshots.
- Debugging flaky tests.
- Comparing actual UI behavior with BDD specs.

The skill MUST state that MCP observations must be translated into committed tests, bug reports, or execution reports.

## `.cursor/skills/test-data-fixtures/SKILL.md`

This skill MUST define:

- When to use existing fixtures.
- When to create new fixtures.
- When to use factories.
- When to use `@faker-js/faker`.
- How to keep generated data deterministic when needed.
- How to avoid relying on production data.
- How to avoid test coupling.
- How to avoid exposing sensitive data in fixtures, reports, screenshots, or traces.

## `.cursor/skills/defect-reporting/SKILL.md`

This skill MUST define the required structure for:

```txt
docs/bugs/<defect-id>.md
```

Each bug report MUST include:

- Defect ID.
- Title.
- Related scenario ID.
- Related specification file.
- Related test file.
- Environment.
- Preconditions.
- Steps to reproduce.
- Expected result.
- Actual result.
- Evidence.
- Suspected area.
- Severity.
- Status.
- Retest notes.
- Fix validation result.

## `.cursor/skills/bug-fix-validation/SKILL.md`

This skill MUST define:

- How to read open bugs from `docs/bugs/`.
- How to reproduce a bug.
- How to identify the smallest safe fix.
- How to avoid unrelated refactors.
- How to document modified code.
- How to rerun affected Playwright tests.
- How to update the bug file status.
- How to add retest evidence.
- How to update related reports.
- How to decide whether a bug remains open, is blocked, or is fixed.

Failure conditions MUST include:

- Bug cannot be reproduced.
- Fix requires product decision.
- Fix requires changing public behavior not covered by the specification.
- Test cannot be rerun.
- Evidence cannot be recorded.

## `.cursor/skills/test-reporting/SKILL.md`

This skill MUST define the required structure for:

```txt
docs/reports/<report-id>.md
```

Each report MUST include:

- Report ID.
- Execution date.
- Scope.
- Scenario IDs.
- Specification files.
- Test files.
- Commands executed.
- Execution result.
- Passed tests.
- Failed tests.
- Skipped tests.
- Bugs created.
- Bugs revalidated.
- Playwright report location.
- Trace or screenshot evidence.
- Reproducibility notes.
- Security review notes.
- Final recommendation.

## `.cursor/skills/e2e-coverage-gateway/SKILL.md`

This skill MUST require agents to verify:

- Every approved BDD scenario has matching automated coverage.
- Every acceptance criterion has an assertion.
- Scenario 1 validates:
  - Position title.
  - Hiring phase columns.
  - Candidate card placement by phase.
- Scenario 2 validates:
  - Candidate drag-and-drop.
  - Candidate visual movement.
  - Actual PUT request.
  - Candidate ID.
  - New phase in request body.
  - Successful backend response.
- No unrelated E2E scope was introduced.

## `.cursor/skills/e2e-reproducibility-gateway/SKILL.md`

This skill MUST require agents to verify:

- Tests run locally using project commands.
- Tests do not depend on execution order.
- Tests do not depend on mutable external state.
- Tests use seed data, fixtures, factories, or isolated mocks where appropriate.
- Traces and screenshots are available on failures.
- Flaky selectors are avoided.
- `npx playwright test --ui` or `npx playwright test` was executed.
- `npx playwright show-report` was executed.
- Results are summarized in `docs/reports/`.

## `.cursor/skills/security-config-review/SKILL.md`

This skill MUST require agents to verify:

- No secrets are committed.
- No tokens are committed.
- No credentials are committed.
- No private URLs are committed.
- No environment-specific configuration is newly hardcoded.
- Test URLs and configuration use safe project configuration or environment variables where available.
- Reports and bug files do not expose secrets.
- Screenshots, traces, and logs do not expose sensitive information.
- API assertions avoid printing sensitive payloads.

## `.cursor/skills/e2e-workflow-orchestration/SKILL.md`

This skill MUST define the complete workflow:

1. Review project standards.
2. Apply prompt tracking if required.
3. Analyze the `position` interface.
4. Generate BDD specifications.
5. Confirm there are no blocking ambiguities.
6. Implement Playwright tests.
7. Execute tests.
8. Register defects.
9. Fix open bugs.
10. Re-run tests.
11. Update bug statuses.
12. Generate reports.
13. Run coverage gateway.
14. Run reproducibility gateway.
15. Run security gateway.
16. Produce final summary.

The skill MUST define safe parallelization rules and sequential dependencies.

# Options and Decision Rules

Use these decision rules:

- If the project already has a convention, follow it.
- If the project has conflicting conventions, follow the most recent and most consistently used convention, then document the decision.
- If the requested endpoint conflicts with the actual implementation, follow the implementation and document the discrepancy.
- If `PUT /candidate/:id` is not implemented but `PUT /candidates/:id` is implemented, tests MUST target `PUT /candidates/:id`.
- If the interface lacks accessible selectors, prefer role/name/text selectors first; propose minimal `data-testid` additions only when necessary.
- If a missing selector blocks stable testing, document the reason.
- If test data is missing, prefer existing seed data before creating factories.
- If seed data is unstable, use deterministic fixtures or factories.
- If the backend is required for the E2E flow, document service prerequisites.
- If Playwright MCP is available, use it for inspection and debugging, but do not leave MCP-only findings undocumented.
- If tests fail because of product behavior, create a bug report instead of hiding the failure.
- If bugs are independent and touch different files, the orchestrator MAY fix them in parallel.
- If bugs touch the same files or shared helpers, the orchestrator MUST process them sequentially.
- If security exposure is found, block completion until it is removed or explicitly documented as an existing project gap.
- If CodeRabbit documentation coverage is likely to fail, add documentation before completing the task.

# Output Style

Generate production-ready Cursor agent and skill files.

Use clear, professional English.

Use actionable instructions.

Use mandatory language consistently:

- `MUST` for required behavior.
- `SHOULD` for recommended behavior.
- `MAY` for optional behavior.
- `MUST NOT` for prohibited behavior.

Do not include generic QA theory unless it directly supports the `position` E2E workflow.

Do not produce a high-level summary instead of files.

Do not skip the validation checklist.

# Validation Checklist

Before completing this task, verify that:

- All required agent files were created or updated.
- All required skill files were created or updated.
- Every agent references `.cursor/rules/20-project-standards.mdc`.
- Every agent lists the skills it needs.
- Every skill has the required file structure.
- The orchestrator coordinates specification, implementation, validation, bug fixing, retesting, reporting, and final gateways.
- The orchestrator defines safe parallelization rules.
- The specification workflow stores files in `docs/specs/e2e/<scenario-id>.md`.
- The defect workflow stores files in `docs/bugs/<defect-id>.md`.
- The reporting workflow stores files in `docs/reports/<report-id>.md`.
- The bug-fixing workflow can read bugs from `docs/bugs/`, fix them, rerun tests, and update bug status.
- The Playwright workflow supports:
  - `npx playwright test --ui`
  - `npx playwright test`
  - `npx playwright show-report`
- The quality gateway validates BDD coverage, reproducibility, documentation, reporting, and security.
- The endpoint discrepancy between `PUT /candidate/:id` and `PUT /candidates/:id` is handled by repository inspection.
- The agents do not introduce new hardcoded secrets, private URLs, credentials, tokens, or environment-specific configuration.
- The agents are ready to support both required `position` E2E scenarios.

---
## Prompt - 2026-05-17T17:47:52Z
### Agent: agent
#### Model: Claude 4.7 Opus

Generate under @.cursor/ a README file to explain how to use the created agents and skills taking into account the given scenarios for e2e tests.

---
## Prompt - 2026-05-17T21:50:00Z
### Agent: e2e-orchestrator
#### Model: Composer 2

@.cursor/agents/e2e-orchestrator.md run the full position-interface E2E workflow for Scenario 1 (Position Page Load)
