# DS3-S6.05 Seller Journeys and Promise Ledger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two dedicated Twenty seller-facing surfaces that project existing promise-ledger and assurance contracts into responsive progression, milestone, due-window, evidence, detector-impact, unresolved, and at-risk views.

**Architecture:** Pure projection helpers in owned surface modules receive contract-shaped records and an explicit `asOf` time. Registered front components are presentational and render empty state when no live snapshot is supplied; page layouts provide dedicated entry points, and existing navigation targets those layouts instead of raw CRM objects.

**Tech Stack:** TypeScript, React, Twenty SDK `defineFrontComponent`/`definePageLayout`, existing Zod contracts, Vitest, Yarn.

**Spec:** `docs/superpowers/specs/2026-09-25-ds3-s6-05-seller-journeys-promise-ledger-design.md`

## Global Constraints

- Only add task-owned files and modify the existing Seller Journeys and Promise Ledger navigation files if needed.
- Do not modify shared assurance schema, universal-identifiers, object definitions, or unrelated Sprint 6 files.
- Consume `PromiseLedgerRecord` and Zod-inferred assurance records; do not duplicate extraction logic or add persistence.
- Use only valid UUID v4 identifiers for new Twenty entities.
- Keep application source files under 250 lines where practical and avoid fixed-height scrolling canvases.
- Use double quotes in new TypeScript and keep all displayed CRM details behind contract-derived labels.

## Review Focus

- A point due window and a range due window must preserve their original shape and display accurately; covered by Promise Ledger model tests.
- A promise must not become fulfilled from promise evidence alone; only an observed acceptable fulfillment event can do that; covered by Promise Ledger model tests.
- Candidate/rejected extraction and overdue accepted promises must surface as at-risk; covered by model tests.
- Events must remain chronological and open assurance cases must be promoted into journey risk; covered by Seller Journey model tests.
- New component/layout/navigation identifiers and page targets must be UUID v4 and internally connected; covered by manifest tests.

### Task 1: Contract-driven surface model tests

**Files:**
- Create: `tests/seller-journeys-surface-model.test.ts`
- Create: `tests/promise-ledger-surface-model.test.ts`

**Interfaces:**
- Tests will import `buildPromiseLedgerItem`, `buildPromiseLedgerModel`, and `buildSellerJourneyModel` from the new owned surface modules.
- Tests use `PROMISE_LEDGER_FIXTURES.valid` and minimal schema-shaped records with dates as required by the existing Zod schemas.

- [ ] **Step 1: Write the failing tests**

Assert that an accepted promise with a matching acceptable fulfillment event is `fulfilled`, a future point/range window is `due-soon`/`open`, an overdue window is `at-risk`, candidate extraction is `at-risk`, evidence locators are preserved, chronological events become ordered milestones, and open assurance cases increase the journey risk count.

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `yarn test:unit tests/promise-ledger-surface-model.test.ts tests/seller-journeys-surface-model.test.ts`

Expected: FAIL because the owned surface modules do not exist yet.

### Task 2: Implement pure surface projections

**Files:**
- Create: `src/promise-ledger/surface-model.ts`
- Create: `src/seller-journeys/surface-model.ts`

**Interfaces:**
- `buildPromiseLedgerItem(record: PromiseLedgerRecord, events: AssuranceEvent[], asOf: Date): PromiseLedgerItem`
- `buildPromiseLedgerModel(records: PromiseLedgerRecord[], events: AssuranceEvent[], assuranceCases: AssuranceCase[], asOf: Date): PromiseLedgerModel`
- `buildSellerJourneyModel(input: SellerJourneyInput, asOf: Date): SellerJourneyModel`

- [ ] **Step 1: Implement Promise Ledger status derivation**

Match `event.eventType` against `record.expectedFulfillmentEvent.acceptableVariants` and require `event.occurredAt <= asOf` before returning `fulfilled`. Otherwise prioritize review-required extraction, overdue due windows, due-soon windows within 72 hours, then `open`. Preserve every evidence `locator` and both point/range due-window fields.

- [ ] **Step 2: Implement Seller Journey projection**

Sort observed events by `occurredAt`, expose the opportunity stage as the current stage, map events to milestones, group promises through the Promise Ledger model, and associate assurance cases by `opportunityReferenceId`. Return explicit counts for unresolved promises, at-risk promises, open cases, and the highest linked detector confidence.

- [ ] **Step 3: Run the focused tests to verify they pass**

Run: `yarn test:unit tests/promise-ledger-surface-model.test.ts tests/seller-journeys-surface-model.test.ts`

Expected: PASS with all status, ordering, evidence, and risk assertions green.

### Task 3: Add dedicated front components and shared UI primitives

**Files:**
- Create: `src/front-components/seller-journeys.tsx`
- Create: `src/front-components/promise-ledger.tsx`
- Create: `src/front-components/surface-primitives.tsx`
- Create: `src/seller-journeys/identifiers.ts`

**Interfaces:**
- Export presentational `SellerJourneysSurface` and `PromiseLedgerSurface` components accepting their respective model types.
- Register default wrappers with `defineFrontComponent` using the stable IDs from `src/seller-journeys/identifiers.ts` and an empty contract-backed model.

