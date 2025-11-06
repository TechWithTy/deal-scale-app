# Feature: Look-Alike Audience Persona & Goal Tracking

## Overview
Enhanced the Look-Alike audience feature to capture and persist user persona and goal from their profile, providing better context for audience generation and saved configurations.

## Date
November 6, 2025

## Problem Statement
The Look-Alike audience generation lacked context about the user's business goals and persona. When saving configurations, there was no way to track which persona or goal the audience was created for, making it difficult to:
- Tailor recommendations based on user context
- Organize saved searches by user intent
- Provide personalized audience targeting suggestions
- Track which audiences align with specific business goals

## Solution Implemented

### 1. Type System Updates

#### Added Persona & Goal to LookalikeConfig
**File**: `types/lookalike/index.ts`

```tsx
export interface LookalikeConfig {
  seedListId: string;
  seedListName: string;
  seedLeadCount: number;

  // User Context (from profile) - NEW
  userPersona?: QuickStartPersonaId;
  userGoal?: QuickStartGoalId;

  // Similarity settings
  similarityThreshold: number;
  targetSize?: number;
  // ... rest of config
}
```

**Benefits**:
- Audiences now carry context about user's business role
- Can filter/recommend based on persona (investor, wholesaler, lender, agent)
- Tracks business goal (pipeline building, dispositions, acquisitions, etc.)

#### Updated SavedSearch Interface
**File**: `types/userProfile/index.ts`

```tsx
export interface SavedSearch {
  id: string;
  name: string;
  searchCriteria: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  priority?: boolean;
  lookalikeConfig?: any;
  
  // User context (for lookalike audiences) - NEW
  userPersona?: QuickStartPersonaId;
  userGoal?: QuickStartGoalId;
}
```

**Benefits**:
- Saved searches now include business context
- Can organize searches by persona/goal
- Enables personalized search recommendations

### 2. Configuration Builder Update

**File**: `components/reusables/modals/user/lookalike/utils/configBuilder.ts`

Updated `buildLookalikeConfig` function signature:

```tsx
export function buildLookalikeConfig(
  values: FormValues,
  seedListId: string,
  seedListName: string,
  seedLeadCount: number,
  userPersona?: QuickStartPersonaId,  // NEW
  userGoal?: QuickStartGoalId,        // NEW
): LookalikeConfig {
  return {
    seedListId,
    seedListName,
    seedLeadCount,
    userPersona,  // NEW
    userGoal,     // NEW
    similarityThreshold: values.similarityThreshold,
    // ... rest of config
  };
}
```

### 3. Modal UI Enhancements

**File**: `components/reusables/modals/user/lookalike/LookalikeConfigModal.tsx`

#### Added Props
```tsx
interface LookalikeConfigModalProps {
  // ... existing props
  userPersona?: QuickStartPersonaId;  // NEW
  userGoal?: QuickStartGoalId;        // NEW
}
```

#### Visual Display of Persona & Goal
Added badge UI to show user's persona and goal at the top of the modal:

```tsx
{/* User Persona & Goal */}
{(userPersona || userGoal) && (
  <div className="mt-3 flex flex-wrap gap-2">
    {userPersona && (
      <Badge variant="secondary" className="gap-1.5">
        <User className="h-3 w-3" />
        {getPersonaDefinition(userPersona)?.title || userPersona}
      </Badge>
    )}
    {userGoal && (
      <Badge variant="secondary" className="gap-1.5">
        <Target className="h-3 w-3" />
        {getGoalDefinition(userGoal)?.title || userGoal}
      </Badge>
    )}
  </div>
)}
```

**Visual Example**:
```
┌─────────────────────────────────────────┐
│ Configure Look-Alike Audience           │
│                                          │
│ 👤 Investor  🎯 Build Deal Pipeline    │ ← NEW badges
│                                          │
│ Seed List: McDermott - Kirlin (100)    │
│ ─────────────────────────────────────── │
│ [Configuration Form...]                 │
└─────────────────────────────────────────┘
```

#### Updated Generation & Save Functions
Both functions now pass persona/goal to the config builder:

