# QuickStart Wizard: Auto-Select ICP Type & Goal

**Status:** ✅ Implemented  
**Date:** 2025-11-02

---

## 📋 Overview

The QuickStart Wizard now automatically pre-selects the user's ICP type (persona) and goal based on their profile data. This provides a personalized experience and reduces friction in the onboarding flow.

### How It Works

1. User's `clientType` is stored in `userProfile.companyInfo.clientType`
2. This automatically syncs to `userProfile.quickStartDefaults.personaId`
3. When the wizard opens, it reads from `quickStartDefaults` and pre-selects the appropriate persona
4. The wizard store (`lib/stores/quickstartWizardData.ts`) handles all the magic ✨

---

## 🎯 ICP Type Mappings

| Client Type (Profile) | Persona (Wizard) | Goal Options |
|----------------------|------------------|--------------|
| `investor` | Investor | Acquire profitable assets faster |
| `wholesaler` | Wholesaler | Match deals with ready buyers |
| `agent` | Agent / Team | Multiply your listing opportunities |
| `loan_officer` | Private Lender | Keep capital deployed and approvals moving |

---

## 🔧 Implementation

### 1. Setting Client Type in User Profile

#### Option A: During Onboarding

```typescript
import { useUserProfileStore } from '@/lib/stores/user/userProfile';
import { updateProfileWithQuickStartDefaults } from '@/lib/utils/quickstart/setPersonaDefaults';
import type { ClientType } from '@/types/user';

function OnboardingStep() {
  const updateProfile = useUserProfileStore(state => state.updateUserProfile);

  const handleSelectICPType = (icpType: ClientType) => {
    // Update the clientType in company info
    updateProfile({
      companyInfo: {
        ...currentCompanyInfo,
        clientType: icpType
      }
    });

    // This utility automatically creates and sets quickStartDefaults
    updateProfileWithQuickStartDefaults(updateProfile, icpType);
  };

  return (
    <div>
      <button onClick={() => handleSelectICPType('investor')}>
        I'm an Investor
      </button>
      <button onClick={() => handleSelectICPType('wholesaler')}>
        I'm a Wholesaler
      </button>
      <button onClick={() => handleSelectICPType('agent')}>
        I'm an Agent
      </button>
      <button onClick={() => handleSelectICPType('loan_officer')}>
        I'm a Lender
      </button>
    </div>
  );
}
```

#### Option B: Automatic Sync (Recommended)

Add the sync hook to your app shell to automatically keep `quickStartDefaults` in sync:

```typescript
// In your layout or high-level component
import { useSyncClientTypeToQuickStartDefaults } from '@/lib/utils/quickstart/syncProfileToDefaults';

export function AppShell({ children }: { children: React.ReactNode }) {
  // This hook runs automatically and keeps everything in sync
  useSyncClientTypeToQuickStartDefaults();

  return (
    <div>
      {children}
    </div>
  );
}
```

### 2. Setting Both Persona AND Goal

If you want to pre-select a specific goal as well:

```typescript
import { useUserProfileStore } from '@/lib/stores/user/userProfile';
import { createQuickStartDefaultsWithGoal } from '@/lib/utils/quickstart/setPersonaDefaults';

function SetUserGoal() {
  const updateProfile = useUserProfileStore(state => state.updateUserProfile);

  const handleSetGoalAfterSurvey = () => {
    const defaults = createQuickStartDefaultsWithGoal(
      'investor',
      'investor-build-pipeline'
    );

    if (defaults) {
      updateProfile({ quickStartDefaults: defaults });
    }
  };

  return (
    <button onClick={handleSetGoalAfterSurvey}>
      Set Goal: Build Pipeline
    </button>
  );
}
```

---

## 📊 Data Flow Diagram

```
User Profile Update
    ↓
companyInfo.clientType = 'investor'
    ↓
[Auto-sync or Manual Sync]
    ↓
quickStartDefaults = { personaId: 'investor' }
    ↓
QuickStartWizardDataStore reads quickStartDefaults
    ↓
Wizard opens with "Investor" pre-selected ✅
```

---

## 🧪 Testing

### Manual Testing Steps

1. **Set Client Type:**
   ```ts
   const { updateUserProfile } = useUserProfileStore.getState();
   updateUserProfile({
     companyInfo: {
       ...currentInfo,
       clientType: 'wholesaler'
     }
   });
   ```

2. **Open QuickStart Wizard:**
   - Navigate to dashboard
   - Click "QuickStart Wizard" button
   - Verify "Wholesaler" persona is pre-selected

3. **Change Client Type:**
   ```ts
   updateUserProfile({
     companyInfo: {
       ...currentInfo,
       clientType: 'investor'
     }
   });
   ```

4. **Re-open Wizard:**
   - Close and reopen wizard
   - Verify "Investor" persona is now pre-selected

### Automated Tests

```typescript
import { renderHook } from '@testing-library/react';
import { useQuickStartWizardDataStore } from '@/lib/stores/quickstartWizardData';
import { useUserProfileStore } from '@/lib/stores/user/userProfile';

describe('QuickStart Auto-Select', () => {
  it('should pre-select persona based on clientType', () => {
    // Set client type in profile
    useUserProfileStore.getState().updateUserProfile({
      quickStartDefaults: {
        personaId: 'wholesaler'
      }
    });

    // Check wizard store
    const { personaId } = useQuickStartWizardDataStore.getState();
    expect(personaId).toBe('wholesaler');
  });

  it('should update when quickStartDefaults change', () => {
    const { result } = renderHook(() => useQuickStartWizardDataStore());

    // Update defaults
    useUserProfileStore.getState().updateUserProfile({
      quickStartDefaults: {
        personaId: 'investor',
        goalId: 'investor-build-pipeline'
      }
    });

    // Verify wizard updated
    expect(result.current.personaId).toBe('investor');
    expect(result.current.goalId).toBe('investor-build-pipeline');
  });
});
```

