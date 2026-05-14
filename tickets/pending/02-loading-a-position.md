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