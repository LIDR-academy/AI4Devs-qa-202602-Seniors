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

Given a recruiter in the `/positions/1` page
When the recruiter drag the candidate "Carlos García" from the "Initial Screening" column and drop ip in the "Manager Interview" column
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