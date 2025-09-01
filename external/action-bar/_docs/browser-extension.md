---
Title: Browser Extension (MV3) – Inject Action Bar
Description: Build a Chrome/Edge extension that injects the Global Command Palette into any site.
---

# Overview

- __What__: A Manifest V3 extension that injects the Action Bar (FAB + dialog) into pages you visit.
- __Why__: Company-wide productivity without touching host codebases.
- __How__: Content script loads the UMD bundle and mounts a `<deal-action-bar>` element. Options page stores config (AI endpoint, token, theme, shortcuts).

# Folder structure (example)

```
extension/
  manifest.json
  content.js
  options.html
  options.js
  icons/
    icon16.png
    icon48.png
    icon128.png
```

# manifest.json (MV3)

```json
{
  "manifest_version": 3,
  "name": "Deal Action Bar",
  "version": "1.0.0",
  "description": "Global Command Palette on any page.",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "permissions": ["storage"],
  "options_page": "options.html",
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_title": "Toggle Action Bar"
  },
  "commands": {
    "toggle-action-bar": {
      "suggested_key": { "default": "Ctrl+K", "mac": "Command+K" },
      "description": "Toggle the Action Bar"
    }
  }
}
```

# options.html

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Deal Action Bar – Options</title>
    <style>body{font:14px system-ui;padding:16px;max-width:720px}</style>
  </head>
  <body>
    <h1>Action Bar Settings</h1>
    <label>AI Suggest Endpoint <input id="endpoint" placeholder="/api/ai/command-suggest" /></label>
    <br/>
    <label>Token (short-lived) <input id="token" placeholder="optional" /></label>
    <br/>
    <label>Variant
      <select id="variant">
        <option value="dialog">dialog</option>
        <option value="floating">floating</option>
      </select>
    </label>
    <br/>
    <label>Theme
      <select id="theme">
        <option value="auto">auto</option>
        <option value="light">light</option>
        <option value="dark">dark</option>
      </select>
    </label>
    <br/>
    <button id="save">Save</button>
    <script src="options.js"></script>
  </body>
</html>
```

# options.js

```js
const $ = (id) => document.getElementById(id);
chrome.storage.sync.get(["endpoint","token","variant","theme"], ({endpoint, token, variant, theme}) => {
  $("endpoint").value = endpoint || "/api/ai/command-suggest";
  $("token").value = token || "";
  $("variant").value = variant || "dialog";
  $("theme").value = theme || "auto";
});
$("save").addEventListener("click", () => {
  chrome.storage.sync.set({
    endpoint: $("endpoint").value,
    token: $("token").value,
    variant: $("variant").value,
    theme: $("theme").value
  }, () => window.close());
});
```

# content.js (inject + mount)

```js
(async function init() {
  const cfg = await new Promise((resolve) => {
    chrome.storage.sync.get(["endpoint","token","variant","theme"], resolve);
  });

  // 1) Inject UMD bundle once per page
  if (!document.querySelector("script[data-deal-ab]") ) {
    const s = document.createElement("script");
    s.dataset.dealAb = "1";
    s.src = "https://cdn.yourdomain.com/deal-action-bar@1.0.0/umd/index.js";
    s.defer = true;
    document.documentElement.appendChild(s);
  }

  // 2) Mount the Web Component
  const already = document.querySelector("deal-action-bar");
  if (!already) {
    const el = document.createElement("deal-action-bar");
    el.setAttribute("theme", cfg.theme || "auto");
    el.setAttribute("variant", cfg.variant || "dialog");
    el.setAttribute("keyboard", "true");
    el.setAttribute("ai-suggest-endpoint", cfg.endpoint || "/api/ai/command-suggest");
    document.documentElement.appendChild(el);
  }

  // 3) Provide token (optional)
  window.DealActionBar = window.DealActionBar || {};
  if (cfg.token) window.DealActionBar.token = cfg.token;

  // 4) Keyboard command (browser command → dispatch to component)
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg === "toggle-action-bar") {
      window.DealActionBar?.toggle?.();
    }
  });
})();
```

# Wiring the command (background optional)

MV3 commands fire in the extension context; simplest approach is to listen in `content.js` using a shortcut injected by page script (or send a message from a service worker). For a service worker:

```js
// service_worker.js (if you opt-in)
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-action-bar") {
    // Broadcast to active tab
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      for (const t of tabs) chrome.tabs.sendMessage(t.id, "toggle-action-bar");
    });
  }
});
```

Add to `manifest.json` if you use a service worker:

```json
{
  "background": {
    "service_worker": "service_worker.js"
  }
}
```

# Security & CSP

- Prefer a self-hosted UMD on a controlled CDN and add it to `script-src` allowlist if the host page enforces CSP.
- Never embed long-lived provider API keys in the extension. Use:
  - A short-lived token stored in `chrome.storage` (rotated by your backend), or
  - A proxy endpoint that authenticates the user/session per domain.
- Respect host page privacy: do not collect page data beyond what is needed for AI context (route, recent commands, minimal metadata).

# Testing

- Load unpacked extension in `chrome://extensions` (enable Developer Mode).
- Verify FAB, dialog variant, “/” open behavior, and AI suggestions via your proxy endpoint.

# Publishing

- Chrome Web Store: package the `extension/` folder as a zip and submit.
- Microsoft Edge Add-ons: reuse the same MV3 package.
