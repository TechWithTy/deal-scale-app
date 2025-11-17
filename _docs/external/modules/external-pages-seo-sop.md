# SOP: Publishing SEO-Ready External Pages

## 1. Define Experience & Auth Rules
- Capture the page purpose, hero copy, CTAs, and conversion path in the feature brief.
- Decide authentication behavior:
  - `public`: anyone can browse; include sign-in upsell for saved progress.
  - `optional`: anonymous by default, with `?auth=required` query string enforcing `redirect("/signin?next=...")`.
  - `required`: gate every visit; enforce via middleware or immediate redirect from the server component.
- Note analytics requirements (pixels, events, UTM passthrough) before implementation starts.

## 2. File Placement & Structure
- Add the route under `app/external-tools/<slug>/page.tsx`.
- Keep shared metadata/JSON-LD helpers in `lib/seo/externalTools.ts`.
- Factor reusable UI fragments into `components/external/**`. Respect the 250-line limit per file.

## 3. Static SEO Essentials
- Export `generateMetadata()` from every route so titles, descriptions, keywords, OG/Twitter objects, and canonical URLs come from shared helpers.
- Include descriptive internal links from navigation, footer, and resource hubs to ensure crawl depth.
- Supply a high-quality OG/Twitter image per page; reuse constants from `lib/seo`.

## 4. Structured Data (Dynamic SEO)
- Embed JSON-LD via `<Script type="application/ld+json">`:
  - Use `FAQPage` schema when addressing common questions.
  - Use `HowTo` for calculator step-by-step guidance (list inputs/outputs).
  - Use `Product`/`Service` when highlighting a Deal Scale feature tier.
- Mirror dynamic behaviors (e.g., prefill query parameters) in structured data when possible.

## 5. Auth-Aware Rendering
- Fetch the session with `const session = await auth();`.
- Redirect when authentication is required:
  ```ts
  if (requiresAuth(searchParams?.auth) && !session) {
    redirect("/signin?next=/external-tools/<slug>");
  }
  ```
- Present differentiated messaging blocks for guests vs authenticated users (upsell sign-in to save data).

## 6. Sitemap & Robots
- Update `app/sitemap.ts` with the new route. Set `changeFrequency` and `priority` aligned to content freshness.
- Expose only canonical URLs (omit `?auth=required` variants).
- Confirm metadata robots directives allow indexing unless the page is intentionally private.
- After deploy, resubmit the sitemap in Google Search Console/Bing Webmaster.

## 7. QA & Testing
- Add Vitest specs under `_tests/app/external-tools/<slug>/` to assert metadata and JSON-LD payloads.
- Mock `auth()` and `redirect()` to verify auth gating logic.
- Run Lighthouse (ideally ≥90 SEO score) and validate JSON-LD with Google Rich Results Tester before release.

## 8. Launch Checklist
- Verify analytics events fire for both anonymous and authenticated sessions.
- Document the release in changelog or release notes, including new query parameters.
- Monitor Search Console for index coverage and schema enhancements post-launch.

Following this SOP ensures every external page aligns with Deal Scale’s authentication patterns, maintains SEO parity with the main site, and delivers consistent structured data for rich search features.











