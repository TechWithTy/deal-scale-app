# Vercel build: Module not found (external/*)

Timestamp: 2025-09-21 11:22:47 -06:00

## Symptoms
- Next.js build on Vercel fails with:
  - Module not found: Can't resolve '@/external/drawer-flow'
  - Module not found: Can't resolve '@/external/modal-image-inspect'
  - Module not found: Can't resolve '@/external/activity-graph/components'
- Local builds succeed.

## Root causes found
- Nested Git repositories existed under `external/`, so their contents were not part of the parent repository on Vercel checkout.
  - Converted to regular folders:
    - external/tabbed-list-test: converted and committed.
    - external/drawer-flow: removed `.git/` and committed.
    - external/modal-image-inspect: removed `.git/` and committed.
  - Still pending (discovered):
    - external/activity-graph has a `.git/` folder locally. This prevents its files from being included in the parent repo on Vercel.

- Path alias resolution differences between local and CI.
  - `tsconfig.json` defines `"@/*": ["./*"]`.
  - Added explicit webpack alias for `@` in `next.config.js` to `path.resolve(__dirname)` to enforce alias on CI.
  - As a CI-safe fallback, switched some pages to use explicit relative imports instead of alias.

## What we changed
- next.config.js
  - `transpilePackages: ["shadcn-table"]` (correct package name)
  - `config.resolve.alias['@'] = path.resolve(__dirname)`

- package.json
  - Narrowed `lint-staged` glob to app-local dirs to prevent Biome formatting external packages.

- Switched alias imports to relative paths in pages
  - `app/test-external/charts/line/page.tsx`
    - from `@/external/activity-graph/...` to `../../../../external/activity-graph/...`
  - `app/test-external/drawer-test/page.tsx`
    - from `@/external/drawer-flow` to `../../../external/drawer-flow`
  - `app/test-external/image-lens/page.tsx`
    - from `@/external/modal-image-inspect` to `../../../external/modal-image-inspect`

- Normalized to 'external/*' alias for app pages and added TS alias
  - Updated files:
    - `app/test-external/tabbed-list/page.tsx`
    - `app/dashboard/kanban/page.tsx`
    - `app/test-external/storybook/page.tsx`
    - `app/(auth)/(signin)/_components/test_users/PermissionsEditor.tsx`
    - `app/dashboard/employee/page.tsx`
    - `app/test-external/kanban-test/page.tsx`
    - `app/layout.tsx`
    - `app/test-external/ai-summary-expandable/page.tsx`
    - `app/test-external/maps-test/page.tsx`

Note: We standardized on correct relative depth (from `app/test-external/.../page.tsx` up to repo root then into `external/`).
- Depths:
  - charts/line/page.tsx -> `../../../../external/...`
  - drawer-test/page.tsx -> `../../../external/...`
  - image-lens/page.tsx -> `../../../external/...` (update if needed to match folder depth)

## Actions still needed
1) Vendorize `external/activity-graph` (remove nested repo and commit files)
   - rm -rf external/activity-graph/.git
   - git add external/activity-graph
   - git commit -m "Vendorize activity-graph so Vercel can resolve it"
   - git push

2) Ensure all relative import depths are correct
   - From `app/test-external/charts/line/page.tsx`:
     - `../../../../external/activity-graph/*` (app -> test-external -> charts -> line -> page.tsx = 4 levels up to repo root)
   - From `app/test-external/drawer-test/page.tsx`:
     - `../../../external/drawer-flow`
   - From `app/test-external/image-lens/page.tsx`:
     - Likely `../../../external/modal-image-inspect` (double-check depth)

3) Redeploy in Vercel after pushing

## Edge cases and environment considerations
- Windows CRLF warnings (safe): Git reports LF→CRLF on staged files. Harmless for build.
- pnpm / lockfile: Ensure Vercel uses pnpm (it will read `packageManager` from package.json). No monorepo build is required; workspace includes `external/*` but we are importing source files, not building packages.
- Node version: Local Node is v20.18.1. Set Vercel Project to Node 20 to match (Project Settings → General → Node.js Version).
- Biome pre-commit: narrowed scope to avoid formatting external packages. If format fails on CI, it won’t block Vercel because Vercel runs `pnpm run build` only.

