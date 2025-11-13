# Dynamic Hero Module

## Overview

The dynamic hero module packages the Quick Start hero experience into an internal reusable library. It exposes animated video previews, dialog controls, and copy resolution utilities that can be consumed by any frontend surface in the monorepo.

- Location: `packages/internal/dynamic-hero`
- Entry point: `@internal/dynamic-hero`
- Components: `HeroVideoPreview`, `HeroVideoDialog`
- Utilities: `resolveHeroCopy`, `heroVideoConfigSchema`, `resolveHeroThumbnailSrc`

## Dependencies

- React 18
- `motion/react` for animations
- `lucide-react` for icons
- Tailwind design tokens (relies on existing global styles)

## Usage Checklist

1. Import the package entry point in the consuming application:
   ```tsx
   import {
   	HeroVideoPreview,
   	resolveHeroCopy,
   	type HeroVideoConfig,
   } from "@internal/dynamic-hero";
   ```
2. Validate video configuration through `heroVideoConfigSchema` or use `DEFAULT_HERO_VIDEO`.
3. Sanitize persona copy with `resolveHeroCopy` (optional, but recommended for template application).
4. Render the preview and/or dialog component inside the target page.

## Example

```tsx
import {
	HeroVideoPreview,
	resolveHeroCopy,
} from "@internal/dynamic-hero";

const heroCopy = resolveHeroCopy(copyDefinition, {
	fallbackSecondaryChip: {
		label: personaTitle,
		variant: "outline",
	},
});

return (
	<section>
		<h1>{heroCopy.title}</h1>
		<p>{heroCopy.subtitle}</p>
		<HeroVideoPreview video={copyDefinition.video} />
	</section>
);
```

## Migration Notes

- `components/ui/hero-video-dialog.tsx` now re-exports the module component to maintain backwards compatibility.
- `components/quickstart/QuickStartVideoPreview.tsx` delegates to `HeroVideoPreview`.
- Persona copy (`lib/config/quickstart/headlines.ts`) now uses `resolveHeroCopy` for template handling.

## Future Enhancements

- Expose bundled storybook examples for designers.
- Add optional background effects as separate exports to avoid coupling.
- Investigate removing residual `ReactDOMTestUtils.act` warnings in Vitest runs.






