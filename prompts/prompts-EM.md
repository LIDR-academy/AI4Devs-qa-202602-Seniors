# Prompts — Session 11 QA (Elvis Marques)

## Prompt 1 — Generate E2E User Stories from Source Code

**Purpose:** Analyse real application source code and produce Gherkin-style user stories for E2E testing, grounded strictly in observed behaviour.

**System role:**
```
You are an expert QA analyst and technical writer specialising in writing
user stories for E2E testing purposes.
```

**Prompt:**
```
Scan the following files in the codebase and read them carefully:

- frontend/src/components/PositionDetails.js
- frontend/src/components/StageColumn.js
- frontend/src/components/CandidateCard.js
- frontend/src/App.js

Your task is to produce two user stories that describe the OBSERVABLE
behaviour of the application from an end user's perspective — exactly as
it works today, not as it should ideally work.

## Important constraints

- Base EVERY acceptance criterion strictly on what the code actually does.
  Do not invent behaviour that is not in the code.
- Write for an E2E tester, not a developer. No references to internal
  implementation details (no component names, no service layers, no TypeScript
  interfaces, no file paths).
- Acceptance criteria must be written in Gherkin-style:
  Given / When / Then format.
- Do NOT include: Definition of Done, Documentation Updates, Non-Functional
  Requirements, or Open Questions sections.
- Keep each story focused and concise.

## Stories to produce

### Story 1 — View Candidate Pipeline as Kanban Board
Persona: recruiter
Page: /positions/:id
Covers: page load, column rendering, candidate card display, back navigation.

### Story 2 — Move Candidate to a Different Interview Stage
Persona: recruiter
Page: /positions/:id
Covers: drag a candidate card from one column to another, optimistic UI
update, same-column drop behaviour, drop outside any column behaviour.

## Output format for each story

Use this exact structure:

# US-XX — [Title]

> As a [persona], I want [goal] so that [reason].

## Acceptance Criteria

1. **Given** ... **When** ... **Then** ...
2. ...

## Data & API

| Field | Endpoint | Notes |
|-------|----------|-------|

## Test Boundaries
What is explicitly OUT OF SCOPE for these tests (known gaps / untested
behaviour) — one bullet per item.

## Output location

Write each story as a separate Markdown file inside frontend/ai-specs/changes/:
- frontend/ai-specs/changes/us-kanban-view.md
- frontend/ai-specs/changes/us-kanban-drag-drop.md
```

## Prompt 2 — Generate E2E Test Scenarios from User Stories

**Meta prompt for us-01**

As an expert prompt engineer, give me the best prompt to create E2E test cases for story us-kanban-view. Take into account the following specifications that must be tested:

"Create a test to validate that the position screen loads correctly. The test should verify:

That the position title is displayed correctly.

That the columns corresponding to each stage of the hiring process are displayed.

That the candidate cards are displayed in the correct column according to their current stage.

Examples of possible stages:

Applied Interview Technical Test Offer Hired Rejected

The exact stages must match those implemented in the interface."

Ask me the questions you need

---

**Meta prompt for us-02**

Now, generate a prompt for the second story @frontend/ai-specs/changes/us-02-kanban-drag-drop.md ? Take into account the following specifications

"Create a test that simulates moving a candidate from one phase to another. The test should verify:

That a candidate card can be dragged from one column to another.

That the candidate card appears visually in the new column.

That the candidate's phase is correctly updated in the backend using the endpoint:

PUT /candidate/:id

The test should validate that when moving the candidate:

A PUT request is fired.

The candidate ID corresponds to the moved candidate.

The request body contains the new phase.

The backend response is successful."

---

## Prompt 3 — Generate Structured Test Cases Document from User Story US-01 + Source Code

You are a senior QA engineer specializing in E2E testing with Playwright.

## Your task
Generate a structured test cases document in Markdown for the user story @frontend/ai-specs/changes/us-01-kanban-drag-drop.md .

Read the following files before doing anything else:
- `frontend/ai-specs/changes/us-01-kanban-view.md` — the full user story, acceptance criteria, API contract, and test boundaries
- `frontend/src/components/PositionDetails.js` — the main React component for the kanban board
- `frontend/src/components/StageColumn.js` — renders individual stage columns
- `frontend/src/components/CandidateCard.js` — renders individual candidate cards
- `frontend/playwright.config.ts` — current Playwright configuration

