import { describe, expect, it } from "vitest";

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

  it("assembles a canonical open case with expected and actual provenance", () => {
    const result = assembleAssuranceCase(candidate(), {
      opportunityReferenceId: "opportunity-001",
      opportunityReferenceWorkspaceId: workspaceA,
      actualEvidence: [evidence()],
      observedAt: "2026-09-24T12:02:00.000Z",
    });

    expect(result.kind).toBe("case");
    if (result.kind !== "case") return;

    expect(result.case.caseStatus).toBe("open");
    expect(result.evidence.missing).toEqual([]);
    expect(result.case.expectedEvidence[0].provenanceRef).toBe("crm://call/call-001");
    expect(result.case.evidenceReferences[0].provenanceRef).toBe("crm://call/call-001");
    expect(result.case.sourceVersion).toBe("detector-v1");
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

  it("returns insufficient_evidence without creating a review case", () => {
    const result = assembleAssuranceCase(candidate(), {
      opportunityReferenceId: "opportunity-001",
      opportunityReferenceWorkspaceId: workspaceA,
      actualEvidence: [],
    });

    expect(result.kind).toBe("insufficient_evidence");
    if (result.kind !== "insufficient_evidence") return;

    expect(result.case).toBeUndefined();
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

    expect(result.kind).toBe("insufficient_evidence");
    if (result.kind !== "insufficient_evidence") return;

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

    const accepted = transitionAssuranceCase(assembled.case, "accepted", {
      actorId: "manager-001",
      occurredAt: "2026-09-24T12:03:00.000Z",
    });
    expect(accepted.ok).toBe(true);
    if (!accepted.ok) return;
    expect(accepted.case.caseStatus).toBe("accepted");
    expect(accepted.case.auditHistory).toHaveLength(2);
    expect(accepted.case.auditHistory[1].from).toBe("open");
    expect(accepted.case.auditHistory[1].to).toBe("accepted");
    expect(assembled.case.caseStatus).toBe("open");

    const invalid = transitionAssuranceCase(accepted.case, "open", {
      actorId: "manager-001",
      occurredAt: "2026-09-24T12:04:00.000Z",
    });
    expect(invalid).toEqual({
      ok: false,
      reason: "invalid_transition",
      from: "accepted",
      to: "open",
      allowed: ["closed"],
    });
  });

  it("uses the case observation time for deterministic default audit events", () => {
    const assembled = assembleAssuranceCase(candidate(), {
      opportunityReferenceId: "opportunity-001",
      opportunityReferenceWorkspaceId: workspaceA,
      actualEvidence: [evidence()],
      observedAt: "2026-09-24T12:02:00.000Z",
    });
    if (assembled.kind !== "case") throw new Error("expected case");

    const first = transitionAssuranceCase(assembled.case, "accepted", { actorId: "manager-001" });
    const second = transitionAssuranceCase(assembled.case, "accepted", { actorId: "manager-001" });

    expect(first).toEqual(second);
  });
});
