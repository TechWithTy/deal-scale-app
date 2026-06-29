# Public API Full E2E Backend Failure Report - 2026-06-29

## Run Summary

- Environment: production
- API base URL: `https://api.dealscale.io`
- Generated at: `2026-06-29T19:48:24.170Z`
- Command: `pnpm test:e2e:public-api-full`
- OpenAPI operations executed: `173`
- Skipped: `0`
- Passed by transport/error-envelope policy: `161`
- Hard failures: `12`
- Cleanup: API key revoked and verified absent, cart cleared, logout passed

The command correctly exited with status `1`.

## Hard Failures

### 1. Social OAuth Linkage

- Request: `POST /api/v1/auth/social`
- Status: `500 SERVER_ERROR`
- Request ID: `2309bf99d8a38f5a4521ed2369609ee9`
- Error ID: `2f2c5271-7b07-4e81-b4e5-3e5e3791f762`
- Message: `An unexpected error occurred`
- Expected: invalid generated OAuth data should return a controlled `400` or
  provider/auth-specific error.

### 2. Profile Setup Update

- Request: `PUT /api/v1/auth/profile-setup`
- Status: `500 SERVER_ERROR`
- Request ID: `27e433a48aa0f9b3ddb76fd706905d41`
- Message: `Failed to update profile setup`
- Expected: reject invalid profile data with `400 VALIDATION_ERROR`, or process
  a valid authenticated update.

### 3. Sherlock Username Enrichment

- Request: `POST /api/v1/enrich/sherlock_username`
- Result: request aborted after `30,003 ms`
- Expected: complete within 30 seconds or return a controlled timeout/provider
  unavailable response.

### 4. GHL Calendar Disconnect

- Request: `DELETE /api/v1/integrations/ghl/calendar/`
- Status: `500 SERVER_ERROR`
- Request ID: `a71c75d83e55234d32ed724c093ca7b1`
- Error ID: `e89982b4-ee20-4363-92f9-2b870796c6bf`
- Message: `An unexpected error occurred`
- Expected: return `204/200` when disconnected, `404` when no connection
  exists, or `503 PROVIDER_NOT_CONFIGURED`.

### 5. Affiliate Payout Request

- Request: `POST /api/v1/affiliates/payout/request`
- Status: `500 SERVER_ERROR`
- Request ID: `e87ebabd0bdad81c48e2f3be5e605f36`
- Message: `AffiliateService object has no attribute request_payout`
- Expected: implement the service method or remove the public route until
  supported. Do not expose Python implementation details.

### 6. Affiliate Referral Link

- Request: `POST /api/v1/affiliates/links/generate`
- Status: `500 SERVER_ERROR`
- Request ID: `5f53fce61350809590885b318e6e389d`
- Message: `AffiliateService object has no attribute generate_referral_link`
- Expected: implement the service method or remove the public route until
  supported. Do not expose Python implementation details.

### 7. Credit Transfer

- Request: `POST /api/v1/credits/transfer`
- Status: `500 SERVER_ERROR`
- Request ID: `841e86bde65ac38eeab7ad50be58e8c4`
- Message: `Failed to transfer credits: 400: Sender has no lead credits`
- Expected: preserve the domain error as `400` or `422`; do not wrap it as
  `500`.

### 8. Twilio Inbound Message

- Request: `POST /api/v1/twilio/receive`
- Status: `500 SERVER_ERROR`
- Request ID: `2cf0fea224d35ee2868e9894b654918e`
- Error ID: `b40cc146-724a-40a5-b2b7-56bbe6f77457`
- Message: `An unexpected error occurred`
- Expected: malformed webhook data should return controlled validation or
  signature-authentication errors.

### 9. Direct Mail Send

- Request: `POST /api/v1/messaging/direct-mail/send`
- Status: `500 SERVER_ERROR`
- Request ID: `b45fc9a812b9df1d04b1919ddde483c4`
- Message: `Failed to create mailer: dict object has no attribute id`
- Expected: fix the dictionary/object contract mismatch and return controlled
  validation or provider errors. Do not expose implementation details.

### 10. Facebook Message Send

- Request: `POST /api/v1/messaging/facebook/send`
- Status: `500 SERVER_ERROR`
- Request ID: `66c50499fb7fc920d1e82555782506d5`
- Error ID: `e37ee46a-5651-4bb4-9593-b055fc1d166b`
- Message: `An unexpected error occurred`
- Expected: invalid recipients or missing provider configuration should return
  controlled `400` or `503` envelopes.

### 11. Facebook Comment-To-DM

- Request: `POST /api/v1/messaging/facebook/comment-to-dm`
- Status: `500 SERVER_ERROR`
- Request ID: `10c4da83554f13e0d079e8971fe69c92`
- Error ID: `cbca6fbd-7b82-4cf1-897c-dbdf719df97e`
- Message: `An unexpected error occurred`
- Expected: invalid source/comment data or missing provider configuration should
  return controlled `400` or `503` envelopes.

### 12. LinkedIn Message Send

- Request: `POST /api/v1/messaging/linkedin/send`
- Status: `500 SERVER_ERROR`
- Request ID: `76bddd5aa74746577fd2e548ba583f38`
- Error ID: `27ae4762-5342-4eb2-a09a-c2021d987117`
- Message: `An unexpected error occurred`
- Expected: invalid recipients or missing provider configuration should return
  controlled `400` or `503` envelopes.

## Incorrect Success Responses

These requests returned `200`, but the response message indicates failure:

| Method | Endpoint | Response message | Recommended status |
| --- | --- | --- | --- |
| `POST` | `/api/v1/testers/apply` | `Internal error processing application` | `500` with stable public envelope |
| `POST` | `/api/v1/testers/{tester_id}/approve` | `Tester application not found` | `404 NOT_FOUND` |
| `POST` | `/api/v1/features/{feature_id}/vote` | `You must be an approved beta or pilot tester` | `403 FORBIDDEN` |
| `GET` | `/api/v1/affiliates/stats` | `Error retrieving affiliate statistics` | Appropriate `4xx/5xx` |
| `PUT` | `/api/v1/cart/items/{item_id}` | `Item not found in cart` | `404 NOT_FOUND` |
| `DELETE` | `/api/v1/cart/items/{item_id}` | `Item not found in cart` | `404 NOT_FOUND` |
| `POST` | `/api/v1/cart/checkout` | `Error processing checkout` | Appropriate `4xx/5xx` |

## Acceptance Criteria

1. All malformed or placeholder inputs return stable `4xx` validation,
   authorization, or not-found envelopes.
2. Optional unconfigured providers return
   `503 PROVIDER_NOT_CONFIGURED`.
3. Domain `4xx` errors are not converted to `500`.
4. Public messages do not expose class names, missing methods, database errors,
   or Python object-type details.
5. Sherlock enrichment completes or returns a controlled response within 30
   seconds.
6. Endpoints do not return `200` when the operation failed.
7. Rerunning `pnpm test:e2e:public-api-full` produces:
   - `173` executed
   - `0` skipped
   - `0` hard failures
   - cleanup verified

## Evidence

Machine-readable results:

```text
reports/public-api-smoke-latest.json
```

The report redacts raw API keys and authentication secrets.
