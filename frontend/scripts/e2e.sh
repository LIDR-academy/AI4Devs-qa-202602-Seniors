#!/usr/bin/env bash
# E2E test bootstrap and teardown script.
# Starts all required services, seeds the DB, runs BDD tests, and tears down.
#
# Usage (from frontend/):  npm run test:e2e
# Usage (directly):        bash scripts/e2e.sh
#
# Requires:
#   - Docker + Docker Compose (for PostgreSQL)
#   - Node.js ≥ 18 (for backend and frontend)
#   - pg_isready CLI tool (ships with PostgreSQL client tools)
#
# # Manual steps required
#   None — all services are managed by this script.
#   If pg_isready is not available, install postgresql-client:
#     macOS:  brew install libpq && brew link --force libpq
#     Ubuntu: apt-get install -y postgresql-client

set -euo pipefail

# ── Paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT_DIR="$(cd "$FRONTEND_DIR/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

# ── Load environment variables ─────────────────────────────────────────────────
# shellcheck disable=SC1091
[ -f "$ROOT_DIR/.env" ]     && set -o allexport && source "$ROOT_DIR/.env"     && set +o allexport
[ -f "$BACKEND_DIR/.env" ]  && set -o allexport && source "$BACKEND_DIR/.env"  && set +o allexport

# Construct DATABASE_URL from individual vars (the .env file uses literal ${} syntax)
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT:-5432}/${DB_NAME}"

# ── PID tracking ───────────────────────────────────────────────────────────────
BACKEND_PID=""
FRONTEND_PID=""

# ── Cleanup (always runs on EXIT via trap) ─────────────────────────────────────
cleanup() {
  local exit_code=$?
  echo ""
  echo "=== Teardown ==="
  if [[ -n "$BACKEND_PID" ]]; then
    kill -TERM -"${BACKEND_PID}" 2>/dev/null || true
    kill -KILL -"${BACKEND_PID}" 2>/dev/null || true
    echo "Backend stopped (PID $BACKEND_PID)."
  fi
  if [[ -n "$FRONTEND_PID" ]]; then
    kill -TERM -"${FRONTEND_PID}" 2>/dev/null || true
    kill -KILL -"${FRONTEND_PID}" 2>/dev/null || true
    echo "Frontend stopped (PID $FRONTEND_PID)."
  fi
  cd "$BACKEND_DIR" && npx tsx scripts/teardown-e2e.ts 2>/dev/null || true
  cd "$ROOT_DIR"
  docker compose down 2>/dev/null && echo "Docker Compose services stopped." || true
  echo "=== Teardown complete (exit $exit_code) ==="
  exit "$exit_code"
}
trap cleanup EXIT

# ── Wait for PostgreSQL to accept connections ──────────────────────────────────
wait_for_postgres() {
  local max_seconds=60 elapsed=0
  echo "Waiting for PostgreSQL on port ${DB_PORT:-5432}..."
  while ! pg_isready -h localhost -p "${DB_PORT:-5432}" -U "${DB_USER}" -q 2>/dev/null; do
    if [[ $elapsed -ge $max_seconds ]]; then
      echo "ERROR: PostgreSQL did not become ready within ${max_seconds}s" >&2
      exit 1
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done
  echo "PostgreSQL is ready."
}

# ── Wait for an HTTP service to respond ───────────────────────────────────────
wait_for_http() {
  local url="$1" name="$2" max_seconds="${3:-90}" elapsed=0
  echo "Waiting for $name ($url)..."
  while ! curl -sf -o /dev/null "$url" 2>/dev/null; do
    if [[ $elapsed -ge $max_seconds ]]; then
      echo "ERROR: $name did not become reachable within ${max_seconds}s" >&2
      exit 1
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done
  echo "$name is ready."
}

# ══════════════════════════════════════════════════════════════════════════════
# 1. Start database
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "=== [1/5] Starting database ==="
cd "$ROOT_DIR"
docker compose up -d db
wait_for_postgres

# ══════════════════════════════════════════════════════════════════════════════
# 2. Migrate + seed database
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "=== [2/5] Running database migrations ==="
cd "$BACKEND_DIR"
./node_modules/.bin/prisma migrate deploy

echo ""
echo "=== Seeding database ==="
cd "$BACKEND_DIR" && npx tsx scripts/seed-e2e.ts

# ══════════════════════════════════════════════════════════════════════════════
# 3. Start backend
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "=== [3/5] Starting backend ==="
cd "$BACKEND_DIR"
setsid ./node_modules/.bin/ts-node-dev --respawn --transpile-only src/index.ts \
  > /tmp/lti-backend-e2e.log 2>&1 &
BACKEND_PID=$!
echo "Backend started (PID $BACKEND_PID). Logs: /tmp/lti-backend-e2e.log"
wait_for_http "http://localhost:3010/positions" "Backend" 60

# ══════════════════════════════════════════════════════════════════════════════
# 4. Start frontend
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "=== [4/5] Starting frontend ==="
cd "$FRONTEND_DIR"
setsid env BROWSER=none ./node_modules/.bin/react-scripts start \
  > /tmp/lti-frontend-e2e.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started (PID $FRONTEND_PID). Logs: /tmp/lti-frontend-e2e.log"
wait_for_http "http://localhost:3000" "Frontend" 120

# ══════════════════════════════════════════════════════════════════════════════
# 5. Run E2E tests
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "=== [5/5] Running E2E tests ==="
cd "$FRONTEND_DIR"
PLAYWRIGHT_HTML_OPEN=never ./node_modules/.bin/bddgen \
  && PLAYWRIGHT_HTML_OPEN=never ./node_modules/.bin/playwright test --reporter=html

# Exit code propagated via trap cleanup() → exit "$exit_code"
