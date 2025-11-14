# Turbo Task Runner Setup (November 2025)

## Context
- Repo recently renamed from `lead_ignite` → `deal_scale`.
- We run Turbo via `pnpm turbo …`; local CLI pinned to **v1.10.16** for now.
- Turbo v1 root configs still require legacy keys: `extends: ["//"]` + `pipeline`.

## Final `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": { "cache": false },
    "lint": { "outputs": [] },
    "typecheck": {
      "outputs": [],
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "outputs": [],
      "dependsOn": ["^test"]
    }
  }
}
```

### Why the legacy keys?
- Turbo 2.x switched to `tasks` and dropped the root-only `extends`.
- The installed CLI (v1.10.16) hard-fails without `extends: ["//"]` **and** expects `pipeline`.
- We added both back so dry-runs and builds succeed today. When upgrading to Turbo 2.x, swap back to `tasks` and remove `extends`.

## Verification (2025‑11‑14)
```
pnpm turbo run lint --dry-run --verbosity 2
```
- Turbo now resolves `deal_scale#lint` → `pnpm exec biome check --write src`.
- Output shows task hash, inputs (6647 files), and writes logs to `.turbo/turbo-lint.log`.

## Future Upgrade Notes
- When ready for Turbo 2.x:
  1. `pnpm add -D turbo@latest`
  2. `turbo.json`: replace `pipeline` with `tasks`, remove `extends`.
  3. Re-run `pnpm turbo run lint --dry-run --verbosity 2` to confirm.
- Keep `.turbo/daemon` cleared if switching versions (`pnpm turbo kill-daemon`).

