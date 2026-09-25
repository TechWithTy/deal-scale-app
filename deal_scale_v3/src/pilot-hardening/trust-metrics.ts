import { type PilotMetricEvent, type PilotMetricName, validateMetric } from "./observability";

export type TrustMetricSummary = {
  sampleSize: number;
  syncLagMs: number | null;
  detectorLatencyMs: number | null;
  detectorErrorRate: number | null;
  extractionCorrectionRate: number | null;
  evidenceCompleteness: number | null;
  caseReviewLatencyMs: number | null;
};

export function summarizeTrustMetrics(events: readonly PilotMetricEvent[]): TrustMetricSummary {
  const groups = new Map<PilotMetricName, number[]>();
  for (const event of events) {
    validateMetric(event);
    const values = groups.get(event.name) ?? [];
    values.push(event.value);
    groups.set(event.name, values);
  }

  const mean = (name: PilotMetricName): number | null => {
    const values = groups.get(name);
    return values?.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  };

  return {
    sampleSize: events.length,
    syncLagMs: mean("sync_lag_ms"),
    detectorLatencyMs: mean("detector_latency_ms"),
    detectorErrorRate: mean("detector_error"),
    extractionCorrectionRate: mean("extraction_correction"),
    evidenceCompleteness: mean("evidence_completeness"),
    caseReviewLatencyMs: mean("case_review_latency_ms"),
  };
}
