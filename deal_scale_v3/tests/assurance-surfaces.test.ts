import { describe, expect, it } from "vitest";

import { ASSURANCE_OBJECTS } from "../src/assurance/identifiers";
import { FEATURE_FLAGS } from "../src/config/feature-flags";
import {
  ASSURANCE_SURFACE_IDENTIFIERS,
  SURFACE_DEPENDENCIES,
} from "../src/assurance-surfaces/identifiers";
import {
  AUDIT_RESULTS_PREVIEW,
  EVIDENCE_READINESS_PREVIEW,
  calculateReadinessPercent,
  summarizeAuditRun,
} from "../src/assurance-surfaces/models";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("assurance surface models", () => {
  it("keeps the audit status breakdown internally consistent", () => {
    const summary = summarizeAuditRun({ pass: 11, fail: 3, needsReview: 2 });

    expect(summary.total).toBe(16);
    expect(summary.pass).toBe(11);
    expect(summary.fail).toBe(3);
    expect(summary.needsReview).toBe(2);
    expect(summary.pass + summary.fail + summary.needsReview).toBe(summary.total);
  });

  it("returns zero for empty readiness and rounds partial readiness", () => {
    expect(calculateReadinessPercent(0, 0)).toBe(0);
    expect(calculateReadinessPercent(3, 4)).toBe(75);
    expect(calculateReadinessPercent(5, 6)).toBe(83);
  });

  it("ships deterministic preview data for both required surfaces", () => {
    expect(AUDIT_RESULTS_PREVIEW.statusBreakdown.total).toBe(24);
    expect(AUDIT_RESULTS_PREVIEW.remediationActions.length).toBeGreaterThan(0);
    expect(EVIDENCE_READINESS_PREVIEW.readinessPercent).toBe(78);
    expect(EVIDENCE_READINESS_PREVIEW.provenanceGaps.length).toBeGreaterThan(0);
  });

  it("reuses assurance objects, existing flags, and existing review roles", () => {
    expect(SURFACE_DEPENDENCIES.audit.objectUniversalIdentifiers).toEqual(
      expect.arrayContaining([
        ASSURANCE_OBJECTS.assuranceCase,
        ASSURANCE_OBJECTS.detectorCandidate,
        ASSURANCE_OBJECTS.evidenceReference,
      ]),
    );
    expect(SURFACE_DEPENDENCIES.audit.featureFlag).toBe(FEATURE_FLAGS.detectorCandidates);
    expect(SURFACE_DEPENDENCIES.evidence.featureFlag).toBe(FEATURE_FLAGS.assuranceInbox);
    expect(SURFACE_DEPENDENCIES.audit.roleLabels).toEqual([
      "Assurance Reviewer",
      "Assurance Manager",
    ]);
  });

  it("uses valid UUID v4 identifiers for every owned surface entity", () => {
    for (const identifier of Object.values(ASSURANCE_SURFACE_IDENTIFIERS)) {
      expect(identifier).toMatch(UUID_V4);
    }
  });
});
