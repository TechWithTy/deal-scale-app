# Campaign Modal Vertical Scroll Debug Log

- Date: 2025-08-30
- Route: `/test-external/dynamic-table-test/campaign-table`
- Files touched:
  - `external/shadcn-table/src/examples/campaigns/modal/CampaignModalMain.tsx`

## Context
The multi-step "Create Campaign" modal in the external shadcn table demo was not vertically scrollable. Content was pushing the overall modal height instead of scrolling.

## Observed DOM (from browser)
- Container (`DialogPrimitive.Content`) classes included:
  - `h-[85vh] max-h-[85vh]` (good)
  - Either `overflow-hidden` (older snapshot) or `overflow-y-auto` (newer snapshot)
  - Animated Radix classes (`data-[state=open]...`)
- Inner structure variants seen:
  1) ScrollArea viewport with parent lacking a definite `h-full` context.
  2) Single container with `overflow-y-auto` and body content directly inside.

## Attempts

### Attempt A — Make container scrollable
- Change: `DialogContent` -> `... h-[85vh] max-h-[85vh] overflow-y-auto flex flex-col ...`
- Body: simple padded div (`px-6 pb-6 pr-7`).
- Result: In some snapshots, still no vertical scroll appeared. Possible cause: browser hiding scrollbar; content not exceeding height enough; or nested children affecting layout.

### Attempt B — Make only body scroll via ScrollArea
- Change: `DialogContent` -> fixed height + `overflow-hidden`.
- Wrap step content in `<ScrollArea className="h-full">` with parent `flex-1 min-h-0`.
- Result: Still saw growth in older DOM because parent lacked explicit `h-full`; `ScrollArea` viewport resolved to content height instead of bounded height.

### Attempt C — Single scroll container + explicit body cap (current)
- Change: `DialogContent` -> `... h-[85vh] max-h-[85vh] overflow-hidden flex flex-col ...`
- Body container: `max-h-[calc(85vh-64px)] overflow-y-auto px-6 pb-6 pr-7` placed below a header block.
- Rationale: Avoid multiple scroll candidates and give body an explicit max height under header.
- Result: Should scroll when content exceeds the calc height. If content is shorter, no scrollbar (expected). If still no scroll, likely a child enforces its own height/overflow.

### Attempt D — Make container flex parent scroll-safe (min-h-0)
- Change: `DialogContent` now includes `min-h-0` in addition to `h-[85vh] max-h-[85vh] overflow-hidden flex flex-col`.
- Rationale: Without `min-h-0`, flex children with `overflow-y-auto` can be prevented from shrinking and therefore not scroll.
- Files:
  - `external/shadcn-table/src/examples/campaigns/modal/CampaignModalMain.tsx`
- Result: Body is allowed to scroll inside the fixed-height dialog.

### Attempt E — Ensure Step 2 (after channel selection) fills available height with inner scroll
- Change: In `ChannelCustomizationStep`, wrap content in a column flex container and make the content area the scroll surface.
- Structure:
  - Root: `div.h-full.flex.flex-col`
  - Scroll area: `div.flex-1.min-h-0.overflow-y-auto.space-y-6.pr-1`
  - Actions: `<CampaignNavigation />` placed after scroll area so Back/Next stay pinned at bottom.
- Files:
  - `external/shadcn-table/src/examples/campaigns/modal/steps/ChannelCustomizationStep.tsx`
- Result: Step 2 content scrolls; footer actions remain visible and not cut off.

## Remaining Possibilities / Root Causes
- Child step components (e.g., `ChannelCustomizationStep`) might include layout rules that expand height or add nested overflow containers, fighting the outer scroll behavior (e.g., `h-screen`, `max-h-screen`, or absolute/fixed elements inside).
- Platform/browser scrollbar visibility: on macOS/trackpads scrollbars are hidden until you scroll. This can look like "no scroll".
- Stale HMR/DOM: earlier DOM snippets showed the older structure (with ScrollArea). A full refresh is needed to ensure the latest structure is active.

## Recommendations
1) Keep one scroll area only.
   - Current setting: container fixed height (`85vh`) + body `max-h-[calc(85vh-64px)] overflow-y-auto`.
2) If you want a guaranteed scrollable pane regardless of content length, switch `max-h` to a fixed `h`:
   - Body: `h-[calc(85vh-64px)] overflow-y-auto px-6 pb-6 pr-7`.
3) Inspect step components for conflicting styles:
   - Search for `h-screen`, `max-h-screen`, nested `overflow-y-auto`, or `position: fixed/absolute` wrappers in:
     - `external/shadcn-table/src/examples/campaigns/modal/steps/ChannelCustomizationStep.tsx`
     - `.../TimingPreferencesStep.tsx`
     - `.../FinalizeCampaignStep.tsx`
4) Optional UX: Add sticky footer for actions so Back/Next remain visible while the body scrolls.
   - Footer: `sticky bottom-0 bg-background border-t px-6 py-3` below the body scroll area.

## Next Actions Proposed
- Keep one scroll surface: body uses `flex-1 min-h-0 overflow-y-auto` under a flex column dialog.
- Audit any nested widgets (e.g., long selects, template lists) for internal `h-full`/`overflow` that could fight scroll.
- Hard refresh the page (or restart dev server) to ensure latest DOM structure.

## Current Status (2025-08-30)
- Dialog height fixed to 85vh; container has `min-h-0`.
- Body uses `flex-1 min-h-0 overflow-y-auto` and scrolls.
- Step 2 (after selecting a channel) now fills height and scrolls; Back/Next pinned via `CampaignNavigation` after the scroll area.

## Next Ideas (if issues reappear)
- Add `DialogHeader` and `DialogFooter` with `sticky` styles to guarantee header/footer visibility while the middle scrolls.
- If a specific subsection still stretches (e.g., Templates), confine it with its own `max-h` or ensure it doesn’t apply `h-full`.

## How to Verify
1) Open the modal on `/test-external/dynamic-table-test/campaign-table`.
2) Add extra content (e.g., many templates) to exceed body height.
3) Confirm that the body scrolls while header remains in place and the overall dialog height stays at ~85vh.

## Notes
- We also updated the modal to reset state on open/close and support `defaultChannel` to align demo flows, but this does not affect scroll.
