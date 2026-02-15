#!/bin/bash

# Repository name
REPO="purbakawaca/purbakawaca09"

# Get current date and time for tagging
TIMESTAMP=$(date +"%Y%m%d-%H%M")

# Define tags
BACKEND_LATEST="${REPO}:tanipintar-backend-latest"
FRONTEND_LATEST="${REPO}:tanipintar-frontend-latest"
BACKEND_TAG="${REPO}:tanipintar-backend-${TIMESTAMP}"
FRONTEND_TAG="${REPO}:tanipintar-frontend-${TIMESTAMP}"

echo "============================================="
echo "Building and Pushing Docker Images"
echo "Repository: ${REPO}"
echo "Timestamp: ${TIMESTAMP}"
echo "============================================="

# Build Backend
echo "[1/4] Building Backend Image..."
docker build -t "$BACKEND_TAG" -t "$BACKEND_LATEST" ./backend || { echo "Backend build failed"; exit 1; }

# Push Backend
echo "[2/4] Pushing Backend Image..."
docker push "$BACKEND_TAG" || { echo "Backend push failed"; exit 1; }
docker push "$BACKEND_LATEST" || { echo "Backend latest push failed"; exit 1; }

# Build Frontend
echo "[3/4] Building Frontend Image..."
docker build -t "$FRONTEND_TAG" -t "$FRONTEND_LATEST" ./frontend || { echo "Frontend build failed"; exit 1; }

# Push Frontend
echo "[4/4] Pushing Frontend Image..."
docker push "$FRONTEND_TAG" || { echo "Frontend push failed"; exit 1; }
docker push "$FRONTEND_LATEST" || { echo "Frontend latest push failed"; exit 1; }

echo "============================================="
echo "SUCCESS!"
echo "Images pushed:"
echo "  - ${BACKEND_TAG}"
echo "  - ${BACKEND_LATEST}"
echo "  - ${FRONTEND_TAG}"
echo "  - ${FRONTEND_LATEST}"
echo "============================================="
