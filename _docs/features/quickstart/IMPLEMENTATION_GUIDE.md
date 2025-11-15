# Holdable Goal Buttons - Implementation Guide

## For Developers

### Adding a New Goal

1. **Define the goal** in `lib/config/quickstart/wizardFlows.ts`:

```typescript
{
  id: "new-goal-id",
  personaId: "investor", // or wholesaler, agent, lender
  title: "Goal Title",
  description: "Brief description of what this achieves",
  outcome: "Expected result after completion",
  templateId: "lead-import", // Optional campaign template
  isOneClickAutomatable: false, // true = badge shown, false = no badge
  flow: [
    {
      cardId: "import", // Must match handler in headlessFlowActions.ts
      note: "Description of this step for users",
    },
    {
      cardId: "campaign",
      note: "Next step description",
    },
  ],
  finalAction: {
    type: "none", // or "route" with route: "/dashboard/campaigns"
  },
}
```

2. **Add flow step labels** in `lib/config/quickstart/flowStepLabels.ts`:

```typescript
"new-cardId": {
  executing: "Step X: Doing something...",
  completed: "Something done ✓",
}
```

3. **Implement headless handler** in `lib/automation/headlessFlowActions.ts`:

```typescript
export const headlessNewAction = async (
  goalId: QuickStartGoalId,
): Promise<string> => {
  toast.info("Starting new action...");
  
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Create mock data
  const mockId = `mock_${Date.now()}`;
  
  toast.success("New action complete!");
  
  return mockId;
};
```

4. **Map handler** in `hooks/useGoalFlowExecutor.ts`:

```typescript
const handlerMap: Record<string, () => Promise<void>> = {
  // ...existing handlers
  "new-cardId": async () => {
    await headlessNewAction(goalId as any);
  },
};
```

### Timing Configuration

**Current Timings:**
- Hold animation delay: 300ms (prevents accidental holds)
- Hold duration: 2000ms (total time to trigger automation)
- Step display: 1000ms (before execution)
- Step execution: varies (async mock data creation)
- Step completion display: 1200ms
- Between steps: 800ms
- Completion display: 2000ms
- Auto-reset: 3000ms

**To modify timings**, edit constants in `components/quickstart/HoldableGoalButton.tsx`:
```typescript
const HOLD_DURATION = 2000; // Total hold time
const HOLD_START_PROGRESS = 0; // Start at 0%
const HOLD_ANIMATION_DELAY = 300; // Delay before animation starts
```

### State Management

**Zustand Store** (`useGoalFlowExecutionStore`):
```typescript
interface GoalFlowExecutionState {
  goalId: QuickStartGoalId | null;
  status: "idle" | "holding" | "executing" | "paused" | "completed" | "error";
  currentStepIndex: number;
  currentCardId: string | null;
  progress: number; // 0-100
  holdProgress: number; // 0-100
  error: string | null;
  retryCount: number;
  executionHistory: StepExecutionRecord[];
  flowSteps: QuickStartFlowStepDefinition[];
  currentGoal: QuickStartGoalDefinition | null;
}
```

**Key Actions:**
- `startHolding(goal)` - Initialize with goal data
- `completeHold()` - Transition to executing
- `startExecution()` - Begin step execution
- `pauseFlow()` / `resumeFlow()` - Pause controls
- `handleStepError(error)` - Error handling
- `completeFlow()` - Mark success, auto-reset after 3s
- `reset()` - Return to idle state

### Analytics Events

All events tracked via `captureQuickStartEvent()`:

```typescript
// Flow lifecycle
"goal_flow_started" - { goalId, personaId, totalSteps }
"goal_flow_step_started" - { goalId, cardId, stepIndex, stepNumber }
"goal_flow_step_completed" - { goalId, cardId, stepIndex }
"goal_flow_step_failed" - { goalId, cardId, error }
"goal_flow_completed" - { goalId, totalSteps }
"goal_flow_cancelled" - { goalId, currentStep }
"goal_flow_final_action" - { goalId, actionType, route }
```

### Error Handling

**Automatic Retry Logic:**
```typescript
maxRetries: 3
retryCount: increments on each failure
```

**Error Flow:**
1. Step fails → Status becomes "error"
2. Button shows error state with message
3. Retry button appears (shows count: 1/3, 2/3, 3/3)
4. User clicks retry → Retry attempt
5. After 3 failures → Manual intervention required

**To implement custom error handling**, modify `executeStep()` in `useGoalFlowExecutor.ts`.

### Testing

**Manual Testing Checklist:**
- [ ] Single click opens first step modal
- [ ] Hold < 2s cancels properly
- [ ] Hold 2s starts automation
- [ ] Progress text updates for each step
- [ ] Toast notifications appear
- [ ] Pause/Resume works mid-execution
- [ ] Error retry works (max 3)
- [ ] Button resets after 3s on completion
- [ ] Can execute same goal multiple times
- [ ] Different goals don't interfere
- [ ] Hover doesn't trigger automation
- [ ] Background beams pause on direct hover

