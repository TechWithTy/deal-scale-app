# DS3-S6.04 Assurance Case Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a read-only/pending-local-state Assurance Case Detail front component and standalone Twenty page layout.

**Architecture:** Keep all new behavior in an owned `assurance-case-detail` contract/fixture module plus one front component and one page layout. The component consumes schema-shaped preview data, uses Twenty primitives, gates disposition controls through existing RBAC and feature flags, and performs no persistence.

**Tech Stack:** TypeScript, React 19, Twenty SDK 2.41, Twenty UI 2.41, Zod assurance types, Vitest, Yarn, Oxlint.

**Spec:** `docs/superpowers/specs/2026-09-25-ds3-s6-04-assurance-case-detail-design.md`

## Global Constraints

- Write only new/owned files for this Sprint 6 task.
- Do not edit `src/assurance/schema.ts`, `src/constants/universal-identifiers.ts`, `src/promise-ledger/**`, or other Sprint 6 task files.
- Every new Twenty entity identifier must be a valid UUID v4.
- No API persistence, Twenty client mutation, or CRM internals may be introduced.
- Keep application source files under 250 lines where practical and use double quotes in new files.

## Review Focus

- Reviewer role with the manager-disposition flag enabled must not see write controls; the RBAC matrix, not the flag alone, owns authorization. Test in Task 1.
- An empty evidence list must render a stable empty state without opening a detail panel. Test in Task 1.
- Evidence selection must be local-only and the UI must label the pending disposition as unsaved. Test in Task 1.
- Narrow layouts must expose a drawer state and close action without relying on a CRM route. Test in Task 1.
- New manifest UUIDs must be v4-shaped and the layout widget must reference the front component exactly. Test in Task 1.

### Task 1: Contract tests and assurance-case-detail model

**Files:**
- Create: `tests/assurance-case-detail-contract.test.ts`
- Create: `src/assurance-case-detail/contract.ts`
- Create: `src/assurance-case-detail/fixture.ts`

**Interfaces:**
- Produces `ASSURANCE_CASE_DETAIL_IDENTIFIERS`, `ASSURANCE_CASE_DETAIL_PREVIEW`, `sortEvidenceTimeline`, `getDispositionControlState`, and `selectEvidenceId` for the component and layout.

- [ ] **Step 1: Write the failing Vitest contracts**

```ts
import { describe, expect, it } from "vitest";

import { FEATURE_FLAGS } from "../src/config/feature-flags";
import {
  ASSURANCE_CASE_DETAIL_IDENTIFIERS,
  getDispositionControlState,
  selectEvidenceId,
  sortEvidenceTimeline,
} from "../src/assurance-case-detail/contract";
import { ASSURANCE_CASE_DETAIL_PREVIEW } from "../src/assurance-case-detail/fixture";

const isUuidV4 = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

describe("DS3-S6.04 assurance case detail contracts", () => {
  it("uses UUID-v4 identifiers for the owned detail entities", () => {
    expect(Object.values(ASSURANCE_CASE_DETAIL_IDENTIFIERS).every(isUuidV4)).toBe(true);
  });

  it("orders evidence newest first and selects only known evidence", () => {
    const sorted = sortEvidenceTimeline(ASSURANCE_CASE_DETAIL_PREVIEW.evidence);
    expect(sorted[0].evidenceId).toBe("evidence-pricing-email");
    expect(selectEvidenceId(null, "evidence-pricing-email", sorted)).toBe(
      "evidence-pricing-email",
    );
    expect(selectEvidenceId("evidence-pricing-email", "missing", sorted)).toBeNull();
  });

  it("gates disposition controls by manager permission and feature flag", () => {
    expect(
      getDispositionControlState({
        role: "reviewer",
        flags: { [FEATURE_FLAGS.managerDisposition]: true },
      }),
    ).toEqual({ canEdit: false, reason: "role" });
    expect(
      getDispositionControlState({
        role: "manager",
        flags: { [FEATURE_FLAGS.managerDisposition]: false },
      }),
    ).toEqual({ canEdit: false, reason: "feature-flag" });
    expect(
      getDispositionControlState({
        role: "manager",
        flags: { [FEATURE_FLAGS.managerDisposition]: true },
      }),
    ).toEqual({ canEdit: true, reason: null });
  });

  it("preserves provenance and has no persistence adapter", () => {
    expect(ASSURANCE_CASE_DETAIL_PREVIEW.assuranceCase.provenanceRef).toContain(
      "detector://",
    );
    expect(ASSURANCE_CASE_DETAIL_PREVIEW.detector.sourceVersion).toBe("detector-v1");
    expect(ASSURANCE_CASE_DETAIL_PREVIEW.persistence).toBe("ui-only");
  });
});
```

- [ ] **Step 2: Run the focused test and verify the expected RED state**

Run: `yarn vitest run tests/assurance-case-detail-contract.test.ts`

Expected: FAIL because the new contract, fixture, front component, and layout modules do not exist yet.

- [ ] **Step 3: Implement the minimal owned contract and fixture**

Define the four UUID-v4 identifiers, derive view-model types from the existing assurance schema exports, create a schema-shaped preview case/detector/evidence/disposition model, sort evidence by `observedAt` descending, reject unknown selections, and gate manager disposition using `RBAC_MATRIX.manager` plus `FEATURE_FLAGS.managerDisposition`.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `yarn vitest run tests/assurance-case-detail-contract.test.ts`

Expected: PASS with all contract assertions green.

- [ ] **Step 5: Commit the model and contracts**

