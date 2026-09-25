import {
  FEATURE_FLAGS,
  isFeatureEnabled,
  type FeatureFlag,
} from "src/config/feature-flags";
import { type AssuranceObjectName } from "src/assurance/identifiers";
import { RBAC_MATRIX, type AssuranceRole } from "src/security/rbac";

export type SurfaceDataState = "loading" | "error" | "empty" | "ready";
export type SurfaceState =
  | "disabled"
  | "forbidden"
  | "missing-scope"
  | SurfaceDataState;

export type SurfaceAccessOptions = {
  role?: AssuranceRole;
  hasScope?: boolean;
  featureFlags?: Partial<Record<FeatureFlag, boolean>>;
  dataState?: SurfaceDataState;
  errorMessage?: string;
};

export type SurfacePermission = {
  objectName: AssuranceObjectName;
  operation: "read" | "update";
};

export type AuditStatusCounts = {
  pass: number;
  fail: number;
  needsReview: number;
  total: number;
};

export type RemediationAction = {
  id: string;
  label: string;
  detail: string;
  owner: string;
  priority: "High" | "Medium" | "Low";
  featureFlag: FeatureFlag;
  permission: SurfacePermission;
};

export type ProvenanceGap = {
  label: string;
  count: number;
  detail: string;
};

type AuditResultsPayload = {
  runLabel: string;
  runTime: string;
  status: "Pass" | "Needs review";
  scopeLabel: string;
  statusBreakdown: AuditStatusCounts;
  provenanceGaps: ProvenanceGap[];
  remediationActions: RemediationAction[];
};

type ReadyModel<T> = T & {
  state: "ready";
  canRenderData: true;
  canSelectRemediation: boolean;
};

type BlockedModel = {
  state: Exclude<SurfaceState, "ready">;
  message: string;
  remediationActions: [];
  canRenderData: false;
  canSelectRemediation: false;
};

export type AuditResultsModel = ReadyModel<AuditResultsPayload> | BlockedModel;

export type SourceConnectionHealth = {
  provider: string;
  status: "active" | "paused" | "revoked";
  lastSync: string;
  lag: string;
  detail: string;
};

export type EvidenceCoverage = {
  label: string;
  covered: number;
  total: number;
  detail: string;
};

type EvidenceReadinessPayload = {
  readinessPercent: number;
  coveredEvidence: number;
  totalEvidence: number;
  sourceConnections: SourceConnectionHealth[];
  coverage: EvidenceCoverage[];
  provenanceGaps: ProvenanceGap[];
  remediationActions: RemediationAction[];
};

export type EvidenceReadinessModel = ReadyModel<EvidenceReadinessPayload> | BlockedModel;

export const summarizeAuditRun = ({
  pass,
  fail,
  needsReview,
}: Omit<AuditStatusCounts, "total">): AuditStatusCounts => ({
  pass,
  fail,
  needsReview,
  total: pass + fail + needsReview,
});

export const calculateReadinessPercent = (covered: number, total: number) => {
  if (total <= 0) return 0;
  const boundedCovered = Math.min(Math.max(covered, 0), total);
  return Math.round((boundedCovered / total) * 100);
};

export const AUDIT_RESULTS_PREVIEW: AuditResultsPayload = {
  runLabel: "Latest assurance run",
  runTime: "25 Sep 2026 · 09:42 UTC",
  status: "Needs review",
  scopeLabel: "3 source connections · 24 assurance cases",
  statusBreakdown: summarizeAuditRun({ pass: 15, fail: 4, needsReview: 5 }),
  provenanceGaps: [
    { label: "Missing source event", count: 8, detail: "Cases without a seller event reference" },
    { label: "Stale source version", count: 3, detail: "Evidence captured before the current connector version" },
    { label: "Unresolved case outcome", count: 5, detail: "Manager disposition is still needed" },
  ],
  remediationActions: [
    {
      id: "audit-action-1",
      label: "Review 5 needs-review cases",
      detail: "Confirm or dismiss the highest-confidence detector candidates.",
      owner: "Assurance Manager",
      priority: "High",
      featureFlag: FEATURE_FLAGS.managerDisposition,
      permission: { objectName: "managerDisposition", operation: "update" },
    },
    {
      id: "audit-action-2",
      label: "Attach missing seller events",
      detail: "Resolve the 8 cases that cannot trace back to a source event.",
      owner: "Evidence Integration",
      priority: "Medium",
      featureFlag: FEATURE_FLAGS.detectorCandidates,
      permission: { objectName: "evidenceReference", operation: "read" },
    },
  ],
};

