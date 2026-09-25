import { describe, expect, it } from "vitest";

import * as caseEngine from "../src/assurance/case-engine";
import {
  assembleAssuranceCase,
  assembleAssuranceCases,
  canonicalizeDetectorCandidate,
  dedupeDetectorCandidates,
  transitionAssuranceCase,
  type EvidenceObservationInput,
} from "../src/assurance/case-engine";

const workspaceA = "00000000-0000-4000-8000-000000000001";
const workspaceB = "00000000-0000-4000-8000-000000000002";

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

  it("applies only valid review transitions and appends audit history", () => {
    const assembled = assembleAssuranceCase(candidate(), {
      opportunityReferenceId: "opportunity-001",
      opportunityReferenceWorkspaceId: workspaceA,
      actualEvidence: [evidence()],
    });
    if (assembled.kind !== "case") throw new Error("expected case");

    const accepted = transitionAssuranceCase(assembled.case, "confirmed-failure" as never, {
      actorId: "manager-001",
      occurredAt: "2026-09-24T12:03:00.000Z",
      role: "manager",
    } as never);
    expect(accepted.ok).toBe(true);
    if (!accepted.ok) return;
    expect(accepted.case.caseStatus).toBe("confirmed-failure");
    expect(accepted.case.auditHistory).toHaveLength(2);
    expect(accepted.case.auditHistory[1].from).toBe("needs-review");
    expect(accepted.case.auditHistory[1].to).toBe("confirmed-failure");
    expect(assembled.case.caseStatus).toBe("needs-review");

    const invalid = transitionAssuranceCase(accepted.case, "needs-review" as never, {
      actorId: "manager-001",
      occurredAt: "2026-09-24T12:04:00.000Z",
      role: "manager",
    } as never);
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

    const transition = transitionAssuranceCase as unknown as (
      current: typeof assembled.case,
      to: string,
      options: { actorId: string; role: "reviewer" | "manager" },
    ) => unknown;

    expect(() =>
      transition(assembled.case, "confirmed-failure", {
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

    const caseDedupeKey = (caseEngine as typeof caseEngine & {
      caseDedupeKey?: (record: typeof first.case) => string;
    }).caseDedupeKey;
    expect(caseDedupeKey).toBeTypeOf("function");
    if (!caseDedupeKey) return;

    expect(caseDedupeKey(first.case)).toBe(
      `case:${workspaceA}:${first.case.detectorCandidateId}:opportunity-001`,
    );
  });

  it("uses the case observation time for deterministic default audit events", () => {
    const assembled = assembleAssuranceCase(candidate(), {
      opportunityReferenceId: "opportunity-001",
      opportunityReferenceWorkspaceId: workspaceA,
      actualEvidence: [evidence()],
      observedAt: "2026-09-24T12:02:00.000Z",
    });
    if (assembled.kind !== "case") throw new Error("expected case");

    const first = transitionAssuranceCase(assembled.case, "confirmed-failure" as never, {
      actorId: "manager-001",
      role: "manager",
    } as never);
    const second = transitionAssuranceCase(assembled.case, "confirmed-failure" as never, {
      actorId: "manager-001",
      role: "manager",
    } as never);

    expect(first).toEqual(second);
  });
});
