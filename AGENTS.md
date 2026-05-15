# Agents

## Available Agents

| Agent | Description | When to use |
|-------|-------------|-------------|
| [QA Tester](.ai-context/agents/qa-tester.agent.md) | BDD/Playwright E2E test writer and verifier | Writing, running, and fixing E2E tests |

## Instructions (by domain)

Instructions and rules are the same content in `.ai-context/instructions/`.
Claude reads them via `.claude/rules` symlink, Copilot via `.github/instructions`.

| Domain | Doc | Reusable for |
|--------|-----|--------------|
| [BDD & Gherkin](.ai-context/instructions/bdd-gherkin.md) | Scenario structure, prompting, anti-patterns | Any BDD project |
| [Selectors](.ai-context/instructions/selectors.md) | Locator priority, `data-testid` conventions | Any Playwright project |
| [Test Stability](.ai-context/instructions/test-stability.md) | CI config, flakiness diagnosis, three-pass check | Any E2E suite |
| [Test Independence](.ai-context/instructions/test-independence.md) | Isolation, fixtures, data seeding | Any test suite |
| [Page Object Model](.ai-context/instructions/page-object-model.md) | POM discovery, structure, conventions | Any Playwright project |
| [Test Validation](.ai-context/instructions/test-validation.md) | Assertions, maintenance, health metrics | Any test suite |
| [Playwright-BDD Config](.ai-context/instructions/playwright-bdd-config.md) | Stack, file layout, commands, workflow | This project specifically |

## Skills

| Skill | Usage |
|-------|-------|
| [Playwright CLI](.ai-context/skills/playwright-cli/SKILL.md) | Browser automation and test interaction |

## Symlink Map

```
.claude/agents   → .ai-context/agents        (Claude Code agents)
.claude/rules    → .ai-context/instructions   (Claude Code rules = instructions)
.claude/skills   → .ai-context/skills         (Claude Code skills)
.claude/commands → .ai-context/prompts        (Claude Code slash commands)
.github/agents   → .ai-context/agents         (Copilot agents)
.github/instructions → .ai-context/instructions (Copilot instructions)
.github/skills   → .ai-context/skills         (Copilot skills)
```

## Recommended Workflow

1. Developer describes scenario in natural language (Given/When/Then)
2. QA Tester agent navigates the live app via Playwright MCP/CLI
3. Agent writes `.feature` file + step definitions + POM
4. Agent executes and refines until 3 consecutive passes
5. Developer reviews and approves

## Project Context

- **Stack**: React frontend + Node/Express backend + Prisma ORM
- **E2E Framework**: Playwright + playwright-bdd (Gherkin)
- **Test data**: @faker-js/faker + Prisma seed
- **Config**: `frontend/playwright.config.ts`
- **Tests**: `frontend/features/` (Gherkin) + `frontend/tests/` (specs)
