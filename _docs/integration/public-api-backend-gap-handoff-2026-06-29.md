# Public API Backend Gap Handoff - 2026-06-29

This is the authoritative backend handoff for completing frontend migration from
local fixtures, demo stores, provider-specific calls, and local Next.js API routes
to the Deal Scale public API.

The frontend previously reached its safe implementation boundary. Backend has
now delivered Phase 1/core-resource updates for `BE-01` through `BE-04`, so
frontend can consume cashbuyers, lead lists/details, property detail, and
campaign lifecycle contracts. Every remaining open item below requires a
backend endpoint, response field, environment capability, authenticated fixture,
or explicit backend/product ownership decision. This file intentionally exceeds
the normal 250-line source-file limit.

## Phase 1 release evidence

- Latest merge: `b7c807c5843184b1aa3e981ec295e803c684eab0`
- Latest master workflow passed, including production blue/green.
- Production health smoke passed: `https://api.dealscale.io/api/v1/health`
- Phase 1 OpenAPI updates are documented and merged.
- `check_if_email_exists` / Reacher operations docs are merged and deployed.

Important caveat: `BE-22` is still open. The full persona fixture matrix and
authenticated staging smoke/cleanup evidence are outstanding, so Phase 1 route
wiring can proceed but the full backend gap register must not be treated as
closed.

## Handoff outcome

Backend should work the gap IDs in phase order and deliver:

1. an updated OpenAPI document with concrete request/response models;
2. authenticated test data that exercises successful responses;
3. stable identifiers usable in frontend slugs;
4. consistent errors, pagination, and idempotency behavior;
5. contract tests plus production smoke coverage;
6. a short release note mapping each completed gap ID to deployed endpoints.

Frontend can resume route wiring as each phase passes its acceptance gate. It
does not need to wait for every phase to finish.

## Complete gap register

