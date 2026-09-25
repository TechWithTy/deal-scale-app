import { createHash } from "node:crypto";

import { z } from "zod";

import type { AssuranceCaseStatus } from "src/assurance/common-fields";
import {
  assuranceCaseProjectionSchema,
  assuranceCaseSchema,
  detectorCandidateSchema,
  evidenceReferenceSchema,
} from "src/assurance/schema";
import { canTransitionAssuranceCase, type AssuranceRole } from "src/security/rbac";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const uuidV4 = z.string().regex(UUID_V4, "Expected a UUID v4");
const evidenceExpectationSchema = z.object({
  evidenceType: z.string().min(1),
  provenanceRef: z.string().min(1),
  sourceVersion: z.string().min(1),
});
const evidenceObservationSchema = evidenceReferenceSchema.omit({ assuranceCaseId: true });

export type EvidenceExpectation = z.infer<typeof evidenceExpectationSchema>;
export type EvidenceObservationInput = z.input<typeof evidenceObservationSchema>;
type EvidenceObservation = z.output<typeof evidenceObservationSchema>;
export type DetectorCandidateInput = z.input<typeof detectorCandidateSchema> & {
  id?: string;
  expectedEvidence?: readonly EvidenceExpectation[];
};
export type CaseStatus = AssuranceCaseStatus;

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
  actor: string;
  prior: CaseStatus | null;
  next: CaseStatus;
  observedAt: Date;
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
  opportunityReferenceWorkspaceId?: string;
  opportunityReference?: { externalId: string; workspaceId: string };
  actualEvidence?: readonly EvidenceObservationInput[];
  expectedEvidence?: readonly EvidenceExpectation[];
  observedAt?: string | Date;
};

export type CaseAssemblyResult = {
  kind: "case";
  case: CanonicalAssuranceCase;
  candidate: CanonicalDetectorCandidate;
  evidence: EvidenceAssessment;
};

export type DedupedCandidates = {
  candidates: readonly CanonicalDetectorCandidate[];
  duplicates: readonly CanonicalDetectorCandidate[];
};

export type TransitionOptions = {
  actorId: string;
  role: AssuranceRole;
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
    }
  | {
      ok: false;
      reason: "audit_out_of_order";
      previousObservedAt: Date;
      observedAt: Date;
    };

export const VALID_REVIEW_TRANSITIONS: Readonly<Record<CaseStatus, readonly CaseStatus[]>> = {
  "needs-review": ["confirmed-failure", "expected-behavior", "insufficient-evidence", "false-positive"],
  "confirmed-failure": ["resolved"],
  "expected-behavior": ["outcome"],
  "insufficient-evidence": ["needs-review"],
  "false-positive": ["outcome"],
  resolved: ["outcome"],
  outcome: [],
};

export const deterministicUuidV4 = (seed: string) => {
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
  const fingerprintDifference = candidateFingerprint(left).localeCompare(candidateFingerprint(right));
  return fingerprintDifference !== 0 ? fingerprintDifference : left.id.localeCompare(right.id);
};

export const dedupeDetectorCandidates = (
  inputs: readonly DetectorCandidateInput[],
): DedupedCandidates => {
  const winners = new Map<string, CanonicalDetectorCandidate>();
  const duplicates: CanonicalDetectorCandidate[] = [];

  for (const candidate of inputs.map(canonicalizeDetectorCandidate)) {
    const key = `${candidate.workspaceId}|${candidate.externalId}`;
    const current = winners.get(key);
    if (!current) winners.set(key, candidate);
    else if (compareCandidates(candidate, current) < 0) {
      winners.set(key, candidate);
      duplicates.push(current);
    } else duplicates.push(candidate);
  }

  return {
    candidates: [...winners.values()].sort((left, right) =>
      `${left.workspaceId}|${left.externalId}`.localeCompare(`${right.workspaceId}|${right.externalId}`),
    ),
    duplicates: duplicates.sort((left, right) =>
      `${left.workspaceId}|${left.externalId}|${left.recordVersion}|${left.id}`.localeCompare(
        `${right.workspaceId}|${right.externalId}|${right.recordVersion}|${right.id}`,
      ),
    ),
  };
};

const evidenceFingerprint = (observation: EvidenceObservation) =>
  JSON.stringify({
    workspaceId: observation.workspaceId,
    externalId: observation.externalId,
    sourceVersion: observation.sourceVersion,
    recordVersion: observation.recordVersion,
    name: observation.name,
    provenanceState: observation.provenanceState,
    provenanceRef: observation.provenanceRef,
    observedAt: observation.observedAt.toISOString(),
    eventId: observation.eventId,
    evidenceType: observation.evidenceType,
    contentHash: observation.contentHash,
  });

