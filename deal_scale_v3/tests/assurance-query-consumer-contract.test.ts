import { describe, expect, it } from "vitest";

import { assuranceCaseSchema, detectorCandidateSchema, sellerIdentitySchema } from "../src/assurance/schema";
import { adaptAssuranceCases, adaptDetectorCandidates, adaptReadinessCoverage, adaptSellerIdentities, normalizeAssuranceFilters, type AssuranceScope } from "../src/assurance-query";
import type { EvidenceReadinessScorecard } from "../src/evidence/readiness";

const workspaceId = "00000000-0000-4000-8000-000000000001";
const scope: AssuranceScope = { actorWorkspaceId: workspaceId, role: "reviewer" };
const base = {
  workspaceId, provenanceState: "inferred", provenanceRef: "private://ref",
  sourceVersion: "v1", recordVersion: 1, observedAt: "2026-09-24T12:00:00Z",
} as const;
const candidate = (externalId: string, detectorType: string, confidence: number, observedAt = base.observedAt) =>
  detectorCandidateSchema.parse({
    ...base, name: externalId, externalId, observedAt, detectorType, confidence,
    conformancePolicyId: "policy-1", sellerEventId: null,
  });
const first = candidate("a", "broken_commitment", 0.9);
const second = candidate("b", "sla_breach", 0.55, "2026-09-25T12:00:00Z");
const third = candidate("c", "broken_commitment", 0.7);
const records = [first, second, third];

