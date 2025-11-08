# Hero Video Debug Plan & Log

## Context
The Quick Start hero is expected to render an embedded video preview (via `QuickStartHeroVideo` → `HeroVideoDialog`). Recent UI refactors removed or repositioned the component, and the video no longer renders for some viewers. This document captures the plan to debug the issue along with a running log.

---

## Debug Plan

1. **Verify Component Mounting**
   - Confirm `QuickStartHeroVideo` is still rendered in `app/dashboard/page.tsx`.
   - Check conditional rendering guards (`personaId`, feature flags, auth state).

2. **Inspect Data Sources**
   - Ensure `getQuickStartHeadlineCopy` returns a valid `video` config for each persona.
   - Validate default fallback (`QUICKSTART_DEFAULT_VIDEO`) is still wired.

3. **Check Client-Side Rendering**
   - Inspect browser console for warnings/errors related to `HeroVideoDialog`.
   - Confirm the iframe `src` isn’t being blocked (CSP, ad blockers).

4. **Review Styling & Layout**
   - Ensure parent containers have non-zero height (no `display: none`, `overflow: hidden` issues).
   - Verify `z-index` stacking doesn’t hide the video card.

5. **Network Diagnostics**
   - Watch network tab for video thumbnail load (`/images/quickstart/video-preview.svg`) and embed requests.
   - Confirm requests succeed (status 200) and aren’t blocked by extensions.

6. **Cross-Browser & Persona Testing**
   - Test multiple personas to ensure config completeness.
   - Check in Chromium, Firefox, and Safari to rule out browser-specific issues.

7. **Add Temporary Debugging**
   - Emit `console.debug` statements summarising active persona/video config.
   - Optionally add a visual placeholder if config is missing to aid detection.

8. **Document Findings**
   - Record each investigation step in the log below.
   - Update this plan as new hypotheses emerge.

---

## Debug Log

| Timestamp (UTC) | Step | Findings | Next Action |
| --- | --- | --- | --- |
| 2025-11-08T03:03:32Z | Verify component mount | `QuickStartHeroVideo` is imported and rendered between `DynamicHeadline` and `QuickStartCTA` in `app/dashboard/page.tsx`, so the component mounts as part of the hero stack. | Focus on why the rendered preview stays hidden (styling/network) rather than re-adding the component. |
| 2025-11-07T23:34:47Z | Inspect data sources | `getQuickStartHeadlineCopy` returns persona-specific configs and always falls back to `QUICKSTART_DEFAULT_VIDEO`, so a valid `video` object is guaranteed. No missing data sources detected. | Re-render the component after restoring it to confirm the default video appears. |
| 2025-11-07T23:36:02Z | Client-side console | No errors from `QuickStartHeroVideo` or `HeroVideoDialog`; only routine `useGoalFlowExecutor`, campaign modal props, and Fast Refresh logs present. | Proceed to layout review; focus on reintroducing the component rather than console issues. |
| 2025-11-08T03:03:32Z | Layout review | Hero section wraps the video in the same container as the headline CTA; wrapper uses `relative`/`mt` spacing without `display: none`. No immediate CSS blockers spotted from code review. | Open the dashboard after restoring the video to confirm no z-index/overflow issues in the browser. |
| _Pending_ | Network diagnostics |  |  |

> Add new rows as you progress. Include screenshots or console snippets when useful.

---

## Notes
- The plan assumes access to both local dev tools and browser inspector.
- Keep browser caching disabled during tests to avoid stale bundles.

## Findings Summary
- The `QuickStartHeroVideo` component is still part of the dashboard hero stack and mounts correctly; no JSX regression detected.
- Persona-driven copy always resolves to a `video` payload and falls back to `QUICKSTART_DEFAULT_VIDEO`, so data wiring remains intact.
- Browser console shows only routine Quick Start logs; no runtime errors connected to the hero video.
- Remaining verification step is to confirm the static thumbnail and YouTube embed requests succeed in the Network tab; if they do, investigate user-specific blockers (ad/CSP/extension).