| ID | Priority | Area | Blocked frontend surfaces | Backend delivery required |
| --- | --- | --- | --- | --- |
| `BE-01` | P0 | Cashbuyers / prospecting | `/dashboard/lead-list`, `/dashboard/market` | Delivered in Phase 1. Frontend can consume cashbuyer list/detail contracts. |
| `BE-02` | P0 | Saved lead lists and lead detail | Lead-list and individual-lead slugs, `/dashboard/lead`, quickstart | Delivered in Phase 1. Frontend can consume saved-list, list-row, lead-detail, stable ID, and pagination contracts. |
| `BE-03` | P0 | Property detail | `/dashboard/properties/[propertyId]`, market leads | Delivered in Phase 1. Frontend can consume the public property-detail contract. |
| `BE-04` | P1 | Campaign lifecycle | `/dashboard/campaigns`, quickstart, campaign activity | Delivered in Phase 1. Frontend can consume campaign list/detail/update/cancel/status contracts. |
| `BE-05` | P1 | Admin user detail | `/admin/users/[id]`, admin detail modal | Add `GET /api/v1/admin/users/{user_id}`. Search is not a reliable detail contract. |
| `BE-06` | P1 | Admin lifecycle actions | Admin ban/suspend/access/edit/reset-password UI | Define supported admin mutations and add endpoints or remove those capabilities from product scope. |
| `BE-07` | P1 | Admin impersonation session bridge | `/admin/users`, `/admin/users/[id]`, impersonation banner | Define how the five-minute impersonation JWT becomes/restores a NextAuth-compatible frontend session and how `session_id` is ended. |
| `BE-08` | P1 | Team member identity | `/dashboard/employee`, `/dashboard/employee/[employeeId]` | Add email/display name to `TeamMemberPublic`; IDs/role/status are insufficient to render members. |
| `BE-09` | P1 | Team permissions/profile mutation | Employee editor | Confirm role/status-only scope or add typed profile and permission fields to member read/update models. |
| `BE-10` | P1 | Team invitation lifecycle | Employee invitation management | Confirm whether revoke/resend endpoints are required and return stable status transitions. |
| `BE-11` | P1 | Subscription/cart ownership | Upgrade and plan-purchase flows | Define subscription SKU checkout, existing-cart merge/replace behavior, billing portal ownership, and checkout terminal states. |
| `BE-12` | P1 | Password reset delivery | `/forgot-password`, `/reset-password` | Existing reset/set endpoints need verified email delivery, frontend reset URL format, token TTL, anti-enumeration behavior, and session invalidation tests. |
| `BE-13` | P2 | Dashboard analytics | `/dashboard`, `/dashboard/charts` | Map dashboard cards/charts to analytics metric keys and provide typed aggregate/stream response examples. |
| `BE-14` | P2 | Messaging ownership | `/dashboard/chat`, campaign messaging | Map Twilio, Sendblue, direct-mail, and VAPI chat operations to product actions; define thread/message schemas and pagination. |
| `BE-15` | P2 | Enrichment ownership | Lead/profile enrichment surfaces | Map each enrichment tool to UI actions, synchronous/asynchronous behavior, job status, normalized results, and credit usage. |
| `BE-16` | P2 | Credentials/integrations | `/dashboard/connections`, profile OAuth | Define provider catalog/status, credential CRUD ownership, GHL calendar flow, reconnect/disconnect behavior, and safe display fields. |
| `BE-17` | P2 | VAPI/voice contracts | `/dashboard/agents`, chat, voice clone | Replace generic `VapiRequest`/`VapiResponse` objects with typed assistant/call/chat/phone/voice models and pagination. |
| `BE-18` | P2 | Webhooks/feeds | `/dashboard/connections` | Current UI manages incoming/outgoing webhooks and activity feeds, but no canonical CRUD/test/delivery-log contract is assigned. |
| `BE-19` | P2 | Deal room / kanban | Deal-room and kanban routes | Confirm public API ownership and add deal, stage, board, column, card, ordering, and concurrency contracts. |
| `BE-20` | P2 | Quickstart orchestration | `/dashboard/quickstart` | Define stable outputs/IDs between profile, prospecting, saved lists, campaign launch, and CRM sync steps. |
| `BE-21` | P1 | Contract consistency | All migrated surfaces | Standardize pagination, errors, timestamps, enum casing, idempotency, and success envelopes. |
| `BE-22` | P1 | Authenticated contract fixtures | Frontend E2E and CI | Supply scoped test users/data that return successful team/admin/provider responses, not only controlled auth/provider errors. |
| `BE-23` | P2 | Profile/settings persistence | `/dashboard/profile`, quickstart profile steps | Define canonical profile/business/settings read/update contracts beyond onboarding status. |
| `BE-24` | P2 | Account security/privacy | Security modal, session activity, account deletion | Add session list/revoke, security activity, privacy export/delete, and notification-security preference ownership or remove unsupported UI. |
| `BE-25` | P2 | Saved user assets | Saved searches, campaign templates, workflows | Add organization/user-scoped CRUD, stable IDs, versioning, and ownership for assets currently stored locally. |
| `BE-26` | P2 | Knowledge assets | Sales scripts, email knowledge, voice/voicemail assets | Define upload/list/status/delete contracts, storage limits, processing states, and provider linkage. |
| `BE-27` | P2 | Notifications/preferences | Notification panels and profile preferences | Define notification feed/read state and persisted delivery/preference contracts. |

## Cashbuyers contract delivered for frontend consumption

Phase 1 delivered cashbuyer endpoints for frontend route wiring. Historical
options below are retained as contract context, not as an open backend blocker.

1. Dedicated cashbuyer endpoint:

```http
GET /api/v1/cashbuyers
GET /api/v1/cashbuyers/{id}
```

Expected list fields:

- `id`
- `name` or buyer/company name
- `email`
- `phone`
- `market` / city / state
- `asset_preferences`
- `buy_box`
- `last_activity_at`
- `status`
- pagination metadata

2. Prospecting-source contract:

```http
GET /api/v1/prospecting/sources
POST /api/v1/prospecting/search
```

Needed clarification:

- Which source key represents cashbuyers?
- Which filters are valid for buyer type, market, property type, budget, and intent?
- Whether `dry_run` returns usable preview rows or only counts.
- Response field names for contact data, location, investment criteria, tags, and source IDs.
- Stable ID that should be used in route slugs.

