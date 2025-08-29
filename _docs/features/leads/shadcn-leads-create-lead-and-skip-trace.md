---
description: Integrate Create Lead and Skip Trace modals into the shadcn Leads table
---

# Goal
Add Create Lead and Skip Trace actions to the shadcn Leads table, reusing the app’s existing modals. Do not touch the shadcn Campaign table.

# Source of truth (existing implementations)
- Create Lead modal: `components/reusables/modals/user/lead/LeadModalMain.tsx`
- Skip Trace modal: `components/reusables/modals/user/skipTrace/SkipTraceModalMain.tsx`
- Lead table client (main app example with Create Lead button): `components/tables/lead-tables/client.tsx`

# Target integration point (shadcn)
- Leads table: `external/shadcn-table/src/app/leads/leads-table.tsx`

# Recommended approach
- Prefer composition by importing the existing modals directly into the shadcn leads table. This avoids duplication and keeps behavior consistent.
- Only copy files if import path aliasing fails; see Alternative: copy components below.

# Steps: Import and compose (preferred)
1) Add local UI state in `leads-table.tsx`
   - `const [isCreateLeadOpen, setIsCreateLeadOpen] = React.useState(false);`
   - `const [isSkipTraceOpen, setIsSkipTraceOpen] = React.useState(false);`

2) Import the existing modals and Button
   - `import { Button } from "@/components/ui/button"` (alias already used in external examples)
   - `import LeadMainModal from "@/components/reusables/modals/user/lead/LeadModalMain"`
   - `import SkipTraceModalMain from "@/components/reusables/modals/user/skipTrace/SkipTraceModalMain"`

3) Add action buttons inside `DataTableAdvancedToolbar`
   - In `leads-table.tsx`, within `<DataTableAdvancedToolbar table={table}>`, add a right-aligned container:
     - Buttons: "Create Lead" and "Skip Trace"
     - Set `type="button"` for both (Biome a11y rule)
     - Handlers open the respective modals

4) Render modals at the bottom of the component
   - `<LeadMainModal isOpen={isCreateLeadOpen} onClose={() => setIsCreateLeadOpen(false)} />`
   - `<SkipTraceModalMain isOpen={isSkipTraceOpen} onClose={() => setIsSkipTraceOpen(false)} />`

5) Linting/formatting
   - Run `pnpm biome check .` and `pnpm biome format .`
   - Ensure no unused imports and buttons have explicit `type`.

# Example diff (high level, not exact code)
- File: `external/shadcn-table/src/app/leads/leads-table.tsx`
- Add state: `isCreateLeadOpen`, `isSkipTraceOpen`
- Add imports: `Button`, `LeadMainModal`, `SkipTraceModalMain`
- Insert buttons inside `<DataTableAdvancedToolbar>`:
  - `Create Lead` -> `onClick={() => setIsCreateLeadOpen(true)}`
  - `Skip Trace` -> `onClick={() => setIsSkipTraceOpen(true)}`
- Render both modals below `<DataTableRowModalCarousel />`

# Alternative: copy components (only if alias import fails)
If the `@` alias resolution is unavailable in this context, copy the modals into the shadcn package area and adjust imports accordingly.

Suggested destination paths:
- Lead modal (and its steps):
  - From: `components/reusables/modals/user/lead/`
  - To: `external/shadcn-table/src/examples/leads/modals/lead/`
- Skip Trace modal (and flows/steps):
  - From: `components/reusables/modals/user/skipTrace/`
  - To: `external/shadcn-table/src/examples/leads/modals/skip-trace/`

After copying:
- Update relative imports inside copied files for shared UI (e.g., `@/components/ui/button`) to reference either:
  - Keep `@/components/...` if alias works, or
  - Use relative paths into the main app (discouraged), or
  - Duplicate any tiny UI atoms locally under `external/shadcn-table/src/components/ui/` if necessary.

# Notes on behavior parity
- Lead modal is a 4-step manual form with validation; it returns control via `onClose`. No external store integration is required for a basic open/close demo.
- Skip Trace modal supports two flows: list and single. You can pass `initialData` if you want to deep-link a flow; otherwise, just open it with no props.

# QA checklist
- Buttons appear in the shadcn leads toolbar, aligned with existing controls.
- Buttons have explicit `type="button"`.
- Both modals open and close reliably; backdrop/esc closes.
- No console errors about missing aliases or components.
- Biome passes.

# Future improvements
- Connect successful Create Lead to add row data to the shadcn table dataset.
- Wire Skip Trace flow completion to download results or update a side panel.
- Add role/permission checks to conditionally show actions.
