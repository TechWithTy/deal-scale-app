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
    expect(() =>
      intentInterpretationSchema.parse({ ...offerRequestInterpretation, schemaVersion: "v0" }),
    ).toThrow();
  });

  it("validates canonical CRM and event state with the existing event schema shape", () => {
    const parsed = crmEventStateSchema.parse(alignedOfferState);

    expect(parsed.events[0]?.eventType).toBe("offer_requested");
    expect(parsed.events[0]?.workspaceId).toBe(alignedOfferState.workspaceId);
  });

  it("reports an aligned offer request with traceable evidence", () => {
    const result = detectIntentStateDivergence(offerRequestInterpretation, alignedOfferState);

    expect(result.status).toBe("aligned");
    expect(result.reasonCode).toBe("intent_aligned");
    expect(result.evidence.intentEvidenceIds).toEqual(["transcript-001"]);
    expect(result.evidence.stateEvidenceIds).toContain("event-offer-001");
    expect(result.explanation).toContain("offer_request");
    expect(result.provenance.sourceConnectionId).toBe("conn-twenty-001");
    expect(result.confidence).toBe(0.96);
  });

  it("reports callback request divergence when CRM state explicitly disagrees", () => {
    const result = detectIntentStateDivergence(callbackRequestInterpretation, callbackMissingState);

    expect(result.status).toBe("divergent");
    expect(result.reasonCode).toBe("state_contradicts_intent");
    expect(result.evidence.contradictingEvidenceIds).toContain("crm:callbackRequested");
    expect(result.coverage.missingEvidenceTypes).toEqual([]);
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
    expect(appointmentResult.evidence.stateEvidenceIds).toContain("crm:appointmentAgreed");
    expect(contradictoryResult.status).toBe("aligned");
    expect(contradictoryResult.reasonCode).toBe("contradictory_state_confirmed");
    expect(contradictoryResult.evidence.stateEvidenceIds).toEqual(
      expect.arrayContaining(["event-appointment-001", "event-appointment-002"]),
    );
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
