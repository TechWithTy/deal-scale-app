import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { FEATURE_FLAGS } from "../src/config/feature-flags";
import {
  ASSURANCE_CASE_DETAIL_IDENTIFIERS,
  getEvidenceDrawerState,
  getDispositionControlState,
  selectEvidenceId,
  sortEvidenceTimeline,
} from "../src/assurance-case-detail/contract";
import { ASSURANCE_CASE_DETAIL_PREVIEW } from "../src/assurance-case-detail/fixture";
import frontComponent, {
  AssuranceCaseDetail,
} from "../src/front-components/assurance-case-detail";
import pageLayout from "../src/page-layouts/assurance-case-detail.page-layout";

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

  it("renders the case, finding, evidence, provenance, and local disposition landmarks", () => {
    const markup = renderToStaticMarkup(createElement(AssuranceCaseDetail));

    expect(markup).toContain("Assurance case");
    expect(markup).toContain("Pricing promise review");
    expect(markup).toContain("Detector finding");
    expect(markup).toContain("Evidence timeline");
    expect(markup).toContain("Provenance");
    expect(markup).toContain("Disposition");
    expect(markup).toContain("Unsaved preview");
    expect(markup).not.toContain("CRM pipeline");
    expect(frontComponent.success).toBe(true);
  });

  it("wires the standalone layout widget to the detail component", () => {
    expect(pageLayout.success).toBe(true);
    expect(pageLayout.config.type).toBe("STANDALONE_PAGE");
    expect(pageLayout.config.tabs?.[0]?.widgets?.[0]?.configuration).toEqual({
      configurationType: "FRONT_COMPONENT",
      frontComponentUniversalIdentifier:
        ASSURANCE_CASE_DETAIL_IDENTIFIERS.frontComponent,
    });
  });

  it("keeps the evidence detail surface closed until an item is selected", () => {
    expect(getEvidenceDrawerState(null)).toBe("closed");
    expect(getEvidenceDrawerState("evidence-pricing-email")).toBe("open");
  });
});
