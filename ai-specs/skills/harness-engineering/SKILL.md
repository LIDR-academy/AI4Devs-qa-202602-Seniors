---
name: harness-engineering
description: Build optimized agentic systems tailored to a specific project by analyzing its structure, patterns, and domain. Use when designing multi-agent architectures, setting up planning/memory systems, or implementing project-specific AI workflows. Trigger: /harness
author: AI4Devs
version: 1.3.0
---

# Harness Engineering

Design and implement an agentic AI system optimized for a specific codebase by deeply understanding its structure, patterns, and domain.

## When to Use

- Building a multi-agent system for a specific project
- Designing agent workflows, planning strategies, or memory systems
- Setting up project-specific AI orchestration
- Tailoring agent behavior to codebase conventions and architecture

## Workflow

```
INPUT: project_root_path + goal
OUTPUT: Agentic system blueprint + implementation config
```

## Project Analysis Results

Based on graphify analysis of this project:

### God Nodes (Core Abstractions)
1. `validateCandidateData()` - 10 edges (validator, cross-community bridge)
2. `Application` - 7 edges (prisma model, cross-community)
3. `Position` - 6 edges (prisma model)
4. `Resume` - 6 edges (prisma model)
5. `Candidate` - 5 edges (prisma model, cross-community)
6. `Interview` - 5 edges (prisma model)
7. `Education` - 5 edges (prisma model)
8. `WorkExperience` - 5 edges (prisma model)

### Architecture Pattern: Layered + DDD Hybrid

```
Presentation Layer (Controllers)
       ↓
Application Layer (Services + Validators)
       ↓
Domain Layer (Prisma Models: Candidate, Position, Application, Interview)
       ↓
Infrastructure (Prisma ORM → PostgreSQL)
```

### Communities Identified

| Community | Name | Cohesion | Role |
|-----------|------|----------|------|
| 0 | Candidate Domain | 0.11 | Education, Resume, WorkExperience entities |
| 1 | Position Queries | 0.18 | getAllPositions, getCandidatesByPosition |
| 3 | Candidate Controllers | 0.21 | addCandidateController, updateCandidateStageController |
| 4 | Application/Interview | 0.17 | Application, Interview, prisma |
| 5 | Validators | 0.40 | validateCandidateData, validateEmail, validateName |

### Quality Gates (Enforced)

All agents MUST enforce these gates before marking tasks complete:

```
┌─────────────────────────────────────────────────────────────────┐
│ QUALITY GATES                                                    │
├─────────────────────────────────────────────────────────────────┤
│ 1. TYPE CHECK   → pnpm tsc --noEmit (backend & frontend)        │
│ 2. LINT         → pnpm lint (eslint/prettier)                   │
│ 3. UNIT TESTS   → pnpm test (jest, ≥70% coverage)               │
│ 4. E2E TESTS    → pnpm test:e2e (playwright, critical paths)    │
│ 5. LINEAR SYNC  → Ticket created/updated via Linear MCP          │
└─────────────────────────────────────────────────────────────────┘
```

### Project Stack

