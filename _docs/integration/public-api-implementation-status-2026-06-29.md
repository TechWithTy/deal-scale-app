# Public API Implementation Status - 2026-06-29

This file tracks frontend migration from local fixtures, demo stores, and local
Next.js API routes to the deployed Deal Scale public API.

## Current progress snapshot

Last updated: 2026-08-06

- Matrix v13 completed after production backend deployment: `104/104` passed,
  `0` failed, `0` skipped, `cleanup_failed: 0`.
- Production backend deploy run `31128423643` succeeded and production health
  passed.
- Backend docs were reconciled in commit `324881c`; no backend deploy is needed
  for that documentation-only commit.
- Backend BE endpoint work is no longer the active blocker. Remaining work is
  frontend wiring/session bridging, provider operations/configuration, and
  future product evolution.
- Earlier public API full smoke rerun completed against production:
  `173/173` passed.
- Backend Phase 1/core-resource handoff received for BE-01 through BE-04.
  Frontend route wiring is now proceeding against those completed contracts.
- Staging BE-22 authenticated smoke/cleanup evidence is now available and
  passed against backend commit `777d322`.
- Frontend full public API E2E against staging passed `173/173` with `0`
  skipped operations against `https://staging.api.dealscale.io`.
- Backend release evidence:
  - Latest merge: `b7c807c5843184b1aa3e981ec295e803c684eab0`
  - Latest master workflow passed, including production blue/green cutover.
  - Production health smoke passed: `https://api.dealscale.io/api/v1/health`
  - Phase 1 OpenAPI updates are documented and merged.
  - `check_if_email_exists` / Reacher operations docs are merged and deployed.
- Caveat: BE-22 staging smoke is no longer a blocker, and the remaining work
  should not be reported as missing backend BE endpoint work unless a new
  product scope reopens it.
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
    current table action ownership and user-flow mapping.
- Admin users are partially migrated:
  - `/admin/users` search uses `/api/v1/admin/users/search` with fallback directory data.
  - `/admin/users/{id}` detail uses `/api/v1/admin/users/{user_id}` with fallback directory data for legacy-only fields.
  - Credit adjustment uses `/api/v1/admin/users/{user_id}/adjust-credits`.
  - Retry provisioning uses `/api/v1/admin/users/{user_id}/retry-provisioning`.
  - User activity reads `/api/v1/admin/users/{user_id}/logs` with fixture fallback.
  - Public impersonation remains pending on frontend NextAuth exchange/restore
    route handlers.
- Team/employee pages are partially migrated:
  - `/dashboard/employee` reads `/api/v1/team/members` when a token exists.
  - Invite modal and standalone invite route send the documented email/role payload.
  - Organization settings, invitation list, activity, member delete, and role update are wired.
  - `/accept-invite?token=...` accepts invitation tokens for existing or new users.
  - Remaining team profile/permission work is frontend wiring for delivered
    fields or future product evolution for richer permissions.
- Payments are partially migrated:
  - Usage and upgrade modals read live tiers from `/api/v1/payments/pricing/tiers`.
  - Custom credit purchases create Stripe checkout sessions through `/api/v1/payments/checkout`.
  - Checkout redirects only when the API returns a valid HTTPS session URL.
  - Legacy `/api/plans` and `/api/payments/session` probes were removed from
    plan/payment helpers.
  - Subscription/cart checkout now loads the live product catalog, manages cart
    line items, and redirects only to a valid HTTPS checkout URL.
- Account security is migrated:
  - API key scope/list/create/revoke uses `/api/v1/api-keys/*` with the session
    JWT.
  - Raw keys are only shown immediately after creation.
  - Session list/revoke, revoke-all-other-sessions, security activity, data
    export requests, and account deletion requests use the public API.
  - Account deletion is an asynchronous request contract, not immediate hard
    deletion.
- Saved user assets are migrated with local fallback:
  - Saved searches use `/api/v1/saved-searches`.
  - Campaign templates use `/api/v1/campaign-templates`.
  - Workflow templates use `/api/v1/workflow-templates`.
  - Frontend records returned backend versions so deletes can send the
    required `?version=` query.
- Notifications are migrated with local fallback:
  - Header notification feed hydrates from `/api/v1/notifications`.
  - Opening the dropdown marks feed rows read through
    `/api/v1/notifications/read-all`.
  - Profile notification delivery preferences read and update through
    `/api/v1/notification-preferences` with version-aware updates.
