# Prompts — JCT

Metaprompts used to complete the E2E testing exercise for the position page.

---

## 1. Add data-testid attributes to position components

> Using the QA Tester agent's selector rules (`.ai-context/instructions/selectors.md`), add `data-testid` attributes to the position page components:
>
> - `PositionDetails.js`: add `data-testid="position-title"` to the `<h2>` with `positionName`
> - `StageColumn.js`: add `data-testid="stage-column-{index}"` to each column Card, and `data-testid="stage-column-header"` to each Card.Header
> - `CandidateCard.js`: add `data-testid="candidate-card-{candidate.id}"` to each candidate Card, and `data-testid="candidate-name"` to the Card.Title
>
> These are the minimum selectors needed for the E2E tests. Do not change any behavior.

---

## 2. Write BDD feature: Position page loads correctly

> Write a Gherkin feature file at `frontend/features/position-page-load.feature` following `.ai-context/instructions/bdd-gherkin.md`.
>
> Feature: Position page displays correctly
>
> Scenarios to cover:
> 1. Position title is visible when page loads
> 2. All interview phase columns are displayed
> 3. Candidate cards appear in their correct phase column
>
> Context:
> - Route: `/positions/:id`
> - API: GET `/positions/:id/interviewFlow` returns `{ interviewFlow: { positionName, interviewFlow: { interviewSteps: [{id, name}] } } }`
> - API: GET `/positions/:id/candidates` returns `[{ candidateId, fullName, currentInterviewStep, averageScore, applicationId }]`
> - Backend runs on port 3010
>
> Use Scenario Outline if applicable. Domain language: posición, fase, candidato.

---

## 3. Write BDD feature: Candidate phase change via drag & drop

> Write a Gherkin feature file at `frontend/features/candidate-phase-change.feature` following `.ai-context/instructions/bdd-gherkin.md`.
>
> Feature: Candidate moves between interview phases
>
> Scenarios to cover:
> 1. Recruiter drags a candidate card from one phase column to another — card appears in new column
> 2. Moving a candidate triggers a PUT request to `/candidates/:id` with correct `applicationId` and `currentInterviewStep`
> 3. Backend responds successfully after the phase change
>
> Context:
> - Drag & drop uses `react-beautiful-dnd` (Droppable/Draggable)
> - PUT `/candidates/:id` body: `{ applicationId: number, currentInterviewStep: number }`
> - The `currentInterviewStep` is the destination stage's `id` (not its name)
> - Backend runs on port 3010
>
> Validate: UI update + network request + response status.

---

## 4. Implement step definitions and POM for position page

> Following `.ai-context/instructions/page-object-model.md` and `.ai-context/instructions/playwright-bdd-config.md`:
>
> 1. Create `frontend/pages/PositionDetailsPage.ts` with:
>    - `goto(positionId)` — navigates to `/positions/:id`
>    - `title` — locator for position title (`data-testid="position-title"`)
>    - `stageColumns` — locator for all stage columns
>    - `stageColumnHeader(index)` — locator for column header text
>    - `candidateCard(id)` — locator for specific candidate card
>
> 2. Create step definitions in `frontend/features/steps/position.ts` using `createBdd()` from `playwright-bdd`
>
> 3. For the drag & drop test: since `react-beautiful-dnd` doesn't support native HTML5 DnD events in Playwright, use the Playwright `page.dispatchEvent` approach or `page.mouse` to simulate the drag. Intercept the PUT network request with `page.waitForResponse`.
>
> 4. Mock the backend API responses using Playwright's `page.route()` to make tests independent from a running backend.

---

## 5. Run tests and verify stability

> Run the E2E tests following the stability protocol from `.ai-context/instructions/test-stability.md`:
>
> ```bash
> cd frontend && npx bddgen && npx playwright test --repeat-each=3
> ```
>
> If any test fails:
> 1. Diagnose using trace (`npx playwright show-trace`)
> 2. Fix the step definition or POM
> 3. Re-run until 3 consecutive passes
>
> Report results: number of scenarios, pass rate, any flakiness notes.

---

## 6. Create Pull Request

> Create a PR to `main` with title "feat(e2e): add Playwright BDD tests for position page".
>
> Include in the PR:
> - `frontend/features/position-page-load.feature`
> - `frontend/features/candidate-phase-change.feature`
> - `frontend/features/steps/position.ts`
> - `frontend/pages/PositionDetailsPage.ts`
> - `frontend/playwright.config.ts` (already configured)
> - `.ai-context/` (instructions, agent, skills)
> - `prompts/prompts-JCT.md`
> - Any `data-testid` additions to source components
>
> Summary should explain: what was tested, BDD approach used, and how to run.
