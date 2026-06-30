# Public API Implementation Status - 2026-06-29

This file tracks frontend migration from local fixtures, demo stores, and local
Next.js API routes to the deployed Deal Scale public API.

## Current progress snapshot

Last updated: 2026-06-30

- Public API full smoke rerun completed against production: `173/173` passed.
- Backend Phase 1/core-resource handoff received for BE-01 through BE-04.
  Frontend route wiring is now proceeding against those completed contracts.
- Backend release evidence:
  - Latest merge: `b7c807c5843184b1aa3e981ec295e803c684eab0`
  - Latest master workflow passed, including production blue/green cutover.
  - Production health smoke passed: `https://api.dealscale.io/api/v1/health`
  - Phase 1 OpenAPI updates are documented and merged.
  - `check_if_email_exists` / Reacher operations docs are merged and deployed.
- Caveat: BE-22 full persona fixture matrix plus authenticated staging
  smoke/cleanup evidence remain outstanding, so Phase 1 route wiring can proceed
  but the remaining backend gap register is not closed.
- Frontend session strategy is in place: NextAuth remains the app session layer and stores public API tokens on `session.publicApi`.
- Auth/profile/logout are migrated:
  - Login attempts public API auth when enabled, with existing local/demo fallback preserved.
  - Sign-up calls `/api/v1/auth/signup`, then establishes the normal NextAuth/public-token session.
  - Logout calls public API logout when a token exists, then continues local signout.
  - Profile status reads public API profile state from the session token.
  - Forgot/reset password forms call `/api/v1/auth/reset-password` and
    `/api/v1/auth/set-password`.
- Lead list index is migrated for Phase 1:
  - Saved lead lists load from `/api/v1/lead-lists`.
  - Cashbuyer rows load from `/api/v1/cashbuyers` with prospecting fallback.
  - Fixture fallback remains only for missing token, empty data, or failed calls.
- Credits/usage is migrated:
  - Usage modal reads `/api/v1/credits/balance` when a token exists.
  - Usage details read `/api/v1/credits/history`, `/api/v1/credits/stats`, and `/api/v1/credits/expiring`.
- Campaigns are migrated for Phase 1 list/create/status:
  - Launch modal creates campaigns through `/api/v1/campaigns/`.
  - Campaign table loads `/api/v1/campaigns` when a token exists.
  - Local campaign IDs are mapped to returned public campaign IDs.
  - Selected campaign status polls `/api/v1/campaigns/{campaign_id}/status`.
  - Update/cancel/delete wrappers exist; UI action replacement remains guarded by
    current table ownership and BE-22 fixture coverage.
- Admin users are partially migrated:
  - `/admin/users` search uses `/api/v1/admin/users/search` with fallback directory data.
  - Credit adjustment uses `/api/v1/admin/users/{user_id}/adjust-credits`.
  - Retry provisioning uses `/api/v1/admin/users/{user_id}/retry-provisioning`.
  - User activity reads `/api/v1/admin/users/{user_id}/logs` with fixture fallback.
  - Public impersonation remains blocked on session/token handoff semantics.
- Team/employee pages are partially migrated:
  - `/dashboard/employee` reads `/api/v1/team/members` when a token exists.
  - Invite modal and standalone invite route send the documented email/role payload.
  - Organization settings, invitation list, activity, member delete, and role update are wired.
  - `/accept-invite?token=...` accepts invitation tokens for existing or new users.
  - Member identity fields and permission editing remain backend-contract blocked.
- Payments are partially migrated:
  - Usage and upgrade modals read live tiers from `/api/v1/payments/pricing/tiers`.
  - Custom credit purchases create Stripe checkout sessions through `/api/v1/payments/checkout`.
  - Checkout redirects only when the API returns a valid HTTPS session URL.
  - Legacy `/api/plans` and `/api/payments/session` probes were removed from
    plan/payment helpers.
  - Subscription/cart checkout remains pending until cart ownership and product semantics are confirmed.
- Backend handoff for unresolved contracts: [public-api-backend-gap-handoff-2026-06-29.md](./public-api-backend-gap-handoff-2026-06-29.md)

## Current remaining gaps

These are the current blockers after the latest frontend commits:

