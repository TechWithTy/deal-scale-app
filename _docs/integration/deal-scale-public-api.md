# Deal Scale Public API Spec

This repo keeps the client-provided public API contract as an OpenAPI source artifact.

## Files

- Public spec artifact: `public/openapi/deal-scale-public.openapi.json`
- App route: `GET /api/openapi`
- API gateway route: `/api/v1/*`
- Static asset URL: `/openapi/deal-scale-public.openapi.json`
- Repair guide: `_docs/integration/public-api-backend-frontend-fix-guide.poml`

## Spec Summary

- OpenAPI version: `3.1.0`
- API title: `Deal Scale API - Public Documentation`
- API version: `1.0.0`
- Paths: `154`
- Operations: `173`
- Tags: `31`

## Latest Smoke Status

- 2026-06-28 targeted production smoke verified the deployed auth, affiliate,
  and credit fixes with `0` server failures across `9` checks.
- Production deployment completed through GitHub Actions run `28336435460`.
- Remaining backend work: production Redis/Valkey configuration, USPS provider
  configuration if address verification should be live, and a broad OpenAPI
  non-mutating smoke rerun for the original generic `500` endpoints.

## Servers

- Production: `https://api.dealscale.io`
- Remote API backend: `https://api.dealscale.io`

## Next.js API Gateway

The app exposes a same-origin gateway at `/api/v1/*`. Requests are validated
against the OpenAPI paths and methods before being proxied to the backend API.

Configure the upstream explicitly when needed:

```env
DEAL_SCALE_API_BASE_URL=https://api.dealscale.io
```

For local FastAPI testing, point the gateway at the local backend:

```env
DEAL_SCALE_API_BASE_URL=http://localhost:8000
```

Defaults:

- Development: `https://api.dealscale.io`
- Production: `https://api.dealscale.io`

The gateway refuses to proxy to the current Next.js origin to avoid recursive
requests when environment variables are misconfigured.

## Authentication

The spec declares these security schemes:

- `BearerAuth`: JWT bearer token from `/api/v1/auth/login`
- `ApiKeyAuth`: `X-API-Key` header for external integrations
- `OAuth2PasswordBearer`: OAuth2 password flow with scoped permissions

## Update Process

1. Export the latest public OpenAPI JSON from the client/backend API docs.
2. Replace `public/openapi/deal-scale-public.openapi.json`.
3. Confirm the file parses:

```powershell
node -e "JSON.parse(require('fs').readFileSync('public/openapi/deal-scale-public.openapi.json','utf8')); console.log('OpenAPI spec OK')"
```

4. Run `pnpm typecheck` before committing.
5. Run the gateway tests:

```powershell
pnpm exec vitest run _tests/api/v1/public-api-proxy.test.ts --config vitest.config.ts
```

6. Run the authenticated remote API smoke audit:

```powershell
node tools/tests/smoke-public-api.mjs
```

This creates/logs in a temporary test user, calls authenticated `GET` endpoints,
and writes `reports/public-api-smoke-latest.json`. Mutating operations are listed
as skipped by default to avoid writes, charges, messages, or deletes.

To test a specific mutating endpoint, allowlist only that operation:

```powershell
$env:DEAL_SCALE_SMOKE_ALLOWLIST="Authentication-refresh_token"
node tools/tests/smoke-public-api.mjs
```

Allowlist entries can be operation IDs or exact `METHOD /path` strings.

Keep generated client SDKs separate from this source spec unless the frontend starts consuming generated types directly.
