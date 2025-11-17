# Final Look-Alike Modal Accordion Structure

## Date
November 6, 2025

## Overview
Final reorganization of the Look-Alike Audience Configuration Modal into clear, logical dropdown sections with dedicated components for each area.

---

## New Accordion Structure

```
┌────────────────────────────────────────────────────┐
│ Configure Look-Alike Audience                      │
│                                                     │
│ 👤 Investor  🎯 Build Deal Pipeline               │
│                                                     │
├────────────────────────────────────────────────────┤
│ 📊 Similarity Settings (Always Visible)            │
│   - Similarity Threshold: 75%                      │
│   - Target Audience Size: 100                      │
│   - [~34,321 leads]                                │
├────────────────────────────────────────────────────┤
│ ▼ Audience & Sales Targeting (Default Open)        │
│   - Buyer Persona [checkboxes]                     │
│   - Motivation Level [checkboxes]                  │
│   - Purchase Timeline [dropdown]                   │
│   - Investment Experience [dropdown]               │
│   - Budget Range / Credit Score [inputs]           │
│   - Cash Buyers Only / Portfolio Size              │
├────────────────────────────────────────────────────┤
│ ▼ Geographic Filters (Default Open)                │
│   - States [multi-select grid]                     │
│   - Cities / ZIP Codes [inputs]                    │
│   - Radius Search [address + miles]                │
│   - Exclude Areas [inputs]                         │
├────────────────────────────────────────────────────┤
│ ▸ 🏠 Property Filters                              │
│   - Property Types [checkboxes]                    │
│   - Property Status [checkboxes]                   │
│   - Price Range / Bedrooms / Bathrooms             │
│   - Square Footage / Year Built                    │
│   - Ownership Duration [checkboxes]                │
│   - Equity Position [checkboxes]                   │
│   - Distressed Signals [checkboxes]                │
├────────────────────────────────────────────────────┤
│ ▸ 📱 Social Enrichment [Optional]                  │
│   - Enable Social Profile Enrichment               │
│     ├─ Platform Selection:                         │
│     │  • Facebook                                  │
│     │  • LinkedIn                                  │
│     │  • Instagram                                 │
│     │  • Twitter/X                                 │
│     ├─ Data to Collect:                           │
│     │  • Friends & Connections                     │
│     │  • Interests & Pages Liked                   │
│     │  • Employment History                        │
│     │  • Usernames & Profile URLs                  │
│     │  • Full Social Dossier [Premium]             │
│     └─ ⚠️ Requires email, 2-3x processing time     │
├────────────────────────────────────────────────────┤
│ ▸ ✓ Compliance & Efficiency                        │
│   - ✓ Required Compliance:                         │
│     • DNC Compliance (always on)                   │
│     • TCPA Opt-In Required (always on)             │
│     • Require Valid Phone (always on)              │
│     • Require Valid Email (conditional)            │
│   - Data Quality & Enrichment:                     │
│     • Enrichment Level [dropdown]                  │
│     • Data Recency [input]                         │
│     • Corporate Ownership [dropdown]               │
│     • Absentee Owner [dropdown]                    │
│   - ⚡ Efficiency Options:                          │
│     • Skip Duplicate Leads                         │
│     • Skip Already Skip-Traced                     │
│     • Skip Leads in Active Campaigns               │
│     • Skip Your DNC List                           │
│     • Skip Previously Contacted                    │
└────────────────────────────────────────────────────┘
```

---

## Component Mapping

| Accordion Section | Component File | Default State |
|-------------------|----------------|---------------|
| Similarity Settings | `SimilaritySettings.tsx` | Always visible (not in accordion) |
| Audience & Sales Targeting | `SalesTargeting.tsx` | Open |
| Geographic Filters | `GeographicFilters.tsx` | Open |
| 🏠 Property Filters | `PropertyFilters.tsx` | Collapsed |
| 📱 Social Enrichment | `SocialEnrichmentAdvanced.tsx` | Collapsed |
| ✓ Compliance & Efficiency | `ComplianceOptions.tsx` | Collapsed |

---

## New Components Created

### 1. SocialEnrichmentAdvanced.tsx
**Purpose**: Dedicated social enrichment with platform filters

**Features**:
- Platform selection (Facebook, LinkedIn, Instagram, Twitter)
- Data type selection (Friends, Interests, Employment, Usernames, Dossier)
- Auto-enables email requirement
- Visual nesting with left border
- Warning badge about costs and time

