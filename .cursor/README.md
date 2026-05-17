# Cursor Agents and Skills — `position` Interface E2E Workflow

This folder contains the Cursor agents, skills, and rules that drive the End-to-End (E2E) testing workflow for the LTI Talent Tracking `position` interface. It is the single entry point for anyone who needs to specify, implement, validate, report, fix, and revalidate E2E tests for **Scenario 1 — Position Page Load** and **Scenario 2 — Candidate Phase Change**.

The workflow follows the engineering, testing, documentation, and security conventions defined in `.cursor/rules/20-project-standards.mdc` and respects the prompt logging policy in `.cursor/rules/10-prompt-tracking.mdc`.

## 1. Layout

```txt
.cursor/
├── README.md                         # This file
├── rules/
│   ├── 10-prompt-tracking.mdc        # Prompt logging policy (prompts/prompts-ICS.md)
│   └── 20-project-standards.mdc      # Frontend project standards (source of truth)
├── agents/
│   ├── e2e-orchestrator.md           # Coordinates the full workflow
│   ├── e2e-spec-writer.md            # Drafts BDD specs in docs/specs/e2e/
│   ├── e2e-test-developer.md         # Implements Playwright tests in frontend/tests/e2e/
│   ├── e2e-bug-fixer.md              # Fixes bugs in docs/bugs/ and revalidates
│   └── e2e-quality-gateway.md        # Final coverage/reproducibility/security gateway
└── skills/
    ├── project-standards-review/SKILL.md
    ├── prompt-tracking-compliance/SKILL.md
    ├── position-interface-analysis/SKILL.md
    ├── e2e-bdd-specification/SKILL.md
    ├── playwright-e2e-implementation/SKILL.md
    ├── playwright-mcp-debugging/SKILL.md
    ├── test-data-fixtures/SKILL.md
    ├── defect-reporting/SKILL.md
    ├── bug-fix-validation/SKILL.md
    ├── test-reporting/SKILL.md
    ├── e2e-coverage-gateway/SKILL.md
    ├── e2e-reproducibility-gateway/SKILL.md
    ├── security-config-review/SKILL.md
    └── e2e-workflow-orchestration/SKILL.md
```

Workflow outputs (created by the agents, not by this folder):

```txt
docs/
├── specs/e2e/<scenario-id>.md        # BDD specifications
├── bugs/<defect-id>.md               # Defect reports
└── reports/<report-id>.md            # Execution reports + gateway verdicts

frontend/tests/e2e/<scenario>.spec.ts # Playwright tests
prompts/prompts-ICS.md                # Append-only prompt log
```

**Execution report IDs** (`docs/reports/<report-id>.md`): use `test-reporting`’s canonical pattern **`RPT-<YYYYMMDD>-<short-context>-<HHMMSS>`** with `<YYYYMMDD>` and `<HHMMSS>` in **UTC** (24-hour clock on the suffix, six digits—no colons—so filenames sort by date then time within a day). Each **new** run gets its own `-<HHMMSS>` to avoid collisions; **updates** to the same run keep the existing filename.

## 2. Agents at a Glance

| Agent | Purpose | Primary Outputs |
|---|---|---|
| `e2e-orchestrator` | Sequences the full workflow and decides what runs in parallel | Workflow summary + per-phase status |
| `e2e-spec-writer` | Inspects the `position` interface and writes BDD specs | `docs/specs/e2e/<scenario-id>.md` |
| `e2e-test-developer` | Implements Playwright tests, executes them, and registers defects | `frontend/tests/e2e/*.spec.ts`, `docs/reports/<report-id>.md`, `docs/bugs/<defect-id>.md` |
| `e2e-bug-fixer` | Reproduces, fixes, and revalidates open defects | Updated `docs/bugs/<defect-id>.md`, updated `docs/reports/<report-id>.md`, minimal code changes |
| `e2e-quality-gateway` | Final coverage, reproducibility, documentation, and security gate | `PASS` / `BLOCKED` verdict appended to `docs/reports/<report-id>.md` |

## 3. Skills at a Glance

