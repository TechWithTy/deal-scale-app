# Frontend Production Readiness Agile Plan - 2026-08-06

## Goal

Close the remaining frontend bridge, public API wiring, provider readiness, and
validation work so the frontend can be called production-ready.

Backend BE endpoint work is treated as closed for the current scope based on
Matrix v13: `104/104` passed, `0` failed, `0` skipped, and `cleanup_failed: 0`.
Production backend deploy run `31128423643` succeeded and production health
passed. Backend documentation was reconciled in commit `324881c`.

## Definition Of Done

Frontend production readiness is complete when:

- `BE-07` impersonation exchange/restore works through NextAuth.
- Delivered public API contracts are wired into intended routes, stores, and UI
  actions.
- Provider-backed flows have verified configured and unconfigured states.
- Local/mock fallback remains only for missing token, API failure, or
  intentionally unsupported product scope.
- Full validation passes: focused tests, broader Vitest, TypeScript, production
  build, and relevant public API smoke.
- Status and handoff docs match runtime behavior and list any intentional
  limitations.

## Epic 1 - BE-07 Impersonation Bridge

Status: implementation complete; authenticated browser smoke remains part of
release validation.

User story: As a platform admin, I can impersonate a user through the public API
and safely restore my original session.

Tasks:

- Implement `POST /api/auth/impersonation/exchange`.
- Implement `POST /api/auth/impersonation/restore`.
- Store the original admin session/token safely.
- Install the impersonated public API token/session into NextAuth.
- Restore the admin session on explicit stop.
- Handle token expiry, browser refresh, failed exchange, and nested
  impersonation rejection.
- Update the impersonation service/store to use the bridge instead of the local
  mock-backed route.
- Add tests for exchange, restore, session state, and failure handling.
- Add a browser smoke path for start, refresh, and stop impersonation.

Acceptance criteria:

- Admin can start impersonation from admin user surfaces.
- Dashboard renders as the target user after exchange.
- Impersonation banner shows correct admin and target identity.
- Stop restores the original admin session.
- Browser refresh preserves or safely terminates according to the bridge rules.
- Tokens and secrets do not leak to browser logs or UI.

## Epic 2 - Delivered Contract Wiring

Status: cart/catalog lifecycle and notification preference UI are implemented.
Team identity, broader profile/settings persistence, and rich knowledge-manager
persistence remain in progress or provider-dependent.

User story: As an authenticated user, screens should use delivered public API
contracts instead of local-only state wherever current contracts are complete.

Tasks:

- Audit local/fallback surfaces against
  [public-api-implementation-status-2026-06-29.md](./public-api-implementation-status-2026-06-29.md).
- Wire team identity/profile fields where delivered.
- Wire notification preference UI using the existing preference wrappers.
- Wire cart and subscription lifecycle UI against `/api/v1/cart*`.
- Wire profile/settings fields that are delivered in the current backend scope.
- Wire knowledge asset lifecycle into sales script and voice managers where
  metadata persistence is sufficient.
- Keep fallback behavior only for missing token, API failure, or unsupported
  product scope.
- Add or update adapter and route/store tests for each wired surface.

Acceptance criteria:

- Each wired surface has a wrapper, adapter/normalizer, loading state, empty
  state, error state, and focused tests.
- No UI reports success for unsupported mutations.
- Local fallback is explicit and documented.
- Status docs match actual runtime behavior.

## Epic 3 - Provider Readiness

User story: As a user, provider-backed flows either work with configured
providers or show controlled unavailable states.

Tasks:

- Inventory Twilio, SendBlue, direct mail, VAPI, enrichment, GHL, and knowledge
  processing screens.
- Confirm required environment variables and provider setup states.
- Wire configured, not-configured, unavailable, and failed provider states to UI.
- Verify handling for `PROVIDER_NOT_CONFIGURED`, `PROVIDER_UNAVAILABLE`, and
  `SERVICE_UNAVAILABLE`.
- Add smoke tests or a manual runbook for each provider family.
- Guard success-path UI until real provider configuration exists.
- Document which providers are production-configured versus intentionally
  unavailable.

Acceptance criteria:

- Provider-unconfigured state does not crash the UI.
- Configured provider success path is verified where credentials exist.
- Provider secrets never appear in frontend payloads, logs, or UI.
- User-facing unavailable states point to setup/reconnect actions where
  supported.

## Epic 4 - Validation And Release Hardening

Current validation evidence (2026-08-06): focused bridge/cart/notification
suites, campaign regressions, `pnpm typecheck`, and `pnpm lint` pass. The full
Vitest suite was rerun after the campaign harness fixes. The production build
subsequently passed after the local `.next/trace` lock was cleared. Provider-
backed browser smoke remains pending configured test credentials and safe
destinations.

User story: As a release owner, I can validate the frontend build and public API
wiring before production release.

Tasks:

- Classify existing untracked artifacts and unrelated dirty files.
- Run focused Vitest suites for changed modules.
- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run `pnpm build`.
- Run relevant public API smoke scripts.
- Capture failures as release-blocking tickets or explicit waivers.
- Update validation evidence in integration docs.
- Prepare release notes with known limitations.

Acceptance criteria:

- TypeScript passes.
- Tests pass or every failure has owner signoff.
- Production build passes.
- Public API smoke passes for frontend-owned flows.
- Release notes identify provider limitations and intentionally local surfaces.

## Sprint Plan

### Sprint 1 - Impersonation Bridge

Scope:

- Deliver `BE-07` exchange/restore route handlers.
- Replace local impersonation route usage.
- Add focused tests.
- Demo start, refresh, stop, and restore behavior.

Exit criteria:

- Impersonation works through public API token exchange and NextAuth session
  restoration.
- Focused impersonation tests pass.

### Sprint 2 - Contract Wiring

Scope:

- Finish team identity/profile field wiring.
- Finish notification preference UI.
- Wire cart/subscription lifecycle.
- Wire delivered profile/settings fields.
- Update status docs.

Exit criteria:

- Targeted route/store tests pass.
- Fallback behavior is intentional and documented.

### Sprint 3 - Provider Readiness

Scope:

- Verify provider configuration states.
- Wire setup/unavailable UX.
- Add provider smoke coverage or runbooks.
- Guard unsupported provider actions.

Exit criteria:

- Provider-backed screens are either verified with real config or safely
  unavailable.
- Provider secrets are not exposed.

### Sprint 4 - Production Validation

Scope:

- Run full frontend validation matrix.
- Fix release blockers.
- Freeze docs.
- Prepare production-readiness signoff.

Exit criteria:

- `pnpm typecheck`, `pnpm test`, `pnpm build`, and relevant public API smoke pass
  or have documented waivers.
- Release notes and status docs are current.

## Backlog Priority

1. `BE-07` NextAuth impersonation exchange/restore.
2. Cart/subscription lifecycle wiring.
3. Team identity/profile field wiring.
4. Notification preferences UI.
5. Knowledge asset manager metadata wiring.
6. Provider configuration/readiness checks.
7. Full validation pass and release docs.

## Tracking Labels

- `frontend`
- `public-api`
- `production-readiness`
- `impersonation`
- `provider-config`
- `validation`
- `docs`
- `blocked-provider`
- `future-product-scope`

## Validation Commands

Run targeted checks first, then broaden:

```bash
pnpm test -- <focused-test-files>
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e:public-api-full
```

Use provider-specific smoke commands or runbooks only when configured
credentials and safe sandbox destinations are available.
