# Public API Unresolved Fix Plan - 2026-06-28

## Scope

This document tracks only the public API issues that are not fixed yet after the
successful targeted backend deployment.

Confirmed fixed and out of scope for this plan:

- `GET /api/v1/auth/me`
- `GET /api/v1/auth/profile-setup`
- `GET /api/v1/affiliates/commissions`
- `GET /api/v1/affiliates/payouts`
- `GET /api/v1/affiliates/profile`
- `GET /api/v1/affiliates/admin/applications`
- `GET /api/v1/credits/expiring`
- `GET /api/v1/credits/admin/stats`

## Current Unresolved Summary

- Remaining failures: `16`
- Known infrastructure/config failures: `2`
- Generic backend `500` failures: `9`
- MCP backend `500` failures: `5`
- Latest broad smoke report: `reports/public-api-smoke-latest.json`

## Priority 1: Production Environment / Provider Config

### Direct Mail Redis/Valkey

- Endpoint: `GET /api/v1/messaging/direct-mail/campaigns/{campaign_id}`
- Current status: `503`
- Request ID: `d48d6272f4c126fdee8010e2c7fa4d52`
- Current failure: production is trying to connect to `127.0.0.1:6379`

Fix:

1. Replace production Redis/Valkey localhost config with the managed
   Redis/Valkey service endpoint.
2. Verify pods receive the correct env var or secret value after rollout.
3. If cache/service is unavailable, return a controlled `503` with a stable
   error code instead of leaking a raw connection failure.

Acceptance:

- Endpoint no longer attempts `127.0.0.1:6379` in production.
- Smoke call returns `200`, `404`, or controlled `503`, not raw connection
  failure details.

### USPS Token

- Endpoint: `GET /api/v1/usps/verify-address`
- Current status: `500`
- Request ID: `bb41a1ddf528790373ec979e1b4299e6`
- Current failure: `USPS_API_TOKEN` is not set

Fix:

1. Set `USPS_API_TOKEN` in the production secret/config source if USPS should
   be live.
2. If USPS is optional, return controlled `503 PROVIDER_NOT_CONFIGURED`.
3. Add a test for missing USPS config so it cannot regress to `500`.

Acceptance:

- Missing USPS config returns controlled `503`.
- Configured USPS returns a non-`500` response for smoke input.

## Priority 2: MCP Endpoints

All MCP read endpoints currently return generic `500`.

| Endpoint | Request ID | Error ID |
| --- | --- | --- |
| `GET /api/v1/mcp/status` | `f91a691f7e26fd5e52e34d2f8d03ee38` | `cc4d34fb-ba4f-4914-bd33-17517af6b713` |
| `GET /api/v1/mcp/discovery` | `e312a139107e8492b318a3de09c508bd` | `5766fc9d-37c5-4411-ac1b-75a1ed0d4c49` |
| `GET /api/v1/mcp/tools/list` | `035b93b76ca7b87cf431bc2c39483cf3` | `81029833-392a-4583-a476-53ec902cf059` |
| `GET /api/v1/mcp/resources/list` | `cad80379478297af0ca5cbcfe3399dc3` | `472c537d-a111-49db-a653-d860feaad3b4` |
| `GET /api/v1/mcp/prompts/list` | `8734528615bb86cf7798d77fd9c557e9` | `1c4a1f23-64bc-4222-a859-8f0c29ec41ff` |

Fix:

1. Decide whether MCP is enabled in production.
2. If MCP is disabled or missing configuration, return controlled
   `503 PROVIDER_NOT_CONFIGURED`.
3. If MCP is enabled, verify service URL, credentials, and startup
   registration.
4. Add endpoint tests for configured and unconfigured MCP states.

Acceptance:

- MCP endpoints return `200` with empty/configured state or controlled `503`.
- No MCP read endpoint returns generic `500`.

## Priority 3: Credentials and GHL

