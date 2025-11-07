# AI Tools & Functions Reference

Complete reference for all tools and functions available in the AI Prompt system.

## 🔧 Tools (Actions)

Tools perform operations and actions on your data.

### Core Analysis Tools

| Tool | Description | Example Usage |
|------|-------------|---------------|
| `{{ analyze }}` | Analyze lead patterns and behavior | `{{ analyze }} {{ leadList }} for high-intent signals` |
| `{{ filter }}` | Apply smart filtering logic | `{{ filter }} {{ leadList }} WHERE {{ location }} = "Austin, TX"` |
| `{{ score }}` | Calculate lead quality scores | `{{ score }} {{ leadList }} USING {{ responseRate }}` |
| `{{ enrich }}` | Add data enrichment | `{{ enrich }} {{ leadList }} WITH {{ getPropertyData }}` |
| `{{ segment }}` | Create audience segments | `{{ segment }} {{ leadList }} BY {{ leadScore }}` |
| `{{ predict }}` | Predict conversion likelihood | `{{ predict }} CONVERSION FOR {{ leadList }}` |

### Campaign & Outreach Tools

| Tool | Description | Inputs | Outputs |
|------|-------------|--------|---------|
| `{{ createCampaign }}` | Set up multi-channel campaign with targeting | campaignName, leadListID, channelConfig | campaignID + status |
| `{{ textOutreach }}` | Send automated SMS to filtered leads | messageTemplate, leadListID | sendReport (delivered, failed) |
| `{{ callOutreach }}` | Schedule AI-powered voice calls | scriptTemplate, leadListID | callReport (connected, left-vm) |
| `{{ trackPerformance }}` | Monitor campaign metrics | campaignID | performanceDashboard object |

### Data Processing Tools

| Tool | Description | Inputs | Outputs |
|------|-------------|--------|---------|
| `{{ bulkEnrich }}` | Trigger skip tracing for bulk leads | leadListID | enrichmentReport (matched, unmatched) |
| `{{ exportAudience }}` | Export to ad networks or CRM | audienceID, platform, credentials | exportJobID + status |

## 📊 Functions (Resource Calls)

Functions fetch data and resources from the platform.

### Lead & List Functions

| Function | Description | Inputs | Outputs |
|----------|-------------|--------|---------|
| `{{ getLeadList }}` | Fetch lead list by ID or name | leadListID or name | Lead list object |
| `{{ analyzeLeadList }}` | Analyze list for key attributes | leadList | Summary metrics + recommended fields |
| `{{ filterProspects }}` | Apply filter rules to narrow prospects | filter rules (JSON) | Filtered lead set / list ID |
| `{{ scoreLookalike }}` | Compute similarity scores | seedListID, candidateListID | List of prospect IDs + similarityScore |

### Data & Market Functions

| Function | Description | Inputs | Outputs |
|----------|-------------|--------|---------|
| `{{ getCampaignData }}` | Retrieve campaign performance | campaignID | Performance metrics object |
| `{{ getPropertyData }}` | Fetch property info and valuations | propertyID or address | Property data object |
| `{{ getMarketData }}` | Retrieve market trends | location, propertyType | Market statistics |
| `{{ webSearchProspects }}` | Fetch public data via web search | leadListID, searchCriteria | enrichedRecords |

## 🤖 AI Agents (A2A Protocol)

AI Agents orchestrate complex workflows using the A2A protocol.

| Agent | Description | Skills |
|-------|-------------|--------|
| `{{ marketAnalyst }}` | Analyzes market trends and pricing | market_analysis, trend_prediction, price_forecasting |
| `{{ dealEvaluator }}` | Evaluates deals and calculates ROI | deal_evaluation, roi_calculation, risk_assessment |
| `{{ propertyInspector }}` | Analyzes property data and costs | property_inspection, repair_estimation, condition_analysis |
| `{{ negotiator }}` | Crafts negotiation strategies | negotiation, persuasion, objection_handling |
| `{{ copywriter }}` | Generates marketing copy | copywriting, email_generation, property_descriptions |
| `{{ compResearcher }}` | Researches comparable properties | comp_research, cma_generation, property_comparison |
| `{{ titleResearcher }}` | Researches titles and liens | title_research, lien_check, ownership_history |
| `{{ workflowOrchestrator }}` | Orchestrates multi-step workflows | workflow_orchestration, task_delegation, pipeline_management |
| `{{ dataEnricher }}` | Enriches lead and property data | data_enrichment, skip_trace, contact_discovery |

## 📝 Example POML Prompts

### Example 1: Lead Analysis & Filtering

```xml
<poml>
  <role>Lead generation specialist</role>
  <task>Find high-intent investors in {{ location }}</task>
  
  <instructions>
    1. {{ analyzeLeadList }} for {{ leadList }}
    2. {{ filterProspects }} WHERE:
       - {{ location }} = "Austin, TX"
       - {{ leadScore }} > 75
       - {{ propertyType }} IN ['single_family', 'multi_family']
    3. {{ score }} filtered prospects
    4. Return top 100 ranked by {{ leadScore }}
  </instructions>
  
  <output-format>
    Ranked list with lead ID, score, and key attributes
  </output-format>
</poml>
```

### Example 2: Lookalike Campaign