- Knowledge asset lifecycle client is wrapped:
  - List/create/detail/update/process/delete use `/api/v1/knowledge-assets`.
  - Versioned update/process/delete semantics are represented in the frontend
    client.
  - Rich editor payloads and audio/file bytes remain local until upload storage
    and signed download URLs are configured end to end.
- Reconciled backend gap handoff and remaining non-backend work:
  [public-api-backend-gap-handoff-2026-06-29.md](./public-api-backend-gap-handoff-2026-06-29.md)

## Current remaining gaps

These are the current non-backend blockers after backend Matrix v13 closure:

| Gap | Status | Current blocker | Frontend behavior until resolved |
| --- | --- | --- | --- |
| `BE-05` Admin user detail | phase2_wired | Dedicated `GET /api/v1/admin/users/{user_id}` detail contract is available and wired into the admin detail page/modal. | Live detail overlays identity, status, role, credit balances, tester flags, subscription tier, and scopes while retaining fallback data for legacy-only permission matrix/quota fields. |
| `BE-06` Admin lifecycle actions | partial | Credit adjustment, provisioning retry, logs, and reset-email request are wired. Ban/suspend/edit/access/reset-password-as-admin-specific-action support is not defined. | Unsupported actions remain guarded or use existing UI fallback; no fake successful mutations should be added. |
| `BE-07` Admin impersonation | phase2_wired | NextAuth exchange and restore handlers install the target token, retain original admin state in the JWT, reject nesting, and restore on explicit stop or detected expiry. | Live admin surfaces use the public API bridge; an authenticated browser smoke remains release validation work. |
| `BE-08` Team member identity | frontend_wiring_pending | Backend BE endpoint work is closed for current scope; frontend should wire delivered identity fields where present. | Team pages use public role/status where available with fallback identity data until identity wiring is complete. |
| `BE-09` Team permissions/profile mutation | future_product_evolution | Current supported update scope should be treated as final unless richer permission editing is reopened by product. | Employee edit UI only sends supported role/status/profile fields and must not fake unsupported permission mutations. |
| `BE-10` Team invitation lifecycle | partial | Invite create/list/accept are wired; resend/revoke ownership and status transitions are not confirmed. | Invitation management is limited to documented create/list/accept operations. |
| `BE-11` Subscription/cart ownership | phase2_wired | Upgrade UI consumes the cart catalog, cart lifecycle, and secure checkout response. | Legacy static pricing remains supplemental; cart mutations are available only for authenticated public API sessions. |
| `BE-12` Password reset delivery/security | ops_verification_pending | Frontend calls reset/set endpoints; remaining work is production email/security verification and observability. | Forgot/reset/admin reset-email UI calls public API and surfaces stable errors. |
| `BE-13` Dashboard analytics | frontend_wiring_pending | Backend BE endpoint work is closed for current scope; frontend still needs metric-to-screen adapter wiring. | Aggregate cards/charts remain local/fallback unless already covered by team activity or credits wrappers. |
| `BE-14` Messaging ownership | provider_config_pending | Backend BE endpoint work is closed for current scope; real Twilio/SendBlue/direct-mail/VAPI success paths need provider configuration and frontend action mapping. | Messaging UI should not be treated as fully public-API-backed until provider-backed flows are configured and wired. |
| `BE-15` Enrichment ownership | provider_config_pending | Backend BE endpoint work is closed for current scope; enrichment success paths need provider configuration and frontend adapters. | Enrichment surfaces remain guarded beyond controlled error handling until configured. |
| `BE-16` Credentials/integrations | provider_config_pending | Backend BE endpoint work is closed for current scope; remaining work is frontend connection lifecycle mapping and provider configuration. | Provider unavailable/configuration states are handled; connection lifecycle remains guarded. |
| `BE-17` VAPI/voice contracts | provider_config_pending | Backend BE endpoint work is closed for current scope; remaining work is frontend adapter wiring plus VAPI/voice provider configuration. | Voice/agent UI stays on existing provider/local flows until configured. |
| `BE-18` Webhooks/feeds | future_product_evolution | Current backend BE endpoint work is closed; richer webhook/feed CRUD/test/log behavior is future product scope unless reopened. | Webhook/feed management remains outside the completed public API migration. |
| `BE-19` Deal room / kanban | future_product_evolution | Current backend BE endpoint work is closed; persisted deal-room/kanban behavior is future product scope unless reopened. | Deal room and kanban remain local/store-backed. |
| `BE-20` Quickstart orchestration | frontend_wiring_pending | Backend BE endpoint work is closed for current scope; frontend still needs cross-step wiring and any future durable resume-state product evolution. | Quickstart can use wired downstream adapters but should not claim richer server-backed orchestration until frontend/product scope is complete. |
| `BE-21` Contract consistency | current_matrix_verified | Matrix v13 passed current contract scope; consistency remains a standing requirement for future endpoint families. | Frontend adapters normalize common variants and branch on stable `error.code`. |
| `BE-22` Authenticated fixtures | current_matrix_verified | Matrix v13 passed `104/104` with cleanup success after production deploy; prior staging BE-22 smoke also passed. | Keep normal fallback/error states, but do not treat BE-22 as an active blocker for already-confirmed wiring. |
| `BE-23` Profile/settings persistence | frontend_wiring_pending | Backend BE endpoint work is closed for current scope; frontend still needs settings/profile adapter wiring for delivered fields. | Profile status is wired; broader settings persistence remains local/fallback until frontend wiring is complete. |
| `BE-24` Account security/privacy | delivered | API key management, session list/revoke, revoke-all-other-sessions, security activity, data export requests, and account deletion requests are wired to the public API. | Account deletion is an asynchronous request contract with pending verification and scheduled processing, not immediate hard deletion. |
| `BE-25` Saved user assets | phase2_wired | Saved searches, campaign templates, and workflow templates are wired to scoped CRUD/versioning endpoints. | Stores update local UI immediately, mirror mutations to public API when a session token exists, hydrate on session startup, and retain local fallback for missing token or API failure. |
| `BE-26` Knowledge assets | provider_config_pending | Metadata lifecycle endpoints are wrapped, including list/create/detail/update/process/delete and versioned deletes. Remaining work is provider/storage configuration and richer frontend text/audio/file persistence. | Knowledge/script/voice asset managers can use the lifecycle client, but full content/audio persistence remains local until upload/download storage is configured. |
| `BE-27` Notifications/preferences | phase2_wired | Notification feed, unread/read state, and delivery preference contracts are wrapped; header dropdown consumes feed/read-all. | Header notifications hydrate from public API when a session token exists; local demo fallback remains for missing token or API failure. |

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
- [x] Wire admin user detail and logs to `admin/users` wrappers with fallback data.
- [x] Wire public impersonation exchange/restore through NextAuth, including JWT-backed restore state and expiry handling.
- [x] Wire employee/team list, invite, and edit save to `team` wrappers with fallback data.
- [x] Wire team organization settings, invite list, invite acceptance, delete member, and activity UI.
- [ ] Wire team identity/profile and permission editing after those fields are exposed by the backend.
- [x] Wire custom credit pricing and secure checkout to `payments` wrappers.
- [x] Wire security API key scopes/list/create/revoke to `api-keys` wrappers.
- [x] Wire account session, security activity, data export, and async account deletion surfaces.
- [x] Wire saved searches, campaign templates, and workflow templates to BE-25 saved-asset endpoints.
- [x] Add BE-26 knowledge asset lifecycle wrappers.
- [x] Wire notification feed/read state and profile preference UI to BE-27 endpoints.
- [x] Wire subscription products and cart lifecycle UI to `cart` wrappers.
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
| Admin users | Public API search/detail/action/log/impersonation overlays | `/api/v1/admin/users/*` | phase2_wired | Search, detail, logs, credit adjustment, provisioning retry, and public API-backed NextAuth impersonation are wired. |
| Team | Public API organization/member/invitation/activity UI | `/api/v1/team/*` | partial | Confirmed operations are wired; member list lacks identity fields and update supports only role/status. |
| Payments / cart | Public API pricing, cart catalog, cart lifecycle, and checkout | `/api/v1/payments/*`, `/api/v1/cart*` | phase2_wired | Custom credits and cart products use live checkout only when the API returns a valid HTTPS payment URL. |
| Security API keys | Public API scopes/list/create/revoke with no mock secrets | `/api/v1/api-keys/scopes`, `/api/v1/api-keys/`, `/api/v1/api-keys/{key_id}` | done | Security API Keys tab uses session JWT auth; full key material is displayed/copyable only immediately after creation. |
| Saved user assets | Local saved-asset stores with public API mirror and startup hydration | `/api/v1/saved-searches`, `/api/v1/campaign-templates`, `/api/v1/workflow-templates` | phase2_wired | Create/update/delete calls mirror to BE-25 endpoints when a session token exists; returned versions are stored for versioned deletes, and local fallback remains for missing token or failed calls. |
| Knowledge assets | Public API lifecycle client with local manager fallback | `/api/v1/knowledge-assets`, `/api/v1/knowledge-assets/{asset_id}/process`, `/api/v1/knowledge-assets/{asset_id}/download-url` | partial | Metadata lifecycle wrappers exist for BE-26. Rich sales-script text, audio bytes, and signed download URLs are not treated as fully persisted until provider storage is configured. |
| Notifications | Header feed plus profile delivery preferences | `/api/v1/notifications`, `/api/v1/notifications/read-all`, `/api/v1/notification-preferences` | phase2_wired | Dropdown hydrates feed rows from public API and marks all read on open; profile toggles persist in-app, email, and SMS delivery preferences with optimistic-version input. |
| Messaging | Provider-specific local flows and placeholders | `/api/v1/messaging/*`, `/api/v1/twilio/*`, `/api/v1/sendblue/*` | provider_config_pending | Remaining work is frontend action mapping plus real provider configuration for success paths. |
| Enrichment | Tool-specific UI and fixtures | `/api/v1/enrich/*` | provider_config_pending | Remaining work is frontend adapter wiring plus enrichment provider configuration for success paths. |
| Integrations | Connection UI and provider status cards | `/api/v1/integrations/ghl/calendar/*`, `/api/v1/credentials/*` | provider_config_pending | Shared provider error handling exists; remaining work is frontend connection lifecycle mapping and provider configuration. |
| VAPI / voice | Mixed VAPI constants and local routes | `/api/v1/vapi/*`, `/api/v1/voice/clone` | provider_config_pending | Remaining work is frontend adapter wiring plus VAPI/voice provider configuration. |