## Lead-list, lead-detail, and property contract delivered for frontend consumption

Phase 1 delivered the stable navigation chain for `BE-02` and `BE-03`:

```http
GET /api/v1/lead-lists
GET /api/v1/lead-lists/{list_id}
GET /api/v1/lead-lists/{list_id}/leads
GET /api/v1/leads/{lead_id}
GET /api/v1/properties/{property_id}
```

Minimum list contract:

- `id`, `name`, `source`, `status`
- `lead_count`, `created_at`, `updated_at`
- owner/organization identifier
- cursor or offset pagination metadata

Minimum lead contract:

- stable `id` independent of page position
- person/company display name
- normalized email and phone arrays with verification state
- address and market fields
- linked `property_id`
- source, tags, score, status, and last activity
- enrichment provenance and timestamps

Minimum property contract:

- stable `id`
- normalized address and coordinates
- property type, beds, baths, size, year built
- valuation/listing fields with currency
- owner/contact references
- source and freshness timestamps

Acceptance:

- IDs returned by search/list endpoints resolve through the detail endpoints.
- Deleting or refreshing a saved list does not silently change lead IDs.
- Empty results return a successful typed page, not a schema variant.

## Campaign lifecycle contract delivered for frontend consumption

Phase 1 delivered campaign list/detail/update/cancel/status contracts. The
frontend now has wrappers for:

```http
GET /api/v1/campaigns
GET /api/v1/campaigns/{campaign_id}
PATCH /api/v1/campaigns/{campaign_id}       # if editable
POST /api/v1/campaigns/{campaign_id}/cancel # if cancellable
DELETE /api/v1/campaigns/{campaign_id}      # if deletion is supported
```

List/detail fields required by the current table and activity UI:

- `campaign_id`, `name`, `campaign_type`, `status`
- `created_at`, `started_at`, `completed_at`
- `lead_list_id`, `lead_count`, channel configuration
- sent/delivered/engaged/failed counts
- credits estimated/used
- workflow/execution reference without exposing provider secrets
- pagination and filter support for status/type/date

Backend must also confirm whether direct-mail statistics are the canonical
campaign-statistics contract or provider-specific data.

## Admin contract

### User detail and lifecycle

`BE-05` requires a dedicated detail response with:

- identity and verification state
- role/scopes/status
- organization/team membership
- credit balances
- provisioning state and failure reason
- created/last-login timestamps
- tester/tier flags only if they remain product features

For `BE-06`, explicitly mark each existing UI action supported or unsupported:

- suspend/unsuspend
- ban/unban
- edit identity/access
- reset password or send reset link
- retry provisioning
- adjust credits

Unsupported actions should not receive placeholder success responses.

### Impersonation

The OpenAPI schema returns `token`, `expires_in`, `expires_at`, and `session_id`.
That is not yet sufficient for the app session layer. For `BE-07`, choose one:

1. Backend bridge: exchange impersonation token for a normal app session and
   preserve the admin restore session server-side.
2. NextAuth bridge: document a frontend server endpoint that stores the original
   admin token, installs the impersonation token, and restores safely.

Required behavior:

- token is audience/scope restricted and expires in five minutes;
- every impersonated request is audit attributed to both admin and target;
- ending requires or resolves the returned `session_id`;
- expiry and browser refresh restore or terminate predictably;
- credits/refunds are idempotent;
- nested impersonation is rejected.

## Team contract

For `BE-08`, extend `TeamMemberPublic` with at least:

```json
{
  "id": "membership-uuid",
  "user_id": "user-uuid",
  "email": "member@example.com",
  "display_name": "Member Name",
  "role": "member",
  "status": "active",
  "joined_at": "2026-06-29T12:00:00Z",
  "last_active": "2026-06-29T12:00:00Z"
}
```

For `BE-09`, either declare role/status-only management final or add a typed
permission model. Do not accept identity/permission fields and silently discard
them.

For `BE-10`, decide whether pending invitations support:

```http
POST /api/v1/team/invites/{invite_id}/resend
POST /api/v1/team/invites/{invite_id}/revoke
```

