# Project Baseline

## Current State
- Monorepo-style layout with separate `backend` and `frontend` apps.
- Backend stack: Express, Prisma, TypeScript, Jest.
- Frontend stack: React 18, React Router, Bootstrap, `react-beautiful-dnd`, Jest.
- Database is expected through `docker-compose.yml` and `.env`.

## Exercise-Relevant Findings
- `frontend` does not include `playwright.config.*`.
- `frontend/tests/e2e/` does not exist yet.
- The drag-and-drop screen is implemented in `frontend/src/components/PositionDetails.js`.
- Durable E2E coverage needs stable selectors on the stage container in `frontend/src/components/StageColumn.js` and on the draggable candidate card in `frontend/src/components/CandidateCard.js`.
- Useful selector targets in the current UI include each stage header (`stage.title`), each droppable stage body, and each candidate card (`candidate.id` or `applicationId`).
- The backend registers `backend/src/routes/positionRoutes.ts` and `backend/src/routes/candidateRoutes.ts`, including `GET /positions/:id/candidates`.

## Primary Risks
- Existing UI markup is not yet automation-friendly.
- Drag-and-drop can be flaky without explicit selectors and deterministic seed data.
- Prompt logging can become incomplete if it is not maintained alongside the work.
