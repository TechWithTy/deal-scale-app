---
Title: Focus Widget Embed Contract
Description: Mount the Deal Scale Focus widget (music + voice agents) inside external dashboards.
---

# Overview

- **What:** A lightweight embed that exposes the Focus experience—music player + voice agent hub—without the full Deal Scale app shell.
- **Why:** Give teams access to curated focus playlists and AI agents inside CRMs, wikis, or partner portals.
- **How:** Load the script bundle, drop a host element with `data-dealscale-focus`, configure attributes, and call the mount helper.

## Quick Start

```html
<script async src="https://cdn.dealscale.app/embed/focus-widget.js"></script>
<div
  data-dealscale-focus
  data-mode="music"
  data-theme="dark"
  data-playlist="spotify:playlist:37i9dQZF1DX8Uebhn9wzrS"
  data-voice-webhook="https://api.dealscale.app/voice/agents"
  data-open-on-load="true"
></div>
<script>
  window.mountDealScaleFocusWidget?.({
    selector: "[data-dealscale-focus]"
  });
</script>
```

### Mount Options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `selector` | `string` | `[data-dealscale-focus]` | Selectors are queried on `document`. |
| `onError` | `(error: Error) => void` | Logs to `console.error`. | Hook into host logging/telemetry. |

`remountDealScaleFocusWidget(host)` clears and re-renders a single host node. `unmountDealScaleFocusWidgets()` tears down all mounted instances.

## Host Configuration Schema

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `data-mode` | `"music" \| "voice"` | `"music"` | Initial tab to display. |
| `data-theme` | `"light" \| "dark"` | `"light"` | Applies scoped styling tokens. |
| `data-playlist` | `string` | `spotify:playlist:37i9dQZF1DX8Uebhn9wzrS` | Spotify playlist URI or HTTPS URL. |
| `data-open-on-load` | `boolean` | `false` | Auto-expands the widget immediately. |
| `data-voice-webhook` | `string` (URL) | `undefined` | Optional endpoint returning agent metadata. |
| `data-voice-token` | `string` | `undefined` | Optional bearer token forwarded when fetching voice agents. |
| `data-config` | JSON | `{}` | Advanced overrides (see below). |

Advanced configuration payload:

```json
{
  "title": "Focus",
  "agentLimit": 6,
  "showCloseButton": true
}
```

Invalid attributes yield a styled error banner and invoke `onError`.

## Data Contracts

### Voice Agent Endpoint

When `data-voice-webhook` is supplied, the widget requests the URL with:

- `Authorization: Bearer <data-voice-token>` when provided.
- `Accept: application/json`.

Expected payload:

```json
[
  { "id": "agent-1", "name": "Outbound Closer", "status": "online" },
  { "id": "agent-2", "name": "Follow-up Coach", "status": "offline" }
]
```

Agents are rendered as quick actions in the Voice tab.

### Music Provider

- Spotify URIs (`spotify:playlist:<id>`) convert to the official embed iframe.
- HTTPS URLs render inside an `<iframe>` `src` as-is.
- Missing or malformed playlists fall back to Deal Scale’s default focus playlist.

## Styling & Theming

- The bundle injects `link[data-dealscale-focus-style]` containing scoped CSS variables.
- Host overrides (set on the root element) include:
  - `--deal-scale-focus-bg`
  - `--deal-scale-focus-border`
  - `--deal-scale-focus-primary`
  - `--deal-scale-focus-foreground`
- The widget is responsive; width is constrained to `min(360px, 100%)` by default.

## Accessibility & Behaviour

- Focus widget traps focus within the panel when open.
- Close buttons emit `dealScale:focusWidget:closed`.
- Mode switches emit `dealScale:focusWidget:modeChange` with `{ mode }`.
- Keyboard shortcuts: `Ctrl/Cmd + Shift + F` toggles the widget when mounted.

## Error Handling

- Config validation failure → inline alert + console warning.
- Voice webhook failure → banner with retry button (refreshes once per minute).
- Spotify iframe blocked by CSP → fallback message with “Open Spotify” CTA.

## Future Enhancements

- Support draggable positioning inside host container via `data-draggable="true"`.
- Add SSE feed for agent presence updates.
- Provide ES module build (`focus-widget.esm.js`) for bundler pipelines.











