#!/bin/bash
set -e

# Read ANTHROPIC_API_KEY from .env
ANTHROPIC_API_KEY=$(grep '^ANTHROPIC_API_KEY=' .env | cut -d '=' -f2-)

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "Error: ANTHROPIC_API_KEY not found in .env"
  exit 1
fi

# Clear any stale processes on the ports we need
kill $(lsof -ti tcp:3001 2>/dev/null) 2>/dev/null || true
kill $(lsof -ti tcp:5173 2>/dev/null) 2>/dev/null || true
sleep 0.5

# Kill entire process group on Ctrl+C
cleanup() {
  echo ""
  echo "Shutting down..."
  kill $(lsof -ti tcp:3001 2>/dev/null) 2>/dev/null || true
  kill $(lsof -ti tcp:5173 2>/dev/null) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "Starting API server on :3001..."
ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" node --watch api/server.js &
API_PID=$!

echo "Starting Vite on :5173..."
npm run dev &
VITE_PID=$!

wait "$API_PID" "$VITE_PID"
