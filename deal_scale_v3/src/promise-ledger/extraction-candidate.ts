import { z } from "zod";

const MAX_SOURCE_SPAN_LENGTH = 4_000;

export const extractionCandidateSchema = z
  .object({
    candidate: z.unknown(),
    sourceSpan: z
      .object({
        start: z.number().int().nonnegative(),
        end: z.number().int().positive(),
      })
      .strict()
      .refine((span) => span.end > span.start, {
        message: "Source span end must be greater than start",
      })
      .refine((span) => span.end - span.start <= MAX_SOURCE_SPAN_LENGTH, {
        message: "Source span must be 4,000 characters or fewer",
      }),
  })
  .strict();

export type ExtractionCandidate = z.infer<typeof extractionCandidateSchema>;

export function assertSourceSpanWithinEvidence(
  sourceSpan: ExtractionCandidate["sourceSpan"],
  contentLength: number,
): void {
  if (sourceSpan.end > contentLength) {
    throw new Error("Source span must be contained within the evidence chunk");
  }
}