**Automated Tests** (to be implemented):
```typescript
// _tests/components/quickstart/holdable-goal-button.test.tsx
describe('HoldableGoalButton', () => {
  it('should open modal on single click')
  it('should start automation after 2s hold')
  it('should cancel on early release')
  it('should show progress updates')
  it('should handle errors gracefully')
  it('should reset after completion')
  it('should support pause/resume')
});
```

## Performance Considerations

### Optimization Strategies
1. **Memoization**: All handlers wrapped in `useCallback`
2. **Ref-based flags**: Prevent re-render loops (`executionInProgressRef`)
3. **Selective subscriptions**: Only subscribe to needed store fields
4. **Debounced state updates**: 50ms delay for store propagation
5. **Animation frames**: Use `requestAnimationFrame` for smooth progress

### Memory Management
- All timers cleared on unmount
- Animation frames cancelled properly
- Store auto-resets to prevent leaks
- Resource IDs cleared after flow completion

## Accessibility

### Keyboard Support (To Be Implemented)
- Space/Enter: Trigger click
- Hold Space 2s: Start automation
- Escape: Cancel hold or execution
- Tab: Navigate between goal buttons

### Screen Readers (To Be Implemented)
- Button announces current state
- Progress updates announced
- Step completion announced
- Error messages read aloud

### ARIA Attributes (To Be Implemented)
```typescript
aria-label="Hold for 2 seconds to automate {goal.title}"
aria-pressed={isCurrentGoal}
aria-busy={isExecuting}
aria-live="polite" // For progress updates
```

## Migration Notes

### From Previous Implementation
The old implementation used regular buttons that immediately triggered modals. Users had to:
1. Click button
2. Fill out modal
3. Click button again for next step
4. Fill out another modal
5. Repeat for all steps

### Current Implementation Benefits
- **Faster onboarding**: Hold 2s vs 5+ minutes of clicking
- **Demo-friendly**: Show complete flow without data entry
- **Flexible**: Still supports manual mode via single click
- **Progressive**: Can pause and resume anytime
- **Forgiving**: Errors allow retry instead of starting over

### Breaking Changes
None - single click behavior preserved. Hold functionality is additive.

## Code Examples

### Using HoldableGoalButton

```typescript
import { HoldableGoalButton } from "@/components/quickstart/HoldableGoalButton";

<HoldableGoalButton
  goal={goalDefinition}
  isCurrentGoal={selectedGoalId === goalDefinition.id}
  onNormalClick={() => {
    // Handle single click - open first step modal
    selectGoal(goalDefinition.id);
    openFirstStepModal();
  }}
  onHoldComplete={async () => {
    // Handle hold completion - run automation
    selectGoal(goalDefinition.id);
    await executeAutomatedFlow(goalDefinition);
  }}
  onRetry={retryFailedStep}
  onCancel={cancelFlow}
/>
```

### Using useGoalFlowExecutor

```typescript
import { useGoalFlowExecutor } from "@/hooks/useGoalFlowExecutor";

const { executeGoalFlow, retry, cancel } = useGoalFlowExecutor({
  onImport: handleImport,
  onCampaignCreate: handleCampaign,
  onOpenWebhookModal: handleWebhook,
  onStartNewSearch: handleSearch,
  onBrowserExtension: handleExtension,
  createRouterPush: (path) => () => router.push(path),
  leadListStore,
  campaignStore,
  personaId,
});

// Execute full flow
await executeGoalFlow(goalDefinition);

// Retry failed step
retry();

// Cancel execution
cancel();
```

### Creating Headless Actions

```typescript
// lib/automation/headlessFlowActions.ts
export const headlessCustomAction = async (
  goalId: QuickStartGoalId,
  personaId: QuickStartPersonaId,
  customStore: any,
): Promise<string> => {
  // Show start notification
  toast.info("Starting custom action...", {
    description: "Processing in background",
  });

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Create mock data
  const mockResource = {
    id: `mock_${Date.now()}`,
    name: `Demo ${personaId} Resource`,
    data: { /* ... */ },
  };

  // Add to store
  customStore.addResource(mockResource);

  // Show completion
  toast.success(`Resource created: ${mockResource.name}`, {
    description: "Ready to use",
  });

  return mockResource.id;
};
```

## Maintenance

### Regular Tasks
- [ ] Monitor analytics for automation usage vs manual
- [ ] Review error logs for common failures
- [ ] Update mock data to be more realistic
- [ ] Test with actual API calls in staging
- [ ] Gather user feedback on hold duration

### When to Update
- New goal types added
- New step cardIds introduced
- Flow complexity changes
- User feedback suggests UX improvements
- API integration becomes available











