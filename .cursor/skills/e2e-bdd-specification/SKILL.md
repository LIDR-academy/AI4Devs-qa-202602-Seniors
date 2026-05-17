# e2e-bdd-specification

## Purpose

Define the required structure, vocabulary, and quality rules for BDD specifications stored under `docs/specs/e2e/<scenario-id>.md` for the `position` interface E2E workflow. The skill enforces domain-driven Gherkin, avoids implementation coupling, and keeps every scenario mappable to real interface evidence.

## When to Use This Skill

Use this skill whenever:

- A new scenario must be documented under `docs/specs/e2e/`.
- An existing scenario needs to be updated to reflect inspected behavior.
- A bug or product decision changes acceptance criteria.

## Required Inputs

- Output of `position-interface-analysis`.
- `.cursor/rules/20-project-standards.mdc` (testing and documentation constraints).
- Existing specifications under `docs/specs/e2e/` (for vocabulary consistency).
- Seed data terminology when present.

## Procedure

1. Choose a scenario ID using kebab-case (for example, `position-page-load`, `candidate-phase-change`).
2. Create or update `docs/specs/e2e/<scenario-id>.md` with the following structure:

   ```md
   # <Scenario ID> — <Short title>

   ## Summary
   <One paragraph describing the position interface area under test and its business value.>

   ## Interface Mapping
   - Routes: <e.g., /positions/:id>
   - Components: <e.g., PositionDetails.js, StageColumn.js, CandidateCard.js>
   - API endpoints: <e.g., GET /positions/:id/interviewflow, GET /positions/:id/candidates, PUT /candidates/:id>
   - Real candidate update endpoint: <PUT /candidates/:id with body { applicationId, currentInterviewStep }>

   ## Test Data Needs
   <List the seed data or fixtures needed and their stability.>

   ## Success Criteria
   <List acceptance criteria as observable, domain-driven statements.>

   ## Gherkin

   ```gherkin
   Feature: <Domain-driven feature name>

     Background:
       Given <shared context>

     Scenario: <Domain-driven scenario name>
       Given <preconditions>
       When <single domain event>
       Then <single observable outcome>
       And <additional observable outcomes if needed>
   ```

   ## Out of Scope
   <List explicit non-goals.>

   ## Risks
   <List risks (flakiness, missing seed data, unreliable selectors).>

   ## Assumptions
   <List documented assumptions, including endpoint discrepancies.>

   ## Open Questions
   <List clarifications required before implementation.>
   ```

3. Apply the Gherkin rules:
   - Use `Feature`, `Background`, `Scenario`, `Scenario Outline`, `Examples`, `Given`, `When`, `Then`, `And`, `But`.
   - Use exactly one `When`/`Then` pair per scenario; use `And`/`But` for additional observable outcomes.
   - Use ubiquitous domain language (`candidate`, `position`, `hiring phase`, `interview step`, `application`).
   - Avoid `user`, `item`, `element`, and similar generic terms.
   - Avoid imperative wording such as "When I click ...".
   - Avoid DOM IDs, CSS classes, JSON payload field names, or database columns.
   - Avoid overspecified data; parameterize with `Scenario Outline` + `Examples` when applicable.
   - Avoid phantom scenarios that cannot be mapped to a real interface, route, component, API, or user flow.
4. Cite the real candidate update endpoint observed by `position-interface-analysis`. If prose mentions `PUT /candidate/:id`, document the discrepancy and follow the real implementation.
5. Define out-of-scope checks (for example, unit-level mapping of interview step names to IDs).
6. Surface open questions instead of guessing.

## Quality Checklist

- [ ] File path is `docs/specs/e2e/<scenario-id>.md` with a kebab-case ID.
- [ ] Feature, Scenario, and Background (when used) follow domain language.
- [ ] Each scenario has exactly one `When`/`Then` pair.
- [ ] Every `Scenario Outline` is paired with `Examples`.
- [ ] No DOM IDs, JSON payloads, or database columns appear in steps.
- [ ] No imperative steps appear.
- [ ] Success criteria are observable, domain-driven statements.
- [ ] Interface mapping cites real routes, components, and the real endpoint.
- [ ] Out-of-scope, risks, assumptions, and open questions sections are present.
- [ ] Endpoint discrepancy with `PUT /candidate/:id` is documented if relevant.

## Expected Outputs

- A complete `docs/specs/e2e/<scenario-id>.md` file ready for downstream implementation.
- An updated cross-reference in any related report when the specification changes acceptance criteria.

## Failure Conditions

- A scenario cannot be mapped to a real route, component, or API observed in the codebase.
- A `Scenario Outline` is used without `Examples`.
- A specification contains DOM IDs, CSS classes, payload fields, or database columns.
- A specification contains generic domain terms instead of the LTI domain vocabulary.
- Endpoint discrepancies are not documented even though `position-interface-analysis` flagged them.
