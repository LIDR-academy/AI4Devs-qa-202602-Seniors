# Prompts-JSGB

This file documents all prompts used to implement the changes in this branch.

---

## Prompt 1: Update .gitignore

**Task:** Update `.gitignore` to exclude environment variables and graphify output directory.

**Prompt:**
```
Update the .gitignore file to:
1. Uncomment and rename the environment variables line to just ".env"
2. Add "graphify-out" to the ignored entries
```

**Result:** Updated `.gitignore` with:
```
# Environment variables
.env

# Graphify
graphify-out
```

---

## Prompt 2: Create ESLint flat config for TypeScript

**Task:** Replace `.eslintrc.js` with the new ESLint flat config format.

**Prompt:**
```
Replace the old ESLint configuration (backend/.eslintrc.js) with a new flat config format file (backend/eslint.config.js).

The new config should:
- Use eslint-config-prettier for formatting rules
- Use @typescript-eslint/parser for TypeScript/JavaScript parsing
- Apply to all **/*.ts and **/*.js files
- Set ecmaVersion to 2022 and sourceType to 'module'
- Set 'no-unused-vars' rule to 'warn'
```

**Result:** Created `backend/eslint.config.js` with TypeScript ESLint plugin and prettier integration.

---

## Prompt 3: Configure Jest for TypeScript testing

**Task:** Update `backend/jest.config.js` to properly detect TypeScript test files.

**Prompt:**
```
Update backend/jest.config.js to:
1. Add testMatch configuration to find **/src/**/*.test.ts files
2. Add roots configuration pointing to <rootDir>/src
```

**Result:** Updated jest config with testMatch and roots settings.

---

## Prompt 4: Add TypeScript ESLint dependencies

**Task:** Add `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` to backend dependencies.

**Prompt:**
```
Add the following dev dependencies to backend/package.json:
- @typescript-eslint/eslint-plugin: ^8.59.3
- @typescript-eslint/parser: ^8.59.3
```

**Result:** Dependencies added to package.json.

---

## Prompt 5: Fix test mock data

**Task:** Add missing fields to test mock data in `positionService.test.ts`.

**Prompt:**
```
In backend/src/application/services/positionService.test.ts, add the following fields to the mock candidate object at line 35:
- candidateId: 1
- applicationId: 1
```

**Result:** Mock data now includes candidateId and applicationId fields.

---

## Prompt 6: Reorganize candidate routes

**Task:** Reorganize `backend/src/routes/candidateRoutes.ts` to have proper route ordering.

**Prompt:**
```
In backend/src/routes/candidateRoutes.ts, reorganize the routes in this order:
1. GET / (root route - health check) - should return { message: 'Candidate routes working' }
2. GET /:id (getCandidateById)
3. PUT /:id (updateCandidateStageController)
4. POST / (addCandidate)

Also remove the commented console.log line from the POST route.
```

**Result:** Routes reorganized with proper ordering and cleanup.

---

## Prompt 7: Clean up unused imports in AddCandidateForm

**Task:** Remove unused InputGroup import from AddCandidateForm.js.

**Prompt:**
```
In frontend/src/components/AddCandidateForm.js, remove the InputGroup import since it's not being used.
```

**Result:** Import cleaned up.

---

## Prompt 8: Clean up unused imports in PositionDetails

**Task:** Remove unused imports from PositionDetails.js.

**Prompt:**
```
In frontend/src/components/PositionDetails.js, remove the following unused imports:
- Offcanvas from react-bootstrap
```

**Result:** Import cleaned up.

---

## Prompt 9: Create AGENTS.md guidelines file

**Task:** Create the AGENTS.md file with project-wide agent guidelines.

**Prompt:**
```
Create a new file called AGENTS.md in the project root with the following sections:

1. MANDATORY section:
   - Everything must be written in English
   - Use pnpm as package manager
   - Use context7 MCP or EXA MCP before working with external libraries
   - Zero TypeScript or linter errors allowed

2. Source of truth section:
   - ai-specs is the source of truth
   - When creating skills, agents, or subagents, create them in ai-specs directory
   - Reference them from .opencode with symbolic links

3. Four core guidelines:
   - Think Before Coding: State assumptions, ask questions when uncertain
   - Simplicity First: Minimum code, no speculative features
   - Surgical Changes: Touch only what must be changed, match existing style
   - Goal-Driven Execution: Define success criteria, loop until verified

4. MANDATORY GATE: graphify section:
   - This project uses graphify knowledge graph at graphify-out/
   - Must use graphify for any project structure or architecture questions
   - After code modifications, run "graphify update ." to keep graph current

5. context7 MCP section:
   - Use Context7 MCP to fetch documentation for libraries/frameworks
   - Steps: resolve-library-id, pick best match, query-docs, answer
```

**Result:** Created AGENTS.md with comprehensive project guidelines.

