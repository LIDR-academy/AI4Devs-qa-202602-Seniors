# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI4Devs-QA is a candidate tracking / ATS (Applicant Tracking System) project. The primary exercise goal is writing Playwright E2E tests for the Kanban-style position board where recruiters drag candidates between interview stages.

## Architecture

Monorepo with two separate Node.js apps:

- **`backend/`** — Express + TypeScript REST API on port `3010`, Prisma ORM with PostgreSQL
- **`frontend/`** — React (CRA) + TypeScript on port `3000`

### Backend layering
```
src/
  routes/              → Express router registration
  presentation/controllers/  → HTTP handlers (parse params, delegate to services)
  application/services/      → Business logic (candidateService, positionService)
  application/validator.ts   → Input validation
  domain/models/             → Prisma-backed domain classes (save/findOne methods)
```

The Prisma client is attached to every `Request` object via middleware in `src/index.ts`. Domain models wrap Prisma calls directly (not repositories).

### Frontend routes
| Path | Component |
|---|---|
| `/` | `RecruiterDashboard` |
| `/positions` | `Positions` |
| `/positions/:id` | `PositionDetails` — Kanban board, the E2E test target |
| `/add-candidate` | `AddCandidateForm` |

`PositionDetails` fetches interview flow steps and candidates in parallel, then renders `StageColumn` (Droppable) / `CandidateCard` (Draggable) using `react-beautiful-dnd`. Drag-end calls `PUT /candidates/:id` with `{ applicationId, currentInterviewStep }`.

## Key API Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/positions` | All visible positions |
| `GET` | `/positions/:id/interviewflow` | Steps for a position's Kanban board |
| `GET` | `/positions/:id/candidates` | Candidates with current step |
| `PUT` | `/candidates/:id` | Move candidate to a new interview step |
| `POST` | `/candidates` | Add new candidate |

## Development Setup

### Database (PostgreSQL via Docker)
```bash
docker-compose up -d
```
Credentials are in `.env` at the repo root (also `backend/.env`).

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev   # first time only
npm run dev              # ts-node-dev with hot reload on :3010
```

Seed the database:
```bash
npx ts-node prisma/seed.ts
```

### Frontend
```bash
cd frontend
npm install
npm start   # CRA dev server on :3000
```

## Testing

### Backend unit tests (Jest + ts-jest)
```bash
cd backend
npm test                                           # all tests
npx jest src/application/services/candidateService.test.ts  # single file
```

### E2E tests (Playwright) — the main deliverable
Tests live in `frontend/tests/e2e/position.spec.ts`.

```bash
cd frontend
npx playwright install          # first time — installs browsers
npx playwright test             # headless
npx playwright test --ui        # interactive UI mode (recommended during dev)
npx playwright test tests/e2e/position.spec.ts   # single spec file
npx playwright show-report      # view HTML report after a run
```

Playwright config should be at `frontend/playwright.config.ts`.

## E2E Test Requirements

Two mandatory scenarios for `position.spec.ts`:

1. **Page load** — position title visible, all stage columns present, candidates appear in correct columns
2. **Drag and drop** — card moves visually to destination column, `PUT /candidates/:id` is called with correct `applicationId` and `currentInterviewStep`

**Use `data-testid` attributes** for stable selectors. Recommended attributes (add to components as needed):
- `data-testid="position-title"` on the `<h2>` in `PositionDetails`
- `data-testid="stage-column-{stageName}"` on each `StageColumn` card
- `data-testid="candidate-card-{candidateId}"` on each `CandidateCard`

Intercept and assert the PUT request using `page.route()` or `page.waitForRequest()`.

## Prompt Documentation

All AI prompts used during the exercise must be logged in `/prompts/prompts-[initials].md` — one prompt per numbered list item, no responses needed.
