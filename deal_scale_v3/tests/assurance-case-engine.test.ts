import { describe, expect, it } from "vitest";

import {
  VALID_REVIEW_TRANSITIONS,
  assembleAssuranceCase,
  assembleAssuranceCases,
  canonicalizeDetectorCandidate,
  dedupeDetectorCandidates,
  transitionAssuranceCase,
  type EvidenceObservationInput,
} from "../src/assurance/case-engine";

const workspaceA = "00000000-0000-4000-8000-000000000001";
const workspaceB = "00000000-0000-4000-8000-000000000002";
const REQUESTED_CASE_STATUSES = [
  "needs-review",
  "confirmed-failure",
  "expected-behavior",
  "insufficient-evidence",
  "false-positive",
  "resolved",
  "outcome",
] as const;

type RuntimeCase = Parameters<typeof transitionAssuranceCase>[0];
type RuntimeTransitionResult = {
  ok: boolean;
  case?: RuntimeCase;
  reason?: string;
  from?: string;
  to?: string;
  allowed?: readonly string[];
};

const transitionAtRuntime = (
  current: RuntimeCase,
  to: string,
  options: { actorId: string; occurredAt?: string; role?: string },
) =>
  Reflect.apply(transitionAssuranceCase, undefined, [current, to, options]) as RuntimeTransitionResult;

const candidate = (overrides: Record<string, unknown> = {}) => ({
  name: "Pricing promise candidate",
  externalId: "candidate-001",
  workspaceId: workspaceA,
  provenanceState: "observed" as const,
  provenanceRef: "detector://pricing/v1/candidate-001",
  sourceVersion: "detector-v1",
  recordVersion: 1,
  observedAt: "2026-09-24T12:00:00.000Z",
  conformancePolicyId: "policy-001",
  eventId: "event-001",
  sellerEventId: "event-001",
  detectorType: "pricing-promise",
  confidence: 0.91,
  expectedEvidence: [
    {
      evidenceType: "call-transcript",
      provenanceRef: "crm://call/call-001",
      sourceVersion: "crm-v3",
    },
  ],
  sellerIdentityId: "seller-001",
  failureType: "process_sla_breach",
  expectedBehavior: "contact lead",
  actualBehavior: "contacted after deadline",
  exactDivergence: "deadline exceeded by 30 minutes",
  actor: "case-engine",
  system: "deal-scale",
  deadline: "2026-09-24T12:30:00.000Z",
  urgency: "high",
  recommendedHumanAction: "review owner follow-up",
  detectorVersion: "detector-v1",
  policyVersion: "v2",
  ...overrides,
});

const evidence = (overrides: Partial<EvidenceObservationInput> = {}): EvidenceObservationInput => ({
  name: "Call transcript",
  externalId: "evidence-001",
  workspaceId: workspaceA,
  provenanceState: "observed",
  provenanceRef: "crm://call/call-001",
  sourceVersion: "crm-v3",
  recordVersion: 1,
  observedAt: "2026-09-24T12:01:00.000Z",
  eventId: "event-001",
  evidenceType: "call-transcript",
  contentHash: "sha256:abc",
  ...overrides,
});

