# 🎯 Frontend: Conventions

## 💡 Convention

Components use PascalCase filenames; services and assets use camelCase. The codebase mixes `.js` and `.tsx` extensions without a consistent rule.

## Language Mix

| Extension | Used for |
|---|---|
| `.tsx` | `index.tsx`, `Positions.tsx` |
| `.js` | `App.js`, all other components, all services |
| `.ts` | `reportWebVitals.ts`, `react-app-env.d.ts` |

> ⚠️ Ambiguous: There is no enforced rule for when to use TypeScript vs JavaScript. `Positions.tsx` is the only typed feature component; the rest of the routed UI is plain JavaScript.

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Component files | PascalCase | `RecruiterDashboard.js`, `AddCandidateForm.js` |
| Component functions | PascalCase | `const RecruiterDashboard = () => ...` |
| Service files | camelCase | `candidateService.js` |
| State variables | camelCase | `successMessage`, `candidate` |
| Event handlers | `handle` prefix + camelCase | `handleSubmit`, `handleInputChange` |
| Props | camelCase | `onChange`, `onUpload` |

## TypeScript Usage

`Positions.tsx` is the only feature component that uses TypeScript features (type alias, typed state shape, `React.FC`). `index.tsx` remains typed only for the CRA bootstrap.

```tsx
type Position = {
    title: string;
    manager: string;
    deadline: string;
    status: 'Abierto' | 'Contratado' | 'Cerrado' | 'Borrador';
};

const Positions: React.FC = () => { ... };
```

All other components are untyped JavaScript functions with no prop types or JSDoc.

## 🔗 Related agreements

- [patterns.md](./patterns.md)
- [project-overview.md](./project-overview.md)