---

## Prompt 10: Create NOV-14 ticket documentation

**Task:** Create the NOV-14 ticket documentation for E2E tests with Playwright.

**Prompt:**
```
Create a new file docs/tickets/NOV-14.md with frontmatter and detailed E2E test requirements:

Frontmatter:
- id: NOV-14
- title: "E2E Tests for Position Interface with Playwright"
- status: triage
- priority: high
- labels: [e2e, playwright, testing, frontend]

Content should include:
1. Contexto section explaining the need for E2E tests using Playwright
2. Requisitos section with:
   - Configure Playwright in /frontend
   - Create tests for position interface
3. Escenario 1: Page load verification (title, columns, candidate cards)
4. Escenario 2: Candidate phase change via drag-and-drop
5. Expected phases: Aplicado, Entrevista, Prueba Técnica, Oferta, Contratado, Rechazado
6. Verify PUT request is fired on candidate move with currentInterviewStep in body
7. Deliverables: /frontend/tests/e2e/position.spec.ts and prompts file
```

**Result:** Created comprehensive NOV-14.md ticket documentation.

---

## Prompt 11: Create Linear tickets sync documentation

**Task:** Create the docs/tickets/README.md file explaining the Linear tickets sync mechanism.

**Prompt:**
```
Create docs/tickets/README.md with:
1. Overview explaining one-way sync from Linear to docs/tickets/
2. Manual sync instructions with commands
3. Automated sync example using GitHub Actions
4. Ticket file format specification with frontmatter
5. Usage notes for subagents
6. Warning not to edit files manually
```

**Result:** Created README.md documenting the Linear sync workflow.

---

## Prompt 12: Set up agent files and skills

**Task:** Create the agent and skill structure with symbolic links to ai-specs.

**Prompt:**
```
Create the following directory structure with symbolic links:
- .opencode/agents → ai-specs/agents
- .opencode/skills/enrich-us → ai-specs/skills/enrich-us
- .opencode/skills/multi-agent-investigation → ai-specs/skills/multi-agent-investigation
- .opencode/skills/project-context-analyzer → ai-specs/skills/project-context-analyzer

For each skill, also create the corresponding documentation in ai-specs/:
- ai-specs/skills/bdd-e2e/SKILL.md
- ai-specs/skills/enrich-us/SKILL.md
- ai-specs/skills/multi-agent-investigation/SKILL.md
- ai-specs/skills/multi-agent-investigation/refs/multi-agent-orchestration.md
- ai-specs/skills/project-context-analyzer/SKILL.md
```

**Result:** Created agent directory structure with symbolic links.

---

## Prompt 13: Create agent documentation

**Task:** Create documentation files for all agents in ai-specs/agents/.

**Prompt:**
```
Create documentation files for each agent in ai-specs/agents/:
- backend-agent.md
- docs-agent.md
- frontend-agent.md
- onboarding-agent.md
- orchestrator.md
- qa-agent.md

Each file should document the agent's purpose, responsibilities, and usage.
```

**Result:** Created comprehensive agent documentation files.

---

## Prompt 14: Analyze project structure with Graphify

**Task:** Run graphify to analyze the current project structure and understand architecture.

**Prompt:**
```
Run graphify on the project to analyze:
1. God nodes (most connected entities)
2. Communities (tightly coupled modules)
3. Surprising connections (cross-boundary calls)
4. Knowledge gaps (isolated nodes)

Read the GRAPH_REPORT.md to understand the architecture.
```

**Result:** 
- Graph has 158 nodes, 190 edges, 24 communities
- God nodes: validateCandidateData() (10 edges), Application (7 edges), Position (6 edges)
- Key communities: Candidate Domain, Position Queries, Candidate Controllers, Application/Interview, Validators (cohesion 0.40)
- Architecture: Layered + DDD hybrid pattern

---

## Prompt 15: Update harness-engineering SKILL.md

**Task:** Enhance harness-engineering skill with project-specific quality enforcement.

**Prompt:**
```
Update ai-specs/skills/harness-engineering/SKILL.md to include:
1. Project-specific god nodes and communities from graphify
2. Quality gates: typecheck, lint, test, e2e, Linear sync
3. Project stack documentation (Express, Prisma, React, Jest, Playwright)
4. TDD enforcement as mandatory workflow
5. Coverage requirements per component type
6. Commands: pnpm typecheck, pnpm lint, pnpm test
```

**Result:** Updated harness-engineering with comprehensive project-specific quality enforcement.

---

## Prompt 16: Create TDD skill

**Task:** Create ai-specs/skills/tdd/SKILL.md for test-first development.

