---
description: "Use when writing git commit messages, suggesting commits, summarizing changes for a commit, or reviewing commit history. Enforces Conventional Commits specification."
---

# Conventional Commits

All commit messages must follow the [Conventional Commits 1.0.0](https://www.conventionalcommits.org/) specification.

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types

| Type       | When to use                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | A new feature                                           |
| `fix`      | A bug fix                                               |
| `docs`     | Documentation only changes                              |
| `style`    | Formatting, missing semi-colons, etc. (no logic change) |
| `refactor` | Code change that is neither a fix nor a feature         |
| `test`     | Adding or correcting tests                              |
| `chore`    | Build process, dependency updates, tooling              |
| `perf`     | Performance improvement                                 |
| `ci`       | CI/CD configuration changes                             |
| `revert`   | Reverting a previous commit                             |

## Rules

- **Description**: lowercase, imperative mood ("add feature" not "added feature"), no trailing period, max 72 chars on first line
- **Scope**: optional, lowercase, in parentheses — use the affected module/area (e.g., `feat(auth):`, `fix(api):`)
- **Breaking changes**: append `!` after type/scope (`feat!:`) AND add `BREAKING CHANGE: <description>` in the footer
- **Body**: separate from subject with a blank line; explain _what_ and _why_, not _how_
- **Footer**: reference issues as `Closes #123`, `Fixes #456`

## Examples

```
feat(candidate): add resume upload endpoint

fix(auth): handle expired JWT tokens correctly

docs: update API spec with new position endpoints

feat!: remove legacy v1 candidate API

BREAKING CHANGE: v1 endpoints have been removed. Use v2 equivalents.

test(positionService): add unit tests for pagination logic

chore(deps): upgrade prisma to 5.x
```

## Anti-patterns to avoid

- `fix: fixed stuff` — vague, past tense
- `Update files` — missing type, vague description
- `feat: Add New Feature` — sentence case in description
- Combining unrelated changes in one commit
