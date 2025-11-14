# Bug Fix: Lookalike Audience Generating 0 Results

## Problem
When generating a lookalike audience, the results modal was showing "No Candidates Generated" (0 leads) even though the mock data generation function should have been returning candidates.

## Root Cause
The `createAudience` function in the lookalike store was being called with **incorrect parameters** in `app/dashboard/page.tsx`.

### Expected Function Signature
```typescript
createAudience: (config: LookalikeConfig, candidates: LookalikeCandidate[]) => LookalikeAudience;
```

### What Was Being Called (WRONG ❌)
```typescript
const audience = lookalikeStore.createAudience(
    seedLeadListData.listId,       // ❌ Not a parameter
    seedLeadListData.listName,     // ❌ Not a parameter  
    config,                        // ❌ Wrong position
    candidates.length              // ❌ Passing number instead of array!
);

// Then separately setting candidates:
lookalikeStore.currentCandidates = candidates;
```

This caused:
1. The store to receive incorrect parameters
2. The `createAudience` function to not set `currentCandidates` properly
3. The results modal to display an empty array

## Solution
Fixed the function call to match the correct signature:

```typescript
const audience = lookalikeStore.createAudience(config, candidates);
```

The `createAudience` function already:
- Creates the audience object internally
- Sets `currentCandidates` in the store
- Returns the created audience

## Files Changed
- `app/dashboard/page.tsx` (lines 356-359)

## Testing
After this fix:
1. Generate a lookalike audience from the dashboard
2. The results modal should now show mock candidates (default: 100 leads)
3. The average score badge should show a proper percentage
4. Candidates should be selectable and exportable

## Mock Data Details
The mock generation function (`lib/api/lookalike/generate.ts`) generates:
- Random names from predefined lists
- Property addresses in various US cities
- Similarity scores based on the threshold setting
- Contact information (phone/email) based on requirements
- Property values and equity information

### Default Generation
- Target size: 100 leads (or user-specified amount)
- Similarity threshold: 75% (or user-specified)
- Filters are applied (property type, geo, contact requirements, etc.)

### If Still Seeing 0 Results
Check the browser console for:
```
[API] Generated X candidates from Y attempts
[Lookalike] Generated candidates: X
[Lookalike] Created audience: {...}
```

If candidates is still 0, the filters might be too restrictive. Try:
1. Lower the similarity threshold (60-70%)
2. Remove property type filters
3. Remove state restrictions
4. Uncheck "Require Valid Email" if enabled

## Prevention
Added console logging to make debugging easier:
```typescript
console.log("[Lookalike] Generated candidates:", candidates.length);
console.log("[Lookalike] Created audience:", audience);
```

This will help identify data flow issues in the future.

