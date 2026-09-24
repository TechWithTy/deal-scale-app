export const MAX_PROMPT_CONTENT_LENGTH = 12_000;
export const MAX_PROMPT_LENGTH = 16_000;

const MAX_PROMPT_SOURCE_RECORD_ID_LENGTH = 512;
const MAX_PROMPT_MAKER_ID_LENGTH = 512;

export interface PromisePromptEvidence {
  sourceType: "crm" | "communications";
  sourceRecordId: string;
  maker: { role: string; identityRef: string };
  observedAt: string;
  content: string;
}

export function buildPromiseExtractionPrompt(evidence: PromisePromptEvidence): string {
  const boundedSourceRecordId = evidence.sourceRecordId.slice(0, MAX_PROMPT_SOURCE_RECORD_ID_LENGTH);
  const boundedMakerIdentity = evidence.maker.identityRef.slice(0, MAX_PROMPT_MAKER_ID_LENGTH);
  const prefix = [
    "Identify only explicit, time-bound commitments in the evidence.",
    "Return kind=non_promise when no commitment is present; never decide fulfillment.",
    `Evidence source: ${evidence.sourceType}/${boundedSourceRecordId}`,
    `Evidence maker: ${evidence.maker.role}/${boundedMakerIdentity}`,
    `Evidence observed at: ${evidence.observedAt}`,
    "Evidence content:\n",
  ].join("\n\n");
  const contentLength = Math.max(
    0,
    Math.min(MAX_PROMPT_CONTENT_LENGTH, MAX_PROMPT_LENGTH - prefix.length),
  );
  return `${prefix}${evidence.content.slice(0, contentLength)}`;
}

