#!/bin/bash
set -euo pipefail

# Only run in Claude Code on the web
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo '{"async": true, "asyncTimeout": 300000}'

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Install root dependencies (frontend + concurrently)
echo "[session-start] Installing root npm dependencies..."
cd "$PROJECT_DIR"
npm install

# Install server dependencies
echo "[session-start] Installing server npm dependencies..."
cd "$PROJECT_DIR/server"
npm install

echo "[session-start] Dependencies installed."

# Ensure yt-dlp is installed
if ! command -v yt-dlp &> /dev/null; then
  echo "[session-start] Installing yt-dlp..."
  pip install yt-dlp --quiet
fi

# Ensure ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
  echo "[session-start] Installing ffmpeg..."
  apt-get install -y --fix-missing ffmpeg 2>/dev/null || true
fi

echo "[session-start] All setup complete."
