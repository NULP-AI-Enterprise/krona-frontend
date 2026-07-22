#!/bin/bash

echo "=== Krona Frontend Setup ==="
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"
cd "$FRONTEND_DIR"

echo "[1/2] Building and starting frontend container..."
docker-compose up -d --build
if [ $? -ne 0 ]; then
    echo "ERROR: docker-compose failed. Make sure Docker Desktop is running."
    exit 1
fi

echo ""
echo "[2/2] Waiting for dev server to start..."
sleep 5

echo ""
echo "=== Frontend setup complete! ==="
echo "Frontend: http://localhost:5173"
