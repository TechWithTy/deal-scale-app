# Dynamic Hero Integration Playbook

## Overview

Use this playbook whenever you need to embed the `external/dynamic-hero` module into a new surface (Next.js, React SPA, or marketing microsite). It distills the required imports, dependency setup, and feature toggles into a checklist so teams can ship hero experiences with minimal ramp-up.

## 1. Required Code Assets

- Folder: `[repo]/external/dynamic-hero/`
  - Components: `HeroHeadline`, `HeroAurora`, `HeroVideoPreview`, `HeroVideoDialog`, `TextFlipHighlight`
  - Utilities: `resolveHeroCopy`, `resolveHeroThumbnailSrc`, `resolveHeroVideoSrc`
  - Types: `HeroCopyValues`, `HeroVideoConfig`, `HeroSocialProof`
  - Styles: relies on global Tailwind tokens (`--primary`, `--destructive`, etc.)
- Supporting UI primitives (copy if your target does not have them):
  - `components/ui/avatar-circles.tsx`
  - `components/ui/globe.tsx`
  - `components/ui/progressive-blur.tsx`
  - `components/ui/background-beams-with-collision.tsx`
  - `components/ui/light-rays.tsx`
  - `components/ui/pointer.tsx`
  - `components/cta/PersonaCTA.tsx`
- Demo reference: `app/test-external/dynamic-hero-demo/page.tsx`
- Debug notes: `external/dynamic-hero/debug.md`

> Tip: Maintain the folder structure to avoid path alias drift.

## 2. Dependency Checklist

Install required packages:

```bash
pnpm add motion @radix-ui/react-slot class-variance-authority lucide-react zod zustand
```

Ensure the host project already contains:

- React 18 + Next 14 (or equivalent setup)
- Tailwind CSS with DealScale-compatible tokens
- Shadcn UI primitives (`Badge`, `Tooltip`, `Button`, etc.)
- Magic UI components (`BackgroundBeamsWithCollision`, `LightRays`)
- Aceternity-inspired highlight styling (bundled via `TextFlipHighlight`)
- Next.js remote image config with at least:
  ```js
  images: {
    domains: ["images.unsplash.com", "i.pravatar.cc", "utfs.io", "..."]
  }
  ```

## 3. TypeScript & Testing Configuration

- `tsconfig.json`
  ```jsonc
  {
    "compilerOptions": {
      "paths": {
        "@external/dynamic-hero": ["external/dynamic-hero/src/index.ts"],
        "@external/dynamic-hero/*": ["external/dynamic-hero/src/*"]
      }
    }
  }
  ```
- Mirror the alias in your test runner (Vitest/Jest/Cypress).
- Optional: add `@external/dynamic-hero` to `next.config.js` webpack aliases for runtime safety.

## 4. Feature Toggles & Props

| Component           | Key Props                               | Notes                                                                                             |
|--------------------|------------------------------------------|---------------------------------------------------------------------------------------------------|
| `HeroHeadline`      | `copy`, `socialProof`, `personaLabel`    | Use `resolveHeroCopy` to sanitize persona copy. Rotations auto-capitalize and dedupe.             |
| `HeroAurora`        | `className`                              | Render behind the hero to layer the gradient particles.                                           |
| `HeroVideoPreview`  | `video`, `thumbnailAlt`                  | Accepts `HeroVideoConfig`. Internal state removes blur overlays once the modal is playing.        |
| `HeroVideoDialog`   | `video`, `animationStyle`, `onOpenChange`| `onOpenChange` toggles decorative layers in `HeroVideoPreview`. `animationStyle` supports presets.|
| `TextFlipHighlight` | `words`, `variant`, `animationDuration`  | Used for Aceternity-inspired text flips.                                                          |

## 5. Persona & Video Mapping

- `lib/config/quickstart/headlines.ts` manages persona-specific copy + video assets.
- Use `getQuickStartHeadlineCopy(personaId)` to retrieve the curated copy + `HeroVideoConfig`.
- Provide a fallback `hope` value for inspirational messaging (optional field in `HeroCopyValues`).

## 6. QA Checklist

- [ ] Headline rotations fade smoothly (no blank frames) per video.
- [ ] Cursor pointer highlights follow hero CTA links.
- [ ] Aurora background + Magic UI beams render within GPU budget (<8ms on mid-tier devices).
- [ ] Persona CTA buttons stay horizontal on ≥768px viewports.
- [ ] Video thumbnail displays (confirm remote image domain).
- [ ] Modal playback launches without residual blur overlays.
- [ ] Debug log (`external/dynamic-hero/debug.md`) updated with new findings.

## 7. Reference Implementations

- External hero demo: `/test-external/dynamic-hero-demo`
- Quick Start hero: `/dashboard/quick-start`
- Future live variant: `/test-external/live-dynamic-hero-demo` (to be created)

## 8. Operational Notes

- Maintain the package manifest at `external/dynamic-hero/package.json` for eventual publishing via `npm pack`.
- Keep `PR_SUMMARY.md` updated when shipping changes; it powers release notes.
- Review `_docs/external/modules/dynamic-hero-integration.md` for more detailed, step-by-step instructions.

This playbook should be included in every deployment ticket involving the Dynamic Hero module. Update it whenever new dependencies or features are added.














