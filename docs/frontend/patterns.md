# 🎯 Frontend: Architectural Patterns

## 💡 Convention

All components are functional React components using hooks for local state. There is no global state management or shared context.

## Patterns in Use

### Functional Components with `useState`

All components use function declarations or arrow functions with hooks for local state and effects. No class components exist.

```js
const AddCandidateForm = () => {
    const [candidate, setCandidate] = useState({ firstName: '', ... });
    const [error, setError] = useState('');
    ...
};
```

### Service Layer (Partial)

A `services/` folder exists, but only `candidateService.js` is present and it is not used by the routed UI.

> ⚠️ Ambiguous: `AddCandidateForm`, `FileUploader`, `Positions`, `PositionDetails`, and `CandidateDetails` all call `fetch` directly. The service layer is defined but not adopted in the active screens.

### Inline API Calls in Components

The current UI mixes presentation and data-fetching concerns by issuing `fetch` requests directly from components.

```js
const res = await fetch('http://localhost:3010/candidates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidateData)
});
```

The same pattern appears in the positions list, the position detail board, and the candidate detail offcanvas.

### Data Loading in `useEffect`

Read-heavy screens load data on mount with `useEffect`:

- `Positions.tsx` fetches visible positions.
- `PositionDetails.js` fetches interview flow and candidates for the selected position.
- `CandidateDetails.js` fetches the full candidate record when a card is opened.

### Hardcoded Base URL

All API calls target `http://localhost:3010` hardcoded — no environment variable abstraction.

> ⚠️ Ambiguous: `dotenv` is listed in dependencies, but no runtime API base URL abstraction exists in the frontend source.

### Drag-and-Drop Board

The position detail view uses `react-beautiful-dnd` to model interview stages as columns and candidates as draggable cards. After a drop, the UI updates local state optimistically and then persists the new step through the backend `PUT /candidates/:id` endpoint.

### No Custom Hooks

No custom hooks (`use*`) exist. State logic and side effects live directly in component bodies.

### No Global State / Context

No `React.createContext`, Redux, Zustand, or similar. All state is local to each component.

### Flat Component Hierarchy

No shared layout component or higher-order component (HOC) wraps the routes. Each route component is self-contained and renders its own `<Container>`.

## 🔗 Related agreements

- [conventions.md](./conventions.md)
- [services.md](./services.md)
- [component-catalog.md](./component-catalog.md)
