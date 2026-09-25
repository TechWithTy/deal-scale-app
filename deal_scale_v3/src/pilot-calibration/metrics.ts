import type { CalibrationMetrics, CalibrationRecord } from "./contracts";

const rate = (numerator: number, denominator: number) =>
  denominator === 0 ? null : numerator / denominator;

export const calculateCalibrationMetrics = (
  records: readonly CalibrationRecord[],
): CalibrationMetrics => {
  const truePositives = records.filter(({ label }) => label === "true_positive").length;
  const falsePositives = records.filter(({ label }) => label === "false_positive").length;
  const predictedPositives = truePositives + falsePositives;
  const insufficientEvidence = records.filter(({ label }) => label === "insufficient_evidence").length;
  const nativeSystemObvious = records.filter(({ nativeSystemObvious: obvious }) => obvious).length;

  return {
    sampleSize: records.length,
    precision: rate(truePositives, predictedPositives),
    falsePositiveRate: rate(falsePositives, predictedPositives),
    insufficientEvidenceRate: rate(insufficientEvidence, records.length),
    nativeSystemObviousRate: rate(nativeSystemObvious, records.length),
  };
};
