# security-config-review

## Purpose

Block the `position` E2E workflow from committing secrets, tokens, credentials, private URLs, environment-specific configuration, or sensitive payloads through tests, fixtures, reports, bug files, screenshots, or traces.

## When to Use This Skill

Use this skill:

- Before committing any new test, helper, fixture, report, or bug file.
- During the `e2e-quality-gateway` run.
- Whenever a test fails and produces new artifacts (traces, screenshots, network logs).
- Whenever a bug fix introduces or modifies configuration.

## Required Inputs

- All new or modified files under `frontend/tests/e2e/`, `docs/specs/e2e/`, `docs/bugs/`, `docs/reports/`.
- `.cursor/rules/20-project-standards.mdc`.
- `frontend/playwright.config.ts`.
- `.env` files and configuration sources, when present, to confirm what MUST NOT be committed.

## Procedure

1. Scan new or modified files for high-risk patterns:
   - API keys, OAuth tokens, JWT secrets, basic-auth credentials.
   - Database URLs with embedded credentials.
   - Private hostnames or internal IP addresses.
   - Cloud provider account identifiers.
   - Personally identifiable information beyond seed values already in the repository.
2. Confirm only the canonical project URLs are used in tests:
   - Frontend: `http://localhost:3000`.
   - Backend: `http://localhost:3010`.
   - Any other URL MUST be justified and documented.
3. Confirm environment-specific values are not newly hardcoded:
   - Prefer configuration via `playwright.config.ts` `baseURL` or environment variables.
   - When project standards already document a hardcoded URL, do not duplicate it elsewhere.
4. Confirm bug evidence and reports are sanitized:
   - Replace sensitive content with `[REDACTED]` or `[REDACTED: <type>]`.
   - Remove screenshots, traces, or network logs that capture sensitive data without scrubbing.
5. Confirm Playwright assertions do not print sensitive payloads:
   - Avoid logging full request bodies that contain candidate PII beyond seed values.
   - Avoid printing authentication headers.
6. Flag pre-existing security exposure as a separate defect under `docs/bugs/` instead of editing unrelated files.
7. Append a `PASS` or `BLOCKED` verdict for the security gate to the active report.

## Quality Checklist

- [ ] No secrets, tokens, credentials, or OAuth headers were committed.
- [ ] No private URLs or internal IP addresses were committed.
- [ ] No new hardcoded environment-specific values were introduced beyond project defaults.
- [ ] Bug evidence and reports are sanitized.
- [ ] Playwright assertions do not print sensitive payloads.
- [ ] Pre-existing security exposure (if any) was filed as a separate defect.

## Expected Outputs

- A security verdict (`PASS` or `BLOCKED`) appended to `docs/reports/<report-id>.md`.
- A summary of files reviewed and patterns scanned.
- A list of any flagged issues with recommended actions.

## Failure Conditions

- A secret, token, credential, OAuth header, or session cookie was committed.
- A private URL or internal IP address was committed.
- A new hardcoded environment-specific value was introduced without justification.
- Bug evidence or reports contain sensitive data.
- Playwright assertions log sensitive payloads.
- The verdict is appended without observed evidence.
