# Quickstart Test Suite Debug Log

**Date:** 2025-01-XX  
**Test Suite:** `_tests/app/dashboard/quickstart`  
**Status:** 7 test files failed, 24 tests failed, 6 unhandled errors

---

## Summary

The quickstart test suite is experiencing multiple categories of failures:

1. **Unhandled Errors (6 total)** - Timer/interval cleanup issues causing `window is not defined` and React scheduler errors
2. **Test Assertion Failures** - Tests expecting old behavior that has changed in the app
3. **Missing Elements** - Tests looking for UI elements that may have been renamed or restructured

---

## Unhandled Errors

### Error 1: `ReferenceError: window is not defined` in React DOM

**Location:** Multiple test files, occurring after test environment teardown  
**Stack Trace:**
```
ReferenceError: window is not defined
 ❯ getActiveElementDeep node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/cjs/react-dom.development.js:8442:13
 ❯ getSelectionInformation node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/cjs/react-dom.development.js:8476:21
 ❯ prepareForCommit node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/cjs/react-dom.development.js:10912:26
```

**Affected Test Files:**
- `_tests/app/dashboard/quickstart/campaign-modal-close.test.tsx` (lines 913-916)
- `_tests/app/dashboard/quickstart/webhook-card.test.tsx` (lines 962-965)

**Root Cause:** React DOM is trying to access `window` after the test environment has been torn down. This happens when timers/intervals are still running after component unmount.

**Fix Required:** Ensure all timers are cleared in component cleanup. See `components/quickstart/DynamicHeadline.tsx` below.

---

### Error 2: `ReferenceError: window is not defined` in DynamicHeadline

**Location:** `components/quickstart/DynamicHeadline.tsx:298:12`

**Code:**
```typescript
// Line 283-334
useEffect(() => {
    const intervals: Array<ReturnType<typeof setInterval>> = [];
    
    if (problems.length > 1) {
        intervals.push(
            setInterval(
                () => setProblemIndex((current) => (current + 1) % problems.length),
                PROBLEM_INTERVAL_MS,
            ),
        );
    }
    
    // ... more intervals for solutions, fears, hopes
    
    return () => {
        intervals.forEach((timer) => clearInterval(timer));
    };
}, [problems.length, solutions.length, fears.length, hopes.length, ...]);
```

**Problem:** The `setInterval` callbacks (e.g., line 298) execute `setSolutionIndex()` which triggers React state updates. When the test environment is torn down, `window` is undefined, causing the error.

**Fix Required:**
1. Guard the `useEffect` with `if (typeof window === "undefined") return;`
2. Guard each interval callback to check `window` before calling setState

**Similar Pattern:** See `components/ui/background-beams-with-collision.tsx` for reference (already fixed).

---

### Error 3: `Error: Should not already be working`

**Location:** React scheduler, occurring after test teardown  
**Stack Trace:**
```
Error: Should not already be working.
 ❯ performSyncWorkOnRoot node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/cjs/react-dom.development.js:26112:11
 ❯ flushSyncCallbacks node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/cjs/react-dom.development.js:12042:22
```

**Affected Test Files:**
- `_tests/app/dashboard/quickstart/campaign-modal-close.test.tsx` (lines 919-930, 933-944)
- `_tests/app/dashboard/quickstart/webhook-card.test.tsx` (lines 968-979)

**Root Cause:** React is trying to schedule work after the test environment has been torn down. This is a symptom of timers/intervals not being properly cleaned up.

**Fix Required:** Same as Error 1 & 2 - ensure all timers are cleared and guarded against SSR/test environments.

---

## Test Assertion Failures

### Failure 1: "Launch Guided Setup" buttons not found

**Test File:** `_tests/app/dashboard/quickstart/quickstart-wizard-actions.test.tsx`

**Location:** Line 170-172
```typescript
const [launchGuidedButton] = screen.getAllByRole("button", {
    name: /launch guided setup/i,
});
```

**Error:** `TestingLibraryElementError: Unable to find an accessible element with the role "button" and name /launch guided setup/i`

**Possible Causes:**
1. Button text has changed (e.g., "Start Guided Setup", "Begin Setup")
2. Button is now rendered as a badge or different element type
3. Button is conditionally rendered and not visible in test state

**Action Required:**
1. Inspect `components/quickstart/QuickStartActionsGrid.tsx` or similar component
2. Check what the actual button text/label is now
3. Update test selector or add `aria-label` to button if needed
4. **Clarification needed:** Has the UX changed? Should tests follow new text?

---

### Failure 2: Wizard summary shows "Text" instead of "Email"

**Test File:** `_tests/app/dashboard/quickstart/quickstart-wizard-summary.test.tsx`

**Location:** Line 56-66
```typescript
expect(bulletText).toEqual(
    expect.arrayContaining([
        expect.stringMatching(/Primary channel: Email/i),  // ❌ Fails - shows "Text"
        // ... other expectations
    ]),
);
```

**Actual Output:** `Primary channel: Text`  
**Expected:** `Primary channel: Email`

**Root Cause:** The template defaults have changed. The `automation-routing` template now defaults to "Text" channel instead of "Email".

**Action Required:**
1. **Clarification needed:** Is this an intentional change? Should the default be Text or Email?
2. If intentional: Update test expectation to match new default
3. If unintentional: Check `lib/config/quickstart/templates.ts` for `automation-routing` template

---

### Failure 3: Webhook modal opens immediately instead of deferred

