# Public API Backend Handoff - 2026-06-29

## Summary

The public API smoke test improved significantly after the latest backend fixes.
The remaining work is now limited to two generic messaging `500` failures and
two provider-configuration `503` responses that still use a top-level
`SERVER_ERROR` code.

- API base URL: `https://api.dealscale.io`
- Report: `reports/public-api-smoke-latest.json`
- Generated at: `2026-06-29T18:22:35.171Z`
- Test user: `codex-smoke-1782757314568@example.com`
- Signup status: `201`
- Login status: `200`
- OpenAPI operations: `173`
- Passing non-mutating responses: `70`
- Failing responses: `4`
- Mutating operations skipped: `99`

## Remaining Hard Failures

### GHL Google Calendar OAuth auth URL

- Endpoint: `GET /api/v1/integrations/ghl/calendar/auth-url`
- Current status: `503`
- Request ID: `cbd43183bc5eadcc7277fda5b61a8d93`
- Current top-level error code: `SERVER_ERROR`
- Nested detail:

```json
{
  "error": "PROVIDER_NOT_CONFIGURED",
  "provider": "GHL_GOOGLE_CALENDAR",
  "message": "GoHighLevel Google Calendar OAuth is not configured."
}
```

Backend request:

1. If GHL Google Calendar OAuth is optional or not configured in this
   environment, return a controlled provider-unavailable envelope.
2. Promote the stable provider code to the top-level `error.code`, for example
   `PROVIDER_NOT_CONFIGURED`, instead of returning top-level `SERVER_ERROR`.
3. Keep status `503` if the provider is intentionally unavailable.

Expected response shape:

```json
{
  "request_id": "...",
  "error": {
    "code": "PROVIDER_NOT_CONFIGURED",
    "message": "GoHighLevel Google Calendar OAuth is not configured.",
    "details": {
      "provider": "GHL_GOOGLE_CALENDAR"
    }
  },
  "timestamp": "...",
  "path": "/api/v1/integrations/ghl/calendar/auth-url"
}
```

### Facebook thread lookup

- Endpoint: `GET /api/v1/messaging/facebook/threads/{recipient_id}`
- Smoke URL:
  `https://api.dealscale.io/api/v1/messaging/facebook/threads/00000000-0000-4000-8000-000000000000`
- Current status: `500`
- Request ID: `d43581f06c2e35da4db69bf9480f6649`
- Error ID: `04542cc1-ad91-4c36-8e65-3c40baff28f8`
- Current error: generic `SERVER_ERROR`

Backend request:

1. Validate placeholder, zero UUID, or otherwise invalid `recipient_id` before
   making provider calls.
2. Return `400 VALIDATION_ERROR` for invalid recipient IDs, or `404 NOT_FOUND`
   if the ID is syntactically valid but no thread exists.
3. If the Facebook provider is not configured, return controlled
   `503 PROVIDER_NOT_CONFIGURED`.
4. Add a route regression test using the zero UUID smoke input above.

Acceptance:

- The smoke URL does not return `500`.
- No provider call is attempted for known invalid placeholder IDs.
- Response contains a stable top-level `error.code`.

### LinkedIn thread lookup

- Endpoint: `GET /api/v1/messaging/linkedin/threads/{recipient_id}`
- Smoke URL:
  `https://api.dealscale.io/api/v1/messaging/linkedin/threads/00000000-0000-4000-8000-000000000000`
- Current status: `500`
- Request ID: `a7d3d408c5989c88557187aad0626113`
- Error ID: `b658290c-f1f4-49e0-85eb-cbbbda6075da`
- Current error: generic `SERVER_ERROR`

Backend request:

1. Validate placeholder, zero UUID, or otherwise invalid `recipient_id` before
   making provider calls.
2. Return `400 VALIDATION_ERROR` for invalid recipient IDs, or `404 NOT_FOUND`
   if the ID is syntactically valid but no thread exists.
3. If the LinkedIn provider is not configured, return controlled
   `503 PROVIDER_NOT_CONFIGURED`.
4. Add a route regression test using the zero UUID smoke input above.

Acceptance:

- The smoke URL does not return `500`.
- No provider call is attempted for known invalid placeholder IDs.
- Response contains a stable top-level `error.code`.

### USPS address verification

- Endpoint: `GET /api/v1/usps/verify-address`
- Smoke URL:
  `https://api.dealscale.io/api/v1/usps/verify-address?street_address=smoke-test`
- Current status: `503`
- Request ID: `ef28113a0691f2aea1a81ea33404cb5d`
- Current top-level error code: `SERVER_ERROR`
- Nested detail:

