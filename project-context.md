---
project_name: 'AI4Devs-qa-202602-Seniors'
user_name: 'Juanfer Lopez'
date: '2026-05-18'
sections_completed: ['discovery', 'technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality_rules', 'workflow_rules', 'critical_rules']
existing_patterns_found: 12
status: 'complete'
rule_count: 74
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- Repo layout: root package plus separate `frontend/` and `backend/` Node projects.
- Frontend: React 18.3.1 using Create React App via `react-scripts` 5.0.1.
- Frontend language mode: mixed JavaScript and TypeScript. `allowJs: true`, `strict: true`, `jsx: react-jsx`, and source limited to `frontend/src`.
- Frontend UI: Bootstrap 5.3.3, React Bootstrap 2.10.2, React Bootstrap Icons 1.11.4.
- Frontend routing: `react-router-dom` 6.23.1 with routes declared in `frontend/src/App.js`.
- Frontend drag/drop: `react-beautiful-dnd` 13.1.1 for the position Kanban board.
- Frontend date input: `react-datepicker` 6.9.0.
- Frontend test stack: Jest through `frontend` scripts plus Playwright 1.60.0, `playwright-bdd` 8.5.1, Allure Playwright 3.8.0.
- Backend: Express 4.19.2, TypeScript 4.9.5, Prisma 5.13.0, PostgreSQL.
- Backend runtime: `ts-node-dev` for local dev, compiled output in `backend/dist`.
- Backend tests: Jest 29.7.0 with `ts-jest`.
- Database: PostgreSQL via Docker Compose using `postgres:18`; Prisma datasource reads `DATABASE_URL`.

## Critical Implementation Rules

### Language-Specific Rules

- Treat the frontend as a mixed JS/TS CRA app, not a pure TypeScript app. Existing components are mostly `.js`; do not rename to `.tsx` unless the change benefits from explicit typing and imports are updated.
- Frontend TypeScript is strict, but `allowJs` is enabled. Type errors in `.tsx` files matter; JavaScript files still need runtime-safe handling because they are included by `tsconfig.json`.
- Use functional React components and named local handlers, matching the current code style.
- Keep frontend imports relative inside `frontend/src`; there is no configured path alias.
- Backend is strict TypeScript CommonJS compiled to `dist`. New backend code should be `.ts` under `backend/src` and must compile with `backend/tsconfig.json`.
- Backend request parsing should convert route/body IDs with `parseInt`/`Number` and reject invalid numeric values before calling services.
- Preserve the existing backend layering: routes call presentation controllers, controllers validate HTTP-level inputs, services call domain models and Prisma-backed persistence.
- Error responses currently use simple JSON bodies and status codes. Keep behavior consistent with nearby controllers instead of introducing a new error abstraction.
- Avoid adding broad `any` in new TypeScript code unless matching an existing untyped boundary; prefer small local types for request payloads and DTO-shaped data.

### Framework-Specific Rules

- Frontend routing lives in `frontend/src/App.js` using `BrowserRouter`, `Routes`, and `Route` from `react-router-dom` v6. Add new pages there unless a routing refactor is explicitly requested.
- Keep the current page routes stable: `/`, `/add-candidate`, `/positions`, and `/positions/:id`.
- The frontend UI is React Bootstrap first. Prefer `Container`, `Row`, `Col`, `Card`, `Button`, `Form`, `Offcanvas`, `Alert`, `InputGroup`, and `Spinner` over custom layout primitives.
- Bootstrap is imported globally in `App.js`; component styles currently rely on Bootstrap utility classes plus occasional inline styles.
- The position detail view is a Kanban-style board implemented with `react-beautiful-dnd`. Preserve `DragDropContext`, `Droppable`, `Draggable`, `droppableId` as stage index strings, and candidate `draggableId` as string IDs unless the drag model is intentionally changed.
- The position flow UI depends on backend responses from `GET /positions/:id/interviewFlow` and `GET /positions/:id/candidates`; agents must preserve the shape mapping into `{ title, id, candidates }` stages.
- Moving a candidate must call `PUT http://localhost:3010/candidates/:candidateId` with `applicationId` and numeric `currentInterviewStep`.
- Candidate detail side panel uses React Bootstrap `Offcanvas`; avoid replacing it with a modal unless product behavior changes.
- Backend Express app is created/exported from `backend/src/index.ts`; routes are mounted at `/candidates`, `/positions`, and `/upload`.
- PrismaClient is attached to `req.prisma`, but most current domain/service code imports model classes instead. Follow nearby patterns rather than mixing persistence styles inside a single flow.
- Backend CORS currently allows only `http://localhost:3000`; frontend local development assumes CRA default port 3000 and backend port 3010.

### Testing Rules

- Run frontend commands from `frontend/` and backend commands from `backend/`; scripts are not centralized at repo root.
- Backend unit tests live beside implementation files as `*.test.ts` and run with Jest plus `ts-jest`.
- Backend tests should cover service/controller behavior at the layer being changed. Keep HTTP-level assertions in controller/route tests and persistence/business rules in service/domain tests.
- Frontend E2E tests are expected to use Playwright. `frontend/playwright.config.ts` is configured through `playwright-bdd` with features in `frontend/features/*.feature` and steps in `frontend/features/steps/*.ts`.
- Playwright reporters are `line`, `html`, and `allure-playwright`; do not remove Allure reporting when changing E2E configuration.
- Prefer stable selectors for E2E tests. The README explicitly recommends `data-testid` attributes for position title, phase columns, and candidate cards.
- E2E tests for the position board should validate both visible UI state and backend communication, especially `PUT /candidates/:id` after drag/drop.
- The current Playwright config does not start the app automatically. Tests require the frontend and backend to be running unless a `webServer` configuration is deliberately added.
- If adding `data-testid` to frontend components, keep names deterministic from domain IDs or normalized stage names so tests do not depend on fragile translated display text.

