# Public API Smoke Triage - 2026-06-23

## Run Summary

- API base URL: `https://api.dealscale.io`
- Test user: `codex-smoke-1782188252786@example.com`
- Signup status: `201`
- Login status: `200`
- OpenAPI operations: `173`
- Authenticated non-mutating operations tested: `74`
- Passing non-mutating responses: `55`
- Server failures: `19`
- Mutating operations skipped: `99`
- Full JSON report: `reports/public-api-smoke-latest.json`

The smoke runner intentionally skipped mutating operations by default to avoid
creating charges, sending messages, deleting resources, revoking keys, or making
admin changes. To test a specific mutating endpoint, use
`DEAL_SCALE_SMOKE_ALLOWLIST` with an operation ID or `METHOD /path`.

## High Priority Failures

### Authentication Profile

- `GET /api/v1/auth/profile-setup`
  - Status: `500`
  - Request ID: `9e7d152fd76541ff901283ed86bf58a5`
  - Message: `Failed to get profile setup`
- `GET /api/v1/auth/me`
  - Status: `500`
  - Request ID: `4e7c6b9e67e86361ae84e1cc84868e1a`
  - Message: `UserResponse` validation rejects `first_name` and `last_name` as `None`

These are core authenticated session endpoints and should return valid user
state for a newly created account.

### Affiliate Service Missing Methods

- `GET /api/v1/affiliates/commissions`
  - Request ID: `a7f80e61a76ca5cf81c458bf7d40a2d4`
  - Missing: `AffiliateService.get_commission_history`
- `GET /api/v1/affiliates/payouts`
  - Request ID: `02d574300023c7a8c8ebde9b789f3404`
  - Missing: `AffiliateService.get_payout_history`
- `GET /api/v1/affiliates/profile`
  - Request ID: `dc559c41546a56d10464f29d4d30e71b`
  - Missing: `AffiliateService.get_affiliate_profile`
- `GET /api/v1/affiliates/admin/applications`
  - Request ID: `e02fd35a9d838b8f7af911b2c03bbf21`
  - Missing: `AffiliateService.check_is_admin`

These are implementation gaps: routes exist, but service methods referenced by
handlers are absent.

### Credits Admin/Expiration

- `GET /api/v1/credits/expiring`
  - Status: `500`
  - Request ID: `9e63201b9c0d8d6eddb9240aba0f2dd5`
  - Message: `Failed to check expiring credits`
- `GET /api/v1/credits/admin/stats`
  - Status: `500`
  - Request ID: `cf5827c363fc156ed63fe48b27e00a71`
  - Missing: `app.services.credit_service.check_is_admin`

### Infrastructure / Environment

- `GET /api/v1/messaging/direct-mail/campaigns/{campaign_id}`
  - Status: `503`
  - Request ID: `28f5086c6b46e26aae02115e6e7117bf`
  - Message: `Error 111 connecting to 127.0.0.1:6379. Connection refused`
- `GET /api/v1/usps/verify-address`
  - Status: `500`
  - Request ID: `7e64833424b8edbe89b44c6ee1639cc1`
  - Message: `USPS_API_TOKEN not set`

These point to production environment/configuration issues rather than frontend
gateway behavior.

## Generic 500s Needing Backend Log Correlation

- `GET /api/v1/prospecting/search`
  - Request ID: `98ecc6c6b3b83bfa97bceedf63de7a0c`
- `GET /api/v1/integrations/ghl/calendar/auth-url`
  - Request ID: `9d60aea27a2f01576ca78b80c1c88a79`
  - Error ID: `8876a788-4f46-4645-96d1-5d7722afaa88`
- `GET /api/v1/integrations/ghl/calendar/status`
  - Request ID: `b799b4e588b0513d7832206846c55d19`
  - Error ID: `4df2bfeb-b30c-49c0-b548-1c81c9c3892d`
- `GET /api/v1/credentials/{provider}`
  - Request ID: `c4fad21a2ff10e25c949d601a5ce326d`
  - Error ID: `60f675f2-b2e3-4b3d-9792-1be5b5f08376`
- `GET /api/v1/credentials/`
  - Request ID: `217d73cc31abc2b674dceec5986609a0`
  - Error ID: `776f9d58-ab28-4bc9-bdcb-21aac0a8d77b`
- `GET /api/v1/twilio/threads/{recipient}`
  - Request ID: `6ce4fd3301222b48dc1dbdc5b700b2e9`
  - Error ID: `71b5dcb2-8e7a-48c5-afc0-f1b8f85af8ff`
- `GET /api/v1/messaging/facebook/threads/{recipient_id}`
  - Request ID: `e24169a2a2b6e6a2a369c3a0da644725`
  - Error ID: `dfb43367-7e61-4c9a-96fb-52960247df9d`
- `GET /api/v1/messaging/linkedin/threads/{recipient_id}`
  - Request ID: `798805b7a594fa4c0e2c90d34e4f445d`
  - Error ID: `397013b7-1708-44e3-bc5f-746700266d99`
- `GET /api/v1/realphonevalidation/dnc/lookup/{phone}`
  - Request ID: `33b8c7ee62d692f843a1c7758409c587`
  - Error ID: `e83802ec-0ed0-4689-b4d1-2d3f2b651b81`

## Recommended Backend Fix Order

1. Fix `/auth/me` user response serialization so new users always return string
   `first_name` and `last_name` values, or update the response schema to allow
   nullable names.
2. Fix `/auth/profile-setup` for newly created users.
3. Restore or implement missing affiliate and credit service methods referenced
   by active routes.
