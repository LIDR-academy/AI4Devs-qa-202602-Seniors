# Position Board (Kanban) Test Plan

## Application Overview
The LTI Talent Tracking System features a Kanban board for managing candidate progression through interview stages. Users access this board at `/positions/:id`, where:
- The page displays the position title (e.g., "Senior Full-Stack Engineer")
- Interview stages are rendered as columns (Applied, Phone Screen, Interview, Offer)
- Candidates appear as draggable cards within their current stage column
- Drag-and-drop moves a candidate to a new interview stage
- Backend is updated via `PUT /candidates/:id` with payload `{ applicationId, currentInterviewStep }`

## UI Selectors & Layout

### Page Structure
- **Position title**: `<h2 className="text-center mb-4">` with positionName text
- **Stage columns**: `<Col md={3}>` containers, each with `<Card>` wrapping `<Droppable>`
- **Stage header**: `<Card.Header className="text-center">` displays stage title (e.g., "Applied", "Phone Screen")
- **Droppable zone**: `droppableId={index}` (0 = first stage, etc.)
- **Candidate cards**: `<Card className="mb-2">` within each stage, draggable via `react-beautiful-dnd`
- **Candidate name**: `<Card.Title>` displays candidate.name
- **Rating**: Visual indicator (green circles)

### Key Selectors
- Stage title text (e.g., text="Applied")
- Candidate name text (e.g., text="John Doe")
- Stage column by card header text
- Drag handle: Entire card is draggable (via `draggableId={candidate.id}`)

## Test Scenarios

### Scenario 1: Position Board Loads Correctly (Happy Path)
**Given** the recruiter navigates to the position board for a position with existing candidates and interview stages
**When** the page loads
**Then** the position title is displayed
**And** all interview stages (Applied, Phone Screen, Interview, Offer) appear as columns
**And** each candidate appears in the column matching their `currentInterviewStep`
**Selectors**: h2 text, Card headers, candidate cards in columns
**API calls**: GET /positions/{id}/interviewFlow, GET /positions/{id}/candidates (no PUT)

### Scenario 2: A Candidate is Moved to a New Stage (Happy Path - Single Drag)
**Given** the recruiter views the position board with a candidate in "Applied" stage
**When** the recruiter drags the candidate to "Phone Screen" stage
**Then** the candidate card visually moves to the "Phone Screen" column
**And** a PUT request is dispatched to /candidates/{candidateId} with body `{ applicationId, currentInterviewStep: stageId }`
**And** the response status is 2xx
**Selectors**: Drag candidate card by text, drop in stage column
**Network assertion**: PUT /candidates/:id, response 200-299
**Payload**: `{ applicationId: number, currentInterviewStep: number }`

### Scenario 3: Multiple Candidates in Sequence (Edge Case - Scenario Outline)
**Given** the recruiter views the position board with multiple candidates
**When** the recruiter moves candidate A to stage 2, then candidate B to stage 3
**Then** each move triggers a separate PUT request with correct payload
**And** both candidates appear in their new stages
**Test data**: Use parameterized examples with candidate names and stage indices

### Scenario 4: Backend Returns 500 on Stage Change (Sad Path - Error Handling)
**Given** the recruiter views the position board with a candidate
**When** the recruiter drags the candidate to a new stage
**And** the backend returns a 500 error
**Then** the UI reverts the candidate card to its original stage
**And** an error message is displayed to the recruiter
**Selectors**: Error toast/alert container, error text
**Network assertion**: Verify 500 response, check UI revert action

### Scenario 5: Drop on the Same Stage (Edge Case - Optimization)
**Given** the recruiter views the position board with a candidate in "Applied"
**When** the recruiter drags the candidate within "Applied" and drops it
**Then** no PUT request is fired (optimization: same-stage drop is ignored)
**And** the candidate remains in "Applied"
**Network assertion**: Verify no PUT request for same-stage drop

### Scenario 6: Empty Stage Column Renders (Edge Case - UI Rendering)
**Given** the recruiter views the position board
**And** one stage has no candidates (e.g., "Offer" is empty)
**When** the page loads
**Then** the empty stage column is rendered with its header
**And** the column is a valid drop target (visual placeholder visible)
**Selectors**: Stage header text, empty Card.Body with placeholder
**Interaction**: Drag a candidate into the empty column to verify drop zone works

## Network Assertions

| Method | Route | Payload | Response |
|--------|-------|---------|----------|
| PUT | `/candidates/:id` | `{ applicationId: number, currentInterviewStep: number }` | 200-299 |
| GET | `/positions/:id/interviewFlow` | - | 200, returns interviewFlow array |
| GET | `/positions/:id/candidates` | - | 200, returns candidate array |

## Test Environment
- **Frontend**: http://localhost:3000 (React app with react-beautiful-dnd)
- **Backend**: http://localhost:3010 (Node/Express API)
- **Base URL for tests**: http://localhost:3000/positions/1 (use position ID 1 with seeded data)
- **Browser**: Chromium (primary), Firefox and WebKit (regression check)

## Data Dependencies
- Assumes position ID 1 exists with title "Senior Full-Stack Engineer"
- Assumes at least 2 interview stages (Applied, Phone Screen) with candidates seeded in database
- Stage IDs from backend: 1=Applied, 2=Phone Screen, 3=Interview, 4=Offer (or verify from API response)

## Risks & Mitigations
1. **Drag-and-drop timing**: react-beautiful-dnd may need waits for animation. Use Playwright's `waitForSelector` with stage column text.
2. **Backend mock for sad path**: Mock the PUT endpoint to return 500. Use `page.route()` for interception.
3. **Same-stage detection**: Verify currentInterviewStep doesn't change if dropped in same column.
4. **Cross-browser dnd**: Ensure react-beautiful-dnd works in Firefox/WebKit (known issues with pointer events).
