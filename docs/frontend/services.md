# 🎯 Frontend: Services

## 💡 Convention

API calls are centralized in `src/services/` to separate data-fetching from components.

> ⚠️ Ambiguous: This convention is not followed by the active UI. The routed components call `fetch` directly instead of using the service module.

## `candidateService.js`

**Location:** `src/services/candidateService.js`
**HTTP client:** `axios` import in the module
**Base URL:** `http://localhost:3010` (hardcoded)

> ⚠️ Ambiguous: `frontend/package.json` does not currently declare `axios`, even though `candidateService.js` imports it.

### `uploadCV(file)`

| Field | Details |
|---|---|
| Method | `POST` |
| Endpoint | `http://localhost:3010/upload` |
| Content-Type | `multipart/form-data` |
| Input | `File` object |
| Returns | `{ filePath: string, fileType: string }` |
| Error handling | Throws `Error` with `error.response.data` message |

```js
const formData = new FormData();
formData.append('file', file);
const response = await axios.post('http://localhost:3010/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
return response.data;
```

### `sendCandidateData(candidateData)`

| Field | Details |
|---|---|
| Method | `POST` |
| Endpoint | `http://localhost:3010/candidates` |
| Content-Type | `application/json` |
| Input | Candidate data object (see shape below) |
| Returns | Created candidate object from backend |
| Error handling | Throws `Error` with `error.response.data` message |

**Input shape:**
```js
{
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  address: string,
  educations: [{ institution, title, startDate, endDate }],
  workExperiences: [{ company, position, description, startDate, endDate }],
  cv: { filePath: string, fileType: string } | null
}
```

## Discrepancy: Direct `fetch` in Components

The current screens bypass `candidateService.js` and call `fetch` directly:

| Call site | Endpoint | Method |
|---|---|---|
| `AddCandidateForm.handleSubmit` | `http://localhost:3010/candidates` | POST |
| `FileUploader.handleFileUpload` | `http://localhost:3010/upload` | POST |
| `Positions.useEffect` | `http://localhost:3010/positions` | GET |
| `PositionDetails.fetchInterviewFlow` | `http://localhost:3010/positions/:id/interviewFlow` | GET |
| `PositionDetails.fetchCandidates` | `http://localhost:3010/positions/:id/candidates` | GET |
| `PositionDetails.updateCandidateStep` | `http://localhost:3010/candidates/:id` | PUT |
| `CandidateDetails.useEffect` | `http://localhost:3010/candidates/:id` | GET |
| `CandidateDetails.handleSubmit` | `http://localhost:3010/candidates/:id/interviews` | POST |

This duplicates logic already present in `candidateService.js`.

## Missing Position Service

No `positionService.js` or equivalent service module exists. Position-related API calls live entirely in `Positions.tsx` and `PositionDetails.js`.

## 🔗 Related agreements

- [patterns.md](./patterns.md)
- [component-catalog.md](./component-catalog.md)
