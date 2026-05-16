---
name: codebase-analysis
description: Produce `AGENTS.md` — a single-file, IDE-agnostic snapshot of the repository (business purpose, folder layout, design tokens, tech stack, FE/BE architecture). Use this skill whenever the project lacks an up-to-date `AGENTS.md` or after a non-trivial refactor.
---

# When to load

- The orchestrator is at Phase 1.
- A user explicitly asks "regenerate AGENTS.md" or "summarise the codebase for the agents file".

# Method

1. List the working tree excluding everything matched by `.gitignore`:
   `git ls-files | head -n 400` (enough to map structure).
2. Read top-level config files: root `package.json`, `frontend/package.json`, `backend/package.json`, `docker-compose.yml`, `prisma/schema.prisma` (if present), `playwright.config.ts`.
3. Scan the frontend entry (`frontend/src/index.tsx` → `App.js`) and identify routing, state, styling tokens (theme files, CSS variables, Bootstrap overrides).
4. Scan the backend entry (`backend/src/index.ts`) and list routers, controllers, ORM usage.
5. Identify the Docker topology: which services run where, which ports.

# Output template — `AGENTS.md`

```markdown
# AGENTS.md

## Business purpose
<one paragraph>

## Tech stack
| Layer | Tech | Version |
|---|---|---|
| Frontend | … | … |
| Backend | … | … |
| Database | … | … |
| Tests | … | … |

## Repository layout
<tree, .gitignored entries omitted>

## Frontend architecture
- Entry point: `<path>`
- Routing: `<file>` — list routes.
- State management: `<approach>`
- Design tokens: `<file>` — list tokens.
- Key components: bullet list with one-line purpose.

## Backend architecture
- Entry point: `<path>`
- Layers: presentation / application / domain / infrastructure (or whichever the repo uses).
- Endpoints: table with method, path, controller, request body, response.
- ORM models: bullet list.

## How to run locally
- Prerequisites
- `npm` scripts (root, frontend, backend)
- Docker commands

## How AI agents are organised
Pointer to `.claude/agents/`, `.claude/skills/`, `.claude/commands/`. Multi-IDE pointers under `.cursor/`, `.github/`, `.windsurfrules`, `.antigravity/`.
```

# Rules

- English, Markdown, no emojis.
- Use tables for any list of three or more uniform items.
- Cite real paths (`frontend/src/App.js`). Never invent.
- Keep the file under ~300 lines — link out to source for deep detail.
