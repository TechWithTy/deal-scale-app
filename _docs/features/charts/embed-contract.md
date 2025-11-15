# Embeddable Charts Contract (Polling Mode)

## Overview

This document defines the integration surface for embedding Deal Scale charts
inside third-party sites. It focuses on the initial polling implementation and
is designed to remain compatible with future streaming upgrades (SSE/WebSocket).

## Script Bootstrapping

Third-party pages load the bootstrap bundle and call the global mount helper.

```html
<script async src="https://cdn.dealscale.app/embed/charts.js"></script>
<div
  data-dealscale-chart
  data-chart-id="pipeline-volume"
  data-chart-type="bar"
  data-auth-token="PUBLIC_API_TOKEN"
  data-theme="light"
  data-refresh-interval="30000"
></div>
<script>
  window.mountDealScaleChart?.({
    selector: "[data-dealscale-chart]",
  });
</script>
```

### Bootstrap Options

The `mountDealScaleChart` helper accepts:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `selector` | `string` | `[data-dealscale-chart]` | CSS selector to target host elements. |
| `onError` | `(error: Error) => void` | Logs to `console.error`. | Optional hook for host debugging. |

Each host element reads its configuration from `data-*` attributes or an
optional JSON string stored in `data-config`.

## Configuration Schema

- `data-chart-id` (required): stable identifier that maps to server metrics and
  is passed to the live data endpoint.
- `data-chart-type` (required): one of `bar`, `area`, `pie`. Additional chart
  types can be introduced later; unknown values trigger a fallback error view.
- `data-auth-token` (optional): bearer token or signed credential used when
  calling the `/api/charts/live/:chartId` endpoint. Absent tokens rely on
  public charts.
- `data-theme` (optional): `"light"` or `"dark"`. Defaults to light; hosts can
  override colors via CSS variables (see **Styling**).
- `data-refresh-interval` (optional): polling cadence in milliseconds. Enforced
  minimum of 10 seconds; defaults to 30 seconds.
- `data-timezone` (optional): IANA zone string, defaulting to `"UTC"`, passed to
  the backend for window alignment.
- `data-config` (optional): JSON payload for advanced options. Parsed shape:
  ```ts
  type AdvancedChartConfig = {
    legend?: "none" | "top" | "bottom";
    animation?: boolean;
    comparisonSeries?: string[];
  };
  ```

### Validation

Client-side validation is performed with Zod. Invalid configuration results in a
rendered error panel and a console warning; the polling loop does not start.

## Live Data Endpoint Contract

Charts poll `GET /api/charts/live/:chartId` with the following headers:

- `Authorization: Bearer <token>` (when provided)
- `If-None-Match: <etag>` (for cache-aware polling)
- `X-DealScale-Timezone: <ianaZone>`

Successful responses:

```json
{
  "chartId": "pipeline-volume",
  "type": "bar",
  "version": "2025-11-07T16:00:00Z",
  "interval": 30000,
  "series": [
    {
      "id": "desktop",
      "label": "Desktop",
      "color": "hsl(var(--chart-1))",
      "points": [
        { "x": "2025-11-01", "y": 222 },
        { "x": "2025-11-02", "y": 197 }
      ]
    },
    {
      "id": "mobile",
      "label": "Mobile",
      "color": "hsl(var(--chart-2))",
      "points": [
        { "x": "2025-11-01", "y": 150 },
        { "x": "2025-11-02", "y": 180 }
      ]
    }
  ],
  "meta": {
    "title": "Pipeline Volume",
    "description": "Last 60 days",
    "unit": "leads"
  }
}
```

- `series` order is preserved and maps to the component palette.
- When no changes occur, the endpoint returns `304 Not Modified` with an ETag.
- Validation errors surface as `422` JSON responses describing the invalid
  configuration.

## Auth & Security Expectations

- Embed tokens must be scoped to read-only chart access.
- Tokens should expire within 24 hours; the host is responsible for rotation.
- CORS: `Access-Control-Allow-Origin` must include the requesting domain for
  non-public charts. Public charts rely on `*`.
- All responses disable cache control on intermediaries (`Cache-Control:
  no-store`) because polling relies on ETag diffs.

## Styling & Theming

The embed bundle injects a scoped stylesheet (`public/embed/deal-scale-charts.css`)
which defines the following CSS variables on `[data-dealscale-chart]`:

- `--deal-scale-bg`
- `--deal-scale-border`
- `--deal-scale-foreground`
- `--deal-scale-chart-1` … `--deal-scale-chart-5`

Hosts can override these variables either inline or via external stylesheets to
achieve brand alignment without leaking global selectors.

## Polling Constraints

- Minimum interval: 10 seconds; attempts to set lower values are clamped.
- Maximum interval: 5 minutes; longer intervals should use server-rendered
  snapshots instead.
- Jitter: clients introduce ±10% random jitter per poll to avoid thundering
  herd effects.
- Backoff: three consecutive failures trigger exponential backoff with user
  notification inside the frame.

## Error Handling UX

The embed frame renders non-intrusive error states:

- Config validation failure → descriptive banner
- Auth failure (`401`/`403`) → “Authentication required” message
- Network failure → automatic retry with spinner
- Chart mismatch (server type vs. requested type) → fallback message prompting
  manual reload

All errors surface through the optional `onError` callback for host logging.

## Future Enhancements

- SSE/WebSocket transport to replace or supplement polling
- Granular authorization scopes per series
- Multi-chart layouts within a single host element
- Offline caching for short disconnections














