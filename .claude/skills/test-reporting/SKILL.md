---
name: test-reporting
description: Templates for `docs/test_results.md`, `docs/test_defects.md`, and `docs/test_report.md`. Loaded during Phases 5 and 6 to keep the three documents consistent.
---

# `docs/test_results.md` — execution log (Phase 5)

Append one block per run. The latest run is at the top.

```markdown
## Run <ISO date> — commit <short sha>

| Feature | Scenario | Tag | Browser | Status | Duration |
|---|---|---|---|---|---|
| positions.feature | Position board loads correctly | @happy @smoke | chromium | ✅ pass | 1.2s |
| positions.feature | A candidate is moved to a new stage | @happy | chromium | ✅ pass | 2.4s |
| positions.feature | Backend fails to persist the stage change | @sad | chromium | ❌ fail | 2.0s |
| …

**Totals:** N pass / M fail / K skipped over X seconds.

Notes:
- Healer agent applied to: <list of scenarios or "none">.
- Re-runs triggered by defect fixes: <list of defect ids>.
```

# `docs/test_defects.md` — defect register (Phase 5)

```markdown
## DEF-<NN> — <short title>

- **Status:** open / fixed / wontfix
- **Discovered:** <ISO date>
- **Severity:** blocker / major / minor
- **Feature / scenario:** `positions.feature` → "<scenario>"
- **Reproduction:**
  1. …
  2. …
- **Expected:** <business expectation>
- **Actual:** <observed>
- **Evidence:** `playwright-report/data/<trace>.zip`, screenshot `playwright-report/<path>.png`
- **Suspected owner:** frontend / backend / infra
- **Linked commit fixing it:** <sha>  (filled in once closed)
```

# `docs/test_report.md` — final digest (Phase 6)

Produced from `playwright-report/` after `npx playwright show-report`. Concise, English, Markdown.

```markdown
# E2E Test Report — <ISO date>

## Summary
- Total scenarios: N
- Passing: P
- Failing: F
- Flaky (passed on retry): K
- Total wall-time: <hh:mm:ss>
- Browsers: chromium, firefox, webkit
- Commit: <short sha>

## Per-feature breakdown
| Feature | Scenarios | Pass | Fail | Duration |
|---|---|---|---|---|

## Defects discovered
<copy of DEF-NN headings from `test_defects.md`, with status>

## Artefacts
- HTML report: `playwright-report/index.html`
- Traces: `playwright-report/data/*.zip`
- Screenshots: `playwright-report/data/*.png`

## Conclusion
<two or three sentences: was the Position screen fit for purpose, what was learnt>
```

# Cross-document rules

- All dates ISO-8601 (`YYYY-MM-DD`).
- Defect ids `DEF-01`, `DEF-02`, …  — never reused.
- Status symbols: ✅ pass, ❌ fail, ⏭ skipped, ⚠ flaky.
- No screenshots inlined in `.md`; link to the file path.