Read all five files completely before writing anything. Use what you find to inform
selector choices and to identify any `data-testid` attributes already present or
missing.

---

## Test strategy

- **Happy path / core business logic**: use a REAL backend. Navigate to a live
  `/positions/:id` URL and assert structural correctness (title exists, columns
  exist, cards exist in some column). Do NOT hard-code expected values.

- **Edge cases**: use `page.route()` to intercept the two GET endpoints and return
  controlled fixture JSON. Include full fixture JSON payloads inline in the document.

- **No third-party API mocking needed** for this story.

---

## Specific requirement from stakeholder
Validate that the position screen loads correctly, verifying:
- The position title is displayed correctly
- The columns for each hiring stage are displayed in the exact order the interface renders them
- Candidate cards appear in the correct column matching their current stage

---

## Happy path test cases
Cover all 6 acceptance criteria from `us-01-kanban-view.md` using the real backend.
Each acceptance criterion must map to at least one test case.

## Edge cases to cover (use page.route() mocks for all of these)
- A stage column with zero candidates still renders with its header visible
- A candidate with averageScore of 0 shows no score icons
- A candidate with averageScore of 5 shows exactly 5 score icons
- A candidate whose currentInterviewStep does not match any column name
  is not rendered anywhere on the board

---

## Output format

Produce a Markdown file saved to `frontend/ai-specs/test-cases/us-01-kanban-view-tc.md` with this structure:

1. **Header** — title, US-01 reference, date, author placeholder
2. **Test Strategy Summary** — 2–3 sentences on the hybrid approach for this story
3. **Fixture Data** — two named fixtures as fenced JSON blocks:
   - `fixture-interview-flow.json`: mock for GET /positions/1/interviewFlow with
     positionName and all real stage names in the order the interface uses them,
     each with a unique numeric id
   - `fixture-candidates.json`: mock for GET /positions/1/candidates with at least
     5 candidates distributed across stages; include one with averageScore 0, one
     with score 3, one with score 5; leave at least one stage empty
4. **Test Cases Table** with columns:
   `| ID | Title | Type (real/mock) | Preconditions | Steps | Expected Result | AC Ref |`
   - IDs follow pattern TC-US01-01, TC-US01-02, …
   - Cover all 6 acceptance criteria from the user story (happy path, real backend)
   - Cover all 4 edge cases listed above (mocked)
   - Minimum 10 test cases total
5. **Selector Strategy** — list recommended Playwright selectors for each key
   element (position title, column headers, candidate cards, score icons, back link),
   based on what you actually find in the component files; flag any missing
   `data-testid` attributes that need to be added

Do NOT write any Playwright test code yet. Output ONLY the document.


## Prompt 4 — Generate Structured Test Cases Document from User Story US-02 + Source Code

You are a senior QA engineer specializing in E2E testing with Playwright.

## Your task
Generate a structured test cases document in Markdown for the drag-and-drop user story @frontend/ai-specs/changes/us-02-kanban-drag-drop.md . 

Read the following files before doing anything else:
- `frontend/ai-specs/changes/us-02-kanban-drag-drop.md` — the full user story, acceptance criteria, API contract, and test boundaries
- `frontend/src/components/PositionDetails.js` — the main React component; contains the DragDropContext and overall board structure
- `frontend/src/components/StageColumn.js` — renders individual stage columns; contains the Droppable wrapper
- `frontend/src/components/CandidateCard.js` — renders individual candidate cards; contains the Draggable wrapper
- `frontend/playwright.config.ts` — current Playwright configuration

Read all five files completely before writing anything. Pay special attention to:
- How `droppableId` is assigned to each column (used to identify source and destination)
- How `draggableId` is assigned to each card (used to identify the moved candidate)
- Which fields are sent in the PUT request body (`applicationId`, `currentInterviewStep`)
- What `currentInterviewStep` represents (the numeric `id` of the stage, NOT its name)

---

## Test strategy

- **Happy path (drag to a different column)**: use a REAL backend. Set up the board
  with a live `/positions/:id` page, perform the drag, and assert both the visual
  outcome and the intercepted PUT request payload. Use `page.route()` only to
  intercept and inspect the PUT request — do NOT mock its response; let it reach
  the real backend.

