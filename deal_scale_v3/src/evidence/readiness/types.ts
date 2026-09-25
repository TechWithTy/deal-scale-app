export const EVIDENCE_TYPES = [
	"crm_record",
	"email",
	"calendar",
	"transcript",
	"call_recording",
	"document",
] as const;

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];
export type ConnectionStatus = "connected" | "disconnected" | "error";
export type SourceAvailability = "available" | "unavailable" | "unknown";
export type TranscriptAvailability = "available" | "unavailable" | "unknown";
export type SyncFreshness = "fresh" | "stale" | "never_synced";
export type ReadinessStatus = "ready" | "degraded" | "insufficient_evidence";

export interface EvidenceSource {
	readonly tenantId: string;
	readonly sourceId: string;
	readonly provider: string;
	readonly connectionStatus: ConnectionStatus;
	readonly sourceAvailability: SourceAvailability;
	readonly evidenceTypes: readonly EvidenceType[];
	readonly lastSyncedAt: Date | string | null;
	readonly transcriptAvailability: TranscriptAvailability;
}

export interface DetectorEvidenceRequirement {
	readonly detectorType: string;
	readonly requiredEvidenceTypes: readonly EvidenceType[];
	readonly requiresTranscript?: boolean;
	readonly maxSyncAgeMs: number;
}

export interface EvidenceReadinessInput {
	readonly tenantId: string;
	readonly asOf: Date | string;
	readonly sources: readonly EvidenceSource[];
	readonly detectors: readonly DetectorEvidenceRequirement[];
}

export type ReadinessWarningCode =
  | "missing_evidence_type"
  | "stale_sync"
  | "never_synced"
  | "invalid_sync_timestamp"
  | "transcript_unavailable"
  | "source_unavailable"
  | "disconnected_source"
  | "no_detector_coverage";

export interface ReadinessWarning {
	readonly code: ReadinessWarningCode;
	readonly detectorType: string;
	readonly evidenceType?: EvidenceType;
	readonly message: string;
}

export interface SourceReadiness {
	readonly sourceId: string;
	readonly provider: string;
	readonly evidenceTypes: readonly EvidenceType[];
	readonly connectedEvidenceTypes: readonly EvidenceType[];
	readonly syncFreshness: SyncFreshness;
	readonly transcriptAvailability: TranscriptAvailability;
	readonly sourceAvailability: SourceAvailability;
	readonly score: number;
	readonly warnings: readonly ReadinessWarning[];
}

export interface DetectorReadiness {
	readonly detectorType: string;
	readonly score: number;
	readonly status: ReadinessStatus;
	readonly connectedEvidenceTypes: readonly EvidenceType[];
	readonly freshEvidenceTypes: readonly EvidenceType[];
	readonly missingEvidenceTypes: readonly EvidenceType[];
	readonly transcriptAvailable: boolean;
	readonly sourceAvailable: boolean;
	readonly warnings: readonly ReadinessWarning[];
	readonly coverageGaps: readonly ReadinessWarning[];
}

export interface EvidenceReadinessScorecard {
	readonly tenantId: string;
	readonly asOf: string;
	readonly overallScore: number;
	readonly overallStatus: ReadinessStatus;
  readonly connectedEvidenceTypes: readonly EvidenceType[];
  readonly warnings: readonly ReadinessWarning[];
  readonly sources: readonly SourceReadiness[];
	readonly detectors: readonly DetectorReadiness[];
}

export interface DetectorAssessment {
	readonly confidence: number;
	readonly certainty: "confirmed" | "candidate" | "insufficient_evidence";
}

export interface GatedDetectorAssessment extends DetectorAssessment {
	readonly evidenceReadinessStatus: ReadinessStatus;
}

export interface AssuranceCaseDetail {
	readonly caseId: string;
	readonly detectorType: string;
	readonly evidenceReadinessStatus: ReadinessStatus;
	readonly evidenceReadinessScore: number;
	readonly missingEvidenceTypes: readonly EvidenceType[];
	readonly coverageGaps: readonly ReadinessWarning[];
}
