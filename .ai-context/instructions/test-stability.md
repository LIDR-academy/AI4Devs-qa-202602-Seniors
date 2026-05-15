# Test Stability & Debugging

Rules for ensuring tests are reliable, debuggable, and CI-friendly.

## Stability Rules

1. **Three-pass verification**: A new test must pass 3 consecutive runs before being considered stable.
   ```bash
   npx playwright test <test-file> --repeat-each=3
   ```
2. **No `sleep` or fixed waits**: Use Playwright auto-waiting, `waitForSelector`, `waitForResponse`, or `expect` with built-in retries.
3. **Trace on failure**: `trace: 'on-first-retry'` in Playwright config — always.
4. **Screenshots on failure**: Enable `screenshot: 'only-on-failure'` for CI debugging.
5. **Video on failure**: Enable `video: 'retain-on-failure'` to capture interaction flow.

## CI Configuration

```typescript
// playwright.config.ts essentials for CI
{
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
}
```

## Flakiness Diagnosis

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Passes alone, fails in suite | Shared state between tests | Fix isolation — each test owns its data |
| Passes locally, fails in CI | Timing or viewport difference | Add explicit waits, set viewport |
| Intermittent timeout | Network or animation race | Use `waitForResponse` or `waitForLoadState` |
| Element not found sometimes | Dynamic rendering | Use `expect(locator).toBeVisible()` with retry |

## Error Recovery Protocol

| Situation | Action |
|-----------|--------|
| Element not found | Check if `data-testid` exists. If not, propose adding it |
| Flaky timing | Replace sleep with `waitFor` / `expect` with timeout |
| Test passes alone, fails in suite | Fix isolation — test leaks state |
| API returns unexpected data | Verify seed data, check backend is running |
| Selector breaks after UI change | Update POM, not the test |
