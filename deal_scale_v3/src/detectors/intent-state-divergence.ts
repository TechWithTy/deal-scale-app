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
});

export const intentInterpretationSchema = metadataSchema.extend({
  schemaVersion: z.literal("intent-state-divergence.v1"),
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
});

export const crmEventStateSchema = metadataSchema.extend({
  schemaVersion: z.literal("crm-event-state.v1"),
  opportunityReferenceId: z.string().min(1),
  crm: crmStateSchema,
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
    JSON.stringify({ interpretation, state, status: values.status, reasonCode: values.reasonCode, evidence }),
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
  if (interpretation.evidence.some((item) => item.workspaceId !== interpretation.workspaceId)) {
    throw new Error("Intent evidence must belong to the interpretation tenant.");
  }
  const relevantEvents = state.events.filter(
    (event) =>
      event.workspaceId === interpretation.workspaceId &&
      event.opportunityReferenceId === state.opportunityReferenceId,
  );
  const stateEvidenceIds = relevantEvents.map((event) => event.externalId);

  if (interpretation.confidence < 0.5) {
    return result(interpretation, state, {
      status: "insufficient_evidence",
      reasonCode: "low_intent_confidence",
      explanation: `Intent confidence ${interpretation.confidence} is below the supported threshold.`,
      coverage: { missingEvidenceTypes: [] },
      evidence: { stateEvidenceIds, contradictingEvidenceIds: [] },
    });
  }

  if (interpretation.intent === "contradictory_state") {
    const contradictionEvidence = relevantEvents.filter((event) =>
      ["appointment_agreed", "appointment_cancelled", "state_contradicted"].includes(event.eventType),
    );
    if (state.crm.contradictory || contradictionEvidence.length >= 2) {
      return result(interpretation, state, {
        status: "aligned",
        reasonCode: "contradictory_state_confirmed",
        explanation: "The interpreted contradictory state is confirmed by canonical CRM/event evidence.",
        coverage: { missingEvidenceTypes: [] },
        evidence: {
          stateEvidenceIds,
          contradictingEvidenceIds: [],
        },
      });
    }
    return result(interpretation, state, {
      status: "insufficient_evidence",
      reasonCode: "missing_state_coverage",
      explanation: "Canonical contradictory-state evidence is not available.",
      coverage: { missingEvidenceTypes: ["contradictory_state"] },
      evidence: { stateEvidenceIds, contradictingEvidenceIds: [] },
    });
  }

  const [field, missingEvidenceType] = intentStateMap[interpretation.intent];
  const fieldValue = state.crm[field];
  const matchingEventTypes = {
    offerRequested: "offer_requested",
    callbackRequested: "callback_requested",
    appointmentAgreed: "appointment_agreed",
  } as const;
  const matchingEvents = relevantEvents.filter((event) => event.eventType === matchingEventTypes[field]);

  if (fieldValue === true || matchingEvents.length > 0) {
    return result(interpretation, state, {
      status: "aligned",
      reasonCode: "intent_aligned",
      explanation: `The ${interpretation.intent} intent is supported by canonical state.`,
      coverage: { missingEvidenceTypes: [] },
      evidence: {
        stateEvidenceIds: [
          ...(fieldValue === null ? [] : [`crm:${field}`]),
          ...stateEvidenceIds,
        ],
        contradictingEvidenceIds: [],
      },
    });
  }

  if (fieldValue === false) {
    return result(interpretation, state, {
      status: "divergent",
      reasonCode: "state_contradicts_intent",
      explanation: `Canonical state explicitly contradicts the ${interpretation.intent} intent.`,
      coverage: { missingEvidenceTypes: [] },
      evidence: {
        stateEvidenceIds,
        contradictingEvidenceIds: [`crm:${field}`],
      },
    });
  }

  return result(interpretation, state, {
    status: "insufficient_evidence",
    reasonCode: "missing_state_coverage",
    explanation: `Canonical state coverage for ${interpretation.intent} is unavailable.`,
    coverage: { missingEvidenceTypes: [missingEvidenceType] },
    evidence: { stateEvidenceIds, contradictingEvidenceIds: [] },
  });
};
