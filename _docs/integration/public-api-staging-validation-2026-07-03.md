# Public API Staging Validation - 2026-07-03

## Backend Handoff Under Test

- Backend commit tested by backend: `777d322`
- Deploy target: staging
- Backend deploy run: <https://github.com/Deal-Scale/deal-scale-backend-autoscaling/actions/runs/28676375293>
- BE-22 authenticated smoke run: <https://github.com/Deal-Scale/deal-scale-backend-autoscaling/actions/runs/28676622557>
- BE-22 result: passed

## Frontend Validation Target

- Staging API base URL used by frontend smoke: `https://staging.api.dealscale.io`
- Health endpoint: `GET https://staging.api.dealscale.io/api/v1/health`
- Health result: `200`
- Health payload status: `healthy`

Note: earlier local references to `https://api.staging.dealscale.io` are stale. That hostname did not resolve. The successful backend BE-22 workflow used `https://staging.api.dealscale.io`, and frontend validation used the same host.

## Full Public API E2E Result

Command:

```powershell
$env:DEAL_SCALE_API_BASE_URL='https://staging.api.dealscale.io'
pnpm test:e2e:public-api-full
```

Report:

- Local report: `reports/public-api-smoke-latest.json`
- Generated at: `2026-07-03T18:15:49.264Z`
- Total operations: `173`
- Passed: `173`
- Failed: `0`
- Skipped: `0`
- Mutating operations: enabled
- Successful operations: `60`
- Controlled client errors: `105`
- Expected provider unavailable responses: `8`

## Cleanup And Redaction

- API keys revoked: `1`
- Cart cleanup: verified
- Overall cleanup verified: `true`
- Raw `dsk_` API key present in report: `false`
- Redacted fields found in report: `2`

## Remaining Follow-Up

- Frontend can continue staging integration against `https://staging.api.dealscale.io`.
- Keep treating `PROVIDER_NOT_CONFIGURED`, `PROVIDER_UNAVAILABLE`, and `SERVICE_UNAVAILABLE` as controlled unavailable states when returned by optional providers.
- Update any remaining frontend docs, env examples, or scripts that still reference `https://api.staging.dealscale.io`.
- BE-22 authenticated staging smoke is now passing, so the previous analytics aggregate staging blocker is no longer reproduced in this validation.
