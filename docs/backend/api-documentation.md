# Backend API Documentation

> **Source of truth:** `backend/src/` — routes, controllers, and services.
> **Base URL:** `http://localhost:3010`
> **Auth:** No authentication mechanism is implemented.
> **CORS:** Requests from `http://localhost:3000` are allowed.

---

## Endpoint Summary

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/candidates` | Create a new candidate with optional education, work experience, and CV |
| `GET` | `/candidates/:id` | Retrieve a candidate by ID |
| `PUT` | `/candidates/:id` | Update the interview stage of a candidate's application |
| `POST` | `/upload` | Upload a CV file (PDF or DOCX) |
| `GET` | `/positions` | List all visible positions |
| `GET` | `/positions/:id/candidates` | List all candidates for a given position |
| `GET` | `/positions/:id/interviewflow` | Get the interview flow (steps) for a given position |

---

## Candidates

### POST /candidates

| Field | Details |
|---|---|
| Method | `POST` |
| Path | `/candidates` |
| Auth Required | No |
| Description | Creates a new candidate. Optionally includes education history, work experience entries, and a CV reference. |

**Request**

- Headers: `Content-Type: application/json`
- Body (JSON):

```json
{
  "firstName": "string — required, 2–100 chars, letters only (including ñ/accents)",
  "lastName":  "string — required, 2–100 chars, letters only (including ñ/accents)",
  "email":     "string — required, valid email, must be unique in DB",
  "phone":     "string — optional, Spanish mobile format: starts with 6|7|9, 9 digits total",
  "address":   "string — optional, max 100 chars",
  "educations": [
    {
      "institution": "string — required, max 100 chars",
      "title":       "string — required, max 100 chars",
      "startDate":   "string — required, format YYYY-MM-DD",
      "endDate":     "string — optional, format YYYY-MM-DD"
    }
  ],
  "workExperiences": [
    {
      "company":     "string — required, max 100 chars",
      "position":    "string — required, max 100 chars",
      "description": "string — optional, max 200 chars",
      "startDate":   "string — required, format YYYY-MM-DD",
      "endDate":     "string — optional, format YYYY-MM-DD"
    }
  ],
  "cv": {
    "filePath": "string — path returned by POST /upload",
    "fileType": "string — MIME type returned by POST /upload"
  }
}
```

**Response**

- Success `201`:

```json
{
  "id": "integer",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string | null",
  "address": "string | null"
}
```

> Note: The route handler calls `addCandidate` directly and returns the raw `savedCandidate` object from Prisma (not the wrapper `{ message, data }` from `addCandidateController`).

- `400` — Validation error (invalid field format, duplicate email)
- `500` — Unexpected server error

**Business Logic Summary**

1. `validateCandidateData` runs synchronous validation on all fields. If `data.id` is present the validations are skipped (edit mode, ⚠️ Ambiguous: edit via POST is not the documented path).
2. A `Candidate` domain model instance is created and persisted.
3. Each entry in `educations` is saved with the new `candidateId`.
4. Each entry in `workExperiences` is saved with the new `candidateId`.
5. If `cv` is a non-empty object, a `Resume` record is saved with the new `candidateId`.
6. Prisma error code `P2002` (unique constraint on `email`) is caught and returns a friendly message.

**Prisma Models Involved**

`Candidate`, `Education`, `WorkExperience`, `Resume`

---

### GET /candidates/:id

| Field | Details |
|---|---|
| Method | `GET` |
| Path | `/candidates/:id` |
| Auth Required | No |
| Description | Returns the full candidate record for the given numeric ID. |

**Request**

- Path Params: `id` (integer) — candidate primary key

**Response**

- Success `200`: Full candidate object including `educations`, `workExperiences`, `resumes`, and `applications`. Each application includes its related `position` (`id`, `title`) and `interviews` (`interviewDate`, `interviewStep.name`, `notes`, `score`).
- `400` — `id` is not a valid integer
- `404` — No candidate found with that ID
- `500` — Internal server error

**Business Logic Summary**

Parses `id` from path, validates it is a number, delegates to `findCandidateById` service which calls `Candidate.findOne(id)`.

**Prisma Models Involved**

`Candidate`

---

### PUT /candidates/:id

| Field | Details |
|---|---|
| Method | `PUT` |
| Path | `/candidates/:id` |
| Auth Required | No |
| Description | Advances (or changes) the current interview step of a candidate's application. |

**Request**

- Path Params: `id` (integer) — candidate ID
- Body (JSON):

```json
{
  "applicationId":        "integer — ID of the Application record to update",
  "currentInterviewStep": "integer — ID of the InterviewStep to set as current"
}
```

**Response**

- Success `200`:

```json
{
  "message": "Candidate stage updated successfully",
  "data": {
    "id":                   "integer",
    "positionId":           "integer",
    "candidateId":          "integer",
    "applicationDate":      "string (ISO 8601)",
    "currentInterviewStep": "integer",
    "notes":                "string | null"
  }
}
```

- `400` — `applicationId` or `currentInterviewStep` is not a valid integer, or other update error
- `404` — Application not found (no Application matching `applicationId` + `candidateId`)
- `500` — Unexpected error

**Business Logic Summary**

1. Parses and validates both `id` (path) and `applicationId`, `currentInterviewStep` (body) as integers.
2. Calls `updateCandidateStage(candidateId, applicationId, currentInterviewStep)`.
3. Service looks up the `Application` by `applicationId` AND `candidateId` (both must match).
4. Sets `application.currentInterviewStep = currentInterviewStep` and saves.

**Prisma Models Involved**

`Application`, `InterviewStep`

---

## File Upload

### POST /upload

| Field | Details |
|---|---|
| Method | `POST` |
| Path | `/upload` |
| Auth Required | No |
| Description | Uploads a single CV file. Only PDF and DOCX are accepted. Max size 10 MB. |

**Request**

- Headers: `Content-Type: multipart/form-data`
- Body (form-data): `file` (binary) — the file to upload

**Response**

- Success `200`:

```json
{
  "filePath": "string — relative path where the file is stored (e.g. ../uploads/1714900000000-resume.pdf)",
  "fileType": "string — MIME type (application/pdf | application/vnd.openxmlformats-officedocument.wordprocessingml.document)"
}
```

- `400` — File type not allowed (not PDF or DOCX)
- `500` — Multer error or other server error

**Business Logic Summary**

Uses `multer` with disk storage. Files are saved to `../uploads/` with a `{timestamp}-{originalname}` filename. The file filter rejects anything that is not `application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.

