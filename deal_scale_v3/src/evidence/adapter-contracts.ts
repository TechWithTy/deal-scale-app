import { z } from "zod";

export function createEvidenceIdempotencyKey(input: {
  workspaceId: string;
  connectionId: string;
  provider: string;
  externalId: string;
}): string {
  return [input.workspaceId, input.connectionId, input.provider, input.externalId]
    .map(encodeURIComponent)
    .join(":");
}

const timestampWithTimezoneSchema = z.string().refine(
  (value) => /(?:Z|[+-]\d{2}:\d{2})$/.test(value) && !Number.isNaN(Date.parse(value)),
  "Timestamp must be ISO-8601 and include an explicit timezone offset",
);

const normalizedFieldValueSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

export const connectionHealthSchema = z
  .object({
    workspaceId: z.string().uuid(),
    connectionId: z.string().min(1),
    provider: z.string().min(1),
    status: z.enum(["healthy", "degraded", "unauthorized", "unavailable"]),
    checkedAt: timestampWithTimezoneSchema,
    message: z.string().min(1).nullable(),
  })
  .strict();

export const evidenceAdapterErrorSchema = z
  .object({
    code: z.enum([
      "rate-limited",
      "transient",
      "unauthorized",
      "invalid-request",
      "provider-unavailable",
    ]),
    retryable: z.boolean(),
    attempt: z.number().int().min(1),
    maxAttempts: z.number().int().min(1),
    retryAfterMs: z.number().int().min(0).nullable(),
  })
  .strict()
  .superRefine((failure, context) => {
    if (failure.attempt > failure.maxAttempts) {
      context.addIssue({
        code: "custom",
        path: ["attempt"],
        message: "attempt cannot exceed maxAttempts",
      });
    }

    if (!failure.retryable && failure.retryAfterMs !== null) {
      context.addIssue({
        code: "custom",
        path: ["retryAfterMs"],
        message: "non-retryable failures cannot provide retryAfterMs",
      });
    }
  });

export const evidenceCheckpointSchema = z
  .object({
    cursor: z.string().min(1).nullable(),
    lastExternalId: z.string().min(1).nullable(),
    updatedAt: timestampWithTimezoneSchema,
  })
  .strict();

export const normalizedEvidenceEnvelopeSchema = z
  .object({
    workspaceId: z.string().uuid(),
    connectionId: z.string().min(1),
    provider: z.string().min(1),
    sourceType: z.enum(["crm", "communications"]),
    externalId: z.string().min(1),
    occurredAt: timestampWithTimezoneSchema,
    timezone: z.string().min(1),
    ingestedAt: timestampWithTimezoneSchema,
    rawReference: z
      .object({
        kind: z.enum(["api", "export", "webhook", "document"]),
        locator: z.string().min(1),
        contentHash: z.string().min(1).nullable(),
      })
      .strict(),
    normalizedFields: z.record(z.string().min(1), normalizedFieldValueSchema),
    idempotencyKey: z.string().min(1),
  })
  .strict()
  .superRefine((evidence, context) => {
    const expectedKey = createEvidenceIdempotencyKey(evidence);
    if (evidence.idempotencyKey !== expectedKey) {
      context.addIssue({
        code: "custom",
        path: ["idempotencyKey"],
        message: "idempotencyKey must be derived from the source identity tuple",
      });
    }
  });

export const evidencePageSchema = z
  .object({
    items: z.array(normalizedEvidenceEnvelopeSchema),
    checkpoint: evidenceCheckpointSchema,
    hasMore: z.boolean(),
    nextCursor: z.string().min(1).nullable(),
  })
  .strict()
  .superRefine((page, context) => {
    if (page.hasMore !== (page.nextCursor !== null)) {
      context.addIssue({
        code: "custom",
        path: ["nextCursor"],
        message: "hasMore must match whether nextCursor is present",
      });
    }
  });

export const evidencePageRequestSchema = z
  .object({
    workspaceId: z.string().uuid(),
    connectionId: z.string().min(1),
    cursor: z.string().min(1).nullable(),
    limit: z.number().int().min(1).max(500),
  })
  .strict();

export type ConnectionHealth = z.infer<typeof connectionHealthSchema>;
export type EvidenceAdapterError = z.infer<typeof evidenceAdapterErrorSchema>;
export type EvidenceCheckpoint = z.infer<typeof evidenceCheckpointSchema>;
export type NormalizedEvidenceEnvelope = z.infer<typeof normalizedEvidenceEnvelopeSchema>;
export type EvidencePage = z.infer<typeof evidencePageSchema>;
export type EvidencePageRequest = z.infer<typeof evidencePageRequestSchema>;

export interface EvidenceAdapter {
  readonly kind: "crm" | "communications";
  readonly provider: string;
  readonly connectionId: string;
  checkHealth(): Promise<ConnectionHealth>;
  /** Rejects with EvidenceAdapterException when provider access fails. */
  readPage(request: EvidencePageRequest): Promise<EvidencePage>;
}

export interface UnvalidatedEvidenceAdapter {
  readonly kind: "crm" | "communications";
  readonly provider: string;
  readonly connectionId: string;
  checkHealth(): Promise<unknown>;
  readPage(request: EvidencePageRequest): Promise<unknown>;
}

export interface CrmEvidenceAdapter extends EvidenceAdapter {
  readonly kind: "crm";
}

export interface CommunicationsEvidenceAdapter extends EvidenceAdapter {
  readonly kind: "communications";
}

export class EvidenceAdapterException extends Error {
  readonly details: EvidenceAdapterError;

  constructor(details: EvidenceAdapterError) {
    const parsed = evidenceAdapterErrorSchema.parse(details);
    super(parsed.code);
    this.name = "EvidenceAdapterException";
    this.details = parsed;
  }
}

export function validateEvidencePage(
  adapter: Pick<EvidenceAdapter, "kind" | "provider" | "connectionId">,
  request: EvidencePageRequest,
  page: EvidencePage,
): EvidencePage {
  const parsedPage = evidencePageSchema.parse(page);

  if (request.connectionId !== adapter.connectionId) {
    throw new Error("evidence request connection does not match adapter connection");
  }

  if (
    (request.cursor !== null && parsedPage.checkpoint.cursor === request.cursor) ||
    (parsedPage.hasMore && parsedPage.nextCursor === request.cursor)
  ) {
    throw new Error("pagination cursor did not advance");
  }

  for (const item of parsedPage.items) {
    if (
      item.workspaceId !== request.workspaceId ||
      item.connectionId !== request.connectionId ||
      item.provider !== adapter.provider ||
      item.sourceType !== adapter.kind
    ) {
      throw new Error("evidence item workspace/connection/provider/sourceType does not match adapter request");
    }
  }

  return parsedPage;
}

export function createValidatedEvidenceAdapter(
  adapter: UnvalidatedEvidenceAdapter,
): EvidenceAdapter {
  return {
    kind: adapter.kind,
    provider: adapter.provider,
    connectionId: adapter.connectionId,
    async checkHealth() {
      const health = connectionHealthSchema.parse(await adapter.checkHealth());
      if (health.connectionId !== adapter.connectionId || health.provider !== adapter.provider) {
        throw new Error("connection health identity does not match adapter");
      }
      return health;
    },
    async readPage(request) {
      const page = evidencePageSchema.parse(await adapter.readPage(request));
      return validateEvidencePage(adapter, request, page);
    },
  };
}
