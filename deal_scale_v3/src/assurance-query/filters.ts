import type { AssuranceFilterValues, AssuranceQueryFilters } from "./contracts";

const textKeys = ["detector", "severity", "source", "rep", "workflow", "status"] as const;
const normalizeText = (value: string) => value.trim().toLowerCase();

export const normalizeAssuranceFilters = (filters: AssuranceQueryFilters = {}): AssuranceQueryFilters => {
  const normalized: AssuranceQueryFilters = {};
  for (const key of textKeys) {
    const value = filters[key];
    if (value !== undefined) {
      const text = normalizeText(value);
      if (text) normalized[key] = text;
    }
  }
  if (filters.aiInvolvement !== undefined) normalized.aiInvolvement = filters.aiInvolvement;
  if (filters.confidence !== undefined) {
    if (!Number.isFinite(filters.confidence) || filters.confidence < 0 || filters.confidence > 1) {
      throw new Error("Invalid confidence filter");
    }
    normalized.confidence = filters.confidence;
  }
  if (filters.date !== undefined) {
    const date = filters.date.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`)) ||
      new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
      throw new Error("Invalid date filter");
    }
    normalized.date = date;
  }
  return normalized;
};

export const canonicalFilterValues = (record: object): AssuranceFilterValues => {
  const fields = record as Record<string, unknown>;
  return {
    ...(typeof fields.detectorType === "string" ? { detector: fields.detectorType } : {}),
    ...(typeof fields.confidence === "number" ? { confidence: fields.confidence } : {}),
    ...(typeof fields.sourceConnectionId === "string" ? { source: fields.sourceConnectionId } : {}),
    ...(typeof fields.displayName === "string" ? { rep: fields.displayName } : {}),
    ...(typeof fields.caseStatus === "string" ? { status: fields.caseStatus } : {}),
    ...(typeof fields.policyStatus === "string" ? { status: fields.policyStatus } : {}),
    ...(fields.observedAt instanceof Date ? { date: fields.observedAt } : {}),
  };
};

export const matchesAssuranceFilters = (
  values: AssuranceFilterValues,
  filters: AssuranceQueryFilters,
): boolean => {
  for (const key of textKeys) {
    if (filters[key] !== undefined &&
      (typeof values[key] !== "string" || normalizeText(values[key]) !== filters[key])) return false;
  }
  if (filters.aiInvolvement !== undefined && values.aiInvolvement !== filters.aiInvolvement) return false;
  if (filters.confidence !== undefined &&
    (typeof values.confidence !== "number" || !Number.isFinite(values.confidence) ||
      values.confidence < 0 || values.confidence > 1 || values.confidence < filters.confidence)) return false;
  if (filters.date !== undefined) {
    const date = values.date instanceof Date ? values.date : typeof values.date === "string" ? new Date(values.date) : null;
    if (!date || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== filters.date) return false;
  }
  return true;
};

export const filterAssuranceRecords = <T>(
  records: readonly T[],
  filters: AssuranceQueryFilters | undefined,
  values: (record: T) => AssuranceFilterValues,
): T[] => {
  const normalized = normalizeAssuranceFilters(filters);
  if (!Object.keys(normalized).length) return [...records];
  return records.filter((record) => matchesAssuranceFilters(values(record), normalized));
};
