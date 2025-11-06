# CSV Export Feature Guide

## Overview

The Lookalike Results Modal now includes a CSV export option alongside the existing ad platform exports (Meta, Google, LinkedIn). This allows you to download lead data for use in spreadsheets, CRMs, or other tools.

## Features

### 1. Basic CSV Export
Downloads selected leads as a CSV file with standard fields:
- Lead ID
- First Name / Last Name / Full Name
- Address, City, State, ZIP Code
- Property Type
- Similarity Score

### 2. Enriched Data Export (Optional)
When enabled, includes additional premium data:
- **Estimated Property Value** - Formatted as currency
- **Equity** - Calculated equity position
- **Ownership Duration** - How long they've owned the property
- **Phone Number** - Contact phone (if available)
- **Email** - Contact email (if available)

### 3. Metadata Header
Each CSV includes a metadata header with:
- Export title
- Source seed list name
- Generation timestamp
- Total candidates exported
- Average similarity score

## User Interface

### Export Section Layout
```
Export Options
├── Ad Platforms
│   ├── □ Meta
│   ├── □ Google  
│   └── □ LinkedIn
└── File Export
    ├── □ Export to CSV
    └── □ Include enriched data (conditional)
```

### CSV Export Checkbox
- **Icon**: Green file/document icon
- **Label**: "Export to CSV"
- **Style**: Highlighted with muted background

### Enriched Data Option
- Only appears when CSV export is checked
- Indented under CSV option
- Default: Enabled (checked)
- Label explains what enriched data includes

## Usage Flow

1. **Select Leads**: Check leads to export from the results table
2. **Choose Export Options**:
   - Select ad platforms (optional)
   - Check "Export to CSV" (optional)
   - Toggle "Include enriched data" (if CSV selected)
3. **Click Export Button**: Handles all selected export options

### Export Button Behavior
- Disabled if no leads selected
- Disabled if no export options selected
- Shows loading state during export
- Success toast for each export type

## File Naming Convention

CSV files are automatically named using the pattern:
```
lookalike-{seed-list-name}-{timestamp}.csv
```

Example: `lookalike-top-investors-1699564800000.csv`

## CSV Format Example

### With Metadata & Enriched Data
```csv
"Lookalike Audience Export"
"Seed List: Top Investors"
"Generated: 2024-11-06T12:00:00.000Z"
"Total Candidates: 50"
"Average Similarity Score: 82.3%"

Lead ID,First Name,Last Name,Full Name,Address,City,State,ZIP Code,Property Type,Similarity Score,Estimated Value,Equity,Ownership Duration,Phone Number,Email
lead_123,John,Smith,John Smith,123 Main St,Denver,CO,80202,single-family,85.5%,$350000,$120000,5 years,+15551234567,john.smith@example.com
lead_124,Sarah,Johnson,Sarah Johnson,456 Oak Ave,Phoenix,AZ,85001,multi-family,82.1%,$425000,$180000,3 years,+15559876543,sarah.johnson@example.com
```

### Basic Export (No Enriched Data)
```csv
"Lookalike Audience Export"
"Seed List: Top Investors"
"Generated: 2024-11-06T12:00:00.000Z"
"Total Candidates: 50"
"Average Similarity Score: 82.3%"

Lead ID,First Name,Last Name,Full Name,Address,City,State,ZIP Code,Property Type,Similarity Score
lead_123,John,Smith,John Smith,123 Main St,Denver,CO,80202,single-family,85.5%
lead_124,Sarah,Johnson,Sarah Johnson,456 Oak Ave,Phoenix,AZ,85001,multi-family,82.1%
```

## Technical Implementation

### File Structure
```
lookalike/
├── LookalikeResultsModal.tsx (main component)
└── utils/
    └── exportToCsv.ts (export utilities)
```

### Key Functions

#### `exportCandidatesToCsv()`
Simple CSV export with basic options:
```typescript
exportCandidatesToCsv(candidates, {
  includeEnrichedData: true,
  filename: "my-leads.csv"
});
```

#### `exportWithMetadata()`
Enhanced export with metadata header:
```typescript
exportWithMetadata(
  candidates,
  {
    seedListName: "Top Investors",
    generatedAt: new Date().toISOString(),
    totalCandidates: 50,
    avgScore: 82.3
  },
  {
    includeEnrichedData: true,
    filename: "lookalike-export.csv"
  }
);
```

### CSV Utilities

#### Value Escaping
- Automatically escapes commas and quotes in data
- Handles `null` and `undefined` values
- Properly formats currency values

#### Browser Download
- Creates Blob with correct MIME type
- Triggers automatic download
- Cleans up object URLs after download
- Works in all modern browsers

## Use Cases

### 1. CRM Import
Export leads with enriched data to import into Salesforce, HubSpot, etc.

### 2. Spreadsheet Analysis
Download for analysis in Excel, Google Sheets, or other tools

### 3. Email Marketing
Export email addresses for use in email marketing platforms

### 4. Combined Export
Export to both CSV **and** ad platforms in a single action

### 5. Selective Export
Export only high-scoring leads by selecting specific candidates

## Benefits

### For Users
- ✅ **Flexibility**: Use leads in any tool that accepts CSV
- ✅ **Data Ownership**: Keep a local copy of your leads
- ✅ **Analysis**: Analyze in spreadsheets or BI tools
- ✅ **Backup**: Archive lead data for compliance

### For Developers
- ✅ **No Backend Required**: Pure client-side export
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Reusable**: Utility functions can be used elsewhere
- ✅ **Maintainable**: Separate concerns with utility module

## Future Enhancements

Potential additions:
- [ ] Multiple format support (Excel, JSON, XML)
- [ ] Custom field selection
- [ ] Export templates
- [ ] Scheduled exports
- [ ] Bulk export from saved audiences

## Accessibility

- ✅ Keyboard navigable (checkbox and button controls)
- ✅ Screen reader friendly labels
- ✅ Clear visual feedback for selections
- ✅ Logical tab order

## Browser Compatibility

Tested and working in:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Error Handling

The export handles:
- Empty selection (shows error toast)
- No export options selected (shows error toast)
- File write errors (shows error toast, logs to console)
- Invalid data formats (sanitizes automatically)

## Testing

To test CSV export:
1. Generate a lookalike audience
2. Select some leads in the results table
3. Check "Export to CSV"
4. Optionally toggle enriched data
5. Click "Export X leads"
6. File should download automatically
7. Open in spreadsheet software to verify format

## Support

For issues or questions about CSV export:
- Check browser console for error messages
- Verify leads are selected
- Ensure popups/downloads are not blocked
- Try with a smaller dataset first

