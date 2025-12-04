#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE=${COMPOSE_FILE:-infra/hetzner/docker-compose.yml}
APP_SERVICE=${APP_SERVICE:-app}
REGISTRY_IMAGE=${REGISTRY_IMAGE:-ghcr.io/dealscale/main-app}
ROLLBACK_TAG=${ROLLBACK_TAG:-previous}
TARGET_IMAGE="${REGISTRY_IMAGE}:${ROLLBACK_TAG}"
APP_HEALTH_URL=${APP_HEALTH_URL:-https://app.dealscale.io/api/health}

echo "[rollback] Rolling back ${APP_SERVICE} to ${TARGET_IMAGE}"

APP_IMAGE="${TARGET_IMAGE}" docker compose -f "${COMPOSE_FILE}" pull "${APP_SERVICE}" || true
APP_IMAGE="${TARGET_IMAGE}" docker compose -f "${COMPOSE_FILE}" up -d --no-deps "${APP_SERVICE}"

APP_HEALTH_URL="${APP_HEALTH_URL}" bash infra/hetzner/healthcheck.sh

