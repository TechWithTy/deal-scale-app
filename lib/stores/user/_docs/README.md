# User Stores: Single-Top Aggregator and Modules

This folder documents the user-scoped Zustand stores and their aggregator. You can import everything from a single top at:

- `lib/stores/user/userProfile.ts`

It re-exports all domain stores, and provides a grouped `UserStores` object for ergonomic nested access.

## Quick Start

```ts
import {
  useAIReportsStore,
  useUserCampaignsStore,
  useUserLeadsStore,
  useSavedSearchesStore,
  useUserSubscriptionStore,
} from '@/lib/stores/user/userProfile';

const ai = useAIReportsStore.getState();
const campaigns = useUserCampaignsStore.getState();
const leads = useUserLeadsStore.getState();
const saved = useSavedSearchesStore.getState();
const sub = useUserSubscriptionStore.getState();
```

Or use the grouped API:

```ts
import { UserStores } from '@/lib/stores/user/userProfile';

const ai = UserStores.ai.reports.getState();
const campaignStore = UserStores.campaigns.store.getState();
const leadStore = UserStores.leads.store.getState();
const credits = UserStores.credits.getState();
```

## Channels and Types

- Direct Mail (DM) uses the Email dataset but is named `dm` in stores and reports.
- Transfer aggregation uses `campaign.transfer?.type` and strictly typed `TransferType` keys.
- All mock-derived reads guard with optional chaining since `MockUserProfile` can be undefined.

## Modules

- AI: settings, actions, chat (persisted), reports (DM + Social + Kanban), tasks
- Campaigns: user-scoped store with `dm` alias, and rich reports
- Leads: filters/selectors, saved searches, reports (status + DNC + per-campaign)
- Skip Trace: wizard store + reports (progress/headers/enrichment)
- Company: CompanyInfo updates + connected accounts CRUD
- Credits: remaining/consume/refund derived from subscription
- Permissions: typed permission checks with fallback string permissions
- Subscription: plan, status, renewal, reset timers, remaining

## Testing (Vitest)

These stores include lightweight state-based tests under `lib/stores/user/_tests/`, powered by Vitest.

### HOW TO RUN

```bash
# install dev deps
pnpm install

# run entire suite once
pnpm test

# run only user store tests
pnpm test:stores

# watch mode during development
pnpm test:watch
```

No browser is launched; we use the runner for assertions only.
