# Test Defects Register

## DEF-001 — Incorrect page navigation in BDD steps

**Status:** OPEN  
**Severity:** 🔴 CRITICAL  
**Discovered:** 2026-05-16

**Summary:** Tests navigate to `/positions` (positions list) instead of `/positions/{id}` (Kanban board), causing all scenarios to fail with selector/timeout errors.

**Affected Tests:**
- Position board loads correctly
- A candidate is moved to the next interview stage
- Backend fails to update candidate stage
- Reordering candidate within the same interview stage
- Empty interview stages render as drop targets

**Root Cause:** Step definition `Given('I navigate to the positions page')` uses hardcoded URL `http://localhost:3000/positions` which is a list view, not the Kanban board. The Kanban board requires a position ID: `http://localhost:3000/positions/{id}`.

**Reproduction Steps:**
1. Run `npx playwright test --project=bdd-chromium`
2. All 5 scenarios fail

**Expected Behavior:** Tests should navigate to the Kanban board for position ID 1: `http://localhost:3000/positions/1`

**Fix Required:** Update `positions.steps.ts` line 9:
```typescript
// Change from:
await page.goto('http://localhost:3000/positions');

// To:
await page.goto('http://localhost:3000/positions/1');
```

**Fixed:** ❌ Pending

---

## DEF-002 — Incorrect backend API port in step definitions

**Status:** OPEN  
**Severity:** 🔴 CRITICAL  
**Discovered:** 2026-05-16

**Summary:** Step definitions make API calls to `http://localhost:5000/api/candidates/*` but the backend actually runs on port 3010.

**Root Cause:** Backend is configured to run on port 3010 per `docker-compose.yml` and `backend/.env`. Tests assume port 5000.

**Reproduction Steps:**
1. Any step that makes a PUT request to `/candidates/:id` will fail

**Fix Required:** Update all `page.route()` and `page.waitForResponse()` calls to use `http://localhost:3010/` instead of `http://localhost:5000/`.

**Fixed:** ❌ Pending

---

## DEF-003 — Incorrect CSS/DOM selectors for Bootstrap Card structure

**Status:** OPEN  
**Severity:** 🔴 CRITICAL  
**Discovered:** 2026-05-16

**Summary:** Selectors use generic patterns like `[class*="stage"]` and `[class*="column"]` which don't match the actual Bootstrap Card structure used by the frontend.

**Root Cause:** Frontend uses:
- `<Card>` for stage columns
- `<Card.Header>` for stage titles
- CandidateCard components for candidates

Tests assume custom HTML with "stage" or "column" class patterns.

**Reproduction Steps:**
1. Run step "all interview stages are rendered as columns"
2. Step expects to find `[class*="stage"], [class*="column"]` elements
3. Actual page has none; only Bootstrap Card components

**Fix Required:** Update selectors:
```typescript
// Stage columns:
page.locator('.card')  // Bootstrap Card components

// Stage titles:
page.locator('.card-header')  // Card.Header components

// Candidates:
page.locator('[role="listitem"]')  // Or use card-body contents
```

**Fixed:** ❌ Pending

---

## DEF-004 — Missing position title selector

**Status:** OPEN  
**Severity:** 🟠 MEDIUM  
**Discovered:** 2026-05-16

**Summary:** Step "I see the position title is displayed" looks for `h1` or `[class*="title"]` but the actual page has an `<h2>` with `className="text-center mb-4"` containing the position name.

**Fix Required:** Update selector:
```typescript
page.locator('h2.text-center')  // Or just page.locator('h2').first()
```

**Fixed:** ❌ Pending

---

## Summary

| ID | Issue | Severity | Status |
|----|----|----------|--------|
| DEF-001 | Wrong page URL | 🔴 CRITICAL | OPEN |
| DEF-002 | Wrong API port | 🔴 CRITICAL | OPEN |
| DEF-003 | Wrong selectors | 🔴 CRITICAL | OPEN |
| DEF-004 | Wrong title selector | 🟠 MEDIUM | OPEN |
| **Total** | **4** | — | **All OPEN** |

**Blocking:** All test scenarios are blocked until DEF-001, DEF-002, and DEF-003 are fixed.
