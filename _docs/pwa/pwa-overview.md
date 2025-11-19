# Deal Scale PWA Reference

This guide captures how the dashboard behaves when installed as a Progressive Web App and how to validate the flow locally.

## Feature Summary

- **Push notifications**
  - Client state handled in `usePushStore` (`lib/stores/pushStore.ts`).
  - Service worker (`public/sw-custom.js`) listens for push events and routes users to deep links such as `/dashboard/lead-list/[listId]/lead/[leadId]`.
  - FastAPI-ready routes (`app/api/push/*`) persist subscriptions, send messages, and clean up invalid endpoints.

- **Install experience**
  - `useInstallPrompt` tracks visit counts, `beforeinstallprompt`, and iOS share-sheet instructions.
  - `components/pwa/InstallPrompt.tsx` renders a banner after 3 visits or meaningful engagement.

- **Offline behaviour**
  - Workbox-powered runtime caching with navigation preload at `public/sw-custom.js` and configuration in `public/sw-config.js`.
  - Campaign drafts persist offline via `useCampaignDraftStore` and background sync queues.
  - Analytics data falls back to cached copies and displays an offline banner.

- **Update detection**
  - `useServiceWorkerUpdate` watches for waiting service workers and offers a toast-based refresh via `components/pwa/UpdatePrompt.tsx`.

- **Network-aware dashboards**
  - `useNetworkQuality` detects slow connections and swaps charts for lightweight fallbacks.

## Local Testing

```bash
pnpm test:pwa
```

The suite (`tests/pwa/pwa.spec.ts`) covers:

- Subscription and permission state in `usePushStore`.
- Install prompt flow through `useInstallPrompt`.
- Service worker update lifecycle managed by `useServiceWorkerUpdate`.

Legacy store Playwright specs remain under `pnpm test:stores:playwright`.

## Extending the PWA

1. **Adding new cache rules** – extend `public/sw-config.js` with a new `runtimeCaching` entry and reexport values in `next.config.js`.
2. **Triggering new notifications** – leverage `lib/server/push/notificationFactory.ts` to compose payloads and call `/api/push/send`.
3. **Offline-first features** – persist state via `zustand` stores with `persist`, and synchronize using Workbox background sync queues.
4. **Testing hooks** – create additional Vitest specs alongside `tests/pwa/pwa.spec.ts` to validate edge cases before shipping.















