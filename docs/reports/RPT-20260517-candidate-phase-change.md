# RPT-20260517-candidate-phase-change — Candidate Phase Change E2E (Scenario 2)

## Report ID

RPT-20260517-candidate-phase-change

## Execution Date

2026-05-17T18:55:00Z

## Scope

End-to-end validation for **Scenario 2 — Candidate Phase Change** (`candidate-phase-change`): drag a candidate between hiring phase columns, assert `PUT /candidates/:id` payload and successful response, assert UI updates, then restore the candidate to the original phase for repeatable runs.

## Scenario IDs

- candidate-phase-change

## Specification Files

- docs/specs/e2e/candidate-phase-change.md

## Test Files

- frontend/tests/e2e/candidate-phase-change.spec.ts

## Commands Executed

- `docker compose up -d` (repo root)
- `cd backend && npm run dev`
- `cd frontend && BROWSER=none npm start`
- `cd frontend && npx playwright test tests/e2e/candidate-phase-change.spec.ts`
- `cd frontend && npx playwright test tests/e2e/candidate-phase-change.spec.ts --project=chromium -g "recruiter moves candidate"` (isolation)
- `cd frontend && npx playwright test tests/e2e/position-page-load.spec.ts tests/e2e/candidate-phase-change.spec.ts --project=chromium` (combined smoke with Scenario 1)
- `cd frontend && npx playwright show-report` (standard; HTML generated under `frontend/playwright-report/`)

## Execution Result

PASS

## Passed Tests

- `[chromium|firefox|webkit] › Candidate phase change › recruiter moves candidate between hiring phases with persisted API update`

## Failed Tests

- None

## Skipped Tests

- None

## Bugs Created

- None

## Bugs Revalidated

- None

## Playwright Report Location

`frontend/playwright-report/index.html`

## Trace or Screenshot Evidence

- No retries; traces not captured (`trace: 'on-first-retry'`).

## Reproducibility Notes

- Requires Postgres, migrations, and successful seed (including **Carlos García** on **Initial Screening** for **Senior Full-Stack Engineer**).
- The test performs a **restore drag** back to **Initial Screening** so local DB state stays aligned with seed expectations after the run.

## Security Review Notes

- Only `http://localhost:3000` and `http://localhost:3010` used; no secrets in spec, test, or report.

## Final Recommendation

Scenario 2 artifacts are ready for review; optional next step is running the full multi-browser suite for both scenarios in CI.

## Quality gateway — coverage (Scenario 2)

| Criterion | Evidence |
|-----------|----------|
| Drag between hiring phase columns | `dragCandidateCardToColumn` + mouse path |
| Card visible in destination column | `technicalColumn.getByText('Carlos García')` |
| Outbound `PUT /candidates/:id` | `page.waitForRequest` URL includes candidate id |
| Body carries application + destination step | `postDataJSON()` vs API-derived ids |
| Successful response | `putResp?.status() === 200` |

**Coverage verdict:** PASS (Scenario 2).

## Quality gateway — reproducibility

- Commands logged; isolated Chromium grep-run passed.
- Restore step avoids order-dependent stale board state across reruns.

**Reproducibility verdict:** PASS.

## Quality gateway — security

- Files reviewed: `docs/specs/e2e/candidate-phase-change.md`, `frontend/tests/e2e/candidate-phase-change.spec.ts`, this report.

**Security verdict:** PASS.

## e2e-quality-gateway aggregate verdict

**PASS** for **Scenario 2 (Candidate Phase Change)** for this execution.

Cross-reference: **Scenario 1** remains covered by `docs/specs/e2e/position-page-load.md`, `frontend/tests/e2e/position-page-load.spec.ts`, and `docs/reports/RPT-20260517-position-page-load.md`. Combined Chromium smoke (Scenario 1 + 2) passed in this session.

## Project gaps noted

- `frontend/package.json` unit test script still references `jest.config.js` when present — unrelated to Playwright.
