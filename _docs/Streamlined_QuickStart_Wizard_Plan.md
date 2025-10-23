# Streamlined QuickStart Wizard Implementation Plan

## Overview
- Transition the QuickStart experience from modal-driven flows to an inline, full-width wizard rendered directly on `/dashboard/quickstart`.
- Allow product teams to curate the QuickStart action cards (visibility, ordering, template presets) through a configuration module.
- Preserve backward compatibility for legacy modal entry points while migrating core lead intake, skip-trace, campaign setup, webhook, and launch flows into the wizard.

## Current Implementation Snapshot (2025-10-23)
- `app/dashboard/quickstart/page.tsx` (`L1-L260`): hosts the QuickStart surface, coordinates multiple modals (`LeadModalMain`, `LeadBulkSuiteModal`, `CampaignModalMain`, `SavedSearchModal`), and triggers webhook/test flows through `useModalStore`.
- `components/quickstart/useQuickStartCards.tsx` (`L1-L210`): returns a static array of card definitions with inline metadata; card ordering and availability are hard-coded.
- `components/quickstart/QuickStartActionsGrid.tsx` (`L1-L160`): renders a grid of cards passed from `useQuickStartCards`.
- `components/reusables/modals/user/lead/LeadModalMain.tsx` (`L1-L360`) & `components/reusables/modals/user/lead/LeadBulkSuiteModal.tsx` (`~L1-L250`): encapsulate CSV upload, header mapping, skip-trace summary, and list selection with modal lifecycle assumptions.
- `components/reusables/modals/user/campaign/CampaignModalMain.tsx` (`L1-L400`): orchestrates channel selection, timing, and finalization inside a dialog.
- `lib/stores/campaignCreation.ts` (`L1-L340`): Zustand slice for campaign creation state; currently modal-oriented but reusable.
- `_tests/components/quickstart/useQuickStartCards.test.tsx` (`L1-L120`): asserts existing card definitions.

## Implementation Steps

### 1. Inline Wizard Shell on `/dashboard/quickstart`
- Replace modal toggles with an embedded wizard component.
  - Update `app/dashboard/quickstart/page.tsx` (`~L33-L210`) to remove modal state for campaign creation, bulk upload, and webhook steps.
  - Introduce `components/quickstart/wizard/QuickStartWizard.tsx` to orchestrate steps with Zustand providers (`useCampaignCreationStore`, skip-trace slice, lead intake slice).
  - Ensure walkthrough/tour triggers (`campaignSteps`, `WalkThroughModal`) target the inline wizard panels.

### 2. Configuration-Driven QuickStart Cards
- Create `lib/config/quickstart.ts` exporting `QuickStartCardDescriptor[]` with `id`, `enabled`, `order`, `title`, `description`, `icon`, and `wizardPreset` metadata.
- Refactor `useQuickStartCards` (`~L33-L200`) to consume the config, filter by `enabled`, sort by `order`, and transform template payloads before returning `QuickStartActionConfig`.
- Update `QuickStartActionsGrid` to accept already sorted cards; no structural change expected.
- Expand `_tests/components/quickstart/useQuickStartCards.test.tsx` to cover enabling/disabling, ordering, and preset propagation logic.

### 3. Template Preset Injection
- Define template payloads alongside the config (e.g., `lib/config/campaignTemplates.ts`) with skip-trace defaults, channel sequences, automation rules.
- Extend `useCampaignCreationStore` (`~L56-L220`) with methods like `applyTemplatePreset(preset: CampaignTemplatePreset)` and supporting fields (e.g., `skipTraceModule`, `automationRules`).
- Ensure QuickStart card clicks dispatch `applyTemplatePreset` before wizard initialization, allowing step UIs to show pre-filled data.

### 4. Lead Intake Refactor for Reuse
- Decompose `LeadModalMain` into step components under `components/quickstart/wizard/lead/`:
  - `LeadSourceSelectorStep.tsx`
  - `CsvUploadStep.tsx`
  - `HeaderMappingStep.tsx`
  - `SkipTraceSummaryStep.tsx`
- Extract shared hooks (`useLeadModalState`, CSV parsing helpers) into `components/quickstart/wizard/lead/useLeadWizard.ts` to abstract modal vs wizard consumption.
- Update modal wrappers to import the new step components to retain existing behavior elsewhere.

### 5. Skip-Trace, Channel, and Timing Steps
- Build dedicated wizard steps in `components/quickstart/wizard/` leveraging existing modal step logic:
  - `SkipTraceModuleStep.tsx` (auto-upgrade toggle, match rate summary).
  - `ChannelSelectionStep.tsx` / `TimingAutomationStep.tsx` (reuse from `external/shadcn-table` modules with wrapper adapters to match inline layout constraints).
- Ensure the wizard enforces step order: lead intake → skip trace → channel selection → timing/automation → review → agent → test & launch.

### 6. Webhook & Sandbox Launch Integration
- Replace calls to `useModalStore.openWebhookModal` on QuickStart with wizard-managed panels.
- Create `components/quickstart/wizard/launch/TestAndLaunchStep.tsx` combining sandbox simulation (mocked connectors) and webhook configuration (pass mode props to existing components).
- Update `lib/stores/dashboard.ts` if necessary to expose webhook config state to the wizard while keeping other dashboards functional.

### 7. Page Composition & Card Wiring
- Update QuickStart page layout to render:
  - Config-driven cards via `QuickStartActionsGrid`.
  - Inline wizard anchored below the cards with conditional visibility (e.g., collapsible or tabbed view) triggered by card actions.
- Ensure cards like “Import & Manage Data” still expose file inputs, but now forward events to wizard steps (e.g., call `QuickStartWizardRef.startLeadUpload()`).
- Provide ability to define initial step per card (via `wizardPreset.startStep` in config).

### 8. Testing & QA
- Add component tests for wizard store transitions (`components/quickstart/wizard/__tests__/useQuickStartWizard.test.tsx`).
- Update existing quickstart card tests for config behavior.
- Add integration test for QuickStart page (e.g., Playwright or React Testing Library) verifying template preset application and inline wizard rendering.

## Data & State Considerations
- Maintain `useCampaignCreationStore` as single source of truth; extend rather than replace fields to avoid breaking other surfaces.
- Introduce a dedicated `useQuickStartWizardStore` for UI-only flags (active step, completion status, sandbox results) to keep domain state separated.
- Ensure state resets on wizard exit to prevent data leakage when switching cards or navigating away.

## Open Questions / Follow-Ups
- Confirm whether legacy modals remain accessible elsewhere; coordinate deprecation plan if not required.
- Validate whether sandbox simulation needs API support or can remain mocked client-side until backend hooks arrive.
- Align template schema with future `/api/templates` endpoints once available.

## Appendix
- All new/updated components must remain under 250 LOC; split larger steps into subcomponents as needed.
- Follow existing UI kit guidelines (`shadcn/ui`, `Magic UI`) and reuse typography/spacing tokens from `tailwind.config.js`.
- Coordinate with design for final card ordering defaults before shipping config file.
