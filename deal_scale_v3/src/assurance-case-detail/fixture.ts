import {
  assuranceCaseSchema,
  detectorCandidateSchema,
  evidenceReferenceSchema,
  managerDispositionSchema,
} from "src/assurance/schema";
import type {
  AssuranceCaseDetailDetector,
  AssuranceCaseDetailEvidence,
  AssuranceCaseDetailPreview,
} from "src/assurance-case-detail/contract";

const workspaceId = "00000000-0000-4000-8000-000000000001";

const assuranceCase = assuranceCaseSchema.parse({
  name: "Pricing promise review",
  externalId: "case-001",
  workspaceId,
  provenanceState: "inferred",
  provenanceRef: "detector://pricing-promise/v1/case-001",
  sourceVersion: "detector-v1",
  recordVersion: 1,
  observedAt: "2026-09-24T16:20:00.000Z",
  opportunityReferenceId: "opp-001",
  detectorCandidateId: "det-001",
  caseStatus: "open",
});

const detector = detectorCandidateSchema.parse({
  name: "Pricing promise mismatch",
  externalId: "det-001",
  workspaceId,
  provenanceState: "inferred",
  provenanceRef: "detector://pricing-promise/v1/det-001",
  sourceVersion: "detector-v1",
  recordVersion: 1,
  observedAt: "2026-09-24T16:20:00.000Z",
  conformancePolicyId: "policy-pricing-v3",
  eventId: "event-001",
  detectorType: "pricing_promise_mismatch",
  confidence: 0.94,
}) as AssuranceCaseDetailDetector;

const evidence = [
  evidenceReferenceSchema.parse({
    name: "Pricing commitment email",
    externalId: "evidence-pricing-email",
    workspaceId,
    provenanceState: "observed",
    provenanceRef: "source://message/msg-001",
    sourceVersion: "crm-v1",
    recordVersion: 3,
    observedAt: "2026-09-24T16:15:00.000Z",
    assuranceCaseId: "case-001",
    eventId: "event-001",
    evidenceType: "seller_message",
    contentHash: "sha256:pricing-email-001",
  }),
  evidenceReferenceSchema.parse({
    name: "Opportunity stage snapshot",
    externalId: "evidence-stage-snapshot",
    workspaceId,
    provenanceState: "observed",
    provenanceRef: "source://record/opp-001",
    sourceVersion: "crm-v1",
    recordVersion: 2,
    observedAt: "2026-09-24T15:40:00.000Z",
    assuranceCaseId: "case-001",
    eventId: null,
    evidenceType: "stage_snapshot",
    contentHash: "sha256:stage-snapshot-001",
  }),
] as AssuranceCaseDetailEvidence[];

evidence[0].evidenceId = "evidence-pricing-email";
evidence[0].sourceLabel = "Seller message";
evidence[0].excerpt = "We can hold the preferred rate through the end of the month.";
evidence[0].eventLabel = "Pricing commitment recorded";
evidence[1].evidenceId = "evidence-stage-snapshot";
evidence[1].sourceLabel = "Stage snapshot";
evidence[1].excerpt = "Stage remained proposal while the pricing promise was active.";
evidence[1].eventLabel = "Opportunity state observed";

const disposition = managerDispositionSchema.parse({
  name: "Pricing promise review disposition",
  externalId: "disposition-001",
  workspaceId,
  provenanceState: "inferred",
  provenanceRef: "review://case-001/disposition-001",
  sourceVersion: "review-ui-v1",
  recordVersion: 1,
  observedAt: "2026-09-24T16:20:00.000Z",
  assuranceCaseId: "case-001",
  disposition: "needs-review",
  decidedBy: "reviewer-preview",
});

const detailDetector = {
  ...detector,
  findingTitle: "Pricing promise may be out of conformance",
  findingSummary:
    "The observed seller commitment does not match the active pricing policy snapshot.",
  recommendedAction: "Confirm the commitment or dismiss the finding with reviewer context.",
};

export const ASSURANCE_CASE_DETAIL_PREVIEW: AssuranceCaseDetailPreview = {
  assuranceCase,
  detector: detailDetector,
  evidence,
  disposition,
  persistence: "ui-only",
};
