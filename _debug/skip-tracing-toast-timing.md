# Skip Tracing Toast Not Showing After setTimeout — Debug Log

**Date:** 2025-01-XX  
**Issue:** Skip tracing toast not showing after setTimeout delay (0ms or 1600ms)  
**Location:** `components/reusables/modals/user/lead/LeadModalMain.tsx` — `handleLaunchSuite()`

## Problem Description

The success/error toast for skip trace suite launch is not appearing after the setTimeout delay completes. The toast should dismiss the loading toast and show a success/error message, but it's not visible.

## Suspected Root Causes

1. **Component Unmounting:** `onClose()` is called before setTimeout callback executes, potentially unmounting the component
2. **Toast ID Mismatch:** The `launchToastId` const might be invalid when setTimeout callback runs
3. **Toast Dismissal Race Condition:** Dismissing the loading toast might interfere with showing the new toast
4. **Modal Closure:** Closing the modal might clear the toast container before the new toast can render

## Debug Logging Added

Added comprehensive debug logging to track:

- Toast ID values at each stage (initial creation, before setTimeout, during callback)
- Ref state (`launchToastIdRef.current`) at critical points
- setTimeout scheduling and callback execution
- Toast dismiss/show operations and their returned IDs
- Timing of `onClose()` calls relative to toast operations

## Key Code Locations

### Success Path (with launchPayload):
```typescript
// Line ~508-528
onClose(); // Called BEFORE setTimeout
setTimeout(() => {
  toast.dismiss(launchToastId);
  toast.success(...); // May not show if component unmounted
}, 0);
```

### Alternative Success Path:
```typescript
// Line ~531-541
setTimeout(() => {
  toast.dismiss(launchToastId);
  toast.success(...);
  setStep(3);
}, 1600);
```

### Error Path:
```typescript
// Line ~546-549
setTimeout(() => {
  toast.dismiss(launchToastId);
  toast.error(...);
}, 0);
```

## Investigation Steps

1. **Check Console Logs:** Look for `🔍 [DEBUG]` messages in browser console
2. **Verify Toast IDs:** Confirm `launchToastId` is valid when setTimeout callback executes
3. **Check Component Lifecycle:** Verify if component unmounts before setTimeout callback
4. **Toast Container:** Check if toast container is still mounted when new toast is shown

## Potential Fixes (To Implement After Debugging)

1. **Move `onClose()` after toast:** Don't close modal until toast is shown
2. **Increase setTimeout delay:** Give more time for state updates (not ideal)
3. **Use toast.promise():** Handle success/error states more reliably
4. **Track component mount state:** Only show toast if component is still mounted

## Next Steps

- Run the flow and check browser console for debug logs
- Identify which setTimeout path is taken (0ms vs 1600ms)
- Verify if toast IDs are valid when callbacks execute
- Check if component unmounting is causing the issue