**Prisma Models Involved**

None (file is stored on disk; the returned `filePath` and `fileType` are intended to be submitted as the `cv` field in `POST /candidates`).

---

## Positions

### GET /positions

| Field | Details |
|---|---|
| Method | `GET` |
| Path | `/positions` |
| Auth Required | No |
| Description | Returns all visible positions. |

**Request**

No parameters.

**Response**

- Success `200` — array of `Position` records as returned by Prisma `findMany({ where: { isVisible: true } })`
- `500` — Error retrieving positions

**Business Logic Summary**

1. Calls `getAllPositionsService()`.
2. Queries `Position` with `isVisible: true`.
3. Returns the raw Prisma result array.

**Prisma Models Involved**

`Position`

---

### GET /positions/:id/candidates

| Field | Details |
|---|---|
| Method | `GET` |
| Path | `/positions/:id/candidates` |
| Auth Required | No |
| Description | Returns a summarized list of all candidates who have applied to the given position, including their current interview step and average interview score. |

**Request**

- Path Params: `id` (integer) — position ID

**Response**

- Success `200` — array:

```json
[
  {
    "fullName":            "string — firstName + lastName",
    "currentInterviewStep":"string — name of the InterviewStep",
    "candidateId":         "integer — candidate ID",
    "applicationId":       "integer — application ID",
    "averageScore":        "number — mean of all Interview.score values (0 if no interviews)",
  }
]
```

- `500` — Error retrieving candidates

**Business Logic Summary**

1. Queries `Application` records filtered by `positionId`, including `candidate`, `interviews`, and `interviewStep`.
2. Maps each application to a summary object.
3. `averageScore` is the mean of all `Interview.score` values for that application; defaults to `0` if no interviews exist.

**Prisma Models Involved**

`Application`, `Candidate`, `Interview`, `InterviewStep`

---

### GET /positions/:id/interviewflow

