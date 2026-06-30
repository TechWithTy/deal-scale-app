# Public API Final E2E Verification - 2026-06-30

## Backend Deployment Under Test

- Production API: `https://api.dealscale.io`
- Latest backend merge: `b7c807c5843184b1aa3e981ec295e803c684eab0`
- Final backend fix commit referenced by backend: `85e9ff4`
- Production health smoke: `https://api.dealscale.io/api/v1/health`
- Production blue/green deployment: passed per backend handoff

## Frontend E2E Result

Command executed:

```bash
node tools/tests/smoke-public-api.mjs --include-mutating
```

Result from `reports/public-api-smoke-latest.json`:

- Generated at: `2026-06-30T20:06:43.083Z`
- Total operations: `173`
- Passed: `173`
- Failed: `0`
- Skipped: `0`
- Mutating operations: enabled
- Controlled client errors: `106`
- Expected provider unavailable responses: `7`
- Success responses: `60`

Cleanup evidence:

- Temporary API keys revoked: `1`
- Cart cleared: `true`
- Cleanup verified: `true`
- Raw API keys in report: `false`

## Resolved Items

- The full public API E2E suite now runs all previously skipped mutating operations.
- TheHarvester domain operation no longer returns the previous unexpected `500`.
- Twilio receive operation no longer returns the previous unexpected `500`.
- Provider-unavailable states are controlled and accepted only for stable top-level error codes.

## Frontend Handoff Scope

Frontend can proceed with Phase 1 route wiring for:

- BE-01 cashbuyers endpoints
- BE-02 lead lists and lead detail contracts
- BE-03 property detail contract
- BE-04 campaign list, detail, update, cancel, and status contracts
- Phase 1 OpenAPI updates
- `check_if_email_exists` / Reacher operational docs

## Remaining Caveat

Backend noted that the full BE-22 persona fixture matrix and authenticated
staging smoke/cleanup evidence are still outstanding. Frontend can consume the
Phase 1/core-resource contracts above, but should not treat every backend gap as
closed until that separate BE-22/staging evidence lands.
