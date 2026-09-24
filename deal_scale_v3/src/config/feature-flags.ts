export const FEATURE_FLAGS = {
  assuranceInbox: "assurance_inbox",
  managerDisposition: "manager_disposition",
  detectorCandidates: "detector_candidates",
} as const;

export type FeatureFlag = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

export const isFeatureEnabled = (
  flag: FeatureFlag,
  values: Partial<Record<FeatureFlag, boolean>> = {},
) => values[flag] ?? false;
