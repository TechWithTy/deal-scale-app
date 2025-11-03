# Quick Start: Enable Auto-Select ICP Type

**5-Minute Implementation Guide**

---

## ✅ What's Already Done

The infrastructure for auto-selecting ICP type in the QuickStart Wizard is **100% ready**:

- ✅ Type definitions added (`CompanyInfo.clientType`)
- ✅ Wizard store reads from `userProfile.quickStartDefaults`
- ✅ Utility functions created for mapping
- ✅ Auto-sync hook ready to use

---

## 🚀 To Enable (2 Steps)

### Step 1: Add Sync Hook to Your App Shell

Add this one line to your authenticated app shell component:

```typescript:app/dashboard/layout.tsx
import { useSyncClientTypeToQuickStartDefaults } from '@/lib/utils/quickstart/syncProfileToDefaults';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // ✅ Add this hook - it handles everything automatically
  useSyncClientTypeToQuickStartDefaults();

  return (
    <div>
      {children}
    </div>
  );
}
```

### Step 2: Set Client Type in User Profile

#### Option A: In Onboarding Flow

```typescript
import { useUserProfileStore } from '@/lib/stores/user/userProfile';
import { updateProfileWithQuickStartDefaults } from '@/lib/utils/quickstart/setPersonaDefaults';

const updateProfile = useUserProfileStore(state => state.updateUserProfile);

// When user selects their business type:
const handleSelectBusinessType = (type: 'investor' | 'wholesaler' | 'agent' | 'loan_officer') => {
  updateProfile({
    companyInfo: {
      ...currentCompanyInfo,
      clientType: type
    }
  });

  // This auto-creates quickStartDefaults
  updateProfileWithQuickStartDefaults(updateProfile, type);
};
```

#### Option B: In Profile Settings

```typescript
// Add a dropdown in user settings
<Select 
  value={profile.companyInfo?.clientType}
  onValueChange={(value) => {
    updateProfile({
      companyInfo: {
        ...profile.companyInfo,
        clientType: value as ClientType
      }
    });
  }}
>
  <SelectItem value="investor">Investor</SelectItem>
  <SelectItem value="wholesaler">Wholesaler</SelectItem>
  <SelectItem value="agent">Agent / Team</SelectItem>
  <SelectItem value="loan_officer">Private Lender</SelectItem>
</Select>
```

---

## ✅ That's It!

Once these two steps are done:

1. ✅ User's ICP type is saved in their profile
2. ✅ QuickStart Wizard automatically pre-selects their persona
3. ✅ Everything stays in sync automatically

---

## 🧪 Test It

1. Set a user's `clientType` to `"investor"`:
   ```ts
   useUserProfileStore.getState().updateUserProfile({
     companyInfo: { ...current, clientType: 'investor' }
   });
   ```

2. Open QuickStart Wizard

3. ✅ "Investor" persona should be pre-selected!

---

## 📚 Full Documentation

See `_docs/features/quickstart/AUTO_SELECT_ICP.md` for:
- Complete API reference
- Advanced usage examples
- Migration guide for existing users
- Testing strategies
- Edge case handling

---

## 🎯 Result

**Before:**
```
User opens wizard → Sees 4 options → Must select manually every time
```

**After:**
```
User opens wizard → Their ICP type already selected → Instant, personalized ✨
```

