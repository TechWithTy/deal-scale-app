import type {
  PromiseEvidence,
  PromiseExtractionProvider,
  PromiseLedgerStore,
} from "../src/promise-ledger/extractor";

export const workspaceId = "00000000-0000-4000-8000-000000000001";

export const evidence: PromiseEvidence = {
  workspaceId,
  opportunityReferenceId: "opp-001",
  sourceType: "communications",
  connectionId: "communications-connection",
  provider: "mock-communications",
  maker: { role: "seller", identityRef: "seller-001" },
  sourceRecordId: "message-001",
  contentType: "message",
  content: "I will send revised pricing by Wednesday.",
  locator: "communications://message/message-001",
  observedAt: "2026-10-05T14:58:00.123456Z",
};

export const candidate = {
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

export function createStore() {
  const promises: unknown[] = [];
  const failures: unknown[] = [];
  const store: PromiseLedgerStore = {
    upsertPromise: async (record) => promises.push(record),
    recordFailure: async (failure) => failures.push(failure),
  };
  return { store, promises, failures };
}

export function createProvider(outputs: unknown[], prompts: string[]) {
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