## Route / slug checklist

| App route | API area | Status | Notes |
| --- | --- | --- | --- |
| `/dashboard` | aggregate/profile/activity/credits | partial | Usage modal uses balance, history, stats, and expiring-credit APIs; unrelated aggregate cards still need endpoint ownership. |
| `/dashboard/profile` | auth/profile | done | Profile status uses session public API token. |
| Security modal API Keys tab | account/security | done | Lists scopes and keys, creates keys, and revokes keys through `/api/v1/api-keys/*` with the session public API token. |
| `/forgot-password` | auth/password reset | done | Sends reset email requests through `/api/v1/auth/reset-password`. |
| `/reset-password` | auth/password reset | done | Completes reset tokens through `/api/v1/auth/set-password`. |
| `/dashboard/lead-list` | prospecting/cashbuyers | phase1_wired | Loads `/api/v1/lead-lists` plus `/api/v1/cashbuyers` when authenticated; fallback rows remain for empty/error states. |
| `/dashboard/lead-list/[leadId]` | lead lists | phase1_wired | Hydrates from `/api/v1/lead-lists/{list_id}` and `/api/v1/lead-lists/{list_id}/leads`, with local fallback. |
| `/dashboard/lead-list/[leadId]/lead/[individualLeadId]` | lead detail | phase1_wired | Resolves local lead first, then `/api/v1/leads/{lead_id}` plus list context. |
| `/dashboard/lead` | prospecting/leads | partial | Phase 1 lead detail is wired through lead-list slugs; standalone lead search route still needs product route ownership. |
| `/dashboard/lead/[leadId]` | prospecting/leads | partial | Lead detail contract is available, but this standalone slug is not the currently used lead-list navigation path. |
| `/dashboard/campaigns` | campaigns | phase1_wired | Loads campaign list, creates campaigns, and polls selected campaign status through public API. |
| `/dashboard/employee` | team workspace | partial | Organization, members, invitations, activity, and delete are wired; remaining identity/profile work is frontend wiring for delivered fields. |
| `/dashboard/employee/invite` | team invites | done | Sends only documented email, role, and expiry fields. |
| `/dashboard/employee/[employeeId]` | team members | partial | Role update is wired; profile and permissions are not present in the update contract. |
| `/accept-invite` | team invitations | done | Accepts the emailed `token` query value and optional new-account name/password. |
| `/dashboard/connections` | integrations/credentials | provider_config_pending | Current page owns webhooks/feeds; remaining work is frontend mapping and provider configuration. |
| `/dashboard/agents` | VAPI/AI | provider_config_pending | Needs frontend VAPI/provider adapter wiring and provider configuration. |
| `/dashboard/charts` | analytics/team activity | frontend_wiring_pending | Team activity is wired on the employee page; remaining analytics work is metric-to-screen adapter wiring. |
| `/dashboard/chat` | messaging/AI | provider_config_pending | Needs frontend action mapping and provider configuration. |
| `/dashboard/deal-room` | future_product_evolution | Current route remains local/store-backed unless persisted deal-room product scope is reopened. |
| `/dashboard/deal-room/[dealId]` | future_product_evolution | Current route remains local/store-backed unless persisted deal detail scope is reopened. |
| `/dashboard/kanban` | future_product_evolution | Current board appears local/store-backed unless persisted kanban scope is reopened. |
| `/dashboard/market` | prospecting/market leads | fallback_mock | Route currently renders the market-leads experience; it is not the payment catalog surface. |
| `/dashboard/properties/[propertyId]` | property detail | phase1_wired | Uses `/api/v1/properties/{property_id}` when authenticated, including client refresh; local mock remains for missing token, empty data, or failed calls. |
| `/dashboard/quickstart` | auth/profile/campaigns/prospecting | partial | Depends on profile and downstream lead/campaign adapters. |
| `/dashboard/resources` | static/resources | not_applicable | Static resource route does not require a public API contract. |
| `/admin` | admin/users | partial | Roadmap page only; no live API call required yet. |
| `/admin/users` | admin/users/search/actions | partial | Search, credit adjustment, and retry provisioning call public API with token; fallback directory remains. |
| `/admin/users/[id]` | admin/users/detail/logs/actions | partial | Detail, credit adjustment, and logs call the public API; impersonation still needs the frontend NextAuth exchange/restore bridge. |
| `/external-tools` | public/static | not_applicable | Anonymous static tools do not require API migration. |
| `/external-tools/calculators` | public/static | not_applicable | Remains anonymous-safe without persistence. |
| `/external-tools/calculators/roi` | public/static/profile | not_applicable | Calculator remains local; optional persistence would require a future contract. |

