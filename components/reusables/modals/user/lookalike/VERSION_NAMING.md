# Lookalike Audience Version Naming System

## Overview

The lookalike audience system uses an automatic version naming convention to make it easy to iterate on different variations of lookalike audiences from the same seed list.

## Naming Format

```
Lookalike - {SeedListName} - v0.{VersionNumber}
```

### Components
- **Prefix**: "Lookalike - " (identifies this as a lookalike audience)
- **Seed List Name**: Original list name the lookalike was generated from
- **Version**: "v0.{XX}" format (XX is zero-padded to 2 digits minimum)

## Examples

### Basic Versioning
```
Seed List: "Top Investors"

Generated Names:
1st generation: Lookalike - Top Investors - v0.01
2nd generation: Lookalike - Top Investors - v0.02
3rd generation: Lookalike - Top Investors - v0.03
...
10th generation: Lookalike - Top Investors - v0.10
...
99th generation: Lookalike - Top Investors - v0.99
100th generation: Lookalike - Top Investors - v0.100
```

### Different Seed Lists
```
Seed List: "High Value Leads"
Generated: Lookalike - High Value Leads - v0.01

Seed List: "Denver Real Estate Investors"  
Generated: Lookalike - Denver Real Estate Investors - v0.01

Seed List: "Q4 2024 Hot Prospects"
Generated: Lookalike - Q4 2024 Hot Prospects - v0.01
```

## Why This Format?

### 1. Clear Lineage
Immediately see which seed list a lookalike audience came from:
```
Lookalike - Top Investors - v0.03
           ↑               ↑
      Seed List      This is the 3rd iteration
```

### 2. Easy Iteration
Test different configurations from the same seed list:
```
v0.01 - High similarity threshold (90%)
v0.02 - Medium similarity threshold (75%)
v0.03 - Low similarity threshold (65%)
v0.04 - High threshold + Geographic filters
```

### 3. Version Tracking
Keep track of different experiments:
```
Top Investors:
- v0.01 (100 leads, 80% threshold) → 15% conversion
- v0.02 (200 leads, 75% threshold) → 22% conversion ✅ Winner
- v0.03 (150 leads, 85% threshold) → 18% conversion
```

### 4. Organized Lists
Lists automatically sort chronologically:
```
Lookalike - Top Investors - v0.01
Lookalike - Top Investors - v0.02
Lookalike - Top Investors - v0.03
Lookalike - High Value - v0.01
Lookalike - High Value - v0.02
```

## Automatic Version Detection

The system automatically detects existing versions and increments:

```typescript
// If you have these existing lists:
- "Lookalike - Top Investors - v0.01"
- "Lookalike - Top Investors - v0.02"
- "Lookalike - Other List - v0.01"

// Next generation from "Top Investors" will be:
- "Lookalike - Top Investors - v0.03" ✅
```

## User Interface

### List Name Input
```
┌────────────────────────────────────────┐
│ Save as Lead List     Version: 3      │
│ ┌──────────────────────────────────┐  │
│ │ Lookalike - Top Investors - v0.03│  │
│ └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

### Features
- **Auto-populated**: Name is pre-filled with correct version
- **Editable**: User can modify if needed
- **Version indicator**: Shows current version number
- **Placeholder**: Hints at the format

## Implementation

### Generating Names
```typescript
import { generateLookalikeListName } from "@/components/reusables/modals/user/lookalike";

// Generate name for first version
const name = generateLookalikeListName("Top Investors", 1);
// Returns: "Lookalike - Top Investors - v0.01"

// Generate name for specific version
const name2 = generateLookalikeListName("Top Investors", 5);
// Returns: "Lookalike - Top Investors - v0.05"
```

### Finding Next Version
```typescript
import { getNextVersion } from "@/components/reusables/modals/user/lookalike";

const existingLists = [
  "Lookalike - Top Investors - v0.01",
  "Lookalike - Top Investors - v0.02",
  "Some Other List"
];

const nextVersion = getNextVersion("Top Investors", existingLists);
// Returns: 3
```

### Extracting Information
```typescript
import {
  getSeedListName,
  extractVersionFromName
} from "@/components/reusables/modals/user/lookalike";

const listName = "Lookalike - Top Investors - v0.05";

const seedList = getSeedListName(listName);
// Returns: "Top Investors"

const version = extractVersionFromName(listName);
// Returns: 5
```

### Validating Names
```typescript
import { isValidLookalikeListName } from "@/components/reusables/modals/user/lookalike";

isValidLookalikeListName("Lookalike - Top Investors - v0.01");
// Returns: true

isValidLookalikeListName("My Custom List");
// Returns: false

isValidLookalikeListName("Lookalike - Test - v1.0");
// Returns: false (wrong version format)
```

### Incrementing Versions
```typescript
import { incrementVersion } from "@/components/reusables/modals/user/lookalike";

