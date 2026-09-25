import type {
  CalibrationMetrics,
  FalsificationResult,
  FalsificationThresholds,
} from "./contracts";

export const evaluateFalsificationGates = (
  metrics: CalibrationMetrics,
  thresholds: FalsificationThresholds,
): FalsificationResult => {
  const failures: Array<FalsificationResult["failures"][number]> = [];
  const checks: readonly [keyof CalibrationMetrics, number | null, number, "minimum" | "maximum"][] = [
    ["precision", metrics.precision, thresholds.minimumPrecision, "minimum"],
    ["falsePositiveRate", metrics.falsePositiveRate, thresholds.maximumFalsePositiveRate, "maximum"],
    ["insufficientEvidenceRate", metrics.insufficientEvidenceRate, thresholds.maximumInsufficientEvidenceRate, "maximum"],
    ["nativeSystemObviousRate", metrics.nativeSystemObviousRate, thresholds.maximumNativeSystemObviousRate, "maximum"],
  ];

  for (const [metric, observed, threshold, direction] of checks) {
    const failed = observed === null || (direction === "minimum" ? observed < threshold : observed > threshold);
    if (failed) failures.push({ metric, observed, threshold });
  }

  const hasUnavailableMetric = failures.some(({ observed }) => observed === null);
  const nativeObviousExceeded = failures.some(({ metric }) => metric === "nativeSystemObviousRate" && metrics.nativeSystemObviousRate !== null);
  return {
    decision: hasUnavailableMetric || nativeObviousExceeded
      ? "pivot"
      : failures.length > 0
        ? "iterate"
        : "proceed",
    failures,
  };
};
