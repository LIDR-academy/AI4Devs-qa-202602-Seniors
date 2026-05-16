# BUG-001 — Race Condition: Candidates May Not Render on Kanban Board

## Status
Open

## Severity
High — intermittently causes the entire candidate list to disappear from the board on load.

## Detected by
TC-US02-01, TC-US02-02, TC-US02-03, TC-US02-04, TC-US02-05 (Happy Path — real backend)

## Description
`PositionDetails.js` fires `fetchInterviewFlow()` and `fetchCandidates()` in parallel inside a single `useEffect`. `fetchCandidates` sets candidate data by calling `setStages(prevStages => ...)`, which maps each candidate into the stage whose `title` matches `candidate.currentInterviewStep`. This mapping is only correct if `prevStages` already contains the stages populated by `fetchInterviewFlow`.

When `fetchCandidates` resolves **before** `fetchInterviewFlow`, `prevStages` is still `[]`, the map produces an empty array, and zero cards are placed on the board. The board renders columns with no candidates.

## Location
`frontend/src/components/PositionDetails.js`, lines 55–56:

```js
fetchInterviewFlow();
fetchCandidates();   // ← called in parallel; depends on state set by fetchInterviewFlow
```

## Reproduction
Intermittent — depends on which fetch resolves first. More likely under load or when the backend response time for `interviewFlow` is slightly slower than for `candidates`.

Reliably surfaced by running the happy-path Playwright suite (which resets DB state before each test via a `beforeEach` PUT, causing both endpoints to be hit with a cold React component mount every time).

## Expected behaviour
All candidate cards appear in their correct stage columns on every page load.

## Actual behaviour
On some loads, all stage columns render but contain zero candidate cards.

## Suggested fix
Chain the two fetches: call `fetchCandidates` only after `fetchInterviewFlow` has completed and `setStages` has been called. Alternatively, fetch both in parallel and merge the data in a single `setStages` call so no ordering dependency exists.
