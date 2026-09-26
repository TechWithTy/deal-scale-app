# DS3-S5.02 Shared Assurance Query and View-Model Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one typed, workspace- and role-scoped query/view-model boundary for Stitch surfaces and evidence-grounded AI consumers without adding persistence or a duplicate table framework.

**Architecture:** Build pure adapters over the canonical Twenty-backed assurance records already defined in `src/assurance/schema.ts`. A shared query contract owns filters, sorting, pagination, loading/empty/error states, provenance semantics, and redaction; domain adapters map cases, detectors, evidence, seller journeys, promises, policies, outcomes, and readiness into stable view models.

**Tech Stack:** TypeScript, Zod, Vitest, existing `RBAC_MATRIX`/`canAccessWorkspaceRecord`, canonical assurance schemas and Promise Ledger contracts.

**Spec:** Notion task DS3-S5.02 — Shared Twenty-backed assurance query and view-model layer.

## Global Constraints

- Reuse canonical Twenty-backed assurance objects and do not create duplicate persistence or table/query frameworks.
- Enforce workspace and object-specific RBAC before data reaches page or AI view models.
- Preserve observed, inferred, expected, missing, and confirmed distinctions; absent evidence must not become confirmed failure.
- Keep application source files under 250 lines where practical and use TypeScript with the repository's existing formatting/lint conventions.
- Preserve the dirty user checkout; stage only files belonging to this S5.02 branch.
- Use valid UUID v4 identifiers only when introducing owned Twenty entities; this layer introduces no entities.

## Review Focus

- Cross-workspace records never appear in a result, including when the caller has a readable permission for another object.
- Evidence with `inferred` provenance is not exposed as observed or confirmed.
- Empty collections, invalid cursors, and missing readiness scope return explicit states instead of throwing or fabricating data.
- Pagination and sorting are deterministic and do not mutate caller-owned arrays.
- Redacted view models omit workspace, external, provenance-reference, and credential-bearing internals unless the contract explicitly names the field.

### Task 1: Shared Query State and Access Contract

**Files:**
- Create: `deal_scale_v3/src/assurance-query/contracts.ts`
- Create: `deal_scale_v3/src/assurance-query/access.ts`
- Test: `deal_scale_v3/tests/assurance-query-contracts.test.ts`

**Interfaces:**
- Produce `AssuranceQueryState`, `AssuranceQueryResult<T>`, `AssuranceQueryFilters`, `AssuranceSort`, `AssurancePage`, and `AssuranceScope`.
- Produce `scopeReadableRecords(records, scope, objectName)` and `paginateAndSort(records, query)`.

- [ ] Write failing tests for explicit loading/empty/error/success states, object-specific workspace access, deterministic sort, invalid cursor handling, and non-mutating pagination.
- [ ] Run `yarn test:unit tests/assurance-query-contracts.test.ts` and confirm the new exports fail because they do not exist.
- [ ] Implement the smallest contracts and pure helpers in the two new source files.
- [ ] Re-run the focused tests and then the repository unit suite.
- [ ] Commit `feat(assurance): add shared query contracts`.

### Task 2: Typed Domain View Models

**Files:**
- Create: `deal_scale_v3/src/assurance-query/view-models.ts`
- Create: `deal_scale_v3/src/assurance-query/adapters.ts`
- Test: `deal_scale_v3/tests/assurance-query-adapters.test.ts`

**Interfaces:**
- Produce typed redacted view-model adapters for `assuranceCase`, `detectorCandidate`, `evidenceReference`, `sellerIdentity`, `opportunityReference`, `event`, `promise`, `conformancePolicy`, `managerDisposition`, `outcome`, and readiness coverage.
- Every adapter accepts canonical records plus an `AssuranceScope` and returns `AssuranceQueryResult<ViewModel>`.

- [ ] Write failing adapter tests covering all required domains, redaction, observed/inferred/missing/confirmed states, and cross-workspace denial.
- [ ] Run the focused adapter tests and confirm the expected missing exports/types fail.
- [ ] Implement adapters over Zod-inferred canonical types; do not add database calls or duplicate storage.
- [ ] Re-run focused tests and typecheck.
- [ ] Commit `feat(assurance): add scoped assurance view-model adapters`.

### Task 3: Shared Filters and Consumer Contract

**Files:**
- Modify: `deal_scale_v3/src/assurance-query/contracts.ts`
- Modify: `deal_scale_v3/src/assurance-query/adapters.ts`
- Create: `deal_scale_v3/src/assurance-query/index.ts`
- Test: `deal_scale_v3/tests/assurance-query-consumer-contract.test.ts`
- Create: `deal_scale_v3/docs/assurance-query-view-models.md`

- [ ] Write failing tests for detector, severity, confidence, source, rep, workflow, AI involvement, status, date, and pagination filters plus loading/empty/error normalization.
- [ ] Run the focused consumer tests and confirm the filter API is absent or incomplete.
- [ ] Implement composable filter normalization and export the public query boundary from `index.ts`.
- [ ] Document the canonical input/output boundary, scope requirements, state semantics, and consumer examples.
- [ ] Re-run focused tests, typecheck, and lint.
- [ ] Commit `feat(assurance): expose shared query consumer boundary`.

### Task 4: Full Verification and Delivery

- [ ] Run the full configured unit suite with `yarn test:unit`.
- [ ] Run `yarn typecheck` and `yarn lint`.
- [ ] Review the branch diff for secrets, persistence duplication, and unrelated changes.
- [ ] Create a PR with the Notion task and Stitch project links, exact test evidence, and the known no-duplicate-persistence boundary.
- [ ] Request independent QA review before moving DS3-S5.02 to Done.

