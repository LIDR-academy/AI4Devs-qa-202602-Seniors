# E2E Test-Case Catalog — `Position` view

**Reference implementation** inspected: `frontend/src/components/PositionDetails.js`, `StageColumn.js`, `CandidateCard.js`, `App.js` (`/positions/:id`), and backend route `PUT /candidates/:id`.

**API contract (verified in source):**
- `GET http://localhost:3010/positions/:id/interviewFlow` → `{ interviewFlow: { positionName, interviewFlow: { interviewSteps: [{ id, name, … }] } } }`
- `GET http://localhost:3010/positions/:id/candidates` → `[{ candidateId, fullName, currentInterviewStep, averageScore, applicationId }, …]`
- `PUT http://localhost:3010/candidates/:id` body `{ applicationId: number, currentInterviewStep: number }` (where `currentInterviewStep` is the **stage ID**, not the phase name)

**DnD library:** `react-beautiful-dnd`.

---

## 1. Scenario 1 — Loading the Position Page

### 1.1 Happy-path cases

| Field | **S1-TC01 — Position title rendered with correct value** |
|---|---|
| Type | Happy path |
| Preconditions | `GET /positions/42/interviewFlow` mocked → 200 with `positionName: "Senior Backend Engineer"`; `GET /positions/42/candidates` mocked → 200 with valid list. |
| Steps | 1. Navigate to `/positions/42`. 2. Wait for the page to settle. |
| Expected Result | The `<h2>` title displays the exact `positionName` from the mocked response. |
| Assertions | Element `[data-testid="position-title"]` is visible and has text equal to the mocked `positionName`. |
| Notes | The title is sourced from `interviewFlow.positionName` (`PositionDetails.js:27`), not from `/positions` list. |

| Field | **S1-TC02 — All hiring-phase columns rendered in the correct order** |
|---|---|
| Type | Happy path |
| Preconditions | Both endpoints mocked OK with the six reference phases in `orderIndex` order: `Applied, Interview, Technical Test, Offer, Hired, Rejected`. |
| Steps | 1. Navigate to `/positions/42`. 2. Wait for columns to render. |
| Expected Result | Six columns rendered left-to-right matching the reference phase order. |
| Assertions | `[data-testid="stage-column-header"]` returns exactly 6 elements; their text contents, in DOM order, equal `["Applied", "Interview", "Technical Test", "Offer", "Hired", "Rejected"]`. |
| Notes | Column order is whatever the backend returns; test must match the mocked order, not assume sorting. |

| Field | **S1-TC03 — Each candidate card appears under the column matching its phase** |
|---|---|
| Type | Happy path |
| Preconditions | Candidates fixture contains at least one candidate per phase, with explicit `currentInterviewStep` values. |
| Steps | 1. Navigate to `/positions/42`. 2. Wait for cards to render. |
| Expected Result | Every candidate is rendered as a card inside the column whose header matches its `currentInterviewStep`; no card appears in any other column. |
| Assertions | For each fixture entry `c`: `[data-testid="stage-column-${c.currentInterviewStep}"] [data-testid="candidate-card-${c.candidateId}"]` is visible; the same card is absent from every other column. |
| Notes | Card identity must be matched by `candidateId`, not by name, to prevent collisions on duplicates. |

| Field | **S1-TC04 — Card content matches candidate data (name and score)** |
|---|---|
| Type | Happy path |
| Preconditions | Candidates fixture with known `fullName` and `averageScore` values. |
| Steps | 1. Navigate to `/positions/42`. 2. For each candidate, inspect the rendered card. |
| Expected Result | Each card shows the candidate's full name and a rating indicator with cardinality equal to `averageScore`. |
| Assertions | Card contains text equal to `fullName`; the card's rating element contains exactly `averageScore` rating glyphs. |
| Notes | The rating is rendered via `Array.from({ length: candidate.rating })` (`CandidateCard.js:18`); zero or missing scores produce zero glyphs. |

### 1.2 Corner / edge cases

