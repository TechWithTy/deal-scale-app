import { describe, expect, it } from "vitest";

import {
  connectionHealthSchema,
  createValidatedEvidenceAdapter,
  evidenceAdapterErrorSchema,
  evidencePageSchema,
  normalizedEvidenceEnvelopeSchema,
  createEvidenceIdempotencyKey,
} from "../src/evidence/adapter-contracts";
import {
  createMockCommunicationsAdapter,
  createMockCrmAdapter,
} from "../src/evidence/mock-adapters";

const workspaceId = "00000000-0000-4000-8000-000000000001";

const crmEvent = {
  workspaceId,
  connectionId: "crm-connection",
  provider: "mock-crm",
  sourceType: "crm",
  externalId: "deal-001",
  occurredAt: "2026-10-05T12:30:00-06:00",
  timezone: "America/Denver",
  ingestedAt: "2026-10-05T12:35:00Z",
  rawReference: {
    kind: "api",
    locator: "mock-crm://deals/deal-001",
    contentHash: "sha256:deal-001",
  },
  normalizedFields: {
    stage: "proposal",
    amount: 12000,
    isOpen: true,
  },
  idempotencyKey: createEvidenceIdempotencyKey({
    workspaceId,
    connectionId: "crm-connection",
    provider: "mock-crm",
    externalId: "deal-001",
  }),
};

const firstPage = {
  items: [crmEvent],
  checkpoint: {
    cursor: "cursor-1",
    lastExternalId: "deal-001",
    updatedAt: "2026-10-05T12:35:00Z",
  },
  hasMore: true,
  nextCursor: "cursor-2",
};

describe("evidence adapter contracts", () => {
  it("accepts timezone-aware normalized evidence with an inspectable raw reference", () => {
    expect(normalizedEvidenceEnvelopeSchema.parse(crmEvent)).toEqual(crmEvent);
  });

  it("rejects provider payloads at the normalized contract boundary", () => {
    expect(() =>
      normalizedEvidenceEnvelopeSchema.parse({
        ...crmEvent,
        providerPayload: { privateProviderField: "must-not-cross-boundary" },
      }),
    ).toThrow();
  });

  it("requires a cursor checkpoint and preserves retry semantics", () => {
    expect(evidencePageSchema.parse(firstPage).checkpoint.cursor).toBe("cursor-1");
    expect(
      evidenceAdapterErrorSchema.parse({
        code: "rate-limited",
        retryable: true,
        attempt: 1,
        maxAttempts: 3,
        retryAfterMs: 2500,
      }).retryAfterMs,
    ).toBe(2500);
    expect(() =>
      evidenceAdapterErrorSchema.parse({
        code: "transient",
        retryable: true,
        attempt: 4,
        maxAttempts: 3,
        retryAfterMs: 0,
      }),
    ).toThrow();
  });

  it.each([
    "October 5, 2026 Z",
    "2026-10-05Z",
    "2026-02-30T12:00:00Z",
  ])("rejects malformed timestamps at the shared contract boundary: %s", (timestamp) => {
    expect(() => connectionHealthSchema.parse({
      workspaceId,
      connectionId: "crm-connection",
      provider: "mock-crm",
      status: "healthy",
      checkedAt: timestamp,
      message: null,
    })).toThrow();
  });

  it("derives stable idempotency keys from the source identity tuple", () => {
    const sameKey = createEvidenceIdempotencyKey({
      workspaceId,
      connectionId: "crm-connection",
      provider: "mock-crm",
      externalId: "deal-001",
    });

    expect(sameKey).toBe(crmEvent.idempotencyKey);
    expect(
      createEvidenceIdempotencyKey({
        workspaceId,
        connectionId: "crm-connection",
        provider: "mock-crm",
        externalId: "deal-002",
      }),
    ).not.toBe(sameKey);

    expect(() =>
      normalizedEvidenceEnvelopeSchema.parse({ ...crmEvent, idempotencyKey: "wrong-key" }),
    ).toThrow();
  });

  it("exposes equivalent health and cursor-based paging for CRM and communications adapters", async () => {
    const crm = createMockCrmAdapter([firstPage]);
    const communications = createMockCommunicationsAdapter([firstPage]);

    const crmHealth = connectionHealthSchema.parse(await crm.checkHealth());
    expect(crmHealth.status).toBe("healthy");
    expect(crmHealth.connectionId).toBe("crm-connection");
    expect(connectionHealthSchema.parse(await communications.checkHealth()).status).toBe("healthy");

    const page = await crm.readPage({
      workspaceId,
      connectionId: "crm-connection",
      cursor: null,
      limit: 50,
    });

    expect(page.items[0]?.externalId).toBe("deal-001");
    expect(page.nextCursor).toBe("cursor-2");
  });

  it("rejects CRM evidence from a communications adapter", async () => {
    const communications = createMockCommunicationsAdapter([{
      ...firstPage,
      items: [{
        ...crmEvent,
        connectionId: "communications-connection",
        provider: "mock-crm",
        sourceType: "crm",
        idempotencyKey: createEvidenceIdempotencyKey({
          workspaceId,
          connectionId: "communications-connection",
          provider: "mock-crm",
          externalId: crmEvent.externalId,
        }),
      }],
    }]);

    await expect(communications.readPage({
      workspaceId,
      connectionId: "communications-connection",
      cursor: null,
      limit: 50,
    })).rejects.toThrow("provider");
  });

  it("applies page limits and rejects unknown cursors instead of silently ending history", async () => {
    const secondEvent = {
      ...crmEvent,
      externalId: "deal-002",
      idempotencyKey: createEvidenceIdempotencyKey({
        workspaceId,
        connectionId: "crm-connection",
        provider: "mock-crm",
        externalId: "deal-002",
      }),
    };
    const adapter = createMockCrmAdapter([
      { ...firstPage, items: [crmEvent, secondEvent] },
    ]);

    const limitedPage = await adapter.readPage({
      workspaceId,
      connectionId: "crm-connection",
      cursor: null,
      limit: 1,
    });

    expect(limitedPage.items).toHaveLength(1);
    expect(limitedPage.hasMore).toBe(true);
    await expect(
      adapter.readPage({
        workspaceId,
        connectionId: "crm-connection",
        cursor: "unknown-cursor",
        limit: 50,
      }),
    ).rejects.toMatchObject({ details: { code: "invalid-request" } });
  });

  it("validates raw adapter output before exposing it to detector consumers", async () => {
    const rawAdapter = {
      kind: "crm" as const,
      provider: "mock-crm",
      connectionId: "crm-connection",
      checkHealth: async () => ({
        status: "healthy" as const,
        checkedAt: "2026-10-05T12:00:00Z",
        message: null,
        workspaceId,
        connectionId: "crm-connection",
        provider: "mock-crm",
      }),
      readPage: async () => ({
        ...firstPage,
        items: [
          {
            ...crmEvent,
            provider: "other-provider",
            idempotencyKey: createEvidenceIdempotencyKey({
              workspaceId,
              connectionId: "crm-connection",
              provider: "other-provider",
              externalId: "deal-001",
            }),
          },
        ],
      }),
    };

    await expect(
      createValidatedEvidenceAdapter(rawAdapter).readPage({
        workspaceId,
        connectionId: "crm-connection",
        cursor: null,
        limit: 50,
      }),
    ).rejects.toThrow("provider");
  });
});
