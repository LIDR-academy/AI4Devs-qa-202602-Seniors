# project-standards-review

## Purpose

Force every agent to load and respect the existing engineering, testing, documentation, and security conventions of this repository before producing or modifying any artifact related to the `position` E2E workflow. Treat `.cursor/rules/20-project-standards.mdc` as the source of truth.

## When to Use This Skill

Use this skill at the start of every run, before:

- Drafting a BDD specification.
- Implementing or modifying a Playwright test.
- Reporting a defect.
- Fixing a defect.
- Producing a report.
- Running a quality gate.
- Orchestrating downstream agents.

Use again whenever the repository state changes (new rules, new agents, new package scripts, new Playwright config).

## Required Inputs

- `.cursor/rules/20-project-standards.mdc`
- `.cursor/rules/10-prompt-tracking.mdc` (cross-reference)
- `frontend/package.json`
- `frontend/playwright.config.ts`
- `frontend/tests/e2e/` (existing layout)
- `backend/api-spec.yaml`, `backend/src/routes/`, `backend/src/index.ts`
- Repository `README.md` and `docs/QA-Report.md` (if present)

## Procedure

1. Read `.cursor/rules/20-project-standards.mdc` end to end.
2. Confirm the canonical E2E test location: `frontend/tests/e2e/` matches `playwright.config.ts` `testDir`.
3. Confirm the canonical Playwright commands required by the project:
   - `cd frontend && npm install`
   - `cd frontend && npx playwright install`
   - `cd frontend && npx playwright test`
   - `cd frontend && npx playwright test --ui`
   - `cd frontend && npx playwright show-report`
4. Confirm the canonical frontend URL (`http://localhost:3000`) and backend URL (`http://localhost:3010`).
5. Confirm the real candidate update endpoint by inspecting `backend/src/index.ts` (mount path) and `backend/src/routes/candidateRoutes.ts` (route definition). The real path is `PUT /candidates/:id` with body `{ applicationId, currentInterviewStep }`.
6. Identify CodeRabbit Docstring Coverage expectations for generated test, helper, fixture, and page-object code.
7. Identify security constraints (no committed secrets, no hardcoded environment-specific values beyond the project defaults).
8. Identify the prompt tracking obligation in `.cursor/rules/10-prompt-tracking.mdc` and confirm `prompts/prompts-ICS.md` is the canonical log.
9. Record any project gap (for example, missing `frontend/jest.config.js`) in the consuming artifact (spec, report, bug, or summary).

## Quality Checklist

- [ ] `.cursor/rules/20-project-standards.mdc` was read in the current run.
- [ ] E2E test location matches the project standards.
- [ ] Playwright commands match the project standards.
- [ ] Frontend and backend URLs match the project standards.
- [ ] Real candidate update endpoint was verified in the backend source.
- [ ] Endpoint discrepancy with prose `PUT /candidate/:id` was documented if relevant.
- [ ] CodeRabbit Docstring Coverage requirements were identified.
- [ ] Security constraints were identified.
- [ ] Prompt tracking obligation was identified.
- [ ] Project gaps were recorded in the consuming artifact.

## Expected Outputs

- A short summary of the conventions and constraints loaded, referenced by the consuming artifact (spec, test, report, bug, or workflow summary).
- A list of any project gaps surfaced during the review.

## Failure Conditions

- `.cursor/rules/20-project-standards.mdc` cannot be read.
- The real candidate update endpoint cannot be inspected.
- The Playwright config does not match the project standards and no documented decision authorizes the discrepancy.
- The agent attempts to proceed without recording project gaps that affect the workflow.
