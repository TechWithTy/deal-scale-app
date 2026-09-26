# Assurance query consumer boundary

Import adapters and types from `src/assurance-query`. The input to each adapter is a collection of canonical, parsed Twenty-backed records from `src/assurance/schema.ts`, an `AssuranceScope` containing the actor's workspace ID and role, and an optional query. This layer does not fetch or persist records. Callers must obtain the canonical collection through their authorized Twenty path; the adapters then apply workspace and object-specific read permission to each record before filtering, enrichment, pagination, or projection.

The output is `AssuranceQueryResult<ViewModel>`. View models retain the existing public fields and provenance semantics while omitting workspace IDs, external IDs, provenance references, source versions, relation IDs, and credential-bearing details. `observed` and `inferred` remain distinct. A promise's fulfillment is `unassessed` without fulfillment evidence. Missing readiness coverage remains a gap, not a confirmed failure; only an observed manager confirmation is `confirmed`.

## Query behavior

- String filters (`detector`, `severity`, `source`, `rep`, `workflow`, `status`) trim and compare without case sensitivity. Empty strings are ignored. `confidence` is a minimum inclusive score from 0 to 1. `aiInvolvement` matches the explicit boolean, including `false`. `date` is an exact UTC `YYYY-MM-DD` day, using canonical `observedAt` by default and readiness `asOf` for scorecards.
- The canonical record supplies detector type, confidence, source connection ID, seller display name, case status, policy status, and observation date when present. Severity, workflow, AI involvement, and other joined labels require `filterValues`. Its callback runs only on records readable within the given workspace and object permission. It may supply filter metadata from already authorized canonical relations; canonical fields take precedence. A filter without a corresponding value produces an empty result, never a guessed match.
- Filters compose with AND. Filtering precedes sorting and offset pagination. Sort fields refer to canonical record fields; sorting requires a unique `externalId` or `id` for a stable tie break. Cursors are zero-based offsets into the filtered result. The input array is not mutated.
- Results use `loading`, `empty`, `error`, or `success`. Loading and source errors short-circuit without invoking enrichment. Empty means no readable matching page items. Invalid dates, confidence, page limits, cursors, and sort fields return an explicit error result. A missing readiness workspace scope is an error.

```ts
import { adaptDetectorCandidates } from "src/assurance-query";

// candidates are canonical detectorCandidateSchema records fetched for this actor.
const result = adaptDetectorCandidates(candidates, {
  actorWorkspaceId: actor.workspaceId,
  role: actor.assuranceRole,
}, {
  filters: { detector: "broken_commitment", confidence: 0.8, date: "2026-09-24" },
  sort: { field: "observedAt", direction: "desc" },
  page: { limit: 20 },
});

if (result.state === "success") renderCandidates(result.items, result.nextCursor);
else if (result.state === "empty") renderNoMatches();
else if (result.state === "loading") renderLoading();
else renderError(result.error);
```

For joined filters, pass `filterValues: (record) => ({ severity: ... })` in the query, resolving only from canonical records the actor may read. This callback supplies matching metadata; the adapter does not include that metadata in the returned view model.
