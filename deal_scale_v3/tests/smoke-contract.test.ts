import { describe, expect, it, vi } from "vitest";

import {
  ACTIVATION_EVENT,
  createActivationEvent,
  emitActivationEvent,
} from "../src/analytics/activation";
import { FEATURE_FLAGS, isFeatureEnabled } from "../src/config/feature-flags";

describe("golden smoke contract", () => {
  it("keeps risky surfaces disabled unless explicitly enabled", () => {
    expect(isFeatureEnabled(FEATURE_FLAGS.assuranceInbox)).toBe(false);
    expect(isFeatureEnabled(FEATURE_FLAGS.assuranceInbox, { assurance_inbox: true })).toBe(true);
  });

  it("emits the workspace-scoped activation event", () => {
    const sink = { capture: vi.fn() };
    const event = createActivationEvent({ workspaceId: "workspace-a", appVersion: "0.1.0" });
    emitActivationEvent(sink, event);
    expect(event.event).toBe(ACTIVATION_EVENT);
    expect(sink.capture).toHaveBeenCalledWith(ACTIVATION_EVENT, {
      workspace_id: "workspace-a",
      app_version: "0.1.0",
    });
  });
});
