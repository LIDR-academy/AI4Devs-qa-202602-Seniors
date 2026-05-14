## [original]

# 02 - E2E test for "Loading a position kanban board"

As a Senior QA engineer
I want to have an automated e2e test for the funcionality of changing one candidate's stage (`/positions/:id`)
So that we can run this automated test any time we implement a change to ensure the functionality still works

## Description

In this ticket we want to create an automated test using playwright to check that we can drag a drop a user from one stage to another and the candidate is updated properly.

## Database status

When running the e2e tests we assume that the database has the following status:

- There is a position with id=1.
- The position with id=1 has the following title: "Senior Full-Stack Engineer"
- The position with id=1 has three interviews: Initial Screening, Technical Interview, Manager Interview
- We have three candidates in the position with id=1: "Carlos Garcia" with id=3, "Jane Smith" with id=2, and "John Doe" with id=1
- The candidate "Carlos Garcia" is the Interview "Initial Screening"
- The candidates "Jane Smith" and "John Doe" are in the interview "Technical Interview"

To ensure that, we can run the following command:
```bash
cd backend
npx ts-node ./prisma/seed.ts
```

## Selectors

To have a stable way of getting the elements rendered, the implementation includes for each major element a `data-testid` property:
- Title: `data-testid="position-title"`
- Interview columns: `data-testid="phase-column-<interview-name>"`. E.g.: `data-testid="phase-column-initial-screening"`
- Candidates cards: `data-testid="candidate-card-<id>"`. E.g.: `data-testid="candidate-card-2"`

Use this selector when creating the test cases.

## Test cases to implement

Given a recruiter in the `/positions/1` page
When the recruiter drag the candidate "Carlos Garcia" from the "Initial Screening" column and drop ip in the "Manager Interview" column
Then the column "Manager Interview" has now one candidate
And the column "Initial Screening" has no candidates

Given a recruiter in the `/positions/1` page
When the recruiter drag the candidate "Jane Smith" from the "Technical Interview" column and drop ip in the "Manager Interview" column
Then a request to the server `PUT /candidate/2` is sent

Given a recruiter in the `/positions/1` page
And the crecruiter drag the candidate "John Doe" from the "Technical Interview" column and drop ip in the "Manager Interview" column
When the recruiter reload the page
Then the "Manager Interview" column contains one candidate
And the candidate name's is "John Doe"

## Acceptance criteria

- We have updated the test file: `/frontend/tests/e2e/position.spec.ts
- The file contains all the new tests cases and the old ones
- Each test case has a name that clearly identifies what it is testing
- After completing each test case, we are moving back the candidates to the initial stage to have the same stage at the begining of each test case

## [enhanced]

# 03 - E2E test for "Changing candidate stage in kanban board"

## Detail Assessment

The original story is **not fully detailed** for autonomous implementation. It has endpoint inaccuracies, unclear data-reset strategy between tests, and incomplete payload/field expectations for persistence.

## User Story

As a QA engineer,
I want automated Playwright coverage for drag-and-drop stage changes in `/positions/:id`,
so that we can validate UI behavior and backend persistence after board interactions.

## Context

The kanban board is implemented in `frontend/src/components/PositionDetails.js` with `react-beautiful-dnd`.

Current runtime flow:
- Board metadata: `GET /positions/:id/interviewFlow`
- Board candidates: `GET /positions/:id/candidates`
- Stage update on drop: `PUT /candidates/:candidateId`

The frontend sends this payload in the PUT request:

```json
{
  "applicationId": 4,
  "currentInterviewStep": 3
}
```

Persistence target in backend:
- Model/table: `Application`
- Updated field: `currentInterviewStep`

## Seeded Data Contract (must exist before test execution)

Use:

```bash
cd backend
npx ts-node ./prisma/seed.ts
```

Expected deterministic records for position `id=1`:
- Title: `Senior Full-Stack Engineer`
- Steps:
  - `Initial Screening` (stepId: `1`)
  - `Technical Interview` (stepId: `2`)
  - `Manager Interview` (stepId: `3`)
- Candidates in board:
  - `candidateId=3` Carlos Garcia, `applicationId=4`, current step `1`
  - `candidateId=2` Jane Smith, `applicationId=3`, current step `2`
  - `candidateId=1` John Doe, `applicationId=1`, current step `2`

## Functional Scope

Implement drag-and-drop E2E tests in the existing spec file to verify:
1. Candidate card moves from source column to destination column in UI after drop.
2. Correct backend request is sent (`PUT /candidates/:id`).
3. Change persists after page reload.
4. Existing board-loading tests remain in the file and continue passing.

## Selectors to Use (stable, mandatory)

- `data-testid="position-title"`
- `data-testid="phase-column-initial-screening"`
- `data-testid="phase-column-technical-interview"`
- `data-testid="phase-column-manager-interview"`
- `data-testid="candidate-card-1"`
- `data-testid="candidate-card-2"`
- `data-testid="candidate-card-3"`

Avoid brittle text-only locators for card placement assertions.

## Endpoints and Payloads

### Read endpoints
- `GET http://localhost:3010/positions/1/interviewFlow`
- `GET http://localhost:3010/positions/1/candidates`