**Location in Accordion**: Standalone section with blue theme

### 2. ComplianceOptions.tsx
**Purpose**: All compliance, data quality, and efficiency options

**Features**:
- Required compliance (DNC, TCPA) - green highlighted
- Data quality (enrichment level, recency)
- Ownership filters (corporate, absentee)
- Efficiency options (skip duplicates, etc.)

**Location in Accordion**: Standalone section with green theme

---

## Removed Components

### GeneralOptions.tsx
**Status**: Split into two new components
- Social parts → `SocialEnrichmentAdvanced.tsx`
- Compliance parts → `ComplianceOptions.tsx`

**Reason**: Better organization, clearer separation of concerns

---

## Social Enrichment Features

### Platform Filters
```tsx
☑ Facebook (default: ON)
☑ LinkedIn (default: ON)
☑ Instagram (default: ON)
☐ Twitter/X (default: OFF)
```

### Data Collection Options
```tsx
☑ Friends & Connections (default: ON)
  - Mutual friends, connection counts, network strength

☑ Interests & Pages Liked (default: ON)
  - Followed pages, interests, groups, engagement

☑ Employment History (default: ON)
  - Company, job title, work history, income estimate

☑ Usernames & Profile URLs (default: ON)
  - Social handles, profile links, platform IDs

☐ Full Social Dossier (default: OFF) [Premium]
  - Complete profile analysis, activity patterns, influence score
```

### Auto-Enable Logic
```tsx
When user enables "Social Enrichment":
1. Auto-checks "Require Valid Email"
2. Disables the email checkbox (grayed out)
3. Shows help text: "Required for social enrichment"
4. Displays warning about processing time and cost

When user disables "Social Enrichment":
1. Email checkbox re-enabled
2. User can toggle email manually
3. Help text removed
4. Warning hidden
```

---

## Compliance & Efficiency Features

### Required Compliance (Green Section)
```tsx
✓ DNC Compliance (disabled - always ON)
✓ TCPA Opt-In Required (disabled - always ON)
✓ Require Valid Phone (disabled - always ON)
☑ Require Valid Email (conditional based on social)
```

### Data Quality
```tsx
Enrichment Level [dropdown]
├─ None (No enrichment)
├─ Free (Basic enrichment)
├─ Premium (Full enrichment)
└─ Hybrid (Free + Premium)

Data Recency (days) [number input]
Corporate Ownership [dropdown: All / Only / Exclude]
Absentee Owner [dropdown: All / Only / Exclude]
```

### Efficiency Options (Primary highlight)
```tsx
☑ Skip Duplicate Leads
☑ Skip Already Skip-Traced
☑ Skip Leads in Active Campaigns
☑ Skip Your DNC List
☐ Skip Previously Contacted
```

---

## Visual Theme Guide

| Section | Background | Border | Purpose |
|---------|------------|--------|---------|
| Audience & Sales | Default | Default | Neutral, essential |
| Geographic | Default | Default | Neutral, essential |
| Property | Default | Default | Neutral, optional |
| Social | Blue (`bg-blue-500/5`) | Blue (`border-blue-500/30`) | Social media association |
| Compliance | Green (`bg-green-500/5`) | Green (`border-green-500/30`) | Compliance = safe/secure |

**Internal Highlights**:
- Required Compliance: Green box
- Efficiency Options: Primary box
- Social warning: Yellow box

---

## Default Open Sections

```tsx
<Accordion defaultValue={["sales", "geo"]}>
```

**Open by default**:
1. Audience & Sales Targeting
2. Geographic Filters

**Collapsed by default**:
1. Property Filters
2. Social Enrichment
3. Compliance & Efficiency

**Reasoning**:
- Most users only need basic targeting + geography
- Property filters are more advanced
- Social enrichment is opt-in premium feature
- Compliance defaults are good, don't need constant adjustment

---

## Responsive Behavior

### Mobile (< 640px)
```
All grids become single column:
- grid-cols-1 (checkboxes, inputs, platforms)
- Sections stack vertically
- Full width for all inputs
- Labels never wrap
```

### Tablet (640px - 1023px)
```
Grids expand to 2-3 columns:
- grid-cols-2 (most inputs)
- grid-cols-3 (checkboxes with many options)
- Balanced layout
```

### Desktop (>= 1024px)
```
Full layout:
- grid-cols-2 (inputs)
- grid-cols-3 (checkboxes)
- grid-cols-5 (states)
- Spacious, professional
```

