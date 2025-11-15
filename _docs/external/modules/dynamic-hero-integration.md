# External Dynamic Hero Integration Guide

## Overview

This checklist explains how to copy the `external/dynamic-hero` package into a new Next.js project that already uses Shadcn UI, Magic UI, and Aceternity UI. Follow these steps to replicate the Quick Start hero experience outside of DealScale.

## 1. Copy Required Source Files

1. Duplicate the entire `external/dynamic-hero` directory into your destination repository.  
   - Entry point: `external/dynamic-hero/src/index.ts`  
   - Components included: `HeroHeadline`, `HeroAurora`, `HeroVideoPreview`, `HeroVideoDialog`, `TextFlipHighlight`  
   - Utils included: `resolveHeroCopy`, `resolveHeroThumbnailSrc`, `resolveHeroVideoSrc`, `useRotatingIndex`
2. Copy any supporting UI primitives referenced by the demo page:
   - `components/ui/avatar-circles.tsx`
   - `components/ui/background-beams-with-collision.tsx`
   - `components/ui/light-rays.tsx`
   - `components/ui/pointer.tsx`
   - `components/ui/progressive-blur.tsx`
   - `components/cta/PersonaCTA.tsx`
3. Replicate the demonstration page (optional): `app/test-external/dynamic-hero-demo/page.tsx`.

> Tip: Keep the folder structure intact so relative imports continue to resolve without modifications.

## 2. Install Peer Dependencies

Add every library referenced by the module. Use your package manager of choice (`pnpm`, `yarn`, or `npm`). The following command uses `pnpm`:

```bash
pnpm add motion react @radix-ui/react-slot class-variance-authority lucide-react zustand zod
```

Additional UI libraries used by the demo:

| Library | Components Used |
| --- | --- |
| `@/components/ui/*` (Shadcn UI) | `Avatar`, `Badge`, `Button`, `Tooltip` (ensure these exist in your project) |
| Magic UI | `BackgroundBeamsWithCollision`, `LightRays` |
| Aceternity UI | `TextFlipHighlight` styling (already bundled in `external/dynamic-hero`) |

Also confirm these design utilities are configured:

- Tailwind CSS with DealScale token equivalents (adjust class names as needed)
- Next.js image optimization (`next/image` is used for hero video thumbnails)
- `@/lib/utils/index.ts` should export a `cn` helper (`clsx` + `tailwind-merge`)

## 3. Configure TypeScript Paths

Update `tsconfig.json` in the destination project:

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@external/dynamic-hero": ["external/dynamic-hero/src/index.ts"],
      "@external/dynamic-hero/*": ["external/dynamic-hero/src/*"]
    }
  }
}
```

Mirror the alias in your Jest/Vitest config if you run unit tests.

## 4. Tailwind Tokens & Global Styles

The hero expects Tailwind tokens similar to DealScale’s palette. At minimum ensure you have custom CSS variables for:

- `--primary`, `--primary-foreground`
- `--destructive`, `--destructive-foreground`
- `--background`, `--foreground`

If your token names differ, adjust the class names inside `HeroHeadline`, `HeroAurora`, and the CTA button gradients.

## 5. Magic UI & Aceternity Imports

If your project does not already include Magic UI or Aceternity UI:

1. Copy the necessary components from DealScale’s `components/ui` and `components/magicui` folders.
2. Verify the following files exist:
   - `components/ui/background-beams-with-collision.tsx`
   - `components/ui/light-rays.tsx`
   - `components/ui/pointer.tsx`
   - `components/ui/progressive-blur.tsx`
   - `components/ui/globe.tsx`
3. Ensure Aceternity’s `TextFlipHighlight` styles live inside `external/dynamic-hero/src/components/text-flip-highlight.tsx` (already bundled).

## 6. Testing the Module

1. Start the dev server and visit the imported demo page (if copied) to validate animations.
2. Confirm the rotating headline, CTA layout, cursor trails, and aurora background render correctly.
3. If thumbnails are SVGs or GIFs, verify `HeroVideoDialog` shows them without optimization errors.

## 7. Optional: Documentation Links

- [Dynamic Hero Module](mdc:_docs/external/modules/dynamic-hero.md) – detailed component usage inside DealScale.  
- [Dynamic Hero Integration Guide](mdc:_docs/external/modules/dynamic-hero-integration.md) – this document.

Keep this guide alongside the copied module to ensure future teams can drop the package into new surfaces quickly.










