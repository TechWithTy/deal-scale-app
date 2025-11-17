# Score Streak Flow Vite PWA Delta

Last updated: 2025-11-07

## Summary
- **Plugin** — Uses `vite-plugin-pwa@0.20.x` with `registerType: "prompt"` to mirror the update-toast UX implemented in the Next.js dashboard.
- **Runtime caching** — Mirrors the Next.js Workbox rules by caching Deal Scale API responses (`NetworkFirst`), CDN images (`CacheFirst`), and dashboard routes (`StaleWhileRevalidate`).
- **Manifest** — Generated icons via the assets generator (`pnpm --filter score-streak-flow pwa:assets`) and declares shortcuts for the live leaderboard.
- **React integration** — `ServiceWorkerToasts` consumes `virtual:pwa-register/react` and reuses the shared toast system to surface offline-ready and refresh prompts.

## Validation Checklist
- `pnpm --filter score-streak-flow test:vite-pwa:unit`
- `pnpm --filter score-streak-flow test:vite-pwa:int`
- `pnpm --filter score-streak-flow test:vite-pwa:e2e`
- Run Lighthouse in an incognito Chrome window (install Score Streak Flow and confirm score ≥ 95).
- Manually toggle offline mode after the first load to confirm cached dashboards render and the offline toast appears.















