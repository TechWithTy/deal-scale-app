#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE=${COMPOSE_FILE:-infra/hetzner/docker-compose.yml}
APP_SERVICE=${APP_SERVICE:-app}
REGISTRY_IMAGE=${REGISTRY_IMAGE:-ghcr.io/dealscale/main-app}
DEPLOY_TAG=${DEPLOY_TAG:-latest}
TARGET_IMAGE="${REGISTRY_IMAGE}:${DEPLOY_TAG}"
APP_HEALTH_URL=${APP_HEALTH_URL:-https://app.dealscale.io/api/health}

echo "[deploy] Target image: ${TARGET_IMAGE}"

if docker inspect dealscale-app &>/dev/null; then
	CURRENT_IMAGE=$(docker inspect -f '{{ .Config.Image }}' dealscale-app || true)
	if [[ -n "${CURRENT_IMAGE}" ]]; then
		echo "[deploy] Tagging previous image as ${REGISTRY_IMAGE}:previous"
		docker tag "${CURRENT_IMAGE}" "${REGISTRY_IMAGE}:previous" || true
	fi
fi

APP_IMAGE="${TARGET_IMAGE}" docker compose -f "${COMPOSE_FILE}" pull "${APP_SERVICE}"
APP_IMAGE="${TARGET_IMAGE}" docker compose -f "${COMPOSE_FILE}" up -d --no-deps "${APP_SERVICE}"

echo "[deploy] Waiting for healthcheck at ${APP_HEALTH_URL}"
APP_HEALTH_URL="${APP_HEALTH_URL}" bash infra/hetzner/healthcheck.sh