Status values:

- `done`: frontend route uses the public API path for the intended behavior.
- `phase1_wired`: route consumes the completed Phase 1/core-resource contract
  and keeps fallback behavior for missing token, empty data, or endpoint-specific
  fixture gaps.
- `phase2_wired`: route or store consumes a later backend contract and keeps
  fallback behavior for missing token, empty data, or endpoint-specific failures.
- `partial`: public API path is wired, but fallback or adjacent UI work remains.
- `fallback_mock`: public API call exists but runtime is using mock data due missing token/config.
- `frontend_bridge_pending`: backend contract exists, but a frontend session,
  route, or state bridge still needs to be implemented before the surface can be
  considered delivered.
- `frontend_wiring_pending`: backend BE endpoint work is closed for the current
  scope, but the frontend still needs adapters, route wiring, or state/store
  integration.
- `provider_config_pending`: endpoint contracts exist, but success-path behavior
  depends on provider credentials, sandbox destinations, or operational setup.
- `ops_verification_pending`: endpoint wiring exists, but production
  configuration, observability, or security evidence still needs verification.
- `current_matrix_verified`: current backend contract scope passed Matrix v13;
  keep the requirement active only for future endpoint families or regressions.
- `future_product_evolution`: current backend BE endpoint work is closed; reopen
  only if product expands the supported workflow.
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
- Security API Keys wiring: `_tests/api/public-api-dashboard.test.ts` and
  `_tests/api/public-api-client.test.ts` `20/20` passed.
