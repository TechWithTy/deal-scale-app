# Advanced Variables Guide

## Overview

The AI Prompt System now includes **18 total variables** (10 basic + 8 advanced) for maximum personalization and targeting precision.

## Basic Variables (10)

These are the core variables already in use:

| Variable | Description | Icon | Example Value |
|----------|-------------|------|---------------|
| `{{ leadSource }}` | Original source of the lead | 📊 Database | "Facebook Ads", "Cold List" |
| `{{ campaignName }}` | Name of the campaign | 🎯 Target | "Q1 Investor Campaign" |
| `{{ skipTraceStatus }}` | Status of skip-trace/enrichment | 🔍 Search | "complete", "pending" |
| `{{ leadList }}` | Named list or batch | 👥 Users | "Austin Investors 2024" |
| `{{ leadScore }}` | Internal quality score | 📈 Trending | 75, 82, 91 |
| `{{ contactStatus }}` | Contact status | ⚡ Zap | "uncontacted", "engaged" |
| `{{ propertyType }}` | Type of property | 🏠 Filter | "single_family", "multi_family" |
| `{{ location }}` | Geographic location | 📍 Map Pin | "Austin, TX", "Miami, FL" |
| `{{ budget }}` | Budget or property value | 💲 Dollar | "$200K-$300K" |
| `{{ responseRate }}` | Engagement level | 📊 Trending | 23%, 45% |

## Advanced Variables (8)

These add richer context for AI-powered targeting:

| Variable | Type | Description | Icon | Example Value |
|----------|------|-------------|------|---------------|
| `{{ ownerTimeInProperty }}` | Numeric | Years owner has held property | ⏰ Clock | 5, 10, 15 |
| `{{ isOutOfStateOwner }}` | Boolean | Owner lives out of state | 📍 Map Pin | true, false |
| `{{ estimatedEquityPercentage }}` | Numeric | Estimated equity % in property | 📊 Pie Chart | 45%, 80%, 120% |
| `{{ sellerIntentScore }}` | Numeric | "Intent to sell" indicator | 👍 Thumbs Up | 0-100 score |
| `{{ lastContactedDaysAgo }}` | Numeric | Days since last contact | 📅 Calendar | 7, 30, 90 |
| `{{ tenantId }}` | String | Multi-tenant context identifier | 🏢 Building | "org_12345" |
| `{{ dealClosedCount }}` | Numeric | Past deals user has closed | 🎯 Target | 5, 12, 47 |
| `{{ vertical }}` | String | User's business type | 💼 Briefcase | "wholesaler", "agent", "investor" |

## Use Cases by Variable

### 1. **{{ ownerTimeInProperty }}**
**Use when:**
- Targeting long-term owners for motivated seller campaigns
- Identifying potential "tired landlords"
- Finding owners with built-up equity

**Example POML:**
```xml
<poml>
  <task>Find motivated sellers who've held properties 10+ years</task>
  <instructions>
    {{ filter }} {{ leadList }} WHERE {{ ownerTimeInProperty }} > 10
    AND {{ propertyType }} = 'single_family'
  </instructions>
</poml>
```

### 2. **{{ isOutOfStateOwner }}**
**Use when:**
- Targeting absentee owners
- Finding distressed properties
- Identifying property management opportunities

**Example POML:**
```xml
<poml>
  <task>Target out-of-state owners for quick sale opportunities</task>
  <instructions>
    {{ filter }} {{ leadList }} WHERE {{ isOutOfStateOwner }} = true
    AND {{ sellerIntentScore }} > 60
  </instructions>
</poml>
```

### 3. **{{ estimatedEquityPercentage }}**
**Use when:**
- Qualifying buyers for financing
- Finding "equity-rich" sellers
- Prioritizing high-value deals

**Example POML:**
```xml
<poml>
  <task>Find equity-rich properties for wholesale deals</task>
  <instructions>
    {{ filter }} WHERE {{ estimatedEquityPercentage }} > 50
    AND {{ propertyType }} IN ['single_family', 'duplex']
    {{ score }} BY {{ estimatedEquityPercentage }} DESC
  </instructions>
</poml>
```

