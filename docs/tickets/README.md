# Linear Tickets Sync

One-way sync: Linear → `docs/tickets/`

## Overview

This directory contains a local mirror of Linear tickets, synced one-way from Linear.
Each ticket is saved as a markdown file with frontmatter for metadata.

## Sync Mechanism

### Manual Sync
```bash
# Sync all tickets from a Linear team
npx @lucitra/linear-mcp sync tickets --output ./docs/tickets

# Or use the Linear CLI directly
linear ticket sync --output ./docs/tickets
```

### Automated Sync (GitHub Actions example)
```yaml
# .github/workflows/linear-sync.yml
name: Sync Linear Tickets
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Sync Linear Tickets
        run: |
          npx @lucitra/linear-mcp sync tickets --output ./docs/tickets
        env:
          LINEAR_API_KEY: ${{ secrets.LINEAR_API_KEY }}
      - name: Commit changes
        run: |
          git config --local user.email "bot@ai4devs.com"
          git config --local user.name "Linear Sync Bot"
          git add docs/tickets/
          git diff --staged --quiet || git commit -m "chore: sync linear tickets"
          git push
```

## Ticket File Format

Each ticket is saved as `{ticket-id}.md`:
```markdown
---
id: LAB-123
title: "Ticket Title"
status: in_progress
priority: high
assignee: @user
labels:
  - feature
  - backend
created_at: 2026-05-17T10:00:00Z
updated_at: 2026-05-17T12:30:00Z
---

# Ticket Title

## Description

Ticket description here...

## Comments

[Any comments synced from Linear]
```

## Usage by Subagents

The `docs-agent` will:
1. Analyze requirements and create tickets via Linear MCP
2. After creation, tickets are synced to this directory via the same workflow

## Notes

- Do not edit files in this directory manually — changes will be overwritten on next sync
- For local development, run the sync script manually after creating tickets