export interface PromiseSourceIdentity {
  workspaceId: string;
  connectionId: string;
  provider: string;
  sourceRecordId: string;
}

export function createSourceIdentityKey(input: PromiseSourceIdentity): string {
  return [input.workspaceId, input.connectionId, input.provider, input.sourceRecordId]
    .map(encodeURIComponent)
    .join(":");
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableSerialize(nested)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function candidateFingerprint(candidate: unknown): string {
  const promise = candidate as Record<string, unknown>;
  const stableIdentity = {
    maker: promise.maker,
    action: promise.action,
    dueWindow: promise.dueWindow,
    expectedFulfillmentEvent: promise.expectedFulfillmentEvent,
  };
  let hash = 2_166_136_261;
  for (const character of stableSerialize(stableIdentity)) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16_777_619);
  }
  return (hash >>> 0).toString(16);
}

export function createPromiseExternalId(
  source: PromiseSourceIdentity,
  candidate: unknown,
): string {
  return `promise:${createSourceIdentityKey(source)}:${candidateFingerprint(candidate)}`;
}

