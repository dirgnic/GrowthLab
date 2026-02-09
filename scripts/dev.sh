#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

API_HOST="${API_HOST:-127.0.0.1}"
API_PORT="${API_PORT:-8000}"
WEB_PORT="${WEB_PORT:-3000}"
BACKEND_LOG="${BACKEND_LOG:-${ROOT_DIR}/backend/.dev-backend.log}"

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

pick_port() {
  python3 - "$API_HOST" "$API_PORT" <<'PY'
import socket, sys
host = sys.argv[1]
start = int(sys.argv[2])
for port in range(start, start + 50):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind((host, port))
        s.close()
        print(port)
        sys.exit(0)
    except OSError:
        try:
            s.close()
        except Exception:
            pass
print("")
sys.exit(1)
PY
}

SELECTED_PORT="$(pick_port)"
if [[ -z "$SELECTED_PORT" ]]; then
  echo "Could not find a free backend port starting at ${API_PORT} on ${API_HOST}." >&2
  exit 1
fi
API_PORT="$SELECTED_PORT"

echo "Starting backend on http://${API_HOST}:${API_PORT} ..."
: >"$BACKEND_LOG"
(cd backend && HOST="$API_HOST" PORT="$API_PORT" python3 -u app.py >>"$BACKEND_LOG" 2>&1) &
BACKEND_PID="$!"

export REACT_APP_API_BASE_URL="http://${API_HOST}:${API_PORT}"
export PORT="${WEB_PORT}"
export HOST="127.0.0.1"
export BROWSER="none"

wait_for_backend() {
  python3 - "$REACT_APP_API_BASE_URL" <<'PY'
import sys, time, urllib.request
base = sys.argv[1].rstrip("/")
url = f"{base}/api/health"
deadline = time.time() + 15
last_err = None
while time.time() < deadline:
    try:
        with urllib.request.urlopen(url, timeout=1.5) as r:
            if 200 <= r.status < 300:
                print("ok")
                sys.exit(0)
    except Exception as e:
        last_err = e
        time.sleep(0.4)
print(f"error: {last_err}")
sys.exit(1)
PY
}

if ! wait_for_backend >/dev/null 2>&1; then
  echo "Backend failed to start (or port is blocked). Log:" >&2
  tail -n 80 "$BACKEND_LOG" >&2 || true
  exit 1
fi

echo "Starting frontend on http://localhost:${WEB_PORT} ..."
npm --prefix frontend start