```json
{
  "error_code": "PROVIDER_NOT_CONFIGURED",
  "provider": "usps",
  "message": "USPS provider is not configured"
}
```

Backend request:

1. If USPS should be live in production, configure the required USPS secret or
   token in the production secret source.
2. If USPS is optional, keep returning `503`, but promote the stable provider
   code to top-level `error.code`.
3. Avoid reporting this case as top-level `SERVER_ERROR`.

Expected response shape:

```json
{
  "request_id": "...",
  "error": {
    "code": "PROVIDER_NOT_CONFIGURED",
    "message": "USPS provider is not configured",
    "details": {
      "provider": "usps"
    }
  },
  "timestamp": "...",
  "path": "/api/v1/usps/verify-address"
}
```

## Other Non-2xx Responses Counted As Pass

The smoke script currently treats `400-499` as acceptable because validation,
authorization, and missing-resource responses are expected for generated smoke
inputs. These are not counted as hard failures, but a few should still be
reviewed.

### Production DB error details leak through auth responses

The following endpoints return `401 AUTH_REQUIRED`, but the message includes a
database hostname resolution error:

- `GET /api/v1/admin/users/search`
- `GET /api/v1/admin/users/{user_id}/logs`
- `GET /api/v1/secrets/status`
- `GET /api/v1/secrets/rotation-status`

Observed message excerpt:

```text
Could not validate credentials: (psycopg.OperationalError) failed to resolve host 'dpg-d1455bvfte5s73e00r40-a'
```

Backend request:

1. Do not expose internal database hostnames or driver errors in public API
   responses.
2. Return a stable auth error message to clients.
3. Log the operational detail server-side with the request ID.
4. Verify whether the unresolved database hostname reflects a real production
   configuration issue.

### Sentiment endpoint has missing TextBlob corpora

- Endpoint: `GET /api/v1/sentiment/analyze`
- Current status: `400`
- Current error code: `VALIDATION_ERROR`
- Current message reports missing TextBlob/NLTK corpora.

Backend request:

1. If sentiment analysis is enabled, include the required corpora in the runtime
   image or startup bootstrap.
2. If it is optional, return controlled provider-unavailable/configuration state
   rather than a dependency installation message.

## Smoke Script Follow-Up

The smoke script currently marks every `5xx` response as a failure:

```js
const SAFE_STATUS_MAX = 499;
ok: response.status <= SAFE_STATUS_MAX;
```

Once the backend promotes top-level `PROVIDER_NOT_CONFIGURED` codes, decide
whether controlled provider `503` responses should count as pass. If yes, update
`tools/tests/smoke-public-api.mjs` to treat `503` with top-level
`error.code === "PROVIDER_NOT_CONFIGURED"` as acceptable.

## Skipped Operations

The smoke run skipped `99` mutating operations by default. This is intentional
to avoid creating or deleting production resources without an allowlist.

Skipped groups:

| Tag | Count |
| --- | ---: |
| Vapi | 15 |
| Enrichment Tools | 12 |
| Authentication | 12 |
| Affiliates | 5 |
| Cart | 5 |
| Credits | 5 |
| Team | 5 |
| Admin | 4 |
| ApiKeys | 3 |
| FacebookMessenger | 3 |
| Features | 3 |
| Testers | 3 |
| Ai | 2 |
| Analytics | 2 |
| DirectMail | 2 |
| LinkedinMessaging | 2 |
| Payments | 2 |
| SendBlueSms | 2 |
| Sentiment | 2 |
| TwilioMessaging | 2 |
| Usps | 2 |
| Campaigns | 1 |
| Email Validation | 1 |
| GhlOauth | 1 |
| RealPhoneValidation | 1 |
| SecretsManager | 1 |
| Voice | 1 |

To test mutating operations safely, run the smoke script with a narrow
allowlist in a disposable environment:

```bash
DEAL_SCALE_API_BASE_URL=https://api.dealscale.io \
DEAL_SCALE_SMOKE_ALLOWLIST="OperationId-or-METHOD path" \
node tools/tests/smoke-public-api.mjs
```

## Verification Command

After backend fixes are deployed:

```bash
node tools/tests/smoke-public-api.mjs
```

Expected outcome:

- Generic `500` count is `0`.
- Facebook and LinkedIn thread lookups return `400`, `404`, or controlled
  `503`, not `500`.
- GHL and USPS provider-unavailable responses use top-level
  `PROVIDER_NOT_CONFIGURED`.
- If controlled provider `503` responses remain expected, update the smoke
  script policy so they do not appear as hard failures.
