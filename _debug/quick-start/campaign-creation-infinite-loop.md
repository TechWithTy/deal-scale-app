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
- Route mismatch (`/dashboard/lead-list` invalid).
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
- Using `/dashboard/lead-list` — route not found; caused boundary loop.
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

**Campaign Modal Main Fixes (2025-01)**
- Fixed infinite loop when closing Campaign Modal (`components/reusables/modals/user/campaign/CampaignModalMain.tsx`):
  - **Root Cause**: Multiple effects responding to `isOpen` changes caused cascading re-renders. Form reset on close triggered additional state updates. Dialog's `onOpenChange` could be called multiple times without guards. Effects running during close could trigger state updates that caused re-renders.
  - **Edge Cases**:
    - Form reset effect included `customizationForm` in dependencies (form object reference could change).
    - Lead count effect could run during close and trigger state updates.
    - Multiple effects responding to `isOpen` changes simultaneously.
    - `closeModal` callback depended on `isOpen`, causing it to be recreated on every render.
    - No guard on Dialog's `onOpenChange` to prevent duplicate calls.
  - **Solution**:
    - Added `isMountedRef` and `isOpenRef` to track component and modal state without causing re-renders.
    - Wrapped Dialog's `onOpenChange` with `handleDialogOpenChange` that checks current state before updating.
    - Deferred form reset with `setTimeout(..., 0)` to batch state updates and prevent immediate re-renders.
    - Removed `customizationForm` from form reset effect dependencies (using eslint-disable comment).
    - Added guards in lead count effect to skip execution when modal is closed or closing.
    - Updated `closeModal` to use refs instead of `isOpen` prop, removing it from dependencies.
    - Added `isMountedRef` checks in all timeout callbacks to prevent state updates after unmount.
    - Deferred `onOpenChange` calls in both `closeModal` and `handleDialogOpenChange` using `setTimeout(..., 0)`.
    - Added early returns in effects when modal is closed or component is unmounted.

**Quick Start Page & FinalizeCampaignStep Fixes (2025-01)**
- **Additional Root Cause Discovered**: When closing the Campaign Modal from Quick Start, `handleCampaignModalToggle` was calling `campaignStore.reset()` synchronously. This reset triggers massive state updates (resets 50+ store fields) which cause all subscribed components to re-render, including `FinalizeCampaignStep` which is still mounted during the modal close animation. The two form sync effects in `FinalizeCampaignStep` were running even when the modal was closed, attempting to sync form values with the store while the store was being reset, creating an infinite update loop.
  - **Edge Cases**:
    - `FinalizeCampaignStep` has two bidirectional sync effects:
      1. Store → Form: Syncs `campaignName`, `selectedWorkflowId`, `selectedSalesScriptId` from store to form (lines 127-157)
      2. Form → Store: Syncs watched form values back to store (lines 165-206)
    - During modal close, the store reset happens while `FinalizeCampaignStep` is still mounted (React doesn't unmount until after close animation).
    - Store reset sets all fields to default values, triggering the Store → Form effect.
    - Form → Store effect sees changed form values and writes back to store.
    - Store updates trigger re-renders, causing the cycle to repeat.
    - Quick Start's `handleCampaignModalToggle` wasn't memoized, potentially causing prop changes.
  - **Solution**:
    - **Quick Start Page** (`app/dashboard/quickstart/page.tsx`):
      - Memoized `handleCampaignModalToggle` with `useCallback` to prevent unnecessary prop changes.
      - Deferred `campaignStore.reset()` with `setTimeout(..., 100)` to allow modal close animation to complete and component unmount before triggering massive store updates.
      - Added comment explaining why the deferral is necessary.
    - **FinalizeCampaignStep** (`components/reusables/modals/user/campaign/steps/FinalizeCampaignStep.tsx`):
      - Added `isModalOpen?: boolean` prop (defaults to `true` for backward compatibility).
      - Added `isMountedRef` to track component mount state.
      - Added guards in both sync effects to skip execution when `!isModalOpen || !isMountedRef.current`.
      - Added `isModalOpen` to both effect dependency arrays.
    - **CampaignModalMain** (`components/reusables/modals/user/campaign/CampaignModalMain.tsx`):
      - Passed `isModalOpen={isOpen}` prop to `FinalizeCampaignStep` so it knows when the parent modal is closed.
  - **Key Insight**: Child component effects can continue running during parent modal close animations. Store resets trigger massive updates that can cause infinite loops if child effects don't guard against closed state. Always defer store resets and guard child effects with modal state.
