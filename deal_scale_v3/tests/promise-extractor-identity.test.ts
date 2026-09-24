import { expect, it } from "vitest";

import { extractPromisesFromEvidence } from "../src/promise-ledger/extractor";
import {
  candidate,
  createProvider,
  createStore,
  evidence,
  extractionCandidate,
} from "./promise-extractor-fixtures";

it("keeps promise IDs stable when candidates reorder or confidence changes", async () => {
  const firstRun = createStore();
  const secondRun = createStore();
  const secondCandidate = {
    ...candidate,
    action: { ...candidate.action, description: "Send the implementation timeline to the buyer" },
    expectedFulfillmentEvent: {
      ...candidate.expectedFulfillmentEvent,
      acceptableVariants: [...candidate.expectedFulfillmentEvent.acceptableVariants].reverse(),
    },
    dueWindow: { kind: "point" as const, dueAt: "2026-10-07T23:00:00Z" },
  };

  await extractPromisesFromEvidence({
    evidence: [evidence],
    provider: createProvider(
      [{ kind: "promise", candidates: [extractionCandidate(), extractionCandidate(secondCandidate)] }],
      [],
    ),
    store: firstRun.store,
  });
  await extractPromisesFromEvidence({
      evidence: [evidence],
      provider: createProvider(
      [{
        kind: "promise",
        candidates: [
          extractionCandidate({
            ...secondCandidate,
            confidence: 0.4,
            expectedFulfillmentEvent: candidate.expectedFulfillmentEvent,
          }),
          extractionCandidate({
            ...candidate,
            confidence: 0.5,
            expectedFulfillmentEvent: secondCandidate.expectedFulfillmentEvent,
            dueWindow: secondCandidate.dueWindow,
          }),
        ],
      }],
      [],
    ),
    store: secondRun.store,
  });

  const ids = (records: unknown[]) =>
    new Set(records.map((record) => (record as { externalId: string }).externalId));
  expect(ids(firstRun.promises)).toEqual(ids(secondRun.promises));
});

