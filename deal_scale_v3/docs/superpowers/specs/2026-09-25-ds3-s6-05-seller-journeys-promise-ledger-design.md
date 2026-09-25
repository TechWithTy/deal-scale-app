# DS3-S6.05 Seller Journeys and Promise Ledger Design

## Goal

Provide seller-facing Twenty surfaces that make journey progression and commercial promises reviewable without exposing CRM internals or introducing a second extraction or persistence path.

## Scope

- Add a contract-backed Seller Journeys surface.
- Add a contract-backed Promise Ledger surface.
- Register both as dedicated Twenty front components.
- Mount each component in a standalone page layout.
- Point the existing Seller Journeys and Promise Ledger navigation entries at the dedicated layouts.
- Add pure view-model derivation and focused Vitest coverage.

The implementation must only add task-owned files plus the two existing navigation files. It must not modify assurance schemas, universal identifiers, object definitions, or unrelated Sprint 6 work.

## Data boundary

The existing `src/promise-ledger/contract.ts` is the source of truth for promise records. The existing Zod schemas in `src/assurance/schema.ts` are the source of truth for seller identities, opportunities, events, detector candidates, assurance cases, and evidence references. Owned view-model helpers consume these contract-shaped records and only project them into display state.

No extractor, persistence layer, database mutation, CRM adapter, or duplicate schema is added. The registered page components render a truthful empty state when a live snapshot is not supplied by a future host/read-model integration. Test fixtures may use the existing contract fixtures and minimal schema-shaped records.

## Surface behavior

### Seller Journeys

Show the seller and opportunity context, an ordered stage progression rail, milestone cards derived from observed events, linked promises, evidence links, and an assurance-impact summary. Unresolved promises and open assurance cases are promoted into an at-risk panel. Empty and incomplete data remain explicit rather than inferred as healthy.

### Promise Ledger

Show each promise's action, maker, due point/range, extraction status, confidence, evidence references, expected fulfillment event, and assurance impact. Status is derived at a caller-provided `asOf` time:

- `fulfilled` only when an observed seller event matches an acceptable fulfillment variant.
- `at-risk` when the due window has ended without an observed fulfillment event, or when the extraction status is `candidate`/`rejected` and the record needs review.
- `due-soon` when the due window starts within the review horizon.
- `open` otherwise.

The model preserves due-window kind and source locators so the UI can link to evidence without inventing URLs.

## UI direction

Use a Stitch-inspired, responsive composition: generous spacing, a clear horizontal/vertical progression rail, modular cards, compact status pills, and a high-contrast risk summary. Inline styles and existing Twenty UI primitives are preferred. Components must not introduce fixed-height scrolling canvases.

## Identifiers and integration

All new front-component, page-layout, tab, widget, and navigation identifiers are stable UUID v4 values. The existing navigation labels remain unchanged, but their targets become page layouts so the seller-facing surfaces are the entry points and raw CRM objects remain behind the boundary.

## Verification

Run focused Vitest tests for derivation and manifest contracts first, then the full unit suite, `yarn typecheck`, `yarn lint`, and `yarn twenty build` where the local Twenty environment permits. Report pre-existing failures separately from task failures.
