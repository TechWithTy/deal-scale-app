import type { AssuranceRole } from "src/security/rbac";

export type AssuranceQueryState = "loading" | "empty" | "error" | "success";

export type AssuranceQueryResult<T> =
  | { state: "loading" | "empty"; items: []; nextCursor: null }
  | { state: "error"; items: []; nextCursor: null; error: string }
  | { state: "success"; items: T[]; nextCursor: string | null };

export type AssuranceQueryFilters = {
  detector?: string;
  severity?: string;
  confidence?: number;
  source?: string;
  rep?: string;
  workflow?: string;
  aiInvolvement?: boolean;
  status?: string;
  date?: string;
};

export type AssuranceSort = { field: string; direction: "asc" | "desc" };
export type AssurancePage = { limit: number; cursor?: string };
export type AssuranceScope = { actorWorkspaceId: string; role: AssuranceRole };

export type AssuranceQuery = {
  filters?: AssuranceQueryFilters;
  sort?: AssuranceSort;
  page?: AssurancePage;
  state?: "loading" | "error";
  error?: string;
};
