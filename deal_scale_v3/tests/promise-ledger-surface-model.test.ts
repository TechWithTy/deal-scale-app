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
          eventType: "document_delivered",
          occurredAt: new Date("2026-10-06T11:00:00Z"),
        },
      ],
      [],
      asOf,
    );

    expect(item.status).toBe("fulfilled");
    expect(item.evidenceLinks[0]?.href).toBe(
      PROMISE_LEDGER_FIXTURES.valid.evidenceReferences[0].locator,
    );
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
