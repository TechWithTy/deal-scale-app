import { createHash } from "node:crypto";

import {
  calculateShadowPriority,
  type ShadowPriority,
} from "./priority";

export type ShadowEvidence = {
  id: string;
  workspaceId: string;
  opportunityReferenceId: string;
  evidenceType: string;
  contentHash: string;
  observedAt: string | Date;
};

export type ShadowFinding = {
  findingKey: string;
  summary: string;
  severity: number;
  urgency: number;
  evidenceCompleteness: number;
  evidenceIds: readonly string[];
};

export type ShadowDetectorContext = {
  workspaceId: string;
  changedEvidence: readonly ShadowEvidence[];
  evidence: readonly ShadowEvidence[];
};

export type ShadowDetector = {
  detectorType: string;
  detectorVersion: string;
  evidenceTypes: readonly string[];
  maxEvidencePerEvaluation: number;
  readinessStatus?: "ready" | "degraded" | "insufficient_evidence";
  evaluate: (context: ShadowDetectorContext) => Promise<readonly ShadowFinding[]>;
};

export type ShadowCase = {
  id: string;
  dedupeKey: string;
  workspaceId: string;
  opportunityReferenceId: string;
  detectorType: string;
  detectorVersion: string;
  findingKey: string;
  summary: string;
  evidenceIds: readonly string[];
  priority: ShadowPriority;
};

export type ShadowMonitoringInput = {
  workspaceId: string;
  changedEvidence: readonly ShadowEvidence[];
  evidence: readonly ShadowEvidence[];
  detectors: readonly ShadowDetector[];
  existingCases?: readonly Pick<ShadowCase, "dedupeKey">[];
  maxDetectorsPerRun?: number;
  maxChangedEvidencePerRun?: number;
};

export type ShadowMonitoringResult = {
  createdCases: readonly ShadowCase[];
  duplicateCaseKeys: readonly string[];
  evaluatedDetectorTypes: readonly string[];
  evaluatedEvidenceIds: readonly string[];
  skippedDetectorTypes: readonly string[];
};

const deterministicUuidV4 = (seed: string) => {
  const bytes = createHash("sha256").update(seed).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Buffer.from(bytes).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const observedAtMs = (evidence: ShadowEvidence) => {
  const timestamp = new Date(evidence.observedAt).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const sortEvidence = (changedIds: ReadonlySet<string>) =>
  (left: ShadowEvidence, right: ShadowEvidence) => {
    const changedDifference = Number(changedIds.has(right.id)) - Number(changedIds.has(left.id));
    return changedDifference || observedAtMs(right) - observedAtMs(left) || left.id.localeCompare(right.id);
  };

const validateRunLimit = (limit: number, name: string) => {
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError(`${name} must be a positive integer`);
  return limit;
};

const dedupeEvidence = (items: readonly ShadowEvidence[]) => [
  ...new Map(items.map((item) => [item.id, item])).values(),
];

const sortChangedEvidence = (left: ShadowEvidence, right: ShadowEvidence) =>
  observedAtMs(right) - observedAtMs(left) || left.id.localeCompare(right.id);

export const runShadowMonitoring = async ({
  workspaceId,
  changedEvidence,
  evidence,
  detectors,
  existingCases = [],
  maxDetectorsPerRun = 10,
  maxChangedEvidencePerRun = 100,
}: ShadowMonitoringInput): Promise<ShadowMonitoringResult> => {
  const detectorLimit = validateRunLimit(maxDetectorsPerRun, "maxDetectorsPerRun");
  const changedLimit = validateRunLimit(maxChangedEvidencePerRun, "maxChangedEvidencePerRun");
  const changed = dedupeEvidence(
    changedEvidence.filter((item) => item.workspaceId === workspaceId),
  ).sort(sortChangedEvidence).slice(0, changedLimit);
  const changedTypes = new Set(changed.map((item) => item.evidenceType));
  const changedIds = new Set(changed.map((item) => item.id));
  const opportunities = new Set(changed.map((item) => item.opportunityReferenceId));
  const candidates = dedupeEvidence(
    evidence.filter(
      (item) => item.workspaceId === workspaceId && opportunities.has(item.opportunityReferenceId),
    ),
  ).sort(sortEvidence(changedIds));
  const existingKeys = new Set(existingCases.map((item) => item.dedupeKey));
  const createdCases: ShadowCase[] = [];
  const duplicateCaseKeys: string[] = [];
  const evaluatedDetectorTypes: string[] = [];
  const skippedDetectorTypes: string[] = [];

  for (const detector of detectors
    .filter((item) => item.evidenceTypes.some((type) => changedTypes.has(type)))
    .slice(0, detectorLimit)) {
    if (detector.readinessStatus === "insufficient_evidence") {
      skippedDetectorTypes.push(detector.detectorType);
      continue;
    }
    const limit = validateRunLimit(detector.maxEvidencePerEvaluation, "maxEvidencePerEvaluation");
    const detectorChanged = changed.filter((item) => detector.evidenceTypes.includes(item.evidenceType));
    const opportunityIds = [...new Set(detectorChanged.map((item) => item.opportunityReferenceId))].sort();
    for (const opportunity of opportunityIds) {
      const opportunityChanged = detectorChanged.filter((item) => item.opportunityReferenceId === opportunity).slice(0, limit);
      const detectorEvidence = candidates
        .filter((item) => item.opportunityReferenceId === opportunity && detector.evidenceTypes.includes(item.evidenceType))
        .slice(0, limit);
      const findings = await detector.evaluate({ workspaceId, changedEvidence: opportunityChanged, evidence: detectorEvidence });
      if (!evaluatedDetectorTypes.includes(detector.detectorType)) evaluatedDetectorTypes.push(detector.detectorType);

      for (const finding of findings) {
        const evidenceIds = [...new Set(finding.evidenceIds)];
        if (finding.findingKey.length === 0 || finding.summary.length === 0 ||
          evidenceIds.some((id) => !detectorEvidence.some((item) => item.id === id))) {
          throw new Error(`Detector ${detector.detectorType} returned an incomplete finding`);
        }
        const dedupeKey = [workspaceId, opportunity, detector.detectorType, detector.detectorVersion, finding.findingKey].join("|");
        if (existingKeys.has(dedupeKey) || createdCases.some((item) => item.dedupeKey === dedupeKey)) {
          duplicateCaseKeys.push(dedupeKey);
          continue;
        }

        createdCases.push({
          id: deterministicUuidV4(`shadow-case|${dedupeKey}`),
          dedupeKey,
          workspaceId,
          opportunityReferenceId: opportunity,
          detectorType: detector.detectorType,
          detectorVersion: detector.detectorVersion,
          findingKey: finding.findingKey,
          summary: finding.summary,
          evidenceIds,
          priority: calculateShadowPriority(finding),
        });
      }
    }
  }

  return {
    createdCases,
    duplicateCaseKeys,
    evaluatedDetectorTypes,
    evaluatedEvidenceIds: changed.map((item) => item.id),
    skippedDetectorTypes,
  };
};
