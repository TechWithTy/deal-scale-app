# OWASP Scan Platform Guide (macOS · Windows · Linux)

This guide explains how to run `pnpm run security:owasp` reliably on every platform, including the prerequisites for automatic build/start, Docker connectivity, and symlink permissions.

---

## 1. Shared Prerequisites

Regardless of OS, ensure:

| Requirement | Details |
| --- | --- |
| Node.js | v20 |
| pnpm | v9 (Corepack enabled) |
| Docker | Desktop/Engine with Buildx and Compose |
| Trivy | Installed via `aquasecurity/trivy-action` (CI) or available locally |
| OWASP ZAP | Pulled as Docker image (`ghcr.io/zaproxy/zaproxy:stable`) |
| Repo scripts | `tools/security/run-owasp-baseline.ts` manages build + start automatically |

Key env knobs:
- `OWASP_MANAGE_SERVER=0` → skip auto build/start if you want to manage the server manually.
- `OWASP_HEALTH_URL` → custom health probe endpoint (defaults to app root).
- `OWASP_TARGET` → override the target URL for the scan.

---

## 2. macOS

### 2.1 Enable Symlinks (Default)
macOS allows developer symlinks by default; no special setup required.

### 2.2 Docker Host Access
`host.docker.internal` works out of the box on macOS. ZAP in Docker can reach `http://host.docker.internal:3000` once the app is running.

### 2.3 Running the Scan
```bash
pnpm install
pnpm run security:owasp
```

The script will:
1. Run `pnpm run build`
2. Start `pnpm run start`
3. Wait until the app responds
4. Run OWASP (CLI or Docker fallback)
5. Shut down the managed server

If you want manual control:
```bash
OWASP_MANAGE_SERVER=0 pnpm run security:owasp
```
Then, in a separate shell:
```bash
pnpm build && pnpm start
```

---

## 3. Windows

### 3.1 Symlink Permissions
Windows blocks symlinks unless:
1. **Developer Mode** is enabled (Settings → System → For Developers → Enable Developer Mode), or
2. You run the shell as **Administrator**.

Next.js needs to create symlinks under `.next/standalone`. Without permission you’ll see `EPERM: operation not permitted, symlink …`.

### 3.2 Docker Host Access
- Ensure Docker Desktop → Settings → Resources → Network → “Enable host.docker.internal for Linux containers” is turned on.
- If ZAP still can’t reach your app, try `OWASP_TARGET=http://172.17.0.1:3000` (Docker’s default bridge).

### 3.3 Running the Scan
1. Open PowerShell **as Administrator** (or enable Developer Mode).
2. Run:
   ```powershell
   pnpm install
   pnpm run security:owasp
   ```
   or, for manual control:
   ```powershell
   setx OWASP_MANAGE_SERVER 0
   pnpm build
   pnpm start   # keep running
   pnpm run security:owasp
   ```

### 3.4 Troubleshooting
- `EPERM symlink` → confirm admin privileges or Developer Mode.
- `Connection refused` from ZAP → ensure the app is running and host mapping is enabled.
- `Failed to access summary file /home/zap/zap_out.json` → typically indicates ZAP couldn’t reach the target; fix host/network first.

---

## 4. Linux

### 4.1 Symlinks
Linux allows symlinks by default; no extra steps.

### 4.2 Docker Host Access
- If running Docker locally: use `http://localhost:3000` or the container’s internal IP.
- If running Docker inside WSL2 but scanning host processes, use `http://host.docker.internal:3000`. On pure Linux hosts, add to `/etc/hosts`:
  ```
  127.0.0.1 host.docker.internal
  ```

### 4.3 Running the Scan
```bash
pnpm install
pnpm run security:owasp
```
or manage the server yourself with `OWASP_MANAGE_SERVER=0`.

### 4.4 Systemd / PM2 Targets
If your production services run under systemd/PM2, you can still use this script for staging: export `OWASP_TARGET=https://staging.example.com` and skip local build/start.

---

## 5. Common Issues & Fixes

| Symptom | Platform | Fix |
| --- | --- | --- |
| `EPERM: operation not permitted, symlink …` | Windows | Enable Developer Mode or run terminal as Administrator |
| `Job spider failed to access URL … connection refused` | Any | Ensure server is running; `pnpm run security:owasp` now auto-starts unless `OWASP_MANAGE_SERVER=0` |
| Docker fallback can’t reach host | Windows/Linux | Enable `host.docker.internal` or use `OWASP_TARGET=http://172.17.0.1:3000` |
| No summary file `/home/zap/zap_out.json` | Any | ZAP never reached the target; fix host connectivity and rerun |
| Want to scan staging/prod instead of localhost | Any | Set `OWASP_TARGET=https://staging.domain.tld` and `OWASP_MANAGE_SERVER=0` |

---

## 6. Integrating With Other Apps

You can reuse the same script for additional services (e.g., backend, marketing site) by setting `OWASP_TARGET` to their URLs. If they require auth, supply headers via `OWASP_BASELINE_ARGS` (e.g., `--hook=/zap/wrk/auth-hook.py`).

---

## 7. Quick Commands Reference

| Scenario | Command |
| --- | --- |
| Default (auto build/start) | `pnpm run security:owasp` |
| Skip server management | `OWASP_MANAGE_SERVER=0 pnpm run security:owasp` |
| Custom health endpoint | `OWASP_HEALTH_URL=http://localhost:3000/ready pnpm run security:owasp` |
| Scan staging/prod | `OWASP_MANAGE_SERVER=0 OWASP_TARGET=https://app-staging.example.com pnpm run security:owasp` |

---

Keep this guide handy when onboarding teammates or running the OWASP scan from different machines. Update it as new platform-specific steps or services are introduced.




