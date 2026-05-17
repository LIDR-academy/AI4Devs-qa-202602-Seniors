# Repository Guidelines

## Project Structure & Module Organization
This exercise repo is organized into `backend/`, `frontend/`, and `prompts/`.

- `backend/src/` contains the Express API, grouped into `application/`, `domain/`, `presentation/`, and `routes/`.
- `backend/prisma/` holds the Prisma schema, migrations, and seed data.
- `frontend/src/` contains the React UI, with screens and reusable components under `components/`, plus API helpers in `services/`.
- `prompts/` should store `prompts-[initials].md`, the ordered list of AI prompts used during the exercise.

## Build, Test, and Development Commands
Run commands from the relevant app folder unless noted.

- `docker-compose up -d db`: starts the local Postgres database from the repo root.
- `cd backend && npm install && npm run dev`: starts the API on `http://localhost:3010`.
- `cd backend && npm run build`: compiles backend TypeScript into `dist/`.
- `cd backend && npm test`: runs backend Jest tests.
- `cd frontend && npm install && npm start`: starts the React app on `http://localhost:3000`.
- `cd frontend && npm test`: runs frontend Jest tests.
- `cd frontend && npx playwright test`: reserved for future E2E setup; Playwright is not configured in the current baseline.
- `cd frontend && npx playwright show-report`: use only after Playwright is added and a report has been generated.

## Coding Style & Naming Conventions
- Keep backend code in TypeScript and follow existing layered boundaries.
- Frontend currently mixes `.js` and `.tsx`; match the surrounding file instead of forcing a conversion.
- Use `PascalCase` for React components and domain models, `camelCase` for functions and services, and descriptive file names such as `positionController.ts` or `candidateService.ts`.
- Add stable `data-testid` attributes for E2E selectors instead of relying on CSS classes or visible text only.

## Testing Guidelines
- Keep backend tests adjacent to the unit under test as `*.test.ts`.
- Add Playwright specs under `frontend/tests/e2e/` with descriptive `*.spec.ts` or `*.spec.js` names that match the scenario.
- Validate both the UI result and the backend request for drag-and-drop flows.
- Before a PR, run the impacted Jest tests and the Playwright scenario you changed.

## Commit & Pull Request Guidelines
- Use short, imperative commit subjects.
- In the PR, include a summary, test evidence, and any required UI screenshots or Playwright report output.
- Update `prompts/prompts-[initials].md` with every prompt used to complete the exercise.
