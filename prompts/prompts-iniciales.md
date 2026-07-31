# Role

Act as a Senior QA Automation Engineer with strong experience in Cypress, React, TypeScript, REST APIs, and end-to-end testing.

# Objective

Analyze the existing project and prepare the implementation of Cypress E2E tests for the **Position interface**, which represents the hiring process and its candidate stages.

Cypress is mandatory for this exercise. Do not replace it with Playwright or another E2E testing framework.

# Required Test Scenarios

## 1. Position Page Loading

Create E2E tests that verify:

- The position title is displayed correctly.
- A column is displayed for each stage of the hiring process.
- Each candidate card appears in the column corresponding to the candidate’s current stage.

## 2. Moving a Candidate to Another Stage

Create an E2E test that:

- Simulates dragging a candidate card from its current stage column to another stage column.
- Verifies that the candidate card appears in the destination column after the action.
- Verifies that the candidate’s stage is correctly updated in the backend through the expected `PUT /candidate/:id` endpoint.

# Mandatory Initial Analysis

Before proposing a solution or modifying any files, inspect the project and determine:

1. The frontend framework, project structure, and relevant Position page route.
2. Whether Cypress is already installed and configured.
3. Existing testing conventions, scripts, fixtures, commands, and support files.
4. The components involved in:

   - Rendering the position title.
   - Rendering the hiring-stage columns.
   - Rendering candidate cards.
   - Implementing drag-and-drop behaviour.

5. The source of the test data, including position, hiring stages, candidates, applications, fixtures, mocks, or database seeds.
6. The actual backend endpoint used to update a candidate’s stage, including:

   - HTTP method.
   - URL structure.
   - Path parameters.
   - Request body.
   - Expected response.

7. Whether the endpoint specified in the exercise, `PUT /candidate/:id`, matches the endpoint implemented in the project. If it does not match, report the discrepancy and do not silently change either the application or the test.
8. Which stable selectors are currently available. Prefer accessible selectors or existing `data-*` test attributes over fragile CSS classes or DOM-position selectors.
9. Any existing repository instructions or documentation that affect the implementation.

Use the exercise statement and the project’s module documentation as supporting context when they are available, but treat the repository’s actual implementation as the source of truth for its current behaviour.

# Consistency Constraints

- Keep the solution consistent with the existing project architecture, naming conventions, data model, API schema, and coding style.
- Do not invent routes, request bodies, identifiers, test data, selectors, or backend behaviour.
- Do not modify the backend merely to make the E2E tests pass.
- Do not introduce unnecessary dependencies.
- Reuse the project’s existing Cypress configuration and utilities whenever possible.
- Ensure that tests are deterministic and independent.
- Avoid arbitrary fixed waits such as `cy.wait(2000)`. Synchronize with observable UI state or intercepted network requests.
- If drag-and-drop requires a particular event sequence or existing helper, first identify the library or mechanism used by the application.
- Use `cy.intercept()` where appropriate to observe the stage-update request and verify its URL, method, and request payload.
- Verify both the visible UI result and the backend request associated with the stage change.

# Required Workflow

Work in two separate phases.

## Phase 1 — Analysis and Clarification

In your first response:

1. Summarize the relevant findings from the repository.
2. Identify any discrepancies or missing information.
3. Ask only the questions whose answers are necessary to choose the correct implementation.
4. Explain briefly why each question matters.
5. Do not propose the final solution.
6. Do not write test code.
7. Do not install packages or modify files.

If the repository already provides an unambiguous answer, do not ask me to confirm it.

Stop after presenting the findings and clarification questions, and wait for my response.

## Phase 2 — Proposed Solution and Implementation

Only after I answer the clarification questions:

1. Propose a concise implementation plan.
2. Identify the files that would be created or modified.
3. Explain briefly what each change does and why it is required.
4. Wait for my approval before modifying files.
5. After approval, implement the Cypress E2E tests.
6. Run the relevant tests and report the results.
7. Clearly distinguish:

   - Newly introduced failures.
   - Pre-existing failures or warnings.
   - Any scenario that could not be verified and why.

# Expected Test Quality

The final tests should:

- Clearly express the business behaviour being verified.
- Use meaningful `describe()` and `it()` descriptions.
- Avoid unnecessary coupling to implementation details.
- Use stable and maintainable selectors.
- Confirm the initial candidate location before moving the card.
- Confirm the destination column after moving the card.
- Confirm that the expected `PUT` request was sent.
- Validate the relevant request payload rather than checking only that a request occurred.
- Remain consistent with the project’s existing TypeScript or JavaScript setup.

Begin with **Phase 1 only**.

## Exercise description

Implement Cypress end-to-end coverage for the Position hiring-process board. The tests verify the position title, every hiring-stage column, each candidate's initial stage, drag-and-drop between stages, the resulting UI state, and the real backend update request.

## Prerequisites

- Node.js 18 or newer and npm 9 or newer.
- Docker with Docker Compose available.
- Install dependencies in both `backend` and `frontend` with `npm install` or `npm ci`.
- Start PostgreSQL from the repository root:

  ```bash
  docker compose up -d
  ```

- Apply the database migrations and generate the Prisma client from `backend`:

  ```bash
  npx prisma migrate deploy
  npx prisma generate
  ```

- Seed the database from `backend`. In an environment where the repository's `ts-node` version requires transpile-only mode, use PowerShell:

  ```powershell
  $env:TS_NODE_TRANSPILE_ONLY='true'
  node -r ts-node/register prisma/seed.ts
  ```

- Start the backend from `backend`:

  ```bash
  npm run dev
  ```

- Start the frontend from `frontend` in another terminal:

  ```bash
  npm start
  ```

The frontend must be available at `http://localhost:3000` and the backend at `http://localhost:3010`.

## Run Cypress interactively

With the frontend, backend, and seeded database running, open another terminal in `frontend` and execute:

```bash
npx cypress open
```

In the Cypress UI, select E2E Testing, choose a browser, and run `cypress/integration/position.spec.js`.

## Optional headless execution

From `frontend`, execute:

```bash
npm run test:e2e
```

## Endpoint discrepancy

The exercise text specifies `PUT /candidate/:id` (singular). The application actually implements and calls `PUT /candidates/:id` (plural), with the candidate ID as the path parameter and this request body:

```json
{
  "applicationId": 1,
  "currentInterviewStep": 2
}
```

The Cypress test follows the repository implementation and uses `PUT /candidates/:id` for both the tested movement and cleanup. The backend is not changed to reconcile the wording discrepancy.
