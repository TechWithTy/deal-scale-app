# Permissions and Credits Integration Guide

This document details how to integrate and use the permissions and credits system in the DealScale application.

## Overview
We use a combination of:
- **NextAuth** for session management
- **Zustand** for global state management
- **Custom hooks** for common operations

to manage and access user permissions and credits throughout the application.

## Key Files
1. `lib/stores/userStore.ts`: Zustand store definition
2. `components/auth/SessionSync.tsx`: Syncs NextAuth session to Zustand store
3. `app/layout.tsx`: Where SessionSync is integrated

## Accessing State
### In Client Components
```typescript
import { useUserStore } from "@/lib/stores/userStore";

// Get entire state
const { role, permissions, credits } = useUserStore();

// Or select specific values
const aiCredits = useUserStore(state => state.credits.ai);
const hasEditPermission = useUserStore(state => 
  state.permissions.includes("content:edit")
);
```

### Utility Hooks
We provide custom hooks for common checks:

**`lib/hooks/usePermissions.ts`**
```typescript
import { useUserStore } from "@/lib/stores/userStore";

export function useHasPermission(requiredPermission: string) {
  return useUserStore(
    state => state.permissions.includes(requiredPermission)
  );
}
```

**Usage:**
```typescript
const canEdit = useHasPermission("content:edit");
```

**`lib/hooks/useCredits.ts`**
```typescript
import { useUserStore } from "@/lib/stores/userStore";

export function useCredits() {
  return useUserStore(state => state.credits);
}

export function useHasSufficientCredits(
  type: keyof UserState['credits'], 
  amount: number
) {
  const credits = useUserStore(state => state.credits[type]);
  return (credits.allotted - credits.used) >= amount;
}
```

## How Session Sync Works
1. The `SessionSync` component in our root layout listens to NextAuth session changes
2. When authentication state changes:
   - Authenticated: Updates Zustand store with session data
   - Unauthenticated: Resets Zustand store

## Best Practices
1. **Use utility hooks**: For common operations to avoid duplication
2. **Server-side checks**: Always validate critical operations on the server
3. **Optimize re-renders**: Use Zustand selectors to subscribe to minimal state

## Troubleshooting
### Store not updating
- Ensure `SessionSync` is mounted in your layout
- Verify the session contains expected data in NextAuth callbacks

### Permissions not applying
- Check that permissions are included in the session object
- Verify the `useUserStore` is called in a client component
