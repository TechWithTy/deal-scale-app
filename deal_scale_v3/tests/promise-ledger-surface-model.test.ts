import { describe, expect, it } from "vitest";

import { PROMISE_LEDGER_FIXTURES } from "../src/promise-ledger/contract";
import {
  buildPromiseLedgerItem,
  buildPromiseLedgerModel,
} from "../src/promise-ledger/surface-model";

const asOf = new Date("2026-10-06T12:00:00Z");

describe("Promise Ledger surface model", () => {
  it("marks a promise fulfilled only after an acceptable seller event", () => {
    const item = buildPromiseLedgerItem(
      PROMISE_LEDGER_FIXTURES.valid,
      [
        {
          opportunityReferenceId: PROMISE_LEDGER_FIXTURES.valid.opportunityReferenceId,
          provenanceState: "observed",
          eventType: "document_delivered",
          occurredAt: new Date("2026-10-06T11:00:00Z"),
        },
      ],
      [],
      asOf,
    );

    expect(item.status).toBe("fulfilled");
    expect(item.owner).toBe("seller-001");
    expect(item.outcome).toMatchObject({
      expected: "crm_task_completed",
      actual: "document_delivered",
      state: "fulfilled",
    });
    expect(item.sla.state).toBe("due-soon");
    expect(item.sourceTimestamp).toEqual(new Date(PROMISE_LEDGER_FIXTURES.valid.extractedAt));
    expect(item.evidenceLinks[0]?.href).toBe(
      PROMISE_LEDGER_FIXTURES.valid.evidenceReferences[0].locator,
    );
    expect(item.evidenceLinks[0]).toMatchObject({
      sourceType: "communications",
      sourceRecordId: "message-001",
      observedAt: new Date("2026-10-05T14:58:00Z"),
    });
  });

  it("requires an observed fulfillment event linked to the promise opportunity", () => {
    const item = buildPromiseLedgerItem(
      PROMISE_LEDGER_FIXTURES.valid,
      [
        {
          opportunityReferenceId: "other-opportunity",
          provenanceState: "observed",
          eventType: "document_delivered",
          occurredAt: new Date("2026-10-06T11:00:00Z"),
        },
        {
          opportunityReferenceId: PROMISE_LEDGER_FIXTURES.valid.opportunityReferenceId,
          provenanceState: "inferred",
          eventType: "document_delivered",
          occurredAt: new Date("2026-10-06T11:30:00Z"),
        },
      ],
      [],
      asOf,
    );

    expect(item.status).toBe("due-soon");
    expect(item.fulfillmentObserved).toBe(false);
    expect(item.outcome).toMatchObject({ state: "missing", actual: null });
  });

  it("keeps review-required extraction ahead of an observed fulfillment event", () => {
    const item = buildPromiseLedgerItem(
      {
        ...PROMISE_LEDGER_FIXTURES.valid,
        extractionStatus: "candidate",
      },
      [
        {
          opportunityReferenceId: PROMISE_LEDGER_FIXTURES.valid.opportunityReferenceId,
          provenanceState: "observed",
          eventType: "document_delivered",
          occurredAt: new Date("2026-10-06T11:00:00Z"),
        },
      ],
      [],
      asOf,
    );

    expect(item.status).toBe("at-risk");
    expect(item.outcome).toMatchObject({
      state: "review-required",
      actual: "document_delivered",
    });
  });

  it("keeps evidence from masquerading as fulfillment and marks overdue promises at risk", () => {
    const item = buildPromiseLedgerItem(
      {
        ...PROMISE_LEDGER_FIXTURES.valid,
        dueWindow: { kind: "point", dueAt: "2026-10-05T17:00:00Z" },
      },
      [],
      [],
      asOf,
    );

    expect(item.status).toBe("at-risk");
    expect(item.fulfillmentObserved).toBe(false);
  });

  it("surfaces review-needed extraction and preserves a range due window", () => {
    const item = buildPromiseLedgerItem(
      {
        ...PROMISE_LEDGER_FIXTURES.valid,
        extractionStatus: "candidate",
        dueWindow: {
          kind: "range",
          startsAt: "2026-10-08T12:00:00Z",
          endsAt: "2026-10-09T12:00:00Z",
        },
      },
      [],
      [],
      asOf,
    );

    expect(item.status).toBe("at-risk");
    expect(item.dueWindow.kind).toBe("range");
    expect(item.dueWindow).toMatchObject({
      startsAt: "2026-10-08T12:00:00Z",
      endsAt: "2026-10-09T12:00:00Z",
    });
  });

  it("counts unresolved and at-risk records without mutating source records", () => {
    const model = buildPromiseLedgerModel(
      [PROMISE_LEDGER_FIXTURES.valid],
      [],
      [],
      asOf,
    );

    expect(model.items).toHaveLength(1);
    expect(model.counts).toMatchObject({
      total: 1,
      unresolved: 1,
      atRisk: 0,
    });
    expect(PROMISE_LEDGER_FIXTURES.valid.extractionStatus).toBe("accepted");
  });
});
