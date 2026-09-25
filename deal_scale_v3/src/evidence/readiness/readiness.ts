import {
	 type DetectorAssessment,
	 type DetectorEvidenceRequirement,
	 type DetectorReadiness,
	 type EvidenceReadinessInput,
	 type EvidenceReadinessScorecard,
	 type EvidenceSource,
	 type EvidenceType,
	 type GatedDetectorAssessment,
	 type ReadinessStatus,
	 type ReadinessWarning,
	 type ReadinessWarningCode,
	 type SourceReadiness,
	 type SyncFreshness,
} from "./types";

const DEFAULT_FRESHNESS_MS = 24 * 60 * 60 * 1000;

const uniqueSorted = <T extends string>(values: readonly T[]): T[] =>
	[...new Set(values)].sort((left, right) => left.localeCompare(right));

const asDate = (value: Date | string | null): Date | null => {
	if (value === null) return null;
	const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
};

const hasInvalidSyncTimestamp = (source: EvidenceSource, asOf: Date) => {
	if (source.lastSyncedAt === null) return false;
	const timestamp = asDate(source.lastSyncedAt);
	return timestamp === null || timestamp.getTime() > asOf.getTime();
};

const syncFreshness = (source: EvidenceSource, asOf: Date, maxAgeMs: number): SyncFreshness => {
	const lastSyncedAt = asDate(source.lastSyncedAt);
	if (!lastSyncedAt) return "never_synced";
	return asOf.getTime() - lastSyncedAt.getTime() <= maxAgeMs ? "fresh" : "stale";
};

const sourceHasType = (source: EvidenceSource, evidenceType: EvidenceType) =>
	source.evidenceTypes.includes(evidenceType);

const warning = (
	code: ReadinessWarningCode,
	detectorType: string,
	message: string,
	evidenceType?: EvidenceType,
): ReadinessWarning => ({ code, detectorType, message, ...(evidenceType ? { evidenceType } : {}) });

const connectedSources = (sources: readonly EvidenceSource[], type: EvidenceType) =>
	sources.filter((source) => source.connectionStatus === "connected" && sourceHasType(source, type));

const availableSources = (sources: readonly EvidenceSource[], type: EvidenceType) =>
	connectedSources(sources, type).filter((source) => source.sourceAvailability === "available");

const freshSources = (
	sources: readonly EvidenceSource[],
	type: EvidenceType,
	asOf: Date,
	maxAgeMs: number,
) => availableSources(sources, type).filter((source) => syncFreshness(source, asOf, maxAgeMs) === "fresh");

const sourceWarnings = (source: EvidenceSource, asOf: Date): ReadinessWarning[] => {
	const freshness = syncFreshness(source, asOf, DEFAULT_FRESHNESS_MS);
	const warnings: ReadinessWarning[] = [];
	if (hasInvalidSyncTimestamp(source, asOf)) {
		warnings.push(warning("invalid_sync_timestamp", "source", `Source ${source.sourceId} has an invalid or future sync timestamp.`));
	}
	if (source.connectionStatus !== "connected") {
		warnings.push(warning("disconnected_source", "source", `Source ${source.sourceId} is not connected.`));
	}
	if (source.sourceAvailability !== "available") {
		warnings.push(warning("source_unavailable", "source", `Source ${source.sourceId} is ${source.sourceAvailability}.`));
	}
	if (freshness === "never_synced") {
		warnings.push(warning("never_synced", "source", `Source ${source.sourceId} has never synced.`));
	} else if (freshness === "stale") {
		warnings.push(warning("stale_sync", "source", `Source ${source.sourceId} is stale.`));
	}
	return warnings;
};

const sourceReadiness = (source: EvidenceSource, asOf: Date): SourceReadiness => {
	const evidenceTypes = uniqueSorted(source.evidenceTypes);
	const connectedEvidenceTypes = source.connectionStatus === "connected" ? evidenceTypes : [];
	const score =
		(source.connectionStatus === "connected" ? 40 : 0) +
		(syncFreshness(source, asOf, DEFAULT_FRESHNESS_MS) === "fresh" ? 25 : 0) +
		(source.transcriptAvailability === "available" ? 20 : 0) +
		(source.sourceAvailability === "available" ? 15 : 0);
	return {
		sourceId: source.sourceId,
		provider: source.provider,
		evidenceTypes,
		connectedEvidenceTypes,
		syncFreshness: syncFreshness(source, asOf, DEFAULT_FRESHNESS_MS),
		transcriptAvailability: source.transcriptAvailability,
		sourceAvailability: source.sourceAvailability,
		score,
		warnings: sourceWarnings(source, asOf),
	};
};