Invitation emails must target:

```text
https://app.dealscale.io/accept-invite?token={invitation_token}
```

Acceptance:

- member list includes renderable identity;
- invite acceptance creates exactly one membership;
- repeated accept/revoke/delete requests are deterministic;
- organization/member/activity counts agree after mutations.

## Password reset contract

The OpenAPI already exposes:

```http
POST /api/v1/auth/reset-password
POST /api/v1/auth/set-password
```

Therefore `BE-12` is primarily a delivery and security verification gap, not an
endpoint naming gap.

Backend must confirm:

- reset email URL includes both required `email` and `token` values;
- token TTL and single-use behavior;
- identical reset-request response for known and unknown emails;
- password policy and stable error codes;
- successful reset invalidates access, refresh, social, and impersonation
  sessions as applicable;
- rate limiting by account and requester;
- production email provider configuration and observability.

## Dashboard analytics contract

For `BE-13`, publish a metric catalog mapping frontend cards/charts to:

- metric key
- unit and display precision
- supported aggregation
- time-range and timezone semantics
- grouping dimensions
- empty/no-data behavior

The generic analytics process/aggregate/stream endpoints should include concrete
examples for calls, messages, campaigns, leads, appointments, conversions,
credits, and team activity. Streaming reconnect/cursor behavior must be defined.

## Provider and integration contract

The frontend client already recognizes:

- `PROVIDER_NOT_CONFIGURED`
- `PROVIDER_UNAVAILABLE`
- `SERVICE_UNAVAILABLE`
- validation, auth, forbidden, not-found, and server failures

For `BE-14` through `BE-18`, backend/product must publish an operation map:

| Frontend action | Canonical endpoint | Required provider | Success model | Unavailable behavior |
| --- | --- | --- | --- | --- |
| Send/read SMS | Twilio or Sendblue path | provider credential | typed message/thread | setup CTA |
| Direct-mail campaign | messaging direct-mail path | mail provider | campaign/status/stats | setup CTA |
| Chat | messaging or VAPI chat | chosen provider | typed chat/messages | setup CTA |
| Enrich lead/contact | enrichment path/tool | tool-specific | normalized result/job | tool unavailable |
| List/create agent | VAPI assistants | VAPI | typed assistant page/item | setup CTA |
| Calls/phone numbers | VAPI calls/numbers | VAPI | typed page/item | setup CTA |
| Clone voice | voice clone | voice provider | voice ID/status | setup CTA |
| List credentials | credentials paths | provider catalog | safe provider metadata | disconnected |
| GHL calendar connect | GHL OAuth paths | GHL | typed connection status | disconnected |
| Webhook/feed management | contract missing | none/provider | CRUD/test/log models | not configured |

Requirements:

- never return provider access/refresh tokens to browser UI;
- replace generic VAPI objects with stable typed schemas;
- paginate threads, messages, calls, assistants, and logs;
- normalize provider IDs separately from Deal Scale resource IDs;
- define async job status/polling for long-running enrichment and voice tasks;
- return credit estimates before expensive mutations when possible;
- include provider setup/reconnect URLs only when safe for the current user.

## Deal room, kanban, and quickstart contract

For `BE-19`, decide whether deal room and kanban are persisted backend products.
If yes, provide:

- deal list/detail with stable IDs and ownership;
- board/column/card schemas;
- card ordering and move mutation;
- optimistic concurrency/version field;
- activity/comments/attachments if supported;
- archive/delete semantics and authorization.

For `BE-20`, define the identifiers passed between quickstart steps. A completed
step must return durable IDs that the next step can consume; display labels or
local array indexes are insufficient.

## Secondary persistence contracts

The following app surfaces are not all represented by a dedicated route row, but
they still contain local-only state and must be resolved before declaring the app
fully API-backed.

### Profile and settings

For `BE-23`, clarify whether `/api/v1/auth/profile-setup` is only an onboarding
progress resource or the canonical profile store. The current app contains:

- personal and business identity
- base/company settings
- notification preferences
- platform integration settings
- two-factor preferences
- OAuth/provider selections