| Field | **S1-TC05 — Position with zero candidates renders all columns empty** |
|---|---|
| Type | Corner case |
| Preconditions | `GET /candidates` mocked → 200 with `[]`. |
| Steps | 1. Navigate to `/positions/42`. 2. Wait for columns to render. |
| Expected Result | All six columns are rendered; no cards are present anywhere. |
| Assertions | `[data-testid="stage-column-header"]` count = 6; `[data-testid^="candidate-card-"]` count = 0 in every column. |
| Notes | Verifies decoupling between `interviewFlow` and `candidates` requests. |

| Field | **S1-TC06 — Mixed empty and populated phases** |
|---|---|
| Type | Corner case |
| Preconditions | Candidates fixture populates only two phases (e.g. `Applied`, `Offer`); the other four remain empty. |
| Steps | 1. Navigate to `/positions/42`. |
| Expected Result | All columns render; only the populated phases contain cards. |
| Assertions | Cards count: `Applied=1`, `Offer=1`, `Interview=0`, `Technical Test=0`, `Hired=0`, `Rejected=0`. |
| Notes | — |

| Field | **S1-TC07 — Large number of candidates in the same phase** |
|---|---|
| Type | Corner case |
| Preconditions | Candidates fixture contains 50 entries all in `Applied`. |
| Steps | 1. Navigate to `/positions/42`. 2. Wait for cards to render. |
| Expected Result | The `Applied` column contains all 50 cards without rendering errors; the page is scrollable if cards overflow. |
| Assertions | `[data-testid="stage-column-Applied"] [data-testid^="candidate-card-"]` count = 50; first and last candidate cards are attached to the DOM; no `pageerror` listener triggers. |
| Notes | Scroll-into-view may be required to assert visibility of the last card. |

| Field | **S1-TC08 — Candidate with incomplete data (missing name, zero score)** |
|---|---|
| Type | Corner case |
| Preconditions | Candidate fixture with `fullName: ""`, `averageScore: 0`. |
| Steps | 1. Subscribe to `page.on('pageerror')`. 2. Navigate to `/positions/42`. |
| Expected Result | UI renders the card with empty title and no rating glyphs; no JavaScript error is thrown. |
| Assertions | Card is present; no `pageerror` collected; rating element child count = 0. |
| Notes | The component does not currently guard against missing fields; verify resilience. |

| Field | **S1-TC09 — Candidate whose `currentInterviewStep` does not match any phase** |
|---|---|
| Type | Corner case |
| Preconditions | Candidate fixture has `currentInterviewStep: "Archived"` (not in the interview flow). |
| Steps | 1. Navigate to `/positions/42`. |
| Expected Result | The orphan candidate is not rendered in any column; other candidates render normally; UI does not crash. |
| Assertions | `[data-testid="candidate-card-${orphanId}"]` count = 0; columns count unchanged. |
| Notes | Filtering happens in `PositionDetails.js:41` (`candidate.currentInterviewStep === stage.title`); unmatched candidates are silently dropped. |

| Field | **S1-TC10 — Slow network shows no premature column rendering** |
|---|---|
| Type | Corner case |
| Preconditions | `GET /interviewFlow` delayed by ~1500 ms. |
| Steps | 1. Trigger navigation to `/positions/42` (do not await). 2. Immediately check for columns. 3. Await navigation. 4. Re-check. |
| Expected Result | Before the response lands, no column headers are present. After the response resolves, all columns render. |
| Assertions | Pre-resolution: `[data-testid="stage-column-header"]` count = 0. Post-resolution: count = 6 in correct order. |
| Notes | The UI lacks an explicit loading indicator — see open question OQ-3. If an indicator is added (`data-testid="position-loading"`), assert its presence pre-resolution and its absence post-resolution. |

### 1.3 Error cases

| Field | **S1-TC11 — Invalid / non-existent position ID (404 on both endpoints)** |
|---|---|
| Type | Error case |
| Preconditions | Both `/interviewFlow` and `/candidates` return 404 for position id `99999`. |
| Steps | 1. Subscribe to `pageerror`. 2. Navigate to `/positions/99999`. |
| Expected Result | No columns or cards rendered; page does not crash; ideally an empty-state or error message is shown (UI gap — open question OQ-4). |
| Assertions | Column headers count = 0; no `pageerror`. If an empty/error state element is implemented, assert it. |
| Notes | — |

