## Context

The position page is a React component with a Kanban-style board where candidates are distributed across columns representing hiring phases. The UI supports drag-and-drop interactions powered by React DnD. When a candidate is moved between phases, a PUT `/candidate/:id` API call is made to update the backend state.

Playwright is installed and configured with support for headless parallel workers. The project uses pnpm as package manager. Playwright browsers (Chrome, Firefox, WebKit) are available locally and can run in parallel for fast test execution.

## Goals / Non-Goals

**Goals:**
- Create automated E2E tests that validate position page loads correctly with expected UI structure
- Test drag-and-drop candidate phase transitions with API verification
- Execute tests across all three browsers (Chrome, Firefox, WebKit) in headless parallel mode for comprehensive cross-browser coverage
- Use dynamic test data creation to ensure tests are independent and repeatable
- Use stable selectors (data-testid) for reliable test maintenance
- Provide a reusable test pattern for future E2E test development

**Non-Goals:**
- Unit or component-level testing
- Performance benchmarking or load testing
- Testing other pages or features outside the position page scope
- Modifying application source code to make tests pass
- Testing authentication or authorization flows

## Decisions

**1. Single spec file with two describe blocks**
- Create `frontend/tests/e2e/position.spec.ts` containing two test scenarios: page load and candidate phase change
- Rationale: Related tests stay together; easier to maintain. Splitting would add unnecessary complexity.
- Alternative: Multiple spec files per scenario (rejected: adds cognitive overhead without benefit for this scope)

**2. Use Playwright's network interception for API validation**
- Intercept PUT `/candidate/:id` requests to validate method, URL, body, and response status
- Rationale: Tests both UI and backend contract without modifying code
- Alternative: Mock API responses (rejected: loses valuable backend integration testing)

**3. Headless parallel workers across all three browsers in playwright.config.ts**
- Configure `fullyParallel: true`, workers based on CI env, test all browsers (chromium, firefox, webkit) with retries for flaky tests
- Rationale: Comprehensive cross-browser coverage ensures compatibility; parallel execution provides fast feedback
- Alternative: Single browser testing (rejected: misses cross-browser rendering issues)

**4. Dynamic test data creation via API**
- Create test candidates and positions dynamically at test runtime using backend API endpoints
- Setup in `beforeEach` hook to ensure fresh test data for each test
- Rationale: Tests are independent, repeatable, and don't depend on pre-seeded data; easier to clean up after tests
- Alternative: Hardcoded test data IDs (rejected: fragile, depends on database state, doesn't scale)

**5. Data-testid selectors as primary targeting strategy**
- Query elements using `data-testid` attributes; fall back to accessible roles if testid unavailable
- Rationale: Stable, maintainable, decouples tests from CSS/structure changes
- Alternative: CSS selectors (rejected: brittle, breaks on minor UI refactors)

**6. Playwright config with baseURL and auto-starting dev server**
- Set `baseURL: http://localhost:3000` and use `webServer` to auto-start the React dev server
- Rationale: Tests run against local dev environment; no manual server startup required
- Alternative: Assume server is running (rejected: error-prone and harder to automate in CI)

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Testing all three browsers increases test execution time | Parallel workers mitigate this; headless mode keeps it fast; acceptable trade-off for cross-browser confidence |
| Dynamic data creation adds test setup complexity | Use helper functions in beforeEach; keep setup simple and reliable |
| Dynamic data cleanup might fail, leaving orphaned records | Implement explicit teardown in afterEach; use unique identifiers to track test data |
| Headless mode misses browser-specific rendering bugs | Run full browser suite (headed mode) in local development; CI uses headless for speed |
| Parallel workers introduce test flakiness if state bleeds between tests | Ensure each test is fully independent; use unique test data per test; avoid hardcoded delays |
| Data-testid requires frontend code updates | Already documented in project README; updates are minimal and add test-friendly surface |
| Drag-and-drop timing issues with custom DnD libraries | Use Playwright's `waitForRequest` before drag to avoid race conditions; simulate at low level if needed |

## Migration Plan

1. Verify Playwright is installed and configured (already done)
2. Create test directory structure `frontend/tests/e2e/` (already done)
3. Implement specs for new capabilities
4. Create test data setup helpers (API calls to create candidates/positions)
5. Write position.spec.ts with two test scenarios using dynamic data
6. Run tests locally in headed mode to debug: `pnpm dlx playwright test --headed`
7. Run in headless mode across all browsers: `pnpm dlx playwright test`
8. Integrate into CI/CD pipeline to run in parallel headless mode (future work)

## Open Questions

- Which backend API endpoints should be used for dynamic test data creation? *Resolution: Identify candidate and position creation endpoints in backend*
- Should test data be cleaned up after each test? *Decision: Yes, implement explicit teardown to avoid test pollution*
