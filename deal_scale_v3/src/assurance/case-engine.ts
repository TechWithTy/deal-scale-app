import { createHash } from "node:crypto";

import { z } from "zod";

import {
  assuranceCaseSchema,
  detectorCandidateSchema,
  evidenceReferenceSchema,
} from "src/assurance/schema";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const uuidV4 = z.string().regex(UUID_V4, "Expected a UUID v4");
const evidenceExpectationSchema = z.object({
  evidenceType: z.string().min(1),
  provenanceRef: z.string().min(1),
  sourceVersion: z.string().min(1),
});
const evidenceObservationSchema = evidenceReferenceSchema.omit({ assuranceCaseId: true });
const caseStatusSchema = z.enum(["open", "accepted", "rejected", "closed"]);

export type EvidenceExpectation = z.infer<typeof evidenceExpectationSchema>;
export type EvidenceObservationInput = z.input<typeof evidenceObservationSchema>;
type EvidenceObservation = z.output<typeof evidenceObservationSchema>;
export type DetectorCandidateInput = z.input<typeof detectorCandidateSchema> & {
  id?: string;
  expectedEvidence?: readonly EvidenceExpectation[];
};
export type CaseStatus = z.infer<typeof caseStatusSchema>;

export type CanonicalDetectorCandidate = z.output<typeof detectorCandidateSchema> & {
  id: string;
  expectedEvidence: readonly EvidenceExpectation[];
};

export type EvidenceAssessment = {
  expected: readonly EvidenceExpectation[];
  actual: readonly EvidenceObservation[];
  missing: readonly EvidenceExpectation[];
  unexpected: readonly EvidenceObservation[];
  excludedTenantEvidenceCount: number;
};

export type AuditEvent = {
  id: string;
  action: "assembled" | "transitioned";
  actorId: string;
  from: CaseStatus | null;
  to: CaseStatus;
  occurredAt: Date;
};

type CanonicalEvidenceReference = z.output<typeof evidenceReferenceSchema> & { id: string };

export type CanonicalAssuranceCase = z.output<typeof assuranceCaseSchema> & {
  id: string;
  expectedEvidence: readonly EvidenceExpectation[];
  evidence: EvidenceAssessment;
  evidenceReferences: readonly CanonicalEvidenceReference[];
  auditHistory: readonly AuditEvent[];
};

export type CaseAssemblyOptions = {
  opportunityReferenceId: string;
  actualEvidence?: readonly EvidenceObservationInput[];
  expectedEvidence?: readonly EvidenceExpectation[];
  observedAt?: string | Date;
};

export type CaseAssemblyResult =
  | {
      kind: "case";
      case: CanonicalAssuranceCase;
      candidate: CanonicalDetectorCandidate;
      evidence: EvidenceAssessment;
    }
  | {
      kind: "insufficient_evidence";
      case?: undefined;
      candidate: CanonicalDetectorCandidate;
      evidence: EvidenceAssessment;
    };

export type DedupedCandidates = {
  candidates: readonly CanonicalDetectorCandidate[];
  duplicates: readonly CanonicalDetectorCandidate[];
};

export type TransitionOptions = {
  actorId: string;
  occurredAt?: string | Date;
};

export type TransitionResult =
  | { ok: true; case: CanonicalAssuranceCase }
  | {
      ok: false;
      reason: "invalid_transition";
      from: CaseStatus;
      to: CaseStatus;
      allowed: readonly CaseStatus[];
    };

export const VALID_REVIEW_TRANSITIONS: Readonly<Record<CaseStatus, readonly CaseStatus[]>> = {
  open: ["accepted", "rejected"],
  accepted: ["closed"],
  rejected: ["closed"],
  closed: [],
};

