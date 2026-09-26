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
import type { AssuranceQuery, AssuranceQueryResult, AssuranceScope } from "./contracts";
import { canonicalFilterValues, filterAssuranceRecords } from "./filters";
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
const commonSortFields = ["name", "provenanceState", "observedAt"];
const domainSortFields: Partial<Record<AssuranceObjectName, readonly string[]>> = {
  assuranceCase: ["caseStatus"],
  detectorCandidate: ["detectorType", "confidence"],
  evidenceReference: ["evidenceType"],
  sellerIdentity: ["displayName"],
  opportunityReference: ["stage"],
  event: ["eventType", "occurredAt"],
  promise: ["promiseType", "dueAt"],
  conformancePolicy: ["policyVersion", "policyStatus"],
  managerDisposition: ["disposition"],
  outcome: ["outcomeType", "outcomeAt"],
};
const readinessSortFields = ["asOf", "overallScore", "overallStatus"];
const invalidSortResult = (): { state: "error"; items: []; nextCursor: null; error: string } => ({
  state: "error", items: [], nextCursor: null, error: "Invalid sort field",
});
const publicEntity = (record: Entity) => ({
  name: record.name,
  provenanceState: record.provenanceState,
  observedAt: new Date(record.observedAt.getTime()),
});

const adaptRecords = <T extends Entity, V extends object>(
  records: readonly T[],
  scope: AssuranceScope,
  objectName: AssuranceObjectName,
  project: (record: T) => V,
  query: AssuranceQuery<T> = {},
): AssuranceQueryResult<V> => {
  const pageQuery = { state: query.state, error: query.error, sort: query.sort, page: query.page };
  if (query.state) return paginateAndSort([], pageQuery);
  if (query.sort && !commonSortFields.includes(query.sort.field) &&
    !domainSortFields[objectName]?.includes(query.sort.field)) return invalidSortResult();
  let filtered: T[];
  try {
    filtered = filterAssuranceRecords(scopeReadableRecords(records, scope, objectName), query.filters,
      (record) => ({ ...query.filterValues?.(record), ...canonicalFilterValues(record) }));
  } catch {
    return { state: "error", items: [], nextCursor: null, error: "Invalid filter" };
  }
  const result = paginateAndSort(filtered, pageQuery);
  if (result.state !== "success") return result;
  return { ...result, items: result.items.map(project) };
};

export const adaptAssuranceCases = (
  records: readonly z.infer<typeof assuranceCaseSchema>[], scope: AssuranceScope,
  query?: AssuranceQuery<z.infer<typeof assuranceCaseSchema>>,
): AssuranceQueryResult<AssuranceCaseViewModel> => adaptRecords(records, scope, "assuranceCase", (record) => ({
  ...publicEntity(record), kind: "assuranceCase", caseStatus: record.caseStatus,
}), query);

export const adaptDetectorCandidates = (
  records: readonly z.infer<typeof detectorCandidateSchema>[], scope: AssuranceScope,
  query?: AssuranceQuery<z.infer<typeof detectorCandidateSchema>>,
): AssuranceQueryResult<DetectorCandidateViewModel> => adaptRecords(records, scope, "detectorCandidate", (record) => ({
  ...publicEntity(record), kind: "detectorCandidate", detectorType: record.detectorType, confidence: record.confidence,
}), query);

export const adaptEvidenceReferences = (
  records: readonly z.infer<typeof evidenceReferenceSchema>[], scope: AssuranceScope,
  query?: AssuranceQuery<z.infer<typeof evidenceReferenceSchema>>,
): AssuranceQueryResult<EvidenceReferenceViewModel> => adaptRecords(records, scope, "evidenceReference", (record) => ({
  ...publicEntity(record), kind: "evidenceReference", evidenceType: record.evidenceType,
}), query);

export const adaptSellerIdentities = (
  records: readonly z.infer<typeof sellerIdentitySchema>[], scope: AssuranceScope,
  query?: AssuranceQuery<z.infer<typeof sellerIdentitySchema>>,
): AssuranceQueryResult<SellerIdentityViewModel> => adaptRecords(records, scope, "sellerIdentity", (record) => ({
  ...publicEntity(record), kind: "sellerIdentity", displayName: record.displayName,
}), query);

