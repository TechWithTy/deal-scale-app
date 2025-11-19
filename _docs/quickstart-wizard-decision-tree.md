# QuickStart Wizard Auto-Open Decision Tree

This document outlines all conditions that trigger the QuickStart wizard to automatically open.

## Decision Tree

```
User Action / System Event
│
├─ Is wizard already open?
│  └─ NO → Continue
│  └─ YES → Do nothing (wizard stays open)
│
├─ Is wizard in completion cooldown? (within 2.5s of last completion)
│  └─ YES → Block all auto-open triggers (prevents reopening after "Close & start plan")
│  └─ NO → Continue
│
├─ URL Parameters Present?
│  ├─ urlParams.goalId exists?
│  │  └─ YES → Auto-open wizard + select goal
│  │     └─ Location: `components/quickstart/wizard/QuickStartWizard.tsx:85-98`
│  │
│  └─ urlParams.personaId exists?
│     └─ YES → Auto-open wizard + select persona
│        └─ Location: `components/quickstart/wizard/QuickStartWizard.tsx:101-117`
│
├─ First-Time User?
│  └─ hasSeenWizard === false AND isExperienceHydrated === true?
│     └─ YES → Auto-open wizard
│        └─ Location: `app/dashboard/page.tsx:1628-1636`
│
├─ Explicit User Action?
│  ├─ Click "Guided Setup" button?
│  │  └─ YES → Launch wizard with action
│  │     └─ Location: `components/quickstart/QuickStartActionsGrid.tsx:355-357`
│  │     └─ Method: `launchWithAction(wizardPreset, onClick)`
│  │
│  └─ Call `openWizard()` directly?
│     └─ YES → Open wizard
│        └─ Location: `lib/stores/quickstartWizard.ts:50-82`
│
└─ Session Defaults Sync?
   └─ Session has quickStartDefaults AND wizard closed AND no persona/goal selected?
      └─ YES → Apply defaults (but does NOT auto-open wizard)
         └─ Location: `components/quickstart/wizard/QuickStartWizard.tsx:122-184`
         └─ Note: Session sync only applies defaults, it does NOT open wizard
```

## Auto-Open Triggers (Summary)

### 1. URL Parameters (Highest Priority)
- **Trigger**: `urlParams.goalId` or `urlParams.personaId` present
- **Action**: Auto-open wizard + apply parameter
- **Location**: `QuickStartWizard.tsx:85-117`
- **Bypasses**: Completion cooldown (explicit user intent via URL)

### 2. First-Time User Experience
- **Trigger**: `hasSeenWizard === false` AND `isExperienceHydrated === true`
- **Action**: Auto-open wizard
- **Location**: `app/dashboard/page.tsx:1628-1636`
- **Bypasses**: Completion cooldown (first-time experience)

### 3. Explicit User Action
- **Trigger**: User clicks "Guided Setup" button
- **Action**: Launch wizard with pending action
- **Location**: `QuickStartActionsGrid.tsx:355-357`
- **Bypasses**: Completion cooldown (explicit user intent)

### 4. Programmatic Open
- **Trigger**: Code calls `useQuickStartWizardStore.open()`
- **Action**: Open wizard
- **Location**: `lib/stores/quickstartWizard.ts:50-82`
- **Bypasses**: Completion cooldown (explicit programmatic call)

## Non-Triggers (Do NOT Auto-Open)

### Session Defaults Sync
- **What it does**: Applies `personaId`/`goalId` from session defaults
- **What it does NOT do**: Open wizard automatically
- **Location**: `QuickStartWizard.tsx:122-184`
- **Note**: Session sync only sets data, wizard must be opened explicitly

### UserProfile Store Subscription
- **What it does**: Syncs `quickStartDefaults` from UserProfile changes
- **What it does NOT do**: Open wizard automatically
- **Location**: `lib/stores/quickstartWizardData.ts:204-228`
- **Note**: Only updates data store, does not trigger wizard open

### Step Updates
- **What it does**: Updates wizard step when persona/goal changes
- **What it does NOT do**: Open wizard if closed
- **Location**: `QuickStartWizard.tsx:195-217`
- **Note**: Only runs when `isOpen === true`

## Completion Cooldown Protection

The completion cooldown (2.5 seconds) prevents auto-open triggers from firing immediately after wizard completion. This prevents the wizard from reopening after "Close & start plan".

**Protected triggers**:
- Session defaults sync (blocked during cooldown)
- UserProfile subscription (blocked during cooldown)

**Unprotected triggers** (bypass cooldown):
- URL parameters (explicit user intent)
- First-time user experience (onboarding flow)
- Explicit user actions (Guided Setup button)
- Programmatic opens (explicit code calls)

## Implementation Details

### Completion Cooldown
- **Duration**: 2500ms (2.5 seconds)
- **Stored in**: `useQuickStartWizardStore.lastCompletionTime`
- **Set when**: Wizard `complete()` is called
- **Cleared when**: Wizard explicitly opened by user
- **Location**: `lib/stores/quickstartWizard.ts:151-156`

### Session Sync Cooldown Check
- **Location**: `QuickStartWizard.tsx:133-145`
- **Logic**: If `lastCompletionTime` exists and < 2500ms ago, block sync
- **Purpose**: Prevent wizard reopening after completion

## Flow Examples

### Example 1: User Completes Wizard
1. User clicks "Close & start plan"
2. `complete()` called → `lastCompletionTime` set
3. Wizard closes → `isOpen = false`
4. Action executes (e.g., file input opens)
5. After 500ms: Wizard data resets → `personaId`/`goalId` become null
6. Session sync effect triggers → Checks cooldown → **BLOCKED** (within 2.5s)
7. Wizard does NOT reopen ✅

### Example 2: User Clicks "Start Campaign"
1. User clicks "Start Campaign" button
2. Action handler checks: Is "Guided Setup"? → NO
3. Action executes directly → Campaign modal opens
4. Wizard does NOT open ✅

### Example 3: User Clicks "Guided Setup"
1. User clicks "Guided Setup" button
2. Action handler checks: Is "Guided Setup"? → YES
3. `launchWithAction(wizardPreset, onClick)` called
4. Wizard opens with pending action
5. User completes wizard → Action executes ✅

### Example 4: First-Time User
1. User visits dashboard for first time
2. `hasSeenWizard === false` AND `isExperienceHydrated === true`
3. Auto-open wizard (bypasses cooldown)
4. User sees onboarding flow ✅


