import { describe, expect, expectTypeOf, it } from "vitest";

import type {
  AssurancePage,
  AssuranceQueryFilters,
  AssuranceQueryResult,
  AssuranceQueryState,
  AssuranceScope,
  AssuranceSort,
} from "../src/assurance-query/contracts";
import { paginateAndSort, scopeReadableRecords } from "../src/assurance-query/access";

const scope: AssuranceScope = { actorWorkspaceId: "workspace-a", role: "reviewer" };

const records = [
  { id: "case-b", workspaceId: "workspace-a", score: 2, title: "Beta" },
  { id: "case-c", workspaceId: "workspace-b", score: 3, title: "Gamma" },
  { id: "case-a", workspaceId: "workspace-a", score: 2, title: "Alpha" },
] as const;

describe("shared assurance query contracts", () => {
  it("exposes distinct loading, empty, error, and success states", () => {
    expectTypeOf<AssuranceQueryState>().toEqualTypeOf<"loading" | "empty" | "error" | "success">();
    expectTypeOf<AssuranceQueryResult<(typeof records)[number]>>().toMatchTypeOf<{
      state: AssuranceQueryState;
    }>();

    expect(paginateAndSort(records, { state: "loading" })).toEqual({
      state: "loading", items: [], nextCursor: null,
    });
    expect(paginateAndSort([], {})).toEqual({ state: "empty", items: [], nextCursor: null });
    expect(paginateAndSort(records, { state: "error", error: "private://ref workspace-a token=secret" })).toEqual({
      state: "error", items: [], nextCursor: null, error: "Query failed",
    });
    expect(paginateAndSort(records, {})).toMatchObject({ state: "success", items: records });
  });

  it("types the shared filter, sort, and page inputs", () => {
    expectTypeOf<AssuranceQueryFilters["status"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<AssuranceQueryFilters["confidence"]>().toEqualTypeOf<number | undefined>();
    const sort: AssuranceSort = { field: "score", direction: "desc" };
    const page: AssurancePage = { limit: 2, cursor: "1" };

    expect(paginateAndSort(records, { sort, page })).toEqual({
      state: "success", items: [records[2], records[0]], nextCursor: null,
    });
  });

  it("enforces workspace and object-specific read permission", () => {
    expect(scopeReadableRecords(records, scope, "assuranceCase").map((item) => item.id)).toEqual([
      "case-b", "case-a",
    ]);
    expect(scopeReadableRecords(records, scope, "outcome").map((item) => item.id)).toEqual([
      "case-b", "case-a",
    ]);
    expect(scopeReadableRecords(records, { ...scope, role: "evidenceIntegration" }, "assuranceCase"))
      .toEqual([]);
    expect(scopeReadableRecords(records, { ...scope, role: "evidenceIntegration" }, "event")
      .map((item) => item.id)).toEqual(["case-b", "case-a"]);
    expect(scopeReadableRecords(
      [{ id: "invalid", workspaceId: "" }],
      { ...scope, actorWorkspaceId: "" },
      "event",
    )).toEqual([]);
  });

  it("sorts deterministically with an id tie-breaker", () => {
    const sorted = paginateAndSort(records, { sort: { field: "score", direction: "desc" } });
    expect(sorted.state).toBe("success");
    expect(sorted.items.map((item) => item.id)).toEqual(["case-c", "case-a", "case-b"]);
    expect(paginateAndSort(records, { sort: { field: "title", direction: "asc" } }).items
      .map((item) => item.id)).toEqual(["case-a", "case-b", "case-c"]);
  });

  it("keeps canonical externalId ordering stable across reordered tied pages", () => {
    const alpha = { externalId: "case-a", workspaceId: "workspace-a", score: 2 };
    const beta = { externalId: "case-b", workspaceId: "workspace-a", score: 2 };
    const gamma = { externalId: "case-c", workspaceId: "workspace-a", score: 2 };
    const query = { sort: { field: "score", direction: "asc" as const }, page: { limit: 2 } };

    for (const input of [[beta, gamma, alpha], [gamma, alpha, beta]]) {
      const first = paginateAndSort(input, query);
      const second = paginateAndSort(input, {
        ...query, page: { limit: 2, cursor: first.nextCursor ?? undefined },
      });
      expect(first.items.map((item) => item.externalId)).toEqual(["case-a", "case-b"]);
      expect(second.items.map((item) => item.externalId)).toEqual(["case-c"]);
    }
  });

  it("paginates unsorted records consistently across reordered inputs without mutating them", () => {
    const alpha = { externalId: "case-a" };
    const beta = { externalId: "case-b" };
    const gamma = { externalId: "case-c" };
    const firstInput = Object.freeze([beta, gamma, alpha]);
    const secondInput = Object.freeze([gamma, alpha, beta]);

    expect(paginateAndSort(firstInput, { page: { limit: 2 } }).items).toEqual([alpha, beta]);
    expect(paginateAndSort(secondInput, { page: { limit: 2, cursor: "2" } }).items).toEqual([gamma]);
    expect(firstInput).toEqual([beta, gamma, alpha]);
    expect(secondInput).toEqual([gamma, alpha, beta]);
  });

  it("uses id for unsorted pages when externalId is absent and rejects missing keys", () => {
    expect(paginateAndSort([{ id: "b" }, { id: "a" }], { page: { limit: 1 } }).items)
      .toEqual([{ id: "a" }]);
    expect(paginateAndSort([{ title: "private://ref" }], { page: { limit: 1 } })).toEqual({
      state: "error", items: [], nextCursor: null, error: "Missing sort key",
    });
  });

  it("rejects sorted records without a unique externalId or id", () => {
    expect(paginateAndSort([{ score: 1 }], {
      sort: { field: "score", direction: "asc" },
    })).toEqual({ state: "error", items: [], nextCursor: null, error: "Missing sort key" });
    expect(paginateAndSort([
      { externalId: "same", score: 1 }, { externalId: "same", score: 1 },
    ], { sort: { field: "score", direction: "asc" } })).toEqual({
      state: "error", items: [], nextCursor: null, error: "Duplicate sort key",
    });
  });

  it.each(["missing", "__proto__"])("rejects unknown sort field %s", (field) => {
    expect(paginateAndSort(records, { sort: { field, direction: "asc" } })).toEqual({
      state: "error", items: [], nextCursor: null, error: "Invalid sort field",
    });
  });

  it("rejects a sort field missing from any record", () => {
    expect(paginateAndSort([
      { externalId: "case-a", score: 1 },
      { externalId: "case-b" },
    ], { sort: { field: "score", direction: "asc" } })).toEqual({
      state: "error", items: [], nextCursor: null, error: "Invalid sort field",
    });
  });

  it.each(["bad", "-1", "1.5", "99", "01"])(
    "returns an explicit error for invalid cursor %s",
    (cursor) => {
      expect(paginateAndSort(records, { page: { limit: 2, cursor } })).toEqual({
        state: "error", items: [], nextCursor: null, error: "Invalid cursor",
      });
    },
  );

  it("paginates without mutating the caller's array", () => {
    const input = Object.freeze([...records]);
    const first = paginateAndSort(input, {
      sort: { field: "score", direction: "asc" }, page: { limit: 2 },
    });
    expect(first).toMatchObject({ state: "success", nextCursor: "2" });
    expect(first.items.map((item) => item.id)).toEqual(["case-a", "case-b"]);

    const second = paginateAndSort(input, {
      sort: { field: "score", direction: "asc" }, page: { limit: 2, cursor: first.nextCursor ?? undefined },
    });
    expect(second.items.map((item) => item.id)).toEqual(["case-c"]);
    expect(second.nextCursor).toBeNull();
    expect(input.map((item) => item.id)).toEqual(["case-b", "case-c", "case-a"]);
  });
});
