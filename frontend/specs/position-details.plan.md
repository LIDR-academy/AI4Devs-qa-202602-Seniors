# Position Details Page Test Plan

## Application Overview

A React SPA for a recruitment tool. The Position Details page (`/positions/:id`) displays the job position title, a kanban-style board of interview stage columns, and candidate cards placed within their current stage. Data is fetched from a REST API at `http://localhost:3010`. The page also supports drag-and-drop to move candidates between stages and an offcanvas panel to view candidate details.

## Test Scenarios

### 1. Position Details Page

**Seed:** `tests/e2e/seed.spec.ts`

#### 1.1. Position title is displayed after page load

**File:** `tests/e2e/position-details/position-title.spec.ts`

**Steps:**
  1. Intercept GET `http://localhost:3010/positions/1/interviewFlow` and return a mock response: `{ interviewFlow: { positionName: 'Senior Frontend Engineer', interviewFlow: { interviewSteps: [{ id: 1, name: 'CV Review' }, { id: 2, name: 'Technical Interview' }, { id: 3, name: 'HR Interview' }] } } }`
    - expect: The network request is intercepted and the mock data is returned
  2. Intercept GET `http://localhost:3010/positions/1/candidates` and return an empty array `[]`
    - expect: The network request is intercepted and the empty array is returned
  3. Navigate to `http://localhost:3000/positions/1`
    - expect: The page loads without errors
  4. Look for an `<h2>` element with the text 'Senior Frontend Engineer'
    - expect: The heading 'Senior Frontend Engineer' is visible and centred on the page
    - expect: No other position name or placeholder text is shown in its place

#### 1.2. All interview stage columns are rendered

**File:** `tests/e2e/position-details/stage-columns.spec.ts`

**Steps:**
  1. Intercept GET `http://localhost:3010/positions/1/interviewFlow` and return a mock response with three interview steps: 'CV Review', 'Technical Interview', 'HR Interview'
    - expect: The request is intercepted successfully
  2. Intercept GET `http://localhost:3010/positions/1/candidates` and return an empty array
    - expect: The request is intercepted successfully
  3. Navigate to `http://localhost:3000/positions/1`
    - expect: The page loads without errors
  4. Count the card columns rendered inside the `DragDropContext` row — each column has a `Card.Header` with the stage name
    - expect: Exactly 3 stage columns are present
    - expect: Column 1 header reads 'CV Review'
    - expect: Column 2 header reads 'Technical Interview'
    - expect: Column 3 header reads 'HR Interview'
    - expect: The columns are displayed left to right in the order returned by the API
  5. Verify each column has an empty card body (no candidate cards inside)
    - expect: Each column body is empty because no candidates were returned

#### 1.3. Candidates appear in their correct stage column

**File:** `tests/e2e/position-details/candidates-in-correct-stage.spec.ts`

**Steps:**
  1. Intercept GET `http://localhost:3010/positions/1/interviewFlow` and return three stages: 'CV Review' (id 1), 'Technical Interview' (id 2), 'HR Interview' (id 3)
    - expect: The request is intercepted successfully
  2. Intercept GET `http://localhost:3010/positions/1/candidates` and return three candidates: `{ candidateId: 101, fullName: 'Alice Dupont', currentInterviewStep: 'CV Review', averageScore: 3, applicationId: 201 }`, `{ candidateId: 102, fullName: 'Bob Martin', currentInterviewStep: 'Technical Interview', averageScore: 4, applicationId: 202 }`, `{ candidateId: 103, fullName: 'Carol Smith', currentInterviewStep: 'HR Interview', averageScore: 2, applicationId: 203 }`
    - expect: The request is intercepted successfully
  3. Navigate to `http://localhost:3000/positions/1`
    - expect: The page loads without errors
  4. Locate the 'CV Review' column and inspect its candidate cards
    - expect: The 'CV Review' column contains exactly 1 candidate card
    - expect: The card displays the name 'Alice Dupont'
    - expect: The card shows 3 green circle rating indicators
  5. Locate the 'Technical Interview' column and inspect its candidate cards
    - expect: The 'Technical Interview' column contains exactly 1 candidate card
    - expect: The card displays the name 'Bob Martin'
    - expect: The card shows 4 green circle rating indicators
  6. Locate the 'HR Interview' column and inspect its candidate cards
    - expect: The 'HR Interview' column contains exactly 1 candidate card
    - expect: The card displays the name 'Carol Smith'
    - expect: The card shows 2 green circle rating indicators
  7. Verify no candidate card appears in a column other than the one matching their `currentInterviewStep`
    - expect: Alice Dupont is NOT present in 'Technical Interview' or 'HR Interview'
    - expect: Bob Martin is NOT present in 'CV Review' or 'HR Interview'
    - expect: Carol Smith is NOT present in 'CV Review' or 'Technical Interview'

#### 1.4. Multiple candidates in the same stage column are all displayed

**File:** `tests/e2e/position-details/multiple-candidates-same-stage.spec.ts`

**Steps:**
  1. Intercept GET `http://localhost:3010/positions/1/interviewFlow` and return two stages: 'CV Review' (id 1) and 'Technical Interview' (id 2)
    - expect: The request is intercepted successfully
  2. Intercept GET `http://localhost:3010/positions/1/candidates` and return two candidates both in 'CV Review': `{ candidateId: 101, fullName: 'Alice Dupont', currentInterviewStep: 'CV Review', averageScore: 3, applicationId: 201 }` and `{ candidateId: 104, fullName: 'David Lopez', currentInterviewStep: 'CV Review', averageScore: 1, applicationId: 204 }`
    - expect: The request is intercepted successfully
  3. Navigate to `http://localhost:3000/positions/1`
    - expect: The page loads without errors
  4. Inspect the 'CV Review' column
    - expect: The 'CV Review' column contains exactly 2 candidate cards
    - expect: One card shows 'Alice Dupont' with 3 rating indicators
    - expect: Another card shows 'David Lopez' with 1 rating indicator
  5. Inspect the 'Technical Interview' column
    - expect: The 'Technical Interview' column is empty — no candidate cards are shown

#### 1.5. Position page loads with no candidates

**File:** `tests/e2e/position-details/no-candidates.spec.ts`

**Steps:**
  1. Intercept GET `http://localhost:3010/positions/1/interviewFlow` and return two stages: 'CV Review' (id 1) and 'Technical Interview' (id 2)
    - expect: The request is intercepted successfully
  2. Intercept GET `http://localhost:3010/positions/1/candidates` and return an empty array `[]`
    - expect: The request is intercepted successfully
  3. Navigate to `http://localhost:3000/positions/1`
    - expect: The page loads without errors
  4. Inspect each stage column
    - expect: Both stage columns ('CV Review' and 'Technical Interview') are rendered
    - expect: Neither column contains any candidate cards
    - expect: The position title heading is still visible
    - expect: No error message is displayed

#### 1.6. Page handles API error for interview flow gracefully

**File:** `tests/e2e/position-details/api-error-interview-flow.spec.ts`

**Steps:**
  1. Intercept GET `http://localhost:3010/positions/1/interviewFlow` and return an HTTP 500 error response
    - expect: The request is intercepted and returns 500
  2. Intercept GET `http://localhost:3010/positions/1/candidates` and return an empty array
    - expect: The request is intercepted successfully
  3. Navigate to `http://localhost:3000/positions/1`
    - expect: The page does not crash or show an unhandled error
  4. Observe the page state
    - expect: No stage columns are rendered (stages remain empty)
    - expect: The position title heading is empty or absent (positionName defaults to empty string)
    - expect: The page structure (container, back button) is still visible