| Field | **S1-TC12 — `interviewFlow` endpoint returns 5xx** |
|---|---|
| Type | Error case |
| Preconditions | `GET /interviewFlow` → 500. |
| Steps | 1. Subscribe to `pageerror`. 2. Navigate to `/positions/42`. |
| Expected Result | No columns rendered (driven by `interviewFlow`); no JavaScript error reaches the page handler. |
| Assertions | Column headers count = 0; no `pageerror`. |
| Notes | Errors are caught and `console.error`'d (`PositionDetails.js:28`); the UI surfaces nothing — flag for product. |

| Field | **S1-TC13 — `candidates` endpoint returns 4xx (interviewFlow OK)** |
|---|---|
| Type | Error case |
| Preconditions | `interviewFlow` → 200; `candidates` → 400. |
| Steps | 1. Subscribe to `pageerror`. 2. Navigate to `/positions/42`. |
| Expected Result | All columns render (from `interviewFlow`) but contain no cards; page does not crash. |
| Assertions | Column headers count = 6 in correct order; total cards count = 0; no `pageerror`. |
| Notes | Demonstrates the two fetches are independent. |

| Field | **S1-TC14 — Network failure (request aborted) on `interviewFlow`** |
|---|---|
| Type | Error case |
| Preconditions | Route aborted with `failed`. |
| Steps | 1. Navigate to `/positions/42`. |
| Expected Result | Page does not crash; no columns rendered. |
| Assertions | Column headers count = 0; no `pageerror`. |
| Notes | Mirrors offline scenarios. |

| Field | **S1-TC15 — Unauthenticated/unauthorized user accessing the route** |
|---|---|
| Type | Error case (N/A in current implementation) |
| Preconditions | n/a |
| Steps | n/a |
| Expected Result | n/a |
| Assertions | n/a |
| Notes | Open question OQ-1: the app has no auth layer. Mark this case as **not applicable** until authentication is introduced; re-evaluate when auth lands. |

---

## 2. Scenario 2 — Changing a Candidate's Phase

> All tests in this scenario mock `PUT /candidates/:id` to capture the request payload (URL, method, body) and return a controlled response.

### 2.1 Happy-path cases

| Field | **S2-TC01 — Drag a card from a source column to an adjacent target column** |
|---|---|
| Type | Happy path |
| Preconditions | Position loaded with a known candidate `c` whose `currentInterviewStep` is `Applied`. |
| Steps | 1. Locate card `c`. 2. Drag it from `Applied` to `Interview` using the keyboard sensor (`Space`, `ArrowRight`, `Space`). |
| Expected Result | Card `c` is now under the `Interview` column and removed from `Applied`. |
| Assertions | `[data-testid="stage-column-Interview"] [data-testid="candidate-card-${c.candidateId}"]` count = 1; same selector under `Applied` count = 0. |
| Notes | Use the keyboard sensor — native HTML5 drag events do not fire react-beautiful-dnd handlers. |

| Field | **S2-TC02 — Successful drop triggers PUT with correct URL and body** |
|---|---|
| Type | Happy path |
| Preconditions | Same as S2-TC01; PUT route captures requests. |
| Steps | 1. Drag candidate `c` from `Applied` to `Interview`. 2. Wait for PUT request. |
| Expected Result | Exactly one PUT request to `/candidates/${c.candidateId}` is issued, with body `{ applicationId: c.applicationId, currentInterviewStep: stepId("Interview") }`, and backend returns 200. |
| Assertions | PUT count = 1; URL ends with `/candidates/${c.candidateId}`; request method = `PUT`; JSON body equals `{ applicationId: <number>, currentInterviewStep: <number> }`; response status 2xx. |
| Notes | `currentInterviewStep` must be the numeric stage **ID**, not the phase name (`PositionDetails.js:69`). |

| Field | **S2-TC03 — UI state remains consistent after backend success** |
|---|---|
| Type | Happy path |
| Preconditions | Same as S2-TC02. |
| Steps | 1. Perform the move and await the PUT response. 2. Re-read the DOM. |
| Expected Result | The card stays in the target column; no re-fetch wipes the optimistic state; no duplicate card. |
| Assertions | Single instance of the card under target column; no instance under source; total candidate count unchanged across the board. |
| Notes | — |

### 2.2 Corner / edge cases

