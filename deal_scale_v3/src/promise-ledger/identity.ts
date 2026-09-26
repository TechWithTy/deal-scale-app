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
  const expectedFulfillmentEvent = promise.expectedFulfillmentEvent as
    | Record<string, unknown>
    | undefined;
  const dueWindow = promise.dueWindow as Record<string, unknown> | undefined;
  const canonicalDueWindow = dueWindow
    ? {
        ...dueWindow,
        ...(dueWindow.kind === "point" && typeof dueWindow.dueAt === "string"
          ? { dueAt: canonicalTimestamp(dueWindow.dueAt) }
          : {}),
        ...(dueWindow.kind === "range"
          ? {
              startsAt:
                typeof dueWindow.startsAt === "string"
                  ? canonicalTimestamp(dueWindow.startsAt)
                  : dueWindow.startsAt,
              endsAt:
                typeof dueWindow.endsAt === "string"
                  ? canonicalTimestamp(dueWindow.endsAt)
                  : dueWindow.endsAt,
            }
          : {}),
      }
    : dueWindow;
  const stableIdentity = {
    maker: promise.maker,
    action: promise.action,
    dueWindow: canonicalDueWindow,
    expectedFulfillmentEvent: expectedFulfillmentEvent
      ? {
          ...expectedFulfillmentEvent,
          acceptableVariants: Array.isArray(expectedFulfillmentEvent.acceptableVariants)
            ? [...expectedFulfillmentEvent.acceptableVariants].sort()
            : expectedFulfillmentEvent.acceptableVariants,
        }
      : expectedFulfillmentEvent,
  };
  let hash = 2_166_136_261;
  for (const character of stableSerialize(stableIdentity)) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16_777_619);
  }
  return (hash >>> 0).toString(16);
}

function canonicalTimestamp(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

export function createPromiseExternalId(
  source: PromiseSourceIdentity,
  candidate: unknown,
): string {
  return `promise:${createSourceIdentityKey(source)}:${candidateFingerprint(candidate)}`;
}
