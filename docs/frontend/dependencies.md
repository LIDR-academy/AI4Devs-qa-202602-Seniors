# 🎯 Frontend: Dependencies

## Production Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | 18.x | UI framework |
| `react-dom` | 18.x | DOM rendering |
| `react-router-dom` | 6.x | Client-side routing |
| `bootstrap` | 5.x | CSS framework — imported globally in `App.js` |
| `react-bootstrap` | 2.x | Bootstrap components as React primitives |
| `react-beautiful-dnd` | 13.x | Drag-and-drop in the position detail board |
| `react-bootstrap-icons` | 1.x | Icon set — `Trash` icon used in `AddCandidateForm` |
| `react-datepicker` | 6.x | Date picker — used for education/work experience date fields |
| `react-dnd` | 16.x | Installed, but no current usage found in `src/` |
| `react-dnd-html5-backend` | 16.x | Installed, but no current usage found in `src/` |
| `typescript` | 4.x | Type checking (partial adoption) |
| `dotenv` | 16.x | Installed, but no active frontend runtime usage was found |
| `web-vitals` | 2.x | CRA performance measurement utility |

## Dev / Type Dependencies

| Package | Purpose |
|---|---|
| `@types/react` | TypeScript types for React |
| `@types/react-dom` | TypeScript types for ReactDOM |
| `@types/node` | TypeScript types for Node globals |
| `@types/jest` | TypeScript types for Jest |
| `@testing-library/react` | Component testing utilities |
| `@testing-library/jest-dom` | Custom Jest matchers for DOM |
| `@testing-library/user-event` | User interaction simulation |
| `@playwright/test` | Playwright test runner for E2E tests |
| `react-scripts` | CRA build tooling (webpack, babel, jest config) |

## Scripts

| Script | Command | Description |
|---|---|---|
| `start` | `react-scripts start` | Starts CRA dev server |
| `build` | `react-scripts build` | Produces optimized production build in `build/` |
| `test` | `jest --config jest.config.js` | Runs tests via custom Jest config (not `react-scripts test`) |
| `eject` | `react-scripts eject` | Ejects CRA config — irreversible |

> ⚠️ Ambiguous: `test` uses `jest --config jest.config.js` instead of `react-scripts test`. No `jest.config.js` was found in `frontend/`, so this script is currently misconfigured.

## Notable Gaps

- `candidateService.js` imports `axios`, but `axios` is not declared in `frontend/package.json`.
- Playwright is configured through `playwright.config.ts`, but `frontend/tests/e2e/` is currently empty.

## 🔗 Related agreements

- [project-overview.md](./project-overview.md)
- [patterns.md](./patterns.md)
