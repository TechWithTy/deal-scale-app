import { createHash } from "node:crypto";

import { z } from "zod";

import { eventSchema } from "src/assurance/schema";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const metadataSchema = z.object({
  workspaceId: z.string().min(1),
  sourceConnectionId: z.string().min(1),
  sourceVersion: z.string().min(1),
  provenanceRef: z.string().min(1),
  observedAt: z.coerce.date(),
});

const intentEvidenceSchema = metadataSchema.extend({
  evidenceId: z.string().min(1),
  evidenceType: z.string().min(1),
  excerpt: z.string().min(1),
  opportunityReferenceId: z.string().min(1),
});

export const intentInterpretationSchema = metadataSchema.extend({
  schemaVersion: z.literal("intent-state-divergence.v1"),
  opportunityReferenceId: z.string().min(1),
  intent: z.enum([
    "offer_request",
    "callback_request",
    "appointment_agreement",
    "contradictory_state",
  ]),
  confidence: z.number().min(0).max(1),
  evidence: z.array(intentEvidenceSchema).min(1),
});

const crmStateSchema = z.object({
  offerRequested: z.boolean().nullable(),
  callbackRequested: z.boolean().nullable(),
  appointmentAgreed: z.boolean().nullable(),
  contradictory: z.boolean(),
});

const crmEventSchema = eventSchema.pick({
  name: true,
  externalId: true,
  workspaceId: true,
  provenanceState: true,
  provenanceRef: true,
  sourceVersion: true,
  observedAt: true,
  opportunityReferenceId: true,
  eventType: true,
  occurredAt: true,
}).extend({ sourceConnectionId: z.string().min(1).optional() });

const stateEvidenceSchema = metadataSchema.extend({
  evidenceId: z.string().min(1),
  opportunityReferenceId: z.string().min(1),
  field: z.enum(["offerRequested", "callbackRequested", "appointmentAgreed", "contradictory"]),
  value: z.boolean().nullable(),
});

export const crmEventStateSchema = metadataSchema.extend({
  schemaVersion: z.literal("crm-event-state.v1"),
  opportunityReferenceId: z.string().min(1),
  crm: crmStateSchema,
  stateEvidence: z.array(stateEvidenceSchema),
  events: z.array(crmEventSchema),
});

const statusSchema = z.enum(["aligned", "divergent", "insufficient_evidence"]);
const reasonCodeSchema = z.enum([
  "intent_aligned",
  "state_contradicts_intent",
  "contradictory_state_confirmed",
  "missing_state_coverage",
  "low_intent_confidence",
]);

export const intentStateDivergenceResultSchema = z.object({
  candidateId: z.string().regex(UUID_V4),
  status: statusSchema,
  reasonCode: reasonCodeSchema,
  confidence: z.number().min(0).max(1),
  explanation: z.string().min(1),
  evidence: z.object({
    intentEvidenceIds: z.array(z.string()),
    stateEvidenceIds: z.array(z.string()),
    contradictingEvidenceIds: z.array(z.string()),
    contradictingEvidence: z.array(stateEvidenceSchema),
  }),
  coverage: z.object({
    missingEvidenceTypes: z.array(z.string()),
  }),
  provenance: metadataSchema.extend({
    intentSchemaVersion: z.literal("intent-state-divergence.v1"),
    stateSchemaVersion: z.literal("crm-event-state.v1"),
  }),
});

export type IntentInterpretation = z.infer<typeof intentInterpretationSchema>;
export type CrmEventState = z.infer<typeof crmEventStateSchema>;
export type IntentStateDivergenceResult = z.infer<typeof intentStateDivergenceResultSchema>;

