# AGENTS — LTI Talent Tracking System · E2E QA Pipeline

## 1. Project Overview

**LTI Talent Tracking System (AI4Devs-QA)** is an end-to-end quality assurance exercise focused on validating a **Position board** (Kanban-style interface) where candidates are moved through interview stages. The pipeline orchestrates automated security scanning, BDD test authoring, execution, and reporting.

## 2. Business Purpose

The Position board is the core UI for **recruiting workflow management**. Recruiters view candidates distributed across columns representing interview stages (Applied → Interview → Offer). Tests validate:

1. **Visual load**: position title, all interview stages as columns, candidates in correct columns.
2. **Drag-and-drop interaction**: moving a candidate between stages triggers a backend `PUT /candidates/:id` request.
3. **Rejection handling**: backend errors revert the UI move and surface error messages.

## 3. Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18.3 + React-Bootstrap, React-DND, React-Router |
| **Backend** | Node.js/Express + TypeScript, Prisma ORM, PostgreSQL |
| **E2E Testing** | Playwright + playwright-bdd (BDD/Gherkin) |
| **Database** | PostgreSQL (Docker) |
| **CI/CD** | GitHub Actions (implicit) |

## 4. Frontend Architecture

### Key Components

- **Position Board** (`frontend/src/components/PositionBoard.tsx` or similar)
  - Displays position title and interview stage columns.
  - Uses React-DND for drag-and-drop.
  - Renders candidate cards in columns indexed by `currentInterviewStep`.

- **Candidate Card** 
  - Draggable card showing candidate name and details.
  - On drop, triggers API call to backend.

### Dependencies

```json
{
  "react": "^18.3.1",
  "react-bootstrap": "^2.10.2",
  "react-dnd": "^16.0.1",
  "react-dnd-html5-backend": "^16.0.1",
  "react-router-dom": "^6.23.1"
}
```

## 5. Backend Architecture

### API Endpoint

**PUT /candidates/:id** — Update candidate interview stage.

**Request body:**
```json
{
  "applicationId": <number>,
  "currentInterviewStep": <number>
}
```

**Response (200 OK):**
```json
{
  "message": "Candidate stage updated successfully",
  "data": { candidate_object }
}
```

**Error cases:**
- `400` — Invalid ID/step format.
- `404` — Application not found.

### Domain Models

- **Position** — job opening with stages.
- **Candidate** — person applying for positions.
- **Application** — candidate's application for a position; links to interview flow.
- **InterviewStep** — stage in the interview process (e.g., Applied=0, Interview=1, Offer=2).
- **Interview** — interview event within an application.

### Services

- `candidateService.ts` — business logic for candidate updates.
- `positionService.ts` — position and interview flow logic.

## 6. AI Agent Layout

### Sub-agents

| Agent | Role | Skill |
|-------|------|-------|
| `owasp-analyst` | Application-security expert | `owasp-top10-2025` |
| `playwright-bdd-tester` | E2E test engineer | `bdd-gherkin-authoring`, `playwright-bdd-runner` |

### Skills

- `codebase-analysis` — structural/business analysis.
- `bdd-gherkin-authoring` — scenario design & anti-pattern checks.
- `playwright-bdd-runner` — test execution & flake healing.
- `owasp-top10-2025` — security findings & remediation.
- `test-reporting` — result aggregation & defect logging.

### Phase Commands

All under `.claude/commands/`:

1. `/setup-env` — install Playwright MCP, test agents, playwright-bdd, Docker DB.
2. `/analyze-codebase` → `AGENTS.md` + `CLAUDE.md`.
3. `/scan-owasp` → `docs/vulnerabilities.md` (if findings exist).
4. `/generate-features` → `tests/features/positions.feature` + steps.
5. `/run-e2e` → `docs/test_results.md` + `docs/test_defects.md`.
6. `/build-report` → `docs/test_report.md`.
7. Write `PR.md` manually.

## 7. Directory Structure

```
.
├── .claude/
│   ├── agents/
│   │   ├── owasp-analyst.md
│   │   ├── playwright-bdd-tester.md
│   │   └── playwright-test-{planner,generator,healer}.md
│   ├── commands/
│   │   ├── setup-env.md
│   │   ├── analyze-codebase.md
│   │   ├── scan-owasp.md
│   │   ├── generate-features.md
│   │   ├── run-e2e.md
│   │   └── build-report.md
│   └── skills/
│       ├── codebase-analysis/
│       ├── bdd-gherkin-authoring/
│       ├── playwright-bdd-runner/
│       ├── owasp-top10-2025/
│       └── test-reporting/
├── backend/
│   ├── src/
│   │   ├── domain/models/
│   │   ├── application/services/
│   │   ├── presentation/controllers/
│   │   └── routes/
│   ├── dist/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   ├── tests/
│   │   ├── features/positions.feature
│   │   └── steps/positions.steps.ts
│   ├── playwright.config.ts
│   └── package.json
├── tests/
│   ├── features/
│   └── steps/
├── specs/ (Playwright test plan directory)
├── docs/
│   ├── vulnerabilities.md (if findings)
│   ├── test_results.md
│   ├── test_defects.md
│   └── test_report.md
├── .env (root)
├── .env (backend)
├── docker-compose.yml
├── AGENTS.md (this file)
├── CLAUDE.md (pointer to AGENTS.md)
└── PR.md (final summary)
```

## 8. IDE Configuration

- **Claude Code / Cursor / Antigravity** — reads `CLAUDE.md` → points to `AGENTS.md`.
- **GitHub Copilot** — reads `.github/copilot-instructions.md` (symlink to canonical).
- **Windsurf** — reads `.windsurfrules` (symlink to canonical).
- **Other IDEs** — read symlinks in their respective config directories.

All point to the same canonical content to avoid divergence.

## 9. Key Constraints & Assumptions

- **No artificial `data-testid` injection** — tests use existing stable selectors (classes, text, role).
- **Network assertions verify PUT contract** — exact body shape `{ applicationId, currentInterviewStep }`.
- **BDD scenarios enforce single `When`** — clear cause-and-effect per scenario.
- **Domain language** — `candidate`, `position`, `interview stage` (not generic `user`, `item`, `column`).
- **Flake healing** — Playwright healer invoked once per flaky failure before logging defect.

## 10. Entry Points

| Use Case | Command |
|----------|---------|
| Full pipeline (Phase 0–7) | Invoke phases in sequence |
| Codebase context only | `/analyze-codebase` |
| Security audit | `/scan-owasp` |
| Test generation | `/generate-features` |
| Test execution | `/run-e2e` |
| Report generation | `/build-report` |

## 11. References

- **OWASP Top 10 (2025)**: https://owasp.org/Top10/2025/
- **Playwright Docs**: https://playwright.dev/
- **playwright-bdd**: https://vitalets.github.io/playwright-bdd/
- **Prisma**: https://www.prisma.io/
- **Express**: https://expressjs.com/
- **React**: https://react.dev/

---

**Last Updated:** 2026-05-16  
**Canonical Source:** `.claude/agents/` + `.claude/skills/` + `.claude/commands/`