```tsx
const handleGenerate = async (values: FormValues) => {
  const config = buildLookalikeConfig(
    values,
    seedListId,
    seedListName,
    seedLeadCount,
    userPersona,  // NEW
    userGoal,     // NEW
  );
  await onGenerate(config);
};

const handleSaveConfiguration = async () => {
  const config = buildLookalikeConfig(
    values,
    seedListId,
    seedListName,
    seedLeadCount,
    userPersona,  // NEW
    userGoal,     // NEW
  );
  await onSaveConfig(config, configName);
};
```

### 4. Dashboard Integration

**File**: `app/dashboard/page.tsx`

#### Passing Persona & Goal to Modal
```tsx
<LookalikeConfigModal
  isOpen={showLookalikeConfigModal}
  onOpenChange={...}
  seedListId={seedLeadListData?.listId || ""}
  seedListName={seedLeadListData?.listName || "Seed List"}
  seedLeadCount={seedLeadListData?.leadCount || 0}
  // NEW: Get from QuickStart wizard store
  userPersona={useQuickStartWizardDataStore.getState().personaId}
  userGoal={useQuickStartWizardDataStore.getState().goalId}
  onGenerate={handleGenerateLookalike}
  onSaveConfig={handleSaveLookalikeConfig}
/>
```

#### Saving Persona & Goal in Saved Searches
```tsx
const handleSaveLookalikeConfig = useCallback(
  async (config: LookalikeConfig, configName: string) => {
    const savedSearch: SavedSearch = {
      id: `lookalike_config_${Date.now()}`,
      name: configName,
      searchCriteria: {} as any,
      lookalikeConfig: completeConfig,
      userPersona: config.userPersona,  // NEW
      userGoal: config.userGoal,        // NEW
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: false,
    };
    
    leadSearchStore.savedSearches = [
      savedSearch,
      ...leadSearchStore.savedSearches,
    ];
  },
  [seedLeadListData, leadSearchStore],
);
```

## Data Flow

```
┌─────────────────────┐
│  QuickStart Wizard  │
│  (User selects)     │
│  - Persona          │
│  - Goal             │
└──────────┬──────────┘
           │
           │ Stored in
           ↓
┌─────────────────────────────┐
│ QuickStartWizardDataStore   │
│ { personaId, goalId }       │
└──────────┬──────────────────┘
           │
           │ Retrieved when
           ↓
┌─────────────────────────────┐
│  LookalikeConfigModal       │
│  (Displays badges)          │
└──────────┬──────────────────┘
           │
           │ Included in
           ↓
┌─────────────────────────────┐
│  LookalikeConfig            │
│  { userPersona, userGoal }  │
└──────────┬──────────────────┘
           │
           │ Saved to
           ↓
┌─────────────────────────────┐
│  SavedSearch                │
│  { userPersona, userGoal,   │
│    lookalikeConfig }        │
└─────────────────────────────┘
```

## Persona Types Supported

```tsx
type QuickStartPersonaId =
  | "investor"
  | "wholesaler"
  | "lender"
  | "agent";
```

**Display Names**:
- `investor` → "Investor"
- `wholesaler` → "Wholesaler"
- `lender` → "Lender"
- `agent` → "Agent"

## Goal Types Supported

```tsx
type QuickStartGoalId =
  | "investor-pipeline"      // Build Deal Pipeline
  | "investor-market"        // Market Research
  | "wholesaler-dispositions" // Move Inventory Fast
  | "wholesaler-acquisitions" // Source More Deals
  | "agent-sphere"           // Nurture Sphere
  | "agent-expansion"        // Expand Territory
  | "lender-fund-fast";      // Fund Deals Fast
```

## Usage Examples

### Example 1: Investor Building Pipeline
**User Context**:
- Persona: Investor
- Goal: Build Deal Pipeline

**Modal Display**:
```
👤 Investor  🎯 Build Deal Pipeline

[Audience configuration form...]
```

**Generated Config**:
```json
{
  "seedListId": "list_123",
  "userPersona": "investor",
  "userGoal": "investor-pipeline",
  "similarityThreshold": 75,
  // ... rest of config
}
```

