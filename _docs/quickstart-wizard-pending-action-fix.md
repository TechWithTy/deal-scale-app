# QuickStart Wizard Pending Action Fix

## Overview

This document describes the fix for the QuickStart wizard's pending action execution flow. The issue was that after completing the wizard and clicking "Close & start plan", the first step (file import) was not executing automatically, and the wizard would attempt to reopen instead of executing the intended action.

## Problem Statement

### Symptoms
1. After clicking "Close & start plan" in the wizard summary step, the file picker did not open automatically
2. The wizard would attempt to reopen (blocked by cooldown mechanism)
3. The "Guided Setup" button and goal buttons below it would disappear after wizard completion
4. Console logs showed `launchWithAction` being called instead of the direct action execution

### Root Cause

The issue had multiple contributing factors:

1. **Incorrect Pending Action**: The pending action stored in the wizard store was the button's `onClick` closure (`() => { onLaunchWizard(card.wizardPreset, onLaunchQuickStartFlow); }`) instead of the actual flow execution function (`handleLaunchQuickStartFlow`). This caused the action to try reopening the wizard instead of executing the first step.

2. **Action Clearing Before Execution**: The pending action was being cleared from the store before the `setTimeout` callback could execute it, causing the action to be `null` when it tried to run.

3. **Timing Issues**: The file input was being triggered too quickly after the modal closed, before the browser had fully removed the modal from the DOM, causing the file picker to be blocked.

4. **UI State Reset**: The wizard data (personaId, goalId) was being reset too quickly, causing the goal buttons below "Guided Setup" to disappear before session defaults could be reapplied.

## Solution

### 1. Fixed Pending Action Assignment

**File**: `components/quickstart/QuickStartActionsGrid.tsx`

**Change**: Modified the "Guided Setup" button handler to pass `onLaunchGoalFlow` directly as the pending action instead of the button's `onClick` closure.

```typescript
// Before
if (isGuidedSetupButton && wizardPreset && onClick) {
    launchWithAction(wizardPreset, onClick); // onClick was the closure
}

// After
if (isGuidedSetupButton && wizardPreset && onLaunchGoalFlow) {
    launchWithAction(wizardPreset, onLaunchGoalFlow); // Direct reference to flow executor
}
```

**Why**: This ensures the pending action is `handleLaunchQuickStartFlow`, which executes the first step directly (e.g., triggers file input) without attempting to reopen the wizard.

### 2. Preserved Pending Action in Closure

**File**: `lib/stores/quickstartWizard.ts`

**Change**: Stored the pending action in a closure variable before the `setTimeout` to prevent it from being cleared before execution.

```typescript
// Store pendingAction in a closure to prevent it from being cleared
const actionToExecute = pendingAction;

setTimeout(() => {
    if (actionToExecute) {
        actionToExecute(); // Execute from closure, not from state
    }
}, 300);
```

**Why**: This ensures the action can execute even if the wizard state is reset before the timeout callback runs.

### 3. Adjusted Timing Delays

**File**: `lib/stores/quickstartWizard.ts`

**Changes**:
- Changed from `requestAnimationFrame` to `setTimeout` with 300ms delay for action execution
- Increased delay before clearing `pendingAction` from 0ms to 1000ms

```typescript
// Execute action after modal is fully closed
setTimeout(() => {
    actionToExecute();
    // ... reset logic
    setTimeout(() => {
        // Clear pendingAction after action has fully executed
        set({ pendingAction: null });
    }, 1000); // Increased from 0ms
}, 300); // Changed from requestAnimationFrame
```

**Why**: 
- 300ms delay ensures the modal closing animation completes and the modal is fully removed from the DOM before triggering the file input
- 1000ms delay before clearing `pendingAction` ensures the action has fully executed before cleanup

### 4. Prevented applyPreset from Clearing Session Defaults

**File**: `lib/stores/quickstartWizard.ts`

**Change**: Only call `applyPreset` if a preset is actually provided.

```typescript
// Before
useQuickStartWizardDataStore.getState().applyPreset(preset); // Called even if preset is undefined

// After
if (preset) {
    useQuickStartWizardDataStore.getState().applyPreset(preset); // Only if preset exists
}
```

**Why**: `applyPreset(undefined)` was resetting the data store and clearing session defaults that had been pre-populated.

### 5. Added Completion Cooldown to launchWithAction

**File**: `lib/stores/quickstartWizard.ts`

**Change**: Added cooldown check to `launchWithAction` to prevent the wizard from reopening immediately after completion.

```typescript
launchWithAction: (preset, action) => {
    const currentState = get();
    
    // Block if within cooldown period and wizard is closed
    if (currentState.lastCompletionTime !== null && !currentState.isOpen) {
        const timeSinceCompletion = Date.now() - currentState.lastCompletionTime;
        if (timeSinceCompletion < COMPLETION_COOLDOWN_MS) {
            // Block reopening
            return;
        }
    }
    // ... rest of logic
}
```

**Why**: Prevents the wizard from reopening when `launchWithAction` is called during the cooldown period after completion.

## Architecture Flow

### Before Fix

```
User clicks "Close & start plan"
  ↓
Wizard.complete() called
  ↓
Pending action = onClick closure (calls onLaunchWizard)
  ↓
setTimeout(300ms) → Execute action
  ↓
Action tries to call launchWithAction → Blocked by cooldown
  ↓
File input never triggered ❌
```

