import { describe, expect, it } from "vitest";

import {
  MAX_PROMPT_CONTENT_LENGTH,
  MAX_PROMPT_LENGTH,
  extractPromisesFromEvidence,
  type PromiseEvidence,
  type PromiseExtractionProvider,
  type PromiseLedgerStore,
} from "../src/promise-ledger/extractor";

const workspaceId = "00000000-0000-4000-8000-000000000001";

const evidence: PromiseEvidence = {
  workspaceId,
  opportunityReferenceId: "opp-001",
  sourceType: "communications",
  sourceRecordId: "message-001",
  contentType: "message",
  content: "I will send revised pricing by Wednesday.",
  locator: "communications://message/message-001",
  observedAt: "2026-10-05T14:58:00.123456Z",
};

const candidate = {
  maker: { role: "seller" as const, identityRef: "seller-001" },
  action: {
    type: "send" as const,
    description: "Send revised pricing to the buyer",
    target: "buyer-001",
  },
  dueWindow: { kind: "point" as const, dueAt: "2026-10-07T17:00:00-06:00" },
  expectedFulfillmentEvent: {
    type: "crm_task_completed",
    acceptableVariants: ["email_sent", "document_delivered"],
  },
  confidence: 0.96,
};

function createStore() {
  const promises: unknown[] = [];
  const failures: unknown[] = [];
  const store: PromiseLedgerStore = {
    upsertPromise: async (record) => promises.push(record),
    recordFailure: async (failure) => failures.push(failure),
  };
  return { store, promises, failures };
}

function createProvider(outputs: unknown[], prompts: string[]) {
  const provider: PromiseExtractionProvider = {
    model: "promise-extractor-test",
    promptVersion: "promise-extraction.v1",
    extract: async ({ prompt }) => {
      prompts.push(prompt);
      return outputs.shift();
    },
  };
  return provider;
}

describe("structured promise extraction pipeline", () => {
  it("persists validated promises with evidence and model version metadata", async () => {
    const { store, promises } = createStore();
    const prompts: string[] = [];
    const provider = createProvider([{ kind: "promise", candidate }], prompts);

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
          { kind: "promise", candidate: { ...candidate, confidence: 1.1 } },
          { kind: "promise", candidate },
        ],
        [],
      ),
      store,
    });

    expect(result).toMatchObject({ processed: 2, persisted: 1, nonPromises: 0, failed: 1 });
    expect(promises).toHaveLength(1);
    expect(failures[0]).toMatchObject({ sourceRecordId: "message-001", code: "validation-error" });
  });

  it("skips ineligible evidence without calling the provider", async () => {
    const { store, promises } = createStore();
    let calls = 0;
    const provider = createProvider([{ kind: "promise", candidate }], []);
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
        return { kind: "promise", candidate };
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