| Layer | Technology | Key Files |
|-------|------------|-----------|
| Backend | Express + TypeScript (strict) | backend/src/**/*.ts |
| Database | Prisma + PostgreSQL | backend/prisma/schema.prisma |
| Frontend | React + TypeScript | frontend/src/**/*.tsx |
| Testing | Jest (unit) + Playwright (E2E) | **/*.test.ts |
| Package Manager | pnpm | pnpm-lock.yaml |
| Ticketing | Linear MCP | All issues via linear_* tools |

## Step 1: Project Analysis

### 1.1 Run Graphify

Before anything else, analyze the project structure:

```
graphify path "<god_node_A>" "<god_node_B>"
graphify query "<architectural question>"
```

Key questions to answer:
- What are the **god nodes** (most connected entities)?
- What **communities** exist (tightly coupled modules)?
- What are the **surprising connections** (cross-boundary calls)?
- Where are the **knowledge gaps** (isolated nodes)?

### 1.2 Extract Architecture

Identify from graphify output:

| Element | What to Find |
|---------|-------------|
| **Domain entities** | God nodes with highest edge count |
| **Service boundaries** | Communities with cohesion > 0.15 |
| **Integration points** | Edges connecting different communities |
| **Architectural violations** | Nodes with unexpected cross-community connections |

### 1.3 Detect Patterns

From codebase analysis:

```
Patterns present:
[X] Layered architecture (API → Service → Repository)
[ ] Domain-driven design (entities, aggregates, repositories)
[ ] Event-driven (publish/subscribe, message queues)
[ ] Microservices (separate deployments, network calls)
[ ] Monolith (single deployment, in-process calls)

Key files per pattern:
- Layered: controller → service → repository → model
- DDD: entity.ts, repository.ts, domain-event.ts
- Event: publisher.ts, subscriber.ts, handler.ts
```

## Step 2: Agentic System Design

### 2.1 Define Agent Roles

Based on project architecture, design roles that map to existing boundaries:

```
Agent Role Template:
┌─────────────────────────────────────────────────┐
│ ROLE: {Name}                                    │
│ Goal: {What this agent accomplishes}           │
│ Scope: {Which modules/files it operates on}    │
│ Tools: {Read, Edit, Bash, Task, etc.}           │
│ Memory: {Short-term, Long-term strategy}        │
│ Quality Gates: {typecheck, lint, test, linear}  │
└─────────────────────────────────────────────────┘
```

### 2.2 Design Communication

```
Hierarchical (Manager → Specialists):
  Manager
  ├── Researcher Agent
  ├── Coder Agent
  └── Reviewer Agent

Peer (Specialists collaborate):
  Researcher ←→ Analyst
       ↓
  Implementer ←→ Reviewer

Pipeline (Sequential with gates):
  Ingest → Analyze → Plan → Execute → Verify
```

### 2.3 Plan Memory Architecture

```
Short-term (per task):
  - Current file context
  - Active tool outputs
  - Conversation messages

Long-term (across sessions):
  - Project structure knowledge (graphify-out/)
  - Architectural patterns learned
  - Domain vocabulary (entity names, conventions)

Implementation options:
  1. Graph-based (graphify) — structural understanding
  2. Vector RAG — semantic retrieval
  3. Structured JSON — typed project metadata
  4. Hybrid — graph for structure + vectors for search
```

### 2.4 Design Tool Suite

Based on detected patterns:

```
Core Tools (always):
  - Read, Write, Edit, Glob, Grep
  - Bash (git, pnpm, docker)
  - Task (spawn subagents)
  - Linear MCP (ticket management)

Quality Tools:
  - tsc --noEmit (typecheck)
  - pnpm lint (lint)
  - pnpm test (unit tests)
  - pnpm test:e2e (playwright)
```

## Step 3: Implementation Config

### 3.1 Quality Gate Enforcement

Every agent task MUST pass through these gates:

```yaml
quality_gates:
  backend:
    typecheck: "cd backend && pnpm tsc --noEmit"
    lint: "cd backend && pnpm lint"
    test: "cd backend && pnpm test"
    e2e: "cd backend && pnpm test:e2e"

  frontend:
    typecheck: "cd frontend && pnpm tsc --noEmit"
    lint: "cd frontend && pnpm lint"
    test: "cd frontend && pnpm test"
    e2e: "cd frontend && pnpm test:e2e"
```

### 3.2 Generate Agent Config

```json
{
  "agents": {
    "{role_name}": {
      "mode": "subagent",
      "description": "What this agent does",
      "permission": {
        "read": "allow",
        "edit": "allow",
        "bash": "allow",
        "linear": "allow"
      },
      "context": {
        "graph_edges": ["entity_a", "entity_b"],
        "focus_areas": ["module_x", "module_y"],
        "constraints": [
          "never skip typecheck",
          "never skip tests",
          "never skip lint",
          "create Linear ticket for every feature",
          "respect layering (controller→service→prisma)"
        ]
      },
      "quality_gates": {
        "typecheck": true,
        "lint": true,
        "unit_test": true,
        "e2e_test": false,
        "linear_sync": true
      }
    }
  }
}
```

### 3.3 Define Orchestration Flow

```
Orchestration Pattern: hierarchical with complexity-based routing

Flow:
1. User task received
   → orchestrator (analyze, decompose, CLASSIFY complexity)
   │
   ├──[SIMPLE]─────────────────────────────────────────────┐
   │                                                        │
   │  → docs-agent (direct ticket creation)                 │
   │  → backend-agent OR frontend-agent (implement)         │
   │  → qa-agent (tests: unit + E2E)                       │
   │                                                       │
   └──[COMPLEX]────────────────────────────────────────────┤
                                                           │
   │  → grill-with-docs (stress-test plan)                  │
   │    • Challenge against domain model                   │
   │    • Sharpen fuzzy terminology                        │
   │    • Probe edge cases with concrete scenarios         │
   │    • Cross-reference with code                        │
   │    • UPDATE CONTEXT.md inline                         │
   │    • CREATE ADRs (if criteria met)                    │
   │                                                        │
   │  → docs-agent (refined requirements → ticket)          │
   │  → backend-agent OR frontend-agent (implement)        │
   │  → qa-agent (tests: unit + E2E)                       │
   │                                                       │
   └──► orchestrator (validate gates)                      │
        → Output

Gate conditions:
  - Quality: tsc clean, lint clean, tests pass ≥70%
  - Architecture: no layer violations
  - Linear: ticket created/updated
  - Complex tasks: grill-with-docs completed
```

### 3.4 Complexity Classification

Classify each task before delegation:

| Signal | Complex Indicator | Simple Indicator |
|--------|-------------------|------------------|
| **God nodes** | Touches 3+ god nodes | Existing entity, well-defined scope |
| **Community edges** | Cross-boundary (validateCandidateData() type) | Within single community |
| **Acceptance criteria** | Vague ("add validation", "improve UX") | Concrete with examples |
| **Edge cases** | Mentioned but not specified | All specified |
| **Terminology** | May conflict with CONTEXT.md | Clear, matches glossary |
| **Architecture** | Affects multiple layers | Single layer impact |

**Rule:** 2+ complex indicators → **complex**; otherwise → **simple**

### 3.5 Hybrid Workflow: grill-with-docs Integration

For complex tasks, grill-with-docs runs BEFORE ticket creation:

```
grill-with-docs Session:
  INPUT:
    - Task description
    - CONTEXT.md (project glossary)
    - graphify-out/GRAPH_REPORT.md (god nodes, communities)

  PROCESS:
    1. Challenge plan against domain model
    2. Propose precise canonical terms for vague ones
    3. Discuss concrete scenarios to probe edge cases
    4. Cross-reference with code to verify assumptions
    5. Update CONTEXT.md when terms resolved
    6. Create ADR if: hard-to-reverse + surprising + real trade-off

  OUTPUT:
    - Refined requirements (sharpened)
    - Updated CONTEXT.md (if terms resolved)
    - ADR(s) created (sparingly)

  PASS refined requirements to docs-agent for ticket creation
```

### 3.6 Memory Architecture (Updated)

```
Short-term (per task):
  - Current file context
  - Active tool outputs
  - Conversation messages

Long-term (across sessions):
  - Project structure knowledge (graphify-out/)
  - Architectural patterns learned
  - Domain vocabulary (entity names, conventions)
  - CONTEXT.md (project glossary - updated by grill-with-docs)

Implementation: Graph-based (graphify) + CONTEXT.md for terminology
```

## Step 4: Generate Implementation

### 4.1 Create Skill Files

```
ai-specs/
├── skills/
│   ├── harness-engineering/
│   │   ├── SKILL.md              # This file
│   │   ├── agents/               # Agent definitions
│   │   │   ├── analyst.md        # Project analysis agent
│   │   │   ├── coder.md          # Implementation agent
│   │   │   └── reviewer.md       # Quality assurance agent
│   │   ├── tools/                # Custom tools
│   │   │   ├── validate-structure.js
│   │   │   └── extract-patterns.js
│   │   └── config/               # Implementation configs
│   │       ├── orchestrator.json
│   │       └── permissions.json
│   └── tdd/
│       └── SKILL.md              # TDD workflow
```

### 4.2 Agent Prompts

Each agent definition should include:

```markdown
# {Agent Name}

## Role
What this agent does in the system.

## Triggers
When to invoke this agent.

## Context
- Project structure from graphify
- Relevant modules and patterns
- Constraints and conventions

## Quality Gates
- [ ] TypeScript typecheck passes
- [ ] Lint passes
- [ ] Unit tests pass (≥70% coverage)
- [ ] E2E tests pass (critical paths)
- [ ] Linear ticket synced

## Workflow
Step-by-step behavior.

## Exit Criteria
When to return result to orchestrator.
```

## Step 5: TDD Enforcement

### 5.1 TDD Workflow (Red-Green-Refactor)

```
1. WRITE failing test (RED)
   → Test describes expected behavior
   → Run: pnpm test → fails (expected)

2. WRITE minimal code to pass (GREEN)
   → Implement only what's needed
   → Run: pnpm test → passes

3. REFACTOR (REFACTOR)
   → Clean up code
   → Ensure tests still pass
   → Run: pnpm tsc --noEmit && pnpm lint
```

### 5.2 Test Coverage Requirements

| Priority | Coverage Target |
|----------|----------------|
| Critical paths (auth, validateCandidateData) | 90%+ |
| Business logic (services) | 80%+ |
| API endpoints | 70%+ |
| UI components | 60%+ |
| Utility functions | 70%+ |

## Step 6: README Update Workflow

### Trigger Conditions

When these file patterns change, README update is REQUIRED:

| File Pattern | README Section to Update |
|--------------|--------------------------|
| `backend/src/routes/*` | API Endpoints |
| `frontend/src/components/*` | Components |
| `frontend/tests/e2e/*` | E2E Testing |
| `backend/prisma/schema.prisma` | Database Schema |
| `.env.example` | Environment Variables |
| `package.json` (scripts changed) | Commands |

### README Update Flow

```
Implementation Complete
        ↓
Files changed match README trigger?
        ↓
YES → Trigger docs-agent to update README
        ↓
docs-agent updates README.md
        ↓
change-reviewer validates README updated
        ↓
Ticket can be marked complete
```

### docs-agent README Update Protocol

```
RECEIVE: README update trigger for {ticket_id}
FILES CHANGED:
  - {list of changed files}
CONTEXT:
  - {what was implemented}
  - {why it matters for documentation}

ACTIONS:
1. READ current README.md
2. IDENTIFY sections that need updates
3. UPDATE relevant sections with accurate info
4. VERIFY updates don't break links
5. ADD changelog entry if applicable

OUTPUT:
  - README.md updated
  - Summary of changes made
```

### README Update Quality Checklist

- [ ] API changes reflected in documentation
- [ ] New components documented
- [ ] Setup instructions still accurate
- [ ] No broken internal links
- [ ] Examples still work
- [ ] Changelog updated with new version

## Step 7: Change Reviewer Integration

### Agent Role

**change-reviewer** acts as final validation gate for all ticket completions.

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHANGE REVIEWER GATE                         │
├─────────────────────────────────────────────────────────────────┤
│ BEFORE: agent reports completion                                │
│         ↓                                                        │
│ VALIDATE: quality gates (tsc, lint, test, e2e)                   │
│         ↓                                                        │
│ VALIDATE: acceptance criteria met                                │
│         ↓                                                        │
│ VALIDATE: README updated (if required)                          │
│         ↓                                                        │
│ VALIDATE: Linear ticket synced                                  │
│         ↓                                                        │
│ OUTPUT: APPROVED → orchestrator                                 │
│         REJECTED → back to implementing agent                   │
└─────────────────────────────────────────────────────────────────┘
```

### Integration with Orchestrator (Hybrid)

```
User Task
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ORCHESTRATOR                                 │
│  (analyze, decompose, CLASSIFY complexity)                       │
└─────────────────────────────────────────────────────────────────┘
    │
    ├──[SIMPLE]────────────────────────────────────────────────────┐
    │                                                              │
    └─► docs-agent (direct ticket creation)                        │
              │                                                    │
              └─► backend/frontend (implementation)                │
                                                               ┌───┘
    └──[COMPLEX]──────────────────────────────────────────────┐  │
                                                              │  │
    ┌──────────────────────────────────────────────────────┐  │  │
    │              grill-with-docs                          │  │  │
    │  • Challenge against domain model                    │  │  │
    │  • Sharpen fuzzy terminology                         │  │  │
    │  • Probe edge cases with concrete scenarios          │  │  │
    │  • Cross-reference with code                        │  │  │
    │  • UPDATE CONTEXT.md inline                         │  │  │
    │  • CREATE ADRs (if criteria met)                     │  │  │
    └──────────────────────────┬───────────────────────────┘  │  │
                               │                               │  │
                               ▼                               │  │
    ┌──────────────────────────────────────────────────────┐  │  │
    │              docs-agent                              │  │  │
    │  (CREATE ticket from refined requirements)          │  │  │
    └──────────────────────────┬───────────────────────────┘  │  │
                               │                               │  │
                               ▼                               ▼  │
                    ┌──────────────────────────────────────────┐ │
                    │     backend-agent OR frontend-agent       │ │
                    │     (implementation, TDD, quality gates)  │ │
                    └──────────────────────┬───────────────────┘ │
                                             │                    │
                                             ▼                    │
    ┌──────────────────────────────────────────────────────────────┐│
    │                      qa-agent                                ││
    │  (unit tests + E2E tests)                                    ││
    └──────────────────────────────────────────────┬───────────────┘│
                                                   │              │
                                                   ▼              │
    ┌──────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CHANGE REVIEWER                               │
│  (final validation gate)                                        │
└─────────────────────────────────────────────────────────────────┘
    │
    ├─► APPROVED: docs-agent updates README if needed
    │
    └─► REJECTED: return to implementing agent with fixes
```

### Key Integration Points

| Phase | Simple Path | Complex Path |
|-------|-------------|--------------|
| **Pre-ticket** | docs-agent (direct) | grill-with-docs → docs-agent |
| **Ticket creation** | Standard template | Enhanced with refined requirements |
| **Documentation** | SPEC.md only | SPEC.md + CONTEXT.md + ADRs |
| **Quality gates** | Standard | + grill-with-docs completion |

### Quality Gate Commands (Reference)

```bash
# Backend quality gates
cd backend && pnpm tsc --noEmit          # TypeScript type check
cd backend && pnpm lint                  # ESLint + Prettier
cd backend && pnpm test                  # Jest unit tests (≥70%)

# Frontend quality gates
cd frontend && pnpm tsc --noEmit         # TypeScript type check
cd frontend && pnpm lint                  # ESLint
cd frontend && pnpm test                  # Jest tests (≥60%)
cd frontend && pnpm test:e2e              # Playwright E2E tests

# E2E (when playwright configured)
pnpm test:e2e                            # Playwright E2E tests
```

## Step 8: Linear Integration

Every feature MUST have a Linear ticket:

```typescript
// When starting work on a feature:
1. Create ticket: linear_save_issue({
     title: "Feature: {description}",
     team: "{team}",
     state: "in_progress"
   })

2. Update progress: linear_save_comment({
     issueId: "LIN-XXX",
     body: "## Progress\n- [ ] Spec done\n- [ ] Implementation done\n- [ ] Tests written\n- [ ] QA verified"
   })

3. Close ticket: linear_save_issue({
     id: "LIN-XXX",
     state: "completed"
   })
```

## Step 9: Verify & Iterate

### 7.1 Validation Checklist

```
[ ] Graphify analysis complete
[ ] Agent roles defined (orchestrator, frontend, backend, qa, docs, change-reviewer)
[ ] Communication pattern selected (hierarchical)
[ ] Memory strategy implemented (graphify + Linear)
[ ] Tool suite defined per pattern
[ ] Orchestration flow documented
[ ] Config files generated
[ ] Agent prompts written
[ ] Quality gates enforced
[ ] Linear integration configured
[ ] README update workflow defined
[ ] Change reviewer integrated into flow
```

### 7.2 Test Flow

```
1. Trigger: /delegate {task}
2. Entry agent receives task
3. Analyze → decompose into subtasks
4. Spawn specialized agents
5. Each agent works within scope
6. Results flow to reviewer
7. Reviewer validates against constraints
8. Synthesis agent combines output
9. Return final result
```

## Enforced Delegation Pattern

**CRITICAL: Orchestrator agent MUST delegate, never implement directly.**

### The Problem

When users asked the Orchestrator to "implement a ticket", it sometimes tried to implement directly instead of delegating to sub-agents. This violates the multi-agent architecture.

### The Solution

Updated orchestrator.md with:
1. **Explicit task permission restrictions** — only allowed to invoke specific sub-agents
2. **Trigger keywords in description** — "implement", "build", "fix", "add", "create feature"
3. **FORBIDDEN patterns** — Anti-patterns section explicitly states "IF YOU RECEIVE A TASK AND DO NOT DELEGATE, YOU HAVE FAILED"
4. **Task Routing Table** — clear mapping of user request patterns to sub-agents

### OpenCode Configuration

The orchestrator agent uses `task` permissions to control delegation:

```json
{
  "agent": {
    "orchestrator": {
      "mode": "primary",
      "permission": {
        "task": {
          "backend-agent": "allow",
          "frontend-agent": "allow",
          "qa-agent": "allow",
          "docs-agent": "allow",
          "change-reviewer": "allow",
          "*": "deny"
        }
      }
    }
  }
}
```

### Sub-agent Auto-routing

Each sub-agent now has trigger keywords in its description for auto-routing:

| Agent | Trigger Keywords |
|-------|------------------|
| backend-agent | "backend", "api", "database", "service", "server" |
| frontend-agent | "frontend", "ui", "component", "react", "button", "form" |
| qa-agent | "test", "coverage", "e2e", "playwright", "unit test" |
| docs-agent | "documentation", "spec", "ticket", "linear", "readme" |
| change-reviewer | "review", "validate", "check quality" |

### Verification

After any configuration change:
1. Verify symbolic links exist: `ls -la .opencode/agents/`
2. Verify symbolic links exist: `ls -la .opencode/skills/`
3. Test delegation by asking to "implement a simple feature"

## Quick Start Template

```
1. Run: graphify update .
2. Read: graphify-out/GRAPH_REPORT.md
3. Ask: "What agentic system fits this architecture?"
4. Design: Use steps 2-4 above
5. Implement: Create skill with agent configs
6. Test: /delegate a simple task
```

## Anti-Patterns

- **Don't design agents that map to files** — map to domain responsibilities
- **Don't assume all patterns apply** — select based on actual project structure
- **Don't skip graphify analysis** — structural understanding is foundational
- **Don't create agents without exit criteria** — infinite loops are likely
- **Don't ignore permission boundaries** — agents should have minimal necessary permissions
- **Don't skip quality gates** — typecheck/lint/test must always run
- **Don't skip Linear ticket** — every feature needs traceability
- **Don't skip TDD** — write tests before implementation

## Quality Gate Commands

```bash
# Backend quality gates
cd backend && pnpm tsc --noEmit          # TypeScript type check
cd backend && pnpm lint                  # ESLint + Prettier
cd backend && pnpm test                  # Jest unit tests

# Frontend quality gates
cd frontend && pnpm tsc --noEmit         # TypeScript type check
cd frontend && pnpm lint                  # ESLint
cd frontend && pnpm test                  # Jest tests

# E2E (when playwright configured)
pnpm test:e2e                            # Playwright E2E tests
```

## References

- [LangGraph Supervisor](https://github.com/langchain-ai/langgraph-supervisor-py)
- [CrewAI Multi-Agent](https://docs.crewai.com/)
- [Anthropic Agent Patterns](https://docs.anthropic.com/)
- [OpenCode Agent System](#opencode-agent-architecture)
- [TDD Skill](../tdd/SKILL.md)
- [BDD E2E Skill](../bdd-e2e/SKILL.md)