**Prompt:**
```
Create ai-specs/skills/tdd/SKILL.md with:
1. Red-green-refactor workflow (RED → write failing test, GREEN → minimal code, REFACTOR → clean)
2. Backend test conventions (Jest + ts-jest, files next to implementation)
3. Frontend test conventions (Jest + React Testing Library)
4. Coverage requirements (Critical: 90%, Business logic: 80%, API: 70%, UI: 60%)
5. Test structure pattern (describe, given, when, then)
6. Quality gates: pnpm tsc --noEmit, pnpm lint, pnpm test
7. Integration with Linear and other skills
```

**Result:** Created comprehensive TDD skill with workflow, conventions, and quality gates.

---

## Prompt 17: Create playwright-e2e skill

**Task:** Create ai-specs/skills/playwright-e2e/SKILL.md for E2E testing.

**Prompt:**
```
Create ai-specs/skills/playwright-e2e/SKILL.md with:
1. Playwright configuration (playwright.config.ts)
2. Test structure (pages/, step_definitions/, features/)
3. Page Object pattern with examples
4. BDD integration (Gherkin + Playwright)
5. CLI commands (pnpm test:e2e, --ui, --headed, --debug)
6. CI/CD integration example
7. Anti-patterns to avoid
```

**Result:** Created playwright-e2e skill with configuration, patterns, and CI/CD examples.

---

## Prompt 18: Enhance backend-agent with quality gates

**Task:** Update ai-specs/agents/backend-agent.md with TDD enforcement and quality gates.

**Prompt:**
```
Update backend-agent.md to include:
1. Quality Gates section:
   - pnpm tsc --noEmit (typecheck)
   - pnpm lint
   - pnpm test (≥70% coverage)
   - Linear ticket sync
2. TDD Workflow section (RED → GREEN → REFACTOR)
3. Quality checklist with all gates
4. Anti-patterns: NEVER skip TDD, NEVER bypass quality gates
5. Linear integration for ticket creation
```

**Result:** Enhanced backend-agent with mandatory TDD and quality gates.

---

## Prompt 19: Enhance qa-agent with quality gates

**Task:** Update ai-specs/agents/qa-agent.md with TDD enforcement.

**Prompt:**
```
Update qa-agent.md to include:
1. Quality Gates section for all test types
2. TDD Enforcement section
3. Coverage requirements table
4. Linear integration for test status updates
5. Quality checklist with all gates
6. Anti-patterns: NEVER skip TDD, NEVER skip quality gates
```

**Result:** Enhanced qa-agent with TDD enforcement and quality gates.

---

## Prompt 20: Enhance frontend-agent with quality gates

**Task:** Update ai-specs/agents/frontend-agent.md with TDD enforcement.

**Prompt:**
```
Update frontend-agent.md to include:
1. Quality Gates section:
   - pnpm tsc --noEmit
   - pnpm lint
   - pnpm test (≥60% coverage)
   - pnpm test:e2e
   - Linear ticket sync
2. TDD Workflow with React component example
3. Quality checklist
4. Anti-patterns: NEVER skip TDD, NEVER bypass quality gates
```

**Result:** Enhanced frontend-agent with TDD and quality gates.

---

## Prompt 21: Enhance orchestrator with quality gate validation

**Task:** Update ai-specs/agents/orchestrator.md with quality gate validation.

**Prompt:**
```
Update orchestrator.md to include:
1. Quality Gates section with all required commands
2. TDD Enforcement as mandatory workflow
3. Delegation rules with TDD Required column
4. Quality Gate Validation section
5. Checklist: all typecheck/lint/test/e2e pass before responding
6. Anti-patterns: NEVER skip quality gates, NEVER skip Linear sync
```

**Result:** Enhanced orchestrator with mandatory quality gate validation.

---

## Prompt 22: Add quality scripts to backend package.json

**Task:** Add lint, typecheck, and quality scripts to backend/package.json.

**Prompt:**
```
Add these scripts to backend/package.json:
- "typecheck": "tsc --noEmit"
- "lint": "eslint src --ext .ts"
- "quality": "pnpm typecheck && pnpm lint && pnpm test"
```

**Result:** Added quality scripts to backend.

---

## Prompt 23: Add quality scripts to frontend package.json

**Task:** Add lint, typecheck, and quality scripts to frontend/package.json.

**Prompt:**
```
Add these scripts to frontend/package.json:
- "typecheck": "tsc --noEmit"
- "lint": "eslint src --ext .ts,.tsx"
- "quality": "pnpm typecheck && pnpm lint && pnpm test"
```

**Result:** Added quality scripts to frontend.

---

## Prompt 24: Verify quality commands work

**Task:** Run all quality commands to verify they pass.

**Prompt:**
```
Run these commands and verify:
1. cd backend && pnpm typecheck (should pass with no errors)
2. cd backend && pnpm lint (should show warnings only, no errors)
3. cd backend && pnpm test (should pass all tests)
```

**Result:** 
- typecheck: passes
- lint: 6 warnings (no errors)
- test: 4 suites passed, 4 tests passed