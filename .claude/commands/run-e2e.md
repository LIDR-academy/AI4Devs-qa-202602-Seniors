---
description: Phase 5 — execute the BDD Playwright suite, run the healer agent on flakes, and log results + defects.
allowed-tools: Bash, Read, Write, Edit
argument-hint: "(no arguments)"
---

# Phase 5 — Execute & log

1. Ensure the backend (port 3010) and frontend (port 3000) are reachable. If not, the `webServer` block in `playwright.config.ts` will start them.
2. Run:
   ```bash
   npx bddgen && npx playwright test --project=bdd-chromium
   ```
3. On any failure that is not obviously a real defect, run the **healer** agent **once**:
   ```bash
   npx playwright run-agent healer
   ```
   Then re-run the failing scenarios only. Persistent failures become defects.
4. Load the `test-reporting` skill. Append a new run block to `docs/test_results.md` and one `DEF-NN` entry per real defect to `docs/test_defects.md`.
5. Per `master_prompt.md` §5, **re-run** the suite after each defect is fixed to confirm closure and check for regressions. Mark the defect entry's status accordingly.

# Verification

```bash
test -s docs/test_results.md && echo OK
```