const deterministicUuidV4 = (seed: string) => {
  const bytes = createHash("sha256").update(seed).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Buffer.from(bytes).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const parseExpectedEvidence = (expected: readonly EvidenceExpectation[] | undefined) =>
  evidenceExpectationSchema.array().parse(expected ?? []).sort((left, right) =>
    `${left.evidenceType}|${left.provenanceRef}|${left.sourceVersion}`.localeCompare(
      `${right.evidenceType}|${right.provenanceRef}|${right.sourceVersion}`,
    ),
  );

export const canonicalizeDetectorCandidate = (
  input: DetectorCandidateInput,
): CanonicalDetectorCandidate => {
  const base = detectorCandidateSchema.parse(input);
  const expectedEvidence = parseExpectedEvidence(input.expectedEvidence);
  const id = input.id
    ? uuidV4.parse(input.id)
    : deterministicUuidV4(`detector-candidate|${base.workspaceId}|${base.externalId}`);

  return { ...base, id, expectedEvidence };
};

const candidateFingerprint = (candidate: CanonicalDetectorCandidate) =>
  JSON.stringify({ ...candidate, id: undefined });

const compareCandidates = (left: CanonicalDetectorCandidate, right: CanonicalDetectorCandidate) => {
  if (left.recordVersion !== right.recordVersion) return right.recordVersion - left.recordVersion;
  const observedDifference = right.observedAt.getTime() - left.observedAt.getTime();
  if (observedDifference !== 0) return observedDifference;
  return candidateFingerprint(left).localeCompare(candidateFingerprint(right));
};

export const dedupeDetectorCandidates = (
  inputs: readonly DetectorCandidateInput[],
): DedupedCandidates => {
  const winners = new Map<string, CanonicalDetectorCandidate>();
  const duplicates: CanonicalDetectorCandidate[] = [];

  for (const candidate of inputs.map(canonicalizeDetectorCandidate)) {
    const key = `${candidate.workspaceId}|${candidate.externalId}`;
    const current = winners.get(key);
    if (!current) {
      winners.set(key, candidate);
    } else if (compareCandidates(candidate, current) < 0) {
      winners.set(key, candidate);
      duplicates.push(current);
    } else {
      duplicates.push(candidate);
    }
  }

  return {
    candidates: [...winners.values()].sort((left, right) =>
      `${left.workspaceId}|${left.externalId}`.localeCompare(`${right.workspaceId}|${right.externalId}`),
    ),
    duplicates: duplicates.sort((left, right) =>
      `${left.workspaceId}|${left.externalId}|${left.recordVersion}`.localeCompare(
        `${right.workspaceId}|${right.externalId}|${right.recordVersion}`,
      ),
    ),
  };
};

const assessEvidence = (
  expected: readonly EvidenceExpectation[],
  input: readonly EvidenceObservationInput[],
  workspaceId: string,
): EvidenceAssessment => {
  const parsed = input.map((item) => evidenceObservationSchema.parse(item));
  const actual = parsed.filter((item) => item.workspaceId === workspaceId);
  const excludedTenantEvidenceCount = parsed.length - actual.length;
  const matches = (expectation: EvidenceExpectation, observation: EvidenceObservation) =>
    expectation.evidenceType === observation.evidenceType &&
    expectation.provenanceRef === observation.provenanceRef &&
    expectation.sourceVersion === observation.sourceVersion;
  const missing = expected.filter((item) => !actual.some((observation) => matches(item, observation)));
  const unexpected = actual.filter(
    (observation) => !expected.some((expectation) => matches(expectation, observation)),
  );

  return { expected, actual, missing, unexpected, excludedTenantEvidenceCount };
};

export const assembleAssuranceCase = (
  input: DetectorCandidateInput,
  options: CaseAssemblyOptions,
): CaseAssemblyResult => {
  const candidateBase = canonicalizeDetectorCandidate(input);
  const expectedEvidence = parseExpectedEvidence(options.expectedEvidence ?? candidateBase.expectedEvidence);
  const candidate = { ...candidateBase, expectedEvidence };
  const evidence = assessEvidence(expectedEvidence, options.actualEvidence ?? [], candidate.workspaceId);

  if (evidence.missing.length > 0) return { kind: "insufficient_evidence", candidate, evidence };

  const observedAt = options.observedAt
    ? z.coerce.date().parse(options.observedAt)
    : candidate.observedAt;
  const caseId = deterministicUuidV4(
    `assurance-case|${candidate.workspaceId}|${candidate.id}|${options.opportunityReferenceId}`,
  );
  const evidenceReferences = evidence.actual.map((item) => ({
    ...evidenceReferenceSchema.parse({ ...item, assuranceCaseId: caseId }),
    id: deterministicUuidV4(`evidence-reference|${caseId}|${item.contentHash}|${item.provenanceRef}`),
  }));
  const auditHistory: AuditEvent[] = [
    {
      id: deterministicUuidV4(`audit|${caseId}|assembled|${observedAt.toISOString()}`),
      action: "assembled",
      actorId: "case-engine",
      from: null,
      to: "open",
      occurredAt: observedAt,
    },
  ];
  const baseCase = assuranceCaseSchema.parse({
    name: `${candidate.name} assurance case`,
    externalId: `case:${candidate.externalId}`,
    workspaceId: candidate.workspaceId,
    provenanceState: "inferred",
    provenanceRef: `case-engine://${candidate.provenanceRef}`,
    sourceVersion: "case-engine/v1",
    recordVersion: candidate.recordVersion,
    observedAt,
    opportunityReferenceId: options.opportunityReferenceId,
    detectorCandidateId: candidate.id,
    caseStatus: "open",
  });

  return {
    kind: "case",
    candidate,
    evidence,
    case: { ...baseCase, id: caseId, expectedEvidence, evidence, evidenceReferences, auditHistory },
  };
};

export const assembleAssuranceCases = (
  inputs: readonly DetectorCandidateInput[],
  options: CaseAssemblyOptions,
) => dedupeDetectorCandidates(inputs).candidates.map((candidate) => assembleAssuranceCase(candidate, options));

export const isValidCaseTransition = (from: CaseStatus, to: CaseStatus) =>
  VALID_REVIEW_TRANSITIONS[from]?.includes(to) ?? false;

export const transitionAssuranceCase = (
  current: CanonicalAssuranceCase,
  to: CaseStatus,
  options: TransitionOptions,
): TransitionResult => {
  const allowed = VALID_REVIEW_TRANSITIONS[current.caseStatus] ?? [];
  if (!isValidCaseTransition(current.caseStatus, to)) {
    return { ok: false, reason: "invalid_transition", from: current.caseStatus, to, allowed };
  }

  const occurredAt = options.occurredAt
    ? z.coerce.date().parse(options.occurredAt)
    : current.observedAt;
  const auditEvent: AuditEvent = {
    id: deterministicUuidV4(
      `audit|${current.id}|${current.auditHistory.length}|${current.caseStatus}|${to}|${options.actorId}|${occurredAt.toISOString()}`,
    ),
    action: "transitioned",
    actorId: z.string().min(1).parse(options.actorId),
    from: current.caseStatus,
    to,
    occurredAt,
  };

  return {
    ok: true,
    case: { ...current, caseStatus: to, auditHistory: [...current.auditHistory, auditEvent] },
  };
};
