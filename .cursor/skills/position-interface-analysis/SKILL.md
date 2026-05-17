# position-interface-analysis

## Purpose

Force agents to inspect the real `position` interface before writing specifications, tests, bug reports, or fixes. The skill captures the real routes, components, hiring phase terminology, candidate model, and API contracts that downstream artifacts MUST cite.

## When to Use This Skill

Use this skill:

- Before drafting any BDD specification under `docs/specs/e2e/`.
- Before implementing Playwright tests under `frontend/tests/e2e/`.
- Before reporting a defect that references the `position` interface.
- Before fixing a defect that touches the `position` interface.
- Whenever the project standards are updated.

## Required Inputs

- `frontend/src/App.js` (routing)
- `frontend/src/components/Positions.tsx`
- `frontend/src/components/PositionDetails.js`
- `frontend/src/components/StageColumn.js`
- `frontend/src/components/CandidateCard.js`
- `frontend/playwright.config.ts`
- Existing E2E tests under `frontend/tests/e2e/`
- `backend/api-spec.yaml`
- `backend/src/index.ts` and `backend/src/routes/positionRoutes.ts`, `backend/src/routes/candidateRoutes.ts`
- `backend/ModeloDatos.md`
- Seed data (e.g., `backend/prisma/seed.ts`) when present.

## Procedure

1. Identify the routes that expose the `position` interface:
   - `/positions` — list of positions rendered by `Positions.tsx`.
   - `/positions/:id` — Kanban board rendered by `PositionDetails.js`.
2. Identify the components involved in the flow: `Positions.tsx`, `PositionDetails.js`, `StageColumn.js`, `CandidateCard.js`, `CandidateDetails.js` (offcanvas, when in scope).
3. Identify the navigation entry points (for example, the `Ver proceso` button in `Positions.tsx`).
4. Identify the hiring phase terminology rendered by `StageColumn.js`. The titles come from the backend (`step.name`) — list the phases observed at runtime instead of inventing them.
5. Identify the candidate model rendered by `CandidateCard.js` (`id`, `name`, `rating`, `applicationId`) and document the mapping with the backend candidate model.
6. Identify the candidate update endpoint actually invoked by the frontend (`PUT http://localhost:3010/candidates/:id` in `PositionDetails.js`) and the request body schema (`{ applicationId: number, currentInterviewStep: number }`).
7. Compare the real endpoint with prose like `PUT /candidate/:id` from the user query. Document the discrepancy.
8. Identify the interview flow endpoint and verify URL casing against the backend route. Capture any mismatch (for example, `interviewFlow` vs. `interviewflow`).
9. Identify any open question that blocks safe specification or implementation.

## Quality Checklist

- [ ] All five canonical files (`App.js`, `Positions.tsx`, `PositionDetails.js`, `StageColumn.js`, `CandidateCard.js`) were inspected.
- [ ] Routes `/positions` and `/positions/:id` were confirmed.
- [ ] Hiring phase terminology was extracted from the live UI or backend seed data, not invented.
- [ ] Candidate update endpoint was confirmed in the frontend (`PositionDetails.js`) and backend (`backend/src/index.ts` + `candidateRoutes.ts`).
- [ ] Endpoint discrepancy with prose `PUT /candidate/:id` was documented.
- [ ] Interview flow casing mismatch (if present) was documented as a known limitation.
- [ ] Open questions were recorded for the orchestrator.

## Expected Outputs

- A documented summary including:
  - **Relevant files** with paths.
  - **Routes** and navigation paths.
  - **Candidate terminology** and **hiring phase terminology**.
  - **API behavior evidence** with the real candidate update endpoint and request schema.
  - **Endpoint discrepancy notes**.
  - **Open questions** for downstream agents or the user.

## Failure Conditions

- A required file cannot be inspected.
- Hiring phase terminology cannot be observed from the UI or from seed data.
- The real candidate update endpoint cannot be confirmed.
- The agent proceeds without recording the endpoint discrepancy.
- The summary is not propagated to the consuming artifact (spec, test, bug, report).