- **Edge cases**: use `page.route()` to fully mock both GET endpoints
  (interviewFlow and candidates) so the board state is fully controlled, then
  assert the specific boundary condition. For the failed-API edge case, also mock
  the PUT response to return a non-2xx status.

- **No third-party API mocking needed** for this story beyond what is described above.

---

## Specific requirement from stakeholder
Validate that moving a candidate between phases works correctly, verifying:
- A candidate card can be dragged from one column to another
- The candidate card appears visually in the new column after the drop
- A PUT request is fired to `/candidates/:id`
- The candidate ID in the URL matches the moved candidate
- The request body contains the correct new phase (`currentInterviewStep` as the numeric stage id)
- The backend response is successful (2xx)

---

## Happy path test cases
Cover all 5 acceptance criteria from the user story. Each acceptance criterion must
map to at least one test case. Note that AC #2 (PUT request fired with correct payload)
is the core of the stakeholder requirement — give it thorough coverage.

## Edge cases to cover (use page.route() mocks for board setup)
- Drop outside any valid column: card returns to its original column and NO PUT request is fired
- Drop into the same column the card started in: card repositions and a PUT request IS still fired with the same stage id
- API call fails (mock PUT to return 500): card remains in the destination column — UI is NOT rolled back
- PUT request body contains `applicationId` as a number (not a string) and `currentInterviewStep` as the numeric stage id (not the stage name)

---

## A note on drag-and-drop simulation in Playwright
`react-beautiful-dnd` does not respond reliably to Playwright's default
`dragAndDrop()` method. In the Selector Strategy section, recommend the most
reliable simulation approach for this library (e.g. dispatching a sequence of
`pointerdown`, `pointermove`, `pointerup` events, or using the keyboard-based
drag API that react-beautiful-dnd supports natively). Flag this as a known
implementation risk that must be resolved when writing the Playwright spec.

---

## Output format

Produce a Markdown file saved to `frontend/ai-specs/test-cases/us-02-kanban-drag-drop-tc.md` with this structure:

1. **Header** — title, US-02 reference, date, author placeholder
2. **Test Strategy Summary** — 2–3 sentences on the hybrid approach for this story,
   including the specific role of `page.route()` for intercepting vs. fully mocking
3. **Fixture Data** — two named fixtures as fenced JSON blocks for edge case tests:
   - `fixture-interview-flow.json`: mock for GET /positions/1/interviewFlow with
     positionName and all real stage names in the order the interface uses them,
     each with a unique numeric id
   - `fixture-candidates.json`: mock for GET /positions/1/candidates with at least
     4 candidates; distribute them so at least 2 candidates share one column
     (to enable same-column drop test) and at least one column is empty
4. **Test Cases Table** with columns:
   `| ID | Title | Type (real/mock) | Preconditions | Steps | Expected Result | AC Ref |`
   - IDs follow pattern TC-US02-01, TC-US02-02, …
   - Cover all 5 acceptance criteria from the user story (happy path)
   - Cover all 4 edge cases listed above (mocked)
   - Minimum 9 test cases total
5. **Selector Strategy** — list recommended Playwright selectors for each key
   element (draggable cards, droppable columns, drag handles if present), based on
   what you actually find in the component files; flag any missing `data-testid`
   attributes; include the recommended drag simulation approach for
   `react-beautiful-dnd` and flag it as an implementation risk

Do NOT write any Playwright test code yet. Output ONLY the document.

---

## Prompt 5 — Generate Playwright Test Code for US-01

You are a senior QA engineer specializing in E2E testing with Playwright.

## Your task
Generate the Playwright E2E test file for us-01 based on the test cases document
that has already been reviewed and approved.

Read the following files completely before writing anything:
- `frontend/ai-specs/test-cases/us-01-kanban-view-tc.md` — the approved test cases,
  fixture data, selector strategy, and missing data-testid action items
- `frontend/ai-specs/changes/us-01-kanban-view.md` — the original user story and
  acceptance criteria
- `frontend/src/components/PositionDetails.js` — to confirm current markup and class names
- `frontend/src/components/StageColumn.js` — to confirm column structure
- `frontend/src/components/CandidateCard.js` — to confirm card structure and score icon implementation
- `frontend/playwright.config.ts` — to align baseURL and timeout settings

