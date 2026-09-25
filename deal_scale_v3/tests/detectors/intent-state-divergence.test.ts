import { describe, expect, it } from "vitest";

import {
  appointmentAgreementInterpretation,
  appointmentAgreementState,
  alignedOfferState,
  callbackMissingState,
  callbackRequestInterpretation,
  contradictoryState,
  contradictoryStateInterpretation,
  crossTenantOfferEvent,
  offerRequestInterpretation,
} from "../fixtures/intent-state-divergence";
import {
  crmEventStateSchema,
  detectIntentStateDivergence,
  intentInterpretationSchema,
  intentStateDivergenceResultSchema,
} from "../../src/detectors/intent-state-divergence";

describe("intent-state divergence detector", () => {
  it("validates the versioned intent interpretation contract", () => {
    const parsed = intentInterpretationSchema.parse(offerRequestInterpretation);

    expect(parsed.schemaVersion).toBe("intent-state-divergence.v1");
    expect(parsed.intent).toBe("offer_request");
    expect(parsed.confidence).toBe(0.96);
    expect(parsed).toMatchObject({
      opportunityReferenceId: "opp-001",
      evidence: [{ opportunityReferenceId: "opp-001" }],
    });
    expect(() =>
      intentInterpretationSchema.parse({ ...offerRequestInterpretation, schemaVersion: "v0" }),
    ).toThrow();
  });

  it("validates canonical CRM and event state with the existing event schema shape", () => {
    const parsed = crmEventStateSchema.parse(alignedOfferState);

    expect(parsed.events[0]?.eventType).toBe("offer_requested");
    expect(parsed.events[0]?.workspaceId).toBe(alignedOfferState.workspaceId);
    expect(parsed).toMatchObject({
      stateEvidence: [{
        evidenceId: "crm-offer-v1",
        field: "offerRequested",
        value: true,
        sourceConnectionId: "conn-twenty-001",
        sourceVersion: "crm-v1",
        provenanceRef: "twenty://opportunity/opp-001/field/offerRequested",
      }],
    });
  });

  it("keeps callback and appointment calibration excerpts distinct", () => {
    const callback = intentInterpretationSchema.parse(callbackRequestInterpretation);
    const appointment = intentInterpretationSchema.parse(appointmentAgreementInterpretation);

    expect(callback.evidence[0]).toMatchObject({
      evidenceId: "msg-callback",
      excerpt: "Please call me after lunch",
      opportunityReferenceId: "opp-001",
    });
    expect(appointment.evidence[0]).toMatchObject({
      evidenceId: "msg-appointment",
      excerpt: "Tuesday at 2pm works for the showing",
      opportunityReferenceId: "opp-001",
    });
  });

  it("reports an aligned offer request with traceable evidence", () => {
    const result = detectIntentStateDivergence(offerRequestInterpretation, alignedOfferState);

    expect(result.status).toBe("aligned");
    expect(result.reasonCode).toBe("intent_aligned");
    expect(result.evidence.intentEvidenceIds).toEqual(["transcript-001"]);
    expect(result.evidence.stateEvidenceIds).toEqual(["crm-offer-v1", "event-offer-001"]);
    expect(result.explanation).toContain("offer_request");
    expect(result.provenance.sourceConnectionId).toBe("conn-twenty-001");
    expect(result.confidence).toBe(0.96);
  });

  it("reports callback request divergence when CRM state explicitly disagrees", () => {
    const result = detectIntentStateDivergence(callbackRequestInterpretation, callbackMissingState);

    expect(result.status).toBe("divergent");
    expect(result.reasonCode).toBe("state_contradicts_intent");
    expect(result.evidence.contradictingEvidenceIds).toEqual(["crm-callback-v1"]);
    expect(result.coverage.missingEvidenceTypes).toEqual([]);
  });

  it("returns real source-backed contradiction evidence", () => {
    const result = detectIntentStateDivergence(callbackRequestInterpretation, callbackMissingState);

    expect(result.evidence.contradictingEvidenceIds).toEqual([
      callbackMissingState.stateEvidence[0].evidenceId,
    ]);
    expect(result.evidence).toHaveProperty(
      "contradictingEvidence",
      callbackMissingState.stateEvidence,
    );
  });

  it("resolves a matching event against explicit contradictory CRM state", () => {
    const result = detectIntentStateDivergence(callbackRequestInterpretation, {
      ...callbackMissingState,
      events: [{
        ...alignedOfferState.events[0],
        name: "Callback requested",
        externalId: "event-callback-001",
        eventType: "callback_requested",
      }],
    });

    expect(result.status).toBe("divergent");
    expect(result.reasonCode).toBe("state_contradicts_intent");
    expect(result.evidence.contradictingEvidenceIds).toEqual(["crm-callback-v1"]);
  });

  it("covers appointment agreement and contradictory state interpretations", () => {
    const appointmentResult = detectIntentStateDivergence(
      appointmentAgreementInterpretation,
      appointmentAgreementState,
    );
    const contradictoryResult = detectIntentStateDivergence(
      contradictoryStateInterpretation,
      contradictoryState,
    );

    expect(appointmentResult.status).toBe("aligned");
    expect(appointmentResult.evidence.stateEvidenceIds).toEqual(["crm-appointment-v1"]);
    expect(contradictoryResult.status).toBe("aligned");
    expect(contradictoryResult.reasonCode).toBe("contradictory_state_confirmed");
    expect(contradictoryResult.evidence.stateEvidenceIds).toEqual([
      "crm-contradictory-v1",
      "event-appointment-001",
      "event-appointment-002",
    ]);
  });

  it("returns first-class insufficient evidence when the state cannot be evaluated", () => {
    const result = detectIntentStateDivergence(
      offerRequestInterpretation,
      {
        ...alignedOfferState,
        crm: {
          offerRequested: null,
          callbackRequested: null,
          appointmentAgreed: null,
          contradictory: false,
        },
        stateEvidence: [],
        events: [],
      },
    );

    expect(result.status).toBe("insufficient_evidence");
    expect(result.reasonCode).toBe("missing_state_coverage");
    expect(result.coverage.missingEvidenceTypes).toEqual(["offer_request_state"]);
    expect(result.evidence.contradictingEvidenceIds).toEqual([]);
  });

  it("does not use another tenant's event as evidence", () => {
    const result = detectIntentStateDivergence(offerRequestInterpretation, {
      ...alignedOfferState,
      crm: {
        offerRequested: null,
        callbackRequested: null,
        appointmentAgreed: null,
        contradictory: false,
      },
      stateEvidence: [],
      events: [crossTenantOfferEvent],
    });

    expect(result.status).toBe("insufficient_evidence");
    expect(result.reasonCode).toBe("missing_state_coverage");
    expect(result.evidence.stateEvidenceIds).toEqual([]);
  });

  it("rejects CRM state from another tenant", () => {
    expect(() =>
      detectIntentStateDivergence(offerRequestInterpretation, {
        ...alignedOfferState,
        workspaceId: "00000000-0000-4000-8000-000000000002",
      }),
    ).toThrow("same tenant");
  });

  it("does not compare intent from another opportunity", () => {
    expect(() =>
      detectIntentStateDivergence(offerRequestInterpretation, {
        ...alignedOfferState,
        opportunityReferenceId: "opp-002",
        stateEvidence: [],
        events: [],
      }),
    ).toThrow("Intent and CRM state must belong to the same opportunity");
  });

  it("rejects intent evidence from another opportunity even when top-level IDs match", () => {
    expect(offerRequestInterpretation.opportunityReferenceId).toBe(
      alignedOfferState.opportunityReferenceId,
    );
    expect(() =>
      detectIntentStateDivergence(
        {
          ...offerRequestInterpretation,
          evidence: [
            { ...offerRequestInterpretation.evidence[0], opportunityReferenceId: "opp-002" },
          ],
        },
        alignedOfferState,
      ),
    ).toThrow("Intent evidence must belong to the interpretation opportunity");
  });

  it("ignores unrelated events when deriving the candidate result", () => {
    const unrelatedEvent = {
      ...alignedOfferState.events[0],
      name: "Appointment agreed",
      externalId: "event-appointment-unrelated",
      eventType: "appointment_agreed",
    };
    const withUnrelatedEvent = detectIntentStateDivergence(offerRequestInterpretation, {
      ...alignedOfferState,
      events: [unrelatedEvent, ...alignedOfferState.events],
    });
    const withoutUnrelatedEvent = detectIntentStateDivergence(
      offerRequestInterpretation,
      alignedOfferState,
    );

    expect(withUnrelatedEvent).toEqual(withoutUnrelatedEvent);
  });

  it("normalizes relevant event order for stable candidate identity", () => {
    const first = detectIntentStateDivergence(contradictoryStateInterpretation, contradictoryState);
    const reversed = detectIntentStateDivergence(contradictoryStateInterpretation, {
      ...contradictoryState,
      events: [...contradictoryState.events].reverse(),
    });

    expect(reversed.candidateId).toBe(first.candidateId);
  });

  it("is deterministic and emits a valid UUID v4 candidate id", () => {
    const first = detectIntentStateDivergence(offerRequestInterpretation, alignedOfferState);
    const second = detectIntentStateDivergence(offerRequestInterpretation, alignedOfferState);

    expect(first).toEqual(second);
    expect(first.candidateId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(intentStateDivergenceResultSchema.parse(first)).toEqual(first);
  });

  it("does not emit a black-box verdict for low-confidence interpretations", () => {
    const result = detectIntentStateDivergence(
      { ...offerRequestInterpretation, confidence: 0.2 },
      alignedOfferState,
    );

    expect(result.status).toBe("insufficient_evidence");
    expect(result.reasonCode).toBe("low_intent_confidence");
    expect(result.confidence).toBe(0.2);
    expect(result.explanation).toContain("0.2");
  });
});
