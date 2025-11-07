# Prompt Orchestration Markup Language (POML)

> **Based on [Microsoft's POML Standard](https://github.com/microsoft/poml)**  
> Official Documentation: https://microsoft.github.io/poml/  
> Research Paper: [arXiv:2508.13948](https://arxiv.org/abs/2508.13948)

## Overview

POML is Microsoft's official markup language for structured prompt engineering. It uses XML-like semantic tags (`<role>`, `<task>`, `<context>`) combined with templating variables (`{{ }}`) to create maintainable, reusable AI prompts.

## Why POML?

Traditional prompt engineering suffers from:
- ❌ Lack of structure
- ❌ Difficult data integration
- ❌ Format sensitivity
- ❌ Poor maintainability
- ❌ No IDE support

POML solves these with:
- ✅ Semantic markup structure
- ✅ Built-in data handling
- ✅ Decoupled presentation
- ✅ Templating engine
- ✅ VS Code extension

## Core POML Tags

### Structural Components

```xml
<poml>              Root element
<role>              Define AI persona/role
<task>              Primary objective
<context>           Variables and data
<instructions>      Step-by-step workflow
<output-format>     Desired response format
<example>           Few-shot examples
<constraints>       Rules and limitations
```

### Data Components

```xml
<var name="x">      Variable definition
<document>          External text file
<table>             Spreadsheet/CSV data
<img>               Image reference
<let>               Variable assignment
```

### Control Flow

```xml
{% if condition %}      Conditional logic
{% for item in list %}  Loop iteration
{% else %}              Alternative path
{% endif %}             End conditional
{% endfor %}            End loop
```

## POML Syntax for Our Platform

### Basic Search Prompt

```xml
<poml>
  <role>Expert real estate lead analyst</role>
  <task>Analyze {{ leadSource }} and create optimized search</task>
  
  <context>
    <var name="leadSource">{{ leadSource }}</var>
    <var name="propertyType">{{ propertyType }}</var>
    <var name="location">{{ location }}</var>
    <var name="skipTraceStatus">{{ skipTraceStatus }}</var>
  </context>
  
  <instructions>
    1. {{ filter }} leads where {{ skipTraceStatus }} equals complete
    2. {{ analyze }} {{ propertyType }} properties in {{ location }}
    3. {{ score }} based on response rate and contact status
    4. Return ranked lead list
  </instructions>
  
  <output-format>
    Return a structured JSON with:
    - Lead list with scores
    - Filter criteria applied
    - Ranking methodology
  </output-format>
</poml>
```

### Campaign Creation Prompt

```xml
<poml>
  <role>Campaign strategist for real estate outreach</role>
  <task>Create multi-channel campaign for {{ leadList }}</task>
  
  <context>
    <var name="leadList">{{ leadList }}</var>
    <var name="coldCallScript">{{ coldCallScript }}</var>
    <var name="emailTemplate">{{ emailTemplate }}</var>
    <var name="campaignName">{{ campaignName }}</var>
  </context>
  
  <instructions>
    1. {{ createCampaign }} named {{ campaignName }}
    2. Day 1: Send {{ emailTemplate }} to all leads
    3. Day 3: Call using {{ coldCallScript }} for non-responders
    4. Day 7: Send follow-up to engaged leads
    5. Track {{ responseRate }} and {{ contactStatus }}
  </instructions>
  
  <constraints>
    - Exclude DNC contacts
    - Respect timezone for calling
    - Maximum 3 touches per week
  </constraints>
  
  <output-format>
    Return campaign configuration with:
    - Sequence timeline
    - Script assignments
    - Success metrics
  </output-format>
</poml>
```

### Advanced: Conditional Logic

```xml
<poml>
  <role>Predictive lead scoring analyst</role>
  <task>Score and segment {{ leadList }} by conversion likelihood</task>
  
  <context>
    <var name="leadList">{{ leadList }}</var>
    <var name="leadScore">{{ leadScore }}</var>
    <var name="budget">{{ budget }}</var>
  </context>
  
  <instructions>
    {% for lead in leadList %}
      1. Calculate score using {{ predict }} with {{ leadScore }}
      
      {% if lead.score > 80 %}
        - Segment as "Hot" - immediate follow-up
        - Assign to top sales rep
        - Use premium {{ coldCallScript }}
      {% elif lead.score > 50 %}
        - Segment as "Warm" - nurture sequence
        - Add to drip campaign
        - Use standard {{ emailTemplate }}
      {% else %}
        - Segment as "Cold" - long-term nurture
        - Monthly newsletter only
      {% endif %}
      
      2. Check {{ budget }} alignment
      3. Add to appropriate {{ campaignName }}
    {% endfor %}
  </instructions>
  
  <output-format>
    Return segmented lists with:
    - Hot leads (immediate action)
    - Warm leads (nurture)
    - Cold leads (long-term)
  </output-format>
</poml>
```

## Variables in POML

### Platform Variables (Blue)
```xml
<var name="leadSource">{{ leadSource }}</var>
<var name="propertyType">{{ propertyType }}</var>
<var name="location">{{ location }}</var>
<var name="skipTraceStatus">{{ skipTraceStatus }}</var>
<var name="contactStatus">{{ contactStatus }}</var>
<var name="responseRate">{{ responseRate }}</var>
<var name="leadScore">{{ leadScore }}</var>
<var name="budget">{{ budget }}</var>
```

### Tools & Functions (Green)
```xml
{{ analyze }}          - Analyze data
{{ filter }}           - Filter records
{{ score }}            - Score leads
{{ segment }}          - Segment lists
{{ predict }}          - Predict outcomes
{{ enrich }}           - Enrich data
{{ createCampaign }}   - Create campaign
```

### Resource Calls (Purple)
```xml
{{ getLeadList }}      - Fetch lead data
{{ getPropertyData }}  - Fetch property info
{{ getMarketData }}    - Fetch market trends
{{ getCampaignData }}  - Fetch campaign stats
```

### Scripts & Templates (Rose)
```xml
{{ coldCallScript }}   - Cold call script
{{ emailTemplate }}    - Email template
{{ followUpScript }}   - Follow-up script
{{ objectionHandler }} - Objection handling
```

## Example Templates in Our Platform

### 1. High-Intent Investors

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
  
  <output-format>
    Return a ranked list of high-intent investor leads with scores
  </output-format>
</poml>
```

### 2. Multi-Channel Drip Campaign

```xml
<poml>
  <role>Multi-channel campaign orchestrator</role>
  <task>Create coordinated drip campaign {{ campaignName }}</task>
  
  <context>
    <var name="campaignName">{{ campaignName }}</var>
    <var name="leadList">{{ leadList }}</var>
    <var name="emailTemplate">{{ emailTemplate }}</var>
    <var name="coldCallScript">{{ coldCallScript }}</var>
    <var name="followUpScript">{{ followUpScript }}</var>
    <var name="responseRate">{{ responseRate }}</var>
    <var name="contactStatus">{{ contactStatus }}</var>
  </context>
  
  <instructions>
    1. {{ createCampaign }} {{ campaignName }} for {{ leadList }}
    2. Day 1: Send {{ emailTemplate }}
    3. Day 3: Execute {{ coldCallScript }}
    4. Day 7: If {{ responseRate }} < 10%, send {{ followUpScript }}
    5. Monitor {{ contactStatus }} throughout
  </instructions>
  
  <output-format>
    Return multi-channel sequence with timing and conditional logic
  </output-format>
</poml>
```

## POML Benefits for Our Platform

### 1. **Structured & Maintainable**
- Clear role and task separation
- Organized context and instructions
- Easy to update and version

### 2. **Data Integration**
- Variables auto-populated from platform
- Tools callable with `{{ toolName }}`
- Scripts reusable across prompts

### 3. **Conditional Logic**
- `{% if %}` for dynamic workflows
- `{% for %}` for batch processing
- Complex orchestration possible

### 4. **Color-Coded UI**
When you type POML:
- 🔵 `{{ leadSource }}` - Variables (blue)
- 🟢 `{{ analyze }}` - Tools (green)
- 🟣 `{{ getPropertyData }}` - Functions (purple)
- 🌹 `{{ coldCallScript }}` - Scripts (rose)

### 5. **Parseable & Executable**
- AI backend can parse XML structure
- Extract role, task, context
- Build execution graph
- Execute orchestrated workflow

## POML vs Plain Text

### Plain Text Prompt (Hard to Parse)
```
Analyze leads from the lead source where the skip trace status 
is complete, then filter by property type in the location and 
score them using response rate. Make sure to check contact 
status too. Return a list.
```

### POML Prompt (Structured & Clear)
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
  <output-format>Ranked lead list</output-format>
</poml>
```

## Official POML Resources

- **GitHub**: https://github.com/microsoft/poml
- **Documentation**: https://microsoft.github.io/poml/
- **VS Code Extension**: [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=Microsoft.poml)
- **npm Package**: `npm install pomljs`
- **Python Package**: `pip install poml`
- **Research Paper**: [arXiv:2508.13948](https://arxiv.org/abs/2508.13948)
- **Discord Community**: [Join Discord](https://discord.gg/poml)

## Implementation in Our Platform

### ChipTextarea Component
- Detects `{{ variable }}` patterns
- Color-codes by type (variable/tool/script/function)
- Shows chips below textarea
- Backspace deletes entire chip

### Starter Prompts
- 8 pre-built POML templates
- 4 Search creation prompts
- 4 Campaign creation prompts
- Categorized and filterable

### AI Chat Integration
- Passes POML prompt to AI chat
- Opens in new tab with context
- Tier-gated (Starter+)
- Border-beam animation

## Best Practices

### 1. Always Start with `<poml>`
Wrap all prompts in the root element

### 2. Define Clear Role & Task
```xml
<role>Specific, detailed persona</role>
<task>Clear, actionable objective</task>
```

### 3. Declare All Variables in Context
```xml
<context>
  <var name="x">{{ x }}</var>
  <var name="y">{{ y }}</var>
</context>
```

### 4. Number Your Instructions
Makes workflow clear and sequential

### 5. Specify Output Format
Tell AI exactly what structure you want

### 6. Use Conditionals for Logic
`{% if %}` and `{% for %}` for dynamic behavior

### 7. Add Constraints When Needed
```xml
<constraints>
  - No PII in output
  - Maximum 100 results
  - Sorted by score desc
</constraints>
```

## Future Enhancements

- [ ] POML syntax highlighting in textarea
- [ ] Auto-complete for POML tags
- [ ] POML validation before generation
- [ ] Template library browser
- [ ] Visual POML builder
- [ ] Import/export .poml files
- [ ] POML playground for testing

---

**POML brings structure, maintainability, and power to AI prompt engineering. Use it to create sophisticated, reusable workflows for your real estate platform!** 🚀