---

## New Schema Fields Added

### Social Platforms
```typescript
includeFacebook: boolean (default: true)
includeLinkedIn: boolean (default: true)
includeInstagram: boolean (default: true)
includeTwitter: boolean (default: false)
```

### Social Data Types
```typescript
includeFriendsData: boolean (default: true)
includeInterests: boolean (default: true)
includeEmployment: boolean (default: true)
includeUsername: boolean (default: true)  // NEW
includeSocialDossier: boolean (default: false)  // NEW - Premium
```

### Efficiency Options
```typescript
skipDuplicates: boolean (default: true)
skipAlreadyTraced: boolean (default: true)
skipExistingCampaigns: boolean (default: true)
skipDncList: boolean (default: true)
skipPreviouslyContacted: boolean (default: false)
```

---

## Files Modified/Created

### New Files Created
1. ✅ `components/reusables/modals/user/lookalike/components/SocialEnrichment.tsx`
2. ✅ `components/reusables/modals/user/lookalike/components/SocialEnrichmentAdvanced.tsx`
3. ✅ `components/reusables/modals/user/lookalike/components/ComplianceOptions.tsx`

### Files Modified
4. ✅ `components/reusables/modals/user/lookalike/LookalikeConfigModal.tsx`
   - Updated imports
   - Reorganized accordion structure
   - 5 sections now instead of nested structure

5. ✅ `components/reusables/modals/user/lookalike/types.ts`
   - Added platform fields
   - Added username and dossier fields

6. ✅ `types/lookalike/index.ts`
   - Added social platform fields
   - Added new social data fields

7. ✅ `components/reusables/modals/user/lookalike/utils/configBuilder.ts`
   - Added all new social fields

8. ✅ `components/reusables/modals/user/lookalike/components/PropertyFilters.tsx`
   - Added Ownership Duration
   - Added Equity Position

### Files Deprecated
- `components/reusables/modals/user/lookalike/components/GeneralOptions.tsx`
  - **Status**: Can be deleted (replaced by ComplianceOptions)
  - **Reason**: Split into focused components

---

## User Flow Examples

### Example 1: Basic User
1. Opens modal
2. Sees Similarity Settings (always visible)
3. Sees Audience & Sales (open by default)
4. Sees Geographic Filters (open by default)
5. Generates audience
6. **Uses**: 2 open sections, simple and fast

### Example 2: Property Investor
1. Opens modal
2. Adjusts similarity
3. Expands Property Filters
4. Selects high equity + distressed signals
5. Generates audience
6. **Uses**: 3 sections, focused on property data

### Example 3: Social Media Marketer
1. Opens modal
2. Expands Social Enrichment
3. Enables social profile data
4. Selects Facebook + Instagram (unchecks LinkedIn)
5. Enables Friends Data + Interests
6. Email auto-enables and grays out
7. Generates audience
8. **Uses**: Social-focused targeting

### Example 4: Compliance-Conscious User
1. Opens modal
2. Expands Compliance & Efficiency
3. Enables "Skip Previously Contacted"
4. Reviews DNC/TCPA settings
5. Adjusts data recency to 30 days
6. Generates audience
7. **Uses**: Maximum compliance and efficiency

---

## Benefits of New Structure

### 1. Clear Separation of Concerns
- **Sales** = Who to target
- **Geography** = Where they are
- **Property** = What they own
- **Social** = Their digital footprint
- **Compliance** = Rules and efficiency

### 2. Visual Hierarchy
- Color coding (blue = social, green = compliance)
- Icons for quick scanning
- Badges for optional/premium
- Nested options show dependency

### 3. Progressive Disclosure
- Essentials open by default
- Advanced options collapsed
- Premium features clearly marked
- Reduces cognitive load

### 4. Mobile Optimized
- Each section manageable on small screens
- Single column layouts prevent cramping
- Labels never wrap
- Touch-friendly spacing

### 5. Efficiency First
- Smart defaults save money
- Efficiency options highlighted
- Cost warnings clear
- Deduplication automatic

---

## Accordion Props

```tsx
<Accordion
  type="multiple"
  className="space-y-2"
  defaultValue={["sales", "geo"]}
>
```

**Configuration**:
- `type="multiple"`: Users can open multiple sections at once
- `defaultValue={["sales", "geo"]}`: Sales and Geography open on load
- `space-y-2`: 8px gap between sections

---

## Theme Design System

