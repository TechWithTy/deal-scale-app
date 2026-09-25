import {
  FEATURE_FLAGS,
  isFeatureEnabled,
  type FeatureFlag,
} from "src/config/feature-flags";
import {
  ASSURANCE_OBJECTS,
  type AssuranceObjectName,
} from "src/assurance/identifiers";
import {
  canAccessWorkspaceRecord,
  RBAC_MATRIX,
  type AssuranceRole,
} from "src/security/rbac";

export const ASSURANCE_INBOX_UNIVERSAL_IDENTIFIERS = {
  frontComponent: "b2d3f1f8-7c4a-4f2d-8a61-9e1b6c5d4a30",
  pageLayout: "c7a9e1b4-2d63-4f80-a5c2-1e7b9d4f6a20",
  pageLayoutTab: "d8b2c4e6-1a75-4c93-b8d0-2f6e9a1c3b40",
  widget: "e9c3d5f7-2b86-4da4-9ce1-3a7f0b2d4c50",
} as const;

export const ASSURANCE_INBOX_OBJECT_UNIVERSAL_IDENTIFIER = ASSURANCE_OBJECTS.assuranceCase;
export const ASSURANCE_INBOX_DEMO_WORKSPACE_ID = "00000000-0000-4000-8000-000000000001";

type AssuranceCaseStatus = "open" | "accepted" | "rejected" | "closed";
type AssuranceCaseUrgency = "critical" | "watch" | "ready";

type AssuranceCaseRecord = {
  id: string;
  workspaceId: string;
  externalId: string;
  opportunityReferenceId: string;
  detectorCandidateId: string;
  provenanceRef: string;
  title: string;
  status: AssuranceCaseStatus;
  urgency: AssuranceCaseUrgency;
  confidence: number;
  evidenceLabel: string;
  provenanceLabel: string;
  nextReviewLabel: string;
  ownerLabel: string;
  summary: string;
  recommendedAction: string;
};

export type AssuranceInboxCase = Omit<
  AssuranceCaseRecord,
  | "workspaceId"
  | "externalId"
  | "opportunityReferenceId"
  | "detectorCandidateId"
  | "provenanceRef"
>;

const CASE_RECORDS: AssuranceCaseRecord[] = [
  {
    id: "case-pricing-001",
    workspaceId: ASSURANCE_INBOX_DEMO_WORKSPACE_ID,
    externalId: "case-001",
    opportunityReferenceId: "opp-001",
    detectorCandidateId: "det-001",
    provenanceRef: "detector://pricing-promise/v1/case-001",
    title: "Pricing promise needs review",
    status: "open",
    urgency: "critical",
    confidence: 0.96,
    evidenceLabel: "2 supporting observations",
    provenanceLabel: "Inferred · pricing detector v1",
    nextReviewLabel: "Review today",
    ownerLabel: "Unassigned",
    summary: "A promised price appears inconsistent with the latest approved offer.",
    recommendedAction: "Compare the promise against the approved offer before the next seller touch.",
  },
  {
    id: "case-timing-002",
    workspaceId: ASSURANCE_INBOX_DEMO_WORKSPACE_ID,
    externalId: "case-002",
    opportunityReferenceId: "opp-002",
    detectorCandidateId: "det-002",
    provenanceRef: "detector://timing-risk/v2/case-002",
    title: "Implementation timing is unconfirmed",
    status: "open",
    urgency: "watch",
    confidence: 0.74,
    evidenceLabel: "1 supporting observation",
    provenanceLabel: "Observed · seller event",
    nextReviewLabel: "Review in 2 days",
    ownerLabel: "Revenue operations",
    summary: "The expected implementation window has not been corroborated by a follow-up event.",
    recommendedAction: "Request a dated implementation confirmation and attach it to the case.",
  },
  {
    id: "case-approval-003",
    workspaceId: ASSURANCE_INBOX_DEMO_WORKSPACE_ID,
    externalId: "case-003",
    opportunityReferenceId: "opp-003",
    detectorCandidateId: "det-003",
    provenanceRef: "detector://approval-gap/v1/case-003",
    title: "Approval evidence is ready",
    status: "accepted",
    urgency: "ready",
    confidence: 0.88,
    evidenceLabel: "3 supporting observations",
    provenanceLabel: "Observed · approval event",
    nextReviewLabel: "Review this week",
    ownerLabel: "Assurance manager",
    summary: "The approval signal is present, but the final human disposition is still pending.",
    recommendedAction: "Confirm the evidence set and record the manager disposition.",
  },
];

type ViewModelOptions = {
  actorWorkspaceId?: string;
  featureFlags?: Partial<Record<FeatureFlag, boolean>>;
  role: AssuranceRole;
};

const canUpdateAssuranceCase = (role: AssuranceRole) =>
  RBAC_MATRIX[role].permissions.some(
    (permission) =>
      permission.objectName === ("assuranceCase" satisfies AssuranceObjectName) &&
      permission.canUpdateObjectRecords,
  );

export const createAssuranceInboxModel = ({
  actorWorkspaceId = ASSURANCE_INBOX_DEMO_WORKSPACE_ID,
  featureFlags = {},
  role,
}: ViewModelOptions) => {
  const enabled = isFeatureEnabled(FEATURE_FLAGS.assuranceInbox, featureFlags);
  const visibleCases = enabled
    ? CASE_RECORDS.filter((record) =>
        canAccessWorkspaceRecord({
          actorWorkspaceId,
          recordWorkspaceId: record.workspaceId,
          role,
        }),
      )
    : [];

  const cases: AssuranceInboxCase[] = visibleCases.map(
    ({
      workspaceId: _workspaceId,
      externalId: _externalId,
      opportunityReferenceId: _opportunityReferenceId,
      detectorCandidateId: _detectorCandidateId,
      provenanceRef: _provenanceRef,
      ...safeCase
    }) => safeCase,
  );

  return {
    enabled,
    role,
    canTakeDisposition: enabled && canUpdateAssuranceCase(role),
    summary: {
      total: cases.length,
      needsReview: cases.filter((item) => item.status === "open").length,
      highConfidence: cases.filter((item) => item.confidence >= 0.85).length,
    },
    cases,
  };
};