| Field | **S2-TC04 — Drag spanning multiple columns (Applied → Offer)** |
|---|---|
| Type | Corner case |
| Preconditions | Position loaded; candidate `c` in `Applied`. |
| Steps | 1. Drag `c` from `Applied` to `Offer` by pressing `ArrowRight` 3 times before dropping. |
| Expected Result | Card is moved to `Offer`; one PUT issued with `currentInterviewStep = stepId("Offer")`. |
| Assertions | Card present in `Offer`, absent everywhere else; PUT count = 1; body's `currentInterviewStep` equals `Offer`'s numeric id. |
| Notes | Validates that the final destination — not intermediate hops — is what persists. Constrained to row 1 because the 6 columns wrap (`Col md={3}` × 6 = 4 + 2 grid); rbd v13 cannot reliably bridge the gap between row 1 and row 2 from either keyboard or Playwright-driven mouse. See OQ-9. |

| Field | **S2-TC05 — Drop back onto the original column at the original index** |
|---|---|
| Type | Corner case |
| Preconditions | Candidate `c` in `Applied`. |
| Steps | 1. Lift `c` (`Space`). 2. Drop immediately (`Space`) without moving. |
| Expected Result | Card remains in `Applied`. **Either** no PUT is issued, **or** a PUT is issued with `currentInterviewStep` equal to the **current** stage id (effectively a no-op). |
| Assertions | Card still in `Applied`. PUT count is either 0, or 1 with body's `currentInterviewStep` equal to `Applied`'s id. |
| Notes | The current implementation triggers a PUT even when source = destination (no equality short-circuit in `onDragEnd`, `PositionDetails.js:80-98`). Document this for triage — open question OQ-5. |

| Field | **S2-TC06 — Cancel drag (drop outside any column / Escape)** |
|---|---|
| Type | Corner case |
| Preconditions | Candidate `c` in `Applied`. |
| Steps | 1. Lift `c`. 2. Press `Escape`. |
| Expected Result | Card returns to its original position in `Applied`; no PUT issued. |
| Assertions | Card present in `Applied`; PUT count = 0. |
| Notes | `Escape` causes react-beautiful-dnd to call `onDragEnd` with `destination: null`, which short-circuits (`PositionDetails.js:83-85`). |

| Field | **S2-TC07 — Sequential moves of different candidates** |
|---|---|
| Type | Corner case |
| Preconditions | Candidates `c1` in `Applied`, `c2` in `Interview`. |
| Steps | 1. Move `c1` from `Applied` to `Offer`; wait for its PUT. 2. Move `c2` from `Interview` to `Technical Test`; wait for its PUT. |
| Expected Result | Two distinct PUT requests, each targeting the correct candidate id and step id. |
| Assertions | PUT log length = 2; first entry `{ url: ".../${c1.candidateId}", body.currentInterviewStep = stepId("Offer"), body.applicationId = c1.applicationId }`; second entry analogous for `c2` → `Technical Test`. |
| Notes | — |

| Field | **S2-TC08 — Same candidate moved consecutively across several phases** |
|---|---|
| Type | Corner case |
| Preconditions | Candidate `c` in `Applied`. |
| Steps | 1. Move `c` to `Interview`. 2. Move `c` to `Technical Test`. 3. Move `c` to `Offer`. |
| Expected Result | Three PUTs, each with the same candidate id and a `currentInterviewStep` matching the destination of that move. |
| Assertions | PUT log length = 3; the three bodies' `currentInterviewStep` values equal `stepId("Interview")`, `stepId("Technical Test")`, `stepId("Offer")` in order; final UI state has the card in `Offer` only. |
| Notes | — |

| Field | **S2-TC09 — Concurrent / overlapping drags** |
|---|---|
| Type | Corner case |
| Preconditions | Two candidates loaded. |
| Steps | 1. Begin a drag on `c1`. 2. Without releasing, attempt to start a drag on `c2`. |
| Expected Result | react-beautiful-dnd serializes drags — only one active drag at a time. The second attempt is either ignored or blocked. No race condition leaves the UI in an inconsistent state. |
| Assertions | At most one PUT request can be inflight at any moment; final DOM state matches the sequence of completed drags. |
| Notes | This is library-enforced behavior. Test primarily for absence of UI corruption rather than active concurrency. |

### 2.3 Error cases

