# QuickStart CRM Sync Step

## Overview
- When a user has an authenticated CRM (currently GoHighLevel or Lofty CRM) the “Import from any source” QuickStart action now surfaces a dedicated CRM sync modal instead of the legacy lead-list selector.
- The modal outlines the sync path from the external CRM to DealScale and provides `Cancel`, `AI Auto Select`, and `Confirm` controls to mirror the approved wiring diagram.

## Behaviour
- **Guarded by connection detection:** we introspect `userProfile.connectedAccounts` to determine whether to display the CRM path. Users without a connected CRM continue to see the existing CSV/import flow without change.
- **Confirm → legacy selection:** `Confirm` closes the modal and re-opens the legacy lead-list selector so downstream campaign launches remain unchanged.
- **AI Auto Select:** When at least one lead list already exists we immediately hand off to the smart-campaign helper (`handleSmartCampaign`) so existing automations continue working. We emit a warning toast if no lists are ready yet.

## Backward Compatibility
- No CRM linked → identical behaviour to the prior release.
- Wizard, campaign, and lookalike modals remain untouched because the CRM modal is rendered alongside the legacy modal stack without altering their props.
- The new component relies only on UI primitives (`Dialog`, `Card`, `Button`) already shipped in the design system, so no additional dependencies were introduced.

## Testing Notes
- Run `pnpm vitest run _tests/components/quickstart/QuickStartCrmSyncModal.test.tsx --config vitest.config.ts --reporter=dot` to execute the focused unit coverage for the new modal.
- Manually verify by simulating a profile with `connectedAccounts.goHighLevel` or `connectedAccounts.loftyCRM` populated—clicking **Import from Any Source** will now surface the CRM sync modal.

