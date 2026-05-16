# Test Cases — US-01: View Candidate Pipeline as Kanban Board

| | |
|---|---|
| **Story** | US-01 — View Candidate Pipeline as Kanban Board |
| **Date** | 2026-05-16 |
| **Author** | _[QA Engineer]_ |
| **Source file** | `ai-specs/changes/us-kanban-view.md` |

---

## Test Strategy Summary

Happy-path tests (AC-1 through AC-6) run against the real backend so that API shape, data integrity, and end-to-end rendering are validated without artificial fixtures. Edge cases that depend on controlled data states — empty columns, boundary score values, and unmatched `currentInterviewStep` — use `page.route()` interception to inject deterministic fixture JSON, keeping those tests fast and stable regardless of database state. No third-party service mocking is required for this story.

---

## Fixture Data

### `fixture-interview-flow.json`
Used to mock `GET /positions/1/interviewFlow`

```json
{
  "interviewFlow": {
    "positionName": "Senior Frontend Engineer",
    "interviewFlow": {
      "interviewSteps": [
        { "id": 1, "name": "CV Screening" },
        { "id": 2, "name": "Technical Interview" },
        { "id": 3, "name": "Culture Fit" },
        { "id": 4, "name": "Offer" }
      ]
    }
  }
}
```

### `fixture-candidates.json`
Used to mock `GET /positions/1/candidates`

```json
[
  {
    "candidateId": 101,
    "applicationId": 201,
    "fullName": "Alice Ramos",
    "averageScore": 3,
    "currentInterviewStep": "CV Screening"
  },
  {
    "candidateId": 102,
    "applicationId": 202,
    "fullName": "Bruno Salas",
    "averageScore": 5,
    "currentInterviewStep": "CV Screening"
  },
  {
    "candidateId": 103,
    "applicationId": 203,
    "fullName": "Carmen Vidal",
    "averageScore": 0,
    "currentInterviewStep": "Technical Interview"
  },
  {
    "candidateId": 104,
    "applicationId": 204,
    "fullName": "David Nieto",
    "averageScore": 2,
    "currentInterviewStep": "Culture Fit"
  },
  {
    "candidateId": 105,
    "applicationId": 205,
    "fullName": "Elena Cruz",
    "averageScore": 4,
    "currentInterviewStep": "UNKNOWN_STEP"
  }
]
```

> **Stage distribution:**
> - `CV Screening` — 2 candidates (Alice, Bruno)
> - `Technical Interview` — 1 candidate (Carmen, score 0)
> - `Culture Fit` — 1 candidate (David)
> - `Offer` — **empty** (no candidates assigned)
> - Elena Cruz has `currentInterviewStep: "UNKNOWN_STEP"` which matches no column → must not appear anywhere on the board

---

## Test Cases

