# Candidate Drag-and-Drop Between Stages

## Application Overview

A React SPA for a recruitment tool. The Position Details page (`/positions/:id`) displays a kanban-style board of interview stage columns with candidate cards. Candidates can be dragged and dropped between columns using `react-beautiful-dnd`. On drop, the UI moves the card to the new column and issues a `PUT /candidates/:id` request to update the candidate's current interview step in the backend.

## Test Scenarios

### 1. Candidate Drag-and-Drop Between Stages

**Seed:** `tests/e2e/seed.spec.ts`

#### 1.1. Moving a candidate to the next stage updates the UI and calls the correct API endpoint

**File:** `tests/e2e/position-details/drag-drop-candidate.spec.ts`

**Steps:**
  1. Intercept GET `http://localhost:3010/positions/1/interviewFlow` and return a mock with three stages: CV Review (id 1), Technical Interview (id 2), HR Interview (id 3)
    - expect: The network request is intercepted and mock data is returned
  2. Intercept GET `http://localhost:3010/positions/1/candidates` and return one candidate: `{ candidateId: 101, fullName: 'Alice Dupont', currentInterviewStep: 'CV Review', averageScore: 3, applicationId: 201 }`
    - expect: The network request is intercepted and mock data is returned
  3. Intercept PUT `http://localhost:3010/candidates/101` and capture the request body, then respond with HTTP 200 OK
    - expect: The route interceptor is registered successfully
  4. Navigate to `http://localhost:3000/positions/1`
    - expect: The page loads without errors
    - expect: Alice Dupont is visible in the 'CV Review' column
  5. Focus the 'Alice Dupont' candidate card in the 'CV Review' column
    - expect: The card receives keyboard focus
  6. Press Space to pick up the card
    - expect: The drag operation starts — `react-beautiful-dnd` announces the card is lifted
  7. Press ArrowRight once to move the card to the 'Technical Interview' column
    - expect: The card moves to the 'Technical Interview' column in the drag preview
  8. Press Space to drop the card in the 'Technical Interview' column
    - expect: Alice Dupont's card is now visible in the 'Technical Interview' column
    - expect: Alice Dupont's card is no longer visible in the 'CV Review' column
  9. Verify the PUT request was sent to `http://localhost:3010/candidates/101`
    - expect: Exactly one PUT request was made to the candidates endpoint
    - expect: Request body contains `applicationId: 201`
    - expect: Request body contains `currentInterviewStep: 2` (the id of 'Technical Interview')
    - expect: The backend responded with HTTP 200 OK

#### 1.2. Moving a candidate backward to a previous stage updates the UI and calls the correct API endpoint

**File:** `tests/e2e/position-details/drag-drop-candidate.spec.ts`

**Steps:**
  1. Intercept GET `http://localhost:3010/positions/1/interviewFlow` and return a mock with three stages: CV Review (id 1), Technical Interview (id 2), HR Interview (id 3)
    - expect: The network request is intercepted and mock data is returned
  2. Intercept GET `http://localhost:3010/positions/1/candidates` and return one candidate in the 'HR Interview' stage: `{ candidateId: 102, fullName: 'Bob Martin', currentInterviewStep: 'HR Interview', averageScore: 4, applicationId: 202 }`
    - expect: The network request is intercepted and mock data is returned
  3. Intercept PUT `http://localhost:3010/candidates/102` and capture the request body, then respond with HTTP 200 OK
    - expect: The route interceptor is registered successfully
  4. Navigate to `http://localhost:3000/positions/1`
    - expect: The page loads without errors
    - expect: Bob Martin is visible in the 'HR Interview' column
  5. Focus the 'Bob Martin' candidate card in the 'HR Interview' column
    - expect: The card receives keyboard focus
  6. Press Space to pick up the card, then press ArrowLeft twice to move to 'CV Review', then press Space to drop
    - expect: Bob Martin's card is now visible in the 'CV Review' column
    - expect: Bob Martin's card is no longer visible in the 'HR Interview' column
  7. Verify the PUT request body sent to `http://localhost:3010/candidates/102`
    - expect: Request body contains `applicationId: 202`
    - expect: Request body contains `currentInterviewStep: 1` (the id of 'CV Review')
    - expect: The backend responded with HTTP 200 OK