export const EVIDENCE_READINESS_PREVIEW: EvidenceReadinessPayload = {
  coveredEvidence: 39,
  totalEvidence: 50,
  readinessPercent: calculateReadinessPercent(39, 50),
  sourceConnections: [
    { provider: "CRM sync", status: "active", lastSync: "2 min ago", lag: "Low lag", detail: "Records arriving continuously" },
    { provider: "Messaging relay", status: "active", lastSync: "18 min ago", lag: "Watch", detail: "Some threads are missing participants" },
    { provider: "Calendar connector", status: "paused", lastSync: "3 hr ago", lag: "Paused", detail: "Reconnect before the next audit run" },
  ],
  coverage: [
    { label: "Source identity", covered: 12, total: 12, detail: "Connection and seller identity linked" },
    { label: "Opportunity context", covered: 10, total: 14, detail: "Four opportunities need a current stage" },
    { label: "Seller events", covered: 11, total: 16, detail: "Five events need provenance references" },
    { label: "Case support", covered: 6, total: 8, detail: "Two cases need reviewable evidence" },
  ],
  provenanceGaps: [
    { label: "Evidence without source version", count: 4, detail: "Cannot confirm connector snapshot" },
    { label: "Evidence without observed time", count: 3, detail: "Temporal ordering is incomplete" },
  ],
  remediationActions: [
    {
      id: "evidence-action-1",
      label: "Reconnect Calendar connector",
      detail: "Restore the paused source before the next audit run.",
      owner: "Evidence Integration",
      priority: "High",
      featureFlag: FEATURE_FLAGS.assuranceInbox,
      permission: { objectName: "sourceConnection", operation: "update" },
    },
    {
      id: "evidence-action-2",
      label: "Backfill 7 provenance fields",
      detail: "Complete source version and observed-time metadata on evidence references.",
      owner: "Evidence Integration",
      priority: "Medium",
      featureFlag: FEATURE_FLAGS.assuranceInbox,
      permission: { objectName: "evidenceReference", operation: "update" },
    },
  ],
};

const SURFACE_POLICIES = {
  audit: {
    featureFlag: FEATURE_FLAGS.detectorCandidates,
    readableObjects: [
      "assuranceCase",
      "detectorCandidate",
      "evidenceReference",
    ] as const,
  },
  evidence: {
    featureFlag: FEATURE_FLAGS.assuranceInbox,
    readableObjects: ["sourceConnection", "evidenceReference"] as const,
  },
} as const;

const hasPermission = (
  role: AssuranceRole,
  permission: SurfacePermission,
) =>
  RBAC_MATRIX[role].permissions.some(
    (entry) =>
      entry.objectName === permission.objectName &&
      (permission.operation === "read" || entry.canUpdateObjectRecords),
  );

const canReadSurface = (
  role: AssuranceRole,
  objects: readonly AssuranceObjectName[],
) =>
  objects.every((objectName) =>
    hasPermission(role, { objectName, operation: "read" }),
  );

const resolveSurfaceState = ({
  featureFlag,
  readableObjects,
  role,
  hasScope = false,
  featureFlags = {},
  dataState = "ready",
  errorMessage,
}: SurfaceAccessOptions & {
  featureFlag: FeatureFlag;
  readableObjects: readonly AssuranceObjectName[];
}): SurfaceState | { state: "error"; message: string } => {
  if (!isFeatureEnabled(featureFlag, featureFlags)) return "disabled";
  if (!hasScope) return "missing-scope";
  if (!role || !canReadSurface(role, readableObjects)) return "forbidden";
  if (dataState === "error") {
    return { state: "error", message: errorMessage ?? "The assurance snapshot could not be loaded." };
  }
  return dataState;
};

const stateMessage = (state: Exclude<SurfaceState, "ready">) => {
  switch (state) {
    case "disabled":
      return "This assurance surface is not enabled for the current workspace.";
    case "forbidden":
      return "Your role does not have read access to this assurance surface.";
    case "missing-scope":
      return "A workspace scope is required before assurance data can be shown.";
    case "loading":
      return "Loading the latest read-only assurance snapshot.";
    case "empty":
      return "No assurance snapshot is available for the current scope.";
    case "error":
      return "The assurance snapshot could not be loaded.";
  }
};

const blockedModel = (result: Exclude<SurfaceState, "ready"> | { state: "error"; message: string }): BlockedModel => {
  const state = typeof result === "string" ? result : result.state;
  return {
    state,
    message: typeof result === "string" ? stateMessage(result) : result.message,
    remediationActions: [],
    canRenderData: false,
    canSelectRemediation: false,
  };
};

const permittedActions = (
  actions: RemediationAction[],
  role: AssuranceRole,
  featureFlags: Partial<Record<FeatureFlag, boolean>>,
) =>
  actions.filter(
    (action) =>
      isFeatureEnabled(action.featureFlag, featureFlags) &&
      hasPermission(role, action.permission),
  );

export const createAuditResultsModel = (
  options: SurfaceAccessOptions,
  data: AuditResultsPayload = AUDIT_RESULTS_PREVIEW,
): AuditResultsModel => {
  const result = resolveSurfaceState({
    ...options,
    featureFlag: SURFACE_POLICIES.audit.featureFlag,
    readableObjects: SURFACE_POLICIES.audit.readableObjects,
  });
  if (result !== "ready") return blockedModel(result);

  const remediationActions = options.role
    ? permittedActions(data.remediationActions, options.role, options.featureFlags ?? {})
    : [];
  return {
    ...data,
    state: "ready",
    canRenderData: true,
    canSelectRemediation: remediationActions.length > 0,
    remediationActions,
  };
};

export const createEvidenceReadinessModel = (
  options: SurfaceAccessOptions,
  data: EvidenceReadinessPayload = EVIDENCE_READINESS_PREVIEW,
): EvidenceReadinessModel => {
  const result = resolveSurfaceState({
    ...options,
    featureFlag: SURFACE_POLICIES.evidence.featureFlag,
    readableObjects: SURFACE_POLICIES.evidence.readableObjects,
  });
  if (result !== "ready") return blockedModel(result);

  const remediationActions = options.role
    ? permittedActions(data.remediationActions, options.role, options.featureFlags ?? {})
    : [];
  return {
    ...data,
    state: "ready",
    canRenderData: true,
    canSelectRemediation: remediationActions.length > 0,
    remediationActions,
  };
};
