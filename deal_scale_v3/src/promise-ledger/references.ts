import { createSourceIdentityKey } from "./identity";
import type { PromiseEvidence } from "./extractor";

const MAX_EVIDENCE_EXCERPT_LENGTH = 4_000;
const EVIDENCE_CONTEXT_LENGTH = 2_000;

function excerptForCandidate(evidence: PromiseEvidence, candidate: unknown): string {
  const action = (candidate as { action?: { description?: string } }).action?.description;
  const content = evidence.content;
  const matchIndex = action ? content.toLocaleLowerCase().indexOf(action.toLocaleLowerCase()) : -1;
  const start = matchIndex < 0 ? 0 : Math.max(0, matchIndex - EVIDENCE_CONTEXT_LENGTH);
  return content.slice(start, start + MAX_EVIDENCE_EXCERPT_LENGTH);
}

export function toEvidenceReference(
  evidence: PromiseEvidence,
  offset: number,
  candidate: unknown,
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
    excerpt: excerptForCandidate(evidence, candidate),
    observedAt: evidence.observedAt,
  };
}

