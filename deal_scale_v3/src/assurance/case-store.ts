import type { AuditEvent, CanonicalAssuranceCase } from "src/assurance/case-engine";

export interface AssuranceCaseStore {
  upsert(assuranceCase: CanonicalAssuranceCase): CanonicalAssuranceCase;
  appendAudit(caseId: string, event: AuditEvent): CanonicalAssuranceCase;
  getByDedupeKey(dedupeKey: string): CanonicalAssuranceCase | undefined;
}

const auditNext = (event: AuditEvent) => event.next;

const mergeAuditHistory = (existing: readonly AuditEvent[], incoming: readonly AuditEvent[]) => {
  const merged = new Map(existing.map((event) => [event.id, event]));
  for (const event of incoming) merged.set(event.id, event);
  return [...merged.values()].sort(
    (left, right) => left.observedAt.getTime() - right.observedAt.getTime() || left.id.localeCompare(right.id),
  );
};

export class InMemoryAssuranceCaseStore implements AssuranceCaseStore {
  private readonly records = new Map<string, CanonicalAssuranceCase>();

  upsert(assuranceCase: CanonicalAssuranceCase): CanonicalAssuranceCase {
    const existing = this.records.get(assuranceCase.dedupeKey);
    if (!existing) {
      this.records.set(assuranceCase.dedupeKey, assuranceCase);
      return assuranceCase;
    }

    const auditHistory = mergeAuditHistory(existing.auditHistory, assuranceCase.auditHistory);
    const latest = auditHistory[auditHistory.length - 1];
    const merged = {
      ...assuranceCase,
      id: existing.id,
      caseStatus: latest ? auditNext(latest) : assuranceCase.caseStatus,
      auditHistory,
    };
    this.records.set(assuranceCase.dedupeKey, merged);
    return merged;
  }

  appendAudit(caseId: string, event: AuditEvent): CanonicalAssuranceCase {
    const entry = [...this.records.entries()].find(([, assuranceCase]) => assuranceCase.id === caseId);
    if (!entry) throw new Error(`assurance case ${caseId} was not found`);
    const [dedupeKey, current] = entry;
    if (current.auditHistory.some((existing) => existing.id === event.id)) return current;
    const previous = current.auditHistory[current.auditHistory.length - 1];
    if (event.prior !== current.caseStatus || (previous && event.observedAt < previous.observedAt)) {
      throw new Error("audit event must append from the current ordered case state");
    }

    const next = {
      ...current,
      caseStatus: event.next,
      auditHistory: [...current.auditHistory, event],
    };
    this.records.set(dedupeKey, next);
    return next;
  }

  getByDedupeKey(dedupeKey: string) {
    return this.records.get(dedupeKey);
  }
}

export const createAssuranceCaseStore = (): AssuranceCaseStore => new InMemoryAssuranceCaseStore();
