import { z } from "zod";

import { ASSURANCE_CASE_STATUS_VALUES } from "src/assurance/common-fields";
import type { AuditEvent, CanonicalAssuranceCase } from "src/assurance/case-engine";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const uuidV4 = z.string().regex(UUID_V4, "Expected a UUID v4");
const caseStatus = z.enum(ASSURANCE_CASE_STATUS_VALUES);

export type TrustedOpportunityReference = Readonly<{
  externalId: string;
  workspaceId: string;
}>;

export interface OpportunityReferenceAdapter {
  getTrustedOpportunityReference(externalId: string): TrustedOpportunityReference | undefined;
}

const trustedOpportunityReferenceSchema = z.object({
  externalId: z.string().min(1),
  workspaceId: z.string().uuid(),
});

export class InMemoryOpportunityReferenceAdapter implements OpportunityReferenceAdapter {
  private readonly references: ReadonlyMap<string, TrustedOpportunityReference>;

  constructor(references: readonly TrustedOpportunityReference[]) {
    this.references = new Map(
      references.map((reference) => {
        const parsed = trustedOpportunityReferenceSchema.parse(reference);
        return [parsed.externalId, parsed] as const;
      }),
    );
  }

  getTrustedOpportunityReference(externalId: string) {
    return this.references.get(externalId);
  }
}

export interface AssuranceCaseStore {
  upsert(assuranceCase: CanonicalAssuranceCase): CanonicalAssuranceCase;
  appendAudit(caseId: string, event: AuditEvent): CanonicalAssuranceCase;
  getByDedupeKey(dedupeKey: string): CanonicalAssuranceCase | undefined;
}

const auditEventSchema = z.object({
  id: uuidV4,
  caseId: uuidV4,
  workspaceId: z.string().uuid(),
  action: z.enum(["assembled", "transitioned"]),
  actor: z.string().min(1),
  prior: caseStatus.nullable(),
  next: caseStatus,
  observedAt: z.coerce.date(),
  actorId: z.string().min(1),
  from: caseStatus.nullable(),
  to: caseStatus,
  occurredAt: z.coerce.date(),
});

const normalizeAuditEvent = (event: AuditEvent): AuditEvent => {
  const parsed = auditEventSchema.parse(event);
  if (
    parsed.actor !== parsed.actorId ||
    parsed.prior !== parsed.from ||
    parsed.next !== parsed.to ||
    parsed.observedAt.getTime() !== parsed.occurredAt.getTime()
  ) {
    throw new Error("audit event aliases must describe the same contents");
  }
  return parsed;
};

const auditEventSignature = (event: AuditEvent) =>
  JSON.stringify({
    ...event,
    observedAt: event.observedAt.toISOString(),
    occurredAt: event.occurredAt.toISOString(),
  });

const validateCase = (assuranceCase: CanonicalAssuranceCase): CanonicalAssuranceCase => {
  const id = uuidV4.parse(assuranceCase.id);
  const workspaceId = z.string().uuid().parse(assuranceCase.workspaceId);
  if (assuranceCase.externalId !== assuranceCase.dedupeKey) {
    throw new Error("assurance case externalId must equal its scoped dedupeKey");
  }
  const auditHistory = assuranceCase.auditHistory.map(normalizeAuditEvent);
  const auditIds = new Set<string>();
  for (const event of auditHistory) {
    if (auditIds.has(event.id)) throw new Error(`duplicate audit event ID ${event.id}`);
    auditIds.add(event.id);
    if (event.caseId !== id) throw new Error("audit event must belong to the assurance case");
    if (event.workspaceId !== workspaceId) throw new Error("audit event workspace must match the assurance case");
  }
  const latest = auditHistory[auditHistory.length - 1];
  if (latest && latest.next !== assuranceCase.caseStatus) {
    throw new Error("assurance case status must match its current audit event");
  }
  return { ...assuranceCase, id, workspaceId, auditHistory };
};

const mergeAuditHistory = (existing: readonly AuditEvent[], incoming: readonly AuditEvent[]) => {
  const merged = [...existing];
  const positions = new Map(existing.map((event, index) => [event.id, index]));
  for (const event of incoming) {
    const position = positions.get(event.id);
    if (position === undefined) {
      positions.set(event.id, merged.length);
      merged.push(event);
      continue;
    }
    if (auditEventSignature(merged[position]) !== auditEventSignature(event)) {
      throw new Error(`audit event ${event.id} has different contents`);
    }
  }
  return merged;
};

export class InMemoryAssuranceCaseStore implements AssuranceCaseStore {
  private readonly records = new Map<string, CanonicalAssuranceCase>();

  upsert(assuranceCase: CanonicalAssuranceCase): CanonicalAssuranceCase {
    const normalized = validateCase(assuranceCase);
    const existing = this.records.get(normalized.dedupeKey);
    if (!existing) {
      this.records.set(normalized.dedupeKey, normalized);
      return normalized;
    }
    if (normalized.id !== existing.id) {
      throw new Error("assurance case identity does not match the existing scoped record");
    }

    const auditHistory = mergeAuditHistory(existing.auditHistory, normalized.auditHistory);
    const appendedEvents = auditHistory.slice(existing.auditHistory.length);
    const merged = {
      ...normalized,
      id: existing.id,
      caseStatus: appendedEvents.length > 0 ? appendedEvents[appendedEvents.length - 1].next : existing.caseStatus,
      auditHistory,
    };
    this.records.set(normalized.dedupeKey, merged);
    return merged;
  }

  appendAudit(caseId: string, event: AuditEvent): CanonicalAssuranceCase {
    const normalizedEvent = normalizeAuditEvent(event);
    const entry = [...this.records.entries()].find(([, assuranceCase]) => assuranceCase.id === caseId);
    if (!entry) throw new Error(`assurance case ${caseId} was not found`);
    const [dedupeKey, current] = entry;
    const duplicate = current.auditHistory.find((existing) => existing.id === normalizedEvent.id);
    if (duplicate) {
      if (auditEventSignature(duplicate) !== auditEventSignature(normalizedEvent)) {
        throw new Error(`audit event ${normalizedEvent.id} has different contents`);
      }
      return current;
    }
    if (normalizedEvent.caseId !== current.id) {
      throw new Error("audit event must belong to the assurance case");
    }
    if (normalizedEvent.workspaceId !== current.workspaceId) {
      throw new Error("audit event workspace must match the assurance case");
    }
    if (normalizedEvent.prior !== current.caseStatus) {
      throw new Error("audit event must append from the current ordered case state");
    }

    const next = {
      ...current,
      caseStatus: normalizedEvent.next,
      auditHistory: [...current.auditHistory, normalizedEvent],
    };
    this.records.set(dedupeKey, next);
    return next;
  }

  getByDedupeKey(dedupeKey: string) {
    return this.records.get(dedupeKey);
  }
}

export const createAssuranceCaseStore = (): AssuranceCaseStore => new InMemoryAssuranceCaseStore();

export const createOpportunityReferenceAdapter = (
  references: readonly TrustedOpportunityReference[],
): OpportunityReferenceAdapter => new InMemoryOpportunityReferenceAdapter(references);