const deterministicUuidV4 = (seed: string) => {
  const bytes = createHash("sha256").update(seed).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Buffer.from(bytes).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const intentStateMap = {
  offer_request: ["offerRequested", "offer_request_state"],
  callback_request: ["callbackRequested", "callback_request_state"],
  appointment_agreement: ["appointmentAgreed", "appointment_agreement_state"],
} as const;

const eventTypes = {
  offerRequested: ["offer_requested"],
  callbackRequested: ["callback_requested"],
  appointmentAgreed: ["appointment_agreed"],
  contradictory: ["appointment_agreed", "appointment_cancelled", "state_contradicted"],
} as const;
const result = (
  interpretation: IntentInterpretation,
  state: CrmEventState,
  values: Omit<IntentStateDivergenceResult, "candidateId" | "confidence" | "provenance" | "evidence"> & {
    evidence: Omit<IntentStateDivergenceResult["evidence"], "intentEvidenceIds">;
  },
): IntentStateDivergenceResult => {
  const evidence = {
    intentEvidenceIds: interpretation.evidence.map((item) => item.evidenceId),
    ...values.evidence,
  };
  const candidateId = deterministicUuidV4(
    JSON.stringify({
      workspaceId: interpretation.workspaceId,
      opportunityReferenceId: interpretation.opportunityReferenceId,
      intent: interpretation.intent,
      status: values.status,
      reasonCode: values.reasonCode,
      evidenceIds: [...evidence.intentEvidenceIds, ...evidence.stateEvidenceIds].sort(),
    }),
  );
  return intentStateDivergenceResultSchema.parse({
    ...values,
    candidateId,
    confidence: interpretation.confidence,
    evidence,
    provenance: {
      workspaceId: interpretation.workspaceId,
      sourceConnectionId: interpretation.sourceConnectionId,
      sourceVersion: interpretation.sourceVersion,
      provenanceRef: interpretation.provenanceRef,
      observedAt: interpretation.observedAt,
      intentSchemaVersion: interpretation.schemaVersion,
      stateSchemaVersion: state.schemaVersion,
    },
  });
};

export const detectIntentStateDivergence = (
  rawInterpretation: unknown,
  rawState: unknown,
): IntentStateDivergenceResult => {
  const interpretation = intentInterpretationSchema.parse(rawInterpretation);
  const state = crmEventStateSchema.parse(rawState);
  if (state.workspaceId !== interpretation.workspaceId) {
    throw new Error("Intent and CRM state must belong to the same tenant.");
  }
  if (state.opportunityReferenceId !== interpretation.opportunityReferenceId) {
    throw new Error("Intent and CRM state must belong to the same opportunity.");
  }
  if (interpretation.evidence.some((item) => item.workspaceId !== interpretation.workspaceId)) {
    throw new Error("Intent evidence must belong to the interpretation tenant.");
  }
  if (interpretation.evidence.some((item) => item.opportunityReferenceId !== interpretation.opportunityReferenceId)) {
    throw new Error("Intent evidence must belong to the interpretation opportunity.");
  }
  if (interpretation.evidence.some((item) => item.sourceConnectionId !== interpretation.sourceConnectionId)) {
    throw new Error("Intent evidence must belong to the interpretation source connection.");
  }
  if (state.stateEvidence.some((item) => item.workspaceId !== state.workspaceId || item.opportunityReferenceId !== state.opportunityReferenceId)) {
    throw new Error("State evidence must belong to the state tenant and opportunity.");
  }
  if (state.stateEvidence.some((item) => item.sourceConnectionId !== state.sourceConnectionId) || state.events.some((item) => item.sourceConnectionId && item.sourceConnectionId !== state.sourceConnectionId)) {
    throw new Error("State evidence must belong to the state source connection.");
  }
  const relevantEvents = state.events.filter(
    (event) =>
      event.workspaceId === interpretation.workspaceId &&
      event.opportunityReferenceId === state.opportunityReferenceId &&
      event.sourceConnectionId === state.sourceConnectionId &&
      event.provenanceState === "observed" &&
      event.observedAt <= state.observedAt && event.occurredAt <= state.observedAt &&
      eventTypes[interpretation.intent === "contradictory_state" ? "contradictory" : intentStateMap[interpretation.intent][0]].some((type) => type === event.eventType),
  ).sort((left, right) => left.externalId.localeCompare(right.externalId));
  const field = interpretation.intent === "contradictory_state" ? "contradictory" : intentStateMap[interpretation.intent][0];
  const fieldEvidence = state.stateEvidence.filter((item) => item.field === field && item.observedAt <= state.observedAt);
  const latestTime = Math.max(...fieldEvidence.map((item) => item.observedAt.getTime()));
  const latest = fieldEvidence.filter((item) => item.observedAt.getTime() === latestTime)
    .sort((left, right) => left.evidenceId.localeCompare(right.evidenceId));
  const stateEvidenceIds = [...latest.map((item) => item.evidenceId), ...relevantEvents.map((item) => item.externalId)];
  const baseEvidence = { stateEvidenceIds, contradictingEvidenceIds: [], contradictingEvidence: [] };
  const missingEvidenceType = interpretation.intent === "contradictory_state" ? "contradictory_state" : intentStateMap[interpretation.intent][1];
  const missing = (explanation: string) => result(interpretation, state, {
    status: "insufficient_evidence", reasonCode: "missing_state_coverage", explanation,
    coverage: { missingEvidenceTypes: [missingEvidenceType] }, evidence: baseEvidence,
  });
  if (interpretation.confidence < 0.5) {
    return result(interpretation, state, {
      status: "insufficient_evidence",
      reasonCode: "low_intent_confidence",
      explanation: `Intent confidence ${interpretation.confidence} is below the supported threshold.`,
      coverage: { missingEvidenceTypes: [] },
      evidence: baseEvidence,
    });
  }

  if (latest.some((item) => item.value !== latest[0]?.value)) {
    return missing("Equally current source-backed field observations disagree.");
  }
  const fieldValue = latest[0]?.value;
  const eventConfirms = interpretation.intent === "contradictory_state"
    ? new Set(relevantEvents.map((item) => item.eventType)).size >= 2
    : relevantEvents.length > 0;
  if (fieldValue === true || (latest.length === 0 && eventConfirms)) {
    return result(interpretation, state, {
      status: "aligned",
      reasonCode: interpretation.intent === "contradictory_state" ? "contradictory_state_confirmed" : "intent_aligned",
      explanation: `The ${interpretation.intent} intent is supported by canonical state.`,
      coverage: { missingEvidenceTypes: [] },
      evidence: baseEvidence,
    });
  }

  if (fieldValue === false && interpretation.intent !== "contradictory_state") {
    return result(interpretation, state, {
      status: "divergent",
      reasonCode: "state_contradicts_intent",
      explanation: `Canonical state explicitly contradicts the ${interpretation.intent} intent.`,
      coverage: { missingEvidenceTypes: [] },
      evidence: { ...baseEvidence, contradictingEvidenceIds: latest.map((item) => item.evidenceId), contradictingEvidence: latest },
    });
  }
  return missing(`Canonical state coverage for ${interpretation.intent} is unavailable.`);
};
