export type PilotMetricName =
  | "sync_lag_ms" | "normalization_failure" | "identity_ambiguity"
  | "detector_latency_ms" | "detector_error" | "extraction_correction"
  | "evidence_completeness" | "case_review_latency_ms";

export type PilotMetricEvent = {
  name: PilotMetricName;
  workspaceId: string;
  traceId: string;
  occurredAt: string;
  value: number;
  dimensions?: Readonly<Record<string, string>>;
};

export type PilotMetricSink = { capture: (event: PilotMetricEvent) => void };

const allowedDimensionValues: Readonly<Record<string, readonly string[]>> = {
  source_type: ["crm", "api", "file", "warehouse"],
  stage: ["sync", "normalize", "detect", "review"],
  outcome: ["success", "failure", "ambiguous"],
};

export function validateOccurredAt(occurredAt: string): void {
  const date = new Date(occurredAt);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== occurredAt || date.getTime() > Date.now()) {
    throw new Error("occurredAt must be a non-future ISO timestamp");
  }
}

export function validateMetric(event: PilotMetricEvent): void {
  if (!event.workspaceId || !event.traceId) {
    throw new Error("workspaceId and traceId are required");
  }
  validateOccurredAt(event.occurredAt);
  if (!Number.isFinite(event.value)) {
    throw new Error("value must be finite");
  }
}

export function emitPilotMetric(event: PilotMetricEvent, sink: PilotMetricSink): void {
  validateMetric(event);
  const dimensions = Object.fromEntries(
    Object.entries(event.dimensions ?? {}).filter(([key, value]) =>
      allowedDimensionValues[key]?.includes(value),
    ),
  );
  sink.capture({
    name: event.name,
    workspaceId: event.workspaceId,
    traceId: event.traceId,
    occurredAt: event.occurredAt,
    value: event.value,
    ...(Object.keys(dimensions).length ? { dimensions } : {}),
  });
}

export function createFunnelEvent(input: {
  name: "audit_activated" | "case_review_started" | "case_review_completed";
  workspaceId: string;
  traceId: string;
  occurredAt: string;
}): { event: string; properties: Readonly<Record<string, string>> } {
  if (!input.workspaceId || !input.traceId) {
    throw new Error("workspaceId and traceId are required");
  }
  validateOccurredAt(input.occurredAt);
  return {
    event: input.name,
    properties: {
      workspace_id: input.workspaceId,
      trace_id: input.traceId,
      occurred_at: input.occurredAt,
    },
  };
}
