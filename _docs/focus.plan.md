<!-- a35d00cd-ad48-41e8-ac9d-2a14431c3f41 9d6c0271-d69c-4f04-a2c0-d426bf5cbb5b -->
# Session Activation Revamp

1. **Repurpose sessions list**

- Update `VOICE_SESSION_OPTIONS` (and related quick strips) to represent user chat sessions instead of workflow presets.
- Surface associated metadata (title, icon, bookmark state) and move existing workflow-based entries into a new `Sprints` group.

2. **Implement session activation**

- Wire session items (quick strips + command palette) to start the corresponding chat session via the focus widget store/actions.
- Add bookmark toggle icons and “go to session” icons in each item, persisting bookmark state.

3. **Adjust UI & tests**

- Refresh labels (`Sessions` → `Sprints` etc.), ensure new bookmark/action icons display, and expand unit tests to cover session activation and bookmarking.
- Default the floating widget to the `Voice` tab (instead of `Music`) and update tests for the new default state.

4. **Introduce video tab**

- Add a `Video` tab mirroring the voice layout minus the mic animation, replacing the hero area with a full-bleed live avatar container that keeps action buttons and device permissions accessible.
- Update stores, UI components, and tests to cover video-mode toggling, status handling, and layout differences.

5. **Add phone tab**

- Create a `Phone` tab designed for calling and SMS interactions, including dialer, message list, and ability to reuse shared permissions/actions.
- Extend state, widgets, and test coverage to ensure voice/video/phone modes coexist cleanly.

