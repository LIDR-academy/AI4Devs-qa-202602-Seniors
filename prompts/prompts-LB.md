# Optimized Prompt

---

## Role
You are a Senior QA Automation Engineer specialized in E2E test design for React/TypeScript frontend applications. Your strength is **test case design and specification**: identifying every relevant scenario, sub-case, and edge condition before any code is written.

## Context
The `@frontend` project includes a `Position` view that renders a Kanban-style board: each column represents a phase in the hiring pipeline and each card represents a candidate. Candidates can be moved between phases via drag-and-drop, and each move must be persisted in the backend through `PUT /candidate/:id`.

Two scenarios must be covered by E2E tests:
- **Scenario 1:** Loading the Position page.
- **Scenario 2:** Changing a candidate's phase via drag-and-drop.

## Objective
Produce an **exhaustive catalog of E2E test cases** for the two scenarios described, covering happy paths and corner cases. **Do not write test code.** The deliverable is a structured specification that a QA engineer can later use to implement the tests.

---

## Scope to Cover

### Scenario 1 — Loading the Position Page
Test cases must address:
- The position title is displayed correctly.
- All hiring-phase columns are rendered, in the correct order. Reference phases (must match the actual UI): `Applied | Interview | Technical Test | Offer | Hired | Rejected`.
- Candidate cards appear under the column matching their current phase.
- Empty states (no candidates, empty phases).
- Error states (invalid position ID, backend failure, slow network).
- Edge cases in candidate data (incomplete fields, large number of candidates).

### Scenario 2 — Changing a Candidate's Phase
Test cases must address:
- Successful drag-and-drop of a card from one column to another.
- The card is visually moved to the target column.
- A `PUT /candidate/:id` request is triggered with:
  - The correct `id` in the URL.
  - The new phase in the request body.
  - A successful backend response.
- Invalid drops (same column, outside any column).
- Backend errors and rollback behavior.
- Network failures or timeouts.
- Sequential and consecutive moves.

---

## Expected Output

For **each scenario**, deliver a structured table or list of test cases. Every test case must include:

| Field | Description |
|---|---|
| **ID** | Unique identifier (e.g., `S1-TC01`, `S2-TC05`). |
| **Title** | Short, descriptive name of the test case. |
| **Type** | Happy path / Corner case / Error case. |
| **Preconditions** | State required before the test runs (data, user session, mocks). |
| **Steps** | Numbered actions the test must perform. |
| **Expected Result** | Observable outcome in the UI and/or network layer. |
| **Assertions** | Concrete checks to perform (UI elements, request method/URL/body, response status). |
| **Notes** | Required mocks, fixtures, or implementation considerations (e.g., drag-and-drop library quirks). |

Group the output as follows:
1. **Scenario 1 — Loading the Position Page**
   - Happy path cases
   - Corner / edge cases
   - Error cases
2. **Scenario 2 — Changing a Candidate's Phase**
   - Happy path cases
   - Corner / edge cases
   - Error cases
3. **Cross-cutting considerations** (applicable to both scenarios): test data strategy, network mocking strategy, selector strategy, isolation between tests, drag-and-drop simulation approach.

---

## Constraints
- **Do not write test code** (no Cypress, Playwright, or any framework syntax). Output is specification only.
- Do not invent backend fields, phase names, or endpoints beyond what is described — if something is unclear, flag it as an **open question** at the end of the document.
- Be exhaustive but non-redundant: each test case must cover a distinct behavior.
- Use clear, unambiguous language so that any QA engineer can implement the tests without further clarification.



Implement the tests scenarios described in @docs