- TypeScript: `pnpm typecheck` passed after API Keys wiring.
- BE-24/BE-25 focused wiring: `_tests/api/public-api-saved-assets.test.ts`,
  `_tests/api/public-api-account-security.test.ts`, and
  `_tests/auth.config.session.test.ts` `7/7` passed.
- TypeScript: `pnpm typecheck` passed after BE-25 saved-asset wiring.
- BE-27 notification wiring: `_tests/api/public-api-notifications.test.ts`
  `3/3` passed.
- BE-26 knowledge asset lifecycle client:
  `_tests/api/public-api-knowledge-assets.test.ts` `1/1` passed.
- TypeScript: `pnpm typecheck` passed after BE-26/BE-27 wiring.
- Frontend release validation: `pnpm lint`, `pnpm typecheck`, and the
  production `pnpm build` passed after the final API wiring and regression
  fixes.

## Remaining frontend boundary

Additional production-safe wiring should now be selected from one of:

- a delivered contract that needs a frontend adapter or route/store hookup;
- the `BE-07` frontend NextAuth impersonation exchange/restore bridge;
- configured provider behavior suitable for an end-user UI;
- or future product scope that explicitly reopens richer permissions,
  provider-specific processing, deal-room/kanban persistence, or analytics.

Do not represent unsupported behavior as hidden TODOs or fake successful
mutations.
