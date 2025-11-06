# Lookalike Audience Configuration Module

## Overview

This module provides a comprehensive modal interface for configuring and generating lookalike audiences based on seed lists. The module has been refactored to comply with the project's 250-line file limit, resulting in a modular, maintainable architecture.

## Architecture

### Main Component
- **LookalikeConfigModal.tsx** (353 lines) - Main modal orchestrator

### Sub-Components (all under 250 lines)
- **SimilaritySettings.tsx** - Similarity threshold and target size controls
- **SalesTargeting.tsx** - Buyer persona and sales-related filters
- **PropertyFilters.tsx** - Property type, status, and dimension filters
- **GeographicFilters.tsx** - Location-based filtering
- **GeneralOptions.tsx** - Compliance and enrichment settings
- **CostSummary.tsx** - Credit cost calculation and display

### Supporting Files
- **types.ts** - Zod schemas, TypeScript types, and constants
- **utils/configBuilder.ts** - Configuration transformation utilities

## Usage

```typescript
import { LookalikeConfigModal } from "@/components/reusables/modals/user/lookalike";

<LookalikeConfigModal
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  seedListId="list-123"
  seedListName="Top Investors"
  seedLeadCount={250}
  onGenerate={handleGenerate}
  onSaveConfig={handleSaveConfig}
  initialConfig={savedConfig}
/>
```

## Features

### 1. Similarity Settings
- Adjustable similarity threshold (60-95%)
- Target audience size configuration
- Real-time audience size estimation

### 2. Sales & Audience Targeting
- Buyer persona selection (investor, wholesaler, lender, etc.)
- Motivation level filters (hot, warm, cold)
- Purchase timeline and investment experience
- Budget and credit score ranges
- Cash buyer and portfolio size filters

### 3. Property Filters
- Property types (single-family, multi-family, commercial, etc.)
- Property status (active, off-market, foreclosure, etc.)
- Price, bedroom, bathroom, and square footage ranges
- Year built filters
- Distressed property signals

### 4. Geographic Filters
- State selection (multi-select)
- City and ZIP code filtering (comma-separated)
- Radius search (address + miles)
- Exclusion filters for specific areas

### 5. General Options
- **Mandatory Compliance** (always enabled):
  - DNC compliance
  - TCPA opt-in required
  - Valid phone requirement
- Optional email requirement
- Enrichment level selection (none, free, premium, hybrid)
- Data recency filters
- Corporate and absentee owner preferences

### 6. Cost Summary
- Real-time credit calculation
- Breakdown of lead credits and skip trace credits
- Total cost display based on enrichment level

### 7. Configuration Management
- Save configurations for reuse
- Load saved configurations
- Reset filters to defaults

### 8. Export Options
- **Ad Platforms**: Export to Meta, Google, LinkedIn
- **CSV Export**: Download as CSV file
  - Optional enriched data (property value, equity, contact info)
  - Includes metadata header with generation details
  - Automatic filename generation with timestamp

## Form Validation

All inputs are validated using Zod schemas. Key validations include:
- Similarity threshold: 60-95%
- Target size: 10-10,000 leads
- Valid seed list with leads
- All numeric ranges must be valid

## Technical Details

### State Management
- React Hook Form with Zod resolver
- Real-time form watching for cost calculations
- Debounced API calls for audience estimation

### Compliance
The following settings are **always enabled** and cannot be changed:
- DNC Compliance
- TCPA Opt-In Required
- Valid Phone Required

These are enforced at the API level and displayed as disabled checkboxes in the UI.

### Credit Costs
- **Base Cost**: 1 credit per lead
- **Premium/Hybrid Enrichment**: +1 credit per lead (2 total)
- **Total**: targetSize × multiplier

## File Structure

```
lookalike/
├── LookalikeConfigModal.tsx (Main modal)
├── components/
│   ├── SimilaritySettings.tsx
│   ├── SalesTargeting.tsx
│   ├── PropertyFilters.tsx
│   ├── GeographicFilters.tsx
│   ├── GeneralOptions.tsx
│   └── CostSummary.tsx
├── utils/
│   └── configBuilder.ts
├── types.ts
├── index.ts (Barrel export)
└── README.md (This file)
```

## Best Practices

1. **Modularity**: Each filter section is a separate component
2. **Type Safety**: All props and data structures are fully typed
3. **Validation**: Zod schemas ensure data integrity
4. **Reusability**: Components can be used independently if needed
5. **Documentation**: JSDoc comments on all public interfaces
6. **Accessibility**: Proper labels and ARIA attributes
7. **Performance**: Debounced API calls and optimized re-renders

## Dependencies

- React Hook Form
- Zod (validation)
- Shadcn UI components
- Lucide React icons
- Sonner (toast notifications)

## CSV Export

The results modal includes built-in CSV export functionality:

```typescript
import { exportWithMetadata } from "@/components/reusables/modals/user/lookalike";

// Export with metadata header
exportWithMetadata(candidates, metadata, options);
```

Features:
- ✅ Client-side only (no backend required)
- ✅ Automatic value escaping and formatting
- ✅ Optional enriched data fields
- ✅ Metadata header with generation info
- ✅ Browser download trigger

See `CSV_EXPORT_GUIDE.md` for detailed documentation.

## Migration from Original File

The original 1074-line file has been split into:
- 1 main modal (353 lines)
- 6 sub-components (each < 200 lines)
- 1 types file (135 lines)
- 1 utility file (85 lines)

All functionality remains identical, with improved maintainability and testability.

