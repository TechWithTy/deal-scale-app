import { describe, expect, it } from "vitest";

import {
  buildCalibrationReport,
  calculateCalibrationMetrics,
  evaluateFalsificationGates,
  runGoldenCalibrationPack,
  type CalibrationRecord,
} from "../src/pilot-calibration";

const scenario = (overrides: Partial<CalibrationRecord> = {}): CalibrationRecord => ({
  tenantId: "tenant-a",
  caseId: "case-default",
  label: "true_positive",
  predictedFinding: true,
  readiness: "ready",
  nativeSystemObvious: false,
  evidenceIds: ["evidence-1"],
  ...overrides,
});

describe("pilot calibration metrics", () => {
  it("calibration_metrics_define_zero_sample_behavior", () => {
    expect(calculateCalibrationMetrics([])).toEqual({
      sampleSize: 0,
      precision: null,
      falsePositiveRate: null,
      insufficientEvidenceRate: null,
      nativeSystemObviousRate: null,
    });
  });

  it("calculates label and trust rates with explicit denominators", () => {
    expect(calculateCalibrationMetrics([
      scenario({ caseId: "a", label: "true_positive" }),
      scenario({ caseId: "b", label: "false_positive", predictedFinding: true }),
      scenario({ caseId: "c", label: "insufficient_evidence", readiness: "insufficient_evidence" }),
      scenario({ caseId: "d", label: "native_system_obvious", nativeSystemObvious: true }),
    ])).toEqual({
      sampleSize: 4,
      precision: 0.5,
      falsePositiveRate: 0.5,
      insufficientEvidenceRate: 0.25,
      nativeSystemObviousRate: 0.25,
    });
  });
});

describe("golden calibration pack", () => {
  it("golden_pack_surfaces_missing_evidence_and_tenant_mixing", () => {
    const result = runGoldenCalibrationPack([
      scenario({ caseId: "case-ready", label: "true_positive", readiness: "ready" }),
      scenario({ caseId: "case-missing", label: "insufficient_evidence", readiness: "insufficient_evidence" }),
      scenario({ caseId: "case-foreign", tenantId: "tenant-b", label: "true_positive" }),
    ], { tenantId: "tenant-a" });

    expect(result.acceptedCaseIds).toEqual(["case-ready"]);
    expect(result.rejectedCaseIds).toEqual(["case-missing", "case-foreign"]);
    expect(result.rejectionReasons).toEqual(expect.arrayContaining([
      expect.objectContaining({ caseId: "case-missing", code: "insufficient_evidence" }),
      expect.objectContaining({ caseId: "case-foreign", code: "tenant_mismatch" }),
    ]));
  });

  it("keeps accepted records tenant-safe and deterministically ordered", () => {
    const result = runGoldenCalibrationPack([
      scenario({ caseId: "case-z" }),
      scenario({ caseId: "case-a" }),
    ], { tenantId: "tenant-a" });

    expect(result.records.map(({ caseId }) => caseId)).toEqual(["case-a", "case-z"]);
    expect(result.records.every(({ tenantId }) => tenantId === "tenant-a")).toBe(true);
  });
});

describe("falsification gates and reports", () => {
  it("uses proceed at inclusive threshold boundaries", () => {
    const metrics = {
      sampleSize: 4,
      precision: 0.8,
      falsePositiveRate: 0.2,
      insufficientEvidenceRate: 0.1,
      nativeSystemObviousRate: 0.05,
    } as const;

    expect(evaluateFalsificationGates(metrics, {
      minimumPrecision: 0.8,
      maximumFalsePositiveRate: 0.2,
      maximumInsufficientEvidenceRate: 0.1,
      maximumNativeSystemObviousRate: 0.05,
    })).toEqual({ decision: "proceed", failures: [] });
  });

  it("pivots when required denominators are unavailable and iterates on measurable failures", () => {
    const result = evaluateFalsificationGates({
      sampleSize: 0,
      precision: null,
      falsePositiveRate: null,
      insufficientEvidenceRate: null,
      nativeSystemObviousRate: null,
    }, {
      minimumPrecision: 0.8,
      maximumFalsePositiveRate: 0.2,
      maximumInsufficientEvidenceRate: 0.1,
      maximumNativeSystemObviousRate: 0.05,
    });

    expect(result.decision).toBe("pivot");
    expect(result.failures).toHaveLength(4);
  });

  it("builds a report without unsupported revenue attribution", () => {
    const goldenPack = runGoldenCalibrationPack([scenario({ caseId: "case-1" })], { tenantId: "tenant-a" });
    const metrics = calculateCalibrationMetrics(goldenPack.records);
    const falsification = evaluateFalsificationGates(metrics, {
      minimumPrecision: 0.8,
      maximumFalsePositiveRate: 0.2,
      maximumInsufficientEvidenceRate: 0.1,
      maximumNativeSystemObviousRate: 0.05,
    });

    expect(buildCalibrationReport({
      tenantId: "tenant-a",
      generatedAt: "2026-09-24T12:00:00.000Z",
      metrics,
      falsification,
      goldenPack,
    })).toEqual(expect.objectContaining({
      tenantId: "tenant-a",
      unsupportedClaims: ["recovered revenue requires supported outcome evidence"],
    }));
  });
});
