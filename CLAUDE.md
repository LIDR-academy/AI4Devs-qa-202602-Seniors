# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **QA/Testing exercise** for AI4Devs. The full-stack recruitment management app is already built; the goal is to add Playwright E2E tests for the Kanban board (drag-and-drop candidate stages) on the Position Details page.

## Development Commands

### Start the full stack

```bash
# 1. Start the PostgreSQL database
docker-compose up -d

# 2. Start the backend (port 3010)
cd backend
npm install
npx prisma migrate dev
npm start

# 3. Start the frontend (port 3000)
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
npm test                        # run all Jest unit tests
npm test -- --testPathPattern=candidateService   # run a single test file
npx prisma studio               # open Prisma DB explorer
npx prisma migrate dev          # apply schema migrations
```

### Frontend / E2E

```bash
cd frontend
npm test                        # run React unit tests (Jest/RTL)
npx playwright test             # run all Playwright E2E tests
npx playwright test position    # run a single spec file
npx playwright test --ui        # open Playwright interactive UI
npx playwright show-report      # view last HTML test report
```

## Architecture

### Stack

| Layer | Tech |
|---|---|
| Database | PostgreSQL (Docker, port 5432) |
| Backend | Node.js + Express + Prisma ORM (port 3010) |
| Frontend | React 18 + TypeScript + React Router v6 (port 3000) |
| Drag-drop | `react-beautiful-dnd` |
| E2E testing | Playwright (to be added) |

### Backend layers (`backend/src/`)

```
domain/models/          ← Entities (Candidate, Position, Interview, …)
application/services/   ← Business logic (candidateService, positionService, …)
presentation/controllers/ ← HTTP handlers
routes/                 ← Express routers
```

### Key API endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/positions` | List all positions |
| GET | `/positions/:id/interviewFlow` | Returns stage list: `interviewFlow.interviewSteps[].name` |
| GET | `/positions/:id/candidates` | Returns candidates with `currentInterviewStep` matching stage name |
| PUT | `/candidates/:id` | Move candidate to new stage; body: `{ applicationId, currentInterviewStep }` |
| POST | `/upload` | CV file upload (Multer) |

### Frontend components (`frontend/src/components/`)

- **PositionDetails.js** – Kanban board; fetches stages + candidates and wires up `react-beautiful-dnd`
- **StageColumn.js** – `<Droppable>` column; droppableId = `stage.title`
- **CandidateCard.js** – `<Draggable>` card; draggableId = `String(candidate.id)`
- **CandidateDetails.js** – Slide-out panel for candidate info

The drag-drop `onDragEnd` handler calls `updateCandidateStep(applicationId, newStepId)` in `src/services/candidateService.js`, which issues `PUT /candidates/:id`.

## E2E Test Deliverables (exercise requirements)

1. **`data-testid` attributes** added to React components (e.g. `data-testid="phase-column-applied"`, `data-testid="candidate-card-{id}"`, `data-testid="position-title"`)
2. **`frontend/playwright.config.ts`** (or `.js`) — configure `baseURL: 'http://localhost:3000'`
3. **`frontend/tests/e2e/position.spec.ts`** — tests must cover:
   - Page loads with correct title and all phase columns visible
   - Each candidate card is in the correct column
   - Drag-and-drop moves a card to a new column (UI state updated)
   - `PUT /candidates/:id` is called with correct payload
   - The new phase is persisted (verify after re-load or via network intercept)
4. **`/prompts/prompts-[initials].md`** — document all AI prompts used during the exercise

## Environment

Root `.env` provides database credentials consumed by Docker and Prisma (`DATABASE_URL`). Do not commit secrets.