Publish typed read/update models and field-level authorization. Separate account
identity, organization settings, and provider credentials rather than accepting
one unrestricted profile object.

### Security and privacy

For `BE-24`, decide support for:

```http
GET    /api/v1/auth/sessions
DELETE /api/v1/auth/sessions/{session_id}
DELETE /api/v1/auth/sessions
GET    /api/v1/auth/security-activity
POST   /api/v1/account/data-export
DELETE /api/v1/account
```

Account deletion needs re-authentication, explicit state transitions, retention
policy, organization-owner safeguards, and asynchronous completion status.

### Saved assets and knowledge

For `BE-25` and `BE-26`, provide scoped CRUD and stable IDs for:

- saved lead searches
- campaign templates
- workflow templates
- uploaded sales scripts
- email/knowledge documents
- voice clones and voicemail recordings

Uploads require MIME/size limits, malware scanning, processing status, signed
upload/download behavior, and delete/retention semantics. Templates/workflows
require schema versions so saved data remains loadable after UI changes.

### Notifications

For `BE-27`, define:

- notification list with pagination;
- unread count;
- mark one/all read;
- notification category and deep-link target;
- persisted email/SMS/in-app preferences;
- delivery state if surfaced to the user.

## Cross-cutting contract requirements

`BE-21` applies to every new or revised endpoint.

### Pagination

Choose one standard per API family and document it:

```json
{
  "items": [],
  "page": {
    "next_cursor": null,
    "previous_cursor": null,
    "has_more": false,
    "total": 0
  }
}
```

If offset pagination is retained, use `items`, `total`, `limit`, and `offset`
consistently. Do not alternate between bare arrays, `results`, `users`, `data`,
and `items` for equivalent list operations.

### Errors

All non-2xx responses should use:

```json
{
  "request_id": "trace-id",
  "error": {
    "code": "STABLE_MACHINE_CODE",
    "message": "Safe user-facing summary",
    "details": {}
  },
  "timestamp": "2026-06-29T12:00:00Z",
  "path": "/api/v1/example"
}
```

Required stable codes include:

- `AUTH_REQUIRED`
- `AUTH_FORBIDDEN`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `RATE_LIMITED`
- `PROVIDER_NOT_CONFIGURED`
- `PROVIDER_UNAVAILABLE`
- `SERVICE_UNAVAILABLE`
- domain-specific codes such as expired invitation/reset token

### Mutations and retries

- Support an `Idempotency-Key` header for checkout, campaign launch, invites,
  credit adjustment, enrichment jobs, messaging sends, and provider mutations.
- Return the same resource/result for a safely retried key.
- Return `409 CONFLICT` for incompatible duplicate state transitions.
- Document whether delete endpoints are idempotent.
- Include resource version or ETag semantics for concurrent kanban/deal updates.

### Types and formatting

- UUID/resource ID fields must identify their namespace.
- Timestamps use UTC ISO 8601.
- Money includes currency and does not rely on ambiguous floats where exact
  accounting is required.
- Enum casing is consistent between requests and responses.
- Nullable fields are explicit in OpenAPI.
- Do not use empty schemas or unrestricted objects for production UI contracts.

### Authorization

- Document required scopes and organization-role requirements per operation.
- Distinguish `401` invalid/expired credentials from `403` insufficient scope.
- Ensure list/detail endpoints cannot cross organization boundaries.
- Provider credentials and secrets must never be returned in read models.

## Authenticated fixtures and testability

`BE-22` is required because a controlled error proves routing but does not prove
the successful contract consumed by the frontend.

Backend should provide CI-safe users for:

- normal member
- organization owner/admin
- platform support
- platform admin with impersonation permission
- connected-provider user
- provider-not-configured user
- user with campaigns, lead lists, team activity, cart items, and credit history

Fixtures must be resettable and isolated from production customer data. Mutating
smoke tests need deterministic cleanup for campaigns, invites, carts, credentials,
and impersonation sessions.

## Backend implementation plan

### Phase 0 - Contract freeze and test foundation

Gap IDs: `BE-21`, `BE-22`

Backend tasks:

