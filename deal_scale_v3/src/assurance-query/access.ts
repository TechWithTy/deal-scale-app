import type { AssuranceObjectName } from "src/assurance/identifiers";
import { canAccessWorkspaceRecord } from "src/security/rbac";

import type { AssuranceQuery, AssuranceQueryResult, AssuranceScope } from "./contracts";

export const scopeReadableRecords = <T extends { workspaceId: string }>(
  records: readonly T[],
  scope: AssuranceScope,
  objectName: AssuranceObjectName,
): T[] => {
  if (!scope.actorWorkspaceId.trim()) return [];
  return records.filter((record) =>
    canAccessWorkspaceRecord({
      actorWorkspaceId: scope.actorWorkspaceId,
      recordWorkspaceId: record.workspaceId,
      role: scope.role,
      objectName,
    }),
  );
};

const compareValues = (left: unknown, right: unknown): number => {
  if (left == null) return right == null ? 0 : 1;
  if (right == null) return -1;
  const first = left instanceof Date ? left.getTime() : left;
  const second = right instanceof Date ? right.getTime() : right;
  if (first === second) return 0;
  if (typeof first === "number" && typeof second === "number") return first - second;
  const firstText = String(first);
  const secondText = String(second);
  return firstText < secondText ? -1 : firstText > secondText ? 1 : 0;
};

export const paginateAndSort = <T extends object>(
  records: readonly T[],
  query: AssuranceQuery,
): AssuranceQueryResult<T> => {
  if (query.state === "loading") return { state: "loading", items: [], nextCursor: null };
  if (query.state === "error") {
    return { state: "error", items: [], nextCursor: null, error: query.error ?? "Query failed" };
  }

  const { page, sort } = query;
  const cursor = page?.cursor ?? "0";
  const offset = Number(cursor);
  if (!/^(0|[1-9]\d*)$/.test(cursor) || !Number.isSafeInteger(offset) || offset > records.length) {
    return { state: "error", items: [], nextCursor: null, error: "Invalid cursor" };
  }
  if (page && (!Number.isSafeInteger(page.limit) || page.limit < 1)) {
    return { state: "error", items: [], nextCursor: null, error: "Invalid page limit" };
  }

  const ordered = records.map((record, index) => ({ record, index }));
  if (sort) {
    ordered.sort((left, right) => {
      const first = (left.record as Record<string, unknown>)[sort.field];
      const second = (right.record as Record<string, unknown>)[sort.field];
      const difference = compareValues(first, second);
      if (difference) return sort.direction === "asc" ? difference : -difference;
      const leftId = (left.record as { id?: string }).id;
      const rightId = (right.record as { id?: string }).id;
      return leftId && rightId ? compareValues(leftId, rightId) : left.index - right.index;
    });
  }

  const end = page ? Math.min(offset + page.limit, ordered.length) : ordered.length;
  const items = ordered.slice(offset, end).map(({ record }) => record);
  if (!items.length) return { state: "empty", items: [], nextCursor: null };
  return { state: "success", items, nextCursor: end < ordered.length ? String(end) : null };
};
