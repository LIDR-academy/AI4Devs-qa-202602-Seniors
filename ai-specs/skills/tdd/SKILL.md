---
name: tdd
description: Test-driven development with red-green-refactor loop. Use when user wants to build features or fix bugs using TDD, mentions "red-green-refactor", wants integration tests, or asks for test-first development.
trigger: /tdd
author: AI4Devs
version: 1.0.0
---

# TDD (Test-Driven Development)

## When to Use

- Building new features or fixing bugs
- User says "TDD", "test-first", "red-green-refactor"
- Writing unit tests, integration tests, or E2E tests
- Implementing new service, controller, or domain logic
- Fixing a bug and want to write a regression test first

## TDD Workflow

```
RED          GREEN         REFACTOR
 │              │              │
 ▼              ▼              ▼
Write failing  Write minimal  Improve code
test first     code to pass   keep tests green
```

### Step 1: RED - Write Failing Test

**Before writing any implementation code:**

1. Identify the behavior you want
2. Write a test that describes it
3. Run `pnpm test` → should FAIL (expected)

```typescript
// backend/src/application/services/candidateService.test.ts

describe('CandidateService', () => {
  describe('validateCandidateData', () => {
    it('should throw ValidationError when email is missing', async () => {
      const invalidData = {
        name: 'John Doe',
        // email missing
        positionId: 'pos_123'
      };

      await expect(validateCandidateData(invalidData))
        .rejects.toThrow('Email is required');
    });
  });
});
```

### Step 2: GREEN - Write Minimal Code

**Implement ONLY what's needed to pass:**

```typescript
// backend/src/application/services/candidateService.ts

export async function validateCandidateData(data: CandidateInput) {
  if (!data.email) {
    throw new ValidationError('Email is required');
  }
  // ... rest of validation
}
```

Run `pnpm test` → should PASS

### Step 3: REFACTOR - Improve Code

**Clean up while keeping tests green:**

1. Extract duplicated logic
2. Rename for clarity
3. Simplify complex conditions
4. Run `pnpm tsc --noEmit && pnpm lint` to ensure types and style are clean

## Project TDD Conventions

### Backend (Jest + ts-jest)

```typescript
// File structure
backend/src/
├── application/services/
│   ├── candidateService.test.ts   // Tests live next to implementation
│   └── candidateService.ts
├── presentation/controllers/
│   ├── candidateController.test.ts
│   └── candidateController.ts
└── domain/validators/
    ├── validator.test.ts
    └── validator.ts
```

### Test Structure Pattern

```typescript
describe('FeatureName', () => {
  describe('happy path', () => {
    it('should do expected thing', async () => {
      // GIVEN - setup
      const input = createValidInput();

      // WHEN - action
      const result = await targetFunction(input);

      // THEN - assertion
      expect(result).toEqual(expectedOutput);
    });
  });

  describe('error path', () => {
    it('should throw when input is invalid', async () => {
      // GIVEN
      const invalidInput = createInvalidInput();

      // WHEN + THEN
      await expect(targetFunction(invalidInput))
        .rejects.toThrow(ExpectedError);
    });
  });

  describe('edge case', () => {
    it('should handle empty array', async () => {
      // ...
    });
  });
});
```

### Frontend (Jest + React Testing Library)

```typescript
// File structure
frontend/src/components/
├── CandidateForm/
│   ├── CandidateForm.test.tsx
│   └── CandidateForm.tsx
```

## Quality Gates for TDD

Every TDD cycle MUST pass these gates:

```bash
# 1. Type check
pnpm tsc --noEmit

# 2. Lint
pnpm lint

# 3. Tests pass
pnpm test

# 4. Coverage meets threshold
# Critical: 90%+ | Business logic: 80%+ | API: 70+
```

## Test Naming Convention

```
describe: "FeatureName" or "{Module}"
it: "should {expected behavior}" or "should throw {Error} when {condition}"

Examples:
- "should return candidate by id"
- "should throw NotFoundError when candidate does not exist"
- "should validate email format"
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test -- --coverage

# Run specific file
pnpm test -- candidateService.test.ts

# Run in watch mode (development)
pnpm test -- --watch

# Run with verbose output
pnpm test -- --verbose
```

## Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Writing tests after code | Tests become validation, not design | Write test first |
| Testing implementation details | Brittle tests | Test behavior, not internals |
| Large test files (>200 lines) | Hard to maintain | Split by feature/method |
| Shared mutable state | Flaky tests | Use `beforeEach` to reset |
| Multiple assertions per test | Unclear failure | One assertion per test |
| No edge cases | Coverage gaps | Add boundary condition tests |
| Skipping failing tests | Debt accumulates | Fix immediately or mark @wip |

## TDD Cycle Examples

### Example 1: New Service Method

```typescript
// 1. RED - Write failing test
describe('getCandidatesByPosition', () => {
  it('should return candidates for given position', async () => {
    const positionId = 'pos_123';
    const candidates = await getCandidatesByPosition(positionId);
    expect(candidates).toHaveLength(2);
    expect(candidates[0]).toMatchObject({ positionId });
  });
});

// 2. GREEN - Implement minimal code
export async function getCandidatesByPosition(positionId: string) {
  return prisma.candidate.findMany({ where: { positionId } });
}

// 3. REFACTOR - Add validation, error handling
export async function getCandidatesByPosition(positionId: string) {
  if (!positionId) throw new ValidationError('positionId required');

  const position = await prisma.position.findUnique({ where: { id: positionId } });
  if (!position) throw new NotFoundError('Position not found');

  return prisma.candidate.findMany({ where: { positionId } });
}
```

### Example 2: Bug Fix

```typescript
// 1. RED - Write failing test that reproduces bug
describe('updateCandidateStage', () => {
  it('should NOT allow transition to earlier stage', async () => {
    const candidate = await createCandidate({ stage: 'interview' });

    await expect(updateCandidateStage(candidate.id, 'screening'))
      .rejects.toThrow('Cannot move to earlier stage');
  });
});

// 2. GREEN - Fix the bug
export async function updateCandidateStage(id: string, newStage: Stage) {
  const candidate = await findCandidateById(id);
  if (STAGE_ORDER.indexOf(newStage) < STAGE_ORDER.indexOf(candidate.stage)) {
    throw new ValidationError('Cannot move to earlier stage');
  }
  // ...
}

// 3. REFACTOR - Ensure edge cases covered
```

## Integration with Other Skills

- **harness-engineering**: TDD is enforced as quality gate
- **bdd-e2e**: E2E tests come after TDD unit tests pass
- **linear**: Create ticket before starting TDD cycle

## References

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest](https://vitest.dev/) - Vite-native test runner (for frontend)