# 🎯 Frontend: Project Overview

## 💡 Summary

Recruiter-facing ATS (Applicant Tracking System) frontend for LTI. It currently supports candidate creation, visible positions listing, and a position detail board with drag-and-drop stage changes.

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| TypeScript | 4.9.x | Type checking (partial — mixed JS/TS codebase) |
| React Router DOM | 6.x | Client-side routing |
| Bootstrap | 5.x | CSS framework |
| React Bootstrap | 2.x | Bootstrap components for React |
| React Beautiful DnD | 13.x | Drag-and-drop interactions in the position board |
| React Datepicker | 6.x | Date inputs in the candidate form |
| Create React App | 5.x | Build tooling |
| Fetch API | Browser native | HTTP client currently used in route components |

## Entry Points

| File | Role |
|---|---|
| `src/index.tsx` | DOM mount — renders `<App>` inside `<React.StrictMode>` |
| `src/App.js` | Router setup — defines all routes and imports Bootstrap styles |

## Routes

| Path | Component |
|---|---|
| `/` | `RecruiterDashboard` |
| `/add-candidate` | `AddCandidateForm` |
| `/positions` | `Positions` |
| `/positions/:id` | `PositionDetails` |

## Folder Structure

```
frontend/src/
├── index.tsx           # App mount
├── App.js              # Router and Bootstrap import
├── App.css             # Legacy CRA styles (mostly unused)
├── index.css           # Global body/font reset
├── reportWebVitals.ts  # CRA performance utility
├── assets/
│   └── lti-logo.png    # Company logo
├── components/
│   ├── RecruiterDashboard.js
│   ├── AddCandidateForm.js
│   ├── FileUploader.js
│   ├── Positions.tsx
│   ├── PositionDetails.js
│   ├── StageColumn.js
│   ├── CandidateCard.js
│   └── CandidateDetails.js
└── services/
    └── candidateService.js
```

## 🔗 Related agreements

- [conventions.md](./conventions.md)
- [component-catalog.md](./component-catalog.md)
- [patterns.md](./patterns.md)
