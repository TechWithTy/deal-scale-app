import type { z } from "zod";

import type { AssuranceObjectName } from "src/assurance/identifiers";
import type {
  assuranceCaseSchema,
  assuranceEntitySchema,
  conformancePolicySchema,
  detectorCandidateSchema,
  eventSchema,
  evidenceReferenceSchema,
  managerDispositionSchema,
  opportunityReferenceSchema,
  outcomeSchema,
  promiseSchema,
  sellerIdentitySchema,
} from "src/assurance/schema";
import type { EvidenceReadinessScorecard } from "src/evidence/readiness";

import { paginateAndSort, scopeReadableRecords } from "./access";
import type { AssuranceQueryResult, AssuranceScope } from "./contracts";
import type {
  AssuranceCaseViewModel,
  ConformancePolicyViewModel,
  DetectorCandidateViewModel,
  EventViewModel,
  EvidenceReferenceViewModel,
  ManagerDispositionViewModel,
  OpportunityReferenceViewModel,
  OutcomeViewModel,
  PromiseViewModel,
  ReadinessCoverageViewModel,
  SellerIdentityViewModel,
} from "./view-models";

type Entity = z.infer<typeof assuranceEntitySchema>;
const publicEntity = (record: Entity) => ({
  name: record.name,
  provenanceState: record.provenanceState,
  observedAt: record.observedAt,
});

const adaptRecords = <T extends Entity, V extends object>(
  records: readonly T[],
  scope: AssuranceScope,
  objectName: AssuranceObjectName,
  project: (record: T) => V,
): AssuranceQueryResult<V> =>
  paginateAndSort(scopeReadableRecords(records, scope, objectName).map(project), {});

export const adaptAssuranceCases = (
  records: readonly z.infer<typeof assuranceCaseSchema>[], scope: AssuranceScope,
): AssuranceQueryResult<AssuranceCaseViewModel> => adaptRecords(records, scope, "assuranceCase", (record) => ({
  ...publicEntity(record), kind: "assuranceCase", caseStatus: record.caseStatus,
}));

export const adaptDetectorCandidates = (
  records: readonly z.infer<typeof detectorCandidateSchema>[], scope: AssuranceScope,
): AssuranceQueryResult<DetectorCandidateViewModel> => adaptRecords(records, scope, "detectorCandidate", (record) => ({
  ...publicEntity(record), kind: "detectorCandidate", detectorType: record.detectorType, confidence: record.confidence,
}));

export const adaptEvidenceReferences = (
  records: readonly z.infer<typeof evidenceReferenceSchema>[], scope: AssuranceScope,
): AssuranceQueryResult<EvidenceReferenceViewModel> => adaptRecords(records, scope, "evidenceReference", (record) => ({
  ...publicEntity(record), kind: "evidenceReference", evidenceType: record.evidenceType,
}));

export const adaptSellerIdentities = (
  records: readonly z.infer<typeof sellerIdentitySchema>[], scope: AssuranceScope,
): AssuranceQueryResult<SellerIdentityViewModel> => adaptRecords(records, scope, "sellerIdentity", (record) => ({
  ...publicEntity(record), kind: "sellerIdentity", displayName: record.displayName,
}));

export const adaptOpportunityReferences = (
  records: readonly z.infer<typeof opportunityReferenceSchema>[], scope: AssuranceScope,
): AssuranceQueryResult<OpportunityReferenceViewModel> => adaptRecords(records, scope, "opportunityReference", (record) => ({
  ...publicEntity(record), kind: "opportunityReference", stage: record.stage,
}));

export const adaptEvents = (
  records: readonly z.infer<typeof eventSchema>[], scope: AssuranceScope,
): AssuranceQueryResult<EventViewModel> => adaptRecords(records, scope, "event", (record) => ({
  ...publicEntity(record), kind: "event", eventType: record.eventType, occurredAt: record.occurredAt,
}));

export const adaptPromises = (
  records: readonly z.infer<typeof promiseSchema>[], scope: AssuranceScope,
): AssuranceQueryResult<PromiseViewModel> => adaptRecords(records, scope, "promise", (record) => ({
  ...publicEntity(record), kind: "promise", promiseType: record.promiseType, dueAt: record.dueAt,
  expectationState: "expected", fulfillmentEvidenceState: "missing",
}));

export const adaptConformancePolicies = (
  records: readonly z.infer<typeof conformancePolicySchema>[], scope: AssuranceScope,
): AssuranceQueryResult<ConformancePolicyViewModel> => adaptRecords(records, scope, "conformancePolicy", (record) => ({
  ...publicEntity(record), kind: "conformancePolicy", policyVersion: record.policyVersion, policyStatus: record.policyStatus,
}));

export const adaptManagerDispositions = (
  records: readonly z.infer<typeof managerDispositionSchema>[], scope: AssuranceScope,
): AssuranceQueryResult<ManagerDispositionViewModel> => adaptRecords(records, scope, "managerDisposition", (record) => ({
  ...publicEntity(record), kind: "managerDisposition", disposition: record.disposition,
  confirmationState: record.disposition !== "confirm" ? "not-confirmed" : record.provenanceState === "observed" ? "confirmed" : "inferred",
}));

export const adaptOutcomes = (
  records: readonly z.infer<typeof outcomeSchema>[], scope: AssuranceScope,
): AssuranceQueryResult<OutcomeViewModel> => adaptRecords(records, scope, "outcome", (record) => ({
  ...publicEntity(record), kind: "outcome", outcomeType: record.outcomeType, outcomeAt: record.outcomeAt,
}));

export const adaptReadinessCoverage = (
  scorecards: readonly EvidenceReadinessScorecard[], scope: AssuranceScope,
): AssuranceQueryResult<ReadinessCoverageViewModel> => {
  if (!scope.actorWorkspaceId.trim()) {
    return { state: "error", items: [], nextCursor: null, error: "Missing workspace scope" };
  }
  const scoped = scopeReadableRecords(
    scorecards.map((scorecard) => ({ workspaceId: scorecard.tenantId, scorecard })),
    scope,
    "detectorCandidate",
  );
  const readable = scopeReadableRecords(scoped, scope, "sourceConnection");
  return paginateAndSort(readable.map(({ scorecard }) => ({
    kind: "readinessCoverage" as const,
    asOf: scorecard.asOf,
    overallScore: scorecard.overallScore,
    overallStatus: scorecard.overallStatus,
    connectedEvidenceTypes: [...scorecard.connectedEvidenceTypes],
    coverageGaps: scorecard.warnings.map(({ code, detectorType, evidenceType }) => ({
      code, detectorType, ...(evidenceType ? { evidenceType } : {}),
    })),
    detectors: scorecard.detectors.map((detector) => ({
      detectorType: detector.detectorType,
      score: detector.score,
      status: detector.status,
      missingEvidenceTypes: [...detector.missingEvidenceTypes],
      coverageGaps: detector.coverageGaps.map(({ code, evidenceType }) => ({ code, ...(evidenceType ? { evidenceType } : {}) })),
    })),
  })), {});
};
