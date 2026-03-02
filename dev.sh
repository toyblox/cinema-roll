#!/bin/bash
set -e

# Read ANTHROPIC_API_KEY from .env
ANTHROPIC_API_KEY=$(grep '^ANTHROPIC_API_KEY=' .env | cut -d '=' -f2-)

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "Error: ANTHROPIC_API_KEY not found in .env"
  exit 1
fi

# Kill both servers on Ctrl+C
cleanup() {
  echo ""
  echo "Shutting down..."
  kill "$API_PID" "$VITE_PID" 2>/dev/null
  wait "$API_PID" "$VITE_PID" 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "Starting API server on :3001..."
ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" npm --prefix api run dev &
API_PID=$!

echo "Starting Vite on :5173..."
npm run dev &
VITE_PID=$!

wait "$API_PID" "$VITE_PID"