| Endpoint | Request ID | Error ID |
| --- | --- | --- |
| `GET /api/v1/integrations/ghl/calendar/auth-url` | `07df78bf858d1e1ff6cdf476182978c9` | `7d83a2df-374e-4142-aa29-62a7350cdd44` |
| `GET /api/v1/integrations/ghl/calendar/status` | `19af8effcf41d257dbbab13f67d79741` | `6e2aa1f0-19ba-4019-acb3-d750414de84d` |
| `GET /api/v1/credentials/{provider}` | `ad6e54817ae8873412f942457f5b63b8` | `1a345b95-af52-444d-92d2-6779f14634aa` |
| `GET /api/v1/credentials/` | `4684a5c8f5fd9d11ff0f5894c5e1cb88` | `f004e05c-090b-468c-b21d-d28a6db34c3c` |

Fix:

1. For unsupported providers like smoke input `smoke-test`, return `400` or
   `404`.
2. For users with no saved credentials, return empty `200` or documented
   not-connected state.
3. For missing GHL client config, return controlled
   `503 PROVIDER_NOT_CONFIGURED`.
4. Preserve intentional auth/permission responses instead of wrapping them as
   `500`.

Acceptance:

- Fake provider input cannot trigger `500`.
- New users with no credentials get an empty or not-connected response.
- GHL missing config is reported as controlled `503`.

## Priority 4: Messaging Thread Lookups

| Endpoint | Request ID | Error ID |
| --- | --- | --- |
| `GET /api/v1/twilio/threads/{recipient}` | `1a5fbd1d68cbaad0ad5c27e86d7c50ef` | `0d7cc703-f3ea-44d4-9c37-9ff48e138e66` |
| `GET /api/v1/messaging/facebook/threads/{recipient_id}` | `fb70605524aa49a6ba5399ea00d04a55` | `8d316583-863d-466e-a93e-c0c9b372575f` |
| `GET /api/v1/messaging/linkedin/threads/{recipient_id}` | `14dc9dd3c179a64ffb4c8bb5eeec6757` | `8f7a29b5-8865-4849-a8c5-601d655bff5e` |

Fix:

1. Validate placeholder recipients and zero UUIDs before provider calls.
2. Return `400` for invalid recipient format or `404` for missing thread.
3. Return controlled `503` when provider credentials are not configured.
4. Add smoke-input regression tests for each messaging provider route.

Acceptance:

- Placeholder recipients do not trigger provider calls that produce `500`.
- Missing threads return `404` or empty documented state.
- Missing provider configuration returns controlled `503`.

## Priority 5: Prospecting and Phone Validation

| Endpoint | Request ID | Error ID |
| --- | --- | --- |
| `GET /api/v1/prospecting/search` | `76e738ca25ffd1ee56526c78c71eeb08` | N/A |
| `GET /api/v1/realphonevalidation/dnc/lookup/{phone}` | `0c0cd2b6432a39d2a61785577784f692` | `c22f276a-f350-47b0-b12d-97bc6c46133d` |

Fix:

1. For prospecting, validate required search criteria before invoking external
   data providers.
2. For unsupported or unconfigured prospecting providers, return controlled
   `400` or `503`.
3. For DNC lookup, validate placeholder phone inputs and missing provider
   credentials before making external calls.
4. Add endpoint tests for empty criteria, fake provider/source values, and
   placeholder phone numbers.

Acceptance:

- Smoke-generated prospecting input returns validation/provider state, not
  `500`.
- Placeholder DNC lookup input returns validation/provider state, not `500`.

## Verification Commands

After fixes are deployed:

```bash
node tools/tests/smoke-public-api.mjs
```

Expected result:

- `failed` should drop from `16`.
- No endpoint should return generic `500`.
- Optional or unconfigured providers should return controlled `503` with stable
  error codes.

## Frontend Impact

No frontend blocker remains for the already fixed auth/profile, affiliate, and
credit endpoints.

Frontend should still treat these unresolved provider and integration endpoints
as potentially unavailable and render `PublicApiError.kind` states instead of
assuming success.
