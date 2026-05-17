---
name: playwright-e2e-helper
description: Use when adding or stabilizing Playwright coverage for the recruiter drag-and-drop flow in this repository.
---

Use this for `frontend/tests/e2e/*` work around the position details board.

- Selector strategy: prefer `data-testid`; if missing, add the smallest stable hook on `CandidateCard`, `StageColumn`, or the position details view instead of relying on Bootstrap classes, text order, or emoji ratings.
- Drag-and-drop stability: assert the board is loaded before dragging, target the droppable column instead of visual whitespace, and verify both the moved card's new column and the persisted backend update. Avoid sleeps.
- Request capture: watch the `PUT /candidates/:id` call triggered by `PositionDetails.js`; confirm status plus payload fields `applicationId` and `currentInterviewStep`.
- Evidence to return: name of spec changed, selectors added or reused, route/assertions covered, and whether UI proof plus network proof were both verified.

Keep scope on Playwright support for this repo. Do not redesign the app, refactor unrelated components, or broaden test coverage without a task asking for it.
