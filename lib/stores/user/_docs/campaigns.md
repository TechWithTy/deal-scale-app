# Campaigns Stores

- `useUserCampaignsStore`: user-scoped items with `currentType: 'text' | 'call' | 'social' | 'dm'`.
  - `dm` (Direct Mail) aliases Email.
  - `setType()`, `filterByStatus()`, `count()`.
- `useUserCampaignReportsStore`: totals by channel, status counts, transfer breakdown via `TransferType`, and per-channel summaries.

## Import

```ts
import {
  useUserCampaignsStore,
  useUserCampaignReportsStore,
} from '@/lib/stores/user/userProfile';
```

## TransferType Guidance

Use a temporary variable for computed keys to satisfy TypeScript safety:

```ts
const key = campaign.transfer?.type; // TransferType | undefined
if (key) breakdown[key] = (breakdown[key] ?? 0) + 1;
```
