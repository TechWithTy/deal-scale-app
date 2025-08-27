# Theming Guide (Light, Dark, and Future Themes)

This app uses Tailwind tokens powered by CSS variables plus `next-themes` to manage the theme class on the `<html>` element. It ships with accessible Light and Dark and is ready for additional named themes.

## Stack
- **Tailwind** with `darkMode: ['class']` in `tailwind.config.js`.
- **CSS variables** for tokens in `styles/globals.css`.
- **next-themes** to set the `class` on `<html>` (`light`, `dark`, or custom) and persist user preference.
- **ThemeProvider** in `components/ui/theme-provider.tsx`.
- **ThemeToggle** in `components/ui/theme-toggle.tsx`.

## Where tokens live
Tokens are defined in `styles/globals.css`:
- Light tokens under `:root { ... }`
- Dark tokens under `.dark { ... }`

These tokens feed Tailwind via `tailwind.config.js` with entries like `colors.background: 'hsl(var(--background))'`.

Use the tokens in components with Tailwind classes, e.g.
- `bg-background` / `text-foreground`
- `bg-card` / `text-muted-foreground`
- `border-border`

Avoid hard-coded colors (e.g., `bg-black`, `text-white`).

## How the provider is wired
- In `app/layout.tsx`, the app is wrapped with `ThemeProvider` and the `body` uses token-based classes:
  - `bg-background text-foreground`
- The provider uses `attribute="class"`, `defaultTheme="system"`, and `enableSystem`.
- A `ThemeToggle` button is injected top-right for manual switching.

## Available themes now
- `light` (default tokens in `:root`)
- `dark` (overrides in `.dark`)
- `system` (follows the OS setting)

## Add a new named theme (example: "ocean")
You can layer additional named themes by scoping variable overrides to a class on `<html>`.

1) Define CSS variables for the theme in `styles/globals.css`:

```css
/* Light variant of Ocean */
.theme-ocean {
  --background: 210 60% 98%;
  --foreground: 222 47% 11%;
  --primary: 200 80% 45%;
  --primary-foreground: 210 40% 98%;
  /* ...override any tokens you need... */
}

/* Dark variant of Ocean (note the .dark prefix) */
.dark.theme-ocean {
  --background: 220 60% 5%;
  --foreground: 210 40% 96%;
  --primary: 200 85% 60%;
  --primary-foreground: 222 47% 11%;
  /* ... */
}
```

2) Tell `next-themes` how to apply classes for this theme (adds both `dark` and the custom class for dark variants):

```tsx
// components/ui/theme-provider.tsx
<NextThemesProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  // Optional: register custom themes and map to classes.
  // For a theme that has both light and dark variants, include 'dark' in the mapping
  // so the Tailwind `dark:` utilities still work.
  value={{
    light: "light",
    dark: "dark",
    "theme-ocean": "theme-ocean", // light variant
    "theme-ocean-dark": "dark theme-ocean", // dark variant
  }}
>
  {children}
</NextThemesProvider>
```

3) Switch themes at runtime:

```tsx
import { useTheme } from "next-themes";

function MySwitcher() {
  const { setTheme } = useTheme();
  return (
    <div className="flex gap-2">
      <button onClick={() => setTheme("light")}>Light</button>
      <button onClick={() => setTheme("dark")}>Dark</button>
      <button onClick={() => setTheme("theme-ocean")}>Ocean (Light)</button>
      <button onClick={() => setTheme("theme-ocean-dark")}>Ocean (Dark)</button>
    </div>
  );
}
```

Notes:
- Using `value` mapping allows us to apply multiple classes (e.g., `"dark theme-ocean"`) so Tailwind `dark:` variants continue to work alongside custom theme classes.
- You can define any number of theme pairs following this pattern.

## Accessibility
- The toggle uses ARIA labels and avoids hydration flashes.
- Ensure contrast remains sufficient for both light and dark when adding theme colors.
- Prefer semantic tokens (e.g., `--background`, `--accent`) over one-off color values in components.

## Troubleshooting
- If `dark:` utilities don't activate on a custom dark theme, ensure the mapping includes the literal `dark` class (e.g., `"dark theme-ocean"`).
- If you see a flash of incorrect theme, verify:
  - `ThemeProvider` has `suppressHydrationWarning` on `<html>` in `app/layout.tsx`.
  - `disableTransitionOnChange` is enabled in the provider to prevent transition flickers.

## Quick checklist for new components
- Use tokens: `bg-background`, `text-foreground`, `bg-card`, `border-border`.
- Avoid hard-coded hex/hsl.
- Test in Light, Dark, and any custom themes.
