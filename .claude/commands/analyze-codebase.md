---
description: Phases 1 + 2 — generate `AGENTS.md` (single source of truth for the agents) and `CLAUDE.md` (one-line pointer).
allowed-tools: Read, Grep, Glob, Bash, Write
---

# Phase 1 — `AGENTS.md`

Load the skill `codebase-analysis` and follow its method. Output goes to `./AGENTS.md` at the repo root.

# Phase 2 — `CLAUDE.md`

Write exactly the following content into `./CLAUDE.md` (no frontmatter, no extra lines):

```
AGENTS.md
```

This file serves as Claude Code's pointer to the canonical agents document. Other IDEs read `AGENTS.md` directly or through their own symlinks under `.cursor/`, `.github/`, `.windsurfrules`, `.antigravity/`.

# Verification

```bash
test -s AGENTS.md && test "$(cat CLAUDE.md)" = "AGENTS.md" && echo OK
```
