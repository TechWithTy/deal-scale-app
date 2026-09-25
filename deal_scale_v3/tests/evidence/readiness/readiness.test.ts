import { describe, expect, it } from "vitest";

import {
	applyEvidenceReadinessGate,
	buildAssuranceCaseDetail,
	calculateEvidenceReadiness,
	type DetectorAssessment,
	type EvidenceReadinessInput,
	type EvidenceSource,
} from "../../../src/evidence/readiness";

const TENANT_ID = "tenant-a";
const AS_OF = "2026-09-24T12:00:00.000Z";
const DAY_MS = 24 * 60 * 60 * 1000;

const source = (overrides: Partial<EvidenceSource> = {}): EvidenceSource => ({
	tenantId: TENANT_ID,
	sourceId: "crm",
	provider: "twenty",
	connectionStatus: "connected",
	sourceAvailability: "available",
	evidenceTypes: ["crm_record", "email"],
	lastSyncedAt: "2026-09-24T11:00:00.000Z",
	transcriptAvailability: "unknown",
	...overrides,
});

const input = (overrides: Partial<EvidenceReadinessInput> = {}): EvidenceReadinessInput => ({
	tenantId: TENANT_ID,
	asOf: AS_OF,
	sources: [
		source(),
		source({
			sourceId: "transcripts",
			provider: "call-provider",
			evidenceTypes: ["transcript"],
			lastSyncedAt: "2026-09-24T10:00:00.000Z",
			transcriptAvailability: "available",
		}),
	],
	detectors: [
		{
			detectorType: "broken_commitment",
			requiredEvidenceTypes: ["crm_record", "email", "transcript"],
			requiresTranscript: true,
			maxSyncAgeMs: DAY_MS,
		},
	],
	...overrides,
});

