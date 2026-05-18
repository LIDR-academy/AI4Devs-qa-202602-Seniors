# Project Context — AI4Devs Hiring Platform

**Purpose:** This file is a **glossary and nothing else**. It does NOT contain specs, implementation details, or decisions. It is purely for terminology clarification to prevent miscommunication between agents and stakeholders.

## Domain Entities

| Term | Definition | Boundary | Notes |
|------|------------|----------|-------|
| **Candidate** | A person applying for a position. Has Resume, Education, WorkExperience. | Cross-community (Controllers → Domain) | God node (5 edges) |
| **Position** | A job opening at a company. Contains InterviewFlow with ordered steps. | Domain layer | God node (5 edges) |
| **Application** | The association between a Candidate and a Position, tracking stage progression. | Cross-community (Application → Interview) | God node (5 edges) |
| **Interview** | A scheduled interview event, linked to Application and InterviewType. | Domain layer | God node (4 edges) |
| **InterviewFlow** | The ordered sequence of InterviewSteps for a Position. | Domain layer | God node (4 edges) |
| **InterviewType** | Classification of interview (technical, behavioral, HR, etc.) | Domain layer | God node (4 edges) |
| **InterviewStep** | A single step within an InterviewFlow (e.g., "Phone Screen", "Onsite"). | Domain layer | God node (4 edges) |
| **Employee** | Company staff who conduct interviews or manage hiring. | Domain layer | God node (4 edges) |
| **Resume** | Document uploaded by Candidate. | Domain layer | God node (4 edges) |
| **Education** | Candidate's educational background. | Domain layer | God node (4 edges) |
| **WorkExperience** | Candidate's work history. | Domain layer | God node (4 edges) |
| **Company** | Organization that creates Positions and employs Employees. | Domain layer | Single node community |

## Key Validators (Cross-Community Bridges)

| Function | Purpose | Connects |
|----------|---------|----------|
| `validateCandidateData()` | Validates all candidate data before storage. Cross-community bridge between Community 0 (validators) and Community 2 (candidate controllers). | Validators → Candidate Controllers |
| `validateEmail()` | RFC-compliant email format validation. | - |
| `validateName()` | Name format validation (no numbers, special chars). | - |
| `validateDate()` | ISO-8601 date validation. | - |
| `validateEducation()` | Education record validation. | - |
| `validateExperience()` | Work experience record validation. | - |
| `validateCV()` | Resume file validation (type, size). | - |
| `validateAddress()` | Candidate address validation. | - |

## Service Boundaries (Communities)

| Community | Name | Cohesion | Role |
|-----------|------|----------|------|
| 0 | Candidate Domain | 0.40 | Education, Resume, WorkExperience entities |
| 1 | Position Queries | 0.28 | getAllPositions, getCandidatesByPosition, getInterviewFlowByPosition |
| 2 | Candidate Controllers | 0.33 | addCandidateController, getCandidateById, updateCandidateStageController |
| 5 | Validators | 0.40 | validateCandidateData, validateEmail, validateName, validateDate, validateEducation, validateExperience, validateCV, validateAddress |

## Terminology Notes

- **Stage** refers to `Application.stage` (e.g., "Applied", "Screening", "Interview", "Offer", "Rejected")
- **Step** refers to `InterviewStep` within an `InterviewFlow`
- **Type** refers to `InterviewType` classification
- **"Candidate"** always means the person, never the `Candidate` entity specifically (context-dependent)

## Adding Terms

When a term is resolved during a grilling session, add it above with:
- **Term** in bold
- **Definition** — precise, unambiguous
- **Boundary** — which module/entity it belongs to
- **Notes** — any non-obvious constraints

**Rules:**
- No implementation details
- No specs or plans
- Just clarification
- Update inline as terms are resolved