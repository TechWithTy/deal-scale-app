# @deal-scale/action-bar

Global Command Palette (Action Bar) for React apps and as a drop‑in Web Component. Ships ESM/CJS for apps and a UMD bundle for direct browser embeds. Includes providers, a standalone palette, and a small web API for imperative control.

- React: use `CommandPaletteProvider` or `ActionBarRoot`
- Web: load the UMD bundle and call `window.DealActionBarUMD.mount()`
- Docs: see `_docs/` in this package for in-depth guides

## Contents
- Features
- Installation (npm/pnpm)
- Quick Start (React)
- Quick Start (Browser UMD)
- Standalone Provider
- Commands and API
- Styling / Theming
- Build & Local Development
- Deploying the Browser Bundle
- Docs Index (internal)

## Features
- Global command palette with keyboard shortcuts (e.g., Cmd/Ctrl+K)
- Searchable actions with groups, icons, and sections
- Pluggable command sources, async suggestions, AI hooks
- React provider for context-driven actions
- Framework-agnostic Web Component via UMD for any site

## Installation (npm/pnpm)
```bash
pnpm add @deal-scale/action-bar
# or
npm i @deal-scale/action-bar
```

## Quick Start (React)
Wrap your app with the provider and render the root.

```tsx
import React from 'react'
import { ActionBarRoot, CommandPaletteProvider } from '@deal-scale/action-bar'

export default function App() {
  return (
    <CommandPaletteProvider
      shortcuts={[['mod', 'k']]} // Cmd/Ctrl + K
      commands={[
        { id: 'open-settings', label: 'Open Settings', run: () => console.log('settings') },
        { id: 'goto-dashboard', label: 'Go to Dashboard', href: '/dashboard' },
      ]}
    >
      <ActionBarRoot />
      {/* your app */}
    </CommandPaletteProvider>
  )
}
```

### Provider props (essentials)
- `shortcuts`: array of key combos (e.g., `[ ['mod','k'] ]`)
- `commands`: array of commands `{ id, label, run? | href?, icon?, section? }`
- `onOpenChange? (boolean)`: open state callback
- `suggest? (query) => Promise<Command[]>`: async suggestions

## Quick Start (Browser UMD)
The UMD build exposes a global `DealActionBarUMD`.

```html
<!-- 1) Load the bundle (local or from a CDN) -->
<script src="/dist/umd/index.js"></script>
<!-- Example CDN (once you publish to npm): -->
<!-- <script src="https://unpkg.com/@deal-scale/action-bar/dist/umd/index.js"></script> -->

<!-- 2) Mount somewhere after DOM is ready -->
<script>
  const unmount = window.DealActionBarUMD.mount({
    shortcuts: [['mod','k']],
    commands: [
      { id: 'open-settings', label: 'Open Settings', run: () => alert('settings') },
      { id: 'help', label: 'Help Center', href: '/help' },
    ],
  })

  // Later, to clean up:
  // unmount()
</script>
```

### UMD Options
- `shortcuts`: same as React
- `commands`: same as React
- `container?`: HTMLElement to render into; defaults to `document.body`
- `theme?`: `{ className?: string }` for host wrapper

## Standalone Provider (React)
If you only need the provider (e.g., to wire your own UI):
```tsx
import { StandaloneCommandPaletteProvider } from '@deal-scale/action-bar'
```

## Commands and API
A command is a simple object:
```ts
export type Command = {
  id: string
  label: string
  section?: string
  icon?: React.ReactNode
  href?: string // navigate
  run?: () => void // imperative action
}
```
- Use `href` for navigation or `run` for side effects.
- Group by `section` for visual organization.
- Provide `suggest(query)` to stream or return async commands.

## Styling / Theming
This package ships unstyled primitives integrated with your design system. See examples in:
- `components/command/CommandPalette.tsx`
- `components/command/CommandInputTray.tsx`

If you use shadcn/radix, slot our components into your tokens. For a basic look-and-feel, add a host class via provider prop `theme={{ className: 'your-theme' }}` and style accordingly.

## Build & Local Development
This package uses `tsup`.

Scripts in `package.json`:
- `pnpm build` — builds ESM/CJS and UMD bundles
- `pnpm build:lib` — ESM/CJS + types
- `pnpm build:umd` — IIFE UMD for browsers at `dist/umd/index.js`

```bash
pnpm i
pnpm build
```

## Deploying the Browser Bundle
You can deploy `dist/umd/index.js` on any static host or CDN.

- Local hosting: copy `dist/umd/index.js` to your public directory and reference it with `<script src="/dist/umd/index.js"></script>`
- CDN (after publishing to npm):
  - unpkg: `https://unpkg.com/@deal-scale/action-bar/dist/umd/index.js`
  - jsDelivr: `https://cdn.jsdelivr.net/npm/@deal-scale/action-bar/dist/umd/index.js`

For custom domains, serve from your site (e.g., `https://www.cybershoptech.com/assets/action-bar/index.js`) and update the script tag accordingly.

## Docs Index (internal)
This repo includes more detailed, task-focused docs under `_docs/`:
- `_docs/embed-npm.md` — React/Next.js app integration via npm
- `_docs/embed-script.md` — Direct `<script>` embed for any website
- `_docs/embed-with-api-key.md` — Securing usage with an API key pattern
- `_docs/browser-extension.md` — Notes for browser extension contexts

Each doc contains copy-paste snippets and deployment tips specific to that scenario.

## License
MIT
