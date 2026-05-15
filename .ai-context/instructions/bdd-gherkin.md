# BDD & Gherkin

Rules and patterns for writing Behavior-Driven Development specifications in Gherkin format.

## Rules

1. **One business event per scenario**: Each scenario has exactly ONE `When` step describing a domain action — never UI mechanics.
2. **Domain language, not UI language**: Write `When the recruiter filters candidates by phase` — NOT `When I click the dropdown and select "Interview"`.
3. **Ubiquitous language**: Use project domain terms consistently. Never let the LLM substitute generic synonyms.
4. **Scenario Outline for variations**: When cases share structure but differ in data, use `Scenario Outline` + `Examples` table.
5. **Background for shared preconditions**: Common `Given` steps go in `Background`, not repeated per scenario.

## Structure

```gherkin
Feature: <business capability>

  Background:
    Given <shared preconditions>

  Scenario: <specific business case>
    Given <initial state>
    When <single business event>
    Then <observable outcome>

  Scenario Outline: <parameterized case>
    When the user enters "<input>"
    Then they should see "<result>"

    Examples:
      | input       | result        |
      | valid_data  | success       |
      | empty       | error message |
```

## Coverage Checklist

| Case | Description |
|------|-------------|
| Happy path | Normal successful flow |
| Empty state | No data, empty lists |
| Invalid input | Wrong data, missing fields |
| Boundary | Edge values, max lengths |
| Error handling | Network errors, timeouts |
| Authorization | Wrong role, unauthenticated |

## Prompting Pattern for Feature Generation

```
"As [role] in the project, I have this user story:
'[user story text]'

Generate BDD scenarios in Gherkin covering:
(1) happy path, (2) empty/no-data case, (3) invalid input, (4) edge case combinations.

Rules:
- One When per scenario, domain language (not UI)
- Avoid 'click', IDs, or technical terms
- Use Scenario Outline when cases share structure
- Use project domain vocabulary"
```

## Anti-Patterns (NEVER do)

| Anti-Pattern | Example | Fix |
|-------------|---------|-----|
| Imperative UI steps | `When I click the submit button` | `When the recruiter submits the application` |
| Technical references | `Then the JSON response contains "id"` | `Then the candidate appears in the list` |
| Multiple When/Then | `When X and When Y Then Z and Then W` | Split into separate scenarios |
| Missing Examples | 5 identical scenarios with different data | Use Scenario Outline + Examples |
| Inconsistent language | "user"/"person"/"candidate" interchangeably | Pick one domain term, use consistently |
| Phantom scenarios | AI-invented preconditions | Validate every Given against real business rules |
| Lost ubiquitous language | "item" instead of "vacante" | Enforce domain glossary |