---

## Before writing the test file

**Step 1 — Add missing data-testid attributes**
The test cases document lists 5 missing `data-testid` attributes. Add them to the
React components first, then write the tests against those stable selectors:

| Element | File | data-testid to add |
|---|---|---|
| Position title `<h2>` | `PositionDetails.js:113` | `position-title` |
| Back link `<Button>` | `PositionDetails.js:110` | `back-to-positions` |
| Stage column `<Card>` | `StageColumn.js:10` | `stage-column` |
| Stage column `<Card.Header>` | `StageColumn.js:11` | `stage-header` |
| Candidate card `<Card>` | `CandidateCard.js:8` | `candidate-card` |

Do NOT rename or remove any existing attributes, classes, or props on these components.

**Step 2 — Write the Playwright spec**
After adding the data-testids, generate the test file at
`frontend/tests/us01-kanban-view.spec.ts`.

---

## Test file requirements

### Structure
- One top-level `describe('US-01 — View Candidate Pipeline as Kanban Board', ...)` block
- Two nested `describe` blocks inside:
  - `describe('Happy Path — real backend', ...)` — TC-US01-01 through TC-US01-06
  - `describe('Edge Cases — mocked API', ...)` — TC-US01-07 through TC-US01-12
- Each test case from the document maps to exactly one `test(...)` block, using
  the TC ID as a prefix in the test name (e.g. `'TC-US01-01 — Position title is displayed as a centred heading'`)

### Fixture data
Use the exact JSON fixtures defined in `us-01-kanban-view-tc.md`. Define them as
TypeScript constants at the top of the file (not imported from external files).

### Selectors
Use `data-testid` selectors as the primary strategy (after you add them in Step 1):
- `page.getByTestId('position-title')`
- `page.getByTestId('back-to-positions')`
- `page.getByTestId('stage-column')`
- `page.getByTestId('stage-header')`
- `page.getByTestId('candidate-card')`
- `candidateCard.locator('span[role="img"][aria-label="rating"]')` for score icons

Fall back to semantic selectors (`getByRole`, `getByText`) only when data-testid
is not available.

### API mocking
For all edge case tests, intercept both GET endpoints before navigating:
```typescript
await page.route('**/positions/1/interviewFlow', route =>
  route.fulfill({ json: fixtureInterviewFlow }));
await page.route('**/positions/1/candidates', route =>
  route.fulfill({ json: fixtureCandidates }));
```

---

## Prompt 6 — Generate Playwright Test Code for US-02.

You are a senior QA engineer specializing in E2E testing with Playwright.

## Your task
Generate the Playwright E2E test file for us-02 based on the test cases document
that has already been reviewed and approved.

Read the following files completely before writing anything:
- `frontend/ai-specs/test-cases/us-02-kanban-drag-drop-tc.md` — the approved test cases,
  fixture data, selector strategy, and missing data-testid action items
- `frontend/ai-specs/changes/us-02-kanban-drag-drop.md` — the original user story and
  acceptance criteria
- `frontend/src/components/PositionDetails.js` — to confirm current markup and class names
- `frontend/src/components/StageColumn.js` — to confirm column structure
- `frontend/src/components/CandidateCard.js` — to confirm card structure and score icon implementation
- `frontend/playwright.config.ts` — to align baseURL and timeout settings

---

## Before writing the test file

**Step 1 — Add missing data-testid attributes**
The test cases document lists 5 missing `data-testid` attributes. Add them to the
React components first, then write the tests against those stable selectors:

| Element | File | data-testid to add |
|---|---|---|
| Position title `<h2>` | `PositionDetails.js:113` | `position-title` |
| Back link `<Button>` | `PositionDetails.js:110` | `back-to-positions` |
| Stage column `<Card>` | `StageColumn.js:10` | `stage-column` |
| Stage column `<Card.Header>` | `StageColumn.js:11` | `stage-header` |
| Candidate card `<Card>` | `CandidateCard.js:8` | `candidate-card` |

Do NOT rename or remove any existing attributes, classes, or props on these components.

**Step 2 — Write the Playwright spec**
After adding the data-testids, generate the test file at
`frontend/tests/us02-kanban-drag-drop.spec.ts`.

