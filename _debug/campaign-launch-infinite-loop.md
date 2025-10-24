# Campaign Launch Infinite Update Loop Debug Log

Date: 2025-09-17
Route(s): `/dashboard/quickstart` ➜ `/dashboard/campaigns`

## Issue Snapshot
- Launching a campaign from the quickstart flow still throws `Error: Maximum update depth exceeded` in React 18.
- Stack trace shows the loop originates inside Radix Dialog presence unmount (`RemoveScroll`, `DialogOverlayImpl`) after we close `CampaignModalMain`.
- The redirect to `/dashboard/campaigns?campaignId=…` succeeds, but the modal teardown and store resets keep firing while navigation occurs.

## Observations
- `CampaignModalMain` remains subscribed to the creation store while `useEffect` writers (`setDaysSelected`, lead list syncing) run even after `isOpen` flips to `false`.
- The quickstart page triggers `resetCampaignStore()` in a `useEffect` cleanup when the modal closes. That reset immediately changes the state backing `mutatedDays`, so the modal effect runs again before Radix finishes its exit animation.
- Because `launchCampaign()` closes the dialog and then calls `onCampaignLaunched`, both the modal and page run synchronous state updates in the same tick, re-triggering Radix presence work and hitting the update depth guard.
- Existing debug logging (`console.log` cost analytics) continues to execute multiple times per render, confirming rerenders during teardown.

## Attempts to Date
1. **Callback-driven redirect (current branch)** – moved routing into the quickstart page so the modal only toggles `onOpenChange(false)`. Result: loop persists.
2. **Tracked modal open transitions** – memoized close handler + delayed store reset to `setTimeout(..., 0)`. Result: still re-runs effects when store resets while the dialog is mid-unmount.
3. **Shallow store selectors** – limited subscriptions to specific fields to cut down on churn. Result: loop still observed after launch.

## Next Debug Steps
- Gate the `setDaysSelected` effect behind `isOpen && !closingRef` to stop writes once we close the modal.
- Defer the quickstart `resetCampaignStore()` until after navigation completes (e.g., `router.push` promise resolution or `afterEach` route effect).
- Add a one-shot ref around `launchCampaign` to ensure we only call it once per open cycle, preventing duplicate close attempts.
- Consider unmounting the modal component entirely (`{showCampaignModal && <CampaignModalMain ... />}`) so its effects stop running as soon as the parent hides it.

## Status
- ❌ Still reproducible on the latest commit. Need another iteration focusing on exit-side store writes before shipping.