const assessEvidence = (
  expected: readonly EvidenceExpectation[],
  input: readonly EvidenceObservationInput[],
  workspaceId: string,
): EvidenceAssessment => {
  const parsed = input.map((item) => evidenceObservationSchema.parse(item));
  const actual = parsed.filter((item) => item.workspaceId === workspaceId).sort((left, right) =>
    evidenceFingerprint(left).localeCompare(evidenceFingerprint(right)),
  );
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

export const caseDedupeKey = (
  assuranceCase: Pick<CanonicalAssuranceCase, "workspaceId" | "detectorCandidateId" | "opportunityReferenceId">,
) =>
  `case:${assuranceCase.workspaceId}:${assuranceCase.detectorCandidateId}:${assuranceCase.opportunityReferenceId}`;

const assertOpportunityOwnership = (
  candidateWorkspaceId: string,
  options: CaseAssemblyOptions,
) => {
  const assertedWorkspaceIds = [
    options.opportunityReferenceWorkspaceId,
    options.opportunityReference?.workspaceId,
  ].filter((value): value is string => Boolean(value));
  if (assertedWorkspaceIds.length === 0 || assertedWorkspaceIds.some((id) => id !== candidateWorkspaceId)) {
    throw new Error("opportunityReferenceWorkspaceId must match candidate workspaceId");
  }
  if (options.opportunityReference && options.opportunityReference.externalId !== options.opportunityReferenceId) {
    throw new Error("opportunityReferenceId must match opportunityReference.externalId");
  }
};

const createAuditEvent = ({
  caseId,
  position,
  action,
  actor,
  prior,
  next,
  observedAt,
}: {
  caseId: string;
  position: number;
  action: AuditEvent["action"];
  actor: string;
  prior: CaseStatus | null;
  next: CaseStatus;
  observedAt: Date;
}): AuditEvent => ({
  id: deterministicUuidV4(
    `audit|${caseId}|${position}|${action}|${actor}|${prior ?? "none"}|${next}|${observedAt.toISOString()}`,
  ),
  action,
  actor,
  prior,
  next,
  observedAt,
  actorId: actor,
  from: prior,
  to: next,
  occurredAt: observedAt,
});

export const assembleAssuranceCase = (
  input: DetectorCandidateInput,
  options: CaseAssemblyOptions,
): CaseAssemblyResult => {
  const candidateBase = canonicalizeDetectorCandidate(input);
  assertOpportunityOwnership(candidateBase.workspaceId, options);
  const expectedEvidence = parseExpectedEvidence(options.expectedEvidence ?? candidateBase.expectedEvidence);
  const candidate = { ...candidateBase, expectedEvidence };
  const evidence = assessEvidence(expectedEvidence, options.actualEvidence ?? [], candidate.workspaceId);
  const observedAt = options.observedAt ? z.coerce.date().parse(options.observedAt) : candidate.observedAt;
  const detectorCandidateId = candidate.id;
  const dedupeKey = caseDedupeKey({
    workspaceId: candidate.workspaceId,
    detectorCandidateId,
    opportunityReferenceId: options.opportunityReferenceId,
  });
  const caseId = deterministicUuidV4(`assurance-case|${dedupeKey}`);
  const evidenceReferences = evidence.actual.map((item) => ({
    ...evidenceReferenceSchema.parse({ ...item, assuranceCaseId: caseId }),
    id: deterministicUuidV4(`evidence-reference|${caseId}|${evidenceFingerprint(item)}`),
  }));
  const caseStatus: CaseStatus = evidence.missing.length > 0 ? "insufficient-evidence" : "needs-review";
  const auditHistory = [
    createAuditEvent({
      caseId,
      position: 0,
      action: "assembled",
      actor: "case-engine",
      prior: null,
      next: caseStatus,
      observedAt,
    }),
  ];
  const projection = assuranceCaseProjectionSchema.parse({
    ...candidate,
    evidenceReferences,
    dedupeKey,
  });
  const baseCase = assuranceCaseSchema.parse({
    name: `${candidate.name} assurance case`,
    externalId: `case:${candidate.externalId}`,
    workspaceId: candidate.workspaceId,
    provenanceState: "inferred",
    provenanceRef: `case-engine://${candidate.provenanceRef}`,
    sourceVersion: candidate.sourceVersion,
    recordVersion: candidate.recordVersion,
    observedAt,
    opportunityReferenceId: options.opportunityReferenceId,
    detectorCandidateId,
    caseStatus,
    ...projection,
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
) => {
  const candidates = dedupeDetectorCandidates(inputs).candidates;
  for (const candidate of candidates) assertOpportunityOwnership(candidate.workspaceId, options);
  return candidates.map((candidate) => assembleAssuranceCase(candidate, options));
};

export const isValidCaseTransition = (from: CaseStatus, to: CaseStatus) =>
  VALID_REVIEW_TRANSITIONS[from]?.includes(to) ?? false;

export const transitionAssuranceCase = (
  current: CanonicalAssuranceCase,
  to: CaseStatus,
  options: TransitionOptions,
): TransitionResult => {
  if (!canTransitionAssuranceCase({ role: options.role, from: current.caseStatus, to })) {
    throw new Error(`actor role ${options.role} is not authorized to transition assurance cases`);
  }
  const allowed = VALID_REVIEW_TRANSITIONS[current.caseStatus] ?? [];
  if (!isValidCaseTransition(current.caseStatus, to)) {
    return { ok: false, reason: "invalid_transition", from: current.caseStatus, to, allowed };
  }

  const observedAt = options.occurredAt ? z.coerce.date().parse(options.occurredAt) : current.observedAt;
  const previousObservedAt = current.auditHistory[current.auditHistory.length - 1]?.observedAt;
  if (previousObservedAt && observedAt.getTime() < previousObservedAt.getTime()) {
    return { ok: false, reason: "audit_out_of_order", previousObservedAt, observedAt };
  }
  const auditEvent = createAuditEvent({
    caseId: current.id,
    position: current.auditHistory.length,
    action: "transitioned",
    actor: z.string().min(1).parse(options.actorId),
    prior: current.caseStatus,
    next: to,
    observedAt,
  });

  return {
    ok: true,
    case: { ...current, caseStatus: to, auditHistory: [...current.auditHistory, auditEvent] },
  };
};
