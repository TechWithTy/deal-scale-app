---
Title: Embed Action Bar with API Key
Description: How to embed the Global Command Palette into any site and securely provide an API key.
---

# Overview

- The Action Bar (Global Command Palette) can be embedded via a single `<script>` and a Web Component.
- Provide your API key to enable AI suggestions via a proxy endpoint (recommended) or a short‑lived token.

# Recommended: Server proxy (no key in browser)

1) Create a server endpoint that proxies AI suggestions to your provider (e.g., OpenAI, internal LLM).

- Path example in your app/server: `/api/ai/command-suggest`
- The server reads the API key from environment variables and never exposes it to the browser.
- It accepts `{ query, route, userRole, recent }` and returns an array of `CommandItem`.

2) Embed the Action Bar and point it at your proxy:

```html
<!-- Load UMD bundle (host on your CDN) -->
<script src="https://cdn.yourdomain.com/deal-action-bar@1.0.0/umd/index.js" defer></script>

<!-- Place the component -->
<deal-action-bar
  ai-suggest-endpoint="/api/ai/command-suggest"
  variant="dialog"
  keyboard="true"
  theme="auto"
></deal-action-bar>
```

3) Optional: Provide static commands via JSON

```html
<script type="application/json" id="deal-action-commands">
{
  "Navigation": [
    { "id": "home", "label": "Home", "href": "/" },
    { "id": "leads", "label": "Leads", "href": "/dashboard/leads" }
  ]
}
</script>
```

# Alternative: Short‑lived token in browser

If you must use a browser token, use a short‑ttl signed token from your server and rotate it frequently.

- On page render, set a token the component can send to your proxy:

```html
<script>
  window.DealActionBar = window.DealActionBar || {};
  // issued by your backend; expires quickly (e.g., 5–10 min)
  window.DealActionBar.token = "eyJhbGciOi...";
</script>
```

- Your proxy validates this token before forwarding to the AI provider.
- Never embed a raw provider API key in HTML/JS.

# Minimal server proxy (pseudo‑code)

```ts
// /api/ai/command-suggest (Node/Edge)
export default async function handler(req, res) {
  const { query, route, userRole, recent } = req.body ?? {};
  // Validate auth (session or short‑lived token)

  // Call your AI provider using a secret API key from process.env
  const suggestions = await callAI({ query, route, userRole, recent, apiKey: process.env.AI_KEY });

  // Map to CommandItem[] and respond
  return res.json(suggestions);
}
```

# Security notes

- Do not ship provider API keys in the client bundle.
- Use rate limits on your proxy.
- Validate payload sizes and timeouts (e.g., 800ms budget) to protect UX.

# Keyboard and UX

- `Cmd/Ctrl + K` toggles the palette
- `/` opens the palette anywhere (the slash is not inserted)
- `variant="floating"` enables a FAB + compact panel
