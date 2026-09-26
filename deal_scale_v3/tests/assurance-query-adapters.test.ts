import { describe, expect, expectTypeOf, it } from "vitest";

import {
  assuranceCaseSchema,
  conformancePolicySchema,
  detectorCandidateSchema,
  eventSchema,
  evidenceReferenceSchema,
  managerDispositionSchema,
  opportunityReferenceSchema,
  outcomeSchema,
  promiseSchema,
  sellerIdentitySchema,
} from "../src/assurance/schema";
import type { AssuranceQueryResult, AssuranceScope } from "../src/assurance-query/contracts";
import {
  adaptAssuranceCases,
  adaptConformancePolicies,
  adaptDetectorCandidates,
  adaptEvents,
  adaptEvidenceReferences,
  adaptManagerDispositions,
  adaptOpportunityReferences,
  adaptOutcomes,
  adaptPromises,
  adaptReadinessCoverage,
  adaptSellerIdentities,
} from "../src/assurance-query/adapters";
import type { AssuranceCaseViewModel, ReadinessCoverageViewModel } from "../src/assurance-query/view-models";
import type { EvidenceReadinessScorecard } from "../src/evidence/readiness";

const workspaceId = "00000000-0000-4000-8000-000000000001";
const otherWorkspaceId = "00000000-0000-4000-8000-000000000002";
const scope: AssuranceScope = { actorWorkspaceId: workspaceId, role: "reviewer" };
const base = {
  name: "Readable label",
  externalId: "secret-external-id",
  workspaceId,
  provenanceState: "observed",
  provenanceRef: "secret://credential/token",
  sourceVersion: "private-source-version",
  recordVersion: 1,
  observedAt: "2026-09-24T12:00:00.000Z",
} as const;

const caseRecord = assuranceCaseSchema.parse({
  ...base, opportunityReferenceId: "secret-opportunity", detectorCandidateId: "secret-detector", caseStatus: "open",
});
const detector = detectorCandidateSchema.parse({
  ...base, provenanceState: "inferred", conformancePolicyId: "secret-policy", sellerEventId: null,
  detectorType: "broken_commitment", confidence: 0.95,
});
const evidence = evidenceReferenceSchema.parse({
  ...base, assuranceCaseId: "secret-case", sellerEventId: "secret-event",
  evidenceType: "email", contentHash: "secret-content-hash",
});
const seller = sellerIdentitySchema.parse({
  ...base, sourceConnectionId: "secret-connection", sellerExternalId: "secret-seller", displayName: "Jordan Lee",
});
const opportunity = opportunityReferenceSchema.parse({
  ...base, sellerIdentityId: "secret-seller", sourceConnectionId: "secret-connection",
  opportunityExternalId: "secret-opportunity", stage: "proposal",
});
const event = eventSchema.parse({
  ...base, opportunityReferenceId: "secret-opportunity", eventType: "email_sent",
  occurredAt: "2026-09-24T11:00:00.000Z",
});
const promise = promiseSchema.parse({
  ...base, opportunityReferenceId: "secret-opportunity", promiseType: "send_pricing",
  dueAt: "2026-09-25T11:00:00.000Z",
});
const policy = conformancePolicySchema.parse({
  ...base, policyVersion: "v3", policyStatus: "active", ruleSet: { token: "secret-rule" },
});
const disposition = managerDispositionSchema.parse({
  ...base, assuranceCaseId: "secret-case", disposition: "confirm", decidedBy: "secret-manager-id",
});
const outcome = outcomeSchema.parse({
  ...base, assuranceCaseId: "secret-case", managerDispositionId: "secret-disposition",
  outcomeType: "reviewed", outcomeAt: "2026-09-24T13:00:00.000Z",
});

