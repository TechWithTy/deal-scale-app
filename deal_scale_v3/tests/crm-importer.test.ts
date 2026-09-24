import { describe, expect, it } from "vitest";

import {
  createPilotCrmAdapter,
  type PilotCrmRecord,
} from "../src/evidence/pilot-crm-adapter";
import {
  importCrmHistory,
} from "../src/evidence/crm-importer";
import { createInMemoryCrmImportStore } from "../src/evidence/crm-import-store";
import {
  EvidenceAdapterException,
  type CrmEvidenceAdapter,
  type EvidencePage,
} from "../src/evidence/adapter-contracts";

const workspaceId = "00000000-0000-4000-8000-000000000001";

const records: PilotCrmRecord[] = [
  {
    id: "opp-001",
    assignedSellerId: "seller-001",
    stage: "proposal",
    status: "open",
    taskIds: ["task-001", "task-002"],
    taskStatuses: ["open", "completed"],
    occurredAt: "2026-10-05T12:00:00-06:00",
    timezone: "America/Denver",
    rawReference: "pilot-crm://opportunities/opp-001",
    contentHash: "sha256:opp-001",
  },
  {
    id: "opp-002",
    assignedSellerId: null,
    stage: "qualification",
    status: "paused",
    taskIds: [],
    taskStatuses: [],
    occurredAt: "2026-10-06T09:00:00-06:00",
    timezone: "America/Denver",
    rawReference: "pilot-crm://opportunities/opp-002",
    contentHash: "sha256:opp-002",
  },
];

function createScriptedAdapter(
  workspaceId: string,
  readPage: CrmEvidenceAdapter["readPage"],
): CrmEvidenceAdapter {
  return {
    kind: "crm",
    provider: "scripted-crm",
    connectionId: "crm-connection",
    checkHealth: async () => ({
      workspaceId,
      connectionId: "crm-connection",
      provider: "scripted-crm",
      status: "healthy",
      checkedAt: "2026-10-07T12:00:00Z",
      message: null,
    }),
    readPage,
  };
}

const emptyPage: EvidencePage = {
  items: [],
  checkpoint: {
    cursor: null,
    lastExternalId: null,
    updatedAt: "2026-10-07T12:00:00Z",
  },
  hasMore: false,
  nextCursor: null,
};

