---
Title: Embed via <script> (UMD) + Web Component
Description: Add the Global Command Palette to any site with a single script tag and a Web Component.
---

# Overview

- __What__: Drop-in embed of the Global Command Palette as a Web Component plus a tiny bootstrap script.
- __Why__: Zero build tooling required. Works on static sites, CMS pages, or legacy stacks.
- __How__: Load the UMD bundle, then place `<deal-action-bar>` in your HTML. Configure via attributes or a global `window.DealActionBar` init.

# Quick start

```html
<!-- 1) Load UMD bundle (host this on your CDN or use the provided URL once published) -->
<script src="https://cdn.yourdomain.com/deal-action-bar@1.0.0/umd/index.js" defer></script>

<!-- 2) Add the Web Component anywhere on the page -->
<deal-action-bar
  theme="auto"
  variant="dialog"               
  ai-suggest-endpoint="/api/ai/command-suggest" 
  keyboard="true"                 
  floating="false"                
></deal-action-bar>
```

# Attributes

- __theme__: `light | dark | auto` (default `auto`).
- __variant__: `dialog | floating` (default `dialog`).
- __floating__: `true | false` – when `true`, shows the FAB + compact floating panel.
- __keyboard__: `true | false` – enable Cmd/Ctrl+K and `/` quick open.
- __ai-suggest-endpoint__: URL for AI suggestions.
- __initial-query__: Optional initial text used when the palette first opens.

# Programmatic init (optional)
If you prefer imperative setup or need to compute config at runtime:

```html
<script>
  window.DealActionBar = window.DealActionBar || {};
  window.DealActionBar.init = () => {
    const el = document.querySelector('deal-action-bar');
    if (!el) return;
    el.setAttribute('variant', 'floating');
    el.setAttribute('keyboard', 'true');
    el.setAttribute('ai-suggest-endpoint', '/api/ai/command-suggest');
  };
  window.addEventListener('DOMContentLoaded', () => {
    if (window.DealActionBar.init) window.DealActionBar.init();
  });
</script>
```

# Custom commands (declarative JSON)
Provide static commands via a `<script type="application/json" id="deal-action-commands">` block.

```html
<script type="application/json" id="deal-action-commands">
{
  "Navigation": [
    { "id": "nav-home", "label": "Home", "shortcut": "G H", "href": "/" },
    { "id": "nav-leads", "label": "Leads", "shortcut": "G L", "href": "/dashboard/leads" }
  ],
  "Action Bar Demo": [
    { "id": "demo-open", "label": "Open Dialog Variant", "action": "window.DealActionBar.open('dialog')" }
  ]
}
</script>
```

# Theming
- Uses CSS variables to match your site. Minimum set:

```css
:root {
  --background: #fff;
  --foreground: #111827;
  --popover: #ffffff;
  --popover-foreground: #111827;
  --ring: 60 4.8% 95.9%;
  --muted-foreground: #6b7280;
  --destructive: #ef4444;
}
.dark {
  --background: #0b0b0c;
  --foreground: #f3f4f6;
  --popover: #111213;
  --popover-foreground: #f3f4f6;
}
```

# Security & sandboxing
- The Web Component never executes arbitrary code from the JSON commands. For actions, prefer `href` navigation or predefined `action` names that map to safe handlers.
- If you must run custom JS, register it via `window.DealActionBar.register(name, fn)` inside your site’s codebase (keeps eval out of markup).

# Analytics hooks
The UMD exposes a basic event bus:

```js
window.DealActionBar.on('open', () => console.log('palette-open'));
window.DealActionBar.on('close', () => console.log('palette-close'));
window.DealActionBar.on('execute', (cmd) => console.log('cmd-execute', cmd));
```

# FAQ
- __Can I hide the FAB but keep floating panel?__ Set `floating="true"` and add CSS to hide the button; then open programmatically via `window.DealActionBar.toggle()`.
- __Will `/` insert into inputs?__ We intercept slash globally and open the palette without inserting `/`.
