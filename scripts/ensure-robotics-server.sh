#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/igrois/.openclaw/workspace/robotics-for-kids"
PORT="3006"
PID_FILE="$APP_DIR/data/server-3006.pid"
LOG_FILE="$APP_DIR/data/server-3006.log"
WATCHDOG_LOG="$APP_DIR/data/server-watchdog.log"
LOCK_FILE="$APP_DIR/data/server-watchdog.lock"

mkdir -p "$APP_DIR/data"

exec 9>"$LOCK_FILE"
flock -n 9 || exit 0

log() {
  printf '[%s] %s\n' "$(date -Is)" "$*" >> "$WATCHDOG_LOG"
}

listener_pid=""
listener_name=""
if command -v ss >/dev/null 2>&1; then
  line="$(ss -ltnp "( sport = :$PORT )" 2>/dev/null | awk 'NR==2 {print}')"
  if [[ -n "${line:-}" && "$line" =~ pid=([0-9]+) ]]; then
    listener_pid="${BASH_REMATCH[1]}"
    if [[ "$line" =~ users:\(\(\"([^\"]+)\" ]]; then
      listener_name="${BASH_REMATCH[1]}"
    fi
  fi
fi

is_correct_node="false"
if [[ -n "$listener_pid" && -r "/proc/$listener_pid/cmdline" ]]; then
  cmdline="$(tr '\0' ' ' < "/proc/$listener_pid/cmdline" || true)"
  cwd="$(readlink -f "/proc/$listener_pid/cwd" 2>/dev/null || true)"
  if [[ "$listener_name" == "node" && "$cmdline" == *"server.js"* && "$cwd" == "$APP_DIR" ]]; then
    is_correct_node="true"
  fi
fi

if [[ "$is_correct_node" == "true" ]]; then
  echo "$listener_pid" > "$PID_FILE"
  exit 0
fi

if [[ -n "$listener_pid" ]]; then
  log "Port $PORT is held by ${listener_name:-unknown} pid=$listener_pid; replacing with Node server"
  kill "$listener_pid" 2>/dev/null || true
  sleep 1
  if kill -0 "$listener_pid" 2>/dev/null; then
    kill -9 "$listener_pid" 2>/dev/null || true
    sleep 1
  fi
else
  log "Port $PORT has no listener; starting Node server"
fi

cd "$APP_DIR"
PORT="$PORT" nohup node server.js >> "$LOG_FILE" 2>&1 &
new_pid="$!"
echo "$new_pid" > "$PID_FILE"
sleep 1

if kill -0 "$new_pid" 2>/dev/null; then
  log "Started Node server pid=$new_pid on port $PORT"
else
  log "Failed to start Node server on port $PORT"
  exit 1
fi
