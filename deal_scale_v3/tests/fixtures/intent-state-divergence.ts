const workspaceId = "00000000-0000-4000-8000-000000000001";

const baseMetadata = {
  workspaceId,
  sourceConnectionId: "conn-twenty-001",
  sourceVersion: "twenty-v1",
  provenanceRef: "twenty://opportunity/opp-001",
  observedAt: "2026-09-24T12:00:00.000Z",
} as const;

export const intentEvidence = {
  evidenceId: "transcript-001",
  evidenceType: "transcript",
  excerpt: "Please send me the offer this afternoon.",
  ...baseMetadata,
} as const;

export const offerRequestInterpretation = {
  schemaVersion: "intent-state-divergence.v1",
  intent: "offer_request",
  confidence: 0.96,
  evidence: [intentEvidence],
  ...baseMetadata,
} as const;

export const callbackRequestInterpretation = {
  ...offerRequestInterpretation,
  intent: "callback_request",
  confidence: 0.91,
} as const;

export const appointmentAgreementInterpretation = {
  ...offerRequestInterpretation,
  intent: "appointment_agreement",
  confidence: 0.94,
} as const;

export const contradictoryStateInterpretation = {
  ...offerRequestInterpretation,
  intent: "contradictory_state",
  confidence: 0.88,
} as const;

export const alignedOfferState = {
  schemaVersion: "crm-event-state.v1",
  opportunityReferenceId: "opp-001",
  crm: {
    offerRequested: true,
    callbackRequested: null,
    appointmentAgreed: null,
    contradictory: false,
  },
  events: [
    {
      name: "Offer request recorded",
      externalId: "event-offer-001",
      ...baseMetadata,
      provenanceState: "observed",
      opportunityReferenceId: "opp-001",
      eventType: "offer_requested",
      occurredAt: "2026-09-24T11:59:00.000Z",
    },
  ],
  ...baseMetadata,
} as const;

export const callbackMissingState = {
  ...alignedOfferState,
  crm: {
    offerRequested: null,
    callbackRequested: false,
    appointmentAgreed: null,
    contradictory: false,
  },
  events: [],
} as const;

export const appointmentAgreementState = {
  ...alignedOfferState,
  crm: {
    offerRequested: null,
    callbackRequested: null,
    appointmentAgreed: true,
    contradictory: false,
  },
  events: [],
} as const;

export const contradictoryState = {
  ...alignedOfferState,
  crm: {
    offerRequested: null,
    callbackRequested: null,
    appointmentAgreed: null,
    contradictory: true,
  },
  events: [
    {
      name: "Appointment agreed",
      externalId: "event-appointment-001",
      ...baseMetadata,
      provenanceState: "observed",
      opportunityReferenceId: "opp-001",
      eventType: "appointment_agreed",
      occurredAt: "2026-09-24T11:58:00.000Z",
    },
    {
      name: "Appointment cancelled",
      externalId: "event-appointment-002",
      ...baseMetadata,
      provenanceState: "observed",
      provenanceRef: "twenty://event/event-appointment-002",
      opportunityReferenceId: "opp-001",
      eventType: "appointment_cancelled",
      occurredAt: "2026-09-24T11:59:30.000Z",
    },
  ],
} as const;

export const crossTenantOfferEvent = {
  name: "Foreign offer request",
  externalId: "event-foreign-001",
  ...baseMetadata,
  workspaceId: "00000000-0000-4000-8000-000000000002",
  provenanceState: "observed",
  provenanceRef: "foreign://event/event-foreign-001",
  opportunityReferenceId: "opp-001",
  eventType: "offer_requested",
  occurredAt: "2026-09-24T11:59:00.000Z",
} as const;
