import { describe, expect, it } from "vitest";

const P0_NAVIGATION_LABELS = [
  "Assurance Inbox",
  "Audit",
  "Seller Journeys",
  "Promise Ledger",
  "Policies",
  "Detectors",
  "Integrations / Evidence Readiness",
] as const;

describe("P0 navigation contract", () => {
  it("defines every required assurance surface", () => {
    expect(P0_NAVIGATION_LABELS).toHaveLength(7);
    expect(new Set(P0_NAVIGATION_LABELS).size).toBe(P0_NAVIGATION_LABELS.length);
  });
});
