## [original]

# 02 - E2E test for "Loading a position kanban board"

As a Senior QA engineer
I want to have an automated e2e test for the funcionality of loading the kanban board for a position (`/positions/:id`)
So that we can run this automated test any time we implement a change to ensure the functionality still works

## Description

In this ticket we want to create an automated test using playwright to check that we can load the kanban board associated to a position.

## Database status

When running the e2e tests we assume that the database has the following status:

- There is a position with id=1.
- The position with id=1 has the following title: "Senior Full-Stack Engineer"
- The position with id=1 has three interviews: Initial Screening, Technical Interview, Manager Interview
- We have three candidates in the position with id=1: "Carlos García" with id=3, "Jane Smith" with id=2, and "John Doe" with id=1
- The candidate "Carlos García" is the Interview "Initial Screening"
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

Given a recruiter
When the recruiter loads the page `/positions/1`
Then the page shows the title "Senior Full-Stack Engineer"

Given a recruiter
When the recruiter load the page `/positions/1`
Then the page has three columns
And the first column has a header with value "Initial Screening"
And the second column has a header with value "Technical Interview"
And the third column has a heared with value "Manager Interview"

Given a recruiter
When the recruiter load the page `/positions/1`
Then the column "Initial Screening" has one candidate
And the candidate's name is "Carlos García"

Given a recruiter
When the recruiter load the page `/positions/1`
Then the column "Technical Interview" hast two candidates
And the first candidate's name is "Jane Smith"
And the second candidate's name is "John Doe"

Given a recruiter
When the recruiter load the page `/positions/1`
Then the column "Manager Interview" has no candidates

## Acceptance criteria

- We have created a new test file: `/frontend/tests/e2e/position.spec.ts
- The file contains all the tests cases
- Each test case has a name that clearly identifies what it is testing

## [enhanced]

# 02 - E2E test for "Loading a position kanban board"

## User Story

As a QA engineer,
I want an automated Playwright test for the position kanban board at `/positions/:id`,
so that we can verify the board loads correctly against the seeded dataset after every UI change.

## Context

The position details screen is implemented in `frontend/src/components/PositionDetails.js`. It loads the board by calling the backend endpoints:

- `GET /positions/:id/interviewflow`
- `GET /positions/:id/candidates`

The test must run against the deterministic dataset produced by `backend/prisma/seed.ts`.

For this story, the seeded database must contain:

- Position `id=1` with title `Senior Full-Stack Engineer`
- Three interview steps for that position:
  - Initial Screening
  - Technical Interview
  - Manager Interview
- Three candidates assigned to position `id=1`:
  - `Carlos García` with `id=3` in `Initial Screening`
  - `Jane Smith` with `id=2` in `Technical Interview`
  - `John Doe` with `id=1` in `Technical Interview`
- No candidates in `Manager Interview`

## Functional Scope

Create one end-to-end spec that verifies the page renders the kanban board correctly when a recruiter opens `/positions/1`.

The test should validate only loading and rendering behavior. It does not need to test drag-and-drop or stage updates.

## Selectors and Assertions

Use the existing stable test IDs already present in the UI:

- `data-testid="position-title"`
- `data-testid="phase-column-initial-screening"`
- `data-testid="phase-column-technical-interview"`
- `data-testid="phase-column-manager-interview"`
- `data-testid="candidate-card-1"`
- `data-testid="candidate-card-2"`
- `data-testid="candidate-card-3"`

Assert both structure and content:

1. The page title renders `Senior Full-Stack Engineer`.
2. Exactly three interview columns are visible.
3. The column headers match the seeded interview step names.
4. `Initial Screening` contains only Carlos García.
5. `Technical Interview` contains Jane Smith and John Doe in that order.
6. `Manager Interview` is empty.

## Files to Modify

- `frontend/tests/e2e/position.spec.ts`

No application code changes are expected for this ticket because the route, API calls, and `data-testid` hooks already exist.

## Test Data and Environment Requirements

Before running the spec, the database must be seeded with:

```bash
cd backend
npx ts-node ./prisma/seed.ts
```

Then run the Playwright test from the frontend app:

```bash
cd frontend
npx playwright test tests/e2e/position.spec.ts
```

## Acceptance Criteria

1. The new spec file exists at `frontend/tests/e2e/position.spec.ts`.
2. The spec contains one or more test cases with clear, descriptive names.
3. The test covers the page title, the three interview columns, and the candidate distribution across the board.
4. The test passes using the seeded dataset without manual UI interaction.
5. The test is stable and uses the existing `data-testid` selectors instead of brittle text-only locators.

## Definition of Done

1. The E2E coverage for `/positions/:id` exists and is repeatable.
2. The test can be run independently with Playwright.
3. The story is documented with the expected seeded state and exact selectors.
4. No backend or frontend runtime behavior is changed by this task.

## Non-Functional Requirements

- Determinism: the test must rely on the fixed seeded IDs and data names only.
- Maintainability: keep locators stable and aligned with existing `data-testid` attributes.
- Reliability: avoid assertions that depend on timing beyond the normal page load.
- Scope control: do not expand the test to cover drag-and-drop or unrelated screens.

## Out of Scope

- Modifying the board UI.
- Changing API contracts.
- Testing drag-and-drop interactions.
- Adding new selector attributes to production code.