| Skill | Used By | Primary Outcome |
|---|---|---|
| `project-standards-review` | All agents | Constraints loaded from `.cursor/rules/20-project-standards.mdc` |
| `prompt-tracking-compliance` | Orchestrator, spec writer | Prompt appended to `prompts/prompts-ICS.md` per `.cursor/rules/10-prompt-tracking.mdc` |
| `position-interface-analysis` | Spec writer, test developer | Routes, components, hiring phases, candidate model, real endpoint, discrepancy notes |
| `e2e-bdd-specification` | Spec writer | Domain-driven Gherkin spec with success criteria, risks, assumptions, open questions |
| `playwright-e2e-implementation` | Test developer, bug fixer | Playwright tests in `frontend/tests/e2e/` with accessible selectors and real network assertions |
| `playwright-mcp-debugging` | Test developer | Inspected DOM, drag-and-drop, and network traffic translated into committed artifacts |
| `test-data-fixtures` | Test developer | Deterministic, isolated, secret-free fixtures and factories |
| `defect-reporting` | Test developer, bug fixer | Structured `docs/bugs/<defect-id>.md` with reproducibility evidence |
| `bug-fix-validation` | Bug fixer | Smallest safe fix + rerun evidence + updated bug status |
| `test-reporting` | Test developer, bug fixer, quality gateway | Structured `docs/reports/<report-id>.md` |
| `e2e-coverage-gateway` | Quality gateway | Coverage verdict for Scenario 1 and Scenario 2 |
| `e2e-reproducibility-gateway` | Quality gateway | Reproducibility verdict (commands run, isolation, evidence) |
| `security-config-review` | Test developer, bug fixer, quality gateway | Security verdict (no secrets, no private URLs, scrubbed evidence) |
| `e2e-workflow-orchestration` | Orchestrator | End-to-end workflow plan with safe parallelization rules |

## 4. Target Scenarios

Both scenarios live on the `/positions/:id` Kanban board rendered by `frontend/src/components/PositionDetails.js`.

### Scenario 1 — Position Page Load

- **Spec ID:** `position-page-load`
- **Spec file:** `docs/specs/e2e/position-page-load.md`
- **Test file:** `frontend/tests/e2e/position-page-load.spec.ts`
- **Validates:**
  - The position title is displayed correctly.
  - The hiring phase columns are displayed (derived from the backend, e.g., `Initial Screening`, `Technical Interview`, `Manager Interview`, `Offer`).
  - Candidate cards are displayed in the column matching their `currentInterviewStep`.

### Scenario 2 — Candidate Phase Change

- **Spec ID:** `candidate-phase-change`
- **Spec file:** `docs/specs/e2e/candidate-phase-change.md`
- **Test file:** `frontend/tests/e2e/candidate-phase-change.spec.ts`
- **Validates:**
  - A candidate card is moved from one hiring phase column to another via drag-and-drop.
  - The card is visually rendered in the destination column.
  - A `PUT` request is observed to the real candidate update endpoint with the moved candidate's ID and the new phase in the body.
  - The backend response is successful.

### Endpoint truth (read before testing)

The user-facing prompt mentions `PUT /candidate/:id`, but the **real** implementation in the repository is:

```txt
PUT http://localhost:3010/candidates/:id
body: { applicationId: number, currentInterviewStep: number }
```

This is confirmed by:

- `frontend/src/components/PositionDetails.js` — `updateCandidateStep` uses `fetch('http://localhost:3010/candidates/${candidateId}', { method: 'PUT', ... })`.
- `backend/src/index.ts` — `app.use('/candidates', candidateRoutes)`.
- `backend/src/routes/candidateRoutes.ts` — `router.put('/:id', updateCandidateStageController)`.

Every agent and skill instructs downstream work to follow this real contract and document the discrepancy. Tests **MUST NOT** assert against `PUT /candidate/:id`.

## 5. Prerequisites

Before invoking the agents, make sure the following are in place:

1. **Backend running on `http://localhost:3010`** (per `.cursor/rules/20-project-standards.mdc`):

   ```bash
   cd backend
   npm install
   npx prisma migrate dev        # if not already migrated
   npx prisma db seed            # for deterministic position/candidate IDs
   npm run dev
   ```

2. **Frontend running on `http://localhost:3000`**:

   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Playwright browsers installed**:

   ```bash
   cd frontend
   npx playwright install
   ```

4. **Cursor MCP** with the `user-playwright` server enabled (optional but recommended for selector inspection and drag-and-drop debugging — used by `playwright-mcp-debugging`).

