# Public API Remaining Follow-Up - 2026-06-29

## Current Smoke Status

- API base URL: `https://api.dealscale.io`
- Generated at: `2026-06-29T19:07:52.607Z`
- Total OpenAPI operations: `173`
- Passed: `72`
- Failed: `2`
- Skipped: `99`

## Resolved In Latest Deployment

The prior generic `500` failures are fixed:

- `GET /api/v1/messaging/facebook/threads/{recipient_id}`
  - Now returns `400 VALIDATION_ERROR`
  - Previously returned generic `500 SERVER_ERROR`
- `GET /api/v1/messaging/linkedin/threads/{recipient_id}`
  - Now returns `400 VALIDATION_ERROR`
  - Previously returned generic `500 SERVER_ERROR`

## Remaining Smoke Failures

These are controlled provider-configuration responses. They still count as
smoke failures only because the smoke script treats all `5xx` responses as
failures.

### GHL Google Calendar OAuth

- Endpoint: `GET /api/v1/integrations/ghl/calendar/auth-url`
- Status: `503`
- Error code: `PROVIDER_NOT_CONFIGURED`
- Message: `GoHighLevel Google Calendar OAuth is not configured.`
- Request ID: `eb66c22461ae2dc1345e18044aa12d4e`

Decision needed:

- Configure GHL Google Calendar OAuth in production, or
- Accept this as an expected unavailable-provider response.

### USPS Address Verification

- Endpoint: `GET /api/v1/usps/verify-address`
- Status: `503`
- Error code: `PROVIDER_NOT_CONFIGURED`
- Message: `USPS provider is not configured`
- Request ID: `9b4ce2768ccaa0d2ed39ae47ec4c8216`

Decision needed:

- Configure USPS in production, or
- Accept this as an expected unavailable-provider response.

## Repo Follow-Up

If controlled provider `503` responses are acceptable, update:

```text
tools/tests/smoke-public-api.mjs
```

Current behavior:

```js
const SAFE_STATUS_MAX = 499;
ok: response.status <= SAFE_STATUS_MAX;
```

Recommended behavior:

- Count `503` as pass only when
  `responsePreview.error.code === "PROVIDER_NOT_CONFIGURED"`.

Expected result after smoke policy update:

- Generic `500` count: `0`
- Controlled provider-unavailable responses: pass
- Smoke failures: `0`, assuming no new regressions

## Backend Follow-Up Still Recommended

### Internal DB Error Leakage

The following endpoints return `401 AUTH_REQUIRED`, but expose internal database
resolution details:

- `GET /api/v1/admin/users/search`
- `GET /api/v1/admin/users/{user_id}/logs`
- `GET /api/v1/secrets/status`
- `GET /api/v1/secrets/rotation-status`

Current message includes:

```text
psycopg.OperationalError failed to resolve host 'dpg-d1455bvfte5s73e00r40-a'
```

Recommended fix:

- Return a stable public auth error message.
- Log DB/driver details server-side only.
- Verify whether the unresolved DB hostname indicates a real production config
  issue.

### Sentiment Runtime Dependency

- Endpoint: `GET /api/v1/sentiment/analyze`
- Status: `400 VALIDATION_ERROR`
- Issue: public response reports missing TextBlob/NLTK corpora.

Recommended fix:

- Bundle required corpora in the runtime image if sentiment is enabled.
- Otherwise return a controlled unavailable/configuration response instead of
  dependency installation instructions.

## Verification

Run:

```bash
node tools/tests/smoke-public-api.mjs
```

Success criteria:

- No generic `500` responses.
- Facebook and LinkedIn thread lookups remain `400 VALIDATION_ERROR` for
  placeholder IDs.
- GHL and USPS either return `200` after provider configuration or controlled
  `503 PROVIDER_NOT_CONFIGURED`.
- Public responses do not leak internal infrastructure details.
