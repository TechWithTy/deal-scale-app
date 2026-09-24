import { z } from "zod";

import { fromTwentySelectValue } from "src/assurance/common-fields";
import { ASSURANCE_OBJECTS, type AssuranceObjectName } from "src/assurance/identifiers";

const canonicalSelect = <const T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (value) => (typeof value === "string" ? fromTwentySelectValue(value) : value),
    z.enum(values),
  );

const provenanceState = canonicalSelect(["observed", "inferred"]);

export const assuranceEntitySchema = z.object({
  name: z.string().min(1),
  externalId: z.string().min(1),
  workspaceId: z.string().uuid(),
  provenanceState,
  provenanceRef: z.string().min(1),
  sourceVersion: z.string().min(1),
  recordVersion: z.number().int().positive(),
  observedAt: z.coerce.date(),
});

export const sourceConnectionSchema = assuranceEntitySchema.extend({
  provider: z.string().min(1),
  connectionStatus: canonicalSelect(["active", "paused", "revoked"]),
});

export const sellerIdentitySchema = assuranceEntitySchema.extend({
  sourceConnectionId: z.string().min(1),
  sellerExternalId: z.string().min(1),
  displayName: z.string().min(1),
});

export const opportunityReferenceSchema = assuranceEntitySchema.extend({
  sellerIdentityId: z.string().min(1),
  sourceConnectionId: z.string().min(1),
  opportunityExternalId: z.string().min(1),
  stage: z.string().min(1),
});

export const eventSchema = assuranceEntitySchema.extend({
  opportunityReferenceId: z.string().min(1),
  eventType: z.string().min(1),
  occurredAt: z.coerce.date(),
});

export const promiseSchema = assuranceEntitySchema.extend({
  opportunityReferenceId: z.string().min(1),
  promiseType: z.string().min(1),
  dueAt: z.coerce.date().nullable(),
});

export const conformancePolicySchema = assuranceEntitySchema.extend({
  policyVersion: z.string().min(1),
  policyStatus: canonicalSelect(["draft", "active", "retired"]),
  ruleSet: z.record(z.string(), z.unknown()),
});

export const detectorCandidateSchema = assuranceEntitySchema.extend({
  conformancePolicyId: z.string().min(1),
  sellerEventId: z.string().min(1).nullable(),
  detectorType: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export const assuranceCaseSchema = assuranceEntitySchema.extend({
  opportunityReferenceId: z.string().min(1),
  detectorCandidateId: z.string().min(1),
  caseStatus: canonicalSelect(["open", "accepted", "rejected", "closed"]),
});

export const evidenceReferenceSchema = assuranceEntitySchema.extend({
  assuranceCaseId: z.string().min(1),
  sellerEventId: z.string().min(1).nullable(),
  evidenceType: z.string().min(1),
  contentHash: z.string().min(1),
});

export const managerDispositionSchema = assuranceEntitySchema.extend({
  assuranceCaseId: z.string().min(1),
  disposition: canonicalSelect(["confirm", "dismiss", "needs-review"]),
  decidedBy: z.string().min(1),
});

export const outcomeSchema = assuranceEntitySchema.extend({
  assuranceCaseId: z.string().min(1),
  managerDispositionId: z.string().min(1).nullable(),
  outcomeType: z.string().min(1),
  outcomeAt: z.coerce.date(),
});

export const ASSURANCE_OBJECT_DEFINITIONS = [
  "sourceConnection",
  "sellerIdentity",
  "opportunityReference",
  "event",
  "promise",
  "conformancePolicy",
  "detectorCandidate",
  "assuranceCase",
  "evidenceReference",
  "managerDisposition",
  "outcome",
] as const satisfies readonly AssuranceObjectName[];

export const ASSURANCE_RELATIONS = [
  ["sellerIdentity", "sourceConnection"],
  ["opportunityReference", "sellerIdentity"],
  ["opportunityReference", "sourceConnection"],
  ["event", "opportunityReference"],
  ["promise", "opportunityReference"],
  ["detectorCandidate", "conformancePolicy"],
  ["detectorCandidate", "event"],
  ["assuranceCase", "opportunityReference"],
  ["assuranceCase", "detectorCandidate"],
  ["evidenceReference", "assuranceCase"],
  ["evidenceReference", "event"],
  ["managerDisposition", "assuranceCase"],
  ["outcome", "assuranceCase"],
  ["outcome", "managerDisposition"],
] as const;

export const ASSURANCE_FIXTURES = {
  sourceConnection: {
    name: "CRM sync",
    externalId: "conn-crm-001",
    workspaceId: "00000000-0000-4000-8000-000000000001",
    provenanceState: "observed",
    provenanceRef: "crm://connection/conn-crm-001",
    sourceVersion: "crm-v1",
    recordVersion: 1,
    observedAt: "2026-09-23T00:00:00.000Z",
    provider: "twenty",
    connectionStatus: "active",
  },
  assuranceCase: {
    name: "Pricing promise review",
    externalId: "case-001",
    workspaceId: "00000000-0000-4000-8000-000000000001",
    provenanceState: "inferred",
    provenanceRef: "detector://pricing-promise/v1/case-001",
    sourceVersion: "detector-v1",
    recordVersion: 1,
    observedAt: "2026-09-23T00:02:00.000Z",
    opportunityReferenceId: "opp-001",
    detectorCandidateId: "det-001",
    caseStatus: "open",
  },
} as const;

export const ASSURANCE_OBJECT_IDS = ASSURANCE_OBJECT_DEFINITIONS.reduce(
  (ids, name) => ({ ...ids, [name]: ASSURANCE_OBJECTS[name] }),
  {} as Record<AssuranceObjectName, string>,
);

