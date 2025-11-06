# Bug Fix: Label Text Wrapping in Look-Alike Config Modal

## Issue
In the Look-Alike Audience Configuration Modal, multi-word labels were wrapping to multiple lines on smaller screens, causing poor UX:
- "Corporate Ownership" → Breaking into "Corporate" / "Ownership"
- "Absentee Owner" → Potentially breaking into "Absentee" / "Owner"

## Root Cause
Labels in the GeneralOptions component lacked `whitespace-nowrap` class, allowing text to wrap when container width was constrained on mobile or in narrow modal sections.

## Solution
Added `whitespace-nowrap` className to Label components to prevent text wrapping.

### File Modified
`components/reusables/modals/user/lookalike/components/GeneralOptions.tsx`

### Changes

#### Corporate Ownership Label
```tsx
// Before
<Label htmlFor="corporate">Corporate Ownership</Label>

// After
<Label htmlFor="corporate" className="whitespace-nowrap">
  Corporate Ownership
</Label>
```

#### Absentee Owner Label
```tsx
// Before
<Label htmlFor="absentee">Absentee Owner</Label>

// After
<Label htmlFor="absentee" className="whitespace-nowrap">
  Absentee Owner
</Label>
```

## Testing
- [x] Labels stay on single line at 320px width
- [x] Labels stay on single line in narrow modal sections
- [x] Labels properly aligned with select dropdowns
- [x] No horizontal overflow caused by longer labels

## Related
- Follows the same pattern as button text wrapping fix (`_docs/BUGFIX_BUTTON_TEXT_WRAPPING_MOBILE.md`)
- Part of comprehensive mobile UX improvements

## Date
November 6, 2025

## Author
AI Assistant (Claude Sonnet 4.5)

## Status
✅ **FIXED** - Labels now stay on single line across all screen sizes