| Gap | Status | Current blocker | Frontend behavior until resolved |
| --- | --- | --- | --- |
| `BE-05` Admin user detail | blocked_backend_contract | No dedicated `GET /api/v1/admin/users/{user_id}` detail contract. Search results are not reliable detail payloads. | Admin detail views keep fallback directory data and only overlay logs/actions that have public wrappers. |
| `BE-06` Admin lifecycle actions | partial | Credit adjustment, provisioning retry, logs, and reset-email request are wired. Ban/suspend/edit/access/reset-password-as-admin-specific-action support is not defined. | Unsupported actions remain guarded or use existing UI fallback; no fake successful mutations should be added. |
| `BE-07` Admin impersonation | blocked_backend_contract | Impersonation token/session exchange into NextAuth and restore behavior are undefined. | Public impersonation endpoints are wrapped but not installed into the browser session. |
| `BE-08` Team member identity | blocked_backend_contract | `TeamMemberPublic` lacks dependable email/display name fields for table/detail rendering. | Team pages use public role/status where available with fallback identity data. |
| `BE-09` Team permissions/profile mutation | blocked_backend_contract | Backend must either confirm role/status-only scope or expose typed profile/permission fields. | Employee edit UI only sends supported role/status fields. |
| `BE-10` Team invitation lifecycle | partial | Invite create/list/accept are wired; resend/revoke ownership and status transitions are not confirmed. | Invitation management is limited to documented create/list/accept operations. |
| `BE-11` Subscription/cart ownership | blocked_backend_contract | Subscription SKUs, cart merge/replace behavior, billing portal ownership, and checkout terminal states are undefined. | Custom credit checkout uses `/payments/checkout`; subscription/cart UI stays static or external-pricing only. |
| `BE-12` Password reset delivery/security | frontend_wired_backend_verification_needed | Frontend calls reset/set endpoints. Backend still needs production email URL shape, token TTL/single-use, anti-enumeration, rate limits, and session invalidation evidence. | Forgot/reset/admin reset-email UI calls public API and surfaces stable errors. |
| `BE-13` Dashboard analytics | blocked_product_mapping | No metric catalog mapping dashboard/charts cards to public analytics keys and response examples. | Aggregate cards/charts remain local/fallback unless already covered by team activity or credits wrappers. |
| `BE-14` Messaging ownership | blocked_product_mapping | Provider-specific Twilio/Sendblue/direct-mail/VAPI operations are not mapped to canonical product actions and schemas. | Messaging UI should not be treated as fully public-API-backed. |
| `BE-15` Enrichment ownership | blocked_product_mapping | Enrichment tool-to-screen map, sync/async behavior, normalized result/job models, and credit usage are not finalized. | Enrichment surfaces remain blocked from production-safe wiring beyond controlled error handling. |
| `BE-16` Credentials/integrations | blocked_product_mapping | Provider catalog/status, credential CRUD, GHL calendar reconnect/disconnect, and safe display models are not assigned to current UI. | Provider unavailable/configuration states are handled; connection lifecycle remains blocked. |
| `BE-17` VAPI/voice contracts | blocked_backend_contract | VAPI/voice models are still generic/provider-shaped instead of typed frontend resources. | Voice/agent UI stays on existing provider/local flows until typed contracts land. |
| `BE-18` Webhooks/feeds | blocked_backend_contract | No canonical CRUD/test/delivery-log contract for current connections UI. | Webhook/feed management remains outside the completed public API migration. |
| `BE-19` Deal room / kanban | blocked_backend_contract | Backend ownership and deal/board/card/concurrency contracts are not defined. | Deal room and kanban remain local/store-backed. |
| `BE-20` Quickstart orchestration | partial | Profile, prospecting, and campaign pieces are wired, but durable cross-step IDs/resume state are not fully defined. | Quickstart can use wired downstream adapters but should not claim server-backed orchestration completion. |
| `BE-21` Contract consistency | ongoing_backend_requirement | Pagination, envelopes, enum casing, idempotency, timestamps, and success envelopes still need consistent enforcement across future endpoints. | Frontend adapters normalize common variants and branch on stable `error.code`. |
| `BE-22` Authenticated fixtures | blocked_backend_contract | Persona fixture matrix and authenticated staging smoke/cleanup evidence remain outstanding. | Fallback/error states stay in migrated screens; CI cannot assert every success-path UI contract yet. |
| `BE-23` Profile/settings persistence | blocked_backend_contract | Profile/setup endpoint does not yet cover full personal, business, settings, OAuth, and notification preferences. | Profile status is wired; broader settings persistence remains local/fallback. |
| `BE-24` Account security/privacy | blocked_backend_contract | Session list/revoke, security activity, data export, account deletion, and privacy flows are not defined. | Security/privacy UI should remain disabled/fallback until contracts exist. |
| `BE-25` Saved user assets | blocked_backend_contract | Saved searches, campaign templates, and workflows need scoped CRUD/versioning contracts. | Existing asset experiences remain local/store-backed. |
| `BE-26` Knowledge assets | blocked_backend_contract | Upload/list/status/delete contracts, storage limits, processing states, and provider linkage are missing. | Knowledge/script/voice asset managers remain local/provider-specific. |
| `BE-27` Notifications/preferences | blocked_backend_contract | Notification feed/read state and delivery preference contracts are not defined. | Notification center/preferences remain local/fallback. |

