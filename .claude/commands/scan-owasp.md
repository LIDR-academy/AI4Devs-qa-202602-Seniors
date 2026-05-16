---
description: Phase 3 — delegate to the `owasp-analyst` sub-agent to scan for OWASP Top 10 (2025) issues and produce `docs/vulnerabilities.md` only when findings exist.
allowed-tools: Read, Grep, Glob, Bash, Write
argument-hint: "(no arguments)"
---

# Phase 3 — OWASP 2025 scan

1. Delegate to the sub-agent `owasp-analyst` (loads the skill `owasp-top10-2025`).
2. The sub-agent iterates the ten 2025 categories in order, using the heuristics defined in the skill.
3. **Write `docs/vulnerabilities.md` if and only if ≥1 finding is verified with `file:line` evidence.** Otherwise print a short "No findings" summary and do not create the file.

# Verification

```bash
if [ -f docs/vulnerabilities.md ]; then
  grep -E '^### A[0-9]{2} —' docs/vulnerabilities.md | wc -l
fi
```