| Field | **S2-TC10 — Backend responds 4xx on PUT** |
|---|---|
| Type | Error case |
| Preconditions | Candidate `c` in `Applied`; PUT route returns 400. |
| Steps | 1. Drag `c` from `Applied` to `Interview`. 2. Wait for PUT to settle. |
| Expected Result | **Desired:** card reverts to `Applied`; user-facing notification informs them of the failure. **Current:** card remains in `Interview` (optimistic update is not rolled back) and only `console.error` fires. |
| Assertions | PUT count = 1; expected: card present in `Applied`, absent in `Interview`, and a notification element is visible. Document the gap against current behavior. |
| Notes | Open question OQ-6 — implementation does not revert on error (`PositionDetails.js:72-77`). This test surfaces a UI/UX defect. |

| Field | **S2-TC11 — Backend responds 5xx on PUT** |
|---|---|
| Type | Error case |
| Preconditions | Same as S2-TC10 but PUT returns 500. |
| Steps | Same as S2-TC10. |
| Expected Result | Same as S2-TC10. |
| Assertions | Same as S2-TC10. |
| Notes | Same defect path. |

| Field | **S2-TC12 — Network timeout / dropped PUT request** |
|---|---|
| Type | Error case |
| Preconditions | PUT route aborted with `timedout`. |
| Steps | 1. Drag `c`. 2. Wait. |
| Expected Result | UI does not enter a hung state; no orphaned overlay; card position reflects an unambiguous final state. **Desired:** revert + notify. |
| Assertions | No frozen drag overlay; UI is interactive (a subsequent drag can be initiated). |
| Notes | — |

| Field | **S2-TC13 — Slow PUT response (latency without failure)** |
|---|---|
| Type | Error case |
| Preconditions | PUT delayed by ~2000 ms; final status 200. |
| Steps | 1. Drag `c`. 2. Observe UI immediately and again after response. |
| Expected Result | Card moves optimistically; UI remains responsive (other interactions allowed); only one PUT is sent for a single drag (no retries / double-send). |
| Assertions | PUT count = 1; card in target column both immediately and after response. |
| Notes | Validates absence of accidental double-fire under latency. |

---

## 3. Cross-cutting considerations

### 3.1 Test data strategy
- **Fixtures live under `frontend/e2e/fixtures/`**: `interviewFlow.json`, `candidates.json`, `candidateDetail.json` are the canonical baseline.
- Each test **clones** the fixture before mutating (deep copy) — avoids cross-test pollution.
- Stage-name strings used in assertions must derive from the fixture (`phaseNames()` helper), never hard-coded against the prompt's reference list, so a fixture update propagates without rewriting tests.

### 3.2 Network mocking strategy
- Use Playwright `page.route()` to intercept the three relevant endpoints: `GET /positions/:id/interviewFlow`, `GET /positions/:id/candidates`, and the regex `/\/candidates\/\d+/` covering both `GET` (detail panel) and `PUT` (phase change).
- Every test registers its own mocks in `beforeEach` (or directly inside the test) — no shared mutable state between tests.
- The PUT handler **must capture** the request URL, method, and body into an array the test can later assert against.
- Error and latency scenarios are produced by varying `status`, `delayMs`, or `route.abort()` per test — not by sharing a switchable global state.

### 3.3 Selector strategy
- Prefer `data-testid` for all production-DOM lookups. Required attributes:
  - `data-testid="position-title"` on the `<h2>` (PositionDetails.js:113).
  - `data-testid="stage-column-${stage.title}"` on the column `Card` (StageColumn.js:10).
  - `data-testid="stage-column-header"` on the `Card.Header` (StageColumn.js:11).
  - `data-testid="candidate-card-${candidate.id}"` on the candidate `Card` (CandidateCard.js:8).
  - Optional: `data-testid="position-loading"` for an explicit loading state (currently missing).
  - Optional: `data-testid="position-empty"` for an empty/error state (currently missing).
- Avoid text-only or class-based selectors except where a heading role is naturally stable (e.g., the `<h2>` title via `getByRole('heading')` as a fallback).

### 3.4 Isolation between tests
- Each `test()` is self-contained: registers its own mocks, navigates, asserts, and lets Playwright tear down the page automatically.
- No `beforeAll` shared state, no order dependencies, no reliance on cookies/localStorage carry-over.
- Subscribe to `page.on('pageerror')` in tests asserting "no crash" — collect errors and assert empty at the end.

