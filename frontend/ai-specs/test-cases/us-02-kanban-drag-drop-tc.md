# Test Cases — US-02: Move Candidate to a Different Interview Stage

| | |
|---|---|
| **Story ref** | US-02 — Kanban Drag-and-Drop |
| **Date** | 2026-05-16 |
| **Author** | <!-- QA engineer name --> |
| **Component** | `PositionDetails`, `StageColumn`, `CandidateCard` |

---

## 1. Test Strategy Summary

Happy-path tests run against the **real backend**: the board is loaded by navigating to a live `/positions/:id` page, the actual `GET /positions/:id/interviewFlow` and `GET /positions/:id/candidates` endpoints populate the board, and `page.route()` is used **only to intercept the outgoing PUT request** so its URL and body can be inspected — the intercepted request is still forwarded to the real backend and the real 2xx response is used to assert success.

Edge-case tests use `page.route()` to **fully mock** both GET endpoints so the board state is deterministic and independent of live data; for the failed-API scenario, the PUT is also mocked to return HTTP 500. This hybrid strategy keeps the happy path honest (real persistence round-trip) while making boundary conditions stable and repeatable.

---

## 2. Fixture Data

> These fixtures are used exclusively by edge-case tests (type: **mock**). They are loaded via `page.route()` before the page navigates to `http://localhost:3000/positions/1`.

### `fixture-interview-flow.json`

Mocks `GET /positions/1/interviewFlow`. Stages are ordered as they appear left-to-right on the board. The `id` field is the numeric stage id sent as `currentInterviewStep` in PUT requests.

```json
{
  "interviewFlow": {
    "positionName": "Senior Frontend Engineer",
    "interviewFlow": {
      "interviewSteps": [
        { "id": 1, "name": "CV Screening" },
        { "id": 2, "name": "Phone Screen" },
        { "id": 3, "name": "Technical Interview" },
        { "id": 4, "name": "Offer" }
      ]
    }
  }
}
```

### `fixture-candidates.json`

Mocks `GET /positions/1/candidates`. Distribution:

- **CV Screening** (index 0): 2 candidates — enables the same-column drop test
- **Phone Screen** (index 1): 1 candidate
- **Technical Interview** (index 2): 1 candidate
- **Offer** (index 3): 0 candidates — intentionally empty column

> `currentInterviewStep` must match the stage **name** exactly (the app filters by `candidate.currentInterviewStep === stage.title`).

```json
[
  {
    "candidateId": 101,
    "fullName": "Alice Martín",
    "currentInterviewStep": "CV Screening",
    "applicationId": 201,
    "averageScore": 3
  },
  {
    "candidateId": 102,
    "fullName": "Bob Fernández",
    "currentInterviewStep": "CV Screening",
    "applicationId": 202,
    "averageScore": 2
  },
  {
    "candidateId": 103,
    "fullName": "Carol López",
    "currentInterviewStep": "Phone Screen",
    "applicationId": 203,
    "averageScore": 4
  },
  {
    "candidateId": 104,
    "fullName": "David García",
    "currentInterviewStep": "Technical Interview",
    "applicationId": 204,
    "averageScore": 1
  }
]
```

---

## 3. Test Cases

> **Type legend**
> - `real` — real backend; `page.route()` used only to intercept (not mock) the PUT
> - `mock` — both GET endpoints fully mocked via `page.route()`; PUT mocked where noted