### Code Quality & Style Rules

- Keep frontend source in `frontend/src`; reusable UI pieces belong in `frontend/src/components`, and frontend API helpers belong in `frontend/src/services`.
- Current frontend component filenames use PascalCase (`CandidateCard.js`, `StageColumn.js`, `Positions.tsx`). Follow that convention for new components.
- Keep backend source under `backend/src` using the existing folders: `routes`, `presentation/controllers`, `application/services`, `application`, and `domain/models`.
- Backend test files currently sit beside the code they test, not in a separate `tests/` folder.
- Use semicolons and single quotes where nearby code does; avoid introducing a formatter-only churn pass across unrelated files.
- Comments should be sparse and practical. Existing code has Spanish comments in several places; preserve language style in touched areas and avoid adding English-only explanatory blocks to Spanish-heavy files unless needed.
- UI text is currently Spanish in the frontend. New user-facing labels, buttons, alerts, and headings should be Spanish unless the surrounding screen is intentionally changed.
- Preserve Bootstrap/React Bootstrap class conventions such as `mt-5`, `mb-4`, `shadow`, `shadow-sm`, `text-center`, and grid `md` breakpoints when extending existing screens.
- Do not introduce a new styling system, component library, state manager, or router without an explicit requirement.
- Keep `project-context.md` lean: document rules agents might miss, not generic React/Express advice.

### Development Workflow Rules

- Install and run dependencies separately in `frontend/` and `backend/`; root `package.json` only contains shared Prisma metadata and `dotenv`.
- For frontend development, use `cd frontend && npm start`; CRA serves on `http://localhost:3000`.
- For backend development, use `cd backend && npm run dev`; Express listens on `http://localhost:3010`.
- Start PostgreSQL with the root `docker-compose.yml`; it expects `DB_PASSWORD`, `DB_USER`, `DB_NAME`, and `DB_PORT` in the root `.env`.
- Prisma uses `backend/prisma/schema.prisma` and expects `DATABASE_URL`; run Prisma commands with awareness of the root package Prisma schema override or from the backend with the schema path.
- Build checks are separate: `cd frontend && npm run build` and `cd backend && npm run build`.
- Test checks are separate: `cd backend && npm test`; frontend E2E is `cd frontend && npm run test:e2e`.
- The exercise requires documenting AI prompts in `prompts/prompts-[initials].md`; do not overwrite another student's prompt file.
- Pull request descriptions should include description, changes, how to run tests, and AI tools used, matching the README format.
- Do not assume README examples are exact repo structure. The actual frontend currently has no committed `tests/e2e` folder and Playwright config points to BDD `features/`.

### Critical Don't-Miss Rules

- Do not treat this as the generic README template repo. The real frontend is a CRA React app under `frontend/src` with React Bootstrap and `react-beautiful-dnd`; update the actual components, not imagined `tests/e2e` or unrelated framework folders.
- Do not replace the drag/drop implementation with Playwright-only helpers or native HTML5 assumptions. The UI uses `react-beautiful-dnd`, which has specific DOM and event behavior.
- Do not add E2E selectors only to tests. The frontend components may need `data-testid` attributes added to `PositionDetails`, `StageColumn`, and `CandidateCard`.
- Do not rely on visible Spanish labels alone for E2E selectors; stage names and translated UI text can change. Prefer stable `data-testid` values.
- Do not assume `axios` is the only frontend API pattern. Most current components use `fetch`; `candidateService.js` uses `axios` but is not consistently used by pages.
- Do not change backend route paths casually. Frontend code depends directly on hardcoded `http://localhost:3010` endpoints.
- Be careful with `PositionDetails`: `fetchInterviewFlow()` and `fetchCandidates()` both call `setStages`; changes can race or overwrite candidates if stage/candidate merging is not handled deliberately.
- Avoid mutating React state arrays in place when changing drag/drop behavior. Current code splices existing nested arrays; new work should prefer cloned stage and candidate arrays to avoid subtle render bugs.
- `CandidateCard` rating rendering assumes `candidate.rating` is a number usable as `Array.from({ length })`; guard or normalize if backend can return null/undefined.
- `FileUploader` calls `onChange` with the raw file and `onUpload` with uploaded metadata; do not collapse these into one payload without updating `AddCandidateForm`.
- Backend `app.use` logging is currently registered after the routes, so it does not log earlier route handlers. Move it only if intentionally changing request logging behavior.
- `backend/src/index.ts` calls `app.listen` at module load. This can affect tests importing `app`; avoid worsening this pattern unless explicitly refactoring server startup.
- Keep secrets out of docs and commits. Root `.env` exists locally and `.gitignore` currently does not ignore all `.env` files because the `#**/.env` line is commented.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code.
- Follow all documented rules unless the user explicitly asks for a conflicting change.
- When in doubt, prefer the existing repo pattern over introducing new architecture.
- Update this file if new durable implementation patterns emerge.

**For Humans:**

- Keep this file lean and focused on agent needs.
- Update it when the technology stack, test structure, or frontend architecture changes.
- Remove rules that become obsolete or no longer match the codebase.

Last Updated: 2026-05-18
