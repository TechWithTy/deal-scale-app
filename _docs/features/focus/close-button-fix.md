---
title: Focus Widget Close Control Fix
description: Notes on resolving the close button not hiding the focus widget while debug helpers were active.
---

## Root Cause

When the environment variable `NEXT_PUBLIC_MUSIC_WIDGET_DEBUG` was enabled, the `useFloatingMusicDebug` hook forced the music/voice widget into an always-on state on every render. This meant the close button immediately re-enabled the widget, so clicking the “X” appeared to do nothing.

## Resolution

- Updated `useFloatingMusicDebug` to auto-enable the widget only once per debug session (tracked with a ref) and allow manual toggles afterward.
- Ensured the widget’s `shouldRender` flag respects `preferences.enabled` so closing the widget hides it even with debug helpers enabled.
- Added stronger hover/active visual states to the destructive close control for clearer feedback.

These changes make the close button reliable in all modes while preserving the optional debug conveniences.

## 2025-11-11 Layout Regression Follow-up

Symptoms:
- Focus tab rail stretched to full widget width, pushing minimize/maximize controls out of frame.
- Voice mode content could not scroll, hiding the lower action cards.

Fixes:
- Converted the tab rail to an inline-flex strip with horizontal scroll and explicit `align-self: center` so it hugs the pills.
- Introduced a shared `.deal-scale-focus-scroll` container that gives both music and voice modes responsive vertical overflow handling.
- Kept the voice agent list inside its existing `deal-scale-focus-voice-body` so status chips remain pinned while the roster scrolls.

Next time confirm widgets in `/test-external/focus-widget` after CSS edits; the debug helpers won’t mask layout regressions anymore.




