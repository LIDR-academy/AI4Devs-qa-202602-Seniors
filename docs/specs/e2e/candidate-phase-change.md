# candidate-phase-change — Candidate hiring phase change on Kanban board

## Summary

Validates that a recruiter can move a candidate card between hiring phase columns on a position board and that the application updates persist through the talent tracking API. This is Scenario 2 (Candidate Phase Change) for the `position` interface.

## Interface Mapping

- Routes: `/positions` (list), `/positions/:id` (board with `DragDropContext` in `PositionDetails.js`).
- Components: `PositionDetails.js`, `StageColumn.js`, `CandidateCard.js` (`react-beautiful-dnd`).
- API endpoints: `GET /positions/:id/interviewflow`, `GET /positions/:id/candidates`, `PUT /candidates/:id` (real path; prose `PUT /candidate/:id` is incorrect).
- Update contract: request body matches frontend `PositionDetails.js` — numeric application identifier and numeric destination interview step identifier as understood by the backend application model.

## Test Data Needs

- Same prerequisites as Scenario 1: migrated PostgreSQL and `backend/prisma/seed.ts`.
- At least one candidate in **Initial Screening** on **Senior Full-Stack Engineer** (seed: **Carlos García**) and distinct destination phases **Technical Interview** / **Manager Interview**.

## Success Criteria

- After a drag from one hiring phase column to another, the candidate card appears under the destination phase.
- An outbound update request is sent to `PUT /candidates/:id` for the moved candidate.
- The update payload carries the correct application and destination interview step identifiers, and the server responds successfully.

## Gherkin

```gherkin
Feature: Candidate hiring phase change on position board

  Background:
    Given seeded positions and candidate applications exist in the talent tracking system

  Scenario: Recruiter moves a candidate to another hiring phase
    Given the recruiter is viewing the hiring board for the seeded engineering position
    When the recruiter moves a candidate from one hiring phase column into another hiring phase column
    Then the candidate appears under the destination hiring phase
    And the talent tracking API records the phase change for that candidate application
```

## Out of Scope

- Scenario 1 layout-only checks (covered by `position-page-load`).
- Validation errors or offline handling (no consistent error UI).
- Bulk moves or concurrent edits.

## Risks

- `react-beautiful-dnd` drag simulation sensitivity in headless browsers.
- Mutable seed state if tests do not restore the candidate phase after the move.

## Assumptions

- Interview flow path uses lowercase `interviewflow` segment matching Express routes.
- Drag interactions remain wired through `onDragEnd` and `updateCandidateStep` in `PositionDetails.js`.

## Open Questions

- None given stable seed data and URL alignment above.
