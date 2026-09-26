import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";
import { FEATURE_FLAGS } from "src/config/feature-flags";

export const ASSURANCE_SURFACE_IDENTIFIERS = {
  auditResultsFrontComponent: "2d7e7f94-91d8-4a90-9b5c-8bf5b8d1c3a7",
  auditResultsPageLayout: "6c3b8eb4-5a1f-4d2e-9c78-0f2a1e6b5d93",
  auditResultsPageTab: "b84d2c3a-7f16-4e98-a50b-1c6d9e2f3a45",
  auditResultsWidget: "f15a9c3e-2b74-4d61-8e0f-7a5c1b9d6e28",
  evidenceReadinessFrontComponent: "4a9d1e7b-63c5-4f20-8b8e-2d7a5c1f9e34",
  evidenceReadinessPageLayout: "8e2f5b1c-4d79-4a63-9c10-6b3e7d2f5a84",
  evidenceReadinessPageTab: "c71a5e2d-9b46-4f83-a0c5-3d8e1b7f6a29",
  evidenceReadinessWidget: "1b6f3d8a-5e20-4c97-8a41-9d2e7b5f0c63",
} as const;

export const SURFACE_DEPENDENCIES = {
  audit: {
    featureFlag: FEATURE_FLAGS.detectorCandidates,
    objectUniversalIdentifiers: [
      ASSURANCE_OBJECTS.assuranceCase,
      ASSURANCE_OBJECTS.detectorCandidate,
      ASSURANCE_OBJECTS.evidenceReference,
    ],
    roleLabels: ["Assurance Reviewer", "Assurance Manager"],
  },
  evidence: {
    featureFlag: FEATURE_FLAGS.assuranceInbox,
    objectUniversalIdentifiers: [
      ASSURANCE_OBJECTS.sourceConnection,
      ASSURANCE_OBJECTS.evidenceReference,
      ASSURANCE_OBJECTS.assuranceCase,
    ],
    roleLabels: ["Evidence Integration", "Assurance Reviewer"],
  },
} as const;
