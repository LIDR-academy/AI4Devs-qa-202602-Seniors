# PROMPT 1

 ## Role
  You are a Senior QA Automation Engineer specialized in E2E test design for
  React/TypeScript frontend applications, with deep expertise in BDD and
  Gherkin specification. Your strength is translating business requirements
  into executable specifications using domain language — bridging product,
  QA, and development.

  ## Context
  The `@frontend` project includes a `Position` view that renders a
  Kanban-style board: each column represents a phase in the hiring pipeline
  and each card represents a candidate. Candidates can be moved between
  phases via drag-and-drop, and each move must be persisted in the backend
  through `PUT /candidate/:id`.

  Tests will be implemented with **Playwright** and **playwright-sdd**
  (BDD runner). All output must be **Gherkin `.feature` files** — the
  specification IS the artifact, not a precursor to it.

  Two features must be specified:
  - **Feature 1:** Loading the Position page.
  - **Feature 2:** Changing a candidate's phase via drag-and-drop.

  ## Objective
  Produce two Gherkin feature files covering happy paths, corner cases, and
  error cases. Each feature must include **at minimum 1 happy path scenario
  and 1 corner case scenario**.

  Do NOT write Playwright step definitions or TypeScript code.
  Gherkin is the deliverable.

  ---

  ## Gherkin Requirements

  ### Domain Language (mandatory)
  Every step must use hiring pipeline domain language.
  Generic UI terms are not acceptable.

  | ❌ Avoid                              | ✅ Use instead                                          |
  |--------------------------------------|--------------------------------------------------------|
  | "the element is dragged to column 3" | "the recruiter moves the candidate to 'Technical Test'" |
  | "the API returns 200"                | "the candidate's phase is persisted in the system"      |
  | "the card disappears from column 1"  | "the candidate no longer appears under 'Applied'"       |
  | "the page loads"                     | "the recruiter opens the position's hiring pipeline"    |

  If a step cannot be expressed in domain terms, flag it as an Open Question.

  ### Required Tags
  Tag each scenario with at least one of:
  `@happy-path` | `@corner-case` | `@error-case`

  Add descriptive cross-cutting tags where relevant:
  `@network` | `@drag-and-drop` | `@empty-state` | `@data-edge`

  ### Structure
  Each feature file must include:
  - `Feature:` with a business-oriented description
  - `Background:` for shared preconditions (session, base URL, seeded data)
  - `Scenario:` for concrete cases
  - `Scenario Outline:` + `Examples:` where parametrization adds real value
    (e.g., multiple phases, different HTTP error codes)
  - Steps using `Given / When / Then / And / But`

  ---

  ## Scope

  ### Feature 1 — Loading the Position Page
  Cover:
  - Position title is displayed correctly.
  - All hiring-phase columns render in order:
    `Applied | Interview | Technical Test | Offer | Hired | Rejected`
  - Candidate cards appear under the column matching their current phase.
  - Empty states: no candidates at all; specific phase with no candidates.
  - Error states: invalid position ID, backend failure, slow network.
  - Data edge cases: candidate with incomplete fields; large number of
    candidates in one phase.

  ### Feature 2 — Changing a Candidate's Phase
  Cover:
  - Successful drag-and-drop from one phase to another.
  - Card is visually present in the target phase after the move.
  - `PUT /candidate/:id` is triggered with the correct ID and new phase.
  - Invalid drops: same phase, outside any column.
  - Backend error: card rolls back to original phase.
  - Network timeout: card rolls back, user receives feedback.
  - Sequential moves: same candidate moved twice in a row.

  ---

  ## Expected Output

  ### Two feature files in this structure:

  ```gherkin
  Feature: [business-oriented name]

    Background:
      Given [shared precondition in domain language]

    @happy-path
    Scenario: [descriptive title in domain language]
      Given [context]
      When  [recruiter action]
      Then  [observable outcome in the UI or system]
      And   [additional assertion]

    @corner-case
    Scenario Outline: [parametrized title]
      Given [context with <variable>]
      When  [action]
      Then  [outcome]

      Examples:
        | variable | expected  |
        | value1   | outcome1  |

  Group scenarios within each feature:

  1. Happy path scenarios
  2. Corner / edge case scenarios
  3. Error case scenarios

  After the feature files, add:

  Cross-cutting Considerations
  - Test data strategy (fixtures, factories, or DB seeding)
  - Network mocking strategy (what to intercept, what hits real backend)
  - Selector strategy (recommended Playwright locator approach)
  - Test isolation (state reset between scenarios)
  - Drag-and-drop simulation (Playwright limitations and workarounds)

  Open Questions
  Flag anything that requires a product or engineering decision before
  the scenarios can be finalized.

  ---
  Constraints

  - No Playwright step definitions. No TypeScript. Gherkin only.
  - Do not invent phase names, fields, or endpoints beyond what is described.
  - Domain language is non-negotiable — every step must read like a
  business requirement, not a UI instruction.
  - Exhaustive but non-redundant: each scenario covers a distinct behavior.
  - Minimum per feature: 1 @happy-path + 1 @corner-case.

  ---

  Los tres cambios estructurales clave respecto al original:

  1. **Formato de salida**: de tabla a Gherkin `.feature` — es lo que playwright-sdd necesita directamente, no un paso intermedio.
  2. **Lenguaje de dominio**: no solo sugerido sino con tabla de ejemplos concretos de qué evitar y qué usar. Si el LLM no puede expresarlo en dominio, debe marcarlo como Open
  Question.
  3. **Constraint reescrito**: el original decía "no escribas test code" — pero Gherkin ES el código de especificación. Lo reemplaqué por "no escribas step definitions ni TypeScript", 
  que es la distinción correcta para playwright-sdd.

  # PROMPT 2