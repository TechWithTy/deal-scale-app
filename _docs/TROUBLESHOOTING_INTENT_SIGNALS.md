# Troubleshooting Intent Signals

## Issue: Intent Signals Tab Not Showing

If you don't see the "Intent Signals" tab in the lead detail modal, follow these steps:

### Step 1: Restart Dev Server Completely

```bash
# Stop the server completely (Ctrl+C or Cmd+C)
# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
# or
yarn dev
```

### Step 2: Check Browser Console for Debug Logs

Open your browser console (F12 or Right-click → Inspect → Console) and look for:

**When page loads:**
```
Sample enriched lead: {
  name: "...",
  hasSignals: true,    ← Should be true
  signalCount: 15,     ← Should be > 0
  hasScore: true,      ← Should be true
  score: 42            ← Should be > 0
}
```

**When you click on a lead:**
```
🔍 Modal Debug: {
  hasLeadData: true,
  hasIntentSignals: true,     ← Should be true
  signalCount: 15,            ← Should be > 0
  hasIntentScore: true,       ← Should be true
  scoreTotal: 42,             ← Should be > 0
  showIntentSignalsTab: true  ← Should be true
}
```

### Step 3: Verify Mock Data Generation

Check that `constants/data.ts` has:
```typescript
import { enrichLeadWithIntentSignals } from "@/lib/helpers/enrichLeadsWithIntentSignals";
```

And in the `generateMockLeads` function:
```typescript
const enrichedLead = enrichLeadWithIntentSignals(lead, intentProfile);
leads.push(enrichedLead);
```

### Step 4: Check Which Data Source is Being Used

The modal title shows which lead list is being used:
- "Austin Leads" → might be using external/kanban data
- Check which component is rendering the modal
- Verify it's using `mockGeneratedLeads` from `constants/data.ts`

### Step 5: Hard Refresh Browser

After restarting the server:
1. Clear browser cache (Ctrl+Shift+Del or Cmd+Shift+Del)
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Or open in incognito/private window

### Step 6: Verify the Modal Carousel Component

The modal should show 3 tabs if intent data exists:
- Lead Details
- Activity
- Intent Signals ← This one should appear

Check the modal component at:
`external/shadcn-table/src/components/data-table/data-table-row-modal-carousel.tsx`

### Step 7: Check for TypeScript/Build Errors

```bash
# Check for TypeScript errors
npm run type-check
# or
tsc --noEmit

# Check for linting errors
npm run lint
```

## Common Issues & Solutions

### Issue: Console shows `signalCount: 0`

**Cause:** The lead data isn't being enriched

**Solution:**
1. Check that `enrichLeadWithIntentSignals` is imported in `constants/data.ts`
2. Verify the function is being called in the loop
3. Restart the dev server to regenerate mock data

### Issue: Console shows `hasIntentScore: false`

**Cause:** Intent score isn't being calculated

**Solution:**
1. Check that `lib/scoring/intentScoring.ts` has `DEFAULT_SCORING_WEIGHTS` imported correctly
2. Verify `calculateIntentScore` is being called in `enrichLeadWithIntentSignals`
3. Check browser console for any errors in the scoring calculation

### Issue: Console shows `showIntentSignalsTab: false` even with signals

**Cause:** Modal logic requires BOTH signals AND score

**Solution:**
The modal checks:
```typescript
const showIntentSignalsTab = hasIntentSignals && leadData?.intentScore;
```

Both conditions must be true. Check the console log to see which is false.

### Issue: Different lead data in modal vs table

**Cause:** Modal and table might be using different data sources

**Solution:**
1. Find which component renders your lead table
2. Verify it uses `mockGeneratedLeads` or enriched data
3. Check if there's a separate data store (Zustand, Context) that needs updating

### Issue: Changes not reflected after code update

**Cause:** Next.js/React caching

**Solution:**
```bash
# Nuclear option - clear everything and restart
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

## Debug Commands

### Log all leads to console

Add this to your page component:

```typescript
import { mockGeneratedLeads } from "@/constants/data";

useEffect(() => {
  console.log("Total leads:", mockGeneratedLeads.length);
  console.log("Leads with intent signals:", 
    mockGeneratedLeads.filter(l => l.intentSignals?.length > 0).length
  );
  console.log("Sample lead:", mockGeneratedLeads[0]);
}, []);
```

### Verify specific lead

In the modal, add:

```typescript
import { debugLeadIntentData } from "@/lib/utils/debugIntentSignals";

// When opening modal
debugLeadIntentData(leadData, "Current Lead");
```

## Expected Behavior

### When Working Correctly:

1. **Lead Table:**
   - Intent column shows scores and badges
   - Clicking sorts by intent score

2. **Lead Modal:**
   - Shows 3 tabs: Details, Activity, Intent Signals
   - Intent Signals tab displays:
     - Intent Score Widget at top (score 0-100)
     - Filter tabs: All, Engagement, Behavioral, External
     - Timeline of signal cards

3. **Console Logs:**
   - "Sample enriched lead" with signals
   - "🔍 Modal Debug" with `showIntentSignalsTab: true`

### Sample Console Output (Correct):

```
Sample enriched lead: {
  name: "Tom",
  hasSignals: true,
  signalCount: 18,
  hasScore: true,
  score: 45
}

🔍 Modal Debug: {
  hasLeadData: true,
  hasIntentSignals: true,
  signalCount: 18,
  hasIntentScore: true,
  scoreTotal: 45,
  showIntentSignalsTab: true  ← KEY: This should be true!
}
```

## Still Not Working?

If you've tried all the above:

1. **Check the exact page you're viewing:**
   - What's the URL?
   - Which component renders the lead table?
   - Is it using mock data or API data?

2. **Verify imports are resolving:**
   ```typescript
   // In constants/data.ts
   console.log("enrichLeadWithIntentSignals:", enrichLeadWithIntentSignals);
   // Should log the function, not undefined
   ```

3. **Test with a minimal example:**
   Create a simple test page:
   ```typescript
   import { mockGeneratedLeads } from "@/constants/data";
   
   export default function TestPage() {
     const lead = mockGeneratedLeads[0];
     return (
       <div>
         <pre>{JSON.stringify({
           name: lead.contactInfo.firstName,
           hasSignals: !!lead.intentSignals,
           signalCount: lead.intentSignals?.length,
           hasScore: !!lead.intentScore,
           score: lead.intentScore?.total,
         }, null, 2)}</pre>
       </div>
     );
   }
   ```

4. **Share console output:**
   Copy the "Sample enriched lead" and "🔍 Modal Debug" logs
   This will show exactly what data the modal is receiving

## Quick Fix Checklist

- [ ] Restarted dev server completely
- [ ] Cleared .next cache folder
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Checked console for debug logs
- [ ] Verified `showIntentSignalsTab: true` in console
- [ ] Confirmed lead has `intentSignals` array with items
- [ ] Confirmed lead has `intentScore` object
- [ ] No TypeScript/build errors
- [ ] Using correct data source (mockGeneratedLeads)

---

If all else fails, the issue is likely that the lead data source isn't using the enriched mock data. Track down which data the modal is actually receiving and ensure it's flowing through the enrichment function.

