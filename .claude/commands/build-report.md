---
description: Phase 6 — digest the Playwright HTML report into `docs/test_report.md`.
allowed-tools: Bash, Read, Write
argument-hint: "(no arguments)"
---

# Phase 6 — Final report

1. Open the HTML report so the user (or this agent) can sanity-check it:
   ```bash
   npx playwright show-report
   ```
   (This blocks; run with `&` or in a separate terminal during interactive sessions.)
2. Read `playwright-report/index.html` (and the JSON sidecar `playwright-report/data/*.json` if present) to extract totals, per-feature breakdown, flakes, durations, artefact paths.
3. Load the `test-reporting` skill and render `docs/test_report.md` using the Phase 6 template.
4. Cross-reference defects from `docs/test_defects.md` and copy the headings + status into the "Defects discovered" section.

# Verification

```bash
test -s docs/test_report.md && grep -q '^# E2E Test Report' docs/test_report.md && echo OK
```
