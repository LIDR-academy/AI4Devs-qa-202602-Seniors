## [original]

# 01 - Update seed

As a QA
I want to have a method to load the data into the database
So that I can refresh the database each time I am going to run the e2e tests

## Description

At this moment, the `frontend/prisma/seed.ts` file contains the instructions to create all the data into the database. But, if we run twice this script, we will receive errors because it is trying to create the same data more than once.

In this ticket, we want to update the `frontend/prisma/seed.ts` file to remove all the data from the database before adding new data. This way, every time we run the script, we will have a fresh database, ready to be used for testing.

## Command to run the data creation

```bash
cd backend
npx ts-node ./prisma/seed.ts
```

## [enhanced]

# 01 - Update seed

## User Story

As a QA engineer,
I want the database seed process to be idempotent,
so that I can regenerate a clean dataset before every E2E run without manual cleanup or duplicate-key failures.

## Context

Current behavior in `backend/prisma/seed.ts` inserts records with `create` operations only. Re-running the script against a non-empty database causes unique constraint errors (for example, `Candidate.email`, `Company.name`, `Employee.email`) and leaves test setup unstable.

The original ticket references `frontend/prisma/seed.ts`, but the real seed file is `backend/prisma/seed.ts`.

## Functional Scope

Implement a reset-and-seed strategy in the backend seed script:

1. Before inserting fixture data, remove existing data from seeded tables in a safe order (or using a transaction) that respects foreign-key constraints.
2. Recreate the full baseline dataset currently expected by frontend flows and E2E scenarios.
3. Ensure the script can run repeatedly with the same final result and without errors.

## Data/Fields Affected

The seed touches these models and their key constrained fields:

- `Candidate`: `email` (unique)
- `Company`: `name` (unique)
- `Employee`: `email` (unique)
- `Education`: FK `candidateId`
- `WorkExperience`: FK `candidateId`
- `Resume`: FK `candidateId`
- `Position`: FK `companyId`, FK `interviewFlowId`
- `InterviewFlow`
- `InterviewType`
- `InterviewStep`: FK `interviewFlowId`, FK `interviewTypeId`
- `Application`: FK `positionId`, FK `candidateId`, FK `currentInterviewStep`
- `Interview`: FK `applicationId`, FK `interviewStepId`, FK `employeeId`

## API and Endpoint Impact

No REST API contract changes are required for this ticket.

- Changed endpoints: none
- New endpoints: none
- Deprecated endpoints: none

## Technical Implementation Details

### Files to Modify

- `backend/prisma/seed.ts`
- `backend/package.json` (optional but recommended, add script aliases for repeatable execution)
- `README.md` or testing docs (optional but recommended to document the canonical command)

### Expected Seed Flow

1. Initialize Prisma client.
2. Cleanup phase:
   - Delete dependent tables first (`Interview`, `Application`, `Resume`, `WorkExperience`, `Education`, `InterviewStep`, `Position`, `Employee`) and then parent tables (`InterviewType`, `InterviewFlow`, `Candidate`, `Company`),
   - or use a database-safe strategy (single transaction and explicit order).
3. Insert baseline fixtures in deterministic order.
4. Disconnect Prisma client in `finally`.

### Command

Canonical command remains:

```bash
cd backend
npx ts-node ./prisma/seed.ts
```

Recommended npm script aliases:

```json
{
  "scripts": {
    "db:seed": "ts-node ./prisma/seed.ts",
    "db:seed:reset": "ts-node ./prisma/seed.ts"
  }
}
```

## Acceptance Criteria

1. Running `npx ts-node ./prisma/seed.ts` once succeeds with exit code 0.
2. Running it a second time (without manual DB cleanup) also succeeds with exit code 0.
3. After each run, expected baseline records exist for positions, interview flows/steps, candidates, applications, and interviews.
4. No duplicate record errors are thrown on unique fields.
5. Seeded data remains consistent across runs (same business fixtures available for tests).

## Definition of Done

1. Seed script is idempotent and repeatable.
2. Developer/QA can reset test data with a single command.
3. Command usage is documented in project docs or npm scripts.
4. Existing backend tests keep passing.
5. No regressions in E2E preconditions related to seeded data.

## Testing Requirements

### Minimum validation

1. Execute seed script twice in a row.
2. Verify no runtime error on second execution.
3. Verify key entities are present after second run.

### Recommended automated checks

- Add a lightweight integration test or script check that executes seed twice against a test database.
- Ensure this check can be run in CI for stability.

## Non-Functional Requirements

- Safety: avoid accidental use against production-like databases (recommended guard via environment check, e.g. allow only local/test DB names).
- Performance: cleanup + seed should complete in reasonable local time for E2E preparation.
- Reliability: script must always close Prisma connection (`finally`).
- Maintainability: clear cleanup order and comments only where relation ordering is non-obvious.

## Out of Scope

- Changes to frontend behavior.
- API redesign.
- Migration/schema redesign unrelated to seed idempotency.
