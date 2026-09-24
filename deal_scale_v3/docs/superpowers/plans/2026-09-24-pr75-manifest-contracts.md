# PR75 Manifest Contracts and CI Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the Deal Scale Twenty manifest installable with reciprocal relation metadata, persist every P0 assurance value as object fields, and make CI/CD/publish workflows discoverable at the repository root.

**Architecture:** Keep the Zod assurance contracts as the source of the domain field definitions, then map those definitions into explicit Twenty `defineObject` fields and reciprocal `defineField` relation metadata. Move the nested app workflows to the repository-level `.github/workflows` while preserving their `deal_scale_v3` working directory. Add manifest and workflow contract tests so generated metadata and GitHub discovery remain mechanically verifiable.

**Tech Stack:** TypeScript, Zod, Twenty SDK, Vitest, GitHub Actions, Yarn.

**Spec:** `deal_scale_v3/src/assurance/schema.ts`, `deal_scale_v3/src/objects/`, `deal_scale_v3/.github/workflows/`, and PR #75 review findings.

## Global Constraints

- Keep provider payloads out of canonical assurance objects.
- Use valid UUID v4 universal identifiers for every object and field.
- Preserve tenant, provenance, source version, record version, and observed-at fields.
- Keep workflow execution rooted at the repository checkout while running app commands from `deal_scale_v3`.
- Do not stage unrelated outer-repository changes.

## Review Focus

- Relation target metadata must identify a reciprocal relation field, never a text name field; covered by relation metadata tests.
- Every Zod contract property needed at runtime must have a matching installed object field; covered by object-field coverage tests.
- Root GitHub workflows must exist under `.github/workflows` and use the nested package path; covered by workflow discovery tests.

### Task 1: Manifest field and relation metadata

**Files:**
- Modify: `deal_scale_v3/src/objects/*.ts`, `deal_scale_v3/src/fields/*.ts`, `deal_scale_v3/src/constants/universal-identifiers.ts`
- Test: `deal_scale_v3/tests/manifest-contract.test.ts`

**Interfaces:**
- Consumes the existing assurance object identifiers, common fields, Zod contracts, and Twenty SDK field/object builders.
- Produces explicit domain fields and reciprocal relation field identifiers for all manifest relations.

- [x] Write tests that fail when a relation target points at a common text field or when a contract property has no object field.
- [x] Run the manifest contract test and confirm the metadata assertions fail on the current manifest.
- [x] Define reciprocal relation fields and map each relation to the reciprocal field universal identifier.
- [x] Add missing domain fields for source connection, event, promise, policy, detector, case, disposition, outcome, and other contract-backed objects.
- [x] Run the manifest contract test and Twenty build.
- [ ] Commit as `fix(manifest): complete assurance fields and reciprocal relations`.

### Task 2: Repository-root workflow discovery

**Files:**
- Create or move: `.github/workflows/deal-scale-v3-ci.yml`, `.github/workflows/deal-scale-v3-cd.yml`, `.github/workflows/deal-scale-v3-publish.yml`
- Remove nested copies only after root equivalents are verified: `deal_scale_v3/.github/workflows/*.yml`
- Test: `deal_scale_v3/tests/workflow-discovery.test.ts`

**Interfaces:**
- Consumes the existing nested workflow commands and package scripts.
- Produces root-discoverable workflows whose steps use `working-directory: deal_scale_v3` or explicit `cd deal_scale_v3`.

- [x] Add a test that enumerates repository-root `.github/workflows` and requires CI, CD, and publish workflow entrypoints with the nested package working directory.
- [x] Run the workflow discovery test and confirm it fails while only nested workflows exist.
- [x] Move or recreate the workflows at repository root and remove duplicate nested definitions.
- [ ] Run the discovery test, YAML parsing/lint checks, and the package’s focused CI commands.
- [ ] Commit as `ci: expose Deal Scale workflows at repository root`.

### Task 3: Final verification and delivery

- [x] Run `yarn test:unit`, `yarn typecheck`, `yarn lint`, `yarn twenty dev:build`, and `git diff --check` from `deal_scale_v3`.
- [x] Run the full integration command and record any Twenty environment blocker without weakening the workflow.
- [ ] Stage only PR75 files, push `feat/ds3-sprint0-foundation`, and update PR #75 with evidence.
- [ ] Update the Sprint 0/S0-01 Notion task with the commit, PR, manifest counts, workflow paths, and remaining environment gates.
