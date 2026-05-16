# Project: Position Interface E2E Testing

## Overview

This project focuses on implementing robust End-to-End (E2E) testing for the 'Position' interface within the hiring platform. The goal is to ensure the reliability of the candidate management workflow, from initial page load to real-time status updates via drag-and-drop functionality.

## Main Features

- **Visual Validation:** Verification of UI elements, including headers, columns, and candidate cards.
- **Dynamic Interaction:** Testing drag-and-drop capabilities between different hiring stages.
- **API Integration Testing:** Validating that UI actions trigger the correct backend requests and handle responses successfully.

## User Behaviour

1. **Navigating to Positions:** Users access the position detail page to view the recruitment funnel.
2. **Reviewing Candidates:** Users scan columns (Applied, Interview, Technical Test, Offer, Hired, Rejected) to identify candidate status.
3. **Progressing Candidates:** Users drag a candidate card from one phase and drop it into another to update their status.
4. **Real-time Updates:** Users expect the UI to reflect the change immediately while the system synchronizes with the database.

## Tech Stack

- **Testing Framework:** Playwright / Cypress (E2E)
- **Backend API:** RESTful API (Node.js/Python/Go)
- **Database:** PostgreSQL / MongoDB
- **CI/CD:** GitHub Actions (for automated test execution)

## Scope Limitations

- Tests are limited to the 'Position' interface only; login and global navigation are out of scope for this specific suite.
- Does not cover bulk candidate movements.
- Limited to desktop view validation (mobile responsiveness testing not included in this phase).

## Project Tasks

### Task 1: Create E2E Tests for the 'Position' Interface

Develop a comprehensive test suite to validate the following scenarios:

#### Scenario 1: Position Page Load

Create a test to verify that the position screen loads correctly. The test must check:

- The position title is displayed correctly.
- Columns corresponding to each phase of the hiring process are visible.
- Candidate cards appear in the correct column based on their current phase.
- _Examples of phases:_ Applied, Interview, Technical Test, Offer, Hired, Rejected. (Phases must match the actual implementation).

#### Scenario 2: Candidate Phase Change

Create a test that simulates moving a candidate from one phase to another. The test must verify:

- A candidate card can be dragged from one column to another.
- The candidate card visually appears in the new column.
- The candidate's phase is updated correctly in the backend via the endpoint:
  `PUT /candidate/:id`
- **Validation Criteria:**
  - A `PUT` request is triggered upon moving the candidate.
  - The `id` in the request corresponds to the moved candidate.
  - The request body contains the correct new phase.
  - The backend returns a successful response (HTTP 200/204).
