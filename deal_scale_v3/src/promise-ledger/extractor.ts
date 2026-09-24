import { z } from "zod";

import {
  promiseCandidateSchema,
  promiseExtractionOutputSchema,
  promiseLedgerRecordSchema,
  type PromiseLedgerRecord,
} from "./contract";
import { createPromiseExternalId } from "./identity";
import {
  assertSourceSpanWithinEvidence,
  MAX_SOURCE_SPAN_LENGTH,
  extractionCandidateSchema,
} from "./extraction-candidate";
import {
  buildPromiseExtractionPrompt,
  MAX_PROMPT_CONTENT_LENGTH,
} from "./prompt";
import { toEvidenceReference } from "./references";

export { MAX_SOURCE_SPAN_LENGTH } from "./extraction-candidate";
export { buildPromiseExtractionPrompt, MAX_PROMPT_CONTENT_LENGTH, MAX_PROMPT_LENGTH } from "./prompt";
const PROMPT_CHUNK_OVERLAP_LENGTH = MAX_SOURCE_SPAN_LENGTH;
const eligibleContentTypes = new Set(["message", "email", "transcript", "call"]);

const extractionResponseSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("non_promise") }).strict(),
  z
    .object({
      kind: z.literal("promise"),
      candidates: z.array(z.unknown()).min(1),
    })
    .strict(),
]);

export interface PromiseEvidence {
  workspaceId: string;
  opportunityReferenceId: string;
  sourceType: "crm" | "communications";
  connectionId: string;
  provider: string;
  maker: {
    role: "seller" | "buyer" | "internal" | "unknown";
    identityRef: string;
  };
  timezone: string;
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
  connectionId: string;
  provider: string;
  sourceRecordId: string;
  code: "validation-error" | "provider-error" | "persistence-error";
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

interface PromiseEvidenceChunk {
  evidence: PromiseEvidence;
  offset: number;
}

function splitEvidence(evidence: PromiseEvidence): PromiseEvidenceChunk[] {
  const chunks: PromiseEvidenceChunk[] = [];
  const step = MAX_PROMPT_CONTENT_LENGTH - PROMPT_CHUNK_OVERLAP_LENGTH;
  for (let offset = 0; offset < evidence.content.length; offset += step) {
    const end = Math.min(offset + MAX_PROMPT_CONTENT_LENGTH, evidence.content.length);
    chunks.push({
      evidence: { ...evidence, content: evidence.content.slice(offset, end) },
      offset,
    });
    if (end === evidence.content.length) break;
  }
  return chunks.length > 0 ? chunks : [{ evidence, offset: 0 }];
}

function isEligibleEvidence(evidence: PromiseEvidence): boolean {
  return (
    evidence.sourceType === "communications" &&
    evidence.content.trim().length > 0 &&
    eligibleContentTypes.has(evidence.contentType)
  );
}

function errorDetails(
  error: unknown,
  codeOverride?: PromiseExtractionFailure["code"],
): Pick<PromiseExtractionFailure, "code" | "message"> {
  return {
    code: codeOverride ?? (error instanceof z.ZodError ? "validation-error" : "provider-error"),
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
            evidence: chunk.evidence,
            prompt: buildPromiseExtractionPrompt(chunk.evidence),
          }),
        );

        if (response.kind === "non_promise") {
          result.nonPromises += 1;
          continue;
        }

        for (const [candidateIndex, rawCandidate] of response.candidates.entries()) {
          try {
            const candidateWrapper = extractionCandidateSchema.parse(rawCandidate);
            assertSourceSpanWithinEvidence(
              candidateWrapper.sourceSpan,
              chunk.evidence.content.length,
            );
            const candidate = promiseCandidateSchema.parse(candidateWrapper.candidate);
            const extractionOutput = promiseExtractionOutputSchema.parse({
              ...candidate,
              evidenceReferences: [
                toEvidenceReference(chunk.evidence, chunk.offset, candidateWrapper.sourceSpan),
              ],
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
                candidateWrapper.candidate,
              ),
              workspaceId: evidence.workspaceId,
              opportunityReferenceId: evidence.opportunityReferenceId,
              recordVersion: 1,
              extractedAt: now(),
            });

            try {
              await options.store.upsertPromise(record);
              result.persisted += 1;
            } catch (error) {
              result.failed += 1;
              await recordFailure(
                options.store,
                evidence,
                error,
                `candidate[${candidateIndex}]`,
                "persistence-error",
              );
            }
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
  codeOverride?: PromiseExtractionFailure["code"],
): Promise<void> {
  const details = errorDetails(error, codeOverride);
  try {
    await store.recordFailure({
      workspaceId: evidence.workspaceId,
      connectionId: evidence.connectionId,
      provider: evidence.provider,
      sourceRecordId: evidence.sourceRecordId,
      ...details,
      message: `${context}: ${details.message}`,
      observedAt: evidence.observedAt,
    });
  } catch {
    // A failure sink must not prevent later evidence from being processed.
  }
}