## Implementation plan

- [x] Create public API auth/profile/prospecting wrappers.
- [x] Keep NextAuth as the app session layer while storing public API tokens in the session.
- [x] Call public API logout before local NextAuth signout when a token exists.
- [x] Wire forgot/reset password screens to `/api/v1/auth/reset-password` and `/api/v1/auth/set-password`.
- [x] Replace manual profile API credential entry with session-backed profile sync.
- [x] Add cashbuyer/prospecting source discovery with fixture fallback.
- [x] Wire Phase 1 cashbuyer endpoint with prospecting fallback.
- [x] Wire Phase 1 saved lead-list, lead-list slug, and lead-detail contracts.
- [x] Wire Phase 1 property-detail contract with existing fallback.
- [x] Add shared wrappers for credits, campaigns, team, admin users, payments, and cart.
- [x] Wire credits/usage UI to `credits` wrappers with fallback data.
- [x] Wire credit history, statistics, and expiring-credit UI.
- [x] Wire campaign launch modal to `campaigns` create wrapper with local fallback.
- [x] Wire campaign list/detail/update/cancel/status wrappers for Phase 1.
- [x] Add public API campaign status polling for selected campaign IDs with local-to-public ID mapping.
- [x] Wire admin user search, credit adjustment, and retry provisioning to `admin/users` wrappers with fallback data.
- [x] Wire admin user logs to `admin/users` wrappers with fallback data.
- [ ] Wire public impersonation session handling after the backend defines token/session ownership.
- [x] Wire employee/team list, invite, and edit save to `team` wrappers with fallback data.
- [x] Wire team organization settings, invite list, invite acceptance, delete member, and activity UI.
- [ ] Wire team identity/profile and permission editing after those fields are exposed by the backend.
- [x] Wire custom credit pricing and secure checkout to `payments` wrappers.
- [ ] Wire subscription products and cart lifecycle UI to `cart` wrappers.
- [ ] Wire messaging, enrichment, integrations, and VAPI surfaces after endpoint-to-screen ownership and configured-provider prerequisites are confirmed.

## Current status by API area

