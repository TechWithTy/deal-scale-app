import {
  connectionHealthSchema,
  createValidatedEvidenceAdapter,
  EvidenceAdapterException,
  evidencePageSchema,
  type CommunicationsEvidenceAdapter,
  type CrmEvidenceAdapter,
  type EvidencePage,
  type EvidencePageRequest,
} from "./adapter-contracts";

function readPage(pages: readonly EvidencePage[], request: EvidencePageRequest): EvidencePage {
  const page =
    request.cursor === null
      ? pages[0]
      : pages.find((candidate) => candidate.checkpoint.cursor === request.cursor);

  if (!page && request.cursor !== null) {
    throw new EvidenceAdapterException({
      code: "invalid-request",
      retryable: false,
      attempt: 1,
      maxAttempts: 1,
      retryAfterMs: null,
    });
  }

  return evidencePageSchema.parse(
    page ?? {
      items: [],
      checkpoint: {
        cursor: request.cursor,
        lastExternalId: null,
        updatedAt: "2026-10-05T12:00:00Z",
      },
      hasMore: false,
      nextCursor: null,
    },
  );
}

export function createMockCrmAdapter(pages: readonly EvidencePage[]): CrmEvidenceAdapter {
  return createValidatedEvidenceAdapter({
    kind: "crm",
    provider: "mock-crm",
    connectionId: "crm-connection",
    async checkHealth() {
      return connectionHealthSchema.parse({
        workspaceId: "00000000-0000-4000-8000-000000000001",
        connectionId: "crm-connection",
        provider: "mock-crm",
        status: "healthy",
        checkedAt: "2026-10-05T12:00:00Z",
        message: null,
      });
    },
    async readPage(request) {
      const page = readPage(pages, request);
      const items = page.items.slice(0, request.limit);
      return {
        ...page,
        items,
        hasMore: items.length < page.items.length || page.hasMore,
        nextCursor: page.nextCursor,
      };
    },
  }) as CrmEvidenceAdapter;
}

export function createMockCommunicationsAdapter(
  pages: readonly EvidencePage[],
): CommunicationsEvidenceAdapter {
  return createValidatedEvidenceAdapter({
    kind: "communications",
    provider: "mock-communications",
    connectionId: "communications-connection",
    async checkHealth() {
      return connectionHealthSchema.parse({
        workspaceId: "00000000-0000-4000-8000-000000000001",
        connectionId: "communications-connection",
        provider: "mock-communications",
        status: "healthy",
        checkedAt: "2026-10-05T12:00:00Z",
        message: null,
      });
    },
    async readPage(request) {
      const page = readPage(pages, request);
      const items = page.items.slice(0, request.limit);
      return {
        ...page,
        items,
        hasMore: items.length < page.items.length || page.hasMore,
        nextCursor: page.nextCursor,
      };
    },
  }) as CommunicationsEvidenceAdapter;
}
