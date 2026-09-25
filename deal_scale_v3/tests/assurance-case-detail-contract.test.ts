import { describe, expect, it } from "vitest";

import { FEATURE_FLAGS } from "../src/config/feature-flags";
import {
  ASSURANCE_CASE_DETAIL_IDENTIFIERS,
  getDispositionControlState,
  selectEvidenceId,
  sortEvidenceTimeline,
} from "../src/assurance-case-detail/contract";
import { ASSURANCE_CASE_DETAIL_PREVIEW } from "../src/assurance-case-detail/fixture";

const isUuidV4 = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

describe("DS3-S6.04 assurance case detail contracts", () => {
  it("uses UUID-v4 identifiers for the owned detail entities", () => {
    expect(Object.values(ASSURANCE_CASE_DETAIL_IDENTIFIERS).every(isUuidV4)).toBe(true);
  });

  it("orders evidence newest first and selects only known evidence", () => {
    const sorted = sortEvidenceTimeline(ASSURANCE_CASE_DETAIL_PREVIEW.evidence);
    expect(sorted[0].evidenceId).toBe("evidence-pricing-email");
    expect(selectEvidenceId(null, "evidence-pricing-email", sorted)).toBe(
      "evidence-pricing-email",
    );
    expect(selectEvidenceId("evidence-pricing-email", "missing", sorted)).toBeNull();
  });

  it("gates disposition controls by manager permission and feature flag", () => {
    expect(
      getDispositionControlState({
        role: "reviewer",
        flags: { [FEATURE_FLAGS.managerDisposition]: true },
      }),
    ).toEqual({ canEdit: false, reason: "role" });
    expect(
      getDispositionControlState({
        role: "manager",
        flags: { [FEATURE_FLAGS.managerDisposition]: false },
      }),
    ).toEqual({ canEdit: false, reason: "feature-flag" });
    expect(
      getDispositionControlState({
        role: "manager",
        flags: { [FEATURE_FLAGS.managerDisposition]: true },
      }),
    ).toEqual({ canEdit: true, reason: null });
  });

  it("preserves provenance and has no persistence adapter", () => {
    expect(ASSURANCE_CASE_DETAIL_PREVIEW.assuranceCase.provenanceRef).toContain(
      "detector://",
    );
    expect(ASSURANCE_CASE_DETAIL_PREVIEW.detector.sourceVersion).toBe("detector-v1");
    expect(ASSURANCE_CASE_DETAIL_PREVIEW.persistence).toBe("ui-only");
  });
});
