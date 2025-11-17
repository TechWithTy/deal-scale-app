#!/usr/bin/env bash
set -euo pipefail

APP_HEALTH_URL=${APP_HEALTH_URL:-https://app.dealscale.io/api/health}
HEALTH_TIMEOUT=${HEALTH_TIMEOUT:-120}
HEALTH_INTERVAL=${HEALTH_INTERVAL:-5}

echo "[healthcheck] Probing ${APP_HEALTH_URL} (timeout=${HEALTH_TIMEOUT}s)"

end=$((SECONDS + HEALTH_TIMEOUT))
while (( SECONDS < end )); do
	if curl -fsS "${APP_HEALTH_URL}" > /dev/null; then
		echo "[healthcheck] Service is healthy"
		exit 0
	fi
	sleep "${HEALTH_INTERVAL}"
done

echo "[healthcheck] Service did not become healthy in ${HEALTH_TIMEOUT}s" >&2
exit 1






