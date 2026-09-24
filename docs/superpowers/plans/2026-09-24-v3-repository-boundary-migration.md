# Deal Scale V3 Repository Boundary Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the merged Deal Scale V3 application as the complete `TechWithTy/deal_scale_v3.0` repository, then replace `deal_scale_v3/` in `TechWithTy/deal-scale-app` with a pinned git submodule without losing the merged Sprint 2 source or the parent repository’s existing work.

**Architecture:** The standalone repository becomes the canonical owner of the Twenty app. Its `main` branch contains the exact V3 source tree from merged parent commit `6ac135fb6b684bfa7001d53c8c2985c081511aa6`, with workflows rooted at `.github/workflows`. The parent repository keeps only `.gitmodules` metadata and a mode-160000 gitlink at `deal_scale_v3`, pinned to the standalone commit. The parent migration branch targets `feat/ds3-s2-promise-contract`, the branch that contains the merged V3 source, so the migration PR remains narrow and does not silently include unrelated work relative to `main`.

**Tech Stack:** GitHub Git Data API for atomic repository/tree/commit operations; Git submodules; GitHub Actions; Yarn 4.13.0; Node.js 24.5+; Twenty SDK 2.41.0; Vitest; Oxlint; TypeScript native preview.

**Spec:** `docs/superpowers/specs/2026-09-24-v3-repository-boundary-design.md`

## Global Constraints

- Use only the source tree at `6ac135fb6b684bfa7001d53c8c2985c081511aa6`; do not reconstruct V3 from the dirty local checkout.
- Preserve all 82 source files, including `.env.example`, `.gitignore`, `.nvmrc`, `AGENTS.md`, `CLAUDE.md`, package manifests, lockfile, tests, public assets, and `.github/workflows/{ci,cd,publish}.yml`.
- Do not copy secrets, generated build output, caches, nested repository metadata, or parent-only files.
- Do not stage, reset, delete, or rewrite the user’s dirty local checkout. All migration commits are created on the remote migration branch through GitHub’s Git Data API.
- Verify the standalone repository before creating the parent gitlink commit.
- Preserve the existing parent submodule entry for `external/interactive-avatar-nextjs-demo`.
- Keep the migration reversible: the parent migration PR is the rollback boundary; the old V3 content remains available in the parent history.
- Record test limitations explicitly when remote Actions or local dependency state prevents a complete run.

## Task 1: Bootstrap the standalone repository from the merged V3 tree

**Files/areas:**
- Target repository: `TechWithTy/deal_scale_v3.0`
- Source prefix: `deal_scale_v3/`
- Source ref: `6ac135fb6b684bfa7001d53c8c2985c081511aa6`

- [ ] Read the source tree manifest and verify it contains exactly 82 V3 blobs.
- [ ] Create the standalone repository’s initial `main` commit without leaving a temporary bootstrap file in the final tree.
- [ ] Copy each source file with its prefix removed, preserving UTF-8 content and executable/workflow-relevant paths.
- [ ] Ensure the resulting root contains `package.json`, `yarn.lock`, `README.md`, `src/`, `tests/`, `.github/workflows/`, and all required configuration files.
- [ ] Verify the standalone tree has no `deal_scale_v3/` wrapper directory, parent application files, `.git/` content, caches, or generated reports.
- [ ] Verify the standalone commit’s file manifest and SHA are recorded for the parent gitlink step.

## Task 2: Validate the standalone repository as an independently runnable app

**Files/areas:**
- `package.json`
- `yarn.lock`
- `.github/workflows/ci.yml`
- `.github/workflows/cd.yml`
- `.github/workflows/publish.yml`
- `src/`
- `tests/`

- [ ] Confirm the standalone package scripts are self-contained: `yarn lint`, `yarn typecheck`, `yarn test:unit`, `yarn test:smoke`, and `yarn test`.
- [ ] Confirm workflow checkout paths and commands are valid from the standalone repository root; adjust only if any source-relative assumption still points at the old parent layout.
- [ ] Confirm the publish workflow’s provenance comments and repository ownership now correctly refer to the standalone repository boundary; do not add credentials or change package ownership automatically.
- [ ] Run the smallest available focused checks against the same source revision: lint, typecheck, unit tests, smoke contract, and the full test command where environment permits.
- [ ] If Twenty Docker or dependency installation is unavailable, report that as an environment limitation and retain the source-level validation evidence.
- [ ] Inspect the standalone repository’s workflow runs after the commit and record pass/fail status for each triggered workflow.