```xml
<poml>
  <role>Campaign strategist</role>
  <task>Create lookalike campaign for {{ leadList }}</task>
  
  <instructions>
    1. {{ scoreLookalike }} on {{ leadList }} (seed) vs all prospects
    2. {{ filter }} where similarityScore >= 0.85
    3. {{ segment }} by {{ location }} and {{ budget }}
    4. {{ createCampaign }} named {{ campaignName }}
    5. Setup {{ textOutreach }} with {{ followUpScript }}
    6. {{ trackPerformance }} daily
  </instructions>
  
  <output-format>
    Campaign ID, target count, expected reach
  </output-format>
</poml>
```

### Example 3: Multi-Channel Outreach

```xml
<poml>
  <role>Outreach automation specialist</role>
  <task>Execute multi-touch campaign for {{ leadList }}</task>
  
  <instructions>
    1. {{ bulkEnrich }} {{ leadList }} for complete contact data
    2. {{ segment }} by {{ sellerIntentScore }}:
       - High (80+): {{ callOutreach }} with {{ coldCallScript }}
       - Medium (50-79): {{ textOutreach }} with {{ followUpScript }}
       - Low (<50): Skip
    3. Day 3: {{ textOutreach }} for non-responders
    4. {{ trackPerformance }} and adjust
    5. {{ exportAudience }} successful leads to CRM
  </instructions>
  
  <output-format>
    Outreach report with delivered, opened, responded counts
  </output-format>
</poml>
```

### Example 4: Market Analysis with Agent

```xml
<poml>
  <role>Real estate market analyst</role>
  <task>Comprehensive market analysis for {{ location }}</task>
  
  <instructions>
    1. {{ marketAnalyst }} analyzes {{ getMarketData }} for {{ location }}
    2. {{ compResearcher }} finds comps for {{ propertyType }}
    3. {{ filter }} prospects where:
       - {{ estimatedEquityPercentage }} > 40
       - {{ ownerTimeInProperty }} > 7 years
       - {{ isOutOfStateOwner }} = true
    4. {{ dealEvaluator }} scores each opportunity
    5. Return top 50 deals
  </instructions>
  
  <output-format>
    Market summary + ranked deal list with ROI projections
  </output-format>
</poml>
```

### Example 5: Advanced Targeting

```xml
<poml>
  <role>Precision targeting specialist</role>
  <task>Build ultra-targeted campaign for motivated sellers</task>
  
  <context>
    <var name="leadList">{{ leadList }}</var>
    <var name="location">{{ location }}</var>
    <var name="vertical">{{ vertical }}</var>
  </context>
  
  <instructions>
    1. {{ analyzeLeadList }} to identify data gaps
    2. {{ bulkEnrich }} missing fields
    3. {{ filterProspects }} with complex rules:
       - {{ location }} within 50 miles of target
       - {{ ownerTimeInProperty }} > 10 years
       - {{ estimatedEquityPercentage }} > 50%
       - {{ sellerIntentScore }} > 60
       - {{ contactStatus }} NOT 'dnc'
       - {{ lastContactedDaysAgo }} > 30 OR never contacted
    
    4. {{ scoreLookalike }} against seed list
    5. Take top 200 with similarityScore > 0.85
    
    6. {{ propertyInspector }} estimates deal potential
    7. {{ segment }} into Hot/Warm/Cold tiers
    
    8. {{ createCampaign }} for {{ vertical }} with:
       - Hot: Immediate {{ callOutreach }}
       - Warm: {{ textOutreach }} → call in 48h
       - Cold: Email nurture only
    
    9. {{ trackPerformance }} with alerts
    10. {{ exportAudience }} to {{ vertical }}-specific CRM
  </instructions>
  
  <constraints>
    - Maximum 3 touches per lead in 14 days
    - Respect timezone for calls (9am-6pm local)
    - DNC list always excluded
  </constraints>
  
  <output-format>
    Campaign ID, tier breakdown, projected response rates by {{ vertical }}
  </output-format>
</poml>
```

## 🎯 Best Practices

### 1. **Explicit Tool Names**
Always use explicit tool/function names for clarity:
```xml
✅ Good: {{ filterProspects }} WHERE {{ leadScore }} > 75
❌ Bad: Filter the prospects with high scores
```

### 2. **Chain Operations**
Use `THEN` to chain sequential operations:
```xml
{{ analyze }} {{ leadList }} THEN {{ filter }} THEN {{ score }} THEN {{ segment }}
```

### 3. **Combine Tools & Agents**
Mix tools with AI agents for complex workflows:
```xml
{{ marketAnalyst }} performs {{ getMarketData }}
THEN {{ filter }} using insights
THEN {{ dealEvaluator }} scores results
```

### 4. **Use Variables**
Reference variables for dynamic values:
```xml
{{ filter }} {{ leadList }} WHERE {{ location }} = {{ targetMarket }}
```

### 5. **Specify Outputs**
Always define expected outputs:
```xml
<output-format>
  Return: campaignID, leadCount, estimatedReach, costPerLead
</output-format>
```

## 📚 Additional Resources

- **POML Docs**: https://microsoft.github.io/poml/
- **A2A Protocol**: https://github.com/a2aproject/A2A
- **Tool Calling Best Practices**: See platform documentation

---

**All tools, functions, and agents are color-coded in the UI:**
- 🔵 Variables (blue)
- 🟢 Tools (green)
- 🟣 Functions (purple)
- 🟠 Agents (orange)
- 🌹 Scripts (rose)

