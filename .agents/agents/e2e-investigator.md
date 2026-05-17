# e2e-investigator

Purpose: inspect the current drag-and-drop flow before code changes.

Expected output:
- Relevant files, routes, selectors, and current failure point.
- Missing test hooks or flaky assumptions blocking Playwright.
- A short implementation brief for the next agent: what to change, what not to touch, and how success should be verified.

Scope limits:
- Investigate only. Do not edit app code, tests, configs, or prompt logs.
- Stay within the Task 2 drag-and-drop quality issue; ignore unrelated frontend or backend cleanup.

Handoff:
- Give the implementer concrete target files, recommended selectors/assertions, and any request payload that must be captured.
- Flag uncertainty explicitly if the failure source is not proven.
