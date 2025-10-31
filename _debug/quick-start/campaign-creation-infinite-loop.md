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
- Toaster mounts after hydration (ClientToaster) and uses memoized props. Fixed dynamic usage to render `<ClientToaster />` via dynamic import with `ssr: false` in `components/layout/providers.tsx`.
- Removed duplicate ClientToaster mount from `app/dashboard/layout.tsx` (was causing double Toaster instances).
- Added `closeButton` prop to Sonner Toaster to enable user dismissal of toasts.
- Unified valid route targets.
- Converted stores to `createWithEqualityFn(Object.is)` to remove deprecation warnings and reduce re-renders.
- Quick Start now passes `onCampaignLaunched` to open Webhooks immediately; QuickStartLegacyModals forwards it to the modal.
- Fixed `handlePostLaunch` in Quick Start to defer webhook modal opening with `setTimeout(..., 0)` to avoid render-time state updates.
- Fixed stuck "Launching enrichment suite..." toasts:
  - Added `launchToastIdRef` in `LeadModalMain` and `LeadBulkSuiteModal` to track active loading toasts.
  - Added cleanup effect to dismiss toast when modal closes (`useEffect` on `isOpen` change).
  - Set loading toast `duration: Infinity` so it persists until explicitly dismissed.
  - Ensured all code paths (success, error, early return) properly dismiss toast and clear ref.

**What Didn’t Work**
- Only deferring router pushes — still redirected when `onCampaignLaunched` wasn’t wired.
- Using `/dashboard/lead-lists` — route not found; caused boundary loop.
- Treating source map 404s as root cause — they are unrelated.

**Current Behavior**
- From Quick Start: launch opens Webhooks (deferred); saving Webhooks navigates to `/dashboard/campaigns`.
- Zustand deprecations removed for Quick Start/Campaign stores.
- Toaster hydration reduces boundary warnings.
- Single Toaster instance (ClientToaster in providers, no duplicate in dashboard layout).
- Toasts can be closed via close button or swipe away.
- Loading toasts properly dismissed when modals close or operations complete.

**Next Diagnostic Steps**
- If errors recur, capture exact URL and first app file+line from stack.
- Ensure any remaining toasts/navigations follow deferral and same-URL guard.
- Monitor for any remaining infinite loops in FinalizeCampaignStep form sync effects (lines 86-110, 118-159).
- Verify that FinalizeCampaignStep `handleLaunch` (line 198) doesn't trigger state updates that cause re-renders during launch.

**Appendix: Text Signature Feature**
- Default: “-- {Company Name}”. Checkbox: “Auto-append agent name” (on). Preview shows final signature.
- Store fields: `textSignature`, `smsAppendAgentName`, `smsMediaSource`, `smsCanSend*`.

**Toast Fixes (2025-01)**
- Added `closeButton` prop to Sonner Toaster (`components/ui/sonner.tsx`).
- Implemented toast cleanup in modals:
  - `LeadModalMain`: `launchToastIdRef` tracks loading toast; cleanup on modal close.
  - `LeadBulkSuiteModal`: Same pattern applied.
  - Loading toasts set `duration: Infinity` to persist until dismissed.
  - All async paths (success, error, early return) dismiss toast and clear ref.
- Removed duplicate ClientToaster from dashboard layout to prevent double Toaster instances.

**Evaluation Report Modal Fixes (2025-01)**
- Fixed infinite loop when closing Evaluation Report Modal (`components/reusables/modals/user/campaign/EvaluationReportModal.tsx`):
  - **Root Cause**: Multiple state updates on close triggered cascading re-renders. Async operations continued after modal closed, causing race conditions. Dialog's `onOpenChange` could trigger multiple times.
  - **Solution**:
    - Used `useRef` for `pollIntervalRef`, `isMountedRef`, and `openRef` to avoid stale closures in async callbacks.
    - Separated cleanup logic into distinct effects: one for component unmount, one for modal close reset, one for data fetching.
    - Added `handleOpenChange` wrapper to check if state already matches target before updating, preventing duplicate updates.
    - Used `setTimeout(..., 0)` to batch state updates when closing modal, preventing immediate re-renders.
    - Added `cancelled` flag to cancel async operations when modal closes or component unmounts.
    - Stored current `evalRunId` and `apiKey` in local variables at effect start to avoid stale closure values in async callbacks.
    - Added guards using `isMountedRef.current`, `openRef.current`, and `cancelled` flag before all state updates.
    - Proper interval cleanup: stored in ref, cleared in all code paths (close, unmount, error).
  - **Modal Structure**: Converted from Popover to Dialog for better scrolling behavior and proper modal lifecycle management.
  - **Data Source**: Initially used mock data generation instead of API fetching to avoid API key requirements during development.
