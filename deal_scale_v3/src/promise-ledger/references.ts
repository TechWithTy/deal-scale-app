import { MAX_SOURCE_SPAN_LENGTH } from "./extraction-candidate";
import { createSourceIdentityKey } from "./identity";
import type { PromiseEvidence } from "./extractor";

const MAX_EVIDENCE_EXCERPT_LENGTH = MAX_SOURCE_SPAN_LENGTH;
const EVIDENCE_CONTEXT_LENGTH = 2_000;

interface SourceSpan {
  start: number;
  end: number;
}

function excerptForSourceSpan(evidence: PromiseEvidence, sourceSpan: SourceSpan): string {
  const content = evidence.content;
  const lowerBound = Math.max(0, sourceSpan.end - MAX_EVIDENCE_EXCERPT_LENGTH);
  const upperBound = sourceSpan.start;
  const start = Math.max(
    lowerBound,
    Math.min(sourceSpan.start - EVIDENCE_CONTEXT_LENGTH, upperBound),
  );
  return content.slice(start, start + MAX_EVIDENCE_EXCERPT_LENGTH);
}

export function toEvidenceReference(
  evidence: PromiseEvidence,
  offset: number,
  sourceSpan: SourceSpan,
) {
  return {
    evidenceId: `${createSourceIdentityKey({
      workspaceId: evidence.workspaceId,
      connectionId: evidence.connectionId,
      provider: evidence.provider,
      sourceRecordId: evidence.sourceRecordId,
    })}:offset-${offset}`,
    sourceType: evidence.sourceType,
    sourceRecordId: evidence.sourceRecordId,
    locator: `${evidence.locator}${evidence.locator.includes("?") ? "&" : "?"}chunkOffset=${offset}`,
    excerpt: excerptForSourceSpan(evidence, sourceSpan),
    observedAt: evidence.observedAt,
  };
}

