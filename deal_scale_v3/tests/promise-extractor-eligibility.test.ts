import { describe, expect, it } from "vitest";

import { extractPromisesFromEvidence } from "../src/promise-ledger/extractor";
import {
  createProvider,
  createStore,
  evidence,
  extractionCandidate,
} from "./promise-extractor-fixtures";

describe("promise extraction eligibility", () => {
  it("skips ineligible evidence without calling the provider", async () => {
    const { store, promises } = createStore();
    let calls = 0;
    const provider = createProvider([{ kind: "promise", candidates: [extractionCandidate()] }], []);
    const originalExtract = provider.extract;
    provider.extract = async (input) => {
      calls += 1;
      return originalExtract(input);
    };

    const result = await extractPromisesFromEvidence({
      evidence: [{ ...evidence, sourceType: "crm", contentType: "opportunity" }],
      provider,
      store,
    });

    expect(result).toMatchObject({ processed: 0, skipped: 1, persisted: 0, failed: 0 });
    expect(calls).toBe(0);
    expect(promises).toHaveLength(0);
  });

  it("does not process CRM records even when their content type looks eligible", async () => {
    const { store } = createStore();
    let calls = 0;
    const provider = createProvider([{ kind: "non_promise" }], []);
    const originalExtract = provider.extract;
    provider.extract = async (input) => {
      calls += 1;
      return originalExtract(input);
    };

    const result = await extractPromisesFromEvidence({
      evidence: [{ ...evidence, sourceType: "crm", contentType: "message" }],
      provider,
      store,
    });

    expect(result).toMatchObject({ processed: 0, skipped: 1 });
    expect(calls).toBe(0);
  });
});
