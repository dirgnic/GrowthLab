#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

API_HOST="${API_HOST:-127.0.0.1}"
API_PORT="${API_PORT:-8000}"
WEB_PORT="${WEB_PORT:-3000}"

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

cd "$ROOT_DIR"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 not found. Install Python 3 first." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found. Install Node.js/npm first." >&2
  exit 1
fi

if ! python3 -c "import flask, flask_cors" >/dev/null 2>&1; then
  echo "Backend deps missing. Run: cd backend && python3 -m pip install -r requirements.txt" >&2
  exit 1
fi

if [[ ! -d frontend/node_modules ]]; then
  echo "Frontend deps missing. Run: cd frontend && npm install" >&2
  exit 1
fi

echo "Starting backend on http://${API_HOST}:${API_PORT} ..."
(cd backend && FLASK_ENV=development python3 app.py) &
BACKEND_PID="$!"

export REACT_APP_API_BASE_URL="http://${API_HOST}:${API_PORT}"
export PORT="${WEB_PORT}"
export HOST="127.0.0.1"
export BROWSER="none"

echo "Starting frontend on http://localhost:${WEB_PORT} ..."
npm --prefix frontend start
