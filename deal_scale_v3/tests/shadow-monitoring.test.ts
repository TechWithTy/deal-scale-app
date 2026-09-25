import { describe, expect, it, vi } from "vitest";

import {
  calculateShadowPriority,
  createAtomicCaseUpsert,
  runShadowMonitoring,
  runLiveShadowMonitoring,
  type ShadowDetector,
  type ShadowEvidence,
} from "../src/shadow-monitoring";

const workspaceId = "00000000-0000-4000-8000-000000000001";
const opportunityReferenceId = "opp-001";

const evidence = (id: string, evidenceType: string): ShadowEvidence => ({
  id,
  workspaceId,
  opportunityReferenceId,
  evidenceType,
  contentHash: `hash-${id}`,
  observedAt: "2026-09-24T12:00:00.000Z",
});

const detector = (
  evaluate: ShadowDetector["evaluate"],
  overrides: Partial<ShadowDetector> = {},
): ShadowDetector => ({
  detectorType: "promise-shadow",
  detectorVersion: "promise-shadow.v1",
  evidenceTypes: ["email"],
  maxEvidencePerEvaluation: 2,
  evaluate,
  ...overrides,
});

describe("live shadow monitoring", () => {
  it("evaluates only detectors triggered by changed evidence and bounds their evidence input", async () => {
    const evaluate = vi.fn(async () => [
      {
        findingKey: "promise-001",
        summary: "Promise requires review",
        severity: 0.8,
        urgency: 0.7,
        evidenceCompleteness: 1,
        evidenceIds: ["email-1"],
      },
    ]);
    const unrelatedEvaluate = vi.fn(async () => []);

    const result = await runShadowMonitoring({
      workspaceId,
      changedEvidence: [evidence("email-1", "email")],
      evidence: [
        evidence("email-1", "email"),
        evidence("email-2", "email"),
        evidence("email-3", "email"),
        evidence("call-1", "call_recording"),
      ],
      detectors: [
        detector(evaluate),
        detector(unrelatedEvaluate, {
          detectorType: "call-shadow",
          evidenceTypes: ["call_recording"],
        }),
      ],
    });

    expect(evaluate).toHaveBeenCalledOnce();
    expect(evaluate.mock.calls[0][0].changedEvidence.map((item) => item.id)).toEqual(["email-1"]);
    expect(evaluate.mock.calls[0][0].evidence).toHaveLength(2);
    expect(evaluate.mock.calls[0][0].evidence.every((item) => item.evidenceType === "email")).toBe(
      true,
    );
    expect(unrelatedEvaluate).not.toHaveBeenCalled();
    expect(result.createdCases).toHaveLength(1);
  });

  it("does not create a duplicate case when the same finding is evaluated again", async () => {
    const evaluate = vi.fn(async () => [
      {
        findingKey: "promise-001",
        summary: "Promise requires review",
        severity: 0.8,
        urgency: 0.7,
        evidenceCompleteness: 1,
        evidenceIds: ["email-1"],
      },
    ]);
    const input = {
      workspaceId,
      changedEvidence: [evidence("email-1", "email")],
      evidence: [evidence("email-1", "email")],
      detectors: [detector(evaluate)],
    };

    const firstRun = await runShadowMonitoring(input);
    const secondRun = await runShadowMonitoring({
      ...input,
      existingCases: firstRun.createdCases,
    });

    expect(firstRun.createdCases).toHaveLength(1);
    expect(secondRun.createdCases).toHaveLength(0);
    expect(secondRun.duplicateCaseKeys).toEqual([firstRun.createdCases[0].dedupeKey]);
  });

  it("prioritizes severity, urgency, and evidence completeness together", () => {
    const priority = calculateShadowPriority({
      severity: 0.9,
      urgency: 0.6,
      evidenceCompleteness: 0.3,
    });

    expect(priority.score).toBe(60);
    expect(priority.band).toBe("high");
    expect(
      calculateShadowPriority({ severity: 0.9, urgency: 0.9, evidenceCompleteness: 0.9 }).score,
    ).toBeGreaterThan(priority.score);
  });

  it("keeps detector evaluations scoped to one opportunity and skips insufficient detectors", async () => {
    const evaluate = vi.fn(async (context) => [
      {
        findingKey: `finding-${context.evidence[0]?.opportunityReferenceId}`,
        summary: "Promise requires review",
        severity: 0.8,
        urgency: 0.7,
        evidenceCompleteness: 1,
        evidenceIds: [context.evidence[0].id],
      },
    ]);

    const result = await runShadowMonitoring({
      workspaceId,
      changedEvidence: [evidence("email-1", "email"), { ...evidence("email-2", "email"), opportunityReferenceId: "opp-002" }],
      evidence: [
        evidence("email-1", "email"),
        { ...evidence("email-2", "email"), opportunityReferenceId: "opp-002" },
      ],
      detectors: [detector(evaluate), detector(vi.fn(async () => []), { detectorType: "blocked", readinessStatus: "insufficient_evidence" })],
    });

    expect(evaluate).toHaveBeenCalledTimes(2);
    expect(evaluate.mock.calls.map(([context]) => context.evidence.map((item) => item.opportunityReferenceId))).toEqual([
      ["opp-001"],
      ["opp-002"],
    ]);
    expect(result.createdCases).toHaveLength(2);
    expect(result.skippedDetectorTypes).toEqual(["blocked"]);
  });

  it("uses an atomic live upsert instead of caller-supplied existing cases", async () => {
    const upsertCase = vi.fn(async () => "duplicate" as const);
    const result = await runLiveShadowMonitoring({
      workspaceId,
      store: {
        loadChangedEvidence: vi.fn(async () => [evidence("email-1", "email")]),
        loadEvidence: vi.fn(async () => [evidence("email-1", "email")]),
        loadDetectors: vi.fn(async () => [detector(async () => [{
          findingKey: "promise-001",
          summary: "Promise requires review",
          severity: 0.8,
          urgency: 0.7,
          evidenceCompleteness: 1,
          evidenceIds: ["email-1"],
        }])]),
        upsertCase,
      },
    });

    expect(upsertCase).toHaveBeenCalledOnce();
    expect(result.createdCases).toEqual([]);
    expect(result.duplicateCaseKeys).toHaveLength(1);
  });

  it("rejects invalid and future evidence timestamps", async () => {
    await expect(runShadowMonitoring({
      workspaceId,
      changedEvidence: [{ ...evidence("bad", "email"), observedAt: "not-a-date" }],
      evidence: [],
      detectors: [],
    })).rejects.toThrow("observedAt");
    await expect(runShadowMonitoring({
      workspaceId,
      changedEvidence: [{ ...evidence("future", "email"), observedAt: "2999-01-01T00:00:00.000Z" }],
      evidence: [],
      detectors: [],
    })).rejects.toThrow("observedAt");
  });

  it("propagates degraded readiness into detector context and created cases", async () => {
    let readinessStatus: string | undefined;
    const result = await runShadowMonitoring({
      workspaceId,
      changedEvidence: [evidence("email-1", "email")],
      evidence: [evidence("email-1", "email")],
      detectors: [detector(async (context) => {
        readinessStatus = context.readinessStatus;
        return [{
          findingKey: "degraded-finding",
          summary: "Review with degraded evidence",
          severity: 0.8,
          urgency: 0.7,
          evidenceCompleteness: 0.5,
          evidenceIds: ["email-1"],
        }];
      }, { readinessStatus: "degraded" })],
    });

    expect(readinessStatus).toBe("degraded");
    expect(result.createdCases[0].readinessStatus).toBe("degraded");
  });

  it("enforces one created result for concurrent duplicate upserts", async () => {
    const upsert = createAtomicCaseUpsert();
    const candidate = {
      id: "case-1",
      dedupeKey: "workspace|opportunity|detector|v1|finding",
      workspaceId,
      opportunityReferenceId,
      detectorType: "promise-shadow",
      detectorVersion: "promise-shadow.v1",
      findingKey: "finding",
      summary: "Review",
      evidenceIds: ["email-1"],
      readinessStatus: "ready" as const,
      priority: calculateShadowPriority({ severity: 0.5, urgency: 0.5, evidenceCompleteness: 1 }),
    };

    await expect(Promise.all([upsert(candidate), upsert(candidate)])).resolves.toEqual(["created", "duplicate"]);
  });
});
