---
description: Phase 0 — idempotent environment setup for the QA pipeline (Playwright MCP, test agents, playwright-bdd).
allowed-tools: Bash, Read
---

# Phase 0 — Environment setup

Run each block in order. Each block must succeed *or* be a no-op if already installed.

## 1. Playwright MCP

Check first, install only if missing.

```bash
if ! claude mcp list 2>/dev/null | grep -q '^playwright\b'; then
  claude mcp add playwright npx @playwright/mcp@latest
fi
```

## 2. Playwright test agents (planner / generator / healer)

These produce `agents/` files for the configured loop. Re-running is harmless.

```bash
npx --yes playwright init-agents --loop=claude
```

## 3. playwright-bdd

```bash
npm install --save-dev playwright-bdd @playwright/test
```

Verify the install:

```bash
npx playwright --version
node -e "require('playwright-bdd')" && echo "playwright-bdd OK"
```

## 4. Docker database

```bash
docker compose up -d
```

Stop here if any of the four steps failed. Do not proceed to Phase 1.