describe("pilot CRM historical importer", () => {
  it("maps assignments, stages, statuses, tasks, timestamps, and raw references", async () => {
    const adapter = createPilotCrmAdapter({
      workspaceId,
      connectionId: "crm-connection",
      records: [records[0]],
      pageSize: 10,
    });
    const page = await adapter.readPage({
      workspaceId,
      connectionId: "crm-connection",
      cursor: null,
      limit: 50,
    });

    expect(page.items[0]).toMatchObject({
      externalId: "opp-001",
      occurredAt: records[0].occurredAt,
      timezone: "America/Denver",
      rawReference: {
        locator: records[0].rawReference,
        contentHash: records[0].contentHash,
      },
      normalizedFields: {
        assignedSellerId: "seller-001",
        stage: "proposal",
        status: "open",
        taskIds: JSON.stringify(["task-001", "task-002"]),
        taskStatuses: JSON.stringify(["open", "completed"]),
      },
    });
  });

  it("paginates, retries transient provider failures, persists checkpoints, and reports status", async () => {
    const adapter = createPilotCrmAdapter({
      workspaceId,
      connectionId: "crm-connection",
      records,
      pageSize: 1,
      failOnceOnCursor: "opp-002",
    });
    const store = createInMemoryCrmImportStore();

    const result = await importCrmHistory({
      workspaceId,
      connectionId: "crm-connection",
      connectionName: "Pilot CRM",
      adapter,
      store,
      now: () => "2026-10-07T12:00:00Z",
      retry: { maxAttempts: 3, delay: async () => undefined },
    });

    expect(result).toMatchObject({ pages: 2, imported: 2, duplicates: 0, retries: 1 });
    expect((await store.getCheckpoint({ workspaceId, connectionId: "crm-connection" }))?.cursor).toBeNull();
    expect(store.getImportStatus("crm-connection", workspaceId)).toMatchObject({
      status: "completed",
      imported: 2,
      retries: 1,
    });
    expect(store.getSourceConnection("crm-connection", workspaceId)).toMatchObject({
      connectionStatus: "active",
      provider: "pilot-crm",
      checkpoint: { cursor: null },
    });
  });

  it("does not duplicate source records when the same history is imported again", async () => {
    const adapter = createPilotCrmAdapter({
      workspaceId,
      connectionId: "crm-connection",
      records,
      pageSize: 2,
    });
    const store = createInMemoryCrmImportStore();
    const options = {
      workspaceId,
      connectionId: "crm-connection",
      connectionName: "Pilot CRM",
      adapter,
      store,
      now: () => "2026-10-07T12:00:00Z",
      retry: { maxAttempts: 2, delay: async () => undefined },
    };

    await importCrmHistory(options);
    const rerun = await importCrmHistory(options);

    expect(rerun.imported).toBe(0);
    expect(rerun.duplicates).toBe(2);
    expect(store.getEvents()).toHaveLength(2);
  });

  it("updates the canonical event when a source record changes on rerun", async () => {
    const store = createInMemoryCrmImportStore();
    const options = {
      workspaceId,
      connectionId: "crm-connection",
      connectionName: "Pilot CRM",
      store,
      now: () => "2026-10-07T12:00:00Z",
    };

    await importCrmHistory({
      ...options,
      adapter: createPilotCrmAdapter({
        workspaceId,
        connectionId: "crm-connection",
        records: [records[0]],
      }),
    });
    await importCrmHistory({
      ...options,
      adapter: createPilotCrmAdapter({
        workspaceId,
        connectionId: "crm-connection",
        records: [{ ...records[0], status: "won" }],
      }),
    });

    expect(store.getEvents()[0]?.normalizedFields.status).toBe("won");
  });

  it("rejects a health response from a different workspace before reading or persisting the connection", async () => {
    let reads = 0;
    const adapter = createScriptedAdapter("00000000-0000-4000-8000-000000000002", async () => {
      reads += 1;
      return emptyPage;
    });
    const store = createInMemoryCrmImportStore();

    await expect(
      importCrmHistory({
        workspaceId,
        connectionId: "crm-connection",
        connectionName: "Scripted CRM",
        adapter,
        store,
      }),
    ).rejects.toThrow("workspace");

    expect(reads).toBe(0);
    expect(store.getSourceConnection("crm-connection", workspaceId)).toBeUndefined();
  });

  it("waits for a positive retryAfterMs when no retry block is provided", async () => {
    let attempts = 0;
    const retryAfterMs = 20;
    const adapter = createScriptedAdapter(workspaceId, async () => {
      attempts += 1;
      if (attempts === 1) {
        throw new EvidenceAdapterException({
          code: "rate-limited",
          retryable: true,
          attempt: 1,
          maxAttempts: 3,
          retryAfterMs,
        });
      }
      return emptyPage;
    });
    const startedAt = Date.now();

    await importCrmHistory({
      workspaceId,
      connectionId: "crm-connection",
      connectionName: "Scripted CRM",
      adapter,
      store: createInMemoryCrmImportStore(),
    });

    expect(attempts).toBe(2);
    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(retryAfterMs - 2);
  });

  it("persists retries consumed when a retryable page read exhausts its attempts", async () => {
    const adapter = createScriptedAdapter(workspaceId, async () => {
      throw new EvidenceAdapterException({
        code: "transient",
        retryable: true,
        attempt: 1,
        maxAttempts: 3,
        retryAfterMs: 0,
      });
    });
    const store = createInMemoryCrmImportStore();

    await expect(
      importCrmHistory({
        workspaceId,
        connectionId: "crm-connection",
        connectionName: "Scripted CRM",
        adapter,
        store,
        retry: { maxAttempts: 3, delay: async () => undefined },
      }),
    ).rejects.toBeInstanceOf(EvidenceAdapterException);

    expect(store.getImportStatus("crm-connection", workspaceId)).toMatchObject({
      status: "failed",
      retries: 2,
      errorCode: "transient",
    });
  });
});
