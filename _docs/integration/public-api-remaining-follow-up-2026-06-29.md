# Public API Remaining Follow-Up - 2026-06-29

Update 2026-08-06: this report is historical. Backend production deploy run
`31128423643` succeeded, production health passed, and Matrix v13 reported
`104/104` passed, `0` failed, `0` skipped, and `cleanup_failed: 0`. Backend docs
were reconciled in commit `324881c` (`docs: reconcile backend BE closure
status`). No new backend deploy is required for that documentation-only commit.

Current remaining work is not backend BE endpoint work:

- frontend wiring, especially `BE-07` NextAuth impersonation exchange/restore;
- frontend adapters/routes for delivered contracts;
- provider operations/configuration for real Twilio, SendBlue, VAPI,
  enrichment, and knowledge processing;
- future product evolution for richer permissions or provider-specific
  processing beyond current contracts.

## Historical Full E2E Status

- API base URL: `https://api.dealscale.io`
- Generated at: `2026-06-29T19:48:24.170Z`
- OpenAPI operations executed: `173`
- Successful responses: `67`
- Controlled client errors: `91`
- Expected provider-unavailable responses: `3`
- Failed: `12`
- Skipped: `0`
- API keys revoked during cleanup: `1`
- Cart cleanup: passed
- Logout: passed
- Command exit status: failed as expected at the time while endpoint failures
  remained

Run the complete suite with:

```bash
pnpm test:e2e:public-api-full
```

## Historical Backend Failures

The following operations returned `500 SERVER_ERROR` in the 2026-06-29 report.
They are superseded by Matrix v13 unless a newer smoke run reopens a specific
failure:

| Method | Endpoint | Observed issue |
| --- | --- | --- |
| `POST` | `/api/v1/auth/social` | Generic unexpected server error |
| `PUT` | `/api/v1/auth/profile-setup` | Failed to update profile setup |
| `DELETE` | `/api/v1/integrations/ghl/calendar/` | Generic unexpected server error |
| `POST` | `/api/v1/affiliates/payout/request` | `AffiliateService.request_payout` is missing |
| `POST` | `/api/v1/affiliates/links/generate` | `AffiliateService.generate_referral_link` is missing |
| `POST` | `/api/v1/credits/transfer` | A domain `400` for insufficient credits is incorrectly wrapped as `500` |
| `POST` | `/api/v1/twilio/receive` | Generic unexpected server error |
| `POST` | `/api/v1/messaging/direct-mail/send` | Code expects an object with `id` but receives a dictionary |
| `POST` | `/api/v1/messaging/facebook/send` | Generic unexpected server error |
| `POST` | `/api/v1/messaging/facebook/comment-to-dm` | Generic unexpected server error |
| `POST` | `/api/v1/messaging/linkedin/send` | Generic unexpected server error |

The following operation exceeded the E2E request timeout in the historical run:

| Method | Endpoint | Failure |
| --- | --- | --- |
| `POST` | `/api/v1/enrich/sherlock_username` | Aborted after `30,000 ms` |

## Historical Response Contract Issues

Several operations return `200` while their response message describes an
application failure in the historical report. These should only be treated as
current work if reproduced after Matrix v13:

- `POST /api/v1/testers/apply`: `Internal error processing application`
- `POST /api/v1/cart/items/{item_id}`: `Item not found in cart`
- `DELETE /api/v1/cart/items/{item_id}`: `Item not found in cart`
- `POST /api/v1/cart/checkout`: `Error processing checkout`

## Provider Configuration

Provider configuration remains a separate operations/product concern, not a
missing backend BE endpoint. Controlled provider-unavailable states should use
stable error codes. Historical expected controlled states included:

- GHL Google Calendar OAuth: `503 PROVIDER_NOT_CONFIGURED`
- USPS address verification: `503 PROVIDER_NOT_CONFIGURED`

The E2E runner accepts these only when the top-level error code is exactly
`PROVIDER_NOT_CONFIGURED`. Other `5xx` responses fail.

## Cleanup And Safety

The full E2E runner now:

- Executes mutating and read-only operations with zero skips.
- Defers logout until all authenticated operations and cleanup complete.
- Revokes API keys created during the run and verifies they are absent.
- Clears the test account cart.
- Redacts access tokens, refresh tokens, API keys, passwords, and secrets from
  the saved report.
- Aborts individual requests after 30 seconds.
- Exits nonzero for endpoint failures, skipped operations, or cleanup failures.

Production exposes an asynchronous account-deletion request endpoint. It does
not immediately hard-delete an account, so signup-based test cleanup must not
treat an accepted deletion request as synchronous teardown.

Recommended support for future smoke coverage:

- Add an authenticated test-account teardown endpoint restricted to nonproduction
  environments, or provide a scheduled cleanup job keyed by an E2E run ID.
- Provide sandbox provider credentials and destinations for messaging, payments,
  voice, enrichment, and direct mail success-path tests.
- Add delete/reset operations for test-owned affiliate, tester, campaign, team,
  and provider resources.

## Additional Existing Follow-Up

- Auth-gated admin and secrets responses must not expose database resolution
  details in public `401` messages.
- Sentiment endpoints should bundle required TextBlob/NLTK corpora or return a
  controlled provider/runtime-unavailable response.
