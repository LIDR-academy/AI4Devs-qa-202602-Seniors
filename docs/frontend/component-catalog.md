# 🎯 Frontend: Component Catalog

## Components

### `RecruiterDashboard`

| Field | Details |
|---|---|
| File | `src/components/RecruiterDashboard.js` |
| Type | Functional, no props |
| Route | `/` |
| Responsibility | Landing page — shows two navigation cards linking to add-candidate and positions views |

**Renders:**
- LTI logo from `src/assets/lti-logo.png`
- Two `Card` + `Button` elements linking to `/add-candidate` and `/positions` via `react-router-dom` `<Link>`

---

### `AddCandidateForm`

| Field | Details |
|---|---|
| File | `src/components/AddCandidateForm.js` |
| Type | Functional, no props |
| Route | `/add-candidate` |
| Responsibility | Full candidate creation form with dynamic sections for education and work experience |

**Local state shape:**
```js
{
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  educations: [],       // { institution, title, startDate, endDate }
  workExperiences: [],  // { company, position, description, startDate, endDate }
  cv: null              // { filePath, fileType } after upload
}
```

**Key behaviors:**
- Dynamically adds/removes education and work experience entries.
- Date fields use `react-datepicker`; formatted to `YYYY-MM-DD` before submission.
- Submits via `fetch` directly to `http://localhost:3010/candidates` (bypasses `candidateService.js`).
- Displays `Alert` on success or error.
- CV upload delegated to `FileUploader` component.

> ⚠️ Ambiguous: API call uses `fetch` directly instead of the `candidateService.js` service module.

---

### `FileUploader`

| Field | Details |
|---|---|
| File | `src/components/FileUploader.js` |
| Type | Functional |
| Used by | `AddCandidateForm` |
| Responsibility | File picker + upload button that POSTs a file to the backend and returns the stored file metadata |

**Props:**

| Prop | Type | Description |
|---|---|---|
| `onChange` | `(file: File) => void` | Called on file selection with the raw `File` object |
| `onUpload` | `(fileData: object) => void` | Called after successful upload with `{ filePath, fileType }` |

**Key behaviors:**
- Shows a `Spinner` while uploading.
- POSTs to `http://localhost:3010/upload` via `fetch`.
- Displays "Archivo subido con éxito" on success.

---

### `Positions`

| Field | Details |
|---|---|
| File | `src/components/Positions.tsx` |
| Type | Functional, typed (`React.FC`), no props |
| Route | `/positions` |
| Responsibility | Displays a list of positions with filter controls |

**Data:** Fetches visible positions from `GET http://localhost:3010/positions` on mount and formats `applicationDeadline` as `DD/MM/YYYY`.

**Position type:**
```tsx
type Position = {
    id: number;
    title: string;
    contactInfo: string;
    applicationDeadline: string;
    status: 'Open' | 'Contratado' | 'Cerrado' | 'Borrador';
};
```

**Filter controls (UI only — not wired to data):** title text, date, status select, manager select.

**Navigation actions:**
- `Ver proceso` routes to `/positions/:id`.
- `Editar` is presentational only.

**Status badge colors:**

| Status | Bootstrap class |
|---|---|
| `Open` | `bg-warning` |
| `Contratado` | `bg-success` |
| `Borrador` | `bg-secondary` |
| `Cerrado` | `bg-warning` (falls through to the default branch) |

---

### `PositionDetails`

| Field | Details |
|---|---|
| File | `src/components/PositionDetails.js` |
| Type | Functional, no props |
| Route | `/positions/:id` |
| Responsibility | Kanban board showing all interview steps for a position, with candidate cards in each column |

**Data:** Fetches interview flow and candidates on mount with direct `fetch` calls to:
- `GET http://localhost:3010/positions/:id/interviewFlow`
- `GET http://localhost:3010/positions/:id/candidates`

> Note: The backend route is registered as `/positions/:id/interviewflow`. The current frontend call relies on Express' default case-insensitive routing.

**Local state:**

| Variable | Type | Description |
|---|---|---|
| `positionName` | `string` | Title of the position |
| `stages` | `Array<{ id, title, candidates }>` | Interview steps transformed into board columns |
| `selectedCandidate` | `object | null` | Candidate shown in the details offcanvas |

**Candidate cards pushed into each stage:**

```js
{
  id: candidate.candidateId.toString(),
  name: candidate.fullName,
  rating: candidate.averageScore,
  applicationId: candidate.applicationId
}
```

**Key behaviors:**
- Uses `react-beautiful-dnd` to move candidates between columns.
- Sends `PUT http://localhost:3010/candidates/:candidateId` after a drop with `{ applicationId, currentInterviewStep }`.
- Opens `CandidateDetails` when a candidate card is clicked.

---

### `StageColumn`

| Field | Details |
|---|---|
| File | `src/components/StageColumn.js` |
| Type | Functional |
| Used by | `PositionDetails` |
| Responsibility | Renders one droppable interview stage column and its candidate cards |

**Props:**

| Prop | Type | Description |
|---|---|---|
| `stage` | `object` | Column descriptor with `title` and `candidates` |
| `index` | `number` | Column index used as the droppable id |
| `onCardClick` | `(candidate) => void` | Opens the selected candidate |

---

### `CandidateCard`

| Field | Details |
|---|---|
| File | `src/components/CandidateCard.js` |
| Type | Functional |
| Used by | `StageColumn` |
| Responsibility | Renders a draggable candidate card inside the kanban board |

**Props:**

| Prop | Type | Description |
|---|---|---|
| `candidate` | `object` | Candidate summary with `id`, `name`, and numeric `rating` |
| `index` | `number` | Draggable index |
| `onClick` | `(candidate) => void` | Opens the details panel |

**Key behaviors:**
- Uses `react-beautiful-dnd` `Draggable`.
- Renders one green dot per integer unit in `candidate.rating`.

---

### `CandidateDetails`

| Field | Details |
|---|---|
| File | `src/components/CandidateDetails.js` |
| Type | Functional |
| Used by | `PositionDetails` |
| Responsibility | Displays candidate details in an offcanvas panel and includes a form to register a new interview |

**Data:**
- Fetches candidate details from `GET http://localhost:3010/candidates/:id` when a card is selected.
- Attempts to create a new interview with `POST http://localhost:3010/candidates/:id/interviews`.

> ⚠️ Ambiguous: No backend route for `POST /candidates/:id/interviews` exists in `backend/src/routes/`, so the interview creation form is implemented in the UI but not backed by the current API.

**Displayed sections:**
- Candidate profile fields.
- Educations.
- Work experiences.
- Resumes.
- Applications and their interviews.

---

## 🔗 Related agreements

- [patterns.md](./patterns.md)
- [services.md](./services.md)
