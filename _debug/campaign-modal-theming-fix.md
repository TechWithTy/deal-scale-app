# Campaign Modal Theming + Transparency Fix

Date: 2025-09-16
Route(s): `/dashboard/campaigns`
Files touched:
- `app/globals.css`
- `components/ui/dialog.tsx`
- `components/reusables/modals/user/campaign/CampaignModalMain.tsx`

## Root Cause
- In dark mode, the surface tokens for modal and popovers (`--card`, `--popover`) were too close to (or equal to) `--background`. Even when components used `bg-card`, they visually blended with the page, appearing transparent.
- Additionally, the visible, scrollable body container inside the modal had no surface classes (e.g., `bg-transparent` by omission), so page content showed through.
- Consumer overrides added `bg-background text-foreground h-[85vh] max-h-[85vh]` to the modal surface in some places, winning the cascade.

## Fix Summary
1) Theme tokens made visually distinct in dark mode
   - File: `app/globals.css`
   - Dark theme keeps `--card` and `--popover` slightly lighter than `--background` so surfaces don’t blend.

2) Enforced modal surface to always render as a card
   - File: `components/ui/dialog.tsx`
   - On `DialogPrimitive.Content`, enforced tokens with Tailwind important utilities to defeat consumer overrides:
     - `!bg-card !text-card-foreground !border-border`
   - Also made height responsive (no fixed height enforced at the primitive):
     - `!h-auto !max-h-[90vh] !min-h-0 !overflow-auto`
   - Overlay remains `bg-background/80` (no blur) so it dims the page, not the content.

3) Ensured modal body renders on a solid surface
   - File: `components/reusables/modals/user/campaign/CampaignModalMain.tsx`
   - Wrapped children of `DialogContent` in a themed scroll container:
     - `div.flex-1.min-h-0.overflow-y-auto.px-6.pb-6.pr-7.bg-card.text-card-foreground`
   - This guarantees the visible area is a `card` surface regardless of child components.

## Before → After (key snippets)

### Dialog surface (before)
```
<DialogPrimitive.Content className="... border bg-background text-foreground h-[85vh] max-h-[85vh] ..." />
```

### Dialog surface (after)
```
<DialogPrimitive.Content
  className={cn(
    "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border !border-border !bg-card !text-card-foreground !h-auto !max-h-[90vh] !min-h-0 !overflow-auto p-6 shadow-lg ...",
    className,
  )}
/>
```

### Modal body wrapper (added)
```
<DialogContent className="w-full max-w-xl bg-card p-0 text-card-foreground shadow-lg sm:rounded-lg">
  <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 pr-7 bg-card text-card-foreground">
    {/* step content */}
  </div>
</DialogContent>
```

## Verification Checklist
- Open Create Campaign modal.
- Inspect topmost surface element: should show `!bg-card !text-card-foreground !border-border`.
- The visible scroll container inside `DialogContent` should show `bg-card text-card-foreground`.
- Overlay should be `bg-background/80` without blur.
- The page behind is dimmed; the modal surface is clearly opaque and distinct from the page.

## Edge Cases Considered
- Any child component with `bg-transparent`, `opacity-*`, or `backdrop-*` can make sections look translucent. The wrapper ensures the main body is still a solid card surface.
- Consumer class overrides (`bg-background`) are defeated by `!bg-card` on the primitive.
- Height/scroll: one scroll surface – the body wrapper – using `flex-1 min-h-0 overflow-y-auto` to avoid competing scroll regions.

## Related Popover/Dropdown Notes
- Quick action dropdowns render on a solid surface using `bg-card text-card-foreground border-border` in `components/ui/dropdown-menu.tsx`.
- If any specific menu/panel still looks transparent, check for a local wrapper applying `bg-transparent` or opacity and add `bg-card text-card-foreground` there.

## Rollback / Diff Pointers
- Revert changes in:
  - `app/globals.css` (dark token adjustments)
  - `components/ui/dialog.tsx` (surface enforcement & responsive height)
  - `components/reusables/modals/user/campaign/CampaignModalMain.tsx` (themed body wrapper)

## Status (2025-09-16)
- Modal surface is now clearly opaque with proper theming, and the inner content scrolls within the body wrapper. Popover/dropdown surfaces also use card theming.
