# Dynamic Quick Actions - Context-Aware Templates

## Overview

Quick Actions are now **dynamic** and **context-aware**, showing relevant prompts based on where they're used in the application.

## Context-Aware Features

### 1. **Prioritize Category**

Show templates from a specific category first:

```tsx
<AIPromptGenerator
  quickActions={QUICK_ACTION_TEMPLATES}
  prioritizeCategory="campaign"  // Campaign templates appear first
/>
```

**Result:**
```
🚀 CAMPAIGN CREATION [4]  ← Shows first
  • Cold Call Campaign
  • Email Nurture
  • SMS Broadcast
  • Multi-Channel Drip

🔍 SEARCH CREATION [4]
  • High-Intent Investors
  • Skip Trace & Enrich
  • (etc...)
```

### 2. **Filter Categories**

Show ONLY templates from specific categories:

```tsx
<AIPromptGenerator
  quickActions={QUICK_ACTION_TEMPLATES}
  filterCategories={["search"]}  // Only show search templates
/>
```

**Result:**
```
🔍 SEARCH CREATION [4]  ← Only category shown
  • High-Intent Investors
  • Skip Trace & Enrich
  • Predictive Lead Scoring
  • Market Data Analysis
```

### 3. **Combined: Prioritize + Filter**

Most common use case:

```tsx
// In Search Modal
<AIPromptGenerator
  prioritizeCategory="search"
  filterCategories={["search"]}
/>

// In Campaign Modal
<AIPromptGenerator
  prioritizeCategory="campaign"
  filterCategories={["campaign"]}
/>
```

## Implementation Examples

### Search Generator (Current)

```tsx
<AISavedSearchGenerator
  // Only shows search templates
  filterCategories={["search"]}
  prioritizeCategory="search"
/>
```

**Templates Shown:**
- 🔍 High-Intent Investors
- 🔍 Skip Trace & Enrich
- 🔍 Predictive Lead Scoring
- 🔍 Market Data Analysis

### Campaign Generator (New)

```tsx
<AICampaignPromptGenerator
  // Only shows campaign templates
  filterCategories={["campaign"]}
  prioritizeCategory="campaign"
/>
```

**Templates Shown:**
- 🚀 Cold Call Campaign
- 🚀 Email Nurture Sequence
- 🚀 SMS Broadcast Campaign
- 🚀 Multi-Channel Drip

### Generic AI Generator

```tsx
<AIPromptGenerator
  // Shows all templates, campaigns first
  prioritizeCategory="campaign"
  // No filter - shows both
/>
```

**Templates Shown:**
- 🚀 CAMPAIGN CREATION [4] ← First
- 🔍 SEARCH CREATION [4] ← Second

## Dynamic Template Structure

### Template Definition

```tsx
interface QuickActionTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: "search" | "campaign";  // Determines grouping
  tags: string[];
}
```

### Category Determines:

1. **Visual Color**
   - Search = Blue
   - Campaign = Green

2. **Icon**
   - Search = 🔍
   - Campaign = 🚀

3. **Grouping**
   - Templates grouped by category
   - Separated by visual dividers

4. **Filtering**
   - Can filter to show only relevant category

## Usage in Different Contexts

### 1. **Lookalike Search Modal**
```tsx
filterCategories={["search"]}
prioritizeCategory="search"
```
→ Only shows search-related prompts

### 2. **Campaign Creation Modal**
```tsx
filterCategories={["campaign"]}
prioritizeCategory="campaign"
```
→ Only shows campaign-related prompts

### 3. **Generic AI Assistant**
```tsx
// No filters - shows all
prioritizeCategory="campaign"  // But campaigns first
```
→ Shows all prompts, campaigns prioritized

### 4. **Custom Context**
```tsx
filterCategories={["search"]}  // Only search
prioritizeCategory="search"
```
→ Highly focused, context-specific

## Search Functionality

Users can search across:
- ✅ Template titles
- ✅ Descriptions
- ✅ Tags
- ✅ Prompt content (variables, tools)

**Example:**
- Search "investor" → Shows "High-Intent Investors"
- Search "cold" → Shows "Cold Call Campaign"
- Search "{{leadSource}}" → Shows all prompts using that variable

## Benefits

### Context-Aware UX
- ✅ Relevant prompts appear first
- ✅ No clutter from irrelevant templates
- ✅ Faster to find what you need

### Consistent Interface
- ✅ Same component, different contexts
- ✅ Automatic filtering
- ✅ Automatic prioritization

### Scalable
- ✅ Easy to add new templates
- ✅ Easy to add new categories
- ✅ Easy to create context-specific modals

## Future Extensions

### New Categories
```tsx
category: "search" | "campaign" | "analysis" | "automation"
```

### Dynamic Templates from API
```tsx
const templates = await fetchUserTemplates();
<QuickActionButton templates={templates} />
```

### User-Created Templates
```tsx
const customTemplates = userProfile.savedTemplates;
<QuickActionButton 
  templates={[...QUICK_ACTION_TEMPLATES, ...customTemplates]}
/>
```

## Summary

Quick Actions are now **fully dynamic**:
- Show different prompts in different contexts
- Filter by category
- Prioritize relevant templates
- Search across all content
- Copy to clipboard with clear notifications

The system automatically adapts to its context!

