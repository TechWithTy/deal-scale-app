# Streamlined QuickStart Wizard Implementation Plan

## Overview
The QuickStart experience now launches from a modal-based persona flow instead of the deprecated inline six-step wizard. Users choose a persona, align on a goal, and then receive a summary plan that queues contextual actions (e.g., opening modals, routing to feature pages) once they intentionally close the wizard. This document tracks the living plan for the shipped modal journey and the remaining follow-up work.

## Current Implementation Snapshot (2025-10-23)
- `app/dashboard/quickstart/page.tsx`: owns the QuickStart surface, wires configuration-driven cards to the wizard launch helpers, and coordinates the legacy modals that still power lead import and campaign creation.
- `components/quickstart/useQuickStartCardViewModel.tsx`: enhances card descriptors with wizard metadata, defers persona/goal presets, and now queues each wizard-enabled card’s primary action until the user completes the plan.
- `components/quickstart/wizard/QuickStartWizard.tsx`: renders the persona → goal → summary steps, exposes navigation controls, and signals completion through `useQuickStartWizardStore`.
- `lib/stores/quickstartWizard.ts`: stores wizard UI state (`isOpen`, active step/preset) plus the optional `pendingAction` callback that executes when the plan is accepted. It now exposes `launchWithAction`, `complete()`, and `cancel()` helpers so downstream cards can queue work safely.
- `lib/stores/quickstartWizardData.ts`: persists persona and goal selections across modal re-renders.
- `lib/config/quickstart/{descriptors,templates,wizardFlows}.tsx`: declares the card catalog, persona/goal flows, and template presets that prefill campaign state.
- `_tests/app/dashboard/quickstart/*.test.tsx`: cover the page layout and wizard behavior, including deferred action execution.

## Persona → Goal → Summary Journey
1. **Persona selection** (`PersonaStep` + `useQuickStartWizardDataStore.selectPersona`)
   - Cards may launch directly into the summary step when presets include both persona and goal IDs.
2. **Goal selection** (`GoalStep` + `selectGoal`)
   - Persona filters goal options via `quickStartPersonas` and `getGoalsForPersona`.
3. **Summary plan** (`SummaryStep`)
   - Displays ordered plan steps derived from `quickStartCardDescriptors` and the selected goal flow.
   - Primary CTA (“Close & start plan”) calls `useQuickStartWizardStore.complete()` so queued actions fire only after the wizard resets.
4. **Legacy modal execution**
   - The stored `pendingAction` typically launches dialogs (`LeadBulkSuiteModal`, `CampaignModalMain`) or routes (`/dashboard/extensions`), ensuring they appear after the wizard is dismissed.

## Active Workstreams
- ✅ **Deferred action orchestration**
  - `useQuickStartWizardStore.launchWithAction` captures the initiating card’s primary handler and runs it after the summary confirmation step.
  - `useQuickStartWizardStore.cancel()` clears the queued work when the wizard is dismissed, while `complete()` executes it after closing.
  - Regression tests ensure closing the wizard via the ghost button or dialog dismissal cancels any pending launch.
- 🚧 **Persona & goal catalog expansion**
  - Add additional personas/goals plus tailored templates in `lib/config/quickstart` to cover acquisitions, dispositions, agents, and investors equally.
  - Update summary copy and assets as new flows arrive.
- 🚧 **Template + campaign alignment**
  - Extend `applyQuickStartTemplatePreset` coverage (e.g., webhook defaults, automation rules) and surface preview states within the summary step.
- 🚧 **Analytics & instrumentation**
  - Log persona/goal selections, plan completions, and cancel events for product analytics; consider event payloads that map to downstream campaign launches.

## Backlog / De-scoped Items
- Inline wizard shell, lead-intake step decomposition, skip-trace panel refactors, and the previously proposed “embedded” experience are no longer in scope for the modal journey. Move these explorations into a separate backlog if needed for other surfaces.
- Preserve legacy modals while they remain the execution surface; migrate incrementally only when fully replacing those flows.

## Testing & QA Notes
- Continue expanding `_tests/app/dashboard/quickstart` coverage for new personas/goals and analytics triggers as they ship.
- Consider a Playwright smoke test that validates the full modal flow, including deferred actions and legacy modal launches.
