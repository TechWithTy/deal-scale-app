# QuickStart Wizard Session Sync Timing Analysis

## Completion Flow Sequence

### When User Clicks "Close & start plan"

1. **T+0ms**: `complete()` called in `quickstartWizard.ts`
   - `isCompleting` set to `true` (wizard store)
   - `isOpen` set to `false`
   - `isCompleting` set to `true` (data store)

2. **T+~16-33ms**: First `requestAnimationFrame` callback
   - Dialog closing animation starts

3. **T+~33-50ms**: Second `requestAnimationFrame` callback
   - Pending action executes (e.g., `handleLaunchQuickStartFlow`)
   - `isCompleting` set to `false` (wizard store) - **PROBLEM POINT 1**

4. **T+533ms**: Wizard data reset (`setTimeout 500ms`)
   - `personaId` and `goalId` become `null`
   - Session sync effect triggers (because `personaId`/`goalId` changed)
   - Session sync checks `isCompleting` (data store) - should be `true` but timing issue

5. **T+733ms**: Data store `isCompleting` set to `false` (`setTimeout 200ms`)
   - **PROBLEM POINT 2**: Session sync effect can now run
   - Session defaults re-apply → `selectGoal()` or `selectPersona()` called
   - Step update effect (lines 195-217) detects persona/goal changes

6. **T+733ms+**: Potential wizard reopen
   - Step update effect might trigger if conditions are met
   - Session sync might trigger wizard open if `isOpen` is false

## Problem Points

### Problem 1: Wizard Store `isCompleting` Reset Too Early
- Line 175: `isCompleting` set to `false` immediately after action executes
- This happens ~50ms after completion
- But data reset happens 500ms later
- Session sync effect can run between these times if it checks wizard store `isCompleting`

### Problem 2: Data Store `isCompleting` Reset Timing
- Line 188: Data store `isCompleting` set to `false` 200ms after data reset
- Total: 700ms after completion
- Session sync effect runs when `personaId`/`goalId` change (line 183)
- By the time sync effect checks `isCompleting`, it might already be false

### Problem 3: Session Sync Effect Dependencies
- Effect depends on: `personaId`, `goalId`, `isCompleting`, `isOpen`
- When data resets, `personaId` and `goalId` change from values to `null`
- This triggers the effect even if `isCompleting` is true
- The effect checks `isCompleting` but timing window exists

## Solution: Completion Cooldown

Add a completion cooldown timestamp that prevents session sync for 2-3 seconds after completion:

1. Store `lastCompletionTime` in wizard store
2. Check cooldown in session sync effect
3. Prevent sync if within cooldown period
4. Reset cooldown when wizard explicitly opened by user

