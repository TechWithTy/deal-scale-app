# Public API Follow-Up Deployment Verification - 2026-06-29

## Deployment Under Test

- Production API: `https://api.dealscale.io`
- Backend commit: `624e0c6`
- Deployment workflow: `28401067638`
- Production cutover: successful
- E2E generated at: `2026-06-29T21:08:11.022Z`
- Command: `pnpm test:e2e:public-api-full`

## Result

- OpenAPI operations executed: `173`
- Passed: `171`
- Failed: `2`
- Skipped: `0`
- Controlled client errors: `104`
- Expected provider/service unavaailable responses: `7`
- Successful responses: `60`
- Cleanup: passed
  - API keys revoked: `1`
  - API-key absence verified
  - Cart cleared
  - Logout completed

The command exited with status `1` because two unexpected `500` responses
remain.

## Verified Fixed

`POST /api/v1/testers/apply` now returns:

```text
400 VALIDATION_ERROR
```

This resolves the prior `500 SERVER_ERROR`.

## Remaining Failure 1: TheHarvester

- Request: `POST /api/v1/enrich/theharvester_domain`
- Status: `500 SERVER_ERROR`
- Duration: `25,827 ms`
- Request ID: `91362ce3d5ac1b926ec8c4c8939bd173`
- Error ID: `5903cdf9-b040-4add-a803-7c9b4a3c0227`
- Message: `An unexpected error occurred`

The OpenAPI request requires `lead_id` and `domain`. The generated E2E request
uses a placeholder lead UUID and a placeholder domain string.

Expected behavior:

- Return `400/422 VALIDATION_ERROR` when the domain is invalid, or
- Return `503 PROVIDER_UNAVAILABLE` when the provider cannot complete before
  its server deadline.

The endpoint should not wait approximately 26 seconds and then return a generic
`500`.

## Remaining Failure 2: Twilio Receive

- Request: `POST /api/v1/twilio/receive`
- Status: `500 SERVER_ERROR`
- Duration: `1,113 ms`
- Request ID: `ee60fae23d015722870cfda94692ff51`
- Error ID: `1db8fae9-0f1a-4c3c-bcdc-02d3b2acc3d8`
- Message: `An unexpected error occurred`

The published OpenAPI operation:

- Has no required request body.
- Defines optional `X-Twilio-Signature`.
- Documents `401` for an invalid Twilio signature.

The E2E request omits the optional signature. Expected behavior is a controlled
`400/401`, not `500`.

Recommended checks:

1. Reject a missing signature before parsing or processing webhook fields.
2. Return the stable top-level auth or validation error envelope.
3. Ensure malformed or absent form data cannot reach code that assumes Twilio
   fields are present.
4. Add regression tests for missing signature, invalid signature, and malformed
   webhook data.

## Acceptance Criteria

1. TheHarvester returns controlled `400/422/503` for generated placeholder
   input.
2. Twilio receive returns controlled `400/401` when the signature and webhook
   body are absent.
3. `pnpm test:e2e:public-api-full` reports:
   - `173` executed
   - `173` passed
   - `0` failed
   - `0` skipped
   - cleanup verified

## Evidence

Machine-readable results:

```text
reports/public-api-smoke-latest.json
```

The report redacts raw API keys and authentication secrets.
