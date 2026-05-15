# Test Validation & Maintenance

Rules for assertions, validation strategy, and ongoing test health.

## Validation Rules

1. **Double validation**: Assert both UI state AND backend communication (network response or API state).
2. **Meaningful assertions**: Assert business outcomes, not implementation details.
3. **No over-assertion**: Don't assert things unrelated to the scenario under test.

## Double Validation Pattern

```typescript
// Assert UI state
await expect(page.getByTestId('candidate-card-5')).toBeVisible();

// Assert backend communication
const response = await page.waitForResponse('**/api/candidates*');
expect(response.status()).toBe(200);
const data = await response.json();
expect(data).toHaveLength(5);
```

## Maintenance Rules

1. **Ignored test = tech debt**: A skipped/disabled test must have a linked issue and a deadline for resolution.
2. **Update tests with features**: When the system evolves, tests evolve in the same PR.
3. **Review quarterly**: Audit test suite for relevance, duplicates, and coverage gaps.

## Test Health Indicators

| Indicator | Healthy | Action needed |
|-----------|---------|---------------|
| Skipped tests | 0 | Create issue, fix or remove |
| Flaky rate | < 1% | Investigate top offenders |
| Run time | < 5 min (full suite) | Parallelize or optimize |
| Coverage gaps | All critical paths tested | Add missing scenarios |
| Stale POMs | Match current UI | Update after UI changes |

## When to Write vs Skip a Test

| Write | Skip |
|-------|------|
| Business-critical flow | Pure visual styling |
| Data integrity | Third-party widget internals |
| User-facing error handling | Browser-specific rendering |
| Navigation and routing | Animations/transitions |
| Form submission + validation | Performance (use separate tools) |
