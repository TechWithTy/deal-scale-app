import { describe, expect, it } from "vitest";

import { AUDIT_RESULTS_PREVIEW, EVIDENCE_READINESS_PREVIEW } from "../src/assurance-surfaces/models";
import auditResultsFrontComponent from "../src/front-components/audit-results";
import evidenceReadinessFrontComponent from "../src/front-components/evidence-readiness";

describe("assurance surface UI contracts", () => {
  it("registers a dedicated Audit Results front component", () => {
    expect(auditResultsFrontComponent.config.name).toBe("audit-results");
    expect(auditResultsFrontComponent.config.component).toBeTypeOf("function");
    expect(AUDIT_RESULTS_PREVIEW.runLabel).toContain("assurance run");
    expect(AUDIT_RESULTS_PREVIEW.statusBreakdown).toMatchObject({
      pass: expect.any(Number),
      fail: expect.any(Number),
      needsReview: expect.any(Number),
    });
  });

  it("registers a dedicated Evidence Readiness front component", () => {
    expect(evidenceReadinessFrontComponent.config.name).toBe("evidence-readiness");
    expect(evidenceReadinessFrontComponent.config.component).toBeTypeOf("function");
    expect(EVIDENCE_READINESS_PREVIEW.readinessPercent).toBeGreaterThan(0);
    expect(EVIDENCE_READINESS_PREVIEW.sourceConnections).toHaveLength(3);
    expect(EVIDENCE_READINESS_PREVIEW.coverage.length).toBeGreaterThan(0);
  });

  it("keeps remediation rows local and read-only", () => {
    const actions = [
      ...AUDIT_RESULTS_PREVIEW.remediationActions,
      ...EVIDENCE_READINESS_PREVIEW.remediationActions,
    ];

    expect(actions.every((action) => action.id && action.owner && action.featureFlag)).toBe(true);
    expect(actions.every((action) => !Object.hasOwn(action, "endpoint"))).toBe(true);
    expect(actions.every((action) => !Object.hasOwn(action, "mutation"))).toBe(true);
  });
});
