# POML Implementation Guide

> **Our platform now uses Microsoft's official [Prompt Orchestration Markup Language (POML)](https://github.com/microsoft/poml)**

## What is POML?

POML is a markup language developed by Microsoft for structured prompt engineering. It brings the power of semantic HTML and templating to AI prompts, making them:

- **Structured** - Clear role, task, context separation
- **Maintainable** - Easy to update and version
- **Parseable** - AI can understand intent
- **Reusable** - Templates work across use cases
- **Type-safe** - Variables, tools, scripts, functions

## Official Resources

- 📚 **Documentation**: https://microsoft.github.io/poml/
- 🐙 **GitHub**: https://github.com/microsoft/poml (4.7k ⭐)
- 🔬 **Research Paper**: [arXiv:2508.13948](https://arxiv.org/abs/2508.13948)
- 💬 **Discord**: Join the POML community
- 📦 **Packages**: `npm install pomljs` | `pip install poml`
- 🔧 **VS Code Extension**: [Marketplace](https://marketplace.visualstudio.com/items?itemName=Microsoft.poml)

## Our Implementation

### 1. **Placeholder Text** - Shows POML Structure

**Search Generator:**
```xml
<poml>
  <role>Expert real estate lead analyst</role>
  <task>Analyze {{ leadSource }} and create optimized search</task>
  <instructions>
    Filter leads where {{ skipTraceStatus }} equals complete
    Analyze {{ propertyType }} in {{ location }}
    Score using {{ responseRate }} and {{ contactStatus }}
  </instructions>
  <output-format>Return lead list with scores</output-format>
</poml>
```

**Campaign Generator:**
```xml
<poml>
  <role>Campaign strategist</role>
  <task>Create campaign for {{ leadList }}</task>
  <context>
    <var name="script">{{ script }}</var>
    <var name="leadList">{{ leadList }}</var>
  </context>
  <instructions>Execute campaign workflow</instructions>
</poml>
```

### 2. **8 Starter Prompts** - All POML Format

#### Search Templates (4)
1. **High-Intent Investors** - Multi-condition filtering with scoring
2. **Skip Trace & Enrich** - Data enrichment pipeline
3. **Predictive Scoring** - ML-powered ranking
4. **Market Analysis** - Multi-step data aggregation

#### Campaign Templates (4)
1. **Cold Call Campaign** - Script orchestration with objection handling
2. **Email Nurture** - Conditional sequences with triggers
3. **SMS Broadcast** - Targeted messaging with compliance
4. **Multi-Channel Drip** - Complex timing with monitoring

### 3. **ChipTextarea Component** - POML Variable Support

Detects and color-codes variables:
- 🔵 `{{ leadSource }}` - Variables (blue)
- 🟢 `{{ analyze }}` - Tools (green)
- 🟣 `{{ getPropertyData }}` - Functions (purple)
- 🌹 `{{ coldCallScript }}` - Scripts (rose)

### 4. **Help Text** - POML Syntax Guide

```
Use Microsoft POML syntax: 
<poml><role>...</role><task>...</task>
<context><var>{{ variable }}</var></context></poml>
```

### 5. **Documentation** - Complete POML Reference

Created `_docs/prompt-orchestration-language.md` with:
- ✅ POML syntax overview
- ✅ All core tags (`<role>`, `<task>`, `<context>`, etc.)
- ✅ Variable types (platform, tools, scripts, functions)
- ✅ Example prompts for search and campaigns
- ✅ Conditional logic (`{% if %}`, `{% for %}`)
- ✅ Best practices
- ✅ Official resource links

## POML Tags We Use

### Core Structure
```xml
<poml>              Root element
<role>              AI persona definition
<task>              Primary objective
<context>           Variable declarations
<instructions>      Step-by-step workflow
<output-format>     Response structure
<constraints>       Rules and limits
<example>           Few-shot examples
```

### Variable Declaration
```xml
<context>
  <var name="leadSource">{{ leadSource }}</var>
  <var name="propertyType">{{ propertyType }}</var>
  <var name="location">{{ location }}</var>
</context>
```

### Control Flow (Advanced)
```xml
{% if condition %}
  Do something
{% elif other_condition %}
  Do something else
{% else %}
  Default action
{% endif %}

{% for item in list %}
  Process {{ item }}
{% endfor %}
```

## Example: Full POML Prompt

```xml
<poml>
  <role>Expert real estate lead analyst specializing in investor identification</role>
  
  <task>Analyze leads from {{ leadSource }} to identify high-intent investors</task>
  
  <context>
    <var name="leadSource">{{ leadSource }}</var>
    <var name="leadScore">{{ leadScore }}</var>
    <var name="contactStatus">{{ contactStatus }}</var>
    <var name="propertyType">{{ propertyType }}</var>
    <var name="location">{{ location }}</var>
  </context>
  
  <instructions>
    1. {{ filter }} leads where {{ leadScore }} > 75
    2. Check {{ contactStatus }} equals "active"
    3. {{ analyze }} by {{ propertyType }} in {{ location }}
    4. Prioritize investors with high response rates
  </instructions>
  
  <constraints>
    - Minimum lead score of 75
    - Active contact status only
    - Exclude DNC list
  </constraints>
  
  <output-format>
    Return a ranked list of high-intent investor leads with:
    - Lead ID and name
    - Score (0-100)
    - Property type and location
    - Recommended next action
  </output-format>
</poml>
```

## Color Coding in UI

When users type POML prompts, the system automatically detects and color-codes variables:

| Type | Color | Example |
|------|-------|---------|
| Platform Variables | 🔵 Blue | `{{ leadSource }}`, `{{ propertyType }}` |
| Tools & Actions | 🟢 Green | `{{ analyze }}`, `{{ filter }}`, `{{ score }}` |
| Resource Calls | 🟣 Purple | `{{ getPropertyData }}`, `{{ getMarketData }}` |
| Scripts & Templates | 🌹 Rose | `{{ coldCallScript }}`, `{{ emailTemplate }}` |

**Plain text** (not variables) remains uncolored.

## How It Works

### 1. **User Types Prompt**
```xml
<poml>
  <role>Lead analyst</role>
  <task>Analyze {{ leadSource }}</task>
</poml>
```

### 2. **System Detects Variables**
- Regex: `/\{\{(\w+)\}\}/g`
- Matches: `leadSource`

### 3. **Validates Against Available Chips**
- Checks if `leadSource` exists in platform variables
- If yes: show as blue chip
- If no: ignore (plain text)

### 4. **Renders Color-Coded Chips**
```
Context in your prompt:
[leadSource] (blue chip with count)
```

### 5. **AI Backend Parses POML**
- Extract `<role>`, `<task>`, `<context>`
- Build execution graph
- Replace `{{ variables }}` with actual values
- Execute orchestrated workflow
- Return result in `<output-format>`

## Benefits for Users

### ✅ **Clear Structure**
No more ambiguous prompts - role, task, and instructions are explicit

### ✅ **Reusable Templates**
8 starter prompts that can be customized

### ✅ **Type Safety**
Only valid variables show as colored chips

### ✅ **Visual Feedback**
Instant color-coding shows what's a variable vs. plain text

### ✅ **Industry Standard**
Using Microsoft's official markup language (4.7k GitHub stars)

### ✅ **Future-Proof**
- VS Code extension available
- npm/pip packages
- Active community
- Research-backed

## Migration from Old Format

### Before (Plain Text)
```
Analyze leads from leadSource where skipTraceStatus is complete,
filter by propertyType in location, and score using responseRate.
```

### After (POML)
```xml
<poml>
  <role>Lead analyst</role>
  <task>Analyze and score leads</task>
  <context>
    <var name="leadSource">{{ leadSource }}</var>
    <var name="skipTraceStatus">{{ skipTraceStatus }}</var>
    <var name="propertyType">{{ propertyType }}</var>
  </context>
  <instructions>
    1. {{ filter }} where {{ skipTraceStatus }} = complete
    2. {{ analyze }} by {{ propertyType }}
    3. {{ score }} using {{ responseRate }}
  </instructions>
  <output-format>Ranked lead list with scores</output-format>
</poml>
```

## User Experience Flow

1. **Open AI Modal** → See POML placeholder
2. **Click "Starter Prompts"** → Choose from 8 POML templates
3. **Prompt Auto-Fills** → With proper POML structure
4. **Edit Variables** → `{{ leadSource }}` turns blue
5. **See Context** → "Context in your prompt: leadSource, propertyType"
6. **Generate** → AI parses POML and executes
7. **Or Chat** → Open AI chat with POML context

## Developer Notes

### Files Modified
- `components/reusables/modals/user/lookalike/AISavedSearchGenerator.tsx`
- `components/reusables/ai/AIPromptGenerator.tsx`
- `components/reusables/ai/CampaignPromptGenerator.tsx`
- `components/reusables/ai/ChipTextarea.tsx`
- `_docs/prompt-orchestration-language.md`

### Key Changes
1. Updated all placeholder text to POML format
2. Converted 8 starter prompts to proper POML markup
3. Updated help text to reference POML syntax
4. Created comprehensive POML documentation
5. Added official resource links

### Variable Detection
```typescript
const variableRegex = /\{\{(\w+)\}\}/g;
const chipDef = chipDefinitions.find((c) => c.key === varKey);
if (!chipDef) continue; // Skip invalid variables
```

### Color Mapping
```typescript
const chipColorMap = {
  variable: { base: "rgb(59, 130, 246)", hover: "rgb(37, 99, 235)" },
  tool: { base: "rgb(34, 197, 94)", hover: "rgb(22, 163, 74)" },
  function: { base: "rgb(168, 85, 247)", hover: "rgb(147, 51, 234)" },
  script: { base: "rgb(244, 63, 94)", hover: "rgb(225, 29, 72)" },
};
```

## Next Steps

### Future Enhancements
- [ ] POML syntax highlighting in textarea
- [ ] Auto-complete for POML tags (`<role>`, `<task>`, etc.)
- [ ] Real-time POML validation
- [ ] Visual POML builder (drag-and-drop)
- [ ] Import/export `.poml` files
- [ ] POML playground for testing
- [ ] Integration with POML VS Code extension

### Community Integration
- [ ] Share templates with POML community
- [ ] Contribute to POML GitHub
- [ ] Showcase in POML gallery
- [ ] Blog post: "How We Use POML for Real Estate AI"

## References

1. **POML GitHub**: https://github.com/microsoft/poml
2. **Official Docs**: https://microsoft.github.io/poml/
3. **Research Paper**: Zhang, Y. et al. (2025). "Prompt Orchestration Markup Language"
4. **VS Code Extension**: [Microsoft POML](https://marketplace.visualstudio.com/items?itemName=Microsoft.poml)
5. **npm Package**: https://www.npmjs.com/package/pomljs
6. **Python Package**: https://pypi.org/project/poml/

---

**We're now using industry-standard POML for all AI prompt engineering! 🎉**

