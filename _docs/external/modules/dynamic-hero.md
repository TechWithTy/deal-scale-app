# Dynamic Hero Module

## Overview

The dynamic hero module packages the Quick Start hero experience into a shared reusable library. It exposes animated video previews, dialog controls, and copy resolution utilities that can be consumed by any frontend surface in the monorepo.

- Location: `external/dynamic-hero`
- Entry point: `@external/dynamic-hero`
- Components: `HeroHeadline`, `HeroVideoPreview`, `HeroVideoDialog`, `HeroAurora`
- Utilities: `resolveHeroCopy`, `heroVideoConfigSchema`, `resolveHeroThumbnailSrc`
- Fixtures: `DEFAULT_HERO_VIDEO`, `DEFAULT_HERO_SOCIAL_PROOF`
- Types: `HeroCopy`, `HeroVideoConfig`, `HeroSocialProof`

### Persona Video Mapping

`lib/config/quickstart/headlines.ts` owns the dynamic plan for persona-specific hero content. Each persona key maps to a dedicated video entry in `PERSONA_VIDEO_LIBRARY`, allowing the Quick Start hero to surface different feature walkthroughs per persona. Update the `src` or `poster` values there when a new video asset ships.

## Dependencies

- React 18
- `motion/react` for animations
- `lucide-react` for icons
- Tailwind design tokens (relies on existing global styles)

## Usage Checklist

1. Import the package entry point in the consuming application:
   ```tsx
   import {
   	HeroAurora,
   	HeroHeadline,
   	HeroVideoPreview,
   	resolveHeroCopy,
   	DEFAULT_HERO_SOCIAL_PROOF,
   	type HeroVideoConfig,
   } from "@external/dynamic-hero";
   ```
2. Validate video configuration through `heroVideoConfigSchema` or use `DEFAULT_HERO_VIDEO`.
3. Sanitize persona copy with `resolveHeroCopy` (optional, but recommended for template application). The `HeroCopyValues` now accepts an optional `hope` string which can surface inspirational supporting text inside downstream UIs.
4. Render the preview and/or dialog component inside the target page.

## Setup in Other Apps

To integrate the module into another app (inside or outside this monorepo):

1. **TypeScript paths**
   ```jsonc
   {
     "compilerOptions": {
       "paths": {
         "@external/dynamic-hero": ["../external/dynamic-hero/src/index.ts"],
         "@external/dynamic-hero/*": ["../external/dynamic-hero/src/*"]
       }
     }
   }
   ```
   Adjust the relative path to match your project structure.
2. **Testing aliases** – Mirror the mapping in the app's Vitest/Jest configuration.
3. **Peer dependencies** – Ensure `motion/react`, `lucide-react`, and the project's Tailwind tokens are available. Override styling tokens if the design system differs.
4. **Linting/Formatting** – Extend lint and format globs to include `external/dynamic-hero` if your scripts run from the consuming app.

## Example

```tsx
import {
	HeroAurora,
	HeroHeadline,
	HeroVideoPreview,
	resolveHeroCopy,
	DEFAULT_HERO_SOCIAL_PROOF,
} from "@external/dynamic-hero";

const heroCopy = resolveHeroCopy(copyDefinition, {
	fallbackSecondaryChip: {
		label: personaTitle,
		variant: "outline",
	},
});

// Optional: provide a `hope` value when defining copyDefinition
// copyDefinition.values.hope = "Keep your borrowers warm while the paperwork catches up.";

const { video } = getQuickStartHeadlineCopy(personaId);

return (
	<div className="relative min-h-screen overflow-hidden">
		<HeroAurora className="z-0" />
		<div className="relative z-10 flex flex-col items-center gap-8 py-12">
			<HeroHeadline copy={heroCopy} socialProof={DEFAULT_HERO_SOCIAL_PROOF} />
			<HeroVideoPreview video={video} />
		</div>
	</div>
);
```