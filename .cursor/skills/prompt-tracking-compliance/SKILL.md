# prompt-tracking-compliance

## Purpose

Guarantee every agent honors the repository's prompt tracking rule defined in `.cursor/rules/10-prompt-tracking.mdc` and appends each answered user prompt to the canonical log at `prompts/prompts-ICS.md`.

## When to Use This Skill

Use this skill on every user-visible reply produced by any `position` E2E workflow agent or orchestrator, before completing the turn.

## Required Inputs

- `.cursor/rules/10-prompt-tracking.mdc`
- `prompts/prompts-ICS.md` (canonical log)
- Current user prompt content (for redaction and logging).
- Current UTC timestamp.

## Procedure

1. Read `.cursor/rules/10-prompt-tracking.mdc` and adopt its append-only, monotonic-timestamp algorithm.
2. Confirm the canonical log path is `prompts/prompts-ICS.md`. Do NOT invent a new path.
3. If the file does not exist, initialize it with `# Prompts log` followed by a blank line.
4. Read the file, extract all existing `## Prompt - <timestamp>` headings, and compute the next monotonic UTC ISO 8601 timestamp (`YYYY-MM-DDTHH:mm:ssZ`).
5. Derive `### Agent:` from the explicit agent or skill invocation in the user prompt or session. Use the agent name (for example, `e2e-orchestrator`) when one is clearly invoked.
6. Derive `#### Model:` from the active model identifier reported by Cursor; map to the display label table defined in the prompt tracking rule.
7. Apply the redaction policy: replace secrets, tokens, credentials, OAuth secrets, session cookies, database URLs, private customer data, and similar sensitive content with `[REDACTED]` or `[REDACTED: <type>]`.
8. Append exactly one new block at the end of `prompts/prompts-ICS.md`. If prior prompt content exists after the header, insert a single `---` separator line immediately before the new block.
9. Verify after writing that the new block is the last `## Prompt` block and its timestamp is strictly greater than every existing valid prompt timestamp.
10. If the write fails, retry once with the same canonical path; if it fails again, surface the failure to the user with the exact path attempted.

## Quality Checklist

- [ ] `prompts/prompts-ICS.md` exists or was initialized.
- [ ] New entry uses `## Prompt - YYYY-MM-DDTHH:mm:ssZ` with a strictly monotonic UTC timestamp.
- [ ] `### Agent:` matches the explicit agent or skill invocation.
- [ ] `#### Model:` matches the model derivation table.
- [ ] Secrets and sensitive data were redacted before writing.
- [ ] No prior prompt entries were modified, reordered, or removed.
- [ ] No duplicate `# Prompts log` header was introduced.
- [ ] Only one entry was appended for the current user message.

## Expected Outputs

- A successful append to `prompts/prompts-ICS.md` containing the current user prompt under the correct heading.
- A short confirmation in the user-visible reply, when relevant.

## Failure Conditions

- File tools are available but the log was not written.
- The new timestamp is not strictly greater than every existing valid timestamp.
- Sensitive data was written without redaction.
- A different prompt log path was used instead of the canonical one.
- The agent silently skipped logging when file tools were available.
