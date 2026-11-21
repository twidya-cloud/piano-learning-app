#!/bin/bash
# Launcher script for PianoMaster Learning App

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

echo "=========================================================="
echo "🎹 Launching PianoMaster - Interactive Piano Learning App"
echo "=========================================================="

if [ "$1" == "--server" ]; then
    PORT=8080
    echo "Starting local HTTP server at http://localhost:$PORT..."
    open "http://localhost:$PORT"
    ruby -run -e httpd . -p $PORT
else
    echo "Opening PianoMaster directly in your default browser..."
    open "$APP_DIR/index.html"
fi