### After Fix

```
User clicks "Close & start plan"
  ↓
Wizard.complete() called
  ↓
Pending action = handleLaunchQuickStartFlow (stored in closure)
  ↓
setTimeout(300ms) → Execute action from closure
  ↓
handleLaunchQuickStartFlow() executes directly
  ↓
handleImportFromSource() → triggerFileInput()
  ↓
File picker opens ✅
```

## Key Files Modified

1. **`lib/stores/quickstartWizard.ts`**
   - Fixed pending action preservation in closure
   - Adjusted timing delays
   - Added cooldown check to `launchWithAction`
   - Prevented `applyPreset(undefined)` from clearing session defaults

2. **`components/quickstart/QuickStartActionsGrid.tsx`**
   - Changed pending action from `onClick` closure to `onLaunchGoalFlow` direct reference

3. **`components/quickstart/wizard/QuickStartWizard.tsx`**
   - Added session defaults application when wizard opens
   - Added completion cooldown checks to session sync

4. **`app/dashboard/page.tsx`**
   - Added logging to trace action execution
   - Added cooldown check to auto-open logic

## Testing Instructions

### Test Case 1: Basic Flow Execution

1. Navigate to `/dashboard`
2. Click "Guided Setup" button
3. Select a persona (e.g., "Agent")
4. Select a goal (e.g., "Agent Sphere")
5. Click "Close & start plan"
6. **Expected**: File picker should open automatically after ~300ms
7. **Verify**: Console logs show:
   - `🎯 [WIZARD] Executing pending action`
   - `🚀 [handleLaunchQuickStartFlow] Called`
   - `📁 [triggerFileInput] Called`

### Test Case 2: Wizard Doesn't Reopen

1. Complete the wizard flow as above
2. After clicking "Close & start plan", wait 1 second
3. Try to manually open the wizard again
4. **Expected**: Wizard should open normally (cooldown expired)
5. **Verify**: No `🚫 [WIZARD] launchWithAction blocked by completion cooldown` logs

### Test Case 3: Session Defaults Persist

1. Ensure user has session defaults set (personaId: "agent", goalId: "agent-sphere")
2. Open the wizard
3. **Expected**: Persona and goal should be pre-selected
4. Complete the wizard
5. Open the wizard again
6. **Expected**: Persona and goal should still be pre-selected

### Test Case 4: Goal Buttons Don't Disappear

1. Complete the wizard with a persona selected
2. After wizard closes, check the "Guided Setup" card
3. **Expected**: Goal buttons should still be visible below "Guided Setup" button
4. **Verify**: Buttons reappear after session defaults are reapplied (after cooldown)

## Console Log Reference

### Successful Execution Flow

```
🎯 [WIZARD] complete() called
🎯 [WIZARD] State before complete: { hasPendingAction: true, ... }
🎯 [WIZARD] Scheduling action execution with delay to ensure modal is fully closed
🎯 [WIZARD] Pending action details: { hasPendingAction: true, actionType: "function" }
🎯 [WIZARD] setTimeout callback executing after 300ms delay
🎯 [WIZARD] Checking pending action: { hasPendingAction: true, ... }
🎯 [WIZARD] Executing pending action
🚀 [handleLaunchQuickStartFlow] Called
🚀 [handleLaunchQuickStartFlow] Wizard data state: { goalId: "agent-sphere", ... }
📁 [triggerFileInput] Called, fileInputRef: { hasRef: true, ... }
📁 [triggerFileInput] Clicking file input
✅ [triggerFileInput] File input clicked
🎯 [WIZARD] Pending action executed successfully
```

### Blocked Reopening (Expected)

```
🚫 [WIZARD] launchWithAction blocked by completion cooldown: 306ms < 2500ms
Wizard is closed, blocking to prevent reopening
```

## Related Issues

- **Wizard Reopening After Completion**: Fixed by completion cooldown mechanism
- **Session Defaults Not Applied**: Fixed by applying defaults when wizard opens
- **File Input Not Triggering**: Fixed by correct pending action and timing delays
- **Goal Buttons Disappearing**: Fixed by preserving session defaults and delaying reset

## Future Considerations

1. **Cooldown Duration**: Currently set to 2.5 seconds. May need adjustment based on user feedback.

2. **Action Execution Timing**: 300ms delay may need adjustment for different browsers or slower devices.

3. **Error Handling**: Consider adding retry logic if file input fails to open.

4. **Analytics**: Add tracking for:
   - Pending action execution success/failure
   - Time between wizard completion and action execution
   - File picker open success rate

## Dependencies

- `lib/stores/quickstartWizard.ts` - Wizard state management
- `lib/stores/quickstartWizardData.ts` - Wizard data (personaId, goalId)
- `components/quickstart/QuickStartActionsGrid.tsx` - Action button handlers
- `app/dashboard/page.tsx` - Flow execution logic

## Related Documentation

- `_docs/quickstart-wizard-session-sync-timing.md` - Session sync timing analysis
- `_docs/quickstart-wizard-decision-tree.md` - Wizard auto-open conditions
- `_docs/quickstart-wizard-decoupling-summary.md` - Wizard decoupling implementation