1. Choose list pagination and error envelope standards.
2. Add concrete OpenAPI models where responses are currently `{}` or generic
   objects.
3. Document scope/role requirements and idempotency behavior.
4. Create authenticated success fixtures and cleanup utilities.
5. Add contract snapshots or schema tests to CI.

Acceptance gate:

- OpenAPI generation has no empty response schema for a frontend-owned operation.
- CI can exercise successful team, admin, cart, campaign, analytics, and provider
  reads with deterministic data.
- Error-code and pagination contract tests pass.

### Phase 1 - Core lead and campaign data - delivered

Gap IDs: `BE-01`, `BE-02`, `BE-03`, `BE-04`

Backend delivery status:

1. Cashbuyer endpoints are available for frontend consumption.
2. Saved lead-list and lead/property detail contracts are available.
3. Stable IDs across list/detail routes are documented in the Phase 1 OpenAPI
   updates.
4. Campaign list/detail/update/cancel/status contracts are available.
5. Release evidence is merged and production health smoke passed.

Remaining caveat:

- `BE-22` authenticated persona fixtures and staging smoke/cleanup evidence are
  still outstanding. Frontend can wire routes but should keep fallback/error
  handling until those fixtures exist.

Frontend now unblocked:

- lead-list index and both nested detail slugs
- `/dashboard/lead` and `/dashboard/lead/[leadId]`
- `/dashboard/market`
- `/dashboard/properties/[propertyId]`
- campaign table and quickstart lead/campaign steps

### Phase 2 - Admin, team, and account lifecycle

Gap IDs: `BE-05` through `BE-10`, `BE-12`

Backend tasks:

1. Add admin user detail and supported lifecycle mutations.
2. Finalize the impersonation-to-session exchange and restore flow.
3. Add team display identity and decide permission/profile mutation scope.
4. Add invitation resend/revoke if in product scope.
5. Validate production password reset email and session invalidation behavior.

Acceptance gate:

- Admin detail loads without local directory fixtures.
- Impersonation survives navigation and reliably restores the original admin.
- Team list contains renderable identity and mutations return the updated member.
- Reset request is anti-enumeration safe and reset completion invalidates sessions.

Frontend unblocked:

- complete admin user detail/actions
- public API impersonation banner/session
- team table/edit without identity fixtures
- complete forgot/reset password flow

### Phase 3 - Commerce and analytics

Gap IDs: `BE-11`, `BE-13`

Backend tasks:

1. Decide direct checkout versus cart checkout for subscription SKUs.
2. Define cart merge/replace behavior and billing portal ownership.
3. Define checkout state machine and webhook reconciliation.
4. Publish dashboard metric catalog and typed analytics examples.
5. Seed subscription/cart/analytics fixtures.

Acceptance gate:

- A subscription can be selected, checked out, reconciled, and displayed after
  redirect without duplicate cart items or charges.
- Cancelled/expired/failed/succeeded checkout states are distinguishable.
- Dashboard cards and charts have documented metric keys, units, and no-data
  behavior.

Frontend unblocked:

- subscription upgrade and cart lifecycle
- billing management
- `/dashboard` aggregate cards
- `/dashboard/charts`

### Phase 4 - Providers, messaging, enrichment, and voice

Gap IDs: `BE-14` through `BE-18`

Backend/product tasks:

1. Approve the frontend operation map.
2. Replace generic provider models with typed resources.
3. Add provider catalog/status/setup/reconnect/disconnect behavior.
4. Normalize threads/messages and async enrichment/voice job states.
5. Define webhook/feed CRUD, tests, and delivery logs.
6. Configure success and unavailable provider fixtures.

Acceptance gate:

- Each frontend action has exactly one canonical endpoint.
- Connected and not-configured users produce deterministic typed responses.
- No provider secret appears in browser payloads or logs.
- Pagination and polling/retry behavior are documented and tested.

Frontend unblocked:

- `/dashboard/chat`
- `/dashboard/connections`
- `/dashboard/agents`
- enrichment actions
- VAPI assistants/calls/chat/phone numbers
- voice clone and provider setup states