describe("assurance case engine", () => {
  it("canonicalizes candidates with deterministic UUID v4 ids", () => {
    const first = canonicalizeDetectorCandidate(candidate());
    const second = canonicalizeDetectorCandidate(candidate());

    expect(first).toEqual(second);
    expect(first.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(first.expectedEvidence).toHaveLength(1);
  });

  it("deduplicates deterministically inside a tenant without merging tenants", () => {
    const result = dedupeDetectorCandidates([
      candidate({ recordVersion: 1, confidence: 0.5 }),
      candidate({ recordVersion: 2, confidence: 0.9 }),
      candidate({ workspaceId: workspaceB, recordVersion: 1, confidence: 0.7 }),
    ]);
    const reversed = dedupeDetectorCandidates([
      candidate({ workspaceId: workspaceB, recordVersion: 1, confidence: 0.7 }),
      candidate({ recordVersion: 2, confidence: 0.9 }),
      candidate({ recordVersion: 1, confidence: 0.5 }),
    ]);

    expect(result).toEqual(reversed);
    expect(result.candidates).toHaveLength(2);
    expect(result.candidates.find((item) => item.workspaceId === workspaceA)?.confidence).toBe(0.9);
    expect(result.duplicates).toHaveLength(1);
  });

  it("uses a total tie-breaker for equal-rank candidates regardless of input order", () => {
    const candidateA = candidate({ id: "00000000-0000-4000-8000-000000000001" });
    const candidateB = candidate({ id: "00000000-0000-4000-8000-000000000002" });

    const forward = dedupeDetectorCandidates([candidateB, candidateA]);
    const reversed = dedupeDetectorCandidates([candidateA, candidateB]);

    expect(forward).toEqual(reversed);
    expect(forward.candidates[0].id).toBe(candidateA.id);
    expect(forward.duplicates.map((item) => item.id)).toEqual([candidateB.id]);
  });

  it("keeps dedupe keys distinct across workspace, candidate, and opportunity collisions", () => {
    const assembleCase = (
      candidateInput: ReturnType<typeof candidate>,
      opportunityReferenceId: string,
      opportunityReferenceWorkspaceId: string,
      evidenceWorkspaceId: string,
    ) => {
      const result = assembleAssuranceCase(candidateInput, {
        opportunityReferenceId,
        opportunityReferenceWorkspaceId,
        actualEvidence: [evidence({ workspaceId: evidenceWorkspaceId })],
      });
      if (result.kind !== "case") throw new Error("expected case");
      return result.case;
    };

    const base = assembleCase(candidate(), "opportunity-001", workspaceA, workspaceA);
    const workspaceVariant = assembleCase(
      candidate({ workspaceId: workspaceB }),
      "opportunity-001",
      workspaceB,
      workspaceB,
    );
    const candidateVariant = assembleCase(
      candidate({ externalId: "candidate-002" }),
      "opportunity-001",
      workspaceA,
      workspaceA,
    );
    const opportunityVariant = assembleCase(candidate(), "opportunity-002", workspaceA, workspaceA);

    for (const assuranceCase of [base, workspaceVariant, candidateVariant, opportunityVariant]) {
      expect(assuranceCase.dedupeKey).toBe(
        `case:${assuranceCase.workspaceId}:${assuranceCase.detectorCandidateId}:${assuranceCase.opportunityReferenceId}`,
      );
    }
    expect(new Set([base.dedupeKey, workspaceVariant.dedupeKey, candidateVariant.dedupeKey, opportunityVariant.dedupeKey]).size).toBe(4);
  });

  it("assembles a complete auditable case projection", () => {
    const result = assembleAssuranceCase(candidate(), {
      opportunityReferenceId: "opportunity-001",
      opportunityReferenceWorkspaceId: workspaceA,
      actualEvidence: [evidence()],
      observedAt: "2026-09-24T12:02:00.000Z",
    });

    expect(result.kind).toBe("case");
    if (result.kind !== "case") return;

    expect(result.case.caseStatus).toBe("needs-review");
    expect(result.evidence.missing).toEqual([]);
    expect(result.case.expectedEvidence[0].provenanceRef).toBe("crm://call/call-001");
    expect(result.case.evidenceReferences[0].provenanceRef).toBe("crm://call/call-001");
    expect(result.case.sourceVersion).toBe("detector-v1");
    expect(result.case).toMatchObject({
      sellerIdentityId: "seller-001",
      failureType: "process_sla_breach",
      expectedBehavior: "contact lead",
      actualBehavior: "contacted after deadline",
      exactDivergence: "deadline exceeded by 30 minutes",
      actor: "case-engine",
      system: "deal-scale",
      deadline: new Date("2026-09-24T12:30:00.000Z"),
      confidence: 0.91,
      urgency: "high",
      recommendedHumanAction: "review owner follow-up",
      detectorVersion: "detector-v1",
      policyVersion: "v2",
      dedupeKey: `case:${workspaceA}:${result.case.detectorCandidateId}:opportunity-001`,
    });
    for (const id of [result.case.id, result.case.evidenceReferences[0].id, result.case.auditHistory[0].id]) {
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    }
  });

  it("sorts evidence canonically and gives distinct stable identities to same-content records", () => {
    const firstEvidence = evidence({ externalId: "evidence-001", recordVersion: 1 });
    const sourceVersionVariant = evidence({ sourceVersion: "crm-v4", externalId: "evidence-001", recordVersion: 1 });
    const externalIdVariant = evidence({ sourceVersion: "crm-v3", externalId: "evidence-002", recordVersion: 1 });
    const recordVersionVariant = evidence({ sourceVersion: "crm-v3", externalId: "evidence-001", recordVersion: 2 });
    const options = {
      opportunityReferenceId: "opportunity-001",
      opportunityReferenceWorkspaceId: workspaceA,
      actualEvidence: [firstEvidence, sourceVersionVariant, externalIdVariant, recordVersionVariant],
    };

    const forward = assembleAssuranceCase(candidate(), options);
    const reversed = assembleAssuranceCase(candidate(), {
      ...options,
      actualEvidence: [recordVersionVariant, externalIdVariant, sourceVersionVariant, firstEvidence],
    });

    expect(forward.kind).toBe("case");
    expect(reversed.kind).toBe("case");
    if (forward.kind !== "case" || reversed.kind !== "case") return;

    expect(forward.case.evidenceReferences).toEqual(reversed.case.evidenceReferences);
    expect(
      forward.case.evidenceReferences.map(
        (item) => `${item.externalId}|${item.sourceVersion}|${item.recordVersion}`,
      ),
    ).toEqual([
      "evidence-001|crm-v3|1",
      "evidence-001|crm-v3|2",
      "evidence-001|crm-v4|1",
      "evidence-002|crm-v3|1",
    ]);
    expect(new Set(forward.case.evidenceReferences.map((item) => item.id)).size).toBe(4);
  });

  it("retains insufficient evidence as an auditable case state", () => {
    const result = assembleAssuranceCase(candidate(), {
      opportunityReferenceId: "opportunity-001",
      opportunityReferenceWorkspaceId: workspaceA,
      actualEvidence: [],
    });

    expect(result.kind).toBe("case");
    if (result.kind !== "case") return;

    expect(result.case.caseStatus).toBe("insufficient-evidence");
    expect(result.case.auditHistory[0].to).toBe("insufficient-evidence");
    expect(result.evidence.missing).toEqual([
      {
        evidenceType: "call-transcript",
        provenanceRef: "crm://call/call-001",
        sourceVersion: "crm-v3",
      },
    ]);
  });

  it("does not use cross-tenant evidence to satisfy a candidate", () => {
    const result = assembleAssuranceCase(candidate(), {
      opportunityReferenceId: "opportunity-001",
      opportunityReferenceWorkspaceId: workspaceA,
      actualEvidence: [evidence({ workspaceId: workspaceB })],
    });

    expect(result.kind).toBe("case");
    if (result.kind !== "case") return;

    expect(result.case.caseStatus).toBe("insufficient-evidence");
    expect(result.evidence.actual).toEqual([]);
    expect(result.evidence.excludedTenantEvidenceCount).toBe(1);
  });

  it("fails closed for a mixed-tenant batch sharing one opportunity reference", () => {
    expect(() =>
      assembleAssuranceCases(
        [candidate(), candidate({ workspaceId: workspaceB })],
        {
          opportunityReferenceId: "opportunity-001",
          opportunityReferenceWorkspaceId: workspaceA,
          actualEvidence: [evidence()],
        },
      ),
    ).toThrow("opportunityReferenceWorkspaceId");
  });

  it("rejects a foreign opportunity owner even when candidate evidence stays in its workspace", () => {
    expect(() =>
      assembleAssuranceCase(candidate(), {
        opportunityReferenceId: "opportunity-owned-by-workspace-b",
        opportunityReferenceWorkspaceId: workspaceB,
        actualEvidence: [evidence({ workspaceId: workspaceA })],
      }),
    ).toThrow("opportunityReferenceWorkspaceId");
  });

  it("defines a runtime transition contract entry for every requested case state", () => {
    const transitionTable = VALID_REVIEW_TRANSITIONS as unknown as Record<string, readonly string[]>;

    expect(Object.keys(transitionTable).sort()).toEqual([...REQUESTED_CASE_STATUSES].sort());
    for (const status of REQUESTED_CASE_STATUSES) {
      expect(transitionTable[status]).toEqual(expect.any(Array));
    }
  });

  it("applies only valid review transitions and appends audit history", () => {
    const assembled = assembleAssuranceCase(candidate(), {
      opportunityReferenceId: "opportunity-001",
      opportunityReferenceWorkspaceId: workspaceA,
      actualEvidence: [evidence()],
    });
    if (assembled.kind !== "case") throw new Error("expected case");

    const accepted = transitionAtRuntime(assembled.case, "confirmed-failure", {
      actorId: "manager-001",
      occurredAt: "2026-09-24T12:03:00.000Z",
      role: "manager",
    });
    expect(accepted.ok).toBe(true);
    if (!accepted.ok || !accepted.case) return;
    expect(accepted.case.caseStatus).toBe("confirmed-failure");
    expect(accepted.case.auditHistory).toHaveLength(2);
    expect(accepted.case.auditHistory[1].from).toBe("needs-review");
    expect(accepted.case.auditHistory[1].to).toBe("confirmed-failure");
    expect(assembled.case.caseStatus).toBe("needs-review");

    const invalid = transitionAtRuntime(accepted.case, "needs-review", {
      actorId: "manager-001",
      occurredAt: "2026-09-24T12:04:00.000Z",
      role: "manager",
    });
    expect(invalid).toEqual({
      ok: false,
      reason: "invalid_transition",
      from: "confirmed-failure",
      to: "needs-review",
      allowed: expect.any(Array),
    });
  });

  it("rejects an unauthorized transition actor", () => {
    const assembled = assembleAssuranceCase(candidate(), {
      opportunityReferenceId: "opportunity-001",
      opportunityReferenceWorkspaceId: workspaceA,
      actualEvidence: [evidence()],
    });
    if (assembled.kind !== "case") throw new Error("expected case");

    expect(() =>
      transitionAtRuntime(assembled.case, "confirmed-failure", {
        actorId: "viewer-001",
        role: "reviewer",
      }),
    ).toThrow("not authorized");
  });

  it("uses one scoped deterministic dedupe key and preserves audit history", () => {
    const first = assembleAssuranceCase(candidate(), {
      opportunityReferenceId: "opportunity-001",
      opportunityReferenceWorkspaceId: workspaceA,
      actualEvidence: [evidence()],
    });
    const second = assembleAssuranceCase(candidate(), {
      opportunityReferenceId: "opportunity-001",
      opportunityReferenceWorkspaceId: workspaceA,
      actualEvidence: [evidence()],
    });
    if (first.kind !== "case" || second.kind !== "case") throw new Error("expected case");

    expect(first).toEqual(second);
    expect(first.case.auditHistory).toMatchObject([
      {
        action: "assembled",
        actorId: "case-engine",
        from: null,
        to: "needs-review",
      },
    ]);

    expect(first.case.dedupeKey).toBe(
      `case:${workspaceA}:${first.case.detectorCandidateId}:opportunity-001`,
    );
  });

  it("appends ordered audit history with actors, observed timestamps, and UUID v4 ids", () => {
    const assembled = assembleAssuranceCase(candidate(), {
      opportunityReferenceId: "opportunity-001",
      opportunityReferenceWorkspaceId: workspaceA,
      actualEvidence: [evidence()],
      observedAt: "2026-09-24T12:02:00.000Z",
    });
    if (assembled.kind !== "case") throw new Error("expected case");

    const confirmed = transitionAtRuntime(assembled.case, "confirmed-failure", {
      actorId: "manager-001",
      occurredAt: "2026-09-24T12:03:00.000Z",
      role: "manager",
    });
    if (!confirmed.ok || !confirmed.case) throw new Error("expected confirmed-failure transition");

    const resolved = transitionAtRuntime(confirmed.case, "resolved", {
      actorId: "manager-002",
      occurredAt: "2026-09-24T12:04:00.000Z",
      role: "manager",
    });
    if (!resolved.ok || !resolved.case) throw new Error("expected resolved transition");

    const outcome = transitionAtRuntime(resolved.case, "outcome", {
      actorId: "system-001",
      occurredAt: "2026-09-24T12:05:00.000Z",
      role: "manager",
    });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok || !outcome.case) return;

    expect(outcome.case.auditHistory.map((event) => event.to)).toEqual([
      "needs-review",
      "confirmed-failure",
      "resolved",
      "outcome",
    ]);
    expect(outcome.case.auditHistory.map((event) => event.from)).toEqual([
      null,
      "needs-review",
      "confirmed-failure",
      "resolved",
    ]);
    expect(outcome.case.auditHistory.map((event) => event.actorId)).toEqual([
      "case-engine",
      "manager-001",
      "manager-002",
      "system-001",
    ]);
    expect(outcome.case.auditHistory.map((event) => event.occurredAt)).toEqual([
      new Date("2026-09-24T12:02:00.000Z"),
      new Date("2026-09-24T12:03:00.000Z"),
      new Date("2026-09-24T12:04:00.000Z"),
      new Date("2026-09-24T12:05:00.000Z"),
    ]);
    for (const event of outcome.case.auditHistory) {
      expect(event.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    }
    expect(assembled.case.auditHistory).toHaveLength(1);
    expect(outcome.case.auditHistory).toHaveLength(4);
  });

  it("uses the case observation time for deterministic default audit events", () => {
    const assembled = assembleAssuranceCase(candidate(), {
      opportunityReferenceId: "opportunity-001",
      opportunityReferenceWorkspaceId: workspaceA,
      actualEvidence: [evidence()],
      observedAt: "2026-09-24T12:02:00.000Z",
    });
    if (assembled.kind !== "case") throw new Error("expected case");

    const first = transitionAtRuntime(assembled.case, "confirmed-failure", {
      actorId: "manager-001",
      role: "manager",
    });
    const second = transitionAtRuntime(assembled.case, "confirmed-failure", {
      actorId: "manager-001",
      role: "manager",
    });

    expect(first).toEqual(second);
  });
});