| Field | Details |
|---|---|
| Method | `GET` |
| Path | `/positions/:id/interviewflow` |
| Auth Required | No |
| Description | Returns the interview flow (ordered list of interview steps) configured for the given position, along with the position title. |

**Request**

- Path Params: `id` (integer) — position ID

**Response**

- Success `200`:

```json
{
  "interviewFlow": {
    "positionName": "string — title of the position",
    "interviewFlow": {
      "id":          "integer",
      "description": "string | null",
      "interviewSteps": [
        {
          "id":              "integer",
          "interviewFlowId": "integer",
          "interviewTypeId": "integer",
          "name":            "string",
          "orderIndex":      "integer"
        }
      ]
    }
  }
}
```

- `404` — Position not found
- `500` — Server error

**Business Logic Summary**

1. Queries `Position` by `id`, including the related `InterviewFlow` and its `interviewSteps`.
2. If the position does not exist, throws and returns `404`.
3. Returns the position title and the full interview flow with all steps ordered by `orderIndex`.

**Prisma Models Involved**

`Position`, `InterviewFlow`, `InterviewStep`

---

## Data Models Reference

### Candidate
| Field | Type | Constraints |
|---|---|---|
| `id` | Int | PK, auto-increment |
| `firstName` | String | max 100 chars |
| `lastName` | String | max 100 chars |
| `email` | String | unique, max 255 chars |
| `phone` | String? | optional, max 15 chars |
| `address` | String? | optional, max 100 chars |

### Education
| Field | Type | Constraints |
|---|---|---|
| `id` | Int | PK |
| `institution` | String | max 100 chars |
| `title` | String | max 250 chars |
| `startDate` | DateTime | required |
| `endDate` | DateTime? | optional |
| `candidateId` | Int | FK → Candidate |

### WorkExperience
| Field | Type | Constraints |
|---|---|---|
| `id` | Int | PK |
| `company` | String | max 100 chars |
| `position` | String | max 100 chars |
| `description` | String? | optional, max 200 chars |
| `startDate` | DateTime | required |
| `endDate` | DateTime? | optional |
| `candidateId` | Int | FK → Candidate |

### Resume
| Field | Type | Constraints |
|---|---|---|
| `id` | Int | PK |
| `filePath` | String | max 500 chars |
| `fileType` | String | max 50 chars |
| `uploadDate` | DateTime | required |
| `candidateId` | Int | FK → Candidate |

### Position
| Field | Type | Constraints |
|---|---|---|
| `id` | Int | PK |
| `companyId` | Int | FK → Company |
| `interviewFlowId` | Int | FK → InterviewFlow |
| `title` | String | required |
| `description` | String | required |
| `status` | String | default `"Draft"` |
| `isVisible` | Boolean | default `false` |
| `location` | String | required |
| `jobDescription` | String | required |
| `requirements` | String? | optional |
| `responsibilities` | String? | optional |
| `salaryMin` | Float? | optional |
| `salaryMax` | Float? | optional |
| `employmentType` | String? | optional |
| `benefits` | String? | optional |
| `companyDescription` | String? | optional |
| `applicationDeadline` | DateTime? | optional |
| `contactInfo` | String? | optional |

### Application
| Field | Type | Constraints |
|---|---|---|
| `id` | Int | PK |
| `positionId` | Int | FK → Position |
| `candidateId` | Int | FK → Candidate |
| `applicationDate` | DateTime | required |
| `currentInterviewStep` | Int | FK → InterviewStep |
| `notes` | String? | optional |

### InterviewFlow
| Field | Type | Constraints |
|---|---|---|
| `id` | Int | PK |
| `description` | String? | optional |

### InterviewStep
| Field | Type | Constraints |
|---|---|---|
| `id` | Int | PK |
| `interviewFlowId` | Int | FK → InterviewFlow |
| `interviewTypeId` | Int | FK → InterviewType |
| `name` | String | required |
| `orderIndex` | Int | required |

### Interview
| Field | Type | Constraints |
|---|---|---|
| `id` | Int | PK |
| `applicationId` | Int | FK → Application |
| `interviewStepId` | Int | FK → InterviewStep |
| `employeeId` | Int | FK → Employee |
| `interviewDate` | DateTime | required |
| `result` | String? | optional |
| `score` | Int? | optional |
| `notes` | String? | optional |
