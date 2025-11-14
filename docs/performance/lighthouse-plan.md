---
title: Lighthouse Optimization Plan
description: Action plan for stabilizing performance audits and addressing expected bottlenecks
lastUpdated: 2025-11-14
---

# Lighthouse Optimization Plan

## Context Snapshot

- Latest runs (`reports/lighthouse/prod.report.html/json`) failed with `NO_FCP` / `PAGE_HUNG`, so Lighthouse could not record any metrics.
- The app now supports Cloudflare Image Resizing via `NEXT_IMAGE_STACK=cloudflare`, but we still need verifiable Lighthouse data to validate the migration.
- Both prod/local scripts currently write to the same output files, making comparisons difficult.

## Objectives

1. **Stabilize the audit harness** so Lighthouse captures actionable metrics for both production (`app.dealscale.io`) and local builds.
2. **Reduce initial render cost** (hero images, dashboard shell JS, third-party scripts) to improve FCP/LCP/TBT once measurements are available.
3. **Document and track each optimization** to prevent regressions across deployments.

## Work Plan

### 1. Reliable Audit Runs (P0)
- Separate output paths for prod vs. local runs to avoid overwrites.
- Use production builds (`pnpm build && pnpm start`) for local audits to eliminate dev-mode latency.
- Add `--max-wait-for-load` and `--throttling-method=simulate` to keep Chrome from terminating during heavy renders.
- Provide a retriable workflow (run up to 3 times) and surface failures in CI.
- **Authenticated runs**: `pnpm perf:lighthouse:local-auth` (or `...:prod-auth`) now executes `scripts/perf/create-lighthouse-headers.ts`, which logs in with the demo admin user (`admin@example.com`/`password123` by default) and saves the cookie header to `reports/lighthouse/*.headers.json`. Lighthouse automatically picks up that header file via `--extra-headers`, so the audit always targets `/dashboard` instead of being redirected to `/signin`.
- Update the demo credentials via `LIGHTHOUSE_DEMO_EMAIL` and `LIGHTHOUSE_DEMO_PASSWORD` env vars when needed; the script writes files ignored by git (`reports/lighthouse/*.headers.json`). The helper detects whichever login UI is available: when the credential form is present it fills the email/password fields, and when dev/test mode hides that form it clicks the first “Login as …” button in the Test Users panel (same flow we use manually).
- **One-command local run**: `pnpm perf:lighthouse:local-ci` performs `pnpm build`, starts `pnpm start`, waits for readiness, runs the authenticated Lighthouse flow, generates `reports/lighthouse/local.report.*`, and finally writes `reports/lighthouse/local.summary.md` (LLM-ready markdown with key metrics and opportunities) before shutting the server down. Use this for both manual reviews and CI artifacts.
- **Why we don’t reuse the Playwright browser for other tests**: once the auth helper finishes, the headless Chromium instance is closed (which also clears cookies/state). Starting a separate e2e suite “from where it left off” would require keeping that browser alive and piping control into a totally different runner, which isn’t supported and would make runs flaky. Instead, each workflow (perf, e2e, smoke) establishes its own clean login so sessions are deterministic and isolated.

### 2. Image Delivery (P1)
- Ensure `NEXT_IMAGE_STACK` defaults to `cloudflare` in Pages/Workers; expose a `.env.local` knob for dev verification.
- Preload LCP hero assets (`<link rel="preload" as="image">`) and remove lazy loading from above-the-fold `<Image>` components.
- Lock aspect ratios (width/height) on CTA and hero imagery to eliminate CLS.

### 3. JavaScript Payload (P1)
- Split large dashboard bundles via `next/dynamic` (QuickStart wizard, analytics charts, Kanban board).
- Defer Zustand store initialization until the corresponding route mounts.
- Audit global providers for unused client-side effects during initial paint.

### 4. Third-Party Scripts (P2)
- Load analytics/recording SDKs (`posthog`, `clarity`, Supademo, Spotify) with `strategy="lazyOnload"` and respect user consent toggles.
- Introduce facades for heavy embeds (YouTube, Supademo video) so they only hydrate on interaction.

### 5. Network & Caching (P2)
- Add `<link rel="preconnect">` hints for frequently hit third-party origins.
- Set `font-display: swap` on self-hosted fonts and host critical font files on the same origin.
- Cache ISR/marketing data where possible to reduce TTFB during `pnpm start`.

### 6. Verification & Regression Tracking (P1)
- Store Lighthouse artifacts per mode: `reports/lighthouse/prod/YYYYMMDD-HHMM.*` and `reports/lighthouse/local/...`.
- Capture key metrics (FCP, LCP, CLS, TBT, INP) in a markdown log for historical comparison.
- Wire scripts into CI/CD so production deploys run Lighthouse against the latest preview before promotion.

## Next Actions

1. Update npm scripts to include the new options and per-environment output directories.
2. Re-run Lighthouse locally (`pnpm build && pnpm start` ➜ `pnpm perf:lighthouse:prod-local`) and attach the fresh reports.
3. Tackle the highest priority optimizations (hero preload, dynamic imports) once metrics confirm the bottlenecks.

> This document should be updated after every successful Lighthouse run with the new metrics and any follow-up tasks.

