# position-page-load — Position hiring board load

## Summary

Validates that a recruiter can open a position’s Kanban hiring board and see the position title, every hiring phase column defined for that position’s interview flow, and candidate cards grouped under the phase that matches each candidate’s current application stage. This is Scenario 1 (Position Page Load) for the `position` interface.

## Interface Mapping

- Routes: `/positions` (list), `/positions/:id` (hiring board rendered by `PositionDetails.js`).
- Components: `Positions.tsx`, `PositionDetails.js`, `StageColumn.js`, `CandidateCard.js`.
- API endpoints (backend source of truth): `GET /positions`, `GET /positions/:id/interviewflow`, `GET /positions/:id/candidates`.
- Real candidate update endpoint (Scenario 2 / drag-and-drop): `PUT /candidates/:id` with JSON body including application and interview-step identifiers as implemented in `PositionDetails.js` (not exercised in this scenario).

## Test Data Needs

- PostgreSQL with Prisma migrations applied and `backend/prisma/seed.ts` executed at least once.
- Seeded **Senior Full-Stack Engineer** position with interview steps **Initial Screening**, **Technical Interview**, and **Manager Interview**.
- Applications placing **John Doe** and **Jane Smith** in **Technical Interview**, and **Carlos García** in **Initial Screening** (per seed).

## Success Criteria

- The hiring board shows the correct position title after navigation from the position list.
- Every hiring phase title returned for the position appears as a column header on the board.
- Candidate names appear only under the column that matches their current application stage.

## Gherkin

```gherkin
Feature: Position hiring board visibility

  Background:
    Given seeded positions and candidate applications exist in the talent tracking system

  Scenario: Recruiter opens a position hiring board
    Given the recruiter is viewing the position list
    When the recruiter opens the hiring board for the seeded engineering position
    Then the hiring board shows the position title
    And hiring phases from the interview flow appear as columns
    And candidate applications appear under the matching hiring phase columns
```

## Out of Scope

- Drag-and-drop between hiring phases (Scenario 2).
- Candidate detail offcanvas content.
- Position list filtering controls (placeholders only).
- Error surfacing when APIs fail (no consistent error UI today).

## Risks

- Flaky timing if interview flow and candidates requests complete in an unfortunate order (mitigated by assertions waiting on visible UI).
- Seed assumptions if the database is not reset between full suite runs.

## Assumptions

- Frontend calls `GET /positions/:id/interviewflow` (lowercase path segment), matching `positionRoutes.ts`; prose referring to camelCase segments is outdated.
- Hiring phase labels come from interview step names in seed/backend, not hardcoded copy in tests beyond seed-linked expectations.

## Open Questions

- None for Scenario 1 given the above assumptions.
