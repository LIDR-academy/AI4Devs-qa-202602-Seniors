# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI4Devs QA exercise: End-to-End testing with Playwright for a recruitment management system (ATS). The app displays a Kanban board where candidates are moved between interview phases via drag-and-drop.

## Commands

### Backend (from `backend/`)
```bash
npm run dev          # Start dev server (ts-node-dev, port 3010)
npm run build        # Compile TypeScript
npm test             # Run Jest tests
npx prisma generate  # Generate Prisma client
```

### Frontend (from `frontend/`)
```bash
npm start            # Start React dev server (port 3000)
npm run build        # Production build
npm test             # Run Jest unit tests
```

### E2E Tests (from `frontend/`)
```bash
npx playwright test                              # Run all E2E tests headless
npx playwright test tests/e2e/position.spec.ts   # Run specific test file
npx playwright test --ui                         # Interactive UI mode
npx playwright show-report                       # View HTML report
npx playwright install                           # Install browsers (first time)
```

### Database
```bash
docker compose up -d   # Start PostgreSQL (requires .env with DB_PASSWORD, DB_USER, DB_NAME, DB_PORT)
```

## Architecture

- **Backend**: Express + TypeScript + Prisma ORM, layered architecture (`domain/`, `application/`, `presentation/controllers/`, `routes/`). PostgreSQL database.
- **Frontend**: React 18 (CRA) with react-beautiful-dnd for drag-and-drop, React Bootstrap for UI. Frontend calls backend at `http://localhost:3010`.
- **E2E Tests**: Playwright configured in `frontend/playwright.config.ts`, tests in `frontend/tests/`.

## Key API Endpoints (port 3010)

- `GET /positions/:id/interviewFlow` — fetch interview steps for a position
- `GET /positions/:id/candidates` — fetch candidates in a position
- `PUT /candidates/:id` — update candidate's interview step (body: `{ applicationId, currentInterviewStep }`)

## Key Frontend Components

- `PositionDetails.js` — Kanban board page, uses DragDropContext, calls PUT on drag-end
- `StageColumn.js` — individual phase column (Droppable)
- `CandidateCard.js` — candidate card (Draggable)

## Testing Conventions

- Use `data-testid` attributes for stable selectors in E2E tests
- Validate both visual UI state and backend API communication
- Playwright config runs tests against chromium, firefox, and webkit by default