---

## 🔌 API Reference

### Types

```typescript
// From types/userProfile/index.ts
interface QuickStartDefaults {
  personaId?: QuickStartPersonaId;
  goalId?: QuickStartGoalId;
}

interface CompanyInfo {
  // ... other fields
  clientType?: "investor" | "wholesaler" | "agent" | "loan_officer";
}

// From types/user.ts
type ClientType = "investor" | "wholesaler" | "agent" | "loan_officer";

// From lib/config/quickstart/wizardFlows.ts
type QuickStartPersonaId = "investor" | "wholesaler" | "lender" | "agent";
type QuickStartGoalId = string; // e.g., "investor-build-pipeline"
```

### Utility Functions

#### `clientTypeToPersonaId()`
Converts `ClientType` to `QuickStartPersonaId`.

```typescript
import { clientTypeToPersonaId } from '@/lib/utils/quickstart/setPersonaDefaults';

const personaId = clientTypeToPersonaId('loan_officer');
// Returns: 'lender'
```

#### `createQuickStartDefaults()`
Creates `QuickStartDefaults` object from `ClientType`.

```typescript
import { createQuickStartDefaults } from '@/lib/utils/quickstart/setPersonaDefaults';

const defaults = createQuickStartDefaults('investor');
// Returns: { personaId: 'investor' }
```

#### `useSyncClientTypeToQuickStartDefaults()`
React hook that automatically syncs `clientType` to `quickStartDefaults`.

```typescript
import { useSyncClientTypeToQuickStartDefaults } from '@/lib/utils/quickstart/syncProfileToDefaults';

function MyComponent() {
  useSyncClientTypeToQuickStartDefaults();
  // ... rest of component
}
```

---

## 🎨 UI/UX Behavior

### First-Time Users (No Profile Data)
- Wizard shows all 4 persona options
- User manually selects their ICP type
- Selection is saved to profile for future use

### Returning Users (With Profile Data)
- Wizard opens with their persona **pre-selected** ✅
- User can still change selection if needed
- Step 1 feels instant and personalized

### Users Who Change ICP Type
- Update `companyInfo.clientType` in settings
- Next time wizard opens, new persona is pre-selected
- Previous goal selection is preserved if compatible

---

## 🚨 Edge Cases Handled

### 1. Profile Has `clientType` But No `quickStartDefaults`
✅ **Solution:** Auto-sync hook creates `quickStartDefaults` from `clientType`

### 2. Profile Has `quickStartDefaults` But No `clientType`
✅ **Solution:** Wizard works normally with `quickStartDefaults`

### 3. User Manually Selects Different Persona in Wizard
✅ **Solution:** User's choice takes precedence. Update profile only when they complete the wizard or explicitly save.

### 4. `clientType` is Changed
✅ **Solution:** Auto-sync updates `quickStartDefaults.personaId` but preserves `goalId` if it's compatible

### 5. Invalid or Missing Data
✅ **Solution:** All functions return `null` or `undefined`, wizard falls back to showing all options

---

## 📝 Migration Guide

### For Existing Users

If you have existing users without `quickStartDefaults`, run a one-time migration:

```typescript
import { useUserProfileStore } from '@/lib/stores/user/userProfile';
import { syncClientTypeToQuickStartDefaults } from '@/lib/utils/quickstart/syncProfileToDefaults';

// Migration script or admin action
export async function migrateUserQuickStartDefaults(userId: string) {
  const profile = useUserProfileStore.getState().userProfile;
  const update = useUserProfileStore.getState().updateUserProfile;

  if (!profile) return;

  // If they have a clientType but no quickStartDefaults, sync it
  if (profile.companyInfo?.clientType && !profile.quickStartDefaults) {
    const synced = syncClientTypeToQuickStartDefaults(profile, update);

    if (synced) {
      console.log(`✅ Migrated user ${userId} quickStartDefaults`);
    }
  }
}
```

---

## 🔗 Related Files

| File | Purpose |
|------|---------|
| `lib/stores/quickstartWizardData.ts` | Wizard state management + auto-load from profile |
| `lib/utils/quickstart/setPersonaDefaults.ts` | Mapping utilities for clientType ↔ personaId |
| `lib/utils/quickstart/syncProfileToDefaults.ts` | Auto-sync hook and functions |
| `types/userProfile/index.ts` | Type definitions for profile and defaults |
| `components/quickstart/wizard/QuickStartWizard.tsx` | Main wizard component |

---

## ✅ Benefits

- ✅ **Reduced friction:** Users don't have to select their ICP type every time
- ✅ **Personalized experience:** Wizard feels tailored to their business
- ✅ **Data consistency:** Single source of truth for user's business type
- ✅ **Flexible:** Users can always change their selection
- ✅ **Maintainable:** Clean separation of concerns with utility functions

---

## 🚀 Next Steps

1. Add the sync hook to your app shell component
2. Update your onboarding flow to capture `clientType`
3. Test the wizard with different persona types
4. (Optional) Run migration for existing users

---

**Questions or issues?** Check the codebase search for usage examples or refer to the test files.

