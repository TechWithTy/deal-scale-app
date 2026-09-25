import { describe, expect, it } from "vitest";

import { runSecurityChecklist } from "../src/pilot-hardening/security";
import { buildRetentionDeletionPlan } from "../src/pilot-hardening/retention";
import {
  createFunnelEvent,
  emitPilotMetric,
  type PilotMetricEvent,
  type PilotMetricName,
} from "../src/pilot-hardening/observability";
import { summarizeTrustMetrics } from "../src/pilot-hardening/trust-metrics";

const workspaceId = "00000000-0000-4000-8000-000000000001";
const otherWorkspaceId = "00000000-0000-4000-8000-000000000002";
const occurredAt = "2026-09-24T12:00:00.000Z";

const metric = (name: PilotMetricName, value: number): PilotMetricEvent => ({
  name,
  workspaceId,
  traceId: `trace-${name}`,
  occurredAt,
  value,
});

describe("pilot security and retention contracts", () => {
  it("credential_values_are_redacted", () => {
    const result = runSecurityChecklist({
      workspaceId,
      sourceConnectionId: "source-1",
      sourceWorkspaceId: workspaceId,
      connectionStatus: "revoked",
      credentialMetadata: {
        provider: "crm",
        accessToken: "secret-token",
        refreshToken: "refresh-secret",
      },
    });

    expect(JSON.stringify(result)).not.toContain("secret-token");
    expect(JSON.stringify(result)).not.toContain("refresh-secret");
    expect(result.findings.map(({ code }) => code)).toContain("credential_redacted");
    expect(result.passed).toBe(false);
  });

  it("rejects a source from another workspace", () => {
    expect(() =>
      runSecurityChecklist({
        workspaceId,
        sourceConnectionId: "source-1",
        sourceWorkspaceId: otherWorkspaceId,
        connectionStatus: "connected",
        credentialMetadata: { provider: "crm" },
      }),
    ).toThrow("workspace");
  });

  it("retention_plan_is_tenant_scoped_and_repeatable", () => {
    const input = { workspaceId, sourceConnectionId: "source-1", requestedAt: occurredAt };
    const first = buildRetentionDeletionPlan(input);
    const second = buildRetentionDeletionPlan(input);

    expect(second).toEqual(first);
    expect(first.planId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(first.targets.map(({ resource }) => resource)).toEqual([
      "sourceConnection",
      "evidenceReference",
      "detectorCandidate",
      "assuranceCase",
      "event",
      "telemetry",
    ]);
    expect(first.targets.every((target) => target.workspaceId === workspaceId)).toBe(true);
    expect(first.targets.every((target) => target.sourceConnectionId === "source-1")).toBe(true);
    expect(buildRetentionDeletionPlan({ ...input, workspaceId: otherWorkspaceId }).planId).not.toBe(
      first.planId,
    );
    expect(buildRetentionDeletionPlan({ ...input, requestedAt: "2026-09-24T13:00:00.000Z" }).planId).toBe(
      first.planId,
    );
    expect(() => buildRetentionDeletionPlan({ ...input, requestedAt: "2999-01-01T00:00:00.000Z" })).toThrow(
      "requestedAt",
    );
  });
});

describe("pilot observability and trust metrics", () => {
  it("observability_rejects_invalid_timestamps", () => {
    expect(() => emitPilotMetric({ ...metric("sync_lag_ms", 12), occurredAt: "not-a-date" }, {
      capture: () => undefined,
    })).toThrow("occurredAt");
    expect(() => emitPilotMetric({ ...metric("sync_lag_ms", 12), occurredAt: "2999-01-01T00:00:00.000Z" }, {
      capture: () => undefined,
    })).toThrow("occurredAt");
  });

  it("rejects non-finite values", () => {
    expect(() => emitPilotMetric(metric("sync_lag_ms", Number.NaN), {
      capture: () => undefined,
    })).toThrow("value");
  });

  it("keeps identities and safe dimensions while dropping credentials", () => {
    let captured: PilotMetricEvent | undefined;
    emitPilotMetric({
      ...metric("sync_lag_ms", 12),
      dimensions: { source_type: "crm", accessToken: "secret-token", arbitrary: "secret" },
    }, { capture: (event) => { captured = event; } });

    expect(captured).toEqual({
      ...metric("sync_lag_ms", 12),
      dimensions: { source_type: "crm" },
    });
    expect(JSON.stringify(captured)).not.toContain("secret-token");
  });

  it("summarizes trust metrics with relevant event denominators", () => {
    const summary = summarizeTrustMetrics([
      metric("sync_lag_ms", 10),
      metric("sync_lag_ms", 30),
      metric("detector_latency_ms", 120),
      metric("detector_error", 0),
      metric("detector_error", 1),
      metric("evidence_completeness", 0.75),
      metric("extraction_correction", 1),
      metric("extraction_correction", 0),
      metric("case_review_latency_ms", 240),
    ]);

    expect(summary).toEqual({
      sampleSize: 9,
      syncLagMs: 20,
      detectorLatencyMs: 120,
      detectorErrorRate: 0.5,
      extractionCorrectionRate: 0.5,
      evidenceCompleteness: 0.75,
      caseReviewLatencyMs: 240,
    });
  });

  it("uses null when a metric has no samples", () => {
    expect(summarizeTrustMetrics([])).toEqual({
      sampleSize: 0,
      syncLagMs: null,
      detectorLatencyMs: null,
      detectorErrorRate: null,
      extractionCorrectionRate: null,
      evidenceCompleteness: null,
      caseReviewLatencyMs: null,
    });
  });

  it("creates the bounded funnel event with trace identity", () => {
    expect(createFunnelEvent({ name: "case_review_completed", workspaceId, traceId: "trace-1", occurredAt })).toEqual({
      event: "case_review_completed",
      properties: { workspace_id: workspaceId, trace_id: "trace-1", occurred_at: occurredAt },
    });
  });
});
