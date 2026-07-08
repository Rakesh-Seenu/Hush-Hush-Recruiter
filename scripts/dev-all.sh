#!/usr/bin/env bash
# Start all three dev servers (backend + both frontends) in one Codespace terminal.
# - FastAPI backend on :8000 (working dir = backend/, so `app.main` resolves)
# - Vite admin     on :5173
# - Vite candidate on :5174
#
# The frontends talk to the backend SAME-ORIGIN via each Vite dev server's
# `/api` proxy (see apps/*/vite.config.ts), so the browser never has to reach
# localhost:8000 directly. That is the fix for the Codespaces "localhost from a
# forwarded origin is unreachable" problem.
set -euo pipefail
cd "$(dirname "$0")/.."

# Kill every child process on Ctrl-C / exit so no server is left orphaned.
pids=()
cleanup() { for p in "${pids[@]:-}"; do kill "$p" 2>/dev/null || true; done; }
trap cleanup EXIT INT TERM

echo ">> starting backend (uvicorn) on :8000"
( cd backend && exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 ) &
pids+=("$!")

echo ">> starting both frontends (admin :5173, candidate :5174)"
npm run dev &
pids+=("$!")

wait
