---
name: "repo-analysis"
description: Reads the frontend codebase to produce a structured summary of the position page components, drag-and-drop library, and PUT /candidate/:id API client. Saves output as analysis/repo-summary.md. Use when you need a codebase map before authoring E2E tests for the position interface.
---

# Repo Analysis

## Description

Reads and summarises the frontend structure, the position page components, the drag-and-drop library in use, and the API client for `PUT /candidate/:id`. Saves output as `analysis/repo-summary.md`.

## Inputs

- Repository root (working directory)

## Steps

1. Read `package.json` to identify installed dependencies, focusing on: drag-and-drop libraries (e.g. `react-beautiful-dnd`, `@dnd-kit/core`, `react-dnd`), HTTP clients, and existing test tooling.
2. Scan the frontend source directory to identify:
   - The position page component file path and its top-level structure.
   - The phase column component and how columns are rendered.
   - The candidate card component and how cards are rendered within columns.
   - The drag-and-drop library used and the specific API it exposes (hooks, wrappers, event names).
   - The API client function that calls `PUT /candidate/:id`, its file path, request shape, and expected response.
3. Document base URLs inferred from environment config files (`.env`, `.env.local`, `next.config.*`).
4. Write `analysis/repo-summary.md` with these sections:
   - **Frontend structure**: directory layout, key file paths.
   - **Position page**: component file, props, child components.
   - **Phase columns**: component file, how column identity is encoded (prop, data attribute, aria-label).
   - **Candidate cards**: component file, how candidate identity is encoded, drag handle location.
   - **Drag-and-drop library**: package name, version, drag API (event/hook name, data transferred).
   - **API client**: file path, function signature, HTTP method, URL pattern, request body shape.
   - **Placeholders**: any values that could not be determined, with guidance on where to look.
5. Print status: `repo-analysis: DONE — analysis/repo-summary.md written`.

## Output

- `analysis/repo-summary.md`
- Status line printed to chat

## Guardrails

- Emit `BLOCKED: frontend source not found — confirm the correct path and re-run` if the source directory cannot be located.
- Mark unknowns as placeholders with guidance — never invent values.
- Must not run tests or modify any source files.
