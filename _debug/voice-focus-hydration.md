
# Voice Focus Widget Hydration Mismatch – Debug Log

**Date:** 2025-11-15  
**Issue:** Hydration failed because server-rendered markup did not match client-rendered markup for the Focus (voice/phone) widget after adding “Dialer Feature Highlights.”  
**Severity:** HIGH (blocks dashboard loading)  
**Status:** IN PROGRESS

---

## Problem Description

After landing on `/dashboard`, Next.js threw `Error: Hydration failed because the initial UI does not match what was rendered on the server. Did not expect server HTML to contain a <div> in <div>.` The error appeared immediately and the Focus widget (voice modal) stopped rendering. This started right after we injected Dialer Feature Highlight UI with modals/sheets inside `components/ui/floating-music-widget/VoiceModePanel.tsx`.

## Initial Hypotheses

- The new Dialer highlight modal/sheet uses client-only APIs (`useEffect`, `window`, etc.). Rendering them during SSR produced extra wrapper `<div>` elements that didn’t exist once the client toggled them.
- We had multiple root-level siblings (`<div> ... </div><Dialog ...><Sheet ...>`) returned from `VoiceModePanel` which SSR rendered, but the client tree changed once React re-rendered and gated them behind client state.
- Logging showed up only on the client, leaving SSR without instrumentation, making it harder to confirm the mismatch path.

## Debug Timeline

| Time | Action |
|------|--------|
| 2025-11-15 10:05 | Reproduced the hydration error locally (`pnpm dev`). Confirmed console error “Did not expect server HTML to contain a `<div>` inside `<div>`.” |
| 2025-11-15 10:20 | Compared raw server vs. client markup in React DevTools. Noticed that the highlight dialog/sheet markup (Radix portals) existed on the server even though they should only render after mount. |
| 2025-11-15 10:34 | Attempted to gate the dialog/sheet behind a `uiReady` flag (set in `useEffect`). Initial attempt still returned multiple siblings, so SSR output still had portal markup. |
| 2025-11-15 10:45 | Confirmed that returning `<div>...</div><Dialog />` without a fragment means the server renders the dialog too. The client swapped to a fragment on second render, causing the mismatch. |
| 2025-11-15 11:05 | Added optional logging hooks, but in production mode they were silenced. Replaced the return tree with a fragment and wrapped all client-only UI in `{uiReady && (...)}`. |
| 2025-11-15 11:25 | Error persisted; realized the server still renders the placeholder differently than the client (placeholder missing on client after mount). |
| 2025-11-15 11:40 | Fully reverted `VoiceModePanel.tsx` and `constants.ts` to the pre-feature baseline. Hydration error disappeared, proving the regression introduced by the new UI. |
| 2025-11-15 12:00 | Plan formed to reintroduce highlight UI incrementally (feature flag + better SSR-safe wrappers), but postponed to keep dashboard stable. |

## Reproduction Steps

1. `pnpm dev`
2. Open `/dashboard`
3. Observe hydration error in console and blank Focus widget.

## Debug Actions Taken

- Added `uiReady` gating for the dialog/sheet and multi-mode modal.
- Attempted to wrap the entire component return value with a fragment.
- Injected console logging (only in dev) to trace SSR vs. CSR phases.
- Ultimately rolled back the `VoiceModePanel` and `constants` files to the known-good commit to restore stability.

## Root Cause (Current Understanding)

Returning multiple sibling nodes (main widget + dialog + sheet) without a fragment produced extra DOM nodes during SSR. When the client ran, the new client-side state hid those nodes, so React saw a mismatch (“<div> in <div>”). Additionally, elements that depend on browser-only APIs must never render on the server; otherwise, their presence or absence causes hydration failures.

## Next Steps

1. Reintroduce Dialer highlight UI behind a feature flag (`NEXT_PUBLIC_FOCUS_HIGHLIGHTS=1`). SSR will only render the original structure unless the flag is set on both server and client.
2. When re-adding the dialog/sheet:
   - Ensure the component always returns the same root wrapper (either a single `<div>` or a fragment).
   - Use `useEffect` to defer rendering of client-only portals, but keep the placeholder markup identical on both SSR/CSR.
   - Consider dynamically importing the highlight UI with `ssr: false`.
3. Add explicit logging for both SSR and CSR (e.g., `console.info` gated by a dedicated env flag) so future regressions are easier to trace.

## References

- Next.js hydration troubleshooting: https://nextjs.org/docs/messages/react-hydration-error
- Original feature PR (Dialer Highlights) – see commit TBD when reintroducing.
*** End Patch

