#!/bin/sh

set -eu

SERVER_PID=""
GATEWAY_PID=""
STOP_REQUESTED=0

is_truthy() {
  case "${1:-}" in
    1|true|TRUE|True|yes|YES|Yes|on|ON|On)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

cleanup() {
  STOP_REQUESTED=1

  if [ -n "$GATEWAY_PID" ]; then
    kill "$GATEWAY_PID" 2>/dev/null || true
    wait "$GATEWAY_PID" 2>/dev/null || true
    GATEWAY_PID=""
  fi

  if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
    SERVER_PID=""
  fi
}

trap cleanup EXIT INT TERM

if is_truthy "${USE_EXTERNAL_OPENCLAW:-false}"; then
  exec node dist/server.js
fi

node dist/server.js &
SERVER_PID=$!

while :; do
  openclaw gateway --allow-unconfigured &
  GATEWAY_PID=$!

  while :; do
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
      wait "$SERVER_PID" 2>/dev/null || SERVER_EXIT_CODE=$?
      SERVER_EXIT_CODE=${SERVER_EXIT_CODE:-1}
      kill "$GATEWAY_PID" 2>/dev/null || true
      wait "$GATEWAY_PID" 2>/dev/null || true
      exit "$SERVER_EXIT_CODE"
    fi

    if ! kill -0 "$GATEWAY_PID" 2>/dev/null; then
      break
    fi

    sleep 1
  done

  GATEWAY_EXIT_CODE=0
  wait "$GATEWAY_PID" || GATEWAY_EXIT_CODE=$?
  GATEWAY_PID=""

  if [ "$STOP_REQUESTED" -eq 1 ]; then
    exit 0
  fi

  if [ "$GATEWAY_EXIT_CODE" -eq 0 ]; then
    exit 0
  fi

  sleep 1
done
