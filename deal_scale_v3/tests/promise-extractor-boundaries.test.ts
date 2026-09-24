import { describe, expect, it } from "vitest";

import {
  extractPromisesFromEvidence,
  MAX_SOURCE_SPAN_LENGTH,
} from "../src/promise-ledger/extractor";
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

  it("canonicalizes oversized valid observation timestamps", () => {
    const prompt = buildPromiseExtractionPrompt({
      sourceType: evidence.sourceType,
      sourceRecordId: evidence.sourceRecordId,
      maker: evidence.maker,
      observedAt: `2026-10-05T14:58:00.${"1".repeat(50_000)}Z`,
      timezone: evidence.timezone,
      content: evidence.content,
    });

    expect(prompt).toContain("Evidence observed at: 2026-10-05T14:58:00.111Z");
    expect(prompt.length).toBeLessThanOrEqual(MAX_PROMPT_LENGTH);
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

  it("persists valid siblings when one candidate wrapper is malformed", async () => {
    const { store, promises, failures } = createStore();
    const result = await extractPromisesFromEvidence({
      evidence: [evidence],
      provider: createProvider(
        [
          {
            kind: "promise",
            candidates: [
              { candidate, sourceSpan: { start: -1, end: 4 } },
              extractionCandidate(),
            ],
          },
        ],
        [],
      ),
      store,
    });

    expect(result).toMatchObject({ processed: 1, persisted: 1, failed: 1 });
    expect(promises).toHaveLength(1);
    expect(failures[0]).toMatchObject({ code: "validation-error" });
  });

  it("keeps the complete source span in a full-length excerpt", async () => {
    const { store, promises } = createStore();
    const content = "x".repeat(5_000) + "y".repeat(MAX_SOURCE_SPAN_LENGTH) + "z".repeat(3_000);
    const result = await extractPromisesFromEvidence({
      evidence: [{ ...evidence, content }],
      provider: createProvider(
        [{
          kind: "promise",
          candidates: [extractionCandidate(candidate, { start: 5_000, end: 9_000 })],
        }],
        [],
      ),
      store,
    });

    expect(result).toMatchObject({ persisted: 1, failed: 0 });
    expect((promises[0] as { evidenceReferences: Array<{ excerpt: string }> })
      .evidenceReferences[0].excerpt).toBe("y".repeat(MAX_SOURCE_SPAN_LENGTH));
  });

  it("keeps a maximum-sized boundary-spanning commitment in one chunk", async () => {
    const { store, promises } = createStore();
    const content = "x".repeat(9_000) + "y".repeat(MAX_SOURCE_SPAN_LENGTH);
    const result = await extractPromisesFromEvidence({
      evidence: [{ ...evidence, content }],
      provider: createProvider(
        [
          { kind: "non_promise" },
          {
            kind: "promise",
            candidates: [
              extractionCandidate(candidate, {
                start: 1_000,
                end: 1_000 + MAX_SOURCE_SPAN_LENGTH,
              }),
            ],
          },
        ],
        [],
      ),
      store,
    });

    expect(result).toMatchObject({ processed: 1, persisted: 1, failed: 0 });
    expect(promises).toHaveLength(1);
  });
});

