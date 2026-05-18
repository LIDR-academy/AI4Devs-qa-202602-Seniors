---
name: project-context-analyzer
description: Analyze project structure, architecture, technologies, and runtime configuration. Use when onboarding onto a new project, verifying setup, or gathering context for other agents. This skill extracts and synthesizes everything an agent needs to understand how a project works — tech stack, dependencies, build/run commands, environment configuration, and health checks.
trigger: /analyze-project
author: LIDR.co
version: 1.0.0
---

# project-context-analyzer Skill

Analyze a codebase and produce a structured context report useful for any agent working on the project. Covers architecture, technologies, configuration, runtime requirements, and health verification.

## When to Use

- First contact with a new project
- Verifying that a project is correctly configured
- Onboarding another agent
- Pre-flight check before running/building the project
- Gathering context for task decomposition

## Workflow

```
INPUT: project_root_path
OUTPUT: structured context report + /tmp/project-context-{hash}.json
```

## Analysis Dimensions

### 1. Project Structure

Identify the high-level directory layout and major components:

- Monorepo vs single-repo
- Backend / frontend / shared / infra splits
- Package managers and workspaces
- Key configuration files at root

### 2. Technology Stack

Detect and document:

- **Language(s)** and runtime versions (Node, Python, Go, Java, etc.)
- **Framework(s)** (Express, FastAPI, Next.js, React, etc.)
- **Database(s)** (PostgreSQL, MongoDB, Redis, etc.) and ORM/ODM
- **Cache** (Redis, Memcached)
- **Message queue / async** (Bull, RabbitMQ, Kafka)
- **Containerization** (Docker, Podman)
- **Orchestration** (Docker Compose, Kubernetes, Terraform)
- **CI/CD** (GitHub Actions, GitLab CI, Jenkins)
- **Package manager** (pnpm, npm, yarn, pip, go mod, etc.)
- **Environment management** (.env files, env variables, .env.example)

### 3. Build & Run Configuration

Extract:

- **Root-level scripts** (`package.json`, `pyproject.toml`, `go.mod`, `pom.xml`, etc.)
- **Dev scripts** — how to start in development mode
- **Build scripts** — how to compile/package
- **Test scripts** — how to run tests
- **Start scripts** — how to run in production
- **Migration scripts** — database migrations
- **Dockerfile(s)** — build instructions
- **Docker Compose** — service orchestration
- **Environment templates** — `.env.example`, `.env.test`, etc.

### 4. Architecture & Patterns

Identify:

- API layer structure (REST, GraphQL, gRPC)
- Service/handler/repository patterns
- Authentication/authorization mechanisms
- Validation strategy
- Error handling conventions
- Key domain entities

### 5. Environment & Runtime Health

Check:

- `.env` presence and required variables
- Secret/key management
- Database connection config
- External service dependencies (APIs, cloud services)
- Port allocations
- CORS, security headers
- SSL/TLS configuration

### 6. Verification Checklist

For each detected component, determine if it is:

| Component | Check |
|-----------|-------|
| Backend | starts without error, connects to DB |
| Frontend | builds without error, serves on expected port |
| Database | migrations run successfully |
| Docker | `docker build` succeeds, images built |
| Docker Compose | all services start, healthy |
| Tests | test suite runs, passes |
| CI/CD | pipeline syntax valid |

## Output Format

Return a structured report:

```markdown
## Project Context Report — {project_name}

### Structure
{monorepo|monolithic|single}: {dirs/components}

### Technology Stack
- **Runtime:** {language} {version}
- **Framework:** {framework} {version}
- **Database:** {db} {version}
- **Cache:** {cache} {version}
- **Container:** {docker|podman|none}
- **Package Manager:** {pnpm|npm|...}

### Build & Run
| Service | Command | Port |
|---------|---------|------|
| backend | {cmd} | {port} |
| frontend | {cmd} | {port} |
| db | {engine} | {port} |

### Environment
Required env vars:
- {VAR_NAME} — {purpose}

### Architecture
- API: {REST|GraphQL|gRPC}
- Auth: {jwt|oauth|session|...}
- Patterns: {service|repository|...}

### Verification Status
| Check | Status |
|-------|--------|
| backend starts | ✅|❌ |
| frontend builds | ✅|❌ |
| db migrations | ✅|❌ |
| docker build | ✅|❌ |
| docker compose | ✅|❌ |
| tests pass | ✅|❌ |

### Notes
{interesting findings, anti-patterns, gaps}
```

## Companion JSON

Save structured data to `/tmp/project-context-{hash}.json` for other agents to consume:

```json
{
  "project_name": "string",
  "project_type": "monorepo|single|...",
  "stack": {
    "runtime": { "language": "string", "version": "string" },
    "framework": { "name": "string", "version": "string" },
    "database": { "engine": "string", "version": "string" },
    "cache": { "engine": "string", "version": "string" },
    "container": "docker|podman|none"
  },
  "services": [
    { "name": "string", "command": "string", "port": number, "type": "backend|frontend|db|cache|..." }
  ],
  "scripts": {
    "dev": "string",
    "build": "string",
    "test": "string",
    "start": "string",
    "migrate": "string"
  },
  "env_vars": [{ "name": "string", "required": boolean, "purpose": "string" }],
  "verification": {
    "backend_starts": "pass|fail|unknown",
    "frontend_builds": "pass|fail|unknown",
    "db_migrations": "pass|fail|unknown",
    "docker_build": "pass|fail|unknown",
    "docker_compose": "pass|fail|unknown",
    "tests_pass": "pass|fail|unknown"
  },
  "architecture": {
    "api_type": "REST|GraphQL|gRPC",
    "auth": "jwt|oauth|session|none",
    "patterns": ["string"]
  }
}
```

## Anti-Patterns

- NEVER assume the project is correctly configured — verify each component
- NEVER skip checking for `.env` and required environment variables
- NEVER report "works" without running the actual start/build commands
- NEVER omit Docker and Docker Compose checks if `Dockerfile` or `docker-compose.yml` exists
- NEVER skip database migration verification if migrations exist