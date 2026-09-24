import { z } from "zod";

import {
  promiseCandidateSchema,
  promiseExtractionOutputSchema,
  promiseLedgerRecordSchema,
  type PromiseLedgerRecord,
} from "./contract";
import { createPromiseExternalId, createSourceIdentityKey } from "./identity";

export const MAX_PROMPT_CONTENT_LENGTH = 12_000;
export const MAX_PROMPT_LENGTH = 16_000;
const MAX_PROMPT_SOURCE_RECORD_ID_LENGTH = 512;

const eligibleContentTypes = new Set(["message", "email", "transcript", "call"]);

const extractionResponseSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("non_promise") }).strict(),
  z.object({ kind: z.literal("promise"), candidates: z.array(z.unknown()).min(1) }).strict(),
]);

export interface PromiseEvidence {
  workspaceId: string;
  opportunityReferenceId: string;
  sourceType: "crm" | "communications";
  connectionId: string;
  provider: string;
  sourceRecordId: string;
  contentType: string;
  content: string;
  locator: string;
  observedAt: string;
}

export interface PromiseExtractionProvider {
  readonly model: string;
  readonly promptVersion: string;
  extract(input: { evidence: PromiseEvidence; prompt: string }): Promise<unknown>;
}

export interface PromiseExtractionFailure {
  workspaceId: string;
  sourceRecordId: string;
  code: "validation-error" | "provider-error";
  message: string;
  observedAt: string;
}

export interface PromiseLedgerStore {
  upsertPromise(record: PromiseLedgerRecord): Promise<void>;
  recordFailure(failure: PromiseExtractionFailure): Promise<void>;
}

export interface PromiseExtractionOptions {
  evidence: readonly PromiseEvidence[];
  provider: PromiseExtractionProvider;
  store: PromiseLedgerStore;
  now?: () => string;
}

export interface PromiseExtractionResult {
  processed: number;
  skipped: number;
  persisted: number;
  nonPromises: number;
  failed: number;
}

export function buildPromiseExtractionPrompt(evidence: PromiseEvidence): string {
  const boundedSourceRecordId = evidence.sourceRecordId.slice(0, MAX_PROMPT_SOURCE_RECORD_ID_LENGTH);
  const prefix = [
    "Identify only explicit, time-bound commitments in the evidence.",
    "Return kind=non_promise when no commitment is present; never decide fulfillment.",
    `Evidence source: ${evidence.sourceType}/${boundedSourceRecordId}`,
    "Evidence content:\n",
  ].join("\n\n");
  const contentLength = Math.max(
    0,
    Math.min(MAX_PROMPT_CONTENT_LENGTH, MAX_PROMPT_LENGTH - prefix.length),
  );
  return `${prefix}${evidence.content.slice(0, contentLength)}`;
}

function splitEvidence(evidence: PromiseEvidence): PromiseEvidence[] {
  const chunks: PromiseEvidence[] = [];
  for (let offset = 0; offset < evidence.content.length; offset += MAX_PROMPT_CONTENT_LENGTH) {
    chunks.push({
      ...evidence,
      content: evidence.content.slice(offset, offset + MAX_PROMPT_CONTENT_LENGTH),
    });
  }
  return chunks.length > 0 ? chunks : [evidence];
}

function isEligibleEvidence(evidence: PromiseEvidence): boolean {
  return (
    evidence.sourceType === "communications" &&
    evidence.content.trim().length > 0 &&
    eligibleContentTypes.has(evidence.contentType)
  );
}

function toEvidenceReference(evidence: PromiseEvidence, chunkIndex: number) {
  return {
    evidenceId: `${createSourceIdentityKey({
      workspaceId: evidence.workspaceId,
      connectionId: evidence.connectionId,
      provider: evidence.provider,
      sourceRecordId: evidence.sourceRecordId,
    })}:chunk-${chunkIndex}`,
    sourceType: evidence.sourceType,
    sourceRecordId: evidence.sourceRecordId,
    locator: evidence.locator,
    excerpt: evidence.content.slice(0, 4_000),
    observedAt: evidence.observedAt,
  };
}

function errorDetails(error: unknown): Pick<PromiseExtractionFailure, "code" | "message"> {
  return {
    code: error instanceof z.ZodError ? "validation-error" : "provider-error",
    message: error instanceof Error ? error.message : "Unknown extraction failure",
  };
}

export async function extractPromisesFromEvidence(
  options: PromiseExtractionOptions,
): Promise<PromiseExtractionResult> {
  const now = options.now ?? (() => new Date().toISOString());
  const result: PromiseExtractionResult = {
    processed: 0,
    skipped: 0,
    persisted: 0,
    nonPromises: 0,
    failed: 0,
  };

  for (const evidence of options.evidence) {
    if (!isEligibleEvidence(evidence)) {
      result.skipped += 1;
      continue;
    }

    result.processed += 1;

    const chunks = splitEvidence(evidence);
    for (const [chunkIndex, chunk] of chunks.entries()) {
      try {
        const response = extractionResponseSchema.parse(
          await options.provider.extract({
            evidence: chunk,
            prompt: buildPromiseExtractionPrompt(chunk),
          }),
        );

        if (response.kind === "non_promise") {
          result.nonPromises += 1;
          continue;
        }

        for (const [candidateIndex, rawCandidate] of response.candidates.entries()) {
          try {
            const candidate = promiseCandidateSchema.parse(rawCandidate);
            const extractionOutput = promiseExtractionOutputSchema.parse({
              ...candidate,
              evidenceReferences: [toEvidenceReference(chunk, chunkIndex)],
              extractionMetadata: {
                model: options.provider.model,
                promptVersion: options.provider.promptVersion,
                contractVersion: "promise.v1",
              },
              extractionStatus: "accepted",
            });
            const record = promiseLedgerRecordSchema.parse({
              ...extractionOutput,
              name: candidate.action.description,
              externalId: createPromiseExternalId(
                {
                  workspaceId: evidence.workspaceId,
                  connectionId: evidence.connectionId,
                  provider: evidence.provider,
                  sourceRecordId: evidence.sourceRecordId,
                },
                rawCandidate,
                chunkIndex,
              ),
              workspaceId: evidence.workspaceId,
              opportunityReferenceId: evidence.opportunityReferenceId,
              recordVersion: 1,
              extractedAt: now(),
            });

            await options.store.upsertPromise(record);
            result.persisted += 1;
          } catch (error) {
            result.failed += 1;
            await recordFailure(options.store, evidence, error, `candidate[${candidateIndex}]`);
          }
        }
      } catch (error) {
        result.failed += 1;
        await recordFailure(options.store, evidence, error, `chunk[${chunkIndex}]`);
      }
    }
  }

  return result;
}

async function recordFailure(
  store: PromiseLedgerStore,
  evidence: PromiseEvidence,
  error: unknown,
  context: string,
): Promise<void> {
  const details = errorDetails(error);
  try {
    await store.recordFailure({
      workspaceId: evidence.workspaceId,
      sourceRecordId: evidence.sourceRecordId,
      ...details,
      message: `${context}: ${details.message}`,
      observedAt: evidence.observedAt,
    });
  } catch {
    // A failure sink must not prevent later evidence from being processed.
  }
}

