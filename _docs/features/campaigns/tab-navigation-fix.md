# Campaign Tab Navigation Fix

## Issue
Campaign tabs (Calls, Text, Social, Direct Mail) were not switching properly. The URL would update but the UI would automatically switch back to "Calls".

## Root Cause
**Race condition** between local state and URL parameters:

1. User clicks "Text" tab
2. `setTab("text")` updates local state ✅
3. `pushParams()` calls `router.push()` to update URL ⏳
4. `useEffect` runs before searchParams updates
5. Sees `currentTypeParam` is `null` (stale URL)
6. Calls `setTab("calls")` to "sync" with URL ❌
7. Tab switches back to "Calls"

## Solution

### Key Changes

1. **Read from `useSearchParams()` hook, not props**
   ```typescript
   // Always use the hook for latest URL state
   const currentTypeParam = searchParams?.get("type") ?? urlParams?.type ?? null;
   ```

2. **Conditional URL-to-State sync**
   ```typescript
   // OLD: Always sync when param changes
   if (newTab !== tab) setTab(newTab);
   
   // NEW: Only sync when URL has a param AND it differs
   if (currentTypeParam && currentTypeParam !== tabToType[tab]) {
     setTab(newTab);
   }
   ```

3. **Pass URL params from page component**
   ```typescript
   <CampaignPage
     urlParams={{
       type: typeParam,
       campaignId: campaignIdParam,
     }}
   />
   ```

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| Initial load without params | Defaults to "calls" tab |
| Initial load with `?type=text` | Opens "text" tab |
| Click tab button | Updates state → URL (no reset) |
| Direct URL navigation | Syncs to correct tab |
| Browser back/forward | Respects URL history |
| Race condition during router.push | Ignores stale null values |

## Component Flow

```
app/dashboard/campaigns/page.tsx
  ↓ reads searchParams
  ↓ passes to
components/campaigns/campaignPage.tsx
  ↓ passes to
components/campaigns/utils/campaignTable.tsx
  ↓ reads searchParams (source of truth)
  ↓ renders correct table component
```

## Files Modified

1. `app/dashboard/campaigns/page.tsx` - Pass urlParams to CampaignPage
2. `components/campaigns/campaignPage.tsx` - Forward urlParams to table
3. `components/campaigns/utils/campaignTable.tsx` - Fix sync logic
4. `components/campaigns/utils/statCard.tsx` - Fix hydration with mounted state

## Related Fixes

- **Hydration error in StatCard**: Added `mounted` state and `suppressHydrationWarning` to prevent server/client mismatch on dynamic campaign counts
- **Grid layout**: Changed to `xl:grid-cols-5` to fit 5 cards per row without cutoff
- **Help button**: Added consistent help icon that opens draggable modal
- **Removed redundant headers**: Removed duplicate titles from individual table components

## Testing Checklist

- [ ] Navigate to `/dashboard/campaigns` - shows "Calls" tab
- [ ] Click "Text" tab - switches to Text campaigns
- [ ] Click "Calls" tab - switches back to Calls campaigns
- [ ] Navigate directly to `/dashboard/campaigns?type=text` - opens Text tab
- [ ] Use browser back/forward - tab follows URL
- [ ] Refresh page with `?type=text` - stays on Text tab
- [ ] No hydration errors in console
- [ ] All 6 stat cards visible without horizontal scroll












