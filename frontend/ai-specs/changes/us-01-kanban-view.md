# US-01 — View Candidate Pipeline as Kanban Board

> As a recruiter, I want to open a position and see all its interview stages and candidates laid out as a kanban board so that I can get an at-a-glance view of where every candidate stands.

## Acceptance Criteria

1. **Given** the recruiter is on any page of the application  
   **When** they navigate to `/positions/:id`  
   **Then** the page displays the name of the position as a centred heading above the board.

2. **Given** the recruiter is on the position detail page  
   **When** the page finishes loading  
   **Then** one column is rendered for each interview step returned by the API, in the order returned, each column showing its step name as a header.

3. **Given** the recruiter is on the position detail page  
   **When** the page finishes loading  
   **Then** each candidate is placed in the column whose name matches the candidate's current interview step; a candidate whose current step does not match any column name does not appear on the board.

4. **Given** a candidate is displayed inside a column  
   **When** the recruiter looks at the card  
   **Then** the card shows the candidate's full name as a title and a row of green circle icons (🟢) whose count equals the candidate's average score; no icons are shown when the score is zero.

5. **Given** the recruiter is on the position detail page  
   **When** they click the "Volver a Posiciones" link at the top-left of the page  
   **Then** the browser navigates to `/positions`.

6. **Given** the position has no candidates in a given interview step  
   **When** the page finishes loading  
   **Then** the column for that step is still rendered, showing only its header and an empty body.

## Data & API

| Field | Endpoint | Notes |
|-------|----------|-------|
| Interview steps (name, id) | `GET /positions/:id/interviewFlow` | Path: `interviewFlow.interviewFlow.interviewSteps[]`; each step provides `name` and `id` |
| Position name | `GET /positions/:id/interviewFlow` | Path: `interviewFlow.positionName` |
| Candidates list | `GET /positions/:id/candidates` | Fields used: `candidateId`, `fullName`, `averageScore`, `applicationId`, `currentInterviewStep` |

## Test Boundaries

- Error states (network failure, non-2xx responses) are silently swallowed by `console.error`; no user-visible error message is rendered, so error-state UI is out of scope.
- The loading/in-progress state between the two sequential API calls (interview flow fetched first, then candidates) is not stabilised before render; intermediate flickering is out of scope.
- Clicking a candidate card opens a slide-over panel — that behaviour is covered by a separate story.
- Pagination, filtering, and sorting of candidates are not implemented and are out of scope.
- The page does not handle a position `id` that returns no interview steps; that edge case is out of scope.
