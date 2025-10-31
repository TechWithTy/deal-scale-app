**Campaign Creation Infinite Loop — Quick Start Debug Log**

- Date: 2025-01 (ongoing)
- Area: Quick Start launch → Campaign modal → Webhooks modal → navigation
- Goal: Make flow: Launch → open Webhooks (stay on Quick Start) → Save → go to Campaigns. Remove render-time update loops.

**Symptoms Observed**
- ForwardRef setState warning around Toaster.
- Dev overlay: Redirect/NotFound/DevRootNotFound boundaries, “Maximum update depth exceeded”.
- Unexpected redirect to `/dashboard/campaigns?type=…` right after launch (before Webhooks).
- Source map 404s (installHook.js.map, css maps) — benign in dev.

**Initial Findings**
- Synchronous updates (toasts, router.push) during boundary transitions.
- CampaignModalMain auto-pushed to campaigns when `onCampaignLaunched` missing.
- Toaster mounted in server layout contributed to updates during boundaries.
- Route mismatch (`/dashboard/lead-lists` invalid).
- Some stores using `create` emitted deprecation warning and extra churn.

**Changes Applied**
- Cleaned ChannelCustomizationStep JSX and simplified type assertions.
- Added Text settings: default signature, media source, auto-append agent name; typed in store.
- Wrapped router.push and toasts with `setTimeout(..., 0)`; added same-URL guard.
- In CampaignModalMain, skip auto-navigation when on Quick Start path — lets Quick Start control next step.
- In WebHookMain, close modal first, then defer toasts and navigate to `/dashboard/campaigns`.
- Toaster mounts after hydration (ClientToaster) and uses memoized props.
- Unified valid route targets.
- Converted stores to `createWithEqualityFn(Object.is)` to remove deprecation warnings and reduce re-renders.
- Quick Start now passes `onCampaignLaunched` to open Webhooks immediately; QuickStartLegacyModals forwards it to the modal.

**What Didn’t Work**
- Only deferring router pushes — still redirected when `onCampaignLaunched` wasn’t wired.
- Using `/dashboard/lead-lists` — route not found; caused boundary loop.
- Treating source map 404s as root cause — they are unrelated.

**Current Behavior**
- From Quick Start: launch opens Webhooks; saving Webhooks navigates to `/dashboard/campaigns`.
- Zustand deprecations removed for Quick Start/Campaign stores.
- Toaster hydration reduces boundary warnings.

**Next Diagnostic Steps**
- If errors recur, capture exact URL and first app file+line from stack.
- Ensure any remaining toasts/navigations follow deferral and same-URL guard.

**Appendix: Text Signature Feature**
- Default: “-- {Company Name}”. Checkbox: “Auto-append agent name” (on). Preview shows final signature.
- Store fields: `textSignature`, `smsAppendAgentName`, `smsMediaSource`, `smsCanSend*`.