| ID | Title | Type | Preconditions | Steps | Expected Result | AC Ref |
|----|-------|------|---------------|-------|-----------------|--------|
| TC-US02-01 | Card moves visually from source column to destination column | real | Position with at least one candidate in a non-final stage exists in the real DB. Board is loaded at `/positions/:id`. | 1. Identify a candidate card in column A. 2. Drag the card and drop it into column B. 3. Wait for the board to re-render. | The card is no longer visible in column A. The card is visible in column B. No page reload occurs. | AC-1 |
| TC-US02-02 | PUT request is fired to the correct candidate URL after drop | real | Same as TC-US02-01. `page.route()` intercepts `PUT /candidates/*` before navigation. | 1. Register a `page.route()` handler for `**/candidates/**` that records the request then continues it. 2. Drag a candidate from column A to column B. 3. Await the intercepted request. | The intercepted URL matches `/candidates/:candidateId` where `:candidateId` equals the moved candidate's `candidateId`. | AC-2 |
| TC-US02-03 | PUT request body contains correct `currentInterviewStep` (numeric stage id) | real | Same as TC-US02-01. PUT interceptor records the request body. | 1. Register a `page.route()` handler that captures the request body JSON then continues. 2. Note the destination column's stage `id` (from the interviewFlow response). 3. Drag the candidate to that column. 4. Await the intercepted request and parse its body. | `body.currentInterviewStep` equals the numeric `id` of the destination stage, **not** its name string. | AC-2 |
| TC-US02-04 | PUT request body contains `applicationId` as a number (not a string) | real | Same as TC-US02-01. PUT interceptor records the request body. | 1. Register a `page.route()` handler that captures the request body JSON then continues. 2. Drag a candidate from column A to column B. 3. Parse the captured request body. | `typeof body.applicationId === 'number'` and `typeof body.currentInterviewStep === 'number'`. Neither field is a string. | AC-2 |
| TC-US02-05 | Backend returns 2xx after a successful drag-and-drop | real | Same as TC-US02-01. PUT interceptor records the response status then continues. | 1. Register a `page.route()` handler that captures the response status then continues. 2. Drag a candidate from column A to column B. 3. Await the response. | The intercepted PUT response status is in the 200–299 range. | AC-2 |
| TC-US02-06 | Dropping card into the same column still fires a PUT with the same stage id | mock | Board loaded with fixture data. Alice Martín and Bob Fernández are both in "CV Screening" (stage id 1, column index 0). | 1. Load the board with mocked GET endpoints. 2. Register a `page.route()` handler that records the PUT request body then continues it (forwarded to real backend or a pass-through mock). 3. Drag Alice Martín and drop her at a different position within "CV Screening". 4. Await the intercepted request. | The card is repositioned within "CV Screening". A PUT is fired. `body.currentInterviewStep` equals `1` (numeric id of "CV Screening"). | AC-3 |
| TC-US02-07 | Dropping a card outside any column returns it to its original position with no PUT fired | mock | Board loaded with fixture data. A `page.route()` handler is registered to fail the test if any PUT request to `/candidates/*` is made. | 1. Load the board with mocked GET endpoints. 2. Register a `page.route()` handler for `**/candidates/**` that records any PUT attempt. 3. Begin dragging Alice Martín. 4. Simulate releasing the card outside all droppable columns (e.g. over the page heading or outside the board container). 5. Wait 1 s for any potential network request. | The card is back in "CV Screening" at its original position. No PUT request was fired (the interceptor was never triggered). | AC-4 |
| TC-US02-08 | UI is NOT rolled back when PUT returns 500 | mock | Board loaded with fixture data. PUT to `/candidates/*` is mocked to return HTTP 500. | 1. Load the board with mocked GET endpoints. 2. Mock `PUT /candidates/*` to return status 500. 3. Drag Carol López from "Phone Screen" to "Technical Interview". 4. Wait for the mocked PUT response. | Carol López is visible in "Technical Interview" (the destination column). "Phone Screen" no longer contains her card. No rollback animation or UI reversal occurs. | AC-5 |
| TC-US02-09 | PUT body `currentInterviewStep` uses the numeric stage id, not the stage name string | mock | Board loaded with fixture data. PUT interceptor captures request body. | 1. Load the board with mocked GET endpoints. 2. Register a `page.route()` handler that captures the PUT body then continues (or returns 200). 3. Drag David García from "Technical Interview" (stage id 3) to "Offer" (stage id 4). 4. Parse the captured body. | `body.currentInterviewStep === 4` (number). `body.currentInterviewStep` is NOT the string `"Offer"` or `"Technical Interview"`. | AC-2 |

---

## 4. Selector Strategy

