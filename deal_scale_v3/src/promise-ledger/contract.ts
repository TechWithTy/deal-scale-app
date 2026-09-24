import { z } from "zod";

const ISO_TIMESTAMP_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/;

const isStrictIsoTimestamp = (value: string): boolean => {
  const match = ISO_TIMESTAMP_PATTERN.exec(value);
  if (!match) return false;

  const [, year, month, day, hour, minute, second, offset] = match;
  const numericOffset = offset === "Z" ? 0 : Number(offset.slice(0, 3)) * 60 + Number(offset.slice(4));
  if (numericOffset < -23 * 60 - 59 || numericOffset > 23 * 60 + 59) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const calendarDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return (
    calendarDate.getUTCFullYear() === Number(year) &&
    calendarDate.getUTCMonth() === Number(month) - 1 &&
    calendarDate.getUTCDate() === Number(day) &&
    Number(hour) <= 23 &&
    Number(minute) <= 59 &&
    Number(second) <= 59
  );
};

const isoTimestampSchema = z.string().refine(isStrictIsoTimestamp, {
  message: "Timestamp must be a valid ISO-8601 instant with an explicit timezone",
});

const nonBlankString = z.string().refine((value) => value.trim().length > 0, {
  message: "Value must not be blank",
});

const makerSchema = z
  .object({
    role: z.enum(["seller", "buyer", "internal", "unknown"]),
    identityRef: nonBlankString,
  })
  .strict();

const actionSchema = z
  .object({
    type: z.enum([
      "send",
      "schedule",
      "provide",
      "review",
      "approve",
      "follow_up",
      "custom",
    ]),
    description: nonBlankString,
    target: nonBlankString.nullable(),
  })
  .strict();

const dueWindowSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("point"),
      dueAt: isoTimestampSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("range"),
      startsAt: isoTimestampSchema,
      endsAt: isoTimestampSchema,
    })
    .strict()
    .superRefine((window, context) => {
      if (Date.parse(window.endsAt) < Date.parse(window.startsAt)) {
        context.addIssue({
          code: "custom",
          path: ["endsAt"],
          message: "due window must end at or after it starts",
        });
      }
    }),
]);

const evidenceReferenceSchema = z
  .object({
    evidenceId: nonBlankString,
    sourceType: z.enum(["crm", "communications"]),
    sourceRecordId: nonBlankString,
    locator: nonBlankString,
    excerpt: nonBlankString.max(4000).nullable(),
    observedAt: isoTimestampSchema,
  })
  .strict();

const expectedFulfillmentEventSchema = z
  .object({
    type: nonBlankString,
    acceptableVariants: z.array(nonBlankString).min(1),
  })
  .strict();

const extractionMetadataSchema = z
  .object({
    model: nonBlankString,
    promptVersion: nonBlankString,
    contractVersion: z.literal("promise.v1"),
  })
  .strict();

const promiseFields = {
  maker: makerSchema,
  action: actionSchema,
  dueWindow: dueWindowSchema,
  evidenceReferences: z.array(evidenceReferenceSchema).min(1),
  expectedFulfillmentEvent: expectedFulfillmentEventSchema,
  extractionMetadata: extractionMetadataSchema,
  confidence: z.number().finite().min(0).max(1),
  extractionStatus: z.enum(["candidate", "accepted", "rejected"]),
};

export const promiseExtractionOutputSchema = z.object(promiseFields).strict();

export const promiseLedgerRecordSchema = promiseExtractionOutputSchema
  .extend({
    name: nonBlankString,
    externalId: nonBlankString,
    workspaceId: z.string().uuid(),
    opportunityReferenceId: nonBlankString,
    recordVersion: z.number().int().positive(),
    extractedAt: isoTimestampSchema,
  })
  .strict();

export type PromiseExtractionOutput = z.infer<typeof promiseExtractionOutputSchema>;
export type PromiseLedgerRecord = z.infer<typeof promiseLedgerRecordSchema>;

export const PROMISE_LEDGER_FIXTURES = {
  valid: {
    name: "Send revised pricing",
    externalId: "promise-001",
    workspaceId: "00000000-0000-4000-8000-000000000001",
    opportunityReferenceId: "opp-001",
    recordVersion: 1,
    extractedAt: "2026-10-05T15:00:00Z",
    maker: { role: "seller", identityRef: "seller-001" },
    action: {
      type: "send",
      description: "Send revised pricing to the buyer",
      target: "buyer-001",
    },
    dueWindow: { kind: "point", dueAt: "2026-10-07T17:00:00-06:00" },
    evidenceReferences: [
      {
        evidenceId: "event-001",
        sourceType: "communications",
        sourceRecordId: "message-001",
        locator: "communications://message/message-001",
        excerpt: "I will send revised pricing by Wednesday.",
        observedAt: "2026-10-05T14:58:00Z",
      },
    ],
    expectedFulfillmentEvent: {
      type: "crm_task_completed",
      acceptableVariants: ["email_sent", "document_delivered"],
    },
    extractionMetadata: {
      model: "promise-extractor-test",
      promptVersion: "promise-extraction.v1",
      contractVersion: "promise.v1",
    },
    confidence: 0.96,
    extractionStatus: "accepted",
  },
} as const;