## Task 3: Replace the parent V3 directory with a pinned submodule

**Files/areas:**
- Parent branch: `codex/migrate-v3-submodule`
- Parent base content: current tip `617e917d74cb5a462a0d3950ddd328f075d9d3f0`
- `.gitmodules`
- gitlink path: `deal_scale_v3`

- [ ] Build a parent tree from the migration branch tip that deletes every tracked `deal_scale_v3/**` blob.
- [ ] Add `deal_scale_v3` as a mode-160000 commit entry pointing exactly to the verified standalone commit.
- [ ] Preserve the existing `external/interactive-avatar-nextjs-demo` submodule and all spec/plan documentation commits.
- [ ] Add the standalone entry to `.gitmodules` with path `deal_scale_v3` and URL `https://github.com/TechWithTy/deal_scale_v3.0.git`.
- [ ] Create one focused conventional commit, `chore(repo): move Deal Scale V3 to standalone repository`, and fast-forward `codex/migrate-v3-submodule` to it.
- [ ] Verify the parent tree reports `deal_scale_v3` as a gitlink, contains no tracked child paths under that directory, and retains the existing submodule metadata.

## Task 4: Validate recursive checkout and parent integration

**Files/areas:**
- Parent migration branch and standalone `main`
- `.gitmodules`
- Parent CI/deployment workflows

- [ ] Verify `git submodule sync --recursive` and `git submodule update --init --recursive` resolve the configured URL and pinned standalone SHA.
- [ ] Verify a clean recursive checkout exposes the V3 app at the same filesystem path expected by parent documentation and tooling.
- [ ] Re-read parent workflows and confirm no workflow assumes V3 is a normal tracked directory without initializing submodules. If a workflow needs the submodule, add `submodules: recursive` to its checkout step in the migration commit; do not modify unrelated deployment jobs.
- [ ] Validate that the parent application’s existing workflows remain unchanged when they do not consume V3.
- [ ] Re-run parent-side tree/configuration checks and the standalone focused checks after the gitlink is created.
- [ ] Document any check that cannot run because the local checkout is intentionally dirty or because the GitHub API cannot execute local commands.

## Task 5: Review and deliver the migration PR

**Files/areas:**
- Parent PR from `codex/migrate-v3-submodule` into `feat/ds3-s2-promise-contract`
- Standalone repository `TechWithTy/deal_scale_v3.0`

- [ ] Review the standalone commit, parent gitlink diff, and `.gitmodules` diff for accidental files, wrong SHA, or wrong repository URL.
- [ ] Confirm the PR body includes the source commit, standalone commit, topology change, validation evidence, and rollback procedure.
- [ ] Create the parent migration PR only after standalone validation and parent tree verification succeed.
- [ ] If review comments arrive, classify each against the spec, fix only in the migration branch, rerun the relevant validation, and update the PR.
- [ ] Report the standalone repository URL, standalone commit SHA, parent branch, parent PR URL, tests run, and any environment limitations.

## Review Focus

- Repository boundary: the standalone root must be the V3 app root, not a nested copy.
- Source integrity: promise-ledger files, adapter contracts, assurance objects, fixtures, workflows, and lockfile must all be present.
- Git correctness: parent path must be a gitlink at mode 160000 and point at an existing standalone commit.
- Workflow correctness: standalone Actions must run from the standalone root; parent Actions must not silently omit required submodules.
- Safety: no dirty local files, secrets, caches, generated output, or unrelated parent changes may enter either repository.
- Reproducibility: a fresh recursive parent checkout and a fresh standalone checkout must resolve the same V3 source.

---

**Execution note:** The implementation agent should complete each task in order, record commit SHAs and validation evidence after each boundary, and stop before parent deletion if standalone bootstrap or validation fails.