### 3.5 Drag-and-drop simulation approach
- The library is **react-beautiful-dnd**. Native HTML5 `dragstart` / `drop` events do **not** drive its lifecycle.
- The deterministic, library-supported approach in Playwright is the **keyboard sensor**:
  - Focus the draggable.
  - `Space` → lift; allow ~200 ms for the library to register the lift.
  - `ArrowLeft` / `ArrowRight` to move between droppables (one press per column); ~80 ms between presses.
  - `Space` to drop, or `Escape` to cancel.
- The draggable's drag handle is automatically `tabIndex=0` and `role="button"` via `dragHandleProps`, so focusing the card is sufficient — no extra handle attribute is needed.
- Mouse-based simulation is possible but flaky; reserve it for visual-only checks.

---

## 4. Open questions

- **OQ-1 — Authentication layer.** The app currently has no login or protected routes. Scenario "unauthenticated user accessing the position" (S1-TC15) is marked N/A. Confirm with product whether `/positions/:id` will be gated and by what mechanism (cookie? bearer token?), then add corresponding test cases.
- **OQ-2 — Real phase names in production.** The frontend reads phase names dynamically from `interviewFlow.interviewSteps[*].name`. The reference set (`Applied | Interview | Technical Test | Offer | Hired | Rejected`) is the prompt's specification, but it must be verified against the backend seed data (`backend/prisma/seed.ts` or equivalent). If the live backend uses different names, all fixtures and assertions must reflect them.
- **OQ-3 — Loading indicator absent.** `PositionDetails` renders nothing while requests are in flight. Confirm with product whether a loading state (spinner / skeleton) should be added; if so, define the testid (`position-loading`) and re-author S1-TC10 to assert its visibility transitions.
- **OQ-4 — Empty / error state UX undefined.** On 404 or 5xx responses, the UI silently logs to console. Confirm desired UX (banner? empty state?) so S1-TC11 / S1-TC12 / S1-TC13 / S1-TC14 can assert against a concrete element rather than just "no crash".
- **OQ-5 — Same-column drop behaviour.** Current implementation fires a PUT even when source = destination at the same index. Confirm whether this is acceptable (idempotent no-op on backend) or whether the UI should short-circuit; S2-TC05 is written to accept either, but a product decision is needed.
- **OQ-6 — Rollback + notification on PUT failure.** The optimistic update is never reverted, and the user receives no feedback on failure. S2-TC10 / S2-TC11 / S2-TC12 assume the desired behavior is **revert + notify**. Confirm with product, and define the notification element (toast? inline message?) and its `data-testid`.
- **OQ-7 — Body field naming.** Backend currently accepts `currentInterviewStep` (a numeric stage id) — but the prompt sometimes refers to "the new phase". Confirm that the contract stays on stage **id** (not phase name); the catalog assumes id.
- **OQ-8 — `candidates.filter` crash on non-array body.** `PositionDetails.js:40` calls `candidates.filter(...)` without checking `response.ok`. When the backend returns a 4xx error JSON (e.g. `{ "message": "Bad request" }`), the `TypeError` thrown inside the `setStages` updater unmounts the React tree (no error boundary). S1-TC13 is marked `test.fail()` against this defect. Fix: check `response.ok` and short-circuit, or default to `[]` on non-array payloads.
- **OQ-9 — Wrapped Kanban grid blocks multi-row drag.** `StageColumn.js:7` uses `<Col md={3}>`. With 6 phases that totals 18/12 Bootstrap units, so the board wraps after the 4th column into a `4 + 2` grid (row 2 = `Hired | Rejected`). react-beautiful-dnd v13's keyboard sensor only crosses droppables that overlap on the cross axis, so there is no key sequence that takes a row-1 card into row 2. Playwright-driven mouse drag also fails because the empty gutter between rows breaks rbd v13's droppable-hit-detection handoff. **Real users likely have the same friction.** Recommended fix: change to `<Col md={2}>` (6 × 2 = 12, all on one row) so multi-column drags work in any direction. Until then, S2-TC04 is scoped to a single row (Applied → Offer).