| Area / route | Current frontend source | Target public API | Status | Next action |
| --- | --- | --- | --- | --- |
| Login / signup / password reset | NextAuth session UI with public API token bridge | `/api/v1/auth/login`, `/api/v1/auth/signup`, `/api/v1/auth/reset-password`, `/api/v1/auth/set-password` | done | Login, signup, forgot-password, reset-password, and admin reset email requests use the public API while NextAuth remains the browser session owner. Backend delivery/security evidence remains tracked under BE-12. |
| Logout | NextAuth `signOut` | `/api/v1/auth/logout` | partial | Public API logout runs when a session token exists, then local signout continues. |
| Profile status | Manual public API token prompt | `/api/v1/auth/me`, `/api/v1/auth/profile-setup` | done | Uses session-backed public API token. |
| Lead list index | Public API rows with fixture fallback | `/api/v1/lead-lists`, `/api/v1/lead-lists/{list_id}/leads` | phase1_wired | Saved lead-list rows and lead-list slug hydrate from Phase 1 contracts when a token exists. |
| Cashbuyers | Public API cashbuyer row with fallback | `/api/v1/cashbuyers`, `/api/v1/cashbuyers/{id}` | phase1_wired | Cashbuyer list loading uses the dedicated Phase 1 endpoint first and prospecting fallback second. |
| Lead detail | Public API lead detail with local fallback | `/api/v1/leads/{lead_id}` | phase1_wired | Individual lead slugs attempt public API lead detail after local fixture lookup. |
| Property detail | Public API property detail with mock fallback | `/api/v1/properties/{property_id}` | phase1_wired | Property detail route and client refresh use the Phase 1 property contract; local mock fallback remains for missing token, empty data, or failed calls. |
| Campaigns | Public API campaign list/create/status overlay | `/api/v1/campaigns`, `/api/v1/campaigns/{campaign_id}`, `/api/v1/campaigns/{campaign_id}/status` | phase1_wired | List/create/status are consumed; update/cancel/delete wrappers are ready for table action replacement after BE-22 fixture coverage. |
| Credits / usage | Public API balance, stats, history, and expiration data | `/api/v1/credits/*` | done | Confirmed read surfaces are wired in the usage modal. |
| Admin users | Public API search/action/log overlays with mock fallback | `/api/v1/admin/users/*` | partial | Search, logs, adjust credits, and retry provisioning are wired; public impersonation is session-contract blocked. |
| Team | Public API organization/member/invitation/activity UI | `/api/v1/team/*` | partial | Confirmed operations are wired; member list lacks identity fields and update supports only role/status. |
| Payments / cart | Public API custom-credit checkout and pricing tiers | `/api/v1/payments/*`, `/api/v1/cart*` | partial | Credit tiers, plan helper pricing, and checkout are live through public API payment wrappers; subscription products, cart state, and billing management remain pending. |
| Messaging | Provider-specific local flows and placeholders | `/api/v1/messaging/*`, `/api/v1/twilio/*`, `/api/v1/sendblue/*` | blocked_product_mapping | Backend must confirm which endpoint owns each chat/campaign action and provider prerequisites. |
| Enrichment | Tool-specific UI and fixtures | `/api/v1/enrich/*` | blocked_product_mapping | Backend/product must map enrichment operations to existing tool surfaces and configured-provider requirements. |
| Integrations | Connection UI and provider status cards | `/api/v1/integrations/ghl/calendar/*`, `/api/v1/credentials/*` | blocked_product_mapping | Shared provider error handling exists; canonical connection/status operations are not assigned to the current webhook-oriented UI. |
| VAPI / voice | Mixed VAPI constants and local routes | `/api/v1/vapi/*`, `/api/v1/voice/clone` | blocked_product_mapping | Backend/product must define which public operations replace current local health, agent, and voice flows. |

## Route / slug checklist

