export const MAX_PROMPT_CONTENT_LENGTH = 12_000;
export const MAX_PROMPT_LENGTH = 16_000;

const MAX_PROMPT_SOURCE_RECORD_ID_LENGTH = 512;
const MAX_PROMPT_MAKER_ID_LENGTH = 512;
const MAX_PROMPT_TIMEZONE_LENGTH = 128;

export interface PromisePromptEvidence {
  sourceType: "crm" | "communications";
  sourceRecordId: string;
  maker: { role: string; identityRef: string };
  observedAt: string;
  timezone: string;
  content: string;
}

export function buildPromiseExtractionPrompt(evidence: PromisePromptEvidence): string {
  const boundedSourceRecordId = evidence.sourceRecordId.slice(0, MAX_PROMPT_SOURCE_RECORD_ID_LENGTH);
  const boundedMakerIdentity = evidence.maker.identityRef.slice(0, MAX_PROMPT_MAKER_ID_LENGTH);
  const boundedTimezone = evidence.timezone.slice(0, MAX_PROMPT_TIMEZONE_LENGTH);
  const prefix = [
    "Identify only explicit, time-bound commitments in the evidence.",
    "Return kind=non_promise when no commitment is present; never decide fulfillment.",
    "For each promise, return sourceSpan with zero-based, end-exclusive offsets covering the exact source commitment.",
    `Evidence source: ${evidence.sourceType}/${boundedSourceRecordId}`,
    `Evidence maker: ${evidence.maker.role}/${boundedMakerIdentity}`,
    `Evidence observed at: ${evidence.observedAt}`,
    `Evidence timezone: ${boundedTimezone}`,
    "Evidence content:\n",
  ].join("\n\n");
  const contentLength = Math.max(
    0,
    Math.min(MAX_PROMPT_CONTENT_LENGTH, MAX_PROMPT_LENGTH - prefix.length),
  );
  return `${prefix}${evidence.content.slice(0, contentLength)}`;
}

