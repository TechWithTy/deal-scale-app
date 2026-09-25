import { describe, expect, it } from "vitest";

import { PROMISE_LEDGER_FIXTURES } from "../src/promise-ledger/contract";
import { buildSellerJourneyModel } from "../src/seller-journeys/surface-model";

const asOf = new Date("2026-10-06T12:00:00Z");

const baseInput = {
  seller: {
    name: "seller-001",
    externalId: "seller-001",
    workspaceId: "00000000-0000-4000-8000-000000000001",
    provenanceState: "observed" as const,
    provenanceRef: "crm://seller/seller-001",
    sourceVersion: "crm-v1",
    recordVersion: 1,
    observedAt: new Date("2026-10-01T12:00:00Z"),
    sourceConnectionId: "connection-001",
    sellerExternalId: "seller-001",
    displayName: "Jordan Lee",
  },
  opportunity: {
    name: "Acme expansion",
    externalId: "opp-001",
    workspaceId: "00000000-0000-4000-8000-000000000001",
    provenanceState: "observed" as const,
    provenanceRef: "crm://opportunity/opp-001",
    sourceVersion: "crm-v1",
    recordVersion: 1,
    observedAt: new Date("2026-10-01T12:00:00Z"),
    sellerIdentityId: "seller-001",
    sourceConnectionId: "connection-001",
    opportunityExternalId: "opp-001",
    stage: "Proposal",
  },
  events: [
    {
      name: "Discovery call",
      externalId: "event-001",
      workspaceId: "00000000-0000-4000-8000-000000000001",
      provenanceState: "observed" as const,
      provenanceRef: "crm://event/event-001",
      sourceVersion: "crm-v1",
      recordVersion: 1,
      observedAt: new Date("2026-10-01T12:00:00Z"),
      opportunityReferenceId: "opp-001",
      eventType: "discovery_call",
      occurredAt: new Date("2026-10-02T12:00:00Z"),
    },
    {
      name: "Proposal shared",
      externalId: "event-002",
      workspaceId: "00000000-0000-4000-8000-000000000001",
      provenanceState: "observed" as const,
      provenanceRef: "crm://event/event-002",
      sourceVersion: "crm-v1",
      recordVersion: 1,
      observedAt: new Date("2026-10-03T12:00:00Z"),
      opportunityReferenceId: "opp-001",
      eventType: "proposal_shared",
      occurredAt: new Date("2026-10-04T12:00:00Z"),
    },
  ],
  promises: [PROMISE_LEDGER_FIXTURES.valid],
  assuranceCases: [
    {
      name: "Pricing promise review",
      externalId: "case-001",
      workspaceId: "00000000-0000-4000-8000-000000000001",
      provenanceState: "inferred" as const,
      provenanceRef: "detector://pricing-promise/v1/case-001",
      sourceVersion: "detector-v1",
      recordVersion: 1,
      observedAt: new Date("2026-10-05T12:00:00Z"),
      opportunityReferenceId: "opp-001",
      detectorCandidateId: "det-001",
      caseStatus: "open" as const,
    },
  ],
  detectorCandidates: [
    {
      name: "Pricing detector",
      externalId: "det-001",
      workspaceId: "00000000-0000-4000-8000-000000000001",
      provenanceState: "inferred" as const,
      provenanceRef: "detector://pricing-promise/v1/det-001",
      sourceVersion: "detector-v1",
      recordVersion: 1,
      observedAt: new Date("2026-10-05T12:00:00Z"),
      conformancePolicyId: "policy-001",
      sellerEventId: "event-002",
      detectorType: "pricing_promise",
      confidence: 0.91,
    },
  ],
};

describe("Seller Journeys surface model", () => {
  it("orders milestones, exposes the current stage, and promotes assurance risk", () => {
    const model = buildSellerJourneyModel(baseInput, asOf);

    expect(model.stage).toBe("Proposal");
    expect(model.milestones.map((milestone) => milestone.eventType)).toEqual([
      "discovery_call",
      "proposal_shared",
    ]);
    expect(model.risk).toMatchObject({
      openCaseCount: 1,
      unresolvedPromiseCount: 1,
      atRiskPromiseCount: 0,
      isAtRisk: true,
      highestDetectorConfidence: 0.91,
    });
  });

  it("collects unique promise evidence links for the journey surface", () => {
    const model = buildSellerJourneyModel(
      {
        ...baseInput,
        promises: [
          PROMISE_LEDGER_FIXTURES.valid,
          {
            ...PROMISE_LEDGER_FIXTURES.valid,
            externalId: "promise-002",
          },
        ],
      },
      asOf,
    );

    expect(model.evidenceLinks).toHaveLength(1);
    expect(model.evidenceLinks[0]?.href).toBe(
      PROMISE_LEDGER_FIXTURES.valid.evidenceReferences[0].locator,
    );
  });
});
