# 🎯 Frontend: Styling Approach

## 💡 Convention

All UI is styled using Bootstrap 5 utility classes via `react-bootstrap` components. There are no CSS modules, styled-components, or custom design tokens.

## Styling Layers

| Layer | File / Source | Role |
|---|---|---|
| Global reset | `src/index.css` | Body font stack, antialiasing |
| Legacy scaffold | `src/App.css` | CRA default styles — unused in active components |
| Bootstrap utilities | `bootstrap/dist/css/bootstrap.min.css` | Imported in `App.js` |
| Inline styles | Component JSX | Used sparingly for one-off sizing and simple visual cues |

## Bootstrap Usage

Components import layout and UI primitives from `react-bootstrap`:

```js
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
```

Utility classes applied directly on JSX elements:

```jsx
<Container className="mt-5">
<Card className="shadow p-4">
<h1 className="mb-4 text-center">
```

## Inline Styles

Used only for small one-off presentation rules where a utility class is insufficient:

```jsx
<img src={logo} alt="LTI Logo" style={{ width: '150px' }} />
```

`CandidateDetails.js` also uses inline color styles to render the score selector stars.

## Status Badge Coloring

`Positions.tsx` applies Bootstrap background classes via a ternary expression:

```tsx
className={`badge ${
    position.status === 'Abierto' ? 'bg-warning' :
    position.status === 'Contratado' ? 'bg-success' :
    position.status === 'Borrador' ? 'bg-secondary' :
    'bg-warning'  // ⚠️ 'Cerrado' falls through to bg-warning — likely a bug
} text-white`}
```

## `App.css` — Legacy / Unused

`App.css` defines `.App`, `.App-header`, `.App-logo`, `.App-link` — all CRA scaffold classes. None are used in the active components (`RecruiterDashboard`, `AddCandidateForm`, `Positions`, `FileUploader`).

> `App.css` is present in `src/`, but no current import path references it. These scaffold styles have no effect on the rendered application.

## `index.css` — Global Reset

```css
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', ...;
}
```

Minimal global reset; Bootstrap's reboot provides additional normalization.

## No Design Tokens

No CSS custom properties (`--var`), theme configuration, or design token system exists.

## 🔗 Related agreements

- [dependencies.md](./dependencies.md)
- [project-overview.md](./project-overview.md)
