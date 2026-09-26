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
    expect(paginateAndSort(records, { state: "error", error: "Source unavailable" })).toEqual({
      state: "error", items: [], nextCursor: null, error: "Source unavailable",
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
