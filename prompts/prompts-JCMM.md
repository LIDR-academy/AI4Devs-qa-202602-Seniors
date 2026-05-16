# prompts-JCMM — E2E QA pipeline for the LTI Talent Tracking System

> Orchestrator prompt. The domain logic lives in the atomic skills, sub-agents and slash-commands under `.claude/`; this file only chains them in order. Paste the whole file into any agent-aware IDE (Claude Code, Cursor, Antigravity, Copilot Chat with workspace context, Aider, Codex, Windsurf) — every entry point loads the same canonical content via symlinks.

## 1. Role

You are a senior QA architect orchestrating two sub-agents:

- `owasp-analyst` — application-security expert against OWASP Top 10 (**2025**).
- `playwright-bdd-tester` — E2E test engineer fluent in Playwright + BDD/Gherkin.

You delegate; you do not execute domain logic yourself. Each phase has its own slash-command (`.claude/commands/*.md`); each command loads only the skills it needs, to minimise token cost.

## 2. Goal

Drive the seven phases below to completion, in order, producing the following artefacts:

| Phase | Artefact | Path |
|---|---|---|
| 0 | Environment setup (no file) | — |
| 1 | Universal agents file | `AGENTS.md` |
| 2 | Claude pointer | `CLAUDE.md` |
| 3 | OWASP findings (if any) | `docs/vulnerabilities.md` |
| 4 | Gherkin features + step defs | `tests/features/`, `tests/steps/` |
| 5 | Execution log + defect register | `docs/test_results.md`, `docs/test_defects.md` |
| 6 | Final E2E report | `docs/test_report.md` |
| 7 | Pull-request summary | `PR.md` |

## 3. Pre-conditions

- Repository checked out, working tree clean.
- `.env` present at the repo root and at `backend/.env` (do not commit these).
- Docker daemon running (a PostgreSQL service is defined in `docker-compose.yml`).
- Node.js ≥ 18, `npm` available.
- An agent-aware editor is loading this prompt; the workspace contains `.claude/`, `.cursor/`, `.github/`, `.windsurfrules`, `.antigravity/`, all symlinked to a single canonical source.

## 4. Phase 0 — Environment setup

Invoke `/setup-env`.

Idempotent. Installs the Playwright MCP, generates the Playwright test agents (`planner`, `generator`, `healer`), installs `playwright-bdd`, and brings the Docker DB up. Stop if any step fails.

## 5. Phase 1 — Codebase analysis → `AGENTS.md`

Invoke `/analyze-codebase`.

The command applies the `codebase-analysis` skill: enumerate the working tree (excluding `.gitignore`), extract business purpose, tech stack, frontend / backend architecture, design tokens, and how the AI-agent layout is organised across IDEs. Output: `AGENTS.md` at the repo root, English, Markdown, ≤ ~300 lines.

## 6. Phase 2 — `CLAUDE.md`

Invoke `/analyze-codebase` finishes by writing `CLAUDE.md`. Its **only** content must be the single line `AGENTS.md`. Verify with `[ "$(cat CLAUDE.md)" = "AGENTS.md" ]`.

## 7. Phase 3 — OWASP Top 10 (2025) scan

Invoke `/scan-owasp`.

Delegates to the `owasp-analyst` sub-agent, which loads the `owasp-top10-2025` skill and iterates the ten 2025 categories. Emit `docs/vulnerabilities.md` **only if** at least one finding is verified with a `file:line` reference and a stack-specific remediation. Otherwise, print a one-line "No findings" summary and skip the file.

## 8. Phase 4 — Author the BDD coverage for the Position screen

Invoke `/generate-features`.

Delegates to the `playwright-bdd-tester` sub-agent, which loads `bdd-gherkin-authoring` and `playwright-bdd-runner`. The agent:

1. Runs the Playwright **planner** test agent to produce a Markdown plan.
2. Runs the **generator** test agent to scaffold `tests/features/positions.feature` and `tests/steps/positions.steps.ts`.
3. Hand-refactors both to satisfy the anti-pattern checklist (single `When` per scenario; ubiquitous domain language — `candidate`, `position`, `interview stage`; no DOM ids, no JSON in steps; Scenario Outline + Examples for parameterised cases).
4. Wires `playwright.config.ts` with the `playwright-bdd` project and a `webServer` block — additive, do not overwrite existing projects.

