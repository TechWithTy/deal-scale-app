# Public API Remaining Failures - 2026-06-28

## Run Summary

- API base URL: `https://api.dealscale.io`
- Report: `reports/public-api-smoke-latest.json`
- Generated at: `2026-06-28T22:14:29.719Z`
- Test user: `codex-smoke-1782684837663@example.com`
- Signup status: `201`
- Login status: `200`
- OpenAPI operations: `173`
- Passing non-mutating responses: `58`
- Remaining failures: `16`
- Mutating operations skipped: `99`

## Confirmed Fixed Since Original Triage

These original high-priority failures are no longer present in the broad smoke:

- `GET /api/v1/auth/me` now returns `200`
- `GET /api/v1/auth/profile-setup` now returns `200`
- `GET /api/v1/affiliates/commissions` now returns `200`
- `GET /api/v1/affiliates/payouts` now returns `200`
- `GET /api/v1/affiliates/profile` now returns `200`
- `GET /api/v1/affiliates/admin/applications` now returns `403` for a non-admin smoke user
- `GET /api/v1/credits/expiring` now returns `200`
- `GET /api/v1/credits/admin/stats` now returns `403` for a non-admin smoke user

## Remaining Failures by Category

### Production Environment / Provider Configuration

These should be fixed through production config or converted to controlled provider-unavailable responses.

| Endpoint | Status | Request ID | Current failure |
| --- | --- | --- | --- |
| `GET /api/v1/messaging/direct-mail/campaigns/{campaign_id}` | `503` | `d48d6272f4c126fdee8010e2c7fa4d52` | Valkey/Redis connection still points at `127.0.0.1:6379` |
| `GET /api/v1/usps/verify-address` | `500` | `bb41a1ddf528790373ec979e1b4299e6` | `USPS_API_TOKEN` is not set |

Recommended fixes:

1. Update production Redis/Valkey configuration to use the real managed service endpoint, not localhost.
2. Set `USPS_API_TOKEN` if USPS address verification should be live.
3. If USPS is optional, return a controlled `503` with a stable provider-not-configured error code instead of `500`.

### Backend Generic 500s

These still need backend log correlation using `request_id` and `error_id`.

| Endpoint | Status | Request ID | Error ID |
| --- | --- | --- | --- |
| `GET /api/v1/prospecting/search` | `500` | `76e738ca25ffd1ee56526c78c71eeb08` | N/A |
| `GET /api/v1/integrations/ghl/calendar/auth-url` | `500` | `07df78bf858d1e1ff6cdf476182978c9` | `7d83a2df-374e-4142-aa29-62a7350cdd44` |
| `GET /api/v1/integrations/ghl/calendar/status` | `500` | `19af8effcf41d257dbbab13f67d79741` | `6e2aa1f0-19ba-4019-acb3-d750414de84d` |
| `GET /api/v1/credentials/{provider}` | `500` | `ad6e54817ae8873412f942457f5b63b8` | `1a345b95-af52-444d-92d2-6779f14634aa` |
| `GET /api/v1/credentials/` | `500` | `4684a5c8f5fd9d11ff0f5894c5e1cb88` | `f004e05c-090b-468c-b21d-d28a6db34c3c` |
| `GET /api/v1/twilio/threads/{recipient}` | `500` | `1a5fbd1d68cbaad0ad5c27e86d7c50ef` | `0d7cc703-f3ea-44d4-9c37-9ff48e138e66` |
| `GET /api/v1/messaging/facebook/threads/{recipient_id}` | `500` | `fb70605524aa49a6ba5399ea00d04a55` | `8d316583-863d-466e-a93e-c0c9b372575f` |
| `GET /api/v1/messaging/linkedin/threads/{recipient_id}` | `500` | `14dc9dd3c179a64ffb4c8bb5eeec6757` | `8f7a29b5-8865-4849-a8c5-601d655bff5e` |
| `GET /api/v1/realphonevalidation/dnc/lookup/{phone}` | `500` | `0c0cd2b6432a39d2a61785577784f692` | `c22f276a-f350-47b0-b12d-97bc6c46133d` |

Recommended fixes:

1. For fake smoke inputs like `smoke-test`, zero UUIDs, or placeholder phone numbers, return `400`, `404`, or an empty `200` response.
2. For missing third-party credentials, return `401`, `403`, or controlled `503`, not generic `500`.
3. Use the request IDs above to inspect production logs and add route-level regression tests for each repaired handler.

### MCP Endpoint Failures

All MCP read endpoints currently return generic `500`.

| Endpoint | Status | Request ID | Error ID |
| --- | --- | --- | --- |
| `GET /api/v1/mcp/status` | `500` | `f91a691f7e26fd5e52e34d2f8d03ee38` | `cc4d34fb-ba4f-4914-bd33-17517af6b713` |
| `GET /api/v1/mcp/discovery` | `500` | `e312a139107e8492b318a3de09c508bd` | `5766fc9d-37c5-4411-ac1b-75a1ed0d4c49` |
| `GET /api/v1/mcp/tools/list` | `500` | `035b93b76ca7b87cf431bc2c39483cf3` | `81029833-392a-4583-a476-53ec902cf059` |
| `GET /api/v1/mcp/resources/list` | `500` | `cad80379478297af0ca5cbcfe3399dc3` | `472c537d-a111-49db-a653-d860feaad3b4` |
| `GET /api/v1/mcp/prompts/list` | `500` | `8734528615bb86cf7798d77fd9c557e9` | `1c4a1f23-64bc-4222-a859-8f0c29ec41ff` |

Recommended fixes:

1. Determine whether MCP is expected to be enabled in production.
2. If disabled or not configured, return a controlled `503` provider-not-configured response.
3. If enabled, verify required MCP service URLs, credentials, and startup registration in production.

## Recommended Fix Order

1. Fix production Redis/Valkey and USPS configuration because these are known environment failures.
2. Fix MCP routes as one batch because all five endpoints share the same feature area and failure shape.
3. Fix credential and GHL endpoints to return controlled missing-credential or not-connected states.
4. Fix messaging thread endpoints to handle placeholder IDs and missing provider credentials.
5. Fix prospecting and DNC lookup to return validation/provider errors for smoke inputs instead of generic `500`.
6. Re-run `node tools/tests/smoke-public-api.mjs` and update this report.