5. **Prompt logging** active: `prompts/prompts-ICS.md` is the canonical log; the agents append entries automatically through `prompt-tracking-compliance`.

If any prerequisite is missing, the agents will document it and surface the gap rather than guess behavior.

## 6. How to Run the Workflow

The recommended entry point is the orchestrator. From a Cursor chat in this repository:

```txt
@.cursor/agents/e2e-orchestrator.md
Run the full position-interface E2E workflow for Scenario 1 (Position Page Load)
and Scenario 2 (Candidate Phase Change). Follow .cursor/rules/20-project-standards.mdc.
```

The orchestrator will then:

1. Apply `project-standards-review` and `prompt-tracking-compliance`.
2. Trigger `e2e-spec-writer` (with `position-interface-analysis` and `e2e-bdd-specification`) to draft:
   - `docs/specs/e2e/position-page-load.md`
   - `docs/specs/e2e/candidate-phase-change.md`
3. Stop and ask for clarification if any Open Question in those specs blocks safe implementation.
4. Trigger `e2e-test-developer` (with `playwright-e2e-implementation`, `test-data-fixtures`, and optionally `playwright-mcp-debugging`) to implement the Playwright tests.
5. Execute the suite and capture the HTML report:

   ```bash
   cd frontend
   npx playwright test                # or: npx playwright test --ui
   npx playwright show-report
   ```

6. Trigger `defect-reporting` for failed tests and create `docs/bugs/<defect-id>.md` entries.
7. Trigger `e2e-bug-fixer` (with `bug-fix-validation` and `security-config-review`) to reproduce, fix, and revalidate open bugs.
8. Trigger `test-reporting` to write or update `docs/reports/<report-id>.md`.
9. Trigger `e2e-quality-gateway` with `e2e-coverage-gateway`, `e2e-reproducibility-gateway`, and `security-config-review`.
10. Emit a final workflow summary that links every spec, test, bug, and report touched.

## 7. How to Run Individual Agents

You can invoke a single agent when you only need part of the workflow.

### Specifications only

```txt
@.cursor/agents/e2e-spec-writer.md
Draft BDD specs for Scenario 1 (Position Page Load) and Scenario 2 (Candidate Phase Change)
in docs/specs/e2e/. Inspect the position interface before writing.
```

### Implementation + execution only

```txt
@.cursor/agents/e2e-test-developer.md
Implement Playwright tests for the approved specs in docs/specs/e2e/.
Run `npx playwright test` and `npx playwright show-report`. Record results in docs/reports/.
```

### Bug fixing only

```txt
@.cursor/agents/e2e-bug-fixer.md
Read open bugs in docs/bugs/, reproduce them, apply minimal safe fixes,
rerun the affected Playwright tests, and update bug status and reports.
```

### Final validation only

```txt
@.cursor/agents/e2e-quality-gateway.md
Validate coverage, reproducibility, documentation, and security against
docs/specs/e2e/, frontend/tests/e2e/, docs/reports/, and docs/bugs/.
Append PASS or BLOCKED verdict to docs/reports/<report-id>.md.
```

## 8. How Skills Are Loaded

Skills are not invoked by name in chat. They are activated by the agents listed above through their `Required Skills` section. Each agent reads the corresponding `.cursor/skills/<skill-name>/SKILL.md` file before applying it.

If you want to follow a skill manually, read the file directly. Each skill follows the same structure:

- `## Purpose`
- `## When to Use This Skill`
- `## Required Inputs`
- `## Procedure`
- `## Quality Checklist`
- `## Expected Outputs`
- `## Failure Conditions`

## 9. Required Playwright Commands

The project standards (`.cursor/rules/20-project-standards.mdc`, section 7) require the following commands and the agents enforce them:

```bash
cd frontend
npm install
npx playwright install
npx playwright test              # full suite
npx playwright test --ui         # interactive debugging
npx playwright show-report       # HTML report
```

If `cd frontend && npm test` is mentioned anywhere, treat it as a known project gap — `frontend/jest.config.js` is missing. Agents will document the gap rather than invent a passing command.

## 10. Parallelization Rules (Orchestrator)

The orchestrator runs work in parallel **only when safe**.

**Safe in parallel:**