### Phase 5 - Deal workspace and quickstart completion

Gap IDs: `BE-19`, `BE-20`

Backend/product tasks:

1. Decide backend ownership for deal room and kanban.
2. Implement agreed deal/board/card contracts and concurrency handling.
3. Define cross-step IDs and resume state for quickstart.
4. Add organization-isolated fixtures and mutation tests.

Acceptance gate:

- Deal/kanban state persists across sessions and concurrent updates are safe.
- Quickstart can resume from server state and every downstream ID resolves.

Frontend unblocked:

- `/dashboard/deal-room`
- `/dashboard/deal-room/[dealId]`
- `/dashboard/kanban`
- complete `/dashboard/quickstart`

### Phase 6 - Secondary persistence and account completeness

Gap IDs: `BE-23` through `BE-27`

Backend/product tasks:

1. Define profile, organization, and settings ownership.
2. Implement supported session/security/privacy operations.
3. Add saved-search/template/workflow persistence.
4. Add knowledge-asset upload, processing, and lifecycle contracts.
5. Add notification feed/read/preference persistence.

Acceptance gate:

- Profile/settings survive browser and device changes without local fixtures.
- Session revoke, export, and account-delete flows have auditable state changes.
- Saved assets are organization isolated, versioned, and reloadable.
- Upload processing failures are typed and retryable.
- Notification unread/read state is consistent across sessions.

Frontend unblocked:

- complete profile/settings forms
- security, privacy, and session UI
- saved searches, campaign templates, and workflows
- knowledge/script/voice asset managers
- notification center and persisted preferences

## Definition of done for each gap

A gap is not complete merely because a route returns a controlled response. Mark
the gap complete only when:

- endpoint and HTTP method are final;
- request and response schemas are concrete in OpenAPI;
- auth scopes and organization isolation are tested;
- success, empty, validation, forbidden, not-found, conflict, and provider/error
  cases are covered as applicable;
- pagination/filter/sort behavior is documented;
- stable IDs resolve from list to detail;
- mutation idempotency and state transitions are defined;
- production configuration exists for required email/payment/provider services;
- smoke tests include a successful response, not only an expected error;
- release notes name the gap ID and deployment commit.

## Backend-to-frontend delivery checklist

For each phase, backend should hand off:

- [ ] Deployed commit SHA and workflow URL.
- [ ] Updated OpenAPI JSON.
- [ ] Gap IDs completed.
- [ ] Endpoint/method list.
- [ ] Request and response examples.
- [ ] Enum and error-code changes.
- [ ] Scope/role requirements.
- [ ] Test fixture credentials or CI fixture identifiers.
- [ ] Cleanup instructions for mutating tests.
- [ ] Migration/backfill notes for stable IDs.
- [ ] Provider/environment variables required.
- [ ] Production smoke evidence.
- [ ] Known limitations or deferred fields.

Frontend acceptance after each handoff:

- regenerate/refresh local contract reference;
- add or update adapters and wrapper tests;
- wire the newly unblocked route;
- run focused Vitest and TypeScript;
- run `pnpm test:e2e:public-api-full`;
- update the frontend status tracker and this gap register.

## Frontend assumptions already implemented

- Public API base path uses `/api/v1/*`.
- Auth tokens live at `session.publicApi.accessToken`.
- All migrated surfaces preserve fixture/local fallback when no token exists or when public API calls fail.
- Campaign create responses may include `campaign_id`; frontend stores a local-to-public campaign ID map in local storage.
- Admin search responses may be shaped as `users`, `results`, `items`, `data`, or nested `data.users`; frontend adapter normalizes common variants.

## Contracts already consumed by frontend