4. Fix production infrastructure variables: Redis/Valkey endpoint and
   `USPS_API_TOKEN`.
5. Use the request IDs above to inspect backend logs for the remaining generic
   `500` responses.

## Follow-up - 2026-06-25

### Local Code Fixes Applied

- `/api/v1/auth/me`
  - Added safe serialization for nullable `first_name` and `last_name` values.
  - Expected result after deploy: newly created users should no longer fail
    `UserResponse` validation when names are missing.
- `/api/v1/auth/profile-setup`
  - Added defensive defaults for profile setup fields.
  - Added `created_at` and `updated_at` attributes to the service model so the
    route does not crash when returning setup state.
- Affiliate service gaps
  - Added `AffiliateService.get_commission_history`.
  - Added `AffiliateService.get_payout_history`.
  - Added `AffiliateService.get_affiliate_profile`.
  - Added `AffiliateService.check_is_admin`.
  - Admin route handlers now preserve intentional `403` responses instead of
    wrapping them as `500`.
- Credit service gaps
  - Added `credit_service.get_expiring_credits`.
  - Added `credit_service.check_is_admin`.
  - Added `credit_service.get_system_stats`.
  - Admin route handlers now preserve intentional `403` responses instead of
    wrapping them as `500`.

### Local Verification

Ran syntax compilation against touched backend modules:

```bash
python -m py_compile \
  backend/app/api/routes/auth.py \
  backend/app/api/routes/affiliates.py \
  backend/app/api/routes/credits.py \
  backend/app/services/auth_service.py \
  backend/app/services/affiliate_service.py \
  backend/app/services/credit_service.py
```

Result: passed.

### Next Steps

1. Review and deploy the local fixes to the production API environment.
2. Re-run the public API smoke test against `https://api.dealscale.io` after
   deployment.
3. Confirm these endpoints no longer return `500`:
   - `GET /api/v1/auth/me`
   - `GET /api/v1/auth/profile-setup`
   - `GET /api/v1/affiliates/commissions`
   - `GET /api/v1/affiliates/payouts`
   - `GET /api/v1/affiliates/profile`
   - `GET /api/v1/credits/expiring`
4. Confirm admin endpoints return `403` for non-admin smoke users rather than
   `500`:
   - `GET /api/v1/affiliates/admin/applications`
   - `GET /api/v1/credits/admin/stats`
5. Fix production environment issues separately:
   - Replace any `127.0.0.1:6379` Redis/Valkey configuration in production
     pods with the cluster/service Redis endpoint.
   - Set `USPS_API_TOKEN` in the production secret/config source if USPS
     address verification should be live.
6. Use the request IDs in the generic failure section to correlate backend logs
   for the remaining `500` responses after the targeted fixes are deployed.

### Remaining Risk

- The affiliate and credit methods added here are conservative read-safe
  implementations. They prevent route crashes, but commission/payout/history
  persistence still needs product-level validation if these endpoints are
  expected to return real financial records.
- The live smoke report will not improve until these local changes are deployed
  to the environment serving `https://api.dealscale.io`.

## Follow-up - 2026-06-28

### Deployment Verification

- Production deployment completed through GitHub Actions run `28336435460`.
- Final run conclusion: `success`.
- Relevant successful jobs:
  - `Build & Push Docker Image`
  - `Deploy to Staging (K8s)`
  - `ZAP DAST (Baseline) on Staging`
  - `Deploy to PROD (Blue/Green)`
- Prod blue/green completed inactive rollout, inactive smoke test, traffic
  flip, and post-cutover tidy.

### Targeted Production Smoke

- API base URL: `https://api.dealscale.io`
- Report: `reports/public-api-targeted-smoke-2026-06-28.json`
- Targeted checks: `9`
- Server failures: `0`
- Smoke user was created with the required traditional signup fields because
  the current signup route intentionally rejects missing `first_name` and
  `last_name`.

| Check | Expected | Result |
| --- | --- | --- |
| `POST /api/v1/auth/signup` | `201` | `201` |
| `GET /api/v1/auth/me` | no `500` | `200` |
| `GET /api/v1/auth/profile-setup` | no `500` | `200` |
| `GET /api/v1/affiliates/commissions` | no `500` | `200` |
| `GET /api/v1/affiliates/payouts` | no `500` | `200` |
| `GET /api/v1/affiliates/profile` | no `500` | `200` |
| `GET /api/v1/affiliates/admin/applications` | `403` for non-admin | `403` |
| `GET /api/v1/credits/expiring` | no `500` | `200` |
| `GET /api/v1/credits/admin/stats` | `403` for non-admin | `403` |

### Current Status

- The targeted code fixes from 2026-06-25 are deployed and verified for the
  endpoints listed above.
- The previous affiliate/credit service missing-method failures are no longer
  reproducible in the targeted production smoke.
- The previous `/auth/me` and `/auth/profile-setup` `500` failures are no
  longer reproducible in the targeted production smoke.

### Remaining Next Steps

1. Re-run the broader OpenAPI non-mutating smoke runner if/when the original
   runner is available. The repo currently only has the historical report
   reference, not the smoke runner itself.
2. Fix production environment issues that were out of scope for the code deploy:
   Redis/Valkey should not point at `127.0.0.1:6379`, and `USPS_API_TOKEN`
   should be set if USPS verification is expected to be live.
3. Continue correlating backend logs for any remaining generic `500` endpoints
   from the original report after a full OpenAPI smoke rerun.
