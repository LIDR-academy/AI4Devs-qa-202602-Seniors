# Test Independence & Data

Rules for test isolation, data management, and fixtures.

## Isolation Rules

1. **Independence**: Each test must run independently in any order. No shared mutable state between tests.
2. **Own setup/teardown**: Tests create their own data (fixtures, factories, API seeding) and clean up after.
3. **No hardcoded fragile data**: Use `@faker-js/faker` or controlled fixtures. Production-like but deterministic.

## Test Data Strategy

### Fixtures with Faker

```typescript
// fixtures/candidates.ts
import { faker } from '@faker-js/faker';

export function createCandidate(overrides = {}) {
  return {
    fullName: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    currentInterviewStep: 'Applied',
    averageScore: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
    ...overrides,
  };
}
```

### Database Seeding

- Use Prisma seed scripts for consistent initial state
- Each test suite can seed its own data via API calls in `beforeAll`
- Clean up via API or DB reset in `afterAll`

### Principles

| Principle | Implementation |
|-----------|---------------|
| Deterministic | Use seeded faker (`faker.seed(123)`) for reproducibility |
| Realistic | Data resembles production (valid emails, real-looking names) |
| Isolated | Each test creates what it needs, doesn't depend on other tests' data |
| Minimal | Only seed what the specific test requires |

## Anti-Patterns

- Sharing database state between test files
- Relying on test execution order
- Using production data in tests
- Hardcoding IDs that may change
- Single shared "test user" across all tests
