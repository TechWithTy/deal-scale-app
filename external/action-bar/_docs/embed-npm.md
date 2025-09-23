---
Title: Embed via NPM Package
Description: Install and use the Global Command Palette inside your React/Next.js app.
---

# Overview

- __What__: First-class React integration of the Global Command Palette (Action Bar).
- __Why__: Full type-safety, tree-shaking, theming, and custom command orchestration.
- __How__: Install the package, wrap your app with the provider, render `ActionBarRoot`, and register commands.

# Install

```bash
# pick one
pnpm add @dealscale/action-bar
# npm install @dealscale/action-bar
# yarn add @dealscale/action-bar
```

# Setup

Add the provider and root once (e.g., in `app/layout.tsx` or your top-level shell):

```tsx
// app/layout.tsx
import "@dealscale/action-bar/styles.css"; // includes Shadcn tokens + minimal CSS vars
import { CommandPaletteProvider } from "@dealscale/action-bar";
import ActionBarRoot from "@dealscale/action-bar/ActionBarRoot";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CommandPaletteProvider>
          {children}
          {/* Global palette portal */}
          <ActionBarRoot />
        </CommandPaletteProvider>
      </body>
    </html>
  );
}
```

# Basic usage

Register commands anywhere (client components):

```tsx
"use client";
import { useEffect } from "react";
import { useCommandPalette } from "@dealscale/action-bar";

export function DemoCommands() {
  const { registerDynamicCommands } = useCommandPalette();
  useEffect(() => {
    const cmds = [
      { id: "go-home", group: "Navigation", label: "Home", href: "/" },
      { id: "go-leads", group: "Navigation", label: "Leads", href: "/dashboard/leads" },
    ];
    return registerDynamicCommands(cmds);
  }, [registerDynamicCommands]);
  return null;
}
```

# AI suggestions

Enable AI-backed suggestions by pointing to your API route:

```tsx
import { CommandPaletteProvider } from "@dealscale/action-bar";

<CommandPaletteProvider aiSuggestEndpoint="/api/ai/command-suggest">
  {/* app */}
</CommandPaletteProvider>
```

# Keyboard shortcuts

- `Cmd/Ctrl + K` toggles the palette.
- `/` opens the palette everywhere and does not insert `/` into inputs.

# Variants

Switch palette style via provider or imperatively via hook:

```tsx
const { setVariant, setOpen } = useCommandPalette();
setVariant("floating");
setOpen(true);
```

- __dialog__: centered dialog (default)
- __floating__: FAB + compact anchored panel

# Theming

- Inherits CSS variables from your app. Ensure tokens similar to:

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
```

# SSR/Next.js app router

- The package is compatible with Next.js App Router.
- Provider and `ActionBarRoot` are client components.

# Uninstall

```bash
pnpm remove @dealscale/action-bar
```
