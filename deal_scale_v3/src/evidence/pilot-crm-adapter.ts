import {
  createEvidenceIdempotencyKey,
  createValidatedEvidenceAdapter,
  EvidenceAdapterException,
  type CrmEvidenceAdapter,
  type EvidencePageRequest,
  type UnvalidatedEvidenceAdapter,
} from "./adapter-contracts";

export interface PilotCrmRecord {
  id: string;
  assignedSellerId: string | null;
  stage: string;
  status: string;
  taskIds: string[];
  taskStatuses: string[];
  occurredAt: string;
  timezone: string;
  rawReference: string;
  contentHash: string;
  updatedAt?: string;
}

export interface PilotCrmAdapterOptions {
  workspaceId: string;
  connectionId: string;
  records: readonly PilotCrmRecord[];
  pageSize?: number;
  now?: () => string;
  failOnceOnCursor?: string;
}

function mapRecord(
  record: PilotCrmRecord,
  options: PilotCrmAdapterOptions,
  ingestedAt: string,
) {
  return {
    workspaceId: options.workspaceId,
    connectionId: options.connectionId,
    provider: "pilot-crm",
    sourceType: "crm" as const,
    externalId: record.id,
    occurredAt: record.occurredAt,
    timezone: record.timezone,
    ingestedAt,
    rawReference: {
      kind: "api" as const,
      locator: record.rawReference,
      contentHash: record.contentHash,
    },
    normalizedFields: {
      assignedSellerId: record.assignedSellerId,
      stage: record.stage,
      status: record.status,
      taskCount: record.taskIds.length,
      taskIds: JSON.stringify(record.taskIds),
      taskStatuses: JSON.stringify(record.taskStatuses),
      updatedAt: record.updatedAt ?? record.occurredAt,
    },
    idempotencyKey: createEvidenceIdempotencyKey({
      workspaceId: options.workspaceId,
      connectionId: options.connectionId,
      provider: "pilot-crm",
      externalId: record.id,
    }),
  };
}

function invalidCursorError(): EvidenceAdapterException {
  return new EvidenceAdapterException({
    code: "invalid-request",
    retryable: false,
    attempt: 1,
    maxAttempts: 1,
    retryAfterMs: null,
  });
}

export function createPilotCrmAdapter(options: PilotCrmAdapterOptions): CrmEvidenceAdapter {
  const records = [...options.records];
  const now = options.now ?? (() => new Date().toISOString());
  let failedCursor: string | null = null;

  const rawAdapter: UnvalidatedEvidenceAdapter = {
    kind: "crm",
    provider: "pilot-crm",
    connectionId: options.connectionId,
    async checkHealth() {
      return {
        workspaceId: options.workspaceId,
        connectionId: options.connectionId,
        provider: "pilot-crm",
        status: "healthy" as const,
        checkedAt: now(),
        message: null,
      };
    },
    async readPage(request: EvidencePageRequest) {
      if (request.cursor === options.failOnceOnCursor && failedCursor !== request.cursor) {
        failedCursor = request.cursor;
        throw new EvidenceAdapterException({
          code: "transient",
          retryable: true,
          attempt: 1,
          maxAttempts: 3,
          retryAfterMs: 0,
        });
      }

      const start = request.cursor === null ? 0 : records.findIndex((record) => record.id === request.cursor);
      if (start < 0) {
        throw invalidCursorError();
      }

      const pageSize = Math.min(options.pageSize ?? records.length, request.limit);
      const pageRecords = records.slice(start, start + pageSize);
      const nextCursor = records[start + pageRecords.length]?.id ?? null;
      const ingestedAt = now();

      return {
        items: pageRecords.map((record) => mapRecord(record, options, ingestedAt)),
        checkpoint: {
          cursor: nextCursor,
          lastExternalId: pageRecords[pageRecords.length - 1]?.id ?? null,
          updatedAt: ingestedAt,
        },
        hasMore: nextCursor !== null,
        nextCursor,
      };
    },
  };

  return createValidatedEvidenceAdapter(rawAdapter) as CrmEvidenceAdapter;
}
