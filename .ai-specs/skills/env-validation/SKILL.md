---
name: "env-validation"
description: Starts frontend and backend services, confirms their reachability, and documents base URLs and required environment variables. Saves output as analysis/env-summary.md. Use when you need to confirm the live environment is available before running browser-based tests.
---

# Environment Validation

## Description

Starts frontend and backend services, confirms their reachability, and documents base URLs and required environment variables. Saves output as `analysis/env-summary.md`.

## Inputs

- `analysis/repo-summary.md` — for base URL hints
- Repository root (working directory)

## Steps

1. Verify `analysis/repo-summary.md` exists; if not, emit `BLOCKED: analysis/repo-summary.md missing — run /repo-analysis first` and halt.
2. Read `repo-summary.md` to extract base URL hints and any documented environment variables.
3. Inspect `package.json` scripts and environment config files (`.env`, `.env.local`, `.env.example`, `docker-compose.yml`) to identify:
   - The command to start the frontend dev server and its default port.
   - The command to start the backend (if separate) and its default port.
   - All required environment variables and their expected values for local E2E testing.
4. Start the frontend service. Wait for it to respond on its port (max 60 seconds).
5. If a backend service is required, start it. Wait for it to respond (max 60 seconds).
6. Confirm reachability: send an HTTP GET to the base URL of each service and verify a 2xx or known redirect response.
7. Write `analysis/env-summary.md` with:
   - **Frontend base URL**: confirmed reachable URL.
   - **Backend base URL**: confirmed reachable URL (or `N/A — frontend-only`).
   - **Start commands**: exact commands to reproduce the environment.
   - **Required env vars**: name, purpose, and example value for each.
   - **Placeholders**: any values that require manual setup (e.g. auth tokens, secrets).
8. Print status: `env-validation: DONE — analysis/env-summary.md written`.

## Output

- `analysis/env-summary.md`
- Status line printed to chat

## Guardrails

- Emit `BLOCKED: analysis/repo-summary.md missing — run /repo-analysis first` if the file is absent.
- Emit `BLOCKED: <service> did not become reachable — check the start command and try again` if a service times out.
- Must not modify source files or install dependencies.
- Must not invent env var values; mark secrets as placeholders.
- Must not use the Playwright MCP server.
