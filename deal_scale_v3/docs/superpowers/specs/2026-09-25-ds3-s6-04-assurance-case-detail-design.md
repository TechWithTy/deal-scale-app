# DS3-S6.04 Assurance Case Detail Design

## Goal

Add a Stitch-inspired, reviewer-facing Assurance Case Detail surface to the
Deal Scale Twenty app. The surface is a dedicated front component mounted by a
standalone page layout and exposes case status, detector reasoning, evidence,
traceability, and reviewer disposition affordances without exposing CRM
internals or adding persistence.

## Scope and constraints

- Use the existing assurance Zod schemas, Twenty UI primitives, feature flags,
  and RBAC matrix.
- Keep the implementation in new/owned files only. Do not modify shared
  assurance schemas, universal identifiers, promise-ledger files, or other
  Sprint 6 task files.
- Every new Twenty entity identifier is a valid UUID v4.
- No API route, Twenty client mutation, repository adapter, or invented
  persistence contract is added. Reviewer disposition changes are local UI
  state only and are labeled as unsaved.
- CRM data and CRM navigation are not rendered. The surface only shows
  assurance-owned labels plus source/provenance metadata.

## Architecture

`src/assurance-case-detail/contract.ts` owns the typed view-model helpers,
UUID-v4 identifiers, disposition gating, evidence ordering, and local-only
selection semantics. `src/assurance-case-detail/fixture.ts` contains a
schema-shaped preview model assembled from existing assurance types; it is
display data, not a persistence layer.

`src/front-components/assurance-case-detail.tsx` owns the visual surface. It
uses Twenty `Card`, `Tag`, `Status`, `Button`, `Icon`, and `Text` primitives,
with a two-column evidence/detail layout that becomes a drawer-like fixed
panel under 860px. The component renders a selected evidence item in local
state and gates disposition controls on the existing manager-disposition flag
and the existing manager write permission.

`src/page-layouts/assurance-case-detail.page-layout.ts` declares one standalone
page tab and one front-component widget. It does not create a navigation item
or alter the CRM shell.

## Surface contract

The rendered component includes these stable landmarks:

1. A case header with `Assurance case`, name, open status, inferred finding
   tag, and decision state.
2. A detector finding card with finding type, confidence, recommended action,
   and policy version.
3. An evidence timeline/list with source type, observed time, excerpt, hash,
   and clickable evidence selection.
4. A provenance card with tenant-safe source version, record version,
   provenance reference, and observation time.
5. Reviewer disposition controls showing Confirm, Needs review, and Dismiss
   when the flag and RBAC permit writes. A local selection displays an
   `Unsaved preview` notice and never calls an API.
6. A selected evidence detail panel with a close control. On narrow screens it
   is an overlay drawer with a backdrop; on wide screens it remains the right
   column.

## Testing strategy

Focused Vitest contracts run before implementation and cover UUID-v4
identifiers, standalone layout wiring, evidence ordering/selection,
provenance preservation, manager-only disposition gating, and the rendered
surface landmarks. After implementation, run the focused test, typecheck,
lint, the full Vitest suite, and a final changed-file/forbidden-file audit.
