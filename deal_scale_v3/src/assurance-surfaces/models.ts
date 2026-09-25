import { FEATURE_FLAGS, type FeatureFlag } from "src/config/feature-flags";

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
};

export type ProvenanceGap = {
  label: string;
  count: number;
  detail: string;
};

export type AuditResultsModel = {
  runLabel: string;
  runTime: string;
  status: "Pass" | "Needs review";
  scopeLabel: string;
  statusBreakdown: AuditStatusCounts;
  provenanceGaps: ProvenanceGap[];
  remediationActions: RemediationAction[];
};

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

export type EvidenceReadinessModel = {
  readinessPercent: number;
  coveredEvidence: number;
  totalEvidence: number;
  sourceConnections: SourceConnectionHealth[];
  coverage: EvidenceCoverage[];
  provenanceGaps: ProvenanceGap[];
  remediationActions: RemediationAction[];
};

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

export const AUDIT_RESULTS_PREVIEW: AuditResultsModel = {
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
    },
    {
      id: "audit-action-2",
      label: "Attach missing seller events",
      detail: "Resolve the 8 cases that cannot trace back to a source event.",
      owner: "Evidence Integration",
      priority: "Medium",
      featureFlag: FEATURE_FLAGS.detectorCandidates,
    },
  ],
};

export const EVIDENCE_READINESS_PREVIEW: EvidenceReadinessModel = {
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
    },
    {
      id: "evidence-action-2",
      label: "Backfill 7 provenance fields",
      detail: "Complete source version and observed-time metadata on evidence references.",
      owner: "Evidence Integration",
      priority: "Medium",
      featureFlag: FEATURE_FLAGS.assuranceInbox,
    },
  ],
};