const detectorWarnings = (
	requirement: DetectorEvidenceRequirement,
	type: EvidenceType,
	sources: readonly EvidenceSource[],
	asOf: Date,
): ReadinessWarning[] => {
	const matching = sources.filter((source) => sourceHasType(source, type));
	const connected = connectedSources(sources, type);
	const available = availableSources(sources, type);
	const fresh = freshSources(sources, type, asOf, requirement.maxSyncAgeMs);
	const warnings: ReadinessWarning[] = [];
	if (matching.some((source) => hasInvalidSyncTimestamp(source, asOf))) {
		warnings.push(warning("invalid_sync_timestamp", requirement.detectorType, `${type} has an invalid or future sync timestamp.`, type));
	}
	if (connected.length === 0) {
		warnings.push(warning("missing_evidence_type", requirement.detectorType, `Required evidence type ${type} is not connected.`, type));
		if (matching.some((source) => source.connectionStatus !== "connected")) {
			warnings.push(warning("disconnected_source", requirement.detectorType, `No connected source provides ${type}.`, type));
		}
		if (matching.some((source) => source.sourceAvailability !== "available")) {
			warnings.push(warning("source_unavailable", requirement.detectorType, `No available source provides ${type}.`, type));
		}
		if (matching.length > 0 && matching.every((source) => syncFreshness(source, asOf, requirement.maxSyncAgeMs) === "never_synced")) {
			warnings.push(warning("never_synced", requirement.detectorType, `${type} has never been synced.`, type));
		}
	}
	if (connected.length > 0 && available.length === 0) {
		warnings.push(warning("source_unavailable", requirement.detectorType, `No available source provides ${type}.`, type));
		if (connected.every((source) => syncFreshness(source, asOf, requirement.maxSyncAgeMs) === "never_synced")) {
			warnings.push(warning("never_synced", requirement.detectorType, `${type} has never been synced.`, type));
		}
	}
	if (available.length > 0 && fresh.length === 0) {
		const neverSynced = available.every((source) => syncFreshness(source, asOf, requirement.maxSyncAgeMs) === "never_synced");
		warnings.push(warning(neverSynced ? "never_synced" : "stale_sync", requirement.detectorType, `${type} has no fresh source data.`, type));
	}
	return warnings;
};

const dedupeWarnings = (warnings: readonly ReadinessWarning[]) =>
	warnings.filter((item, index, all) => all.findIndex((candidate) =>
		candidate.code === item.code && candidate.detectorType === item.detectorType && candidate.evidenceType === item.evidenceType,
	) === index);

const detectorReadiness = (
	requirement: DetectorEvidenceRequirement,
	sources: readonly EvidenceSource[],
	asOf: Date,
): DetectorReadiness => {
	const required = uniqueSorted(requirement.requiredEvidenceTypes);
	const connected = required.filter((type) => connectedSources(sources, type).length > 0);
	const available = required.filter((type) => availableSources(sources, type).length > 0);
	const fresh = required.filter((type) => freshSources(sources, type, asOf, requirement.maxSyncAgeMs).length > 0);
	const missing = required.filter((type) => !connected.includes(type));
	const transcriptAvailable = !requirement.requiresTranscript || sources.some((source) =>
		source.connectionStatus === "connected" && source.sourceAvailability === "available" && source.transcriptAvailability === "available",
	);
	const sourceAvailable = required.length === 0 || available.length === required.length;
	const score = Math.round(
		(required.length ? (connected.length / required.length) * 40 : 40) +
		(required.length ? (fresh.length / required.length) * 25 : 25) +
		(transcriptAvailable ? 20 : 0) + (sourceAvailable ? 15 : 0),
	);
	const warnings = dedupeWarnings([
		...required.flatMap((type) => detectorWarnings(requirement, type, sources, asOf)),
		...(requirement.requiresTranscript && !transcriptAvailable
			? [warning("transcript_unavailable", requirement.detectorType, "Required transcript evidence is unavailable.", "transcript")]
			: []),
	]);
	const status: ReadinessStatus = missing.length > 0 || !sourceAvailable || !transcriptAvailable
		? "insufficient_evidence"
		: fresh.length < required.length ? "degraded" : "ready";
	return {
		detectorType: requirement.detectorType,
		score,
		status,
		connectedEvidenceTypes: connected,
		freshEvidenceTypes: fresh,
		missingEvidenceTypes: missing,
		transcriptAvailable,
		sourceAvailable,
		warnings,
		coverageGaps: warnings,
	};
};

export const calculateEvidenceReadiness = (input: EvidenceReadinessInput): EvidenceReadinessScorecard => {
	const asOf = asDate(input.asOf);
	if (!asOf) throw new Error("Evidence readiness requires a valid asOf date.");
	const sources = input.sources.filter((source) => source.tenantId === input.tenantId).sort((a, b) => a.sourceId.localeCompare(b.sourceId));
	const detectors = [...input.detectors].sort((a, b) => a.detectorType.localeCompare(b.detectorType)).map((requirement) => detectorReadiness(requirement, sources, asOf));
	const sourceReadinesses = sources.map((source) => sourceReadiness(source, asOf));
	const connectedEvidenceTypes = uniqueSorted(sources.filter((source) => source.connectionStatus === "connected").flatMap((source) => source.evidenceTypes));
	const warnings = detectors.length === 0
		? [warning("no_detector_coverage", "readiness", "No detector coverage is configured for this tenant.")]
		: [];
	const overallScore = Math.round(detectors.length
		? detectors.reduce((total, detector) => total + detector.score, 0) / detectors.length
		: 0);
	const overallStatus: ReadinessStatus = detectors.length === 0 || detectors.some((detector) => detector.status === "insufficient_evidence")
		? "insufficient_evidence"
		: detectors.some((detector) => detector.status === "degraded") ? "degraded" : "ready";
	return { tenantId: input.tenantId, asOf: asOf.toISOString(), overallScore, overallStatus, connectedEvidenceTypes, warnings, sources: sourceReadinesses, detectors };
};

export const applyEvidenceReadinessGate = (
	assessment: DetectorAssessment,
	readiness: Pick<DetectorReadiness, "status">,
): GatedDetectorAssessment => readiness.status === "insufficient_evidence"
	? { confidence: 0, certainty: "insufficient_evidence", evidenceReadinessStatus: readiness.status }
	: { confidence: readiness.status === "degraded" ? Math.min(assessment.confidence, 0.5) : assessment.confidence, certainty: readiness.status === "degraded" && assessment.certainty === "confirmed" ? "candidate" : assessment.certainty, evidenceReadinessStatus: readiness.status };
