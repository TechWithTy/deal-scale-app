import { expect, it } from "vitest";

import { extractPromisesFromEvidence } from "../src/promise-ledger/extractor";
import { candidate, createProvider, createStore, evidence } from "./promise-extractor-fixtures";

it("keeps promise IDs stable when candidates reorder or confidence changes", async () => {
  const firstRun = createStore();
  const secondRun = createStore();
  const secondCandidate = {
    ...candidate,
    action: { ...candidate.action, description: "Send the implementation timeline to the buyer" },
  };

  await extractPromisesFromEvidence({
    evidence: [evidence],
    provider: createProvider([{ kind: "promise", candidates: [candidate, secondCandidate] }], []),
    store: firstRun.store,
  });
  await extractPromisesFromEvidence({
    evidence: [evidence],
    provider: createProvider(
      [{ kind: "promise", candidates: [{ ...secondCandidate, confidence: 0.4 }, { ...candidate, confidence: 0.5 }] }],
      [],
    ),
    store: secondRun.store,
  });

  const ids = (records: unknown[]) =>
    new Set(records.map((record) => (record as { externalId: string }).externalId));
  expect(ids(firstRun.promises)).toEqual(ids(secondRun.promises));
});