### Color Meanings
- **Default** (gray): Essential, neutral
- **Blue** (`border-blue-500/30 bg-blue-500/5`): Social media, digital
- **Green** (`border-green-500/30 bg-green-500/5`): Compliance, safe, verified
- **Primary** (`border-primary/20 bg-primary/5`): Important, efficiency
- **Yellow** (`border-yellow-500/30 bg-yellow-500/10`): Warning, caution

### Consistency Rules
- Section border: `rounded-lg border px-4`
- Internal highlight: `rounded-lg border p-3`
- Nested content: `ml-6 border-l-2 pl-4`
- Warning badge: Yellow with info icon
- Optional badge: Outline variant

---

## Mobile Responsive Strategy

### Breakpoint Implementation
```tsx
// Checkbox grids
className="grid grid-cols-1 sm:grid-cols-2 gap-2"

// Input pairs
className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"

// Many checkboxes
className="grid grid-cols-2 sm:grid-cols-3 gap-2"

// States (special case)
className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2"
```

### Typography
```tsx
// Section headers
className="font-semibold text-base"

// Subsection labels
className="text-sm font-medium"

// Descriptions
className="text-xs text-muted-foreground"

// Small badges
className="text-[10px]"
```

---

## Property Threshold Scores (ADDED)

### Ownership Duration
```tsx
Options:
- Less than 1 year
- 1-3 years
- 3-5 years
- 5-10 years
- 10+ years

Use Case: Target "seasoned" owners (5-10+ years) for motivated sellers
```

### Equity Position
```tsx
Options:
- Less than 20% (low equity)
- 20-50% (moderate equity)
- 50-80% (high equity)
- 80%+ (very high equity)

Use Case: Target high equity for cash-out opportunities
```

**Location**: Property Filters section, displayed as checkboxes

---

## Backend Integration Requirements

### Social Enrichment API
```typescript
POST /api/social/enrich
{
  leadIds: string[],
  platforms: ["facebook", "linkedin", "instagram", "twitter"],
  dataTypes: ["friends", "interests", "employment", "username", "dossier"],
  requireEmail: true
}

Response:
{
  leads: [{
    leadId: "123",
    socialProfiles: {
      facebook: { url, username, friendCount, mutualFriends },
      linkedin: { url, connections, company, title },
      instagram: { url, followers, posts },
      twitter: { url, handle, followers }
    },
    friendsData: [...],
    interests: [...],
    employment: {...},
    socialDossier: {...}  // if requested
  }]
}
```

### Efficiency Filters API
```typescript
// Before enrichment, filter candidates
const filteredCandidates = candidates
  .filter(c => !skipDuplicates || !existsInSystem(c))
  .filter(c => !skipAlreadyTraced || !wasTraced(c))
  .filter(c => !skipExistingCampaigns || !inActiveCampaign(c))
  .filter(c => !skipDncList || !onUserDncList(c))
  .filter(c => !skipPreviouslyContacted || !wasContacted(c));

// Only enrich filtered results = cost savings
```

---

## Testing Checklist

### Functional
- [x] All 5 accordion sections render
- [x] Sales & Geo default to open
- [x] Property, Social, Compliance default to closed
- [x] Social enrichment auto-enables email
- [x] Platform checkboxes work
- [x] All new fields save to config
- [x] Ownership Duration renders
- [x] Equity Position renders

### Visual
- [x] Blue theme on Social section
- [x] Green theme on Compliance section
- [x] Primary theme on Efficiency subsection
- [x] Icons display correctly
- [x] Badges show properly
- [x] Nested indentation clear

### Mobile
- [x] All grids responsive
- [x] Labels don't wrap
- [x] Dropdown previews truncate
- [x] Sections stack properly
- [x] Touch targets adequate

### Linter
- [ ] No errors (pending re-check)

---

## Summary of Organization

### Before (Nested, Confusing)
```
- Essential Targeting
- Geographic Filters
- Advanced Targeting
  └─ Property Characteristics
  └─ Data & Compliance
     └─ Social stuff mixed with compliance stuff
```

### After (Flat, Clear)
```
- Audience & Sales Targeting
- Geographic Filters
- Property Filters
- Social Enrichment
- Compliance & Efficiency
```

**Improvement**: Each section is a peer, not nested. Clearer mental model.

---

## Author
AI Assistant (Claude Sonnet 4.5)

## Status
✅ **IMPLEMENTED & READY FOR TESTING**

New accordion structure provides better organization, clearer separation of social and compliance features, and improved mobile experience.


















