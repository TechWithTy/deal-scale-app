# Cloudflare Next-on-Pages Integration Notes (November 2025)

## Goal
Deploy our Next.js 14.2.32 app to Cloudflare Workers/Pages without uploading the entire `.next` directory (which exceeds the 25 MiB asset limit).

## Final Approach
1. **Adapter**: `@cloudflare/next-on-pages` v1.13.16 (deprecated, so plan to migrate to [OpenNext for Cloudflare](https://opennext.js.org/cloudflare) soon).  
2. **Build Script**:  
   ```json
   "build:cf": "pnpm exec next-on-pages"
   ```  
   Runs the adapter, which internally executes `pnpm dlx vercel build` followed by the Worker bundle generation.
3. **wrangler.toml**:
   ```toml
   name = "dealscale"
   compatibility_date = "2025-11-14"
   main = ".open-next/worker.js"

   [build]
   command = "pnpm run build:cf"
   cwd = "."

   [vars]
   NODE_ENV = "production"
   NEXTAUTH_URL = "https://your-domain.pages.dev"
   ```
   No `[assets]` block—the adapter outputs both the Worker and static assets in `.open-next/`.

## Windows Limitation
- `next-on-pages` shells out to `pnpm dlx vercel build`. Vercel CLI currently throws `EPERM: operation not permitted, open '.next/trace'` on native Windows.
- **Workarounds**:
  - Run the command inside **WSL** or a Linux/macOS CI runner.
  - Or pre-run `pnpm run build` on Windows (which succeeds) and then invoke `pnpm exec next-on-pages --skip-build` from WSL so only the adapter logic runs.
  - Long term: migrate to **OpenNext**, which doesn’t need the Vercel CLI and therefore avoids this issue.

## Deployment Flow
1. `pnpm run build:cf` *(inside WSL/CI)* → generates `.open-next/worker.js` + static assets.
2. `pnpm exec wrangler deploy` → uploads only the optimized worker bundle; no 25 MiB asset errors.

## Image Optimization Strategy
- **Cloudflare Image Resizing only** – we do not rely on Vercel’s default optimizer when running on Workers/Pages.  
- Toggle via `NEXT_IMAGE_STACK=cloudflare` (set in `wrangler.toml` or Dashboard). Locally and on Vercel we keep `NEXT_IMAGE_STACK=next` so the default Next.js optimizer + `sharp` continue to work.
- `next.config.js` now points `images.loaderFile` to `lib/images/cloudflare-loader.js` whenever the Cloudflare stack is active. That loader rewrites every image request to `/cdn-cgi/image/.../<origin-url>` and normalizes relative paths using `NEXT_PUBLIC_APP_URL` (falling back to `NEXTAUTH_URL`).
- The landing page lives in a separate app, so no changes were required there. Only the dashboard (this repo) uses the Cloudflare loader.
- We keep `sharp` in dependencies for local dev parity (`next dev` still uses the built-in loader when `NEXT_IMAGE_STACK=next`).
- Optional: override the default Cloudflare quality via `NEXT_IMAGE_DEFAULT_QUALITY` (defaults to `75`).

## Next Steps
- Upgrade Next.js to ≥14.3 as recommended by the adapter, or switch to OpenNext.
- Automate the WSL/CI build step (e.g., GitHub Actions running Ubuntu).  
- If sticking with Windows locally, document the `skip-build` flow so devs can reuse an existing Next build before running the adapter.