| ID | Title | Type | Preconditions | Steps | Expected Result | AC Ref |
|----|-------|------|---------------|-------|-----------------|--------|
| TC-US01-01 | Position title is displayed as a centred heading | real | Backend running; a valid position with a known name exists (e.g. `/positions/1`) | 1. Navigate to `/positions/1`. 2. Wait for the page to finish loading. 3. Locate the `<h2>` heading. | The `<h2>` element is visible, contains a non-empty string matching the position name returned by `GET /positions/1/interviewFlow` (`interviewFlow.positionName`), and is horizontally centred (Bootstrap class `text-center`). | AC-1 |
| TC-US01-02 | Stage columns are rendered in API order with correct headers | real | Backend running; position 1 has at least 3 interview steps. | 1. Navigate to `/positions/1`. 2. Wait for all columns to be visible. 3. Collect all `.card-header` texts in DOM order. 4. Call `GET /positions/1/interviewFlow` separately and extract `interviewSteps[].name` in order. | The column headers, read left-to-right in the DOM, match the step names from the API response exactly and in the same order. No extra or missing columns. | AC-2 |
| TC-US01-03 | Each candidate card appears in the column matching their current interview step | real | Backend running; at least one candidate exists in at least two different stages for position 1. | 1. Navigate to `/positions/1`. 2. Wait for candidate cards to render. 3. For each `.card-header` (stage column), collect the candidate names inside that column. 4. Cross-reference with `GET /positions/1/candidates`. | Every candidate whose `currentInterviewStep` matches a column name is found inside that column's card body. No candidate appears in the wrong column. | AC-3 |
| TC-US01-04 | Candidate card shows full name and correct number of score icons | real | Backend running; at least one candidate with `averageScore > 0` exists for position 1. | 1. Navigate to `/positions/1`. 2. Locate a candidate card with a known `averageScore` (e.g. 3). 3. Read the `Card.Title` text and count `span[role="img"][aria-label="rating"]` elements within that card. | The card title matches the candidate's `fullName`. The number of green circle icons equals `averageScore`. | AC-4 |
| TC-US01-05 | "Volver a Posiciones" link navigates to /positions | real | Backend running; any valid position page loaded. | 1. Navigate to `/positions/1`. 2. Click the "Volver a Posiciones" button/link at the top of the page. 3. Wait for navigation. | The browser URL changes to `/positions`. | AC-5 |
| TC-US01-06 | Empty stage column still renders with its header visible | real | Backend running; at least one interview step has zero candidates assigned. | 1. Navigate to `/positions/1`. 2. Wait for all columns to load. 3. Identify a stage known to have no candidates. | The column for that stage is present in the DOM with its `Card.Header` text visible. The `Card.Body` contains no candidate cards (only the Droppable placeholder). | AC-6 |
| TC-US01-07 | Empty stage column renders header when all stages have zero candidates (mock) | mock | Intercept both API endpoints with fixture data. | 1. `page.route('**/positions/1/interviewFlow', ...)` → return `fixture-interview-flow.json`. 2. `page.route('**/positions/1/candidates', ...)` → return `[]` (empty array). 3. Navigate to `/positions/1`. 4. Collect all `.card-header` elements. | All 4 stage columns from the fixture are visible (`CV Screening`, `Technical Interview`, `Culture Fit`, `Offer`). None of the column bodies contain any candidate cards. | AC-6 |
| TC-US01-08 | Candidate with averageScore of 0 shows no score icons | mock | Intercept both API endpoints with fixture data. | 1. `page.route('**/positions/1/interviewFlow', ...)` → return `fixture-interview-flow.json`. 2. `page.route('**/positions/1/candidates', ...)` → return `fixture-candidates.json`. 3. Navigate to `/positions/1`. 4. Locate Carmen Vidal's card (score 0) inside the `Technical Interview` column. 5. Count `span[role="img"][aria-label="rating"]` elements within that card. | Zero score icon `<span>` elements are present inside Carmen Vidal's card. The card title "Carmen Vidal" is visible. | AC-4 |
| TC-US01-09 | Candidate with averageScore of 5 shows exactly 5 score icons | mock | Intercept both API endpoints with fixture data. | 1. `page.route('**/positions/1/interviewFlow', ...)` → return `fixture-interview-flow.json`. 2. `page.route('**/positions/1/candidates', ...)` → return `fixture-candidates.json`. 3. Navigate to `/positions/1`. 4. Locate Bruno Salas's card (score 5) inside the `CV Screening` column. 5. Count `span[role="img"][aria-label="rating"]` elements within that card. | Exactly 5 score icon `<span>` elements are present inside Bruno Salas's card. | AC-4 |
| TC-US01-10 | Candidate with unmatched currentInterviewStep does not appear on the board | mock | Intercept both API endpoints with fixture data. | 1. `page.route('**/positions/1/interviewFlow', ...)` → return `fixture-interview-flow.json`. 2. `page.route('**/positions/1/candidates', ...)` → return `fixture-candidates.json` (includes Elena Cruz with `currentInterviewStep: "UNKNOWN_STEP"`). 3. Navigate to `/positions/1`. 4. Search entire board for any element containing "Elena Cruz". | The text "Elena Cruz" does not appear anywhere on the page. The total number of visible candidate cards is 4 (Alice, Bruno, Carmen, David). | AC-3 |
| TC-US01-11 | Stage columns appear in the exact order defined by the API | mock | Intercept both API endpoints with fixture data. | 1. `page.route('**/positions/1/interviewFlow', ...)` → return `fixture-interview-flow.json`. 2. `page.route('**/positions/1/candidates', ...)` → return `[]`. 3. Navigate to `/positions/1`. 4. Collect all `.card-header` texts in DOM order. | Headers appear in this exact order: `CV Screening`, `Technical Interview`, `Culture Fit`, `Offer`. | AC-2 |
| TC-US01-12 | Position name from API is reflected in the page heading | mock | Intercept both API endpoints with fixture data. | 1. `page.route('**/positions/1/interviewFlow', ...)` → return `fixture-interview-flow.json` (positionName: "Senior Frontend Engineer"). 2. `page.route('**/positions/1/candidates', ...)` → return `[]`. 3. Navigate to `/positions/1`. 4. Read the `<h2>` text. | The `<h2>` element contains exactly "Senior Frontend Engineer". | AC-1 |

