# Dynamic Hero Module

Internal React utilities for building reusable hero sections with configurable video content and persona-driven copy.

## Exports

- `HeroVideoDialog` — modal video dialog with configurable entrance animations.
- `HeroVideoPreview` — stylized video preview card with progressive blur layers.
- `DEFAULT_HERO_VIDEO` — sensible default `HeroVideoConfig`.
- `heroVideoConfigSchema`, `HeroVideoConfig` — Zod schema and type for video metadata.
- `resolveHeroCopy` — helper to sanitize and template hero copy definitions.
- `heroCopySchema`, related types — shared schema for copy configuration.
- `resolveHeroThumbnailSrc`, `resolveHeroVideoSrc` — helpers for media URLs.

## Usage

```tsx
import {
	HeroVideoPreview,
	resolveHeroCopy,
} from "@internal/dynamic-hero";

const copy = resolveHeroCopy(heroCopyDefinition, {
	fallbackSecondaryChip: { label: personaTitle, variant: "outline" },
});

<HeroVideoPreview
	video={heroCopyDefinition.video}
	thumbnailAlt="Watch the product tour"
/>;
```

> Note: This package is private to the monorepo and assumes the shared design system (Tailwind tokens, Radix primitives, and motion). Ensure these dependencies are present in any consumer application.




