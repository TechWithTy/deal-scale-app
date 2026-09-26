import type { z } from "zod";

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
import type { DetectorReadiness, EvidenceReadinessScorecard, ReadinessWarning } from "src/evidence/readiness";

type PublicEntity = Pick<z.infer<typeof assuranceEntitySchema>, "name" | "provenanceState" | "observedAt">;
type ViewModel<K extends string, T> = PublicEntity & { kind: K } & T;

export type AssuranceCaseViewModel = ViewModel<"assuranceCase", Pick<z.infer<typeof assuranceCaseSchema>, "caseStatus">>;
export type DetectorCandidateViewModel = ViewModel<"detectorCandidate", Pick<z.infer<typeof detectorCandidateSchema>, "detectorType" | "confidence">>;
export type EvidenceReferenceViewModel = ViewModel<"evidenceReference", Pick<z.infer<typeof evidenceReferenceSchema>, "evidenceType">>;
export type SellerIdentityViewModel = ViewModel<"sellerIdentity", Pick<z.infer<typeof sellerIdentitySchema>, "displayName">>;
export type OpportunityReferenceViewModel = ViewModel<"opportunityReference", Pick<z.infer<typeof opportunityReferenceSchema>, "stage">>;
export type EventViewModel = ViewModel<"event", Pick<z.infer<typeof eventSchema>, "eventType" | "occurredAt">>;
export type PromiseViewModel = ViewModel<"promise", Pick<z.infer<typeof promiseSchema>, "promiseType" | "dueAt"> & {
  expectationState: "expected";
  fulfillmentEvidenceState: "missing";
}>;
export type ConformancePolicyViewModel = ViewModel<"conformancePolicy", Pick<z.infer<typeof conformancePolicySchema>, "policyVersion" | "policyStatus">>;
export type ManagerDispositionViewModel = ViewModel<"managerDisposition", Pick<z.infer<typeof managerDispositionSchema>, "disposition"> & {
  confirmationState: "confirmed" | "inferred" | "not-confirmed";
}>;
export type OutcomeViewModel = ViewModel<"outcome", Pick<z.infer<typeof outcomeSchema>, "outcomeType" | "outcomeAt">>;

export type CoverageGapViewModel = Pick<ReadinessWarning, "code" | "evidenceType">;
export type DetectorCoverageViewModel = Pick<DetectorReadiness, "detectorType" | "score" | "status" | "missingEvidenceTypes"> & {
  coverageGaps: CoverageGapViewModel[];
};
export type ReadinessCoverageViewModel = Pick<EvidenceReadinessScorecard, "asOf" | "overallScore" | "overallStatus" | "connectedEvidenceTypes"> & {
  kind: "readinessCoverage";
  coverageGaps: Pick<ReadinessWarning, "code" | "detectorType" | "evidenceType">[];
  detectors: DetectorCoverageViewModel[];
};