- Independent repository inspection tasks (different files, no shared output).
- Drafting `position-page-load.md` and `candidate-phase-change.md` after `position-interface-analysis` is complete.
- Implementing independent spec files when no helper, fixture, or configuration file is shared.
- Fixing bugs that touch different files and isolated behavior.
- Running coverage, reproducibility, and security gateways once tests are implemented.

**Must remain sequential:**

- Project standards review before any change.
- Interface analysis before BDD specification.
- BDD specification before test implementation.
- Test implementation before quality gateway.
- Bug reproduction before bug fix.
- Bug fix before retest.
- Final gateway after all test, report, and bug updates are complete.

## 11. Quality Gates Enforced

A workflow run is only complete when `e2e-quality-gateway` returns `PASS`. The gateway verifies:

- Every approved BDD scenario has at least one Playwright test.
- Every acceptance criterion has at least one observable assertion.
- Scenario 1 covers: position title, hiring phase columns, candidate card placement.
- Scenario 2 covers: drag-and-drop, visual movement, real `PUT /candidates/:id`, candidate ID, new phase in body, successful response.
- Tests are independent and reproducible (`npx playwright test` + `npx playwright show-report` executed and referenced).
- Generated code is documented for CodeRabbit Docstring Coverage.
- No secrets, tokens, credentials, private URLs, or sensitive payloads are exposed.
- Defects are documented in `docs/bugs/` and revalidated when fixed.

## 12. Security Notes

- Tests **MUST** use `http://localhost:3000` (frontend) and `http://localhost:3010` (backend) only; any other URL must be justified and documented.
- Fixtures, screenshots, traces, and reports **MUST** be scrubbed of tokens, credentials, OAuth headers, session cookies, and PII beyond seed values.
- Pre-existing security exposure detected during the workflow **MUST** be filed as a separate defect under `docs/bugs/`, not silently patched.

## 13. Prompt Logging

Every user prompt that triggers an agent **MUST** be appended to `prompts/prompts-ICS.md` by `prompt-tracking-compliance`, following `.cursor/rules/10-prompt-tracking.mdc`:

- One entry per user message.
- Append-only with a strictly monotonic UTC timestamp.
- `### Agent:` reflects the explicit agent or skill invoked (for example, `e2e-orchestrator`, `e2e-spec-writer`, `skill:e2e-bdd-specification`).
- `#### Model:` matches the model derivation table in the rule.
- Sensitive content **MUST** be redacted as `[REDACTED]` or `[REDACTED: <type>]` before writing.

## 14. Troubleshooting

| Symptom | Likely Cause | Recommended Action |
|---|---|---|
| Drag-and-drop does not trigger in Playwright | `react-beautiful-dnd` requires real pointer events | Use explicit `page.mouse.down/move/up` sequences; verify with `playwright-mcp-debugging` |
| `PUT /candidates/:id` not observed | Drag did not drop on a different column, or test asserts the wrong path | Re-inspect with MCP; ensure the spec follows the real endpoint, not `PUT /candidate/:id` |
| Test passes locally but fails in CI | Order dependency or mutable seed data | Apply `e2e-reproducibility-gateway`; isolate test data per `test-data-fixtures` |
| HTML report missing | `npx playwright show-report` not executed | Run it after the test command and reference its location in `docs/reports/<report-id>.md` |
| Bug marked `Fixed` without evidence | `bug-fix-validation` was skipped | Reopen the bug; require rerun evidence before re-closing |
| Prompt log not updated | `prompt-tracking-compliance` not applied | Re-run the orchestrator; ensure `prompts/prompts-ICS.md` is writable |
| `cd frontend && npm test` fails | Missing `frontend/jest.config.js` (known gap) | Document the gap; do not invent a passing command |

## 15. References

- `.cursor/rules/20-project-standards.mdc` — frontend project standards (source of truth).
- `.cursor/rules/10-prompt-tracking.mdc` — prompt logging policy.
- `frontend/playwright.config.ts` — Playwright configuration (`testDir: ./tests/e2e/`).
- `frontend/src/components/PositionDetails.js` — real candidate update endpoint and drag-and-drop behavior.
- `backend/src/routes/candidateRoutes.ts` and `backend/src/index.ts` — backend route definition.
- `backend/api-spec.yaml` and `backend/ModeloDatos.md` — API and data model documentation.