describe("evidence readiness", () => {
	it("produces a deterministic audit-readiness scorecard", () => {
		const result = calculateEvidenceReadiness(input());

		expect(result.overallStatus).toBe("ready");
		expect(result.overallScore).toBe(100);
		expect(result.connectedEvidenceTypes).toEqual(["crm_record", "email", "transcript"]);
		expect(result.detectors).toEqual([
			expect.objectContaining({
				detectorType: "broken_commitment",
				status: "ready",
				score: 100,
				missingEvidenceTypes: [],
				coverageGaps: [],
			}),
		]);
		expect(result.sources).toEqual([
			expect.objectContaining({
			sourceId: "crm",
			syncFreshness: "fresh",
			evidenceTypes: ["crm_record", "email"],
		}),
			expect.objectContaining({
			sourceId: "transcripts",
			transcriptAvailability: "available",
		}),
		]);
	});

	it("is stable when source and detector inputs arrive in a different order", () => {
		const original = calculateEvidenceReadiness(input());
		const reordered = calculateEvidenceReadiness(
			input({ sources: [...input().sources].reverse(), detectors: [...input().detectors].reverse() }),
		);

		expect(reordered).toEqual(original);
	});

	it("downgrades incomplete detector evidence and exposes case coverage gaps", () => {
		const result = calculateEvidenceReadiness(
			input({
				sources: [
					source({
						evidenceTypes: ["crm_record"],
						lastSyncedAt: "2026-09-22T12:00:00.000Z",
						transcriptAvailability: "unavailable",
					}),
				],
			}),
		);
		const detector = result.detectors[0];

		expect(result.overallStatus).toBe("insufficient_evidence");
		expect(detector).toEqual(
			expect.objectContaining({
			status: "insufficient_evidence",
			missingEvidenceTypes: ["email", "transcript"],
		}),
		);
		expect(detector.warnings.map((item) => item.code)).toEqual(
			expect.arrayContaining(["missing_evidence_type", "stale_sync", "transcript_unavailable"]),
		);

		const assessment: DetectorAssessment = { confidence: 0.91, certainty: "confirmed" };
		expect(applyEvidenceReadinessGate(assessment, detector)).toEqual({
			confidence: 0,
			certainty: "insufficient_evidence",
			evidenceReadinessStatus: "insufficient_evidence",
		});

		expect(buildAssuranceCaseDetail({ caseId: "case-001", detectorType: detector.detectorType, readiness: result })).toEqual(
			expect.objectContaining({
				caseId: "case-001",
				evidenceReadinessStatus: "insufficient_evidence",
				coverageGaps: expect.arrayContaining([
					expect.objectContaining({ code: "missing_evidence_type", evidenceType: "email" }),
				]),
			}),
		);
	});

	it("does not use another tenant's sources", () => {
		const result = calculateEvidenceReadiness(
			input({
				sources: [
					source({ evidenceTypes: ["crm_record"] }),
					source({
						tenantId: "tenant-b",
						sourceId: "foreign-crm",
						evidenceTypes: ["email", "transcript"],
						transcriptAvailability: "available",
					}),
				],
			}),
		);

		expect(result.sources.map(({ sourceId }) => sourceId)).toEqual(["crm"]);
		expect(result.detectors[0].missingEvidenceTypes).toEqual(["email", "transcript"]);
		expect(JSON.stringify(result)).not.toContain("foreign-crm");
	});

	it("reports disconnected, unavailable, and never-synced coverage separately", () => {
		const result = calculateEvidenceReadiness(
			input({
				sources: [
					source({
						sourceId: "email-provider",
						evidenceTypes: ["email"],
						connectionStatus: "disconnected",
						sourceAvailability: "unavailable",
						lastSyncedAt: null,
					}),
				],
				detectors: [{ detectorType: "email_follow_up", requiredEvidenceTypes: ["email"], maxSyncAgeMs: DAY_MS }],
			}),
		);

		expect(result.detectors[0].warnings.map((item) => item.code)).toEqual(
			expect.arrayContaining(["disconnected_source", "source_unavailable", "never_synced"]),
		);
		expect(result.detectors[0].status).toBe("insufficient_evidence");
	});

	it("does not report readiness when no detector coverage is configured", () => {
		const result = calculateEvidenceReadiness(input({ detectors: [] }));

		expect(result.overallStatus).toBe("insufficient_evidence");
		expect(result.overallScore).toBe(0);
		expect(result.warnings).toEqual([
			expect.objectContaining({ code: "no_detector_coverage" }),
		]);
	});

	it("treats future sync timestamps as invalid coverage", () => {
		const result = calculateEvidenceReadiness(
			input({
				sources: [source({ lastSyncedAt: "2026-09-25T12:00:00.000Z" })],
			}),
		);

		expect(result.detectors[0].status).toBe("insufficient_evidence");
		expect(result.detectors[0].warnings).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ code: "invalid_sync_timestamp" }),
			]),
		);
		expect(result.warnings).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ code: "invalid_sync_timestamp" }),
			]),
		);
	});

	it("never counts a future sync as fresh when it is the only required source", () => {
		const result = calculateEvidenceReadiness(
			input({
				sources: [source({ evidenceTypes: ["crm_record"], lastSyncedAt: "2026-09-25T12:00:00.000Z" })],
				detectors: [{ detectorType: "crm_only", requiredEvidenceTypes: ["crm_record"], maxSyncAgeMs: DAY_MS }],
			}),
		);

		expect(result.detectors[0].freshEvidenceTypes).toEqual([]);
		expect(result.detectors[0].status).toBe("degraded");
	});

	it("downgrades confirmed assessments when readiness is degraded", () => {
		const result = calculateEvidenceReadiness(
			input({
				sources: input().sources.map((item) => item.sourceId === "crm" ? { ...item, lastSyncedAt: "2026-09-22T12:00:00.000Z" } : item),
			}),
		);
		const assessment: DetectorAssessment = { confidence: 0.91, certainty: "confirmed" };

		expect(result.detectors[0].status).toBe("degraded");
		expect(applyEvidenceReadinessGate(assessment, result.detectors[0])).toEqual({
			confidence: 0.5,
			certainty: "candidate",
			evidenceReadinessStatus: "degraded",
		});
	});
});
