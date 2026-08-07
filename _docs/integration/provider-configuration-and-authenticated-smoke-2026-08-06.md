# Provider Configuration And Authenticated Smoke Coverage

## Purpose

The frontend is production-ready against delivered public API contracts. This
document covers the remaining operational work needed to enable live provider
behavior and verify it through authenticated browser smoke tests.

No provider secret belongs in this repository, browser fixtures, screenshots,
or client-visible `NEXT_PUBLIC_*` variables unless it is explicitly intended to
be public.

## Provider Configuration

Configure values in the production secret manager and backend deployment
environment. Use separate sandbox/test credentials for staging.

| Capability | Required configuration | Production checks |
| --- | --- | --- |
| Authentication | `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, approved OAuth callback URLs, canonical public API base URL | Sign-in, refresh, sign-out, and impersonation restore preserve the correct identity. |
| Twilio | Account SID, auth token, sending number, Messaging Service or approved sender, webhook URLs, regional/compliance settings | Send one consented test SMS; verify delivery status webhook and opt-out behavior. |
| SendBlue | API key, sender identity, approved sending number, webhook signing secret and callback URL | Send one consented test SMS and verify inbound/status webhook handling. |
| VAPI | Private API key, assistant IDs, phone number IDs, server/webhook URL, webhook verification secret | Place a non-billable or approved test call; verify call status, recording/transcript policy, and final event ingestion. |
| Enrichment and skip trace | Provider API key, permitted fields, tenant limits, billing caps, callback URL where asynchronous | Run one approved record; verify result mapping, cost attribution, consent/compliance controls, and failure state. |
| Knowledge processing | Storage credentials/bucket, processor credentials, queue/worker configuration, accepted file types and size limits | Upload a non-sensitive fixture; verify processing lifecycle, retrieval, deletion, and access isolation. |
| Email and export delivery | Transactional email provider key, verified sender/domain, export storage location, signed download expiry | Request a privacy export with a test user; verify only that user's data is delivered through an expiring link. |
| Push notifications, if enabled | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, server VAPID private key, permitted origin and subscription persistence | Subscribe a staging browser and deliver one non-sensitive notification. |

### Security Controls

- Keep provider secrets server-only and rotate them through the secret manager.
- Use provider webhooks with signature verification, replay protection, and
  production HTTPS URLs.
- Restrict live phone/email destinations to an allowlist for staging smoke.
- Set billing, rate, and concurrency limits before enabling bulk operations.
- Document data-processing agreements, retention, consent, opt-out, TCPA, and
  applicable regional requirements before outreach or enrichment is enabled.
- Configure observability without logging tokens, message bodies, export
  contents, or unnecessary PII.

## Authenticated Browser Smoke Coverage

### Test Accounts

Provision non-production accounts with known roles and a disposable tenant:

- Standard user: security/privacy preferences, saved assets, cart, knowledge
  assets, notifications, and ordinary dashboard flows.
- Administrator: user detail and impersonation exchange/restore.
- Impersonation target: distinct identity, credits, and permissions from the
  administrator.
- Billing test account: provider sandbox or non-chargeable catalog/checkout
  configuration.

Do not use employee personal accounts or production customer data. Reset test
records and revoke sessions after each smoke run.

### Required Scenarios

1. Sign in as a standard user; refresh once and confirm the dashboard remains
   authenticated.
2. Open account security; list sessions, revoke a non-current test session,
   revoke other sessions, view activity, request an export, and submit a
   deletion request. Confirm deletion remains an asynchronous request.
3. Update notification channels; reload and confirm persisted preferences.
4. Add, update, and remove a cart item. Run checkout only against a sandbox or
   explicit non-chargeable environment.
5. Create, rename, and delete a saved search/template/workflow only in the
   disposable tenant.
6. Upload and delete a non-sensitive knowledge fixture; verify status and
   access isolation.
7. Sign in as an administrator, impersonate the target account, verify the
   target identity is visible, restore the administrator, and verify no target
   token or state remains.
8. For each enabled provider, execute only its approved low-cost test action
   and verify the resulting UI state plus backend webhook/event record.

### Automation Approach

- Use Playwright with credentials injected through CI secrets, never hardcoded
  in the test source.
- Keep tests serial for account/session/impersonation scenarios to prevent
  cross-test token interference.
- Tag external provider tests separately, for example `@provider-smoke`, and
  run them only when their sandbox configuration is present.
- Capture screenshots, browser console errors, API response metadata with
  sensitive fields redacted, and correlation IDs for failed runs.
- Run the existing API contract smoke before browser smoke:

```bash
pnpm test:e2e:public-api-full
```

## Release Criteria

- Every enabled provider has a documented owner, production secret location,
  webhook URL, rollback switch, and low-cost validation action.
- All required authenticated browser scenarios pass in staging.
- External actions use sandbox credentials or an approved destination allowlist.
- Any unavailable provider is visibly disabled or communicates a recoverable
  setup state; the frontend must not simulate a successful live action.
- The release record links the smoke artifacts and confirms test-data cleanup.

## Ownership Template

| Area | Owner | Evidence | Rollback |
| --- | --- | --- | --- |
| Auth and public API | Platform | Authenticated smoke run | Disable affected integration or rotate session secret. |
| Messaging and voice | Provider operations | Provider console event and webhook correlation ID | Disable sender/assistant and rotate credential. |
| Enrichment and knowledge | Data operations | Test record lifecycle and cost entry | Disable provider/worker and revoke key. |
| Browser smoke | QA/Release | CI artifact, screenshots, redacted trace | Stop promotion and open release incident. |