### Write endpoint
- `PUT http://localhost:3010/candidates/:candidateId`

Required request-body fields:
- `applicationId` (number)
- `currentInterviewStep` (number)

## Test Cases to Implement

### Case 1: Move Carlos from Initial Screening to Manager Interview
Given recruiter opens `/positions/1`
When candidate `candidate-card-3` is dragged from `phase-column-initial-screening` to `phase-column-manager-interview`
Then `phase-column-initial-screening` has 0 candidate cards
And `phase-column-manager-interview` contains `candidate-card-3`

### Case 2: Validate update request contract during drag-and-drop
Given recruiter opens `/positions/1`
When `candidate-card-2` is dragged from Technical to Manager
Then one request `PUT /candidates/2` is emitted
And JSON body equals:

```json
{
  "applicationId": 3,
  "currentInterviewStep": 3
}
```

### Case 3: Persistence after reload
Given recruiter opens `/positions/1`
When `candidate-card-1` is dragged from Technical to Manager
And recruiter reloads page
Then `phase-column-manager-interview` contains `candidate-card-1`
And that card includes candidate name `John Doe`

## Test Isolation Strategy (mandatory)

To keep each test independent and repeatable, implement one of these strategies:
1. Preferred: reset board state in `afterEach` by sending PUT calls to restore seeded steps:
   - `candidate 1 -> step 2` with `applicationId=1`
   - `candidate 2 -> step 2` with `applicationId=3`
   - `candidate 3 -> step 1` with `applicationId=4`
2. Alternative: reseed database before each test (heavier runtime).

The chosen strategy must guarantee no test depends on order or leftovers from previous tests.

## Files to Modify

- `frontend/tests/e2e/position.spec.ts`

No production runtime code changes are required for this ticket.

## Execution Commands

```bash
cd backend
npx ts-node ./prisma/seed.ts
```

```bash
cd frontend
npx playwright test tests/e2e/position.spec.ts
```

## Acceptance Criteria

1. `frontend/tests/e2e/position.spec.ts` includes existing board-loading tests plus new stage-change tests.
2. Stage-change tests validate UI movement, request contract, and persistence after reload.
3. Tests use the existing `data-testid` selectors for columns and cards.
4. Tests are deterministic and isolated (state reset or reseed strategy implemented).
5. The spec passes consistently against the seeded dataset without manual DB cleanup between test cases.

## Definition of Done

1. Drag-and-drop behavior for `/positions/1` is covered by automated E2E tests.
2. Backend update request contract is asserted in at least one test.
3. Persistence after reload is covered.
4. Existing position-board E2E coverage remains valid.
5. The test suite can run from command line with documented commands.

## Non-Functional Requirements

- Reliability: no flaky assertions based on arbitrary waits; rely on explicit locator assertions and/or request waits.
- Maintainability: clear test names and reusable helpers for drag operation and board reset.
- Performance: keep runtime reasonable; avoid full reseed per test unless required.
- Security: tests must only target local/test environments (`localhost:3000` frontend and `localhost:3010` backend).

## Documentation Impact

No mandatory documentation file update is required if execution commands remain unchanged.
If command or setup conventions are modified, update `docs/testing/end-to-end-testing-guidelines.md` accordingly.

## Out of Scope

- Modifying kanban UI components.
- Changing backend API contracts.
- Adding new production `data-testid` attributes.
- Covering unrelated candidate detail workflows.