**Test File:** `_tests/app/dashboard/quickstart/webhook-card.test.tsx`

**Location:** Line 73-105
```typescript
it("defers incoming webhook setup until the plan is confirmed", async () => {
    // ... setup code ...
    
    act(() => {
        fireEvent.click(incomingQuickAction);
    });
    expect(openWebhookModalMock).not.toHaveBeenCalled();  // ❌ Fails - modal opens immediately
    
    // ... wizard completion ...
    
    expect(openWebhookModalMock).toHaveBeenCalledWith("incoming");  // Should be called after wizard
});
```

**Root Cause:** The app behavior has changed. Clicking "Setup Incoming" now immediately calls `openWebhookModal('incoming')` instead of deferring until wizard completion.

**Action Required:**
1. **Clarification needed:** Is immediate opening intentional? Or should it still be deferred?
2. If intentional: Update test to expect immediate call, then verify modal opens
3. If unintentional: Check `components/quickstart/QuickStartActionsGrid.tsx` or webhook card component for the click handler

---

### Failure 4: E2E test timeout finding "Quick Start" text

**Test File:** `_tests/app/dashboard/quickstart/wizard-flow-e2e.test.tsx`

**Location:** Line 401
```typescript
const quickStartPage = screen.getByText(/quick start/i).closest("div");
```

**Error:** `TestingLibraryElementError: Unable to find an element with the text: /quick start/i`

**Root Cause:** The page heading has changed. It may now use gradient text, different casing, or a different heading structure.

**Action Required:**
1. Inspect `app/dashboard/page.tsx` or `components/quickstart/DynamicHeadline.tsx`
2. Check what the actual heading text is (may be "QuickStart", "Quick Start", or something else)
3. Add `data-testid="quickstart-page"` to the page container for reliable selection
4. Update test to use `data-testid` or correct text selector

---

## Component Fixes Required

### 1. `components/quickstart/DynamicHeadline.tsx`

**Issue:** Intervals not guarded against SSR/test environments

**Current Code (lines 283-334):**
```typescript
useEffect(() => {
    const intervals: Array<ReturnType<typeof setInterval>> = [];
    
    if (problems.length > 1) {
        intervals.push(
            setInterval(
                () => setProblemIndex((current) => (current + 1) % problems.length),
                PROBLEM_INTERVAL_MS,
            ),
        );
    }
    // ... more intervals
    
    return () => {
        intervals.forEach((timer) => clearInterval(timer));
    };
}, [dependencies]);
```

**Fix Required:**
```typescript
useEffect(() => {
    // Guard against SSR/test environments
    if (typeof window === "undefined") return;
    
    const intervals: Array<ReturnType<typeof setInterval>> = [];
    
    if (problems.length > 1) {
        intervals.push(
            setInterval(() => {
                // Guard setState calls
                if (typeof window !== "undefined") {
                    setProblemIndex((current) => (current + 1) % problems.length);
                }
            }, PROBLEM_INTERVAL_MS),
        );
    }
    // ... apply same pattern to solutions, fears, hopes intervals
    
    return () => {
        intervals.forEach((timer) => clearInterval(timer));
    };
}, [dependencies]);
```

**Reference:** See `components/ui/background-beams-with-collision.tsx` for similar fix pattern.

---

## Test File Locations Summary

| Test File | Issues | Lines to Check |
|-----------|--------|----------------|
| `campaign-modal-close.test.tsx` | Unhandled errors (window, scheduler) | 913-916, 919-930, 933-944 |
| `webhook-card.test.tsx` | Unhandled errors, assertion failure | 73-105, 962-965, 968-979 |
| `quickstart-wizard-actions.test.tsx` | Button not found | 170-172 |
| `quickstart-wizard-summary.test.tsx` | Wrong default channel | 56-66 |
| `wizard-flow-e2e.test.tsx` | Text selector timeout | 401 |
| `quickstart-wizard-actions.test.tsx` | Multiple "Launch Guided Setup" references | 170, 432-433 |

---

## Next Steps

1. **Immediate Fixes (No Clarification Needed):**
   - [ ] Fix `DynamicHeadline.tsx` to guard intervals against SSR/test
   - [ ] Verify `background-beams-with-collision.tsx` fix is complete

2. **Clarification Needed:**
   - [ ] Confirm "Launch Guided Setup" button text/location
   - [ ] Confirm wizard summary default channel (Text vs Email)
   - [ ] Confirm webhook modal behavior (immediate vs deferred)
   - [ ] Confirm page heading text/structure for E2E test

3. **After Clarification:**
   - [ ] Update test selectors/expectations based on confirmed behavior
   - [ ] Add `data-testid` attributes if needed for reliable selection
   - [ ] Re-run test suite to verify fixes

---

## Related Files

- `components/quickstart/DynamicHeadline.tsx` - Needs SSR guards
- `components/ui/background-beams-with-collision.tsx` - Reference for fix pattern
- `lib/stores/user/_tests/_steps/setup.ts` - Test setup (canvas context already fixed)
- `_tests/app/dashboard/quickstart/testUtils.tsx` - Test utilities (nuqs adapter already fixed)

---

## Notes

- All tests are using `renderWithNuqs` wrapper (already fixed)
- Canvas context is stubbed in test setup (already fixed)
- Most failures are due to app behavior changes, not test infrastructure issues
- The unhandled errors are the most critical - they cause test hangs and false positives


