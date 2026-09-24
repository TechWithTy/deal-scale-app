import { describe, expect, it } from "vitest";

import {
  PROMISE_LEDGER_FIXTURES,
  promiseExtractionOutputSchema,
  promiseLedgerRecordSchema,
} from "../src/promise-ledger/contract";

describe("Promise Ledger v1 contract", () => {
  it("accepts a reviewable promise with evidence and version metadata", () => {
    const parsed = promiseLedgerRecordSchema.parse(PROMISE_LEDGER_FIXTURES.valid);

    expect(parsed.extractionMetadata.contractVersion).toBe("promise.v1");
    expect(parsed.evidenceReferences).toHaveLength(1);
    expect(parsed.expectedFulfillmentEvent.type).toBe("crm_task_completed");
  });

  it("rejects malformed extraction output instead of allowing it to cross the boundary", () => {
    const result = promiseExtractionOutputSchema.safeParse({
      ...PROMISE_LEDGER_FIXTURES.valid,
      confidence: 1.1,
      evidenceReferences: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects an impossible due window", () => {
    const result = promiseLedgerRecordSchema.safeParse({
      ...PROMISE_LEDGER_FIXTURES.valid,
      dueWindow: {
        kind: "range",
        startsAt: "2026-10-08T12:00:00Z",
        endsAt: "2026-10-07T12:00:00Z",
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects blank required strings and non-ISO timestamps", () => {
    const validOutput = {
      maker: PROMISE_LEDGER_FIXTURES.valid.maker,
      action: PROMISE_LEDGER_FIXTURES.valid.action,
      dueWindow: PROMISE_LEDGER_FIXTURES.valid.dueWindow,
      evidenceReferences: PROMISE_LEDGER_FIXTURES.valid.evidenceReferences,
      expectedFulfillmentEvent: PROMISE_LEDGER_FIXTURES.valid.expectedFulfillmentEvent,
      extractionMetadata: PROMISE_LEDGER_FIXTURES.valid.extractionMetadata,
      confidence: PROMISE_LEDGER_FIXTURES.valid.confidence,
      extractionStatus: PROMISE_LEDGER_FIXTURES.valid.extractionStatus,
    };
    const blankResult = promiseExtractionOutputSchema.safeParse({
      ...validOutput,
      maker: { role: "seller", identityRef: " " },
    });
    const timestampResult = promiseExtractionOutputSchema.safeParse({
      ...validOutput,
      evidenceReferences: [
        {
          ...PROMISE_LEDGER_FIXTURES.valid.evidenceReferences[0],
          observedAt: "October 5, 2026 Z",
        },
      ],
    });

    expect(blankResult.success).toBe(false);
    expect(timestampResult.success).toBe(false);
  });
});