| App route | API area | Status | Notes |
| --- | --- | --- | --- |
| `/dashboard` | aggregate/profile/activity/credits | partial | Usage modal uses balance, history, stats, and expiring-credit APIs; unrelated aggregate cards still need endpoint ownership. |
| `/dashboard/profile` | auth/profile | done | Profile status uses session public API token. |
| `/forgot-password` | auth/password reset | done | Sends reset email requests through `/api/v1/auth/reset-password`. |
| `/reset-password` | auth/password reset | done | Completes reset tokens through `/api/v1/auth/set-password`. |
| `/dashboard/lead-list` | prospecting/cashbuyers | phase1_wired | Loads `/api/v1/lead-lists` plus `/api/v1/cashbuyers` when authenticated; fallback rows remain for empty/error states. |
| `/dashboard/lead-list/[leadId]` | lead lists | phase1_wired | Hydrates from `/api/v1/lead-lists/{list_id}` and `/api/v1/lead-lists/{list_id}/leads`, with local fallback. |
| `/dashboard/lead-list/[leadId]/lead/[individualLeadId]` | lead detail | phase1_wired | Resolves local lead first, then `/api/v1/leads/{lead_id}` plus list context. |
| `/dashboard/lead` | prospecting/leads | partial | Phase 1 lead detail is wired through lead-list slugs; standalone lead search route still needs product route ownership. |
| `/dashboard/lead/[leadId]` | prospecting/leads | partial | Lead detail contract is available, but this standalone slug is not the currently used lead-list navigation path. |
| `/dashboard/campaigns` | campaigns | phase1_wired | Loads campaign list, creates campaigns, and polls selected campaign status through public API. |
| `/dashboard/employee` | team workspace | partial | Organization, members, invitations, activity, and delete are wired; display identity is backend blocked. |
| `/dashboard/employee/invite` | team invites | done | Sends only documented email, role, and expiry fields. |
| `/dashboard/employee/[employeeId]` | team members | partial | Role update is wired; profile and permissions are not present in the update contract. |
| `/accept-invite` | team invitations | done | Accepts the emailed `token` query value and optional new-account name/password. |
| `/dashboard/connections` | integrations/credentials | blocked_product_mapping | Current page owns webhooks/feeds; canonical public connection operations are not assigned. |
| `/dashboard/agents` | VAPI/AI | blocked_product_mapping | Needs VAPI/provider operation ownership. |
| `/dashboard/charts` | analytics/team activity | blocked_product_mapping | Team activity is wired on the employee page; no public analytics contract is assigned to this route. |
| `/dashboard/chat` | messaging/AI | blocked_product_mapping | Needs endpoint and provider selection. |
| `/dashboard/deal-room` | no public contract identified | blocked_backend_contract | Track once backend exposes deal-room API. |
| `/dashboard/deal-room/[dealId]` | no public contract identified | blocked_backend_contract | Track once backend exposes deal detail API. |
| `/dashboard/kanban` | no public contract identified | blocked_backend_contract | Current board appears local/store-backed. |
| `/dashboard/market` | prospecting/market leads | fallback_mock | Route currently renders the market-leads experience; it is not the payment catalog surface. |
| `/dashboard/properties/[propertyId]` | property detail | phase1_wired | Uses `/api/v1/properties/{property_id}` when authenticated, including client refresh; local mock remains for missing token, empty data, or failed calls. |
| `/dashboard/quickstart` | auth/profile/campaigns/prospecting | partial | Depends on profile and downstream lead/campaign adapters. |
| `/dashboard/resources` | static/resources | not_applicable | Static resource route does not require a public API contract. |
| `/admin` | admin/users | partial | Roadmap page only; no live API call required yet. |
| `/admin/users` | admin/users/search/actions | partial | Search, credit adjustment, and retry provisioning call public API with token; fallback directory remains. |
| `/admin/users/[id]` | admin/users/logs/actions | partial | Credit adjustment and logs call the public API; impersonation remains session-contract blocked. |
| `/external-tools` | public/static | not_applicable | Anonymous static tools do not require API migration. |
| `/external-tools/calculators` | public/static | not_applicable | Remains anonymous-safe without persistence. |
| `/external-tools/calculators/roi` | public/static/profile | not_applicable | Calculator remains local; optional persistence would require a future contract. |

Status values:

- `done`: frontend route uses the public API path for the intended behavior.
- `phase1_wired`: route consumes the completed Phase 1/core-resource contract
  and keeps fallback behavior for missing token, empty data, or BE-22 fixture gaps.
- `partial`: public API path is wired, but fallback or adjacent UI work remains.
- `fallback_mock`: public API call exists but runtime is using mock data due missing token/config.
- `blocked_backend_contract`: frontend cannot complete without a clarified or new backend contract.
- `blocked_product_mapping`: endpoints exist, but the owning screen/action or provider prerequisite is not defined.
- `not_started`: no production public API wiring yet.
- `not_applicable`: the route is intentionally static/local and has no migration requirement.

## Latest validation

- Phase 1 core-resource Vitest run: `20/20` passed.
  - `_tests/api/public-api-core-resources.test.ts`
  - `_tests/api/public-api-campaign-launch.test.ts`
  - `_tests/api/public-api-dashboard.test.ts`
  - `_tests/hooks/usePublicApiCampaignStatus.test.tsx`
- TypeScript: `node_modules/.bin/tsc --noEmit` passed.
- Focused auth/credits/admin/team/payments/dashboard Vitest run: `30/30` passed.
- TypeScript: `pnpm typecheck` passed.
- Production API baseline remains `173/173` from the completed full smoke run.
- Phase 2 password reset wiring: `_tests/api/public-api-client.test.ts`
  `14/14` passed.

## Remaining frontend boundary

No additional production-safe wiring can be completed without one of:

- a missing list/detail or identity response contract,
- a decision about which app surface owns a public API operation,
- a backend-to-NextAuth session exchange contract,
- or configured provider behavior suitable for an end-user UI.

Those items are maintained in the linked backend handoff rather than represented
as hidden TODO behavior or fake successful mutations.
