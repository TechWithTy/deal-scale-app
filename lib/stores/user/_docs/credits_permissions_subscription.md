# Credits, Permissions, Subscription

- `useUserCreditsStore`: remaining(), consume(kind, amount), refund(kind, amount)
- `usePermissionsStore`: hasPermission(key), and helpers canManageTeam(), canAccessAI(), canManageSubscription()
- `useUserSubscriptionStore`: get(), planName(), status(), renewalDate(), resetInDays(), remaining()

## Import

```ts
import {
  useUserCreditsStore,
  usePermissionsStore,
  useUserSubscriptionStore,
} from '@/lib/stores/user/userProfile';
```
