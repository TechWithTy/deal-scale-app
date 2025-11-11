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