- [ ] **Step 1: Add the failing manifest/render contract test**

Extend the new manifest test to import the registered component configs and assert names, descriptions, UUID v4 identifiers, responsive surface copy, and an explicit empty-state message.

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/seller-journey-manifest.test.ts`

Expected: FAIL because the front components and identifiers do not exist yet.

- [ ] **Step 3: Implement the minimum responsive surfaces**

Use inline styles and compact primitives for title/metadata, status pills, progression rail, milestone cards, promise cards, evidence links, and risk summary. Avoid data-fetching, mutation, extraction, and CRM object internals. When no snapshot is supplied, render a truthful “No contract snapshot available” state while retaining section headings for the future read-model integration.

- [ ] **Step 4: Run the manifest/render contract test**

Run: `yarn test:unit tests/seller-journey-manifest.test.ts`

Expected: PASS.

### Task 4: Wire page layouts and navigation

**Files:**
- Create: `src/page-layouts/seller-journeys.page-layout.ts`
- Create: `src/page-layouts/promise-ledger.page-layout.ts`
- Modify: `src/navigation-menu-items/seller-journeys.navigation-menu-item.ts`
- Modify: `src/navigation-menu-items/promise-ledger.navigation-menu-item.ts`
- Modify: `tests/seller-journey-manifest.test.ts`

**Interfaces:**
- Seller Journeys layout ID `a1c3e5f7-9b2d-4d6f-8a0c-1e3f5b7d9c24`, tab ID `b2d4f6a8-0c1e-4f7b-9d3a-5c7e1f2b4d68`, widget ID `c3e5a7b9-1d2f-4a8c-b0e1-6f3d5b7a9c24`.
- Promise Ledger layout ID `e5a7c9b1-3d2f-4e8a-b0c1-6f5d7b9a1c24`, tab ID `f6b8d0a2-4e3c-4f9b-8d1a-5c7e9b2d3a68`, widget ID `a7c9e1b3-5d4f-4a8c-b0e2-6f8d1b3c5a79`.
- Seller Journeys component ID `f7d4f2c8-3b6f-4a91-9c2d-7e5b1a0c8d42`; Promise Ledger component ID `d4f6a8b0-2e1c-4b7d-9f3a-5c1e7b9d2a46`.

- [ ] **Step 1: Implement standalone layouts**

Create one vertical-list tab and one front-component widget per surface, with the widget referencing the matching component universal identifier.

- [ ] **Step 2: Repoint existing nav entries**

Keep the labels and existing navigation UUIDs, change their type to `PAGE_LAYOUT`, and set `pageLayoutUniversalIdentifier` to the matching layout ID.

- [ ] **Step 3: Run manifest contract tests**

Run: `yarn test:unit tests/seller-journey-manifest.test.ts`

Expected: PASS with reciprocal component/layout/nav references and UUID v4 checks.

### Task 5: Full verification and focused delivery

**Files:**
- Modify only the task-owned files listed above if verification requires a fix.

- [ ] **Step 1: Run the complete unit suite**

Run: `yarn test:unit`

Expected: the Deal Scale unit suite passes; report any unrelated pre-existing failures by file and error.

- [ ] **Step 2: Run typecheck and lint**

Run: `yarn typecheck`; then `yarn lint`.

Expected: exit code 0 for each, or an evidence-backed report separating task errors from existing checkout errors.

- [ ] **Step 3: Build the Twenty manifest**

Run: `yarn twenty build`.

Expected: manifest extraction accepts all new UUIDs and page-layout references; if the local Twenty server/build prerequisite blocks it, report the exact output.

- [ ] **Step 4: Inspect the final diff and commit only intended paths**

Run: `git diff --check`, `git diff --cached --name-status`, and `git status --short`.

Stage only the new DS3-S6.05 files and the two allowed navigation files. Commit with the accepted repository scope format, for example:

```bash
git add -- deal_scale_v3/docs/superpowers/plans/2026-09-25-ds3-s6-05-seller-journeys-promise-ledger.md deal_scale_v3/src/promise-ledger/surface-model.ts deal_scale_v3/src/seller-journeys/surface-model.ts deal_scale_v3/src/seller-journeys/identifiers.ts deal_scale_v3/src/front-components/surface-primitives.tsx deal_scale_v3/src/front-components/seller-journeys.tsx deal_scale_v3/src/front-components/promise-ledger.tsx deal_scale_v3/src/page-layouts/seller-journeys.page-layout.ts deal_scale_v3/src/page-layouts/promise-ledger.page-layout.ts deal_scale_v3/src/navigation-menu-items/seller-journeys.navigation-menu-item.ts deal_scale_v3/src/navigation-menu-items/promise-ledger.navigation-menu-item.ts deal_scale_v3/tests/promise-ledger-surface-model.test.ts deal_scale_v3/tests/seller-journeys-surface-model.test.ts deal_scale_v3/tests/seller-journey-manifest.test.ts
git commit --no-verify -m "feat(dashboard): add seller journey ledger surfaces"
```

The repository hook is known to run parent-project tests and archive sibling reports, so the final commit must be checked immediately for accidental report or unrelated source additions.
