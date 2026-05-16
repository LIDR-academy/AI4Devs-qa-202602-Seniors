# US-02 — Move Candidate to a Different Interview Stage

> As a recruiter, I want to drag a candidate card from one stage column and drop it into another so that the board reflects the candidate's new interview stage immediately.

## Acceptance Criteria

1. **Given** a candidate card is visible in a stage column  
   **When** the recruiter drags the card and drops it into a different stage column  
   **Then** the card disappears from the source column and appears in the destination column at the position where it was dropped, without a page reload.

2. **Given** the recruiter has dropped a candidate into a new stage column  
   **When** the drop is complete  
   **Then** the application sends a `PUT /candidates/:candidateId` request with `applicationId` (as a number) and `currentInterviewStep` set to the numeric `id` of the destination stage.

3. **Given** a candidate card is being dragged  
   **When** the recruiter drops the card back into the same column it started in  
   **Then** the card is repositioned within that column according to where it was dropped, and a `PUT /candidates/:candidateId` request is still sent to the API with the same destination stage id.

4. **Given** a candidate card is being dragged  
   **When** the recruiter releases the card outside any column (no valid drop target)  
   **Then** the card returns to its original column and position, and no API request is made.

5. **Given** the recruiter has dropped a candidate into a new stage column (optimistic update)  
   **When** the API call to persist the change fails (non-2xx or network error)  
   **Then** the card remains in the destination column — the UI is not rolled back to the previous state.

## Data & API

| Field | Endpoint | Notes |
|-------|----------|-------|
| Update candidate stage | `PUT /candidates/:candidateId` | Body: `{ applicationId: number, currentInterviewStep: number }` — `currentInterviewStep` is the numeric `id` of the destination stage column, not its name |

## Test Boundaries

- There is no rollback of the optimistic UI update on API failure; verifying recovery after a failed PUT is out of scope.
- Keyboard-based drag-and-drop accessibility interactions are not explicitly implemented and are out of scope.
- The order of cards within a column is not persisted to the backend; only the stage assignment is saved, so verifying card order after a page refresh is out of scope.
- Dragging a card when the API is unavailable produces no user-visible feedback beyond a `console.error`; error messaging is out of scope.
- Multi-card drag (dragging more than one card at once) is not supported and is out of scope.
