# Embeddable Chart Operations Guide

This guide walks through configuring, deploying, and monitoring Deal Scale's
embeddable charts in polling mode.

## 1. Integration Checklist

1. Host installs the published bundle:
   ```html
   <script async src="https://cdn.dealscale.app/embed/charts.js"></script>
   ```
2. Insert chart containers anywhere in the DOM:
   ```html
   <div
     data-dealscale-chart
     data-chart-id="pipeline-volume"
     data-chart-type="bar"
     data-theme="light"
     data-refresh-interval="30000"
     data-auth-token="PUBLIC_TOKEN"
   ></div>
   ```
3. Call the mount helper after the bundle loads:
   ```html
   <script>
     window.mountDealScaleChart?.();
   </script>
   ```
4. Optional overrides:
   - `data-timezone="America/New_York"`
   - `data-config='{"legend":"top"}'`
   - `data-endpoint="https://staging.dealscale.app/api/charts/live/pipeline-volume"`

## 2. Token Management

- Tokens are **read-only** and scoped to specific chart IDs.
- Rotate tokens every 24 hours; expiration is enforced server side.
- For CMS integrations, store tokens in an environment variable and inject them
  via server-side rendering (avoid exposing private keys in the browser source).
- Public charts can omit the token; the endpoint verifies access automatically.

## 3. Live Data Endpoint

- Polling target: `GET /api/charts/live/:chartId`
- Minimum interval enforced: 10 seconds
- Maximum interval suggested: 5 minutes
- Headers:
  - `Authorization: Bearer <token>` (optional)
  - `If-None-Match: <etag>`
  - `X-DealScale-Timezone: <IANA zone>`
- Mock endpoint for QA: `http://localhost:3000/api/charts/live/sample`
  - Returns deterministic payload with ETag support
  - Set `data-endpoint` attribute to override the default path

## 4. Styling & Theming

- Styles are isolated through `public/embed/deal-scale-charts.css`
- Host sites can override theme variables on the container element:
  ```css
  [data-dealscale-chart] {
    --deal-scale-bg: #ffffff;
    --deal-scale-foreground: #0c111a;
    --deal-scale-chart-1: #2563eb;
  }
  ```
- Supported themes: `light` (default) and `dark`
- Chart palettes derive from CSS variables; ensure sufficient contrast when
  customizing colors.

## 5. QA & Monitoring

- Manual tests before release:
  - Load chart inside a static HTML file using the production bundle
  - Verify polling continues when the tab regains focus
  - Toggle network offline/online to ensure retry banner clears
  - Override styles to confirm isolation (no leakage into host page)
  - Embed inside an iframe to confirm sizing responsiveness
- Automated coverage:
  - `tests/external/embed-chart.spec.tsx` covers bootstrap + polling behavior
  - Future Playwright scenario: load chart via `next dev` and capture screenshot
- Observability:
  - Log polling errors to PostHog and console (via `onError` option)
  - Track response latency by chart ID for capacity planning

## 6. Backlog & Enhancements

- Add WebSocket/SSE transport and fallback to polling
- Support multiple charts per host element with layout configuration
- Enrich analytics (render duration, error rate) via custom events
- Provide React helper package for first-party apps

















