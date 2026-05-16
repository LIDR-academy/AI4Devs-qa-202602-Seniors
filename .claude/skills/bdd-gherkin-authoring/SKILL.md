---
name: bdd-gherkin-authoring
description: Rules and templates for writing high-quality Gherkin (`.feature`) files for this project's BDD suite. Loaded by `playwright-bdd-tester` during Phase 4. Optimised against the seven common AI-generated Gherkin anti-patterns.
---

# Ubiquitous language (locked)

| Concept in this domain | Term in Gherkin |
|---|---|
| Vacancy / job posting | **position** |
| Person applying | **candidate** |
| Hiring funnel column | **interview stage** |
| Movement between columns | **moves to <stage>** |
| Backend persistence event | not mentioned in steps |

Do not introduce synonyms. Same business action → same wording, across every feature.

# Authoring rules

1. **One `When` per scenario.** A scenario describes a single business event. Setup is `Given`; outcome is `Then`/`And`.
2. **Business verbs only.** Replace "click", "drag", "type", "submit" with the business action they realise: `When the recruiter moves the candidate "Ada Lovelace" to "Technical interview"`.
3. **No technical leakage.** No DOM ids, no JSON, no SQL, no HTTP verbs in `Given/When/Then` text. (The step *implementation* may assert on the network — but the Gherkin sentence stays in the domain.)
4. **Scenario Outline when parameterised.** If two scenarios differ only by data, collapse them into an `Outline` with `Examples`.
5. **No ghost preconditions.** Every `Given` must be justifiable by code or product requirement. If you cannot point to one, delete the line.
6. **Consistent phrasing.** Reuse step phrasings across files. If "the recruiter opens the position board" exists, do not also write "the recruiter views the positions page".
7. **Tags for selection.** `@happy`, `@sad`, `@edge`, `@smoke` — apply consistently.

# Template

```gherkin
# language: en
Feature: <business capability>
  As a <role>
  I want <capability>
  So that <value>

  Background:
    Given <state that is constant for every scenario in this feature>

  @happy @smoke
  Scenario: <single business event, present tense>
    Given <preconditions>
    When <single business event>
    Then <observable outcome>
    And <secondary outcome>

  @sad
  Scenario: <unhappy variant of the same event>
    …

  @edge
  Scenario Outline: <parameterised case>
    Given <preconditions>
    When <event with <param>>
    Then <outcome>

    Examples:
      | param | … |
      | …     | … |
```

# Anti-patterns checklist (reject if any are true)

- [ ] Steps mention "click", "drag", "drop", "select dropdown".
- [ ] Steps reference `data-testid`, JSON payloads, or table names.
- [ ] Two or more `When` lines in a single scenario.
- [ ] Two scenarios identical except for data, with no `Outline`.
- [ ] Same business action phrased differently in two features.
- [ ] A `Given` that is not supported by code or product requirement.
- [ ] Domain term replaced by a generic synonym ("user" instead of "candidate").