---

## Test file requirements

### Structure
- One top-level `describe('US-02 — Move Candidate to a Different Interview Stage', ...)` block
- Two nested `describe` blocks inside:
  - `describe('Happy Path — real backend', ...)` — TC-US02-01 through TC-US02-05
  - `describe('Edge Cases — mocked API', ...)` — TC-US02-06 through TC-US02-09
- Each test case from the document maps to exactly one `test(...)` block, using
  the TC ID as a prefix in the test name (e.g. `'TC-US02-01 — Candidate card can be dragged to a different column'`)

### Fixture data
Use the exact JSON fixtures defined in `us-02-kanban-drag-drop-tc.md`. Define them as
TypeScript constants at the top of the file (not imported from external files).

### Selectors
Use `data-testid` selectors as the primary strategy (after you add them in Step 1):
- `page.getByTestId('position-title')`
- `page.getByTestId('back-to-positions')`
- `page.getByTestId('stage-column')`
- `page.getByTestId('stage-header')`
- `page.getByTestId('candidate-card')`
- `candidateCard.locator('span[role="img"][aria-label="rating"]')` for score icons

Fall back to semantic selectors (`getByRole`, `getByText`) only when data-testid
is not available.

### API mocking
For all edge case tests, intercept both GET endpoints before navigating:
```typescript
await page.route('**/positions/1/interviewFlow', route =>
  route.fulfill({ json: fixtureInterviewFlow }));
await page.route('**/positions/1/candidates', route =>
  route.fulfill({ json: fixtureCandidates }));
```

---

## Prompt 7 — Running the tests

I have E2E tests created in tests folder. Please, as an expert Senior QA Engineer specialized in E2E testing with Playwright, guide me on how to execute the tests. If possible, I want Claude to monitorize the execution so can capture any issue and then we can analyse it.

---

## Prompt 8 — Analyse US-01 test run output

This is the output for Option A:

  ✓   1 [chromium] › tests/us01-kanban-view.spec.ts:78:9 › US-01 — View Candidate Pipeline as Kanban Board › Happy Path — real backend › TC-US01-02 — Stage columns are rendered in API order with correct headers (557ms)
  ✓   2 [chromium] › tests/us01-kanban-view.spec.ts:123:9 › US-01 — View Candidate Pipeline as Kanban Board › Happy Path — real backend › TC-US01-04 — Candidate card shows full name and correct number of score icons (612ms)
  ✓   3 [chromium] › tests/us01-kanban-view.spec.ts:98:9 › US-01 — View Candidate Pipeline as Kanban Board › Happy Path — real backend › TC-US01-03 — Each candidate card appears in the column matching their current interview step (602ms)
  ✓   4 [chromium] › tests/us01-kanban-view.spec.ts:69:9 › US-01 — View Candidate Pipeline as Kanban Board › Happy Path — real backend › TC-US01-01 — Position title is displayed as a centred heading (539ms)
  ✓   5 [chromium] › tests/us01-kanban-view.spec.ts:152:9 › US-01 — View Candidate Pipeline as Kanban Board › Happy Path — real backend › TC-US01-05 — "Volver a Posiciones" link navigates to /positions (554ms)
  ✓   6 [chromium] › tests/us01-kanban-view.spec.ts:158:9 › US-01 — View Candidate Pipeline as Kanban Board › Happy Path — real backend › TC-US01-06 — Empty stage column still renders with its header visible (555ms)
  ✓   7 [chromium] › tests/us01-kanban-view.spec.ts:185:9 › US-01 — View Candidate Pipeline as Kanban Board › Edge Cases — mocked API › TC-US01-07 — Empty stage column renders header when all stages have zero candidates (mock) (411ms)
  ✓   8 [chromium] › tests/us01-kanban-view.spec.ts:206:9 › US-01 — View Candidate Pipeline as Kanban Board › Edge Cases — mocked API › TC-US01-08 — Candidate with averageScore of 0 shows no score icons (425ms)
  ✓   9 [chromium] › tests/us01-kanban-view.spec.ts:228:9 › US-01 — View Candidate Pipeline as Kanban Board › Edge Cases — mocked API › TC-US01-09 — Candidate with averageScore of 5 shows exactly 5 score icons (393ms)
  ✓  10 [chromium] › tests/us01-kanban-view.spec.ts:250:9 › US-01 — View Candidate Pipeline as Kanban Board › Edge Cases — mocked API › TC-US01-10 — Candidate with unmatched currentInterviewStep does not appear on the board (375ms)
  ✓  11 [chromium] › tests/us01-kanban-view.spec.ts:267:9 › US-01 — View Candidate Pipeline as Kanban Board › Edge Cases — mocked API › TC-US01-11 — Stage columns appear in the exact order defined by the API (343ms)
  ✓  12 [chromium] › tests/us01-kanban-view.spec.ts:286:9 › US-01 — View Candidate Pipeline as Kanban Board › Edge Cases — mocked API › TC-US01-12 — Position name from API is reflected in the page heading (329ms)

  12 passed (5.2s)

