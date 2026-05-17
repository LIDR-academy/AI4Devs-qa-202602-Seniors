# playwright-mcp-debugging

## Purpose

Define when and how to use the Cursor Playwright MCP (`user-playwright`) to inspect the running `position` interface, validate selectors, observe drag-and-drop, and trace network traffic. The skill enforces that MCP observations are translated into committed code, defects, or report notes — they MUST NOT remain only in chat memory.

## When to Use This Skill

Use the Playwright MCP when:

- Selector strategy is unclear and the rendered DOM must be inspected before committing a test.
- Drag-and-drop behavior must be validated against `react-beautiful-dnd` expectations.
- Outbound network requests (especially `PUT /candidates/:id`) must be captured during a real flow.
- A test is flaky and needs trace, screenshot, or pointer-event analysis.
- The actual UI behavior must be compared with the approved BDD specification.

## Required Inputs

- The Playwright MCP server descriptors under `mcps/user-playwright/tools/`.
- Running frontend (`http://localhost:3000`) and backend (`http://localhost:3010`) services with seeded data.
- Approved specifications under `docs/specs/e2e/`.
- Output of `position-interface-analysis`.

## Procedure

1. Read the MCP tool descriptors before calling any MCP tool (`mcps/user-playwright/tools/*.json`).
2. Launch a Playwright browser via MCP at `http://localhost:3000` and navigate to the position route under test.
3. Inspect the DOM:
   - Confirm the position title element.
   - Confirm the hiring phase column headers.
   - Confirm candidate cards in each column.
4. Validate accessible selectors (`getByRole`, accessible names, stable text) before falling back to `data-testid` or CSS.
5. Exercise drag-and-drop interactively to confirm the pointer event sequence required by `react-beautiful-dnd`.
6. Capture network traffic:
   - Confirm the request method, URL path, and JSON body for the candidate phase update (`PUT /candidates/:id`, body `{ applicationId, currentInterviewStep }`).
   - Capture the response status to confirm backend success.
7. Capture traces and screenshots as needed for debugging.
8. Translate every MCP observation into one of:
   - A committed Playwright test assertion under `frontend/tests/e2e/`.
   - A defect file in `docs/bugs/<defect-id>.md`.
   - A report note in `docs/reports/<report-id>.md`.
9. Avoid leaving MCP-only findings undocumented.

## Quality Checklist

- [ ] MCP tool descriptors were read before invocation.
- [ ] Required services were running with seeded data.
- [ ] Selector decisions are based on inspected DOM, not assumed structure.
- [ ] Drag-and-drop verification used real pointer events compatible with `react-beautiful-dnd`.
- [ ] Network traffic was observed for the candidate phase update.
- [ ] Observations were committed to tests, defects, or reports.

## Expected Outputs

- Updated Playwright tests reflecting MCP findings.
- New or updated defect files when MCP exposes a product or testability issue.
- New or updated report notes when MCP confirms or invalidates assumptions.

## Failure Conditions

- MCP tools were called without reading their descriptors.
- Required services were not running and the agent did not document the limitation.
- MCP observations did not produce a committed artifact (test, defect, or report).
- Sensitive data captured in traces or screenshots was not scrubbed.
