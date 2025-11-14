# OWASP ZAP Baseline Scan via Docker Compose

Deal Scale now ships a dedicated Compose file so the OWASP baseline scan can run without installing ZAP locally.

## Prerequisites
- Docker Desktop 4.29+ (or any host with `docker compose` v2)
- Local Next.js dev server running on `http://localhost:3000`
- Optional: set `OWASP_TARGET` to scan a different URL (e.g. staging)

## One-Time Setup
```bash
docker compose -f docker/docker-compose.security.yml pull zap-baseline
```

## Prepare the Target Service
By default `pnpm run security:owasp` now **builds** (`pnpm run build`) and **starts** (`pnpm run start`) the Next.js app for you, waits until it responds, runs the scan, then shuts the server down automatically. This behavior is controlled by:

- `OWASP_MANAGE_SERVER=0` → skip build/start if you want to run the app yourself.
- `OWASP_HEALTH_URL=https://localhost:3000/ready` → custom health probe endpoint.

If you opt out of automation, start the app manually before running the scan:

```bash
pnpm build
pnpm start
# leave this terminal running, then run the scan from a new shell
```

## Running the Scan
```bash
# in a second shell, trigger the baseline scan
pnpm run security:owasp
```

`tools/security/run-owasp-baseline.ts` automatically falls back to Compose when `zap-baseline.py` is missing, so the same script works locally and in CI. The container writes HTML/JSON reports to `reports/security/owasp/`.

## Customization
- `OWASP_TARGET`: override the scan URL (default `http://host.docker.internal:3000` when using Docker)
- `OWASP_BASELINE_ARGS`: append extra flags (e.g. `--config alertThreshold=MEDIUM`)
- `OWASP_DOCKER_COMPOSE_FILE`: change from `docker/docker-compose.security.yml`
- `OWASP_DOCKER_COMPOSE_CMD`: replace `docker` with `docker-compose` or a custom wrapper
- `OWASP_DOCKER_SERVICE`: run a different service name (default `zap-baseline`)
- `OWASP_DOCKER_PULL`: change the pull behavior (`missing`, `always`, etc.)
- `OWASP_DOCKER_PROJECT`: override the docker compose project name
- `OWASP_USE_DOCKER=1`: force Compose mode even if a local `zap-baseline.py` is installed

## Connectivity Tips
- Docker Desktop (Windows/macOS): ensure *Settings → Resources → Network → “Enable host.docker.internal for Linux containers”* is turned on.
- The Compose service injects `extra_hosts: ["host.docker.internal:host-gateway"]`, so the container can reach the host even if Docker disables the alias.
- If requests still fail, try targeting `http://172.17.0.1:3000` (the default bridge gateway) via `OWASP_TARGET`.
- Reports and logs are written to `reports/security/owasp/` with the canonical summary file at `/zap/wrk/zap_out.json`.

## Commit Checklist
- Run `pnpm run security:owasp` (Docker-backed) before pushing security-related changes
- Archive the latest report with `pnpm run archive:owasp` if submitting a PR that fixes findings

