# e2e-workflow-orchestration

## Purpose

Define the end-to-end sequence the `e2e-orchestrator` follows to deliver Scenario 1 and Scenario 2 of the `position` interface E2E workflow, including which steps run sequentially and which steps MAY run in parallel.

## When to Use This Skill

Use this skill at the start of every orchestrator run and again whenever a phase completes or fails, so the orchestrator can pick the next safe action.

## Required Inputs

- `.cursor/rules/20-project-standards.mdc`
- `.cursor/rules/10-prompt-tracking.mdc`
- Current state of `docs/specs/e2e/`, `docs/bugs/`, `docs/reports/`, `frontend/tests/e2e/`.
- Output of `position-interface-analysis` whenever interface state may have changed.

## Procedure

1. **Review project standards.** Apply `project-standards-review`.
2. **Apply prompt tracking.** Apply `prompt-tracking-compliance` to log the user prompt in `prompts/prompts-ICS.md`.
3. **Analyze the `position` interface.** Trigger `position-interface-analysis` (via `e2e-spec-writer`) to map routes, components, hiring phases, candidate model, and the real candidate update endpoint.
4. **Generate BDD specifications.** Trigger `e2e-spec-writer` (with `e2e-bdd-specification`) to draft:
   - `docs/specs/e2e/position-page-load.md`
   - `docs/specs/e2e/candidate-phase-change.md`
5. **Confirm there are no blocking ambiguities.** Review the Open Questions sections; pause the workflow and request clarification when needed.
6. **Implement Playwright tests.** Trigger `e2e-test-developer` (with `playwright-e2e-implementation`, `test-data-fixtures`, `playwright-mcp-debugging` when useful).
7. **Execute tests.** Trigger `e2e-test-developer` to run:
   - `cd frontend && npx playwright test` or `--ui`.
   - `cd frontend && npx playwright show-report`.
8. **Register defects.** Trigger `e2e-test-developer` (with `defect-reporting`) to create `docs/bugs/<defect-id>.md` for each defect.
9. **Fix open bugs.** Trigger `e2e-bug-fixer` (with `bug-fix-validation`, `playwright-e2e-implementation`, `security-config-review`) for each open defect.
10. **Re-run tests.** Trigger `e2e-test-developer` (or `e2e-bug-fixer`) to rerun affected tests after fixes.
11. **Update bug statuses.** Update `docs/bugs/<defect-id>.md` with retest notes and fix validation result.
12. **Generate reports.** Trigger `test-reporting` to write or update `docs/reports/<report-id>.md`.
13. **Run coverage gateway.** Trigger `e2e-quality-gateway` (with `e2e-coverage-gateway`).
14. **Run reproducibility gateway.** Trigger `e2e-quality-gateway` (with `e2e-reproducibility-gateway`).
15. **Run security gateway.** Trigger `e2e-quality-gateway` (with `security-config-review`).
16. **Produce final summary.** Aggregate spec, test, bug, and report references into a single summary, including the gateway verdict.

## Parallelization Rules

The orchestrator MAY run tasks in parallel when:

- Two repository inspection tasks read different files and write no output (for example, route inspection vs. backend route validation).
- Two specifications are drafted for independent scenarios after `position-interface-analysis` is complete and they live in different files.
- Two test files are implemented for independent scenarios that do not share helpers, fixtures, or configuration.
- Two bugs touch different files and isolated behavior.
- Two validation checks (coverage, reproducibility, security) operate on disjoint artifacts after tests are implemented.

The orchestrator MUST keep these steps sequential:

- Project standards review before any change.
- Interface analysis before BDD specification.
- BDD specification before test implementation.
- Test implementation before quality gateway.
- Bug reproduction before bug fix.
- Bug fix before retest.
- Final gateway after all test, report, and bug updates are complete.

## Quality Checklist

- [ ] Every phase emits the expected artifact (spec, test, report, bug, or gateway verdict).
- [ ] No two parallel agents modify the same file or shared helper.
- [ ] Sequential dependencies are honored.
- [ ] Prompt tracking is applied before the user-visible reply.
- [ ] Gateways were executed in order: coverage → reproducibility → security.
- [ ] Final summary cites every spec, test, bug, and report touched.

## Expected Outputs

- A workflow summary covering specs, tests, reports, bugs, and gateway verdict.
- A status table for every phase (`Pending`, `In Progress`, `Done`, `Blocked`).
- A list of escalations the user must address before the workflow can complete.

## Failure Conditions

- A required phase was skipped.
- Two parallel agents modified the same file.
- Sequential dependencies were violated (for example, tests implemented before specs were approved).
- The orchestrator marked the workflow complete without a `PASS` from `e2e-quality-gateway`.
- The summary fails to cite required artifacts.
