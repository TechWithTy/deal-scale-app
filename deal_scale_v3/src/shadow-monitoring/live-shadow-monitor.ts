import {
  runShadowMonitoring,
  type ShadowCase,
  type ShadowDetector,
  type ShadowEvidence,
  type ShadowMonitoringResult,
} from "./shadow-monitor";

export type ShadowMonitoringStore = {
  loadChangedEvidence: (input: { workspaceId: string; limit: number }) => Promise<readonly ShadowEvidence[]>;
  loadEvidence: (input: {
    workspaceId: string;
    opportunityReferenceIds: readonly string[];
    limitPerOpportunity: number;
  }) => Promise<readonly ShadowEvidence[]>;
  loadDetectors: (input: { workspaceId: string }) => Promise<readonly ShadowDetector[]>;
  upsertCase: (candidate: ShadowCase) => Promise<"created" | "duplicate">;
};

export type LiveShadowMonitoringInput = {
  workspaceId: string;
  store: ShadowMonitoringStore;
  maxChangedEvidencePerRun?: number;
  maxDetectorsPerRun?: number;
  maxEvidencePerOpportunity?: number;
};

export const runLiveShadowMonitoring = async ({
  workspaceId,
  store,
  maxChangedEvidencePerRun = 100,
  maxDetectorsPerRun = 10,
  maxEvidencePerOpportunity = 100,
}: LiveShadowMonitoringInput): Promise<ShadowMonitoringResult> => {
  const changedEvidence = await store.loadChangedEvidence({ workspaceId, limit: maxChangedEvidencePerRun });
  const opportunityReferenceIds = [...new Set(
    changedEvidence.filter((item) => item.workspaceId === workspaceId).map((item) => item.opportunityReferenceId),
  )].sort();
  const [evidence, detectors] = await Promise.all([
    store.loadEvidence({ workspaceId, opportunityReferenceIds, limitPerOpportunity: maxEvidencePerOpportunity }),
    store.loadDetectors({ workspaceId }),
  ]);
  const planned = await runShadowMonitoring({
    workspaceId,
    changedEvidence,
    evidence,
    detectors,
    maxChangedEvidencePerRun,
    maxDetectorsPerRun,
  });
  const createdCases: ShadowCase[] = [];
  const duplicateCaseKeys = [...planned.duplicateCaseKeys];
  for (const candidate of planned.createdCases) {
    const result = await store.upsertCase(candidate);
    if (result === "created") createdCases.push(candidate);
    else duplicateCaseKeys.push(candidate.dedupeKey);
  }
  return { ...planned, createdCases, duplicateCaseKeys };
};