## Alternative fallback (if needed)
- If alias or relative resolution still behaves differently on CI, we can:
  - Create a top-level `external` path alias in `tsconfig.json` and `next.config.js`:
    - tsconfig.json
      ```json
      {
        "compilerOptions": {
          "baseUrl": ".",
          "paths": {
            "@/*": ["./*"],
            "external/*": ["external/*"]
          }
        }
      }
      ```
    - next.config.js (webpack)
      ```js
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        external: path.resolve(__dirname, 'external'),
      };
      ```
  - Then revert to clean imports like `external/drawer-flow` in code.

## Quick verification checklist
- [ ] `external/activity-graph/.git` is removed and changes pushed.
- [ ] GitHub repo shows files under `external/activity-graph/`.
- [ ] The three page imports point to correct relative depths.
- [ ] Vercel Node version = 20.
- [ ] New deployment succeeds.

---
Generated by Cascade to capture current state, changes made, and next steps for resolving Vercel module resolution failures. 

## Update: 2025-09-21 12:12:12 -06:00

### Cloud status
- Vercel still fails with Module not found on the updated relative paths:
  - `../../../../external/activity-graph/components`
  - `../../../external/drawer-flow`
  - `../../../external/modal-image-inspect`

### Conclusions
- This indicates the external folders (especially `external/activity-graph/`) are still not present in the cloud checkout.
- The most likely cause is that `external/activity-graph` remains a nested Git repo locally and was never committed into the parent repo.

### Verify files are in the repo (do all)
- Check nested git metadata exists (should NOT exist):
  - `ls -la external/activity-graph/.git`
- Confirm Git tracks the files:
  - `git ls-files external/activity-graph | wc -l` (should be > 0)
- Confirm GitHub shows files in the folder:
  - Visit your repo: `external/activity-graph/` directory should display the source files (components, utils, types).

### Fix (vendorize) if any check fails
1) Remove nested repo metadata and track files in parent repo
   - `rm -rf external/activity-graph/.git`
   - `git add external/activity-graph`
   - `git commit -m "Vendorize activity-graph and include in parent repo"`
   - `git push`

2) Re-run cloud build
   - Trigger a new Vercel deployment from branch `9-21-buildfix`.

### Additional hardening (already applied)
- Webpack aliases in `next.config.js`:
  - `@` -> project root
  - `external` -> `external/` directory
- Relative imports updated in:
  - `app/test-external/charts/line/page.tsx`
  - `app/test-external/drawer-test/page.tsx`
  - `app/test-external/image-lens/page.tsx`

### Environment notes
- If using `vercel build` on Windows and you hit EPERM symlink errors, run terminal as Administrator or enable Windows Developer Mode.

## Update: 2025-09-21 12:49:58 -06:00

### Normalization pass complete
- Replaced all remaining `@/external/*` imports with `external/*` across the codebase.
- Verified via grep that no `@/external/` usages remain.

### Files updated in this pass (selection)
- `components/layout/mobile-sidebar.tsx`
- `components/layout/sidebar.tsx`
- `components/leadsSearch/PropertySearch.tsx`
- `components/leadsSearch/search/LeadSearchForm.tsx`
- `components/leadsSearch/search/MapArea.tsx`
- `components/leadsSearch/search/form/LocationInput.tsx`
- `components/leadsSearch/PropertyDrawerFlow.tsx`
- `components/tables/LeadListTableWithModals.tsx`
- `src/components/tables/LeadListTableWithModals.tsx`
- `components/tables/lead-list-tables/columns.tsx`
- `components/tables/employee-tables/columns.tsx`
- `components/tables/employee-tables/EmployeeKanbanTable.tsx`
- `components/tables/calls-table/columns.tsx`
- `components/property/page/AISummaryCardClient.tsx`
- `components/forms/agent/AgentForm.tsx`
- `external/drawer-flow/components/ItemsGrid.tsx`
- `external/activity-graph/components/TeamActivityFeed.tsx`
- `external/google-maps-two/components/StreetViewPreview.tsx`
- `external/google-maps-two/components/MapsTestComposite.tsx`

### Next steps unchanged
- Vendorize `external/activity-graph` (remove nested `.git`, add and commit files) so Vercel has the sources.
- Trigger a new deployment after pushing.