---

## Prompt 9 — Fix ReferenceError in US-02 test file

running us-02 I have the following output

ReferenceError: describe is not defined

   at us02-kanban-drag-drop.spec.ts:103

  101 |
  102 | // ===========================================================================
> 103 | describe('US-02 — Move Candidate to a Different Interview Stage', () => {
      | ^
  104 |   // =========================================================================
  105 |   describe('Happy Path — real backend', () => {
  106 |     // Each test navigates to a real running instance. The position used must

Error: No tests found.

---

## Prompt 10 — Analyse US-02 test run output and fix TC-US02-05 failure

OK, lets continue with the tests. Running the tests for us-02 this is the output:

Running 9 tests using 4 workers

  ✓  1 [chromium] › tests/us02-kanban-drag-drop.spec.ts:111:9 › US-02 — Move Candidate to a Different Interview Stage › Happy Path — real backend › TC-US02-01 — Candidate card can be dragged to a different column (765ms)
  ✓  2 [chromium] › tests/us02-kanban-drag-drop.spec.ts:189:9 › US-02 — Move Candidate to a Different Interview Stage › Happy Path — real backend › TC-US02-04 — PUT body contains applicationId as a number (not a string) (758ms)
  ✓  3 [chromium] › tests/us02-kanban-drag-drop.spec.ts:157:9 › US-02 — Move Candidate to a Different Interview Stage › Happy Path — real backend › TC-US02-03 — PUT body contains correct currentInterviewStep (numeric stage id) (770ms)
  ✓  4 [chromium] › tests/us02-kanban-drag-drop.spec.ts:131:9 › US-02 — Move Candidate to a Different Interview Stage › Happy Path — real backend › TC-US02-02 — PUT request is fired to the correct candidate URL after drop (758ms)
  ✘  5 [chromium] › tests/us02-kanban-drag-drop.spec.ts:213:9 › US-02 — Move Candidate to a Different Interview Stage › Happy Path — real backend › TC-US02-05 — Backend returns 2xx after a successful drag-and-drop (30.0s)
  ✓  6 [chromium] › tests/us02-kanban-drag-drop.spec.ts:243:9 › US-02 — Move Candidate to a Different Interview Stage › Edge Cases — mocked API › TC-US02-06 — Dropping card into the same column fires a PUT with the same stage id (1.4s)
  ✓  7 … tests/us02-kanban-drag-drop.spec.ts:270:9 › US-02 — Move Candidate to a Different Interview Stage › Edge Cases — mocked API › TC-US02-07 — Dropping card outside any column returns it to original position with no PUT fired (1.4s)
  ✓  8 [chromium] › tests/us02-kanban-drag-drop.spec.ts:300:9 › US-02 — Move Candidate to a Different Interview Stage › Edge Cases — mocked API › TC-US02-08 — UI is NOT rolled back when PUT returns 500 (934ms)
  ✓  9 [chromium] › tests/us02-kanban-drag-drop.spec.ts:329:9 › US-02 — Move Candidate to a Different Interview Stage › Edge Cases — mocked API › TC-US02-09 — PUT body currentInterviewStep is the numeric stage id, not the stage name (836ms)

  1 failed
  [chromium] › tests/us02-kanban-drag-drop.spec.ts:213:9 › TC-US02-05 — Backend returns 2xx after a successful drag-and-drop

    Test timeout of 30000ms exceeded.
    Error: page.waitForResponse: Test timeout of 30000ms exceeded.
    Error: locator.focus: Test timeout of 30000ms exceeded.

  8 passed (31.9s)

---

## Prompt 12 — Analyse US-02 test run output after DB seeding and beforeEach reset

running the tests, this is the output. We still have two tests failing

Remember, do not adapt the tests to the data... Instead, give the analysis so the test really verify the real functionality and behaviour

  ✓  1 [chromium] › tests/us02-kanban-drag-drop.spec.ts:112:9 › US-02 — Move Candidate to a Different Interview Stage › Happy Path — real backend › TC-US02-01 — Candidate card can be dragged to a different column (781ms)
  ✓  2 [chromium] › tests/us02-kanban-drag-drop.spec.ts:127:9 › US-02 — Move Candidate to a Different Interview Stage › Happy Path — real backend › TC-US02-02 — PUT request is fired to the correct candidate URL after drop (775ms)
  ✓  3 [chromium] › tests/us02-kanban-drag-drop.spec.ts:176:9 › US-02 — Move Candidate to a Different Interview Stage › Happy Path — real backend › TC-US02-04 — PUT body contains applicationId as a number (not a string) (781ms)
  ✘  4 [chromium] › tests/us02-kanban-drag-drop.spec.ts:148:9 › US-02 — Move Candidate to a Different Interview Stage › Happy Path — real backend › TC-US02-03 — PUT body contains correct currentInterviewStep (numeric stage id) (30.0s)
  ✘  5 [chromium] › tests/us02-kanban-drag-drop.spec.ts:197:9 › US-02 — Move Candidate to a Different Interview Stage › Happy Path — real backend › TC-US02-05 — Backend returns 2xx after a successful drag-and-drop (30.0s)
  ✓  6 [chromium] › tests/us02-kanban-drag-drop.spec.ts:217:9 › US-02 — Move Candidate to a Different Interview Stage › Edge Cases — mocked API › TC-US02-06 — Dropping card into the same column fires a PUT with the same stage id (1.4s)
  ✓  7 … tests/us02-kanban-drag-drop.spec.ts:244:9 › US-02 — Move Candidate to a Different Interview Stage › Edge Cases — mocked API › TC-US02-07 — Dropping card outside any column returns it to original position with no PUT fired (1.4s)
  ✓  8 [chromium] › tests/us02-kanban-drag-drop.spec.ts:274:9 › US-02 — Move Candidate to a Different Interview Stage › Edge Cases — mocked API › TC-US02-08 — UI is NOT rolled back when PUT returns 500 (878ms)
  ✓  9 …omium] › tests/us02-kanban-drag-drop.spec.ts:303:9 › US-02 — Move Candidate to a Different Interview Stage › Edge Cases — mocked API › TC-US02-09 — PUT body currentInterviewStep is the numeric stage id, not the stage name (863ms)

  2 failed
    TC-US02-03 — Test timeout of 30000ms exceeded. Error: page.waitForSelector: waiting for locator('[data-testid="candidate-card"]') to be visible
    TC-US02-05 — Test timeout of 30000ms exceeded. Error: page.waitForSelector: waiting for locator('[data-testid="candidate-card"]') to be visible

  7 passed (31.9s)

---

## Prompt 13 — How to handle test isolation for the happy path suite

(Selected option via UI: beforeEach DB re-seed)

Add a `beforeEach` hook that calls a seed script/endpoint before each happy path test — the cleanest approach.

---

## Prompt 14 — Analyse remaining failure after beforeEach reset and serial mode

(Running tests after adding `test.beforeEach` reset via PUT and `test.describe.configure({ mode: 'serial' })`)

Output showed TC-US02-01 now failing — the very first test timing out on `[data-testid="candidate-card"]`.

Analysis delivered: root cause is a race condition in `PositionDetails.js`. `fetchInterviewFlow()` and `fetchCandidates()` are called in parallel (lines 55–56). If `fetchCandidates` resolves before `fetchInterviewFlow`, `prevStages` is still `[]` and the candidate map produces nothing — zero cards render on the board. The tests are correctly detecting a real application bug.

Bug documented at `frontend/ai-specs/bugs/BUG-001-race-condition-candidates-load.md`.

---

## Prompt 15 — Decision: QA mode, leave the bug, document it

perfect, lets go with option 2. We are in QA mode

---