### 4. **{{ sellerIntentScore }}**
**Use when:**
- Prioritizing "hot" leads
- Creating high-conversion campaigns
- Segmenting by motivation level

**Example POML:**
```xml
<poml>
  <task>Create campaign for high-intent sellers</task>
  <instructions>
    {{ segment }} {{ leadList }} BY {{ sellerIntentScore }}
    IF {{ sellerIntentScore }} > 80 THEN {{ coldCallScript }}
    IF {{ sellerIntentScore }} 50-80 THEN {{ emailTemplate }}
    IF {{ sellerIntentScore }} < 50 THEN {{ followUpScript }}
  </instructions>
</poml>
```

### 5. **{{ lastContactedDaysAgo }}**
**Use when:**
- Re-engaging cold leads
- Follow-up sequencing
- Preventing over-contact

**Example POML:**
```xml
<poml>
  <task>Re-engage leads contacted 30-90 days ago</task>
  <instructions>
    {{ filter }} {{ leadList }} 
    WHERE {{ lastContactedDaysAgo }} BETWEEN 30 AND 90
    AND {{ contactStatus }} NOT 'dnc'
    {{ createCampaign }} with {{ followUpScript }}
  </instructions>
</poml>
```

### 6. **{{ tenantId }}**
**Use when:**
- Multi-tenant/organization workflows
- White-label implementations
- Org-specific segmentation

**Example POML:**
```xml
<poml>
  <task>Generate org-specific lead analysis</task>
  <context>
    <var name="tenantId">{{ tenantId }}</var>
  </context>
  <instructions>
    {{ analyze }} {{ leadList }} FOR {{ tenantId }}
    Apply org-specific scoring rules
  </instructions>
</poml>
```

### 7. **{{ dealClosedCount }}**
**Use when:**
- Personalizing for user experience level
- Adjusting complexity of recommendations
- Gamification/leaderboards

**Example POML:**
```xml
<poml>
  <task>Provide experience-appropriate recommendations</task>
  <instructions>
    {% if dealClosedCount > 20 %}
      Show advanced strategies and shortcuts
    {% elif dealClosedCount > 5 %}
      Show intermediate tactics
    {% else %}
      Show beginner-friendly step-by-step guides
    {% endif %}
  </instructions>
</poml>
```

### 8. **{{ vertical }}**
**Use when:**
- Customizing language/terminology
- Vertical-specific workflows
- Role-based filtering

**Example POML:**
```xml
<poml>
  <role>{{ vertical }}-focused real estate analyst</role>
  <task>Create {{ vertical }}-optimized campaign</task>
  <instructions>
    {% if vertical == 'wholesaler' %}
      Focus on {{ analyze }} deal spread and {{ filter }} by ARV
    {% elif vertical == 'agent' %}
      Focus on {{ analyze }} commission potential and MLS data
    {% elif vertical == 'investor' %}
      Focus on {{ analyze }} cash flow and {{ getPropertyData }}
    {% endif %}
  </instructions>
</poml>
```

## Combined Advanced Use Case

### Hyper-Targeted Motivated Seller Campaign

