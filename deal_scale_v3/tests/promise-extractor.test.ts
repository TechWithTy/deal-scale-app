import { describe, expect, it } from "vitest";

import {
  MAX_PROMPT_CONTENT_LENGTH,
  MAX_PROMPT_LENGTH,
  extractPromisesFromEvidence,
  type PromiseExtractionProvider,
  type PromiseLedgerStore,
} from "../src/promise-ledger/extractor";
import {
  candidate,
  createProvider,
  createStore,
  evidence,
  extractionCandidate,
  workspaceId,
} from "./promise-extractor-fixtures";

describe("structured promise extraction pipeline", () => {
  it("persists validated promises with evidence and model version metadata", async () => {
    const { store, promises } = createStore();
    const prompts: string[] = [];
    const provider = createProvider([{ kind: "promise", candidates: [extractionCandidate()] }], prompts);

    const result = await extractPromisesFromEvidence({
      evidence: [evidence],
      provider,
      store,
      now: () => "2026-10-05T15:00:00Z",
    });

    expect(result).toMatchObject({ processed: 1, persisted: 1, nonPromises: 0, failed: 0 });
    expect(promises[0]).toMatchObject({
      workspaceId,
      opportunityReferenceId: "opp-001",
      extractionStatus: "accepted",
      evidenceReferences: [
        {
          sourceRecordId: "message-001",
          excerpt: evidence.content,
          observedAt: evidence.observedAt,
        },
      ],
      extractionMetadata: {
        model: provider.model,
        promptVersion: provider.promptVersion,
        contractVersion: "promise.v1",
      },
    });
    expect(prompts[0]).toContain(evidence.content);
    expect(prompts[0]).toContain(evidence.observedAt);
    expect(prompts[0]).toContain(evidence.timezone);
    expect(prompts[0]).toContain("seller/seller-001");
  });

  it("does not persist a provider-classified non-promise", async () => {
    const { store, promises } = createStore();
    const result = await extractPromisesFromEvidence({
      evidence: [evidence],
      provider: createProvider([{ kind: "non_promise" }], []),
      store,
    });

    expect(result).toMatchObject({ processed: 1, persisted: 0, nonPromises: 1, failed: 0 });
    expect(promises).toHaveLength(0);
  });

  it("persists every candidate returned for one communication with distinct source-aware IDs", async () => {
    const { store, promises } = createStore();
    const secondCandidate = {
      ...candidate,
      action: { ...candidate.action, description: "Send the implementation timeline to the buyer" },
    };

    const result = await extractPromisesFromEvidence({
      evidence: [evidence],
      provider: createProvider(
        [{ kind: "promise", candidates: [extractionCandidate(), extractionCandidate(secondCandidate)] }],
        [],
      ),
      store,
    });

    expect(result).toMatchObject({ processed: 1, persisted: 2, failed: 0 });
    expect(new Set(promises.map((promise) => (promise as { externalId: string }).externalId)).size).toBe(2);
    expect(promises[0]).toMatchObject({
      externalId: expect.stringContaining("communications-connection"),
    });
    expect(promises[0]).toMatchObject({
      externalId: expect.stringContaining("mock-communications"),
    });
  });

  it("processes later bounded chunks so late commitments are not discarded", async () => {
    const { store, promises } = createStore();
    const prompts: string[] = [];
    const lateCommitment = "I will deliver the signed order form tomorrow.";
    const lateCandidate = {
      ...candidate,
      action: { ...candidate.action, description: "deliver the signed order form" },
    };
    const longEvidence = {
      ...evidence,
      content: "x".repeat(MAX_PROMPT_CONTENT_LENGTH - 20) + lateCommitment,
    };

    const result = await extractPromisesFromEvidence({
      evidence: [longEvidence],
      provider: createProvider(
        [
          { kind: "non_promise" },
          {
            kind: "promise",
            candidates: [
              extractionCandidate(lateCandidate, {
                start: MAX_PROMPT_CONTENT_LENGTH - 20 - 11_000,
                end: MAX_PROMPT_CONTENT_LENGTH - 20 - 11_000 + lateCommitment.length,
              }),
            ],
          },
        ],
        prompts,
      ),
      store,
    });

    expect(result).toMatchObject({ processed: 1, persisted: 1, nonPromises: 1, failed: 0 });
    expect(prompts).toHaveLength(2);
    expect(prompts[1]).toContain(lateCommitment);
    expect(promises).toHaveLength(1);
    expect((promises[0] as { evidenceReferences: Array<{ excerpt: string }> }).evidenceReferences[0].excerpt).toContain(
      lateCommitment,
    );
    expect((promises[0] as { evidenceReferences: Array<{ locator: string }> }).evidenceReferences[0].locator).toContain(
      "chunkOffset=11000",
    );
  });

  it("bounds evidence content before sending it to the provider", async () => {
    const { store } = createStore();
    const prompts: string[] = [];
    const longEvidence = { ...evidence, content: "x".repeat(MAX_PROMPT_CONTENT_LENGTH + 1_000) };

    await extractPromisesFromEvidence({
      evidence: [longEvidence],
      provider: createProvider([{ kind: "non_promise" }], prompts),
      store,
    });

    const promptContent = prompts[0].split("Evidence content:\n")[1];
    expect(promptContent).toHaveLength(MAX_PROMPT_CONTENT_LENGTH);
  });

  it("bounds the complete prompt when source metadata is unusually large", async () => {
    const { store } = createStore();
    const prompts: string[] = [];
    const longEvidence = {
      ...evidence,
      sourceRecordId: "m".repeat(50_000),
      content: "x".repeat(50_000),
    };

    await extractPromisesFromEvidence({
      evidence: [longEvidence],
      provider: createProvider([{ kind: "non_promise" }], prompts),
      store,
    });

    expect(prompts[0].length).toBeLessThanOrEqual(MAX_PROMPT_LENGTH);
  });

  it("records malformed model output and continues the batch", async () => {
    const { store, promises, failures } = createStore();
    const result = await extractPromisesFromEvidence({
      evidence: [evidence, { ...evidence, sourceRecordId: "message-002" }],
      provider: createProvider(
        [
          { kind: "promise", candidates: [extractionCandidate({ ...candidate, confidence: 1.1 })] },
          { kind: "promise", candidates: [extractionCandidate()] },
        ],
        [],
      ),
      store,
    });

    expect(result).toMatchObject({ processed: 2, persisted: 1, nonPromises: 0, failed: 1 });
    expect(promises).toHaveLength(1);
    expect(failures[0]).toMatchObject({ sourceRecordId: "message-001", code: "validation-error" });
  });

  it("continues after provider and failure-recording errors", async () => {
    const { promises } = createStore();
    const failures: unknown[] = [];
    let calls = 0;
    const provider: PromiseExtractionProvider = {
      model: "promise-extractor-test",
      promptVersion: "promise-extraction.v1",
      extract: async () => {
        calls += 1;
        if (calls === 1) {
          throw new Error("provider unavailable");
        }
        return { kind: "promise", candidates: [extractionCandidate()] };
      },
    };
    const store: PromiseLedgerStore = {
      upsertPromise: async (record) => promises.push(record),
      recordFailure: async (failure) => {
        failures.push(failure);
        throw new Error("failure sink unavailable");
      },
    };

    const result = await extractPromisesFromEvidence({
      evidence: [evidence, { ...evidence, sourceRecordId: "message-002" }],
      provider,
      store,
    });

    expect(result).toMatchObject({ processed: 2, persisted: 1, failed: 1 });
    expect(promises).toHaveLength(1);
    expect(failures).toHaveLength(1);
  });
});

