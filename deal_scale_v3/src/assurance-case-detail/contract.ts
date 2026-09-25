import type { z } from "zod";

import { FEATURE_FLAGS, isFeatureEnabled, type FeatureFlag } from "src/config/feature-flags";
import {
  assuranceCaseSchema,
  detectorCandidateSchema,
  evidenceReferenceSchema,
  managerDispositionSchema,
} from "src/assurance/schema";
import { RBAC_MATRIX, type AssuranceRole } from "src/security/rbac";

export const ASSURANCE_CASE_DETAIL_IDENTIFIERS = {
  frontComponent: "7c0a0d3f-6af8-4c95-8a84-6a7a36c1f29e",
  layout: "d1f7d95b-0ef8-4b3a-9b2c-54c9e7c8b6aa",
  tab: "a9a16b3f-5b13-42e7-8a90-c63a989edc20",
  widget: "4f67c9c0-3ea1-4a42-b9aa-1e1cbf7ed5d2",
} as const;

export type AssuranceCaseRecord = z.infer<typeof assuranceCaseSchema>;
export type DetectorCandidateRecord = z.infer<typeof detectorCandidateSchema>;
export type EvidenceReferenceRecord = z.infer<typeof evidenceReferenceSchema>;
export type ManagerDispositionRecord = z.infer<typeof managerDispositionSchema>;

export type AssuranceCaseDetailEvidence = EvidenceReferenceRecord & {
  evidenceId: string;
  sourceLabel: string;
  excerpt: string;
  eventLabel: string;
};

export type AssuranceCaseDetailDetector = DetectorCandidateRecord & {
  findingTitle: string;
  findingSummary: string;
  recommendedAction: string;
};

export type AssuranceCaseDetailPreview = {
  assuranceCase: AssuranceCaseRecord;
  detector: AssuranceCaseDetailDetector;
  evidence: AssuranceCaseDetailEvidence[];
  disposition: ManagerDispositionRecord;
  persistence: "ui-only";
};

export type DispositionControlState = {
  canEdit: boolean;
  reason: "role" | "feature-flag" | null;
};

export const DISPOSITION_OPTIONS = [
  { value: "confirm", label: "Confirm finding" },
  { value: "needs-review", label: "Needs review" },
  { value: "dismiss", label: "Dismiss finding" },
] as const;

export const sortEvidenceTimeline = (
  evidence: readonly AssuranceCaseDetailEvidence[],
) =>
  [...evidence].sort((left, right) => {
    const timeDifference = right.observedAt.getTime() - left.observedAt.getTime();
    return timeDifference || right.evidenceId.localeCompare(left.evidenceId);
  });

export const selectEvidenceId = (
  _currentId: string | null,
  nextId: string,
  evidence: readonly AssuranceCaseDetailEvidence[],
) => (evidence.some((item) => item.evidenceId === nextId) ? nextId : null);

export const getEvidenceDrawerState = (selectedEvidenceId: string | null) =>
  selectedEvidenceId ? "open" : "closed";

export const getDispositionControlState = ({
  role,
  flags,
}: {
  role: AssuranceRole;
  flags: Partial<Record<FeatureFlag, boolean>>;
}): DispositionControlState => {
  const managerPermission = RBAC_MATRIX[role].permissions.find(
    (permission) => permission.objectName === "managerDisposition",
  );

  if (!managerPermission?.canUpdateObjectRecords) {
    return { canEdit: false, reason: "role" };
  }

  if (!isFeatureEnabled(FEATURE_FLAGS.managerDisposition, flags)) {
    return { canEdit: false, reason: "feature-flag" };
  }

  return { canEdit: true, reason: null };
};
