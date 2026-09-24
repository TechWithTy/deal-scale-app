import { describe, expect, it } from "vitest";

import { extractPromisesFromEvidence } from "../src/promise-ledger/extractor";
import { MAX_PROMPT_LENGTH, buildPromiseExtractionPrompt } from "../src/promise-ledger/prompt";
import {
  candidate,
  createProvider,
  createStore,
  evidence,
  extractionCandidate,
} from "./promise-extractor-fixtures";

describe("promise extraction boundaries", () => {
  it("bounds unusually large timezone metadata while preserving the prompt limit", () => {
    const prompt = buildPromiseExtractionPrompt({
      sourceType: evidence.sourceType,
      sourceRecordId: evidence.sourceRecordId,
      maker: evidence.maker,
      observedAt: evidence.observedAt,
      timezone: "z".repeat(50_000),
      content: "evidence content",
    });

    expect(prompt.length).toBeLessThanOrEqual(MAX_PROMPT_LENGTH);
    expect(prompt).toContain(`Evidence timezone: ${"z".repeat(128)}`);
    expect(prompt).not.toContain("z".repeat(129));
  });

  it("rejects source spans that escape their evidence chunk", async () => {
    const { store, promises, failures } = createStore();
    const result = await extractPromisesFromEvidence({
      evidence: [evidence],
      provider: createProvider(
        [{ kind: "promise", candidates: [extractionCandidate(candidate, { start: 0, end: 10_000 })] }],
        [],
      ),
      store,
    });

    expect(result).toMatchObject({ processed: 1, persisted: 0, failed: 1 });
    expect(promises).toHaveLength(0);
    expect(failures[0]).toMatchObject({ code: "validation-error" });
  });
});

