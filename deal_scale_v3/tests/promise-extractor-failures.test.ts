import { expect, it } from "vitest";

import { extractPromisesFromEvidence, type PromiseLedgerStore } from "../src/promise-ledger/extractor";
import { createProvider, evidence, extractionCandidate } from "./promise-extractor-fixtures";

it("records persistence failures with source identity and a persistence code", async () => {
  const failures: unknown[] = [];
  const store: PromiseLedgerStore = {
    upsertPromise: async () => {
      throw new Error("ledger unavailable");
    },
    recordFailure: async (failure) => failures.push(failure),
  };

  const result = await extractPromisesFromEvidence({
    evidence: [evidence],
    provider: createProvider([{ kind: "promise", candidates: [extractionCandidate()] }], []),
    store,
  });

  expect(result).toMatchObject({ processed: 1, persisted: 0, failed: 1 });
  expect(failures[0]).toMatchObject({
    code: "persistence-error",
    connectionId: evidence.connectionId,
    provider: evidence.provider,
    sourceRecordId: evidence.sourceRecordId,
  });
});
