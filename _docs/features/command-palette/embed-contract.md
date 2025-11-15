---
Title: Command Palette Embed Contract
Description: Integration surface for embedding the Deal Scale Command Palette on third-party sites.
---

# Overview

- **What:** Script bundle that mounts the Deal Scale Action Bar (global command palette) inside host pages.
- **Why:** Offer quick navigation, AI-assist shortcuts, and modal commands without shipping the full app.
- **How:** Drop a declarative host element, configure it with `data-*` attributes, and call the global mount helper.

## Quick Start

```html
<script async src="https://cdn.dealscale.app/embed/command-palette.js"></script>
<div
  data-dealscale-command-palette
  data-variant="dialog"
  data-keyboard="true"
  data-ai-suggest-endpoint="https://api.dealscale.app/ai/command-suggest"
  data-open-on-select="false"
  data-token="PUBLIC_READ_TOKEN"
></div>
<script>
  window.mountDealScaleCommandPalette?.({
    selector: "[data-dealscale-command-palette]"
  });
</script>
```

### Mount Options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `selector` | `string` | `[data-dealscale-command-palette]` | CSS selector used to locate host nodes. |
| `onError` | `(error: Error) => void` | Logs to `console.error`. | Use to forward errors to the host’s logger. |

Each host node yields one mounted command palette instance. Repeated mounts on the same node are ignored unless `remountDealScaleCommandPalette` is called first.

## Host Configuration Schema

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `data-variant` | `"dialog" \| "floating"` | `"dialog"` | Sets UI layout. |
| `data-keyboard` | `boolean` | `true` | Enables global keyboard shortcuts. |
| `data-initial-query` | `string` | `""` | Prefills the search box. |
| `data-ai-suggest-endpoint` | `string` (URL) | `/api/ai/command-suggest` | Endpoint for AI suggestions. |
| `data-token` | `string` | `undefined` | Optional bearer token forwarded to suggestion fetcher. |
| `data-open-on-select` | `boolean` | `false` | Reopen palette automatically after a command executes. |
| `data-select-container` | `string` | `undefined` | CSS selector for delegating selection focus. |
| `data-config` | JSON | `{}` | Reserved for future behavioural flags. Invalid JSON renders an error state. |

All attributes are validated via Zod. Invalid values render an inline error and call the optional `onError`.

## Authentication & Security

- Tokens must be scoped to read-only command metadata.
- Tokens should expire within 24 hours when embedded in public sites.
- Host pages must serve the bundle from an HTTPS origin.
- AI suggestion endpoints must implement CORS for the embedding domain.

## Styling & Theming

- The bundle injects `link[data-dealscale-command-palette-style]` that scopes required CSS variables.
- Hosts can override the following CSS variables on the mount node:
  - `--deal-scale-bg`
  - `--deal-scale-foreground`
  - `--deal-scale-border`
  - `--deal-scale-accent`
- The palette respects prefers-color-scheme but defers to host overrides first.

## Telemetry & Events

- Successful mounts emit `dealScale:commandPalette:mounted` on `window`.
- Errors emit `dealScale:commandPalette:error` with the `Error` instance.
- Keyboard toggles dispatch `dealScale:commandPalette:toggle` with `{ open: boolean }`.

## Future Enhancements

- Add `data-theme="light|dark|system"` for explicit theme selection.
- Support multi-tenant command registries by accepting an external manifest URL.
- Provide an npm wrapper (`@dealscale/command-palette-embed`) for React-first hosts.












