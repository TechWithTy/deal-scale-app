# Rspack Preview Workflow

Use the Rspack preview target whenever you need to smoke-test shared UI without the full Next.js stack. This guide explains how to run it locally, how it is wired into the repo, and how to add new components or CSS.

---

## 1. Prerequisites

- Node 20+ and PNPM 8/9 (the repo already uses PNPM workspaces).
- `.env.preview.local` is auto-generated the first time you run a preview script, so no manual setup is required.
- Optional: `pnpm install` to ensure dependencies are installed.

---

## 2. Available Scripts

These live in the root `package.json` and already run the preview flag helper so the environment is consistent across Vite and Rspack:

```json
"dev:vite": "pnpm exec tsx scripts/bundlers/ensure-preview-flag.ts vite:dev && pnpm exec vite --config tools/vite-preview/vite.config.ts",
"build:vite": "pnpm exec tsx scripts/bundlers/ensure-preview-flag.ts vite:build && pnpm exec vite build --config tools/vite-preview/vite.config.ts",
"dev:rspack": "pnpm exec tsx scripts/bundlers/ensure-preview-flag.ts rspack:dev && pnpm exec rsbuild dev --config tools/rspack-preview/rsbuild.config.ts",
"build:rspack": "pnpm exec tsx scripts/bundlers/ensure-preview-flag.ts rspack:build && pnpm exec rsbuild build --config tools/rspack-preview/rsbuild.config.ts"
```

- **Dev server:** `pnpm run dev:rspack`
- **Production build:** `pnpm run build:rspack`

The helper script writes `.env.preview.local` with `NEXT_PUBLIC_ENV=preview`, the last bundler executed, and a timestamp. Both preview configs set `envDir` to the repo root, so these flags are picked up automatically.

---

## 3. Project Layout

- `tools/rspack-preview/rsbuild.config.ts`: Rspack configuration with React plugin, `@app` + `@` aliases, and shims that mimic Next APIs.
- `tools/rspack-preview/src/main.tsx`: Entry point that renders `PreviewApp` and imports `@app/globals.css` so styling matches Next.js.
- `tools/vite-preview/src/preview-app.tsx`: Shared React surface consumed by both Vite and Rspack previews. Update this file to showcase new components.
- `tools/vite-preview/src/shims/*`: Lightweight replacements for `next/image`, `next/link`, and `server-only`.

When you add new shared components, import them inside `PreviewApp` or create new sections to highlight specific use cases.

---

## 4. Adding Components or Styles

1. Place your component in the normal `src/` or `components/` tree.
2. Import it inside `tools/vite-preview/src/preview-app.tsx` (or wrap it in another component that the preview app renders).
3. If you need global styles, extend `app/globals.css` and reload the preview server. Thanks to the `@app` alias the Rspack build will pick it up immediately.

---

## 5. Troubleshooting

| Issue | Likely Cause | Fix |
| --- | --- | --- |
| `Can't resolve "../../../src/index.css"` | Legacy path leftover from pre-Next 13 structure | Use `@app/globals.css` or import CSS relative to the project root |
| `.env.preview.local` missing | Helper script didn’t run | Always use the provided `dev:*` and `build:*` scripts; they invoke `ensure-preview-flag.ts` automatically |
| Rsbuild warning about `source.alias` | Legacy config syntax | Safe to ignore for now; we’ll migrate to `resolve.alias` in a future cleanup |
| CSS not applied | Component imports a Next-only stylesheet | Move shared CSS into `app/globals.css` or create a new file referenced via the `@app` alias |

---

## 6. Useful Commands

- `pnpm run dev:rspack` – Hot-reload preview server on port 5175.
- `pnpm run build:rspack` – Production-style Rspack build in `dist/rspack-preview`.
- `pnpm run dev:vite` / `pnpm run build:vite` – Same preview surface powered by Vite if you need to compare bundler behavior.

Keep this guide updated whenever we change the preview architecture (e.g., new shims, additional aliases, or different entrypoints).

