# Public API Frontend Handoff - 2026-06-29

## Current Production Status

- API base URL: `https://api.dealscale.io`
- Backend deploy commit: `7428d59 fix public api provider error envelopes`
- GitHub Actions deploy run: `28395396470`
- Deploy result: `success`
- Production blue/green deploy completed successfully.

The latest smoke run has no generic messaging `500` failures. Facebook and
LinkedIn placeholder thread lookups now return controlled validation errors.

## Provider Configuration State

GHL Google Calendar OAuth and USPS Address Verification are intentionally not
configured with production API keys right now.

Frontend should treat these responses as expected unavailable-provider states,
not backend outages:

- `503 PROVIDER_NOT_CONFIGURED`
- Stable public message
- Optional provider details

These are not user-actionable unless the product has enabled that provider for
the tenant/environment.

## Expected API Contracts

### GHL Google Calendar OAuth

Endpoint:

```text
GET /api/v1/integrations/ghl/calendar/auth-url
```

Current expected response:

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

Frontend behavior:

- Show the integration as unavailable or not configured.
- Do not show a generic failure toast for this state.
- Do not retry aggressively.
- If the UI has admin setup affordances, route admins toward provider setup.

### USPS Address Verification

Endpoint:

```text
GET /api/v1/usps/verify-address
```

Current expected response:

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

Frontend behavior:

- Disable or soften USPS-backed address verification features.
- Allow manual address entry if the product flow supports it.
- Do not present this as an unexpected server error.

### Messaging Thread Lookups

Endpoints:

```text
GET /api/v1/messaging/facebook/threads/{recipient_id}
GET /api/v1/messaging/linkedin/threads/{recipient_id}
```

For generated placeholder IDs such as:

```text
00000000-0000-4000-8000-000000000000
```

Expected response:

- Status: `400`
- Top-level error code: `VALIDATION_ERROR`
- Details include provider-specific `INVALID_RECIPIENT`.

Frontend behavior:

- Validate obvious placeholder or empty recipient IDs before calling the API.
- Treat `400 VALIDATION_ERROR` as a form/input state, not a backend outage.
- Treat missing real threads as `404 NOT_FOUND` if returned.

## Smoke Script Policy

The smoke runner should treat controlled unavailable providers as pass when the
provider is intentionally not configured.

Recommended policy:

```js
const isExpectedProviderUnavailable =
	response.status === 503 &&
	responsePreview?.error?.code === "PROVIDER_NOT_CONFIGURED";

ok: response.status <= 499 || isExpectedProviderUnavailable;
```

This should only apply to top-level `error.code === "PROVIDER_NOT_CONFIGURED"`.
Generic `5xx`, `SERVER_ERROR`, or malformed error envelopes should still fail.

## Remaining Backend Items To Track

These are not blockers for the GHL/USPS unavailable-provider frontend behavior,
but they should stay on the backend follow-up list:

- Some auth-gated admin/secrets endpoints return `401 AUTH_REQUIRED` while
  leaking internal database resolution details in the message. Public responses
  should use stable auth messages and log DB details server-side only.
- Sentiment analysis returns a `400 VALIDATION_ERROR` that mentions missing
  TextBlob/NLTK corpora. If sentiment is enabled, bundle the corpora in the
  runtime image. If optional, return a controlled unavailable/configuration
  response instead.

## Frontend Summary

- No frontend blocker remains for Facebook/LinkedIn placeholder thread lookup
  smoke failures.
- GHL Calendar OAuth and USPS are currently optional/unconfigured providers.
- Branch UI behavior on top-level `error.code`.
- `PROVIDER_NOT_CONFIGURED` should render a provider setup/unavailable state,
  not a generic error state.
