# Deal Scale V3 repository-boundary migration

Date: 2026-09-24

## Objective

Move the standalone Twenty app currently under `deal_scale_v3/` into
`TechWithTy/deal_scale_v3.0`, then leave the parent repository with a pinned
Git submodule at the same path.

The migration source is the merged Sprint 2 tree at commit
`6ac135fb6b684bfa7001d53c8c2985c081511aa6`. The current parent working tree
is intentionally excluded from the migration because it contains unrelated
dirty changes.

## Target topology

- `TechWithTy/deal_scale_v3.0`: canonical V3 source, default branch `main`.
- `TechWithTy/deal-scale-app`: legacy/host repository with
  `deal_scale_v3` represented by a gitlink.
- `.gitmodules`: maps `deal_scale_v3` to
  `https://github.com/TechWithTy/deal_scale_v3.0.git`.

The standalone repository receives the V3 files without the parent directory
prefix. Its initial commit must preserve the source package's source,
contracts, tests, Yarn lockfile, documentation, and V3-local configuration.

## Migration sequence

1. Bootstrap the empty standalone repository from the source tree and verify
   the initial commit contains the expected V3 file manifest.
2. Add standalone CI for `yarn test:unit`, `yarn typecheck`, and
   `yarn lint`; retain the existing V3-local build/test conventions.
3. Create the parent migration branch from the merged source commit, remove the
   tracked V3 directory, add the standalone repository as a submodule at
   `deal_scale_v3`, and add/update `.gitmodules`.
4. Update parent CI/CD and deployment configuration so workflows that build V3
   initialize V3 by path and run from the submodule directory.
5. Validate both checkout modes: a clean parent clone with path-scoped V3
   submodule initialization, and a standalone clone of `deal_scale_v3.0`.
   In the parent checkout, run `git submodule sync --recursive -- deal_scale_v3`
   and `git submodule update --init --recursive -- deal_scale_v3`.
   Confirm `deal_scale_v3` resolves to the pinned standalone commit
   `d7fedab028661fc533abdcc35b265afbbdd7dae0`.
6. Open a parent migration PR and leave the standalone repository's initial
   commit independently reviewable.

## Safety and rollback

- The orphaned gitlinks at `.windsurf`, `_docs/front_end_best_practices`, and
  `scripts` predate this migration and are outside its scope; do not invent
  `.gitmodules` mappings or repair them here.
- Do not stage or delete the current dirty local worktree.
- Do not copy secrets, `.env` files, build output, dependency directories, or
  generated reports into the standalone repository.
- Verify the standalone commit and file manifest before deleting the parent
  directory from the migration branch.
- Rollback is the parent migration PR: close it and restore the prior tree; the
  standalone repository remains an immutable source snapshot until the
  migration is accepted.

## Acceptance criteria

- The standalone repository has a non-empty `main` with the complete V3
  source and tests.
- The parent migration branch contains only the intended submodule/gitmodules,
  CI/deployment adjustments, and migration documentation.
- Parent and standalone focused checks pass.
- A clean parent checkout using the path-scoped sync and update commands above
  resolves `deal_scale_v3` to the pinned standalone commit.
- No unrelated dirty-worktree files are included.