---

## Selector Strategy

The following selectors are derived from the actual component implementations in `PositionDetails.js`, `StageColumn.js`, and `CandidateCard.js`.

### Position Title
```
h2.text-center
```
- Rendered by `PositionDetails.js:113` as `<h2 className="text-center mb-4">{positionName}</h2>`.
- **No `data-testid`** is present. Recommend adding `data-testid="position-title"` to the `<h2>`.
- Fallback: `page.locator('h2')`

### Back Link ("Volver a Posiciones")
```
button:has-text("Volver a Posiciones")
```
- Rendered as a React-Bootstrap `<Button variant="link">` (`PositionDetails.js:110`), which produces a `<button>` in the DOM.
- **No `data-testid`** is present. Recommend adding `data-testid="back-to-positions"`.

### Stage Column Containers
```
.card          // each column is a Bootstrap Card
.card-header   // column header text (stage name)
.card-body     // column body containing candidate cards
```
- Rendered by `StageColumn.js:10–11`. Columns are `<Card>` elements; headers are `<Card.Header>`.
- **No `data-testid`** is present. Recommend adding `data-testid="stage-column-{stageName}"` to the `<Card>` and `data-testid="stage-header-{stageName}"` to `<Card.Header>`.
- To scope selectors by stage name: `page.locator('.card-header', { hasText: 'CV Screening' }).locator('..').locator('.card-body')`

### Candidate Cards
```
.card-body > .mb-2   // CandidateCard renders a nested Card with class mb-2
.card-title          // candidate full name
```
- Rendered by `CandidateCard.js:8–9` as a `<Card className="mb-2">` nested inside the column's `<Card.Body>`.
- **No `data-testid`** is present. Recommend adding `data-testid="candidate-card-{candidateId}"` to the outermost `<Card>` in `CandidateCard.js`.
- Candidate name: `page.locator('.card-title', { hasText: 'Alice Ramos' })`

### Score Icons
```
span[role="img"][aria-label="rating"]
```
- Rendered by `CandidateCard.js:19` as `<span role="img" aria-label="rating">🟢</span>`, one per score point.
- `aria-label="rating"` is already present — this selector is stable and accessible with no changes needed.
- To count icons within a specific card: `candidateCard.locator('span[role="img"][aria-label="rating"]')`

---

## Missing `data-testid` Attributes — Action Items

| Element | Component file | Recommended `data-testid` |
|---------|---------------|---------------------------|
| Position title `<h2>` | `PositionDetails.js:113` | `position-title` |
| Back link `<Button>` | `PositionDetails.js:110` | `back-to-positions` |
| Stage column `<Card>` | `StageColumn.js:10` | `stage-column` (+ unique suffix per stage) |
| Stage column `<Card.Header>` | `StageColumn.js:11` | `stage-header` (+ unique suffix per stage) |
| Candidate card `<Card>` | `CandidateCard.js:8` | `candidate-card` (+ candidateId suffix) |

Score icons already use `role="img"` and `aria-label="rating"` — no further changes needed.