const current = "Lookalike - Top Investors - v0.05";
const next = incrementVersion(current);
// Returns: "Lookalike - Top Investors - v0.06"
```

## Version Format Rules

### Valid Formats
✅ `Lookalike - List Name - v0.01`  
✅ `Lookalike - List Name - v0.10`  
✅ `Lookalike - List Name - v0.99`  
✅ `Lookalike - List Name - v0.100` (3+ digits allowed)

### Invalid Formats
❌ `Lookalike - List Name - v1.0` (wrong major version)  
❌ `Lookalike - List Name - v0.1` (not zero-padded)  
❌ `List Name - v0.01` (missing prefix)  
❌ `Lookalike - v0.01` (missing list name)

## Best Practices

### 1. Use Descriptive Seed List Names
```
Good:
- "Q1 2024 High-Intent Buyers"
- "SF Bay Area Investors"
- "Million Dollar Portfolio Owners"

Avoid:
- "List 1"
- "Test"
- "Leads"
```

### 2. Document Your Experiments
Keep notes on what changed between versions:
```
v0.01: Baseline (75% threshold, 100 leads)
v0.02: Increased threshold to 85%
v0.03: Added CA/TX/FL geographic filter
v0.04: Required email + phone contact
v0.05: Cash buyers only
```

### 3. Compare Performance
Track metrics for each version:
```
Version | Leads | Contact Rate | Conversion | ROI
v0.01   | 100   | 45%          | 8%         | 2.1x
v0.02   | 150   | 52%          | 12%        | 3.4x ✅
v0.03   | 80    | 48%          | 9%         | 2.5x
```

### 4. Keep Successful Versions
Don't delete old versions that performed well:
- Reference for future campaigns
- Benchmark for new experiments
- Backup if new versions underperform

## Dashboard Integration

### List View
```
📋 Lead Lists
├── 📁 Seed Lists
│   ├── Top Investors (250 leads)
│   └── High Value Leads (180 leads)
│
└── 📁 Lookalike Audiences
    ├── Lookalike - Top Investors - v0.01 (100 leads)
    ├── Lookalike - Top Investors - v0.02 (150 leads)
    ├── Lookalike - Top Investors - v0.03 (120 leads)
    ├── Lookalike - High Value Leads - v0.01 (200 leads)
    └── Lookalike - High Value Leads - v0.02 (175 leads)
```

### Filtering & Sorting
- **Filter by seed list**: Show all versions from one seed
- **Sort by version**: Chronological order
- **Sort by date created**: Newest first
- **Sort by performance**: Best converting first

## API Response Example

```typescript
interface SavedLookalikeList {
  id: string;
  name: string; // "Lookalike - Top Investors - v0.03"
  seedListId: string;
  seedListName: string; // "Top Investors"
  version: number; // 3
  leadCount: number;
  createdAt: string;
  config: LookalikeConfig;
}
```

## Migration Guide

### For Existing Lists
If you have existing lookalike lists without version numbers:

```typescript
// Old format
"Lookalike - Top Investors"

// Migration
"Lookalike - Top Investors - v0.01"

// Code to migrate
function migrateLegacyListName(oldName: string): string {
  if (oldName.startsWith("Lookalike - ") && !oldName.includes(" - v0.")) {
    const seedList = oldName.replace("Lookalike - ", "");
    return `Lookalike - ${seedList} - v0.01`;
  }
  return oldName;
}
```

## Utility Functions Reference

| Function | Purpose | Returns |
|----------|---------|---------|
| `generateLookalikeListName()` | Create versioned name | string |
| `extractVersionFromName()` | Get version number | number \| null |
| `getNextVersion()` | Find next available version | number |
| `isValidLookalikeListName()` | Validate format | boolean |
| `getSeedListName()` | Extract seed list name | string \| null |
| `incrementVersion()` | Bump version by 1 | string \| null |
| `formatVersionNumber()` | Format version display | string |

## Testing

### Unit Tests
```typescript
describe('Version Naming', () => {
  it('generates correct format', () => {
    expect(generateLookalikeListName("Test", 1))
      .toBe("Lookalike - Test - v0.01");
  });
  
  it('pads version numbers', () => {
    expect(generateLookalikeListName("Test", 5))
      .toBe("Lookalike - Test - v0.05");
  });
  
  it('handles large version numbers', () => {
    expect(generateLookalikeListName("Test", 123))
      .toBe("Lookalike - Test - v0.123");
  });
  
  it('extracts version correctly', () => {
    expect(extractVersionFromName("Lookalike - Test - v0.03"))
      .toBe(3);
  });
});
```

## Support

### Common Questions

**Q: Can I change the list name after creation?**  
A: Yes, but keep the version format for consistency.

**Q: What happens after v0.99?**  
A: It continues as v0.100, v0.101, etc. No limit.

**Q: Can I skip versions?**  
A: Yes, the system just suggests the next number. You can manually edit.

**Q: Do I have to use this format?**  
A: No, but it's highly recommended for organization and tracking.

---

**Version**: 1.0  
**Last Updated**: November 6, 2024  
**Status**: ✅ Active