describe("public assurance query consumer boundary", () => {
  it("normalizes optional filter text without mutating caller input", () => {
    const input = Object.freeze({ detector: " Broken_Commitment ", rep: " Jordan Lee ", confidence: 0.7 });
    expect(normalizeAssuranceFilters(input)).toEqual({ detector: "broken_commitment", rep: "jordan lee", confidence: 0.7 });
    expect(input.detector).toBe(" Broken_Commitment ");
  });

  it.each([
    [{ detector: "BROKEN_COMMITMENT" }, ["a", "c"]],
    [{ confidence: 0.7 }, ["a", "c"]],
    [{ date: "2026-09-25" }, ["b"]],
    [{ detector: "broken_commitment", confidence: 0.8 }, ["a"]],
  ] as const)("filters canonical detector records with %j", (filters, expected) => {
    expect(adaptDetectorCandidates(records, scope, { filters }).items.map((item) => item.name)).toEqual(expected);
  });

  it("composes enriched severity, source, rep, workflow, and AI filters after scope", () => {
    const lookedUp: string[] = [];
    const result = adaptDetectorCandidates(records, scope, {
      filters: {
        detector: "broken_commitment", severity: "high", source: "crm", rep: "Jordan Lee",
        workflow: "seller follow-up", aiInvolvement: true, status: "open", date: "2026-09-24",
      },
      filterValues: (record) => {
        lookedUp.push(record.externalId);
        return record.externalId === "a"
          ? { severity: "High", source: "CRM", rep: "Jordan Lee", workflow: "Seller Follow-Up", aiInvolvement: true, status: "open" }
          : { severity: "low", source: "crm", rep: "Jordan Lee", workflow: "Seller Follow-Up", aiInvolvement: false, status: "open" };
      },
    });
    expect(result.items.map((item) => item.name)).toEqual(["a"]);
    expect(lookedUp).toEqual(["a", "b", "c"]);
    expect(result.items[0]).toMatchObject({ provenanceState: "inferred", confidence: 0.9 });
    expect(JSON.stringify(result)).not.toContain("private://ref");
  });

  it("requires evidence for filters unavailable on the canonical record", () => {
    expect(adaptDetectorCandidates(records, scope, { filters: { severity: "high" } })).toEqual({
      state: "empty", items: [], nextCursor: null,
    });
    expect(adaptDetectorCandidates(records, scope, { filters: { aiInvolvement: false } }).state).toBe("empty");
  });

  it("returns a fixed public error when domain filter enrichment throws private data", () => {
    const result = adaptDetectorCandidates([first], scope, {
      filters: { severity: "high" },
      filterValues: (record) => { throw new Error(`lookup failed for ${record.provenanceRef}`); },
    });
    expect(result).toEqual({ state: "error", items: [], nextCursor: null, error: "Invalid filter" });
    expect(JSON.stringify(result)).not.toContain(first.provenanceRef);
  });

  it.each([
    [{ severity: "high" }, { severity: "high" }, { severity: "low" }],
    [{ source: "crm" }, { source: "crm" }, { source: "calendar" }],
    [{ rep: "Jordan Lee" }, { rep: "Jordan Lee" }, { rep: "Morgan Diaz" }],
    [{ workflow: "Follow-up" }, { workflow: "Follow-up" }, { workflow: "Handoff" }],
    [{ aiInvolvement: false }, { aiInvolvement: false }, { aiInvolvement: true }],
    [{ status: "open" }, { status: "open" }, { status: "closed" }],
  ] as const)("applies enriched filter %j independently", (filters, firstValues, secondValues) => {
    const result = adaptDetectorCandidates([first, second], scope, {
      filters,
      filterValues: (record) => record.externalId === "a" ? firstValues : secondValues,
    });
    expect(result.items.map((item) => item.name)).toEqual(["a"]);
  });

  it("uses canonical seller/source fields where available", () => {
    const seller = sellerIdentitySchema.parse({
      ...base, name: "Seller", externalId: "seller-a", sourceConnectionId: "crm-1",
      sellerExternalId: "private-seller-id", displayName: "Jordan Lee",
    });
    expect(adaptSellerIdentities([seller], scope, { filters: { source: "CRM-1", rep: "JORDAN LEE" } }).items[0])
      .toMatchObject({ displayName: "Jordan Lee" });
    expect(adaptSellerIdentities([seller], scope, { filters: { source: "calendar" } }).state).toBe("empty");
  });

  it("filters readiness status and date without changing missing-coverage meaning", () => {
    const scorecard: EvidenceReadinessScorecard = {
      tenantId: workspaceId, asOf: "2026-09-24T12:00:00Z", overallScore: 0,
      overallStatus: "insufficient_evidence", connectedEvidenceTypes: [], warnings: [], sources: [], detectors: [],
    };
    expect(adaptReadinessCoverage([scorecard], scope, { filters: { status: "ready" } }).state).toBe("empty");
    expect(adaptReadinessCoverage([scorecard], scope, { filters: { date: "2026-09-25" } }).state).toBe("empty");
    expect(adaptReadinessCoverage([scorecard], scope, { filters: { status: "INSUFFICIENT_EVIDENCE", date: "2026-09-24" } }).items[0])
      .toMatchObject({ overallStatus: "insufficient_evidence", detectors: [], coverageGaps: [] });
  });

  it("returns a fixed public error when readiness filter enrichment throws private data", () => {
    const scorecard: EvidenceReadinessScorecard = {
      tenantId: workspaceId, asOf: "2026-09-24T12:00:00Z", overallScore: 0,
      overallStatus: "insufficient_evidence", connectedEvidenceTypes: [], warnings: [], sources: [], detectors: [],
    };
    const result = adaptReadinessCoverage([scorecard], scope, {
      filters: { severity: "high" },
      filterValues: (record) => { throw new Error(`lookup failed for ${record.tenantId}`); },
    });
    expect(result).toEqual({ state: "error", items: [], nextCursor: null, error: "Invalid filter" });
    expect(JSON.stringify(result)).not.toContain(workspaceId);
  });

  it.each(["provenanceRef", "sourceVersion", "externalId"])("rejects private domain sort field %s", (field) => {
    const result = adaptDetectorCandidates([first, { ...second, provenanceRef: "private://other" }], scope, {
      sort: { field, direction: "asc" }, page: { limit: 1 },
    });
    expect(result).toEqual({ state: "error", items: [], nextCursor: null, error: "Invalid sort field" });
    expect(JSON.stringify(result)).not.toMatch(/private:\/\/|sourceVersion|externalId/);
  });

  it("rejects private readiness sort fields", () => {
    const scorecard: EvidenceReadinessScorecard = {
      tenantId: workspaceId, asOf: "2026-09-24T12:00:00Z", overallScore: 0,
      overallStatus: "insufficient_evidence", connectedEvidenceTypes: [], warnings: [], sources: [], detectors: [],
    };
    expect(adaptReadinessCoverage([scorecard], scope, { sort: { field: "tenantId", direction: "asc" } }))
      .toEqual({ state: "error", items: [], nextCursor: null, error: "Invalid sort field" });
  });

  it("checks object RBAC and workspace before enrichment or projection", () => {
    const seen: string[] = [];
    const foreign = { ...first, workspaceId: "00000000-0000-4000-8000-000000000002" };
    const query = { filters: { severity: "high" }, filterValues: (record: typeof first) => {
      seen.push(record.externalId);
      return { severity: "high" };
    } };
    expect(adaptDetectorCandidates([foreign, first], scope, query).items).toHaveLength(1);
    expect(seen).toEqual(["a"]);
    expect(adaptDetectorCandidates([first], { ...scope, role: "evidenceIntegration" }, query).state).toBe("empty");
    expect(seen).toEqual(["a"]);
  });

  it("filters case status and preserves explicit result states", () => {
    const caseRecord = assuranceCaseSchema.parse({
      ...base, name: "Case", externalId: "case-1", opportunityReferenceId: "opp-1",
      detectorCandidateId: "candidate-1", caseStatus: "open",
    });
    expect(adaptAssuranceCases([caseRecord], scope, { filters: { status: "OPEN" } }).items[0]).toMatchObject({ caseStatus: "open" });
    expect(adaptAssuranceCases([caseRecord], scope, { filters: { status: "closed" } }).state).toBe("empty");
    expect(adaptAssuranceCases([caseRecord], scope, { state: "loading" })).toEqual({ state: "loading", items: [], nextCursor: null });
    expect(adaptAssuranceCases([caseRecord], scope, { state: "error", error: "Twenty unavailable" })).toEqual({
      state: "error", items: [], nextCursor: null, error: "Twenty unavailable",
    });
  });

  it("paginates filtered canonical records with deterministic sort and explicit invalid input", () => {
    const query = { filters: { detector: "broken_commitment" }, sort: { field: "name", direction: "desc" as const }, page: { limit: 1 } };
    const firstPage = adaptDetectorCandidates(Object.freeze([...records]), scope, query);
    expect(firstPage.items.map((item) => item.name)).toEqual(["c"]);
    expect(firstPage.nextCursor).toBe("1");
    expect(adaptDetectorCandidates(records, scope, { ...query, page: { limit: 1, cursor: "1" } }).items.map((item) => item.name)).toEqual(["a"]);
    expect(adaptDetectorCandidates(records, scope, { ...query, page: { limit: 1, cursor: "9" } }).state).toBe("error");
    expect(adaptDetectorCandidates(records, scope, { filters: { date: "not-a-date" } }).state).toBe("error");
    expect(adaptDetectorCandidates(records, scope, { filters: { confidence: 1.1 } }).state).toBe("error");
    expect(records.map((record) => record.externalId)).toEqual(["a", "b", "c"]);
  });
});
