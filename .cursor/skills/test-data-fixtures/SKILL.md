# test-data-fixtures

## Purpose

Define how the `position` interface E2E workflow chooses, generates, and isolates test data so tests stay deterministic, independent, and free of sensitive information.

## When to Use This Skill

Use this skill when:

- A Playwright test needs a position, candidate, or hiring phase to interact with.
- A factory, fixture, or seed value must be introduced or updated.
- A test currently depends on production data, shared mutable state, or undocumented assumptions.

## Required Inputs

- Existing seed scripts (e.g., `backend/prisma/seed.ts`).
- Existing fixtures under `frontend/tests/e2e/` or `frontend/tests/fixtures/`.
- `.cursor/rules/20-project-standards.mdc` (testing standards).
- Output of `position-interface-analysis`.

## Procedure

1. Prefer existing seed data first:
   - Identify deterministic position IDs and candidate IDs available in `backend/prisma/seed.ts` or equivalent.
   - Document any seed assumption in the consuming test's module header.
2. If seed data is missing or insufficient, introduce a documented fixture under `frontend/tests/e2e/fixtures/`:
   - Export typed factories or builder functions.
   - Add JSDoc/TSDoc on every export so CodeRabbit Docstring Coverage passes.
3. Use factories when small variations of the same shape are needed:
   - Use TypeScript generics or plain functions that return deterministic objects.
   - Inject seeds for repeatable variation.
4. Use `@faker-js/faker` only when:
   - The dependency is added to `frontend/package.json` with team agreement.
   - Determinism is preserved by calling `faker.seed(<integer>)` at the start of the test or fixture.
   - The fake data does not collide with seed data or production data.
5. Keep tests independent:
   - Avoid mutating shared seed state between tests; if mutation is required (for example, moving a candidate), pick a candidate dedicated to the test or restore state at the end.
   - Avoid order dependency; assume Playwright workers run tests in parallel.
6. Avoid production data:
   - Never copy production records into fixtures.
   - Never embed customer names, emails, phone numbers, or other PII beyond seed values already in the repository.
7. Avoid sensitive data exposure:
   - Do not store tokens, credentials, secrets, or private URLs in fixtures.
   - Scrub generated faker values that could resemble real customer identifiers when reports or screenshots are produced.

## Quality Checklist

- [ ] Existing seed data was inspected before creating new fixtures.
- [ ] New fixtures live under `frontend/tests/e2e/fixtures/` (or a path agreed in the project standards).
- [ ] Every exported fixture or factory has a JSDoc/TSDoc comment.
- [ ] `@faker-js/faker` (if used) is seeded for determinism and documented.
- [ ] Tests do not share mutable state without explicit cleanup.
- [ ] No production data, secrets, or sensitive identifiers appear in fixtures.

## Expected Outputs

- A documented set of fixtures/factories backing the `position` interface tests.
- A short data-source note in the consuming test's module header.
- Updates to `docs/reports/<report-id>.md` when new fixtures change the execution baseline.

## Failure Conditions

- A test relies on production data.
- A factory or fixture lacks documentation.
- Faker is introduced without seeding and without documentation.
- Tests fail randomly because of shared mutable state introduced by fixtures.
- Sensitive data appears in fixtures, reports, screenshots, or traces.
