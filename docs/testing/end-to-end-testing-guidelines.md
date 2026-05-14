# End-to-end testing guidelines

E2E testing will be done using Playwright

## Useful commands

```bash
cd frontend && npx playwright test --ui # Interactive mode with UI
cd frontend && npx playwright test # Headless mode
cd frontend && npx playwright test tests/e2e/<spec-file>.spec.ts # Run a single spec file
cd frontend && npx playwright show-report # Show the HTML report
```

## Location

Place all E2E specs inside `frontend/tests/e2e/`.