```bash
git add tests/assurance-case-detail-contract.test.ts src/assurance-case-detail/contract.ts src/assurance-case-detail/fixture.ts
git commit -m "test(assurance-case): define detail surface contracts"
```

### Task 2: Dedicated Twenty front component

**Files:**
- Create: `src/front-components/assurance-case-detail.tsx`

**Interfaces:**
- Consumes `ASSURANCE_CASE_DETAIL_PREVIEW`, `ASSURANCE_CASE_DETAIL_IDENTIFIERS`, `getDispositionControlState`, `selectEvidenceId`, and `sortEvidenceTimeline` from Task 1.
- Produces a default `defineFrontComponent` result and a named `AssuranceCaseDetail` React component for render contracts.

- [ ] **Step 1: Add render-landmark contracts to the focused test**

```ts
import { renderToStaticMarkup } from "react-dom/server";
import frontComponent from "../src/front-components/assurance-case-detail";
import { AssuranceCaseDetail } from "../src/front-components/assurance-case-detail";

it("renders the case, finding, evidence, provenance, and local disposition landmarks", () => {
  const markup = renderToStaticMarkup(<AssuranceCaseDetail />);
  expect(markup).toContain("Assurance case");
  expect(markup).toContain("Pricing promise review");
  expect(markup).toContain("Detector finding");
  expect(markup).toContain("Evidence timeline");
  expect(markup).toContain("Provenance");
  expect(markup).toContain("Disposition");
  expect(markup).toContain("Unsaved preview");
  expect(markup).not.toContain("CRM pipeline");
  expect(frontComponent.success).toBe(true);
});
```

- [ ] **Step 2: Run the focused test and verify the expected RED state**

Run: `yarn vitest run tests/assurance-case-detail-contract.test.ts`

Expected: FAIL because the named component and its rendered landmarks do not exist yet.

- [ ] **Step 3: Implement the front component**

Render the header, finding, evidence timeline, provenance, and disposition sections with Twenty primitives. Keep selection in `useState`, show a local unsaved notice after selecting a disposition, render the detail panel only for a known evidence ID, and include CSS media rules that switch the right panel to a fixed drawer under 860px. Render controls only when `getDispositionControlState` allows them; otherwise render an explicit read-only explanation.

- [ ] **Step 4: Run focused contracts and typecheck**

Run: `yarn vitest run tests/assurance-case-detail-contract.test.ts` and `yarn typecheck`

Expected: both commands exit 0 with the render and type contracts passing.

- [ ] **Step 5: Commit the front component**

```bash
git add tests/assurance-case-detail-contract.test.ts src/front-components/assurance-case-detail.tsx
git commit -m "feat(assurance-case): add detail front component"
```

### Task 3: Standalone page layout and full validation

**Files:**
- Create: `src/page-layouts/assurance-case-detail.page-layout.ts`

**Interfaces:**
- Consumes `ASSURANCE_CASE_DETAIL_IDENTIFIERS.frontComponent`, `.layout`, `.tab`, and `.widget` from Task 1.
- Produces a Twenty `STANDALONE_PAGE` manifest with one vertical-list tab and one front-component widget.

- [ ] **Step 1: Add the layout shape contract**

Add the page-layout import and assertions to `tests/assurance-case-detail-contract.test.ts`:

```ts
import pageLayout from "../src/page-layouts/assurance-case-detail.page-layout";

it("wires the standalone layout widget to the detail component", () => {
  expect(pageLayout.success).toBe(true);
  expect(pageLayout.config.type).toBe("STANDALONE_PAGE");
  expect(pageLayout.config.tabs?.[0]?.widgets?.[0]?.configuration).toEqual({
    configurationType: "FRONT_COMPONENT",
    frontComponentUniversalIdentifier:
      ASSURANCE_CASE_DETAIL_IDENTIFIERS.frontComponent,
  });
});
```

- [ ] **Step 2: Run the layout contract and verify RED if the layout is absent**

Run: `yarn vitest run tests/assurance-case-detail-contract.test.ts`

Expected before implementation: the import fails because the layout module is absent. After implementation, the same command is expected to pass.

- [ ] **Step 3: Implement the standalone page layout**

Use `definePageLayout` with the owned layout/tab/widget UUIDs, `type: "STANDALONE_PAGE"`, a vertical-list tab, and `configurationType: "FRONT_COMPONENT"`. Do not add a navigation menu item.

- [ ] **Step 4: Run the full validation set**

Run:

```bash
yarn vitest run
yarn typecheck
yarn lint
git diff --check
```

Expected: all commands exit 0. If the existing dirty parent checkout is irrelevant, its files must not appear in this worktree’s diff; forbidden paths must remain unchanged.

- [ ] **Step 5: Audit and commit the complete feature**

```bash
git status --short
git diff --name-only HEAD~3..HEAD
git diff --name-only -- src/assurance/schema.ts src/constants/universal-identifiers.ts src/promise-ledger
git add docs/superpowers/specs/2026-09-25-ds3-s6-04-assurance-case-detail-design.md docs/superpowers/plans/2026-09-25-ds3-s6-04-assurance-case-detail.md src/assurance-case-detail src/front-components/assurance-case-detail.tsx src/page-layouts/assurance-case-detail.page-layout.ts tests/assurance-case-detail-contract.test.ts
git commit -m "feat(assurance-case): add detail surface layout"
```

Expected: only the new design/plan, owned feature modules, front component, page layout, and focused test are committed; the forbidden-path diff is empty.