- `/api/v1/auth/signup`
- `/api/v1/auth/login`
- `/api/v1/auth/logout`
- `/api/v1/auth/me`
- `/api/v1/auth/profile-setup`
- `/api/v1/prospecting/sources`
- `/api/v1/prospecting/search`
- `/api/v1/credits/balance`
- `/api/v1/credits/history`
- `/api/v1/credits/stats`
- `/api/v1/credits/expiring`
- `/api/v1/campaigns/`
- `/api/v1/campaigns/{campaign_id}/status`
- `/api/v1/admin/users/search`
- `/api/v1/admin/users/{user_id}/adjust-credits`
- `/api/v1/admin/users/{user_id}/retry-provisioning`
- `/api/v1/admin/users/{user_id}/logs`
- `/api/v1/team/organization`
- `/api/v1/team/members`
- `/api/v1/team/members/{member_id}`
- `/api/v1/team/invites`
- `/api/v1/team/invites/accept`
- `/api/v1/team/activity`
- `/api/v1/payments/pricing/tiers`
- `/api/v1/payments/checkout`

## Existing endpoints still blocked from final UI ownership

These routes exist in OpenAPI. Their blocker is described by the matching gap ID;
they should not be reported as entirely missing endpoints.

| Existing endpoint family | Gap ID | Remaining blocker |
| --- | --- | --- |
| `/api/v1/auth/reset-password`, `/api/v1/auth/set-password` | `BE-12` | Production email/link/security verification |
| Admin impersonate/end-impersonation | `BE-07` | NextAuth session install/restore contract |
| `/api/v1/cart*` and `/api/v1/cart/products` | `BE-11` | Subscription/cart ownership and state machine |
| `/api/v1/analytics/*` | `BE-13` | Metric-to-screen catalog and typed examples |
| Twilio, Sendblue, direct-mail, VAPI chat | `BE-14` | Canonical messaging action ownership |
| `/api/v1/enrich/*`, `/api/v1/ai/enrich/*` | `BE-15` | Tool-to-UI map and normalized/job results |
| `/api/v1/credentials/*`, GHL calendar OAuth | `BE-16` | Connection lifecycle and safe provider model |
| `/api/v1/vapi/*`, `/api/v1/voice/clone` | `BE-17` | Typed resource schemas and provider prerequisites |

## Frontend validation completed

- Production public API smoke rerun: `173/173` passed.
- Final focused frontend integration run: `30/30` passed.
- Targeted Vitest coverage added for:
  - public API client/server wrappers
  - dashboard public API wrappers
  - campaign payload mapping and campaign ID persistence
  - campaign status hook
  - usage credits adapter
  - credit history/statistics adapter
  - admin public API user adapter
  - admin activity-log adapter
  - team public API member adapter
  - team organization/invitation/activity adapters
  - payment pricing and secure checkout URL adapter
- TypeScript check passed after the current frontend wiring.

## Payments implementation boundary

Frontend now uses the payment API for custom credit purchases:

1. Load the live tier and credit-type catalog from
   `GET /api/v1/payments/pricing/tiers`.
2. Submit the selected amount/type to `POST /api/v1/payments/checkout`.
3. Redirect only when the response contains a valid HTTPS `session_url`.

The following remain intentionally unwired:

- adding subscription SKUs from `/api/v1/cart/products`
- reconciling a pre-existing authenticated cart before subscription purchase
- cart quantity, removal, clear, and checkout-status UI
- billing portal/session management

Backend confirmation is needed before those flows can safely replace the current
static subscription and external pricing behavior.

For `BE-11`, the checkout state machine should at minimum define:

- `created`
- `requires_action`
- `processing`
- `succeeded`
- `cancelled`
- `expired`
- `failed`

Backend must specify whether `/api/v1/cart/checkout` returns a redirect URL,
client secret, or provider-specific next action; how webhook completion updates
the cart/order/subscription; and whether a successful checkout clears the cart.
Repeated checkout requests for the same cart must not create duplicate charges.

## Frontend implementation completed before handoff

- Public API signup, login token bridge, profile state, and logout.
- Credit balance, history, statistics, expiration, pricing, and custom-credit checkout.
- Campaign create and selected-campaign status polling.
- Admin search, credit adjustment, provisioning retry, and event logs.
- Team organization read/update, member list overlay, role update, delete,
  invitation create/list/accept, and activity list.
- Provider-unavailable/error classification in the shared public API client.

The remaining rows above are not generic frontend TODOs. Each requires a response
field, endpoint, provider prerequisite, or session/product ownership decision
before another production-safe UI mutation can be added.
