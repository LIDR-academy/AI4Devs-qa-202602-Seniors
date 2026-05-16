# Position Board Test Plan

**Date:** 2026-05-16  
**Feature:** Position Kanban Board Interface  
**Application:** LTI Talent Tracking System

## Overview

The Position Board is a Kanban-style interface for managing candidates through interview stages. This test plan covers functional validation of:
- Visual rendering of interview stages and candidates
- Drag-and-drop candidate movement between stages
- Backend API integration (PUT /candidates/:id)
- Error handling and UI reversion on failure

## Test Environment

- **Frontend:** React 18.3, running on http://localhost:3000
- **Backend:** Node.js/Express, running on http://localhost:5000
- **Database:** PostgreSQL (Docker)
- **Test Framework:** Playwright + playwright-bdd (Gherkin)

## Key Selectors & UI Elements

### Position Board Structure
- **Position Title:** `h1` or `[class*="title"]`
- **Stage Columns:** `[class*="stage"]`, `[class*="column"]`, `.interview-stage`
- **Candidate Cards:** `[class*="candidate"]`, `.candidate-card`, `[role="listitem"]`
- **Drop Zones:** `[class*="drop"]`, `[class*="zone"]`
- **Error Messages:** `[class*="error"]`, `[role="alert"]`, `.alert`

### API Contract

**Endpoint:** `PUT /candidates/:id`

**Request Body:**
```json
{
  "applicationId": <number>,
  "currentInterviewStep": <number>
}
```

**Response (2xx):**
```json
{
  "message": "Candidate stage updated successfully",
  "data": { candidate_object }
}
```

**Error Response (5xx):**
```json
{
  "message": "Error updating candidate stage",
  "error": "Internal Server Error"
}
```

## Test Scenarios

### Scenario 1: Position Board Loads Correctly (@happy)
**Objective:** Verify the page loads with all visual elements.

**Steps:**
1. Navigate to /positions
2. Wait for board to load
3. Assert position title is visible
4. Assert all interview stages (Applied, Interview, Offer) render as columns
5. Assert candidates appear in correct columns per their currentInterviewStep

**Expected Result:** All visual elements present, candidates in correct columns

---

### Scenario 2: Candidate Moves to New Stage (@happy)
**Objective:** Verify drag-and-drop triggers API call and updates UI.

**Steps:**
1. Navigate to /positions
2. Identify candidate in "Applied" stage
3. Drag candidate to "Interview" stage
4. Assert PUT /candidates/:id request fires
5. Assert request body has { applicationId, currentInterviewStep }
6. Assert response is 2xx
7. Assert candidate visually appears in "Interview" column

**Expected Result:** Candidate moved, API called, UI updated

---

### Scenario 3: Backend Failure Reverts Move (@sad)
**Objective:** Verify UI reverts when backend returns 500.

**Setup:** Mock backend to return 500 on PUT /candidates/:id

**Steps:**
1. Navigate to /positions
2. Attempt to move a candidate
3. Backend returns 500 error
4. Assert candidate remains in original stage
5. Assert error message displayed

**Expected Result:** Move reverted, error shown to user

---

### Scenario 4: Reordering in Same Stage (@edge)
**Objective:** Verify no API call when dropping in same stage.

**Steps:**
1. Navigate to /positions
2. Find two candidates in "Interview" stage
3. Reorder first candidate to position 2
4. Assert no PUT request fired
5. Assert candidate position updated visually

**Expected Result:** No API call, visual reorder only

---

### Scenario 5: Empty Stage Renders (@edge)
**Objective:** Verify empty stages display as valid drop targets.

**Steps:**
1. Navigate to /positions
2. Assert "Offer" stage column visible
3. Assert "Offer" has 0 candidates
4. Assert "Offer" column is a valid drop target (boundingBox exists)

**Expected Result:** Empty column renders, can receive drops

---

## Data Dependencies

- **Position:** Must have ≥2 interview stages (Applied, Interview, Offer)
- **Candidates:** Must have ≥3 candidates distributed across stages
- **Applications:** Candidates must be linked to applications with valid applicationId

## Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| Flaky drag-drop timing | Add `waitForTimeout(300)` after drag operations |
| Backend not running | webServer block auto-starts backend |
| Selector instability | Use text, role, class selectors; avoid data-testid |
| Network race conditions | Use `waitForResponse()` for API assertions |

## Success Criteria

- [x] 5 scenarios authored in Gherkin
- [x] All scenarios use single `When` per scenario
- [x] Domain language consistent (candidate, stage, position)
- [x] No DOM ids or JSON in steps
- [x] Network assertions validate PUT contract
- [x] Tests run on chromium, firefox, webkit
- [x] playwright.config.ts wired for BDD + webServer

---

**Authored by:** playwright-bdd-tester sub-agent  
**Last Updated:** 2026-05-16
