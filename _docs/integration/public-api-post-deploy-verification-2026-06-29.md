# Public API Post-Deployment Verification - 2026-06-29

## Deployment Under Test

- Production API: `https://api.dealscale.io`
- Backend commit: `0a7143d`
- Backend workflow: `28399416697`
- E2E generated at: `2026-06-29T20:29:46.045Z`
- Command: `pnpm test:e2e:public-api-full`

## Result

- OpenAPI operations executed: `173`
- Passed: `170`
- Failed: `3`
- Skipped: `0`
- Controlled client errors: `103`
- Expected unavailable-provider/service responses: `7`
- Successful responses: `60`
- Cleanup: passed
  - API keys revoked: `1`
  - API-key absence verified
  - Cart cleared
  - Logout completed

The command correctly exited with status `1` because three failures remain.

## Remaining Failures

### TheHarvester Domain Enrichment Timeout

- Request: `POST /api/v1/enrich/theharvester_domain`
- Result: no response before the client deadline
- Duration: `30,006 ms`
- Client error: `The operation was aborted due to timeout`
- Expected: complete within 30 seconds or return a controlled
  `503 PROVIDER_UNAVAILABLE` response before the deadline.

### Tester Application

- Request: `POST /api/v1/testers/apply`
- Status: `500`
- Error code: `SERVER_ERROR`
- Message: `Internal error processing application`
- Request ID: `e279f2b72eae7f58e190b101875b77bb`
- Assessment: the incorrect `200` response is fixed, but the underlying
  application failure remains. Keep this as a backend failure until valid test
  input succeeds or invalid input receives a controlled `400/409`.

### Twilio Inbound Message

- Request: `POST /api/v1/twilio/receive`
- Status: `500`
- Error code: `SERVER_ERROR`
- Message: `An unexpected error occurred`
- Request ID: `737ff110cb0e2829bfa6dccb02ef0e59`
- Error ID: `3ef58995-0fdc-4b7d-8263-b645a309e5d8`
- Expected: malformed webhook data or an invalid signature should return the
  documented controlled `400/401` response.

## Verified Resolved

The following previously failing operations now return controlled contracts:

| Endpoint | Production result |
| --- | --- |
| `POST /api/v1/auth/social` | `400 VALIDATION_ERROR` |
| `PUT /api/v1/auth/profile-setup` | `400 VALIDATION_ERROR` |
| `POST /api/v1/enrich/sherlock_username` | `503 PROVIDER_UNAVAILABLE` |
| `DELETE /api/v1/integrations/ghl/calendar/` | `503 PROVIDER_NOT_CONFIGURED` |
| `POST /api/v1/affiliates/payout/request` | `400 VALIDATION_ERROR` |
| `POST /api/v1/affiliates/links/generate` | `400 VALIDATION_ERROR` |
| `POST /api/v1/credits/transfer` | `400 VALIDATION_ERROR` |
| `POST /api/v1/messaging/direct-mail/send` | `503 PROVIDER_NOT_CONFIGURED` |
| `POST /api/v1/messaging/facebook/send` | `400 VALIDATION_ERROR` |
| `POST /api/v1/messaging/facebook/comment-to-dm` | `400 VALIDATION_ERROR` |
| `POST /api/v1/messaging/linkedin/send` | `400 VALIDATION_ERROR` |

The following incorrect-success responses are also corrected:

| Endpoint | Production result |
| --- | --- |
| `POST /api/v1/testers/{tester_id}/approve` | `404 NOT_FOUND` |
| `POST /api/v1/features/{feature_id}/vote` | `403 AUTH_FORBIDDEN` |
| `GET /api/v1/affiliates/stats` | Successful `200` response |
| `PUT /api/v1/cart/items/{item_id}` | `404 NOT_FOUND` |
| `DELETE /api/v1/cart/items/{item_id}` | `404 NOT_FOUND` |
| `POST /api/v1/cart/checkout` | `503 SERVICE_UNAVAILABLE` |

## Contract Differences

The deployment note expected `422 VALIDATION_ERROR` for social OAuth and empty
profile setup updates. Production returned `400 VALIDATION_ERROR` for both.
Frontend handling is code-based, so this does not block the client, but the
backend documentation and tests should use one status consistently.

## Frontend Verification

The public API client now branches on stable top-level `error.code` values:

- `VALIDATION_ERROR`
- `NOT_FOUND`
- `AUTH_FORBIDDEN`
- `PROVIDER_NOT_CONFIGURED`
- `PROVIDER_UNAVAILABLE`
- `SERVICE_UNAVAILABLE`

An uncoded generic `503` remains a server error rather than being treated as an
expected provider state. No behavior depends on parsing `error.message`.

Verification:

```text
_tests/api/public-api-client.test.ts: 9 passed
pnpm typecheck: passed
```

## Backend Acceptance Criteria

1. TheHarvester returns a response within 30 seconds.
2. Tester application returns a successful response for valid input or a
   controlled `400/409` for invalid state.
3. Twilio receive returns controlled `400/401` for malformed or unsigned test
   webhook data.
4. `pnpm test:e2e:public-api-full` reports `173` executed, `0` skipped, and `0`
   failed.
