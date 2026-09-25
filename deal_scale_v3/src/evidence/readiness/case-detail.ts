import type { AssuranceCaseDetail, EvidenceReadinessScorecard } from "./types";

export interface AssuranceCaseDetailInput {
  readonly caseId: string;
  readonly detectorType: string;
  readonly readiness: EvidenceReadinessScorecard;
}

export const buildAssuranceCaseDetail = ({ caseId, detectorType, readiness }: AssuranceCaseDetailInput): AssuranceCaseDetail => {
  const detector = readiness.detectors.find((item) => item.detectorType === detectorType);
  if (!detector) throw new Error(`No readiness assessment found for detector ${detectorType}.`);
  return {
    caseId,
    detectorType,
    evidenceReadinessStatus: detector.status,
    evidenceReadinessScore: detector.score,
    missingEvidenceTypes: detector.missingEvidenceTypes,
    coverageGaps: detector.coverageGaps,
  };
};