```xml
<poml>
  <role>Senior real estate acquisition specialist</role>
  <task>Create hyper-targeted campaign for motivated out-of-state sellers</task>
  
  <context>
    <var name="leadList">{{ leadList }}</var>
    <var name="isOutOfStateOwner">{{ isOutOfStateOwner }}</var>
    <var name="ownerTimeInProperty">{{ ownerTimeInProperty }}</var>
    <var name="estimatedEquityPercentage">{{ estimatedEquityPercentage }}</var>
    <var name="sellerIntentScore">{{ sellerIntentScore }}</var>
    <var name="lastContactedDaysAgo">{{ lastContactedDaysAgo }}</var>
    <var name="propertyType">{{ propertyType }}</var>
    <var name="location">{{ location }}</var>
    <var name="vertical">{{ vertical }}</var>
  </context>
  
  <instructions>
    1. {{ filter }} {{ leadList }} WHERE:
       - {{ isOutOfStateOwner }} = true
       - {{ ownerTimeInProperty }} > 7
       - {{ estimatedEquityPercentage }} > 40
       - {{ sellerIntentScore }} > 60
       - {{ lastContactedDaysAgo }} > 30 OR never contacted
    
    2. {{ segment }} BY {{ sellerIntentScore }}:
       - Hot (80-100): Immediate {{ coldCallScript }}
       - Warm (60-79): {{ emailTemplate }} + call in 48h
    
    3. Personalize for {{ vertical }}:
       {% if vertical == 'wholesaler' %}
         Emphasize quick cash close, no repairs
       {% elif vertical == 'investor' %}
         Highlight rental income potential, equity
       {% endif %}
    
    4. {{ analyze }} {{ propertyType }} in {{ location }}
       Use {{ getMarketData }} for pricing context
    
    5. {{ createCampaign }} with multi-touch sequence:
       Day 1: {{ emailTemplate }}
       Day 3: {{ coldCallScript }} if not opened
       Day 7: {{ followUpScript }} with market insights
    
    6. Track {{ responseRate }} and adjust
  </instructions>
  
  <constraints>
    - Exclude {{ contactStatus }} = 'dnc'
    - Maximum 3 touches in 14 days
    - Only {{ location }} within service area
  </constraints>
  
  <output-format>
    Return campaign configuration with:
    - Filtered lead count by segment
    - Sequence timeline with scripts
    - Expected response rates by {{ vertical }}
    - KPIs to track
  </output-format>
</poml>
```

## Variable Summary Table

| Category | Count | Variables |
|----------|-------|-----------|
| **Basic** | 10 | leadSource, campaignName, skipTraceStatus, leadList, leadScore, contactStatus, propertyType, location, budget, responseRate |
| **Advanced** | 8 | ownerTimeInProperty, isOutOfStateOwner, estimatedEquityPercentage, sellerIntentScore, lastContactedDaysAgo, tenantId, dealClosedCount, vertical |
| **Total** | **18** | All variables available in POML prompts |

## How to Use in UI

### 1. **Typing Variables**
```
Type {{ and the autocomplete will show all 18 variables
```

### 2. **Clicking Chips**
Click any variable chip in the "Platform Variables" accordion to insert it

### 3. **Color Coding**
All variables show as **🔵 Blue chips** in the UI

### 4. **Validation**
Only the 18 valid variables will be recognized - invalid ones won't show as chips

## Benefits

### ✅ **Precision Targeting**
Advanced variables enable hyper-specific filtering (e.g., "out-of-state owners with 10+ years, 50%+ equity, intent score > 70")

### ✅ **Personalization**
`{{ vertical }}` and `{{ dealClosedCount }}` allow role-based and experience-level customization

### ✅ **Re-Engagement**
`{{ lastContactedDaysAgo }}` enables smart follow-up sequencing

### ✅ **Intent-Based Workflows**
`{{ sellerIntentScore }}` powers conversion-focused campaigns

### ✅ **Equity Analysis**
`{{ estimatedEquityPercentage }}` and `{{ ownerTimeInProperty }}` identify high-value opportunities

## Errors Fixed

### 1. ✅ **Toast Import Error**
```typescript
// Added to AIPromptGenerator.tsx
import { toast } from "sonner";
```

### 2. ✅ **BorderBeam Export Error**
```typescript
// Added to components/magicui/border-beam.tsx
export { BorderBeam };  // Named export
export default BorderBeam;  // Default export
```

## Next Steps

- [ ] Populate advanced variables from backend data
- [ ] Add tooltips explaining each advanced variable
- [ ] Create "Advanced Mode" toggle for experienced users
- [ ] Build analytics showing which variables drive best results
- [ ] Add conditional logic builder UI for advanced variables

---

**All 18 variables are now live and ready to use in Microsoft POML prompts!** 🎉