### 4.1 Key elements and recommended selectors

| Element | Selector approach | Notes |
|---------|-------------------|-------|
| Stage column header | `page.getByRole('heading', { name: 'CV Screening' })` or `.card-header:has-text("CV Screening")` | Column headers render inside Bootstrap `Card.Header` as plain text. No `data-testid` present. |
| Droppable column body | `.card-body` scoped to the column card: `page.locator('.card').filter({ has: page.locator('.card-header', { hasText: 'Phone Screen' }) }).locator('.card-body')` | `droppableId` is the **array index** (`"0"`, `"1"`, …), not the stage name. There are no `data-testid` or `data-rbd-droppable-id` attributes that can be used as stable locators without inspecting DOM. |
| Candidate card | `page.locator('.card-body').filter({ hasText: 'Alice Martín' })` or `page.getByRole('heading', { name: 'Alice Martín' })` (if `Card.Title` renders as `<h5>`) | `draggableId` is the candidate's `candidateId.toString()`. The DOM attribute `data-rbd-draggable-id` is injected by `react-beautiful-dnd` at runtime and can be used: `page.locator('[data-rbd-draggable-id="101"]')`. |
| Drag handle | The entire `Card` element is both `draggableProps` and `dragHandleProps` — there is no separate handle element. Dragging must start from anywhere on the card surface. | |

### 4.2 Missing `data-testid` attributes — ⚠ action required

**None of the three components (`PositionDetails.js`, `StageColumn.js`, `CandidateCard.js`) contain any `data-testid` attributes.** This forces selectors to rely on CSS class names (Bootstrap internals), visible text, or runtime-injected `data-rbd-*` attributes from `react-beautiful-dnd`. This is fragile.

**Recommended additions before writing the Playwright spec:**

| Component | Suggested attribute |
|-----------|---------------------|
| `StageColumn` — `<Card>` wrapper | `data-testid={`stage-column-${stage.id}`}` |
| `StageColumn` — `<Card.Body>` (droppable area) | `data-testid={`droppable-${index}`}` |
| `CandidateCard` — `<Card>` wrapper | `data-testid={`candidate-card-${candidate.id}`}` |

### 4.3 Drag simulation approach for `react-beautiful-dnd` — ⚠ implementation risk

`react-beautiful-dnd` does **not** respond reliably to Playwright's built-in `page.dragAndDrop()` or Locator `.dragTo()` methods, because the library uses its own pointer-event listeners and internal state machine rather than the native HTML5 drag API.

**Recommended approach: keyboard-based drag API**

`react-beautiful-dnd` has first-class support for keyboard navigation: pressing `Space` on a focused draggable lifts the card, `Arrow` keys move it between columns, and a second `Space` drops it. This is the **most reliable** simulation path in Playwright because it does not depend on pixel-precise pointer coordinates.

Sequence:
1. Focus the candidate card: `await card.focus()`
2. Press `Space` to pick it up: `await card.press('Space')`
3. Press `ArrowRight` (or `ArrowLeft`) to move it to the adjacent column: `await page.keyboard.press('ArrowRight')`
4. Press `Space` again to drop: `await page.keyboard.press('Space')`

**Alternative: pointer-event dispatch sequence**

If the keyboard API proves insufficient for a specific scenario (e.g. dropping at a specific index within a column), dispatch a manual pointer-event sequence:

```
pointerdown → pointermove (to drag start threshold) → pointermove (to destination) → pointerup
```

This must be done via `page.dispatchEvent()` with precise bounding-box coordinates obtained from `element.boundingBox()`. It is more brittle than the keyboard approach because coordinate calculations can drift across viewport sizes.

> **Risk flag**: Both approaches require real-browser testing (Chromium recommended first). Firefox and WebKit may behave differently with the pointer-event sequence. The keyboard approach is cross-browser safe but only works if the dragged element can receive keyboard focus — verify that `CandidateCard` is reachable via `Tab` before relying on it. **Resolve this simulation approach in a spike before writing the full test suite.**

---

*End of document*