**Saved Search**:
```json
{
  "id": "lookalike_config_1699564800",
  "name": "Motivated Sellers - Pipeline",
  "userPersona": "investor",
  "userGoal": "investor-pipeline",
  "lookalikeConfig": { /* full config */ }
}
```

### Example 2: Wholesaler Moving Inventory
**User Context**:
- Persona: Wholesaler
- Goal: Move Inventory Fast (Dispositions)

**Modal Display**:
```
👤 Wholesaler  🎯 Move Inventory Fast

[Audience configuration form...]
```

**Generated Config**:
```json
{
  "seedListId": "list_456",
  "userPersona": "wholesaler",
  "userGoal": "wholesaler-dispositions",
  "similarityThreshold": 80,
  // ... rest of config
}
```

## Benefits

### For Users
1. **Context Awareness**: System understands user's business role and goals
2. **Organized Searches**: Saved configurations tagged with persona/goal
3. **Personalized Experience**: Future recommendations based on persona/goal
4. **Better Tracking**: Know which audiences were created for which purpose

### For Product
1. **Analytics**: Track which personas/goals use lookalike audiences most
2. **Recommendations**: Suggest audience configurations based on persona/goal
3. **Onboarding**: Guide users through persona-specific flows
4. **A/B Testing**: Test different configurations per persona/goal

### For Development
1. **Type Safety**: Strong typing with TypeScript enums
2. **Maintainability**: Clear data flow from wizard to config to search
3. **Extensibility**: Easy to add new personas/goals
4. **Debugging**: Persona/goal logged in console for troubleshooting

## Future Enhancements

### Short-term
1. **Persona-Specific Defaults**: Pre-fill filters based on persona
   - Investors → Focus on equity, distressed signals
   - Wholesalers → Focus on quick turnover, low equity
   - Agents → Focus on active listings, sphere contacts

2. **Goal-Based Recommendations**: Suggest audience sizes based on goal
   - Pipeline building → Larger audiences
   - Dispositions → Targeted, smaller audiences

3. **Search Filtering**: Filter saved searches by persona/goal
   ```tsx
   <Select>
     <option value="all">All Personas</option>
     <option value="investor">Investor Only</option>
     <option value="wholesaler">Wholesaler Only</option>
   </Select>
   ```

### Long-term
1. **AI Recommendations**: ML model suggests best configs per persona/goal
2. **Persona Switching**: Easy switch between personas for multi-role users
3. **Goal Progress Tracking**: Track audience performance against goals
4. **Team Sharing**: Share configs with team members of same persona
5. **Historical Analysis**: Compare audiences across goals over time

## Testing Checklist

- [x] Persona/goal types properly imported
- [x] LookalikeConfig interface includes new fields
- [x] SavedSearch interface includes new fields
- [x] Config builder accepts and includes persona/goal
- [x] Modal receives and displays persona/goal as badges
- [x] Generation function passes persona/goal to config
- [x] Save function passes persona/goal to config
- [x] Dashboard retrieves persona/goal from store
- [x] Dashboard passes persona/goal to modal
- [x] Saved search includes persona/goal
- [ ] UI displays persona badge correctly
- [ ] UI displays goal badge correctly
- [ ] Saved searches can be filtered by persona (future)
- [ ] Saved searches can be filtered by goal (future)

## Files Modified

1. `types/lookalike/index.ts` - Added persona/goal to LookalikeConfig
2. `types/userProfile/index.ts` - Added persona/goal to SavedSearch
3. `components/reusables/modals/user/lookalike/utils/configBuilder.ts` - Added persona/goal parameters
4. `components/reusables/modals/user/lookalike/LookalikeConfigModal.tsx` - Added props, UI badges, updated functions
5. `app/dashboard/page.tsx` - Pass persona/goal to modal, save in searches

## Breaking Changes
**None**. All new fields are optional (`?` type), ensuring backwards compatibility with existing:
- Saved lookalike configurations
- Audience generation flows
- Saved searches

## Author
AI Assistant (Claude Sonnet 4.5)

## Status
✅ **IMPLEMENTED & READY FOR TESTING**

All code changes complete. User persona and goal now tracked throughout look-alike audience workflow and persisted in saved searches.

