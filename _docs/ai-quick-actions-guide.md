# AI Quick Actions & Campaign Prompt Generator

## Overview

Two specialized AI generators with pre-built templates:
1. **AI Search Generator** - Generate optimized search configurations
2. **Campaign Prompt Generator** - Create campaign prompts and copy to clipboard

## Quick Action Templates

### What Are They?

Pre-built prompt templates that combine variables, tools, and scripts for common use cases.

### Features

- ✅ **One-click use** - Click to load template into prompt
- ✅ **Copy to clipboard** - Hover and click copy icon
- ✅ **Smart tags** - Visual indicators for template type
- ✅ **Category filtering** - Search, campaign, analysis, outreach
- ✅ **Toast notifications** - Feedback on copy/use actions

### Available Templates

#### 1. **High-Intent Investors**
```
{{analyze}} leads from {{leadSource}} where {{leadScore}} is high 
and {{contactStatus}} is active, then {{filter}} by {{propertyType}} 
in {{location}} targeting investors
```
- **Category**: Search
- **Tags**: investors, high-intent, analysis
- **Uses**: 5 variables, 2 tools

#### 2. **Cold Call Campaign**
```
Create campaign for {{leadList}} using {{coldCallScript}} targeting 
{{propertyType}} in {{location}}, {{score}} leads and use 
{{objectionHandler}} for responses
```
- **Category**: Campaign  
- **Tags**: cold-call, outreach, scripts
- **Uses**: 4 variables, 1 tool, 2 scripts

#### 3. **Skip Trace & Enrich**
```
{{filter}} {{leadList}} by {{skipTraceStatus}} equals pending, 
then {{enrich}} with property data for {{propertyType}} leads 
in {{location}}
```
- **Category**: Analysis
- **Tags**: skip-trace, enrichment, data
- **Uses**: 4 variables, 2 tools

#### 4. **Email Nurture Sequence**
```
{{segment}} leads from {{leadSource}} by {{responseRate}}, 
use {{emailTemplate}} for initial contact and {{followUpScript}} 
for engaged leads in {{campaignName}}
```
- **Category**: Outreach
- **Tags**: email, nurture, automation
- **Uses**: 4 variables, 1 tool, 2 scripts

#### 5. **Predictive Lead Scoring**
```
{{predict}} conversion for {{leadList}} based on {{contactStatus}}, 
{{responseRate}}, and {{propertyType}}, then {{score}} and rank 
by {{location}} and {{budget}}
```
- **Category**: Analysis
- **Tags**: scoring, prediction, ranking
- **Uses**: 6 variables, 2 tools

#### 6. **Market Data Analysis**
```
{{getMarketData}} for {{location}} where {{propertyType}} matches 
criteria, {{analyze}} trends and {{getPropertyData}} for high-value 
targets in {{budget}} range
```
- **Category**: Analysis
- **Tags**: market, analysis, research
- **Uses**: 4 variables, 1 tool, 2 functions

## Campaign Prompt Generator

### Purpose

Separate modal specifically for building campaign prompts without AI generation - just copy to clipboard.

### Usage

```tsx
import { CampaignPromptGenerator } from "@/components/reusables/ai";

<CampaignPromptGenerator
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  variables={PLATFORM_VARIABLES}
  tools={AI_TOOLS}
  scripts={SALES_SCRIPTS}
  quickActions={TEMPLATES}
/>
```

### Features

- **No AI Generation** - Simple prompt builder
- **Copy to Clipboard** - Primary action
- **Same chip system** - Variables, tools, scripts
- **Quick actions** - Pre-built templates
- **Color-coded context** - Visual chip display

### Workflow

1. User opens Campaign Prompt Generator
2. Selects quick action OR builds custom prompt
3. Clicks "Copy to Clipboard"
4. Toast notification confirms copy
5. Paste into campaign builder, messaging app, etc.

## Sales Scripts Integration

### Fetched from State

Sales scripts are now dynamically loaded from the campaign creation store:

```tsx
const availableSalesScripts = useCampaignCreationStore(
  (state) => state.availableSalesScripts
);

const salesScriptsChips = availableSalesScripts.map(script => ({
  key: script.id,
  label: script.name,
  description: `Script: ${script.name}`,
  type: "script",
  icon: getScriptIcon(script.name),
}));
```

### Future-Proof

- ✅ Sales scripts from user profile
- ✅ Auto-updates when scripts change
- ✅ Dynamic icon assignment
- ✅ No hardcoded scripts

## Selection Highlighting

### Click Feedback

When you click a chip to insert it:
- **Blue highlight** appears (ring + background)
- **300ms animation** shows selection
- **Auto-clears** after insertion

```tsx
className={cn(
  isSelected 
    ? "bg-blue-500/40 text-blue-900 dark:text-blue-100 border-blue-500 ring-2 ring-blue-500/50"
    : "hover:bg-primary/20"
)}
```

## Color Variance Fixed

### Increased Opacity & Border

Changed from 20%/40% to **35%/60%** and **2px borders**:

```tsx
// Before (too subtle)
backgroundColor: "rgba(34, 197, 94, 0.2)"  // 20%
borderWidth: "1.5px"

// After (clearly visible)
backgroundColor: "rgba(34, 197, 94, 0.35)" // 35%
borderWidth: "2px"
```

### Result

- 🔵 **Blue** - Variables (clearly blue)
- 🟢 **Green** - Tools (clearly green)
- 🟣 **Purple** - Functions (clearly purple)
- 🌹 **Rose** - Scripts (clearly pink/rose)
- 🟠 **Orange** - Parameters (clearly orange)

## Usage Examples

### AI Search Generator (with Quick Actions)
```tsx
<AISavedSearchGenerator
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  onSearchGenerated={handleSearch}
  // Quick actions automatically included
/>
```

### Campaign Prompt Generator (Copy only)
```tsx
<CampaignPromptGenerator
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  variables={PLATFORM_VARIABLES}
  tools={AI_TOOLS}
  scripts={salesScriptsFromStore}
  quickActions={CAMPAIGN_TEMPLATES}
/>
```

## Toast Notifications

### On Template Use
```
✅ Applied "High-Intent Investors"
   Template loaded into your prompt
```

### On Copy
```
✅ Campaign prompt copied!
   Paste into your campaign builder or messaging app
```

### On Error
```
❌ Failed to copy to clipboard
```

## Best Practices

1. **Use Quick Actions** for common scenarios
2. **Copy campaign prompts** instead of re-typing
3. **Color-code** helps identify chip types quickly
4. **Selection highlight** confirms clicks
5. **Toast notifications** provide clear feedback

All templates are searchable, scrollable, and mobile-responsive!