const scorecard: EvidenceReadinessScorecard = {
  tenantId: workspaceId,
  asOf: "2026-09-24T12:00:00.000Z",
  overallScore: 50,
  overallStatus: "insufficient_evidence",
  connectedEvidenceTypes: ["crm_record"],
  warnings: [{ code: "missing_evidence_type", detectorType: "broken_commitment", evidenceType: "email", message: "secret-source-id has no email" }],
  sources: [{ sourceId: "secret-source-id", provider: "private-provider", evidenceTypes: ["crm_record"], connectedEvidenceTypes: ["crm_record"], syncFreshness: "fresh", transcriptAvailability: "unknown", sourceAvailability: "available", score: 80, warnings: [] }],
  detectors: [{ detectorType: "broken_commitment", score: 50, status: "insufficient_evidence", connectedEvidenceTypes: ["crm_record"], freshEvidenceTypes: ["crm_record"], missingEvidenceTypes: ["email"], transcriptAvailable: false, sourceAvailable: false, warnings: [], coverageGaps: [{ code: "missing_evidence_type", detectorType: "broken_commitment", evidenceType: "email", message: "secret-source-id has no email" }] }],
};

describe("scoped assurance adapters", () => {
  it("maps every canonical domain into a typed query result", () => {
    expectTypeOf<ReturnType<typeof adaptAssuranceCases>>().toEqualTypeOf<AssuranceQueryResult<AssuranceCaseViewModel>>();
    expectTypeOf<ReturnType<typeof adaptReadinessCoverage>>().toEqualTypeOf<AssuranceQueryResult<ReadinessCoverageViewModel>>();
    const domains = [
      ["assuranceCase", () => adaptAssuranceCases([caseRecord], scope), "caseStatus"],
      ["detectorCandidate", () => adaptDetectorCandidates([detector], scope), "detectorType"],
      ["evidenceReference", () => adaptEvidenceReferences([evidence], scope), "evidenceType"],
      ["sellerIdentity", () => adaptSellerIdentities([seller], scope), "displayName"],
      ["opportunityReference", () => adaptOpportunityReferences([opportunity], scope), "stage"],
      ["event", () => adaptEvents([event], scope), "eventType"],
      ["promise", () => adaptPromises([promise], scope), "promiseType"],
      ["conformancePolicy", () => adaptConformancePolicies([policy], scope), "policyStatus"],
      ["managerDisposition", () => adaptManagerDispositions([disposition], scope), "disposition"],
      ["outcome", () => adaptOutcomes([outcome], scope), "outcomeType"],
    ] as const;
    for (const [kind, adapt, domainField] of domains) {
      const result = adapt();
      expect(result.state).toBe("success");
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({ kind, name: "Readable label", provenanceState: expect.any(String), [domainField]: expect.anything() });
    }
  });

  it("redacts internal fields in every domain, including nested policy rules", () => {
    const models = [
      adaptAssuranceCases([caseRecord], scope), adaptDetectorCandidates([detector], scope),
      adaptEvidenceReferences([evidence], scope), adaptSellerIdentities([seller], scope),
      adaptOpportunityReferences([opportunity], scope), adaptEvents([event], scope),
      adaptPromises([promise], scope), adaptConformancePolicies([policy], scope),
      adaptManagerDispositions([disposition], scope), adaptOutcomes([outcome], scope),
    ];
    const serialized = JSON.stringify(models);
    for (const secret of [workspaceId, "secret-external-id", "secret://credential/token", "secret-", "private-source-version"]) {
      expect(serialized).not.toContain(secret);
    }
  });

  it("retains provenance and distinguishes expected promises, unassessed fulfillment, and confirmed review", () => {
    expect(adaptDetectorCandidates([detector], scope).items[0]).toMatchObject({ provenanceState: "inferred", confidence: 0.95 });
    expect(adaptEvidenceReferences([evidence, { ...evidence, name: "Inference", provenanceState: "inferred" }], scope).items).toMatchObject([
      { provenanceState: "observed" }, { provenanceState: "inferred" },
    ]);
    expect(adaptPromises([promise], scope).items[0]).toMatchObject({ expectationState: "expected", fulfillmentEvidenceState: "unassessed" });
    expect(adaptManagerDispositions([disposition], scope).items[0]).toMatchObject({ confirmationState: "confirmed" });
    expect(adaptManagerDispositions([{ ...disposition, provenanceState: "inferred" }], scope).items[0]).toMatchObject({ confirmationState: "inferred" });
    expect(adaptOutcomes([{ ...outcome, provenanceState: "inferred" }], scope).items[0]).toMatchObject({ provenanceState: "inferred" });
  });

  it("does not share projected dates with canonical records", () => {
    const datePairs: [Date, Date][] = [
      [caseRecord.observedAt, adaptAssuranceCases([caseRecord], scope).items[0].observedAt],
      [detector.observedAt, adaptDetectorCandidates([detector], scope).items[0].observedAt],
      [evidence.observedAt, adaptEvidenceReferences([evidence], scope).items[0].observedAt],
      [seller.observedAt, adaptSellerIdentities([seller], scope).items[0].observedAt],
      [opportunity.observedAt, adaptOpportunityReferences([opportunity], scope).items[0].observedAt],
      [event.observedAt, adaptEvents([event], scope).items[0].observedAt],
      [promise.observedAt, adaptPromises([promise], scope).items[0].observedAt],
      [policy.observedAt, adaptConformancePolicies([policy], scope).items[0].observedAt],
      [disposition.observedAt, adaptManagerDispositions([disposition], scope).items[0].observedAt],
      [outcome.observedAt, adaptOutcomes([outcome], scope).items[0].observedAt],
      [event.occurredAt, adaptEvents([event], scope).items[0].occurredAt],
      [promise.dueAt!, adaptPromises([promise], scope).items[0].dueAt!],
      [outcome.outcomeAt, adaptOutcomes([outcome], scope).items[0].outcomeAt],
    ];
    for (const [source, projected] of datePairs) {
      const originalTime = source.getTime();
      expect(projected).not.toBe(source);
      expect(projected.getTime()).toBe(originalTime);
      projected.setTime(originalTime + 60_000);
      expect(source.getTime()).toBe(originalTime);
    }
    expect(adaptPromises([{ ...promise, dueAt: null }], scope).items[0].dueAt).toBeNull();
  });

  it("enforces object-specific RBAC and workspace scope before projecting", () => {
    const foreign = { ...caseRecord, workspaceId: otherWorkspaceId };
    expect(adaptAssuranceCases([foreign], scope)).toEqual({ state: "empty", items: [], nextCursor: null });
    expect(adaptAssuranceCases([caseRecord], { ...scope, role: "evidenceIntegration" })).toEqual({ state: "empty", items: [], nextCursor: null });
    expect(adaptEvents([event], { ...scope, role: "evidenceIntegration" }).state).toBe("success");
    expect(adaptEvents([{ ...event, workspaceId: otherWorkspaceId }], { ...scope, role: "evidenceIntegration" }).state).toBe("empty");
  });

  it("projects readiness gaps without source identifiers or warning messages", () => {
    const result = adaptReadinessCoverage([scorecard], scope);
    expect(result.items[0]).toMatchObject({
      overallStatus: "insufficient_evidence", overallScore: 50,
      detectors: [{ detectorType: "broken_commitment", status: "insufficient_evidence", missingEvidenceTypes: ["email"], coverageGaps: [{ code: "missing_evidence_type", evidenceType: "email" }] }],
    });
    expect(JSON.stringify(result)).not.toMatch(/secret-source-id|private-provider|tenantId|workspaceId|message/);
    expect(adaptReadinessCoverage([{ ...scorecard, tenantId: otherWorkspaceId }], scope).state).toBe("empty");
    expect(adaptReadinessCoverage([scorecard], { ...scope, role: "evidenceIntegration" }).state).toBe("empty");
    expect(adaptReadinessCoverage([scorecard], { ...scope, actorWorkspaceId: "" }).state).toBe("error");
    expect(adaptReadinessCoverage([], scope).state).toBe("empty");
  });

  it("reports missing detector coverage even when no detector rows exist", () => {
    const uncovered: EvidenceReadinessScorecard = {
      ...scorecard,
      detectors: [],
      warnings: [{ code: "no_detector_coverage", detectorType: "readiness", message: "secret-source-id lacks configuration" }],
    };
    const result = adaptReadinessCoverage([uncovered], scope);
    expect(result.items[0]).toMatchObject({
      overallStatus: "insufficient_evidence",
      detectors: [],
      coverageGaps: [{ code: "no_detector_coverage", detectorType: "readiness" }],
    });
    expect(JSON.stringify(result)).not.toContain("secret-source-id");
  });
});