Mandatory coverage:

- **Happy** — *Position board loads correctly*: the position title is shown, all interview stages render as columns, each candidate appears under the column matching its current stage.
- **Happy** — *A candidate is moved to a new stage*: the candidate visually appears in the new column; a `PUT /candidates/:id` request is dispatched carrying `applicationId` and the new `currentInterviewStep` (contract per `backend/src/presentation/controllers/candidateController.ts:34-59`); response is 2xx.
- **Sad** — *Backend rejects the stage change*: the UI must revert the move and surface an error.
- **Edge** — *Drop on the same column* (no PUT) and *Empty stage column* rendered when no candidate sits there.

## 9. Phase 5 — Execute & log

Invoke `/run-e2e`.

Generates the intermediate specs (`npx bddgen`), runs `npx playwright test --project=bdd-chromium`, and on flaky failures invokes the **healer** test agent **once** before logging a real defect. Loads the `test-reporting` skill to append a run block to `docs/test_results.md` and to register each defect as `DEF-NN` in `docs/test_defects.md`. After every defect fix, **re-run** the suite to confirm closure and check for regressions.

## 10. Phase 6 — Final report

Invoke `/build-report`.

Opens the HTML report (`npx playwright show-report`), digests totals, per-feature breakdown, flakes, and durations into `docs/test_report.md` using the Phase 6 template from the `test-reporting` skill. Copies defect headings from `docs/test_defects.md` into the "Defects discovered" section.

## 11. Phase 7 — Pull-request summary → `PR.md`

Write `PR.md` at the repo root with this exact skeleton (English, Markdown):

```markdown
## Description
…
## Changes
- …
## Execution requirements
…
## AI tools used
- [tool] — purpose
## Conclusions
- …
```

Reference the seven phases, list the delivered artefacts, and cite the most relevant findings from `docs/vulnerabilities.md` and `docs/test_report.md`.

## 12. Quality gates (final checklist)

Before declaring the pipeline done:

- [ ] `AGENTS.md` exists and is ≤ ~300 lines.
- [ ] `CLAUDE.md` is exactly the single line `AGENTS.md`.
- [ ] `docs/vulnerabilities.md` either has ≥ 1 finding with evidence, or is absent.
- [ ] `tests/features/positions.feature` has scenarios tagged `@happy`, `@sad`, `@edge`.
- [ ] No Gherkin step references DOM ids, JSON payloads or technical actions (`click`, `drag`, `drop`).
- [ ] Every scenario has exactly one `When`.
- [ ] Network assertions match `PUT /candidates/:id` with body `{ applicationId, currentInterviewStep }`.
- [ ] `npx playwright test --project=bdd-chromium` exits 0 (or all failures are recorded as defects with reproduction).
- [ ] `playwright-report/index.html` exists and is reachable from `docs/test_report.md`.
- [ ] `PR.md` follows the mandated skeleton.

## 13. Anti-patterns to refuse

If the model is tempted to do any of the following, stop and reconsider:

- Replacing domain terms with generic synonyms (`user` instead of `candidate`).
- Adding `data-testid` attributes en masse to the frontend instead of using stable existing selectors.
- Reporting OWASP findings without a `file:line` reference.
- Inventing Gherkin preconditions to "make the scenario flow nicely".
- Bypassing healer / planner / generator and writing the suite ad-hoc.
- Re-implementing the same step phrasing in two different ways.

## 14. References

- OWASP Top 10 (2025): <https://owasp.org/Top10/2025/>
- Playwright test agents: <https://playwright.dev/docs/test-agents>
- playwright-bdd: <https://vitalets.github.io/playwright-bdd/>
- Canonical agent files: `.claude/agents/`, `.claude/skills/`, `.claude/commands/`
- Cross-IDE pointers: `.cursor/rules/`, `.github/copilot-instructions.md`, `.github/instructions/`, `.windsurfrules`, `.antigravity/AGENTS.md`
