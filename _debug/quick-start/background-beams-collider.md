## Quick Start Background Beams Collider Fix

### Problem Summary

- Animated beams were missing Quick Start cards entirely  collisions only fired on the decorative footer gradient at the bottom of the surface.
- Hovering anywhere in the quick-start section paused animations permanently, so beams stayed frozen even after moving the cursor away.

### Root Cause

- `BackgroundBeamsWithCollision` treated only the gradient floor as a collision target, so beam bounding boxes never overlapped the actual card grid.
- Pause logic relied on a transparent overlay. When the overlay captured the hover event it set the `isPaused` flag to `true`, but events dispatched from nested nodes (cards, beams) never cleared the flag.

### Fix Implemented

1. **Collider targeting**
   - Tagged each Quick Start card with `data-beam-collider="true"` (`components/quickstart/QuickStartActionsGrid.tsx`).
   - Reworked `BackgroundBeamsWithCollision` to gather DOMRects from those targets via a mutation-observed list, plus the glow footer, so beams trigger explosions when intersecting cards.

2. **Pause / resume rules**
   - Replaced the overlay hover handler with bubbling `onMouseOver` / `onMouseLeave` handlers on the parent container.
   - Beams now pause only when hovering the empty backdrop. Moving onto beams or card content automatically resumes animation.

3. **Collision math**
   - Clamped explosion coordinates to the overlapping card rect. Prevented premature explosions that previously spawned above the cards.

### Verification

- Visual QA in the dashboard: beams animate continuously, pause only when hovering background, and explode directly atop cards.
- `read_lints` run for updated files to ensure the branch stays lint-clean (tests pending local `pnpm vitest` availability).

### Follow-up

- Once CLI access is restored, run `pnpm vitest run _tests/app/dashboard/quickstart/quickstart-page-wizard.test.tsx` to confirm the regression test still passes.