export const adaptOpportunityReferences = (
  records: readonly z.infer<typeof opportunityReferenceSchema>[], scope: AssuranceScope,
  query?: AssuranceQuery<z.infer<typeof opportunityReferenceSchema>>,
): AssuranceQueryResult<OpportunityReferenceViewModel> => adaptRecords(records, scope, "opportunityReference", (record) => ({
  ...publicEntity(record), kind: "opportunityReference", stage: record.stage,
}), query);

export const adaptEvents = (
  records: readonly z.infer<typeof eventSchema>[], scope: AssuranceScope,
  query?: AssuranceQuery<z.infer<typeof eventSchema>>,
): AssuranceQueryResult<EventViewModel> => adaptRecords(records, scope, "event", (record) => ({
  ...publicEntity(record), kind: "event", eventType: record.eventType, occurredAt: new Date(record.occurredAt.getTime()),
}), query);

export const adaptPromises = (
  records: readonly z.infer<typeof promiseSchema>[], scope: AssuranceScope,
  query?: AssuranceQuery<z.infer<typeof promiseSchema>>,
): AssuranceQueryResult<PromiseViewModel> => adaptRecords(records, scope, "promise", (record) => ({
  ...publicEntity(record), kind: "promise", promiseType: record.promiseType,
  dueAt: record.dueAt === null ? null : new Date(record.dueAt.getTime()),
  expectationState: "expected", fulfillmentEvidenceState: "unassessed",
}), query);

export const adaptConformancePolicies = (
  records: readonly z.infer<typeof conformancePolicySchema>[], scope: AssuranceScope,
  query?: AssuranceQuery<z.infer<typeof conformancePolicySchema>>,
): AssuranceQueryResult<ConformancePolicyViewModel> => adaptRecords(records, scope, "conformancePolicy", (record) => ({
  ...publicEntity(record), kind: "conformancePolicy", policyVersion: record.policyVersion, policyStatus: record.policyStatus,
}), query);

export const adaptManagerDispositions = (
  records: readonly z.infer<typeof managerDispositionSchema>[], scope: AssuranceScope,
  query?: AssuranceQuery<z.infer<typeof managerDispositionSchema>>,
): AssuranceQueryResult<ManagerDispositionViewModel> => adaptRecords(records, scope, "managerDisposition", (record) => ({
  ...publicEntity(record), kind: "managerDisposition", disposition: record.disposition,
  confirmationState: record.disposition !== "confirm" ? "not-confirmed" : record.provenanceState === "observed" ? "confirmed" : "inferred",
}), query);

export const adaptOutcomes = (
  records: readonly z.infer<typeof outcomeSchema>[], scope: AssuranceScope,
  query?: AssuranceQuery<z.infer<typeof outcomeSchema>>,
): AssuranceQueryResult<OutcomeViewModel> => adaptRecords(records, scope, "outcome", (record) => ({
  ...publicEntity(record), kind: "outcome", outcomeType: record.outcomeType, outcomeAt: new Date(record.outcomeAt.getTime()),
}), query);

export const adaptReadinessCoverage = (
  scorecards: readonly EvidenceReadinessScorecard[], scope: AssuranceScope,
  query: AssuranceQuery<EvidenceReadinessScorecard> = {},
): AssuranceQueryResult<ReadinessCoverageViewModel> => {
  if (!scope.actorWorkspaceId.trim()) {
    return { state: "error", items: [], nextCursor: null, error: "Missing workspace scope" };
  }
  const pageQuery = { state: query.state, error: query.error, sort: query.sort, page: query.page };
  if (query.state) return paginateAndSort([], pageQuery);
  if (query.sort && !readinessSortFields.includes(query.sort.field)) return invalidSortResult();
  const scoped = scopeReadableRecords(
    scorecards.map((scorecard) => ({ workspaceId: scorecard.tenantId, scorecard })),
    scope,
    "detectorCandidate",
  );
  const readable = scopeReadableRecords(scoped, scope, "sourceConnection");
  let filtered: EvidenceReadinessScorecard[];
  try {
    filtered = filterAssuranceRecords(readable.map(({ scorecard }) => scorecard), query.filters,
      (scorecard) => ({ ...query.filterValues?.(scorecard), status: scorecard.overallStatus, date: scorecard.asOf }));
  } catch {
    return { state: "error", items: [], nextCursor: null, error: "Invalid filter" };
  }
  const result = paginateAndSort(filtered.map((scorecard) => ({
    ...scorecard, externalId: `${scorecard.tenantId}:${scorecard.asOf}`,
  })), pageQuery);
  if (result.state !== "success") return result;
  return { ...result, items: result.items.map((scorecard) => ({
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
  })) };
};
