# Selectors

Rules for locating elements in E2E tests. Applies to any Playwright-based test regardless of BDD layer.

## Rules

1. **Stable selectors only**: Use accessible roles (`getByRole`), labels (`getByLabel`), `getByTestId`, or `data-testid` attributes. Never use CSS classes, auto-generated IDs, or DOM structure selectors.
2. **Priority order**: `getByRole` > `getByLabel` > `getByTestId` > `getByText`. A class name change must never break a test.
3. **Recommended `data-testid` naming**: `{component}-{element}[-{qualifier}]` (e.g., `candidate-card-1`, `phase-column-applied`, `position-title`).

## Priority Table

| Priority | Method | Example |
|----------|--------|---------|
| 1 | Role | `page.getByRole('button', { name: 'Submit' })` |
| 2 | Label | `page.getByLabel('Email')` |
| 3 | TestId | `page.getByTestId('candidate-card-1')` |
| 4 | Text | `page.getByText('Welcome back')` |

## NEVER use

- CSS class selectors (`.btn-primary`, `.card-header`)
- Auto-generated IDs (`#react-select-2-input`)
- XPath expressions
- DOM structure (`div > ul > li:nth-child(3)`)
- Tag-only selectors (`button`, `input`)

## When no stable selector exists

1. Propose adding a `data-testid` to the source component
2. List it in the PR description under "Test infrastructure changes"
3. Follow naming convention: `{component}-{element}[-{qualifier}]`

## Recommended `data-testid` Attributes (Project-specific)

| Element | `data-testid` |
|---------|---------------|
| Position title | `position-title` |
| Phase column | `phase-column-{phase}` |
| Candidate card | `candidate-card-{id}` |
| Candidate name | `candidate-name` |
| Candidate score | `candidate-score` |
| Add candidate form | `add-candidate-form` |
| Submit button | `submit-button` |
| Error message | `error-message` |
| Loading spinner | `loading-spinner` |
