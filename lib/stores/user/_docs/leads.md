# Leads Stores

- `useUserLeadsStore`: seeded from `companyInfo.leads`.
  - `filterByStatus()`, `filterByFollowUpRange()`, `filterByCampaignId()`, `resetFilters()`, `count()`.
- `useUserLeadsReportsStore`: status counts, DNC by flag and source, per-campaign counts.
- `useSavedSearchesStore`: CRUD on `UserProfile.savedSearches` via `useUserProfileStore.updateUserProfile`.

## Import

```ts
import {
  useUserLeadsStore,
  useUserLeadsReportsStore,
  useSavedSearchesStore,
} from '@/lib/stores/user/userProfile';
```

## Notes

- Saved searches mutate the persisted user profile; if `userProfile` is null, CRUD is a no-op.
- Prefer optional chaining when reading from `MockUserProfile`.
