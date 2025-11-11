# DealScale Intelligence Suite - Complete AI Agents Specification

> **20 AI Agents** for sales, outreach, and data-automation workflows  
> Based on A2A Protocol: https://github.com/a2aproject/A2A

## 🎯 Agent Categories

### Analysis & Evaluation (5 agents)
- Market Analyst
- Deal Evaluator
- Property Inspector
- Comp Researcher
- Title Researcher

### Communication & Outreach (7 agents)
- Negotiator
- Marketing Copywriter
- Call Qualifier
- Inbound Call Responder
- Text Nurturer
- Multi-Channel Outreach
- Social Engagement

### Automation & Orchestration (8 agents)
- Workflow Orchestrator
- Data Enricher
- Lookalike Audience Builder
- Campaign Orchestrator
- Lead Data Enrichment
- Performance Feedback
- Assistant-Orchestrator

---

## 📊 Complete Agent Reference Table

| Agent Name | Role & Purpose | Key Functions | Data-Backed Highlights |
|------------|---------------|---------------|------------------------|
| **Call Qualifier Agent** | Outbound qualification calls to new leads—book appointments & assess intent | Personalized greetings, timeline/motivation questions, schedule follow-up call | AI call agents reduce lead response time and boost qualification rates |
| **Inbound Call Responder Agent** | Handles incoming calls from leads—qualifies & routes hot leads | AI voice answer, ask property/owner questions, route to human or next step | Improves lead capture speed and reduces lost inbound leads |
| **Text Nurturer Agent** | SMS/WhatsApp follow-up & nurture for warm/idle leads | Short personalized texts, single CTA, scheduled follow-ups | Personalized SMS outreach increases engagement significantly |
| **Multi-Channel Outreach Agent** | Manages sequences across Email + Text + Voice + Social for lookalike audiences | Builds cross-channel flows, uses variables (property, owner, score), conducts outreach | Multi-channel outreach improves lead contact and conversion rates |
| **Social Engagement & Follow-Up Agent** | Social channel outreach (LinkedIn, FB Messenger, Insta DM) for lookalikes | DM sequence, qualification via social, trigger subsequent call/text | Social DM outreach opens new touch-points and broadens reach |
| **Lookalike Audience Builder Agent** | Builds targeted audiences based on seed leads & similarity | Embedding generation, similarity scoring, candidate filtering, audience export | AI similarity matching enables rapid audience expansion with higher precision |
| **Campaign Orchestrator Agent** | Orchestrates full campaigns from list import → enrichment → outreach → analysis | Create campaign, multi-channel config, scheduling, KPI tracking | Workflow orchestration improves efficiency and ensures end-to-end process automation |
| **Lead Data Enrichment Agent** | Automates skip tracing, enrichment, data validation | Bulk enrich lead list, verify contacts, append firmographic/intent signals | Enrichment improves lead quality and increases conversion potential |
| **Performance Feedback Agent** | Captures conversion outcomes and feeds back into models | Map candidate → conversion, update lead records, adjust model thresholds | Feedback loop essential for model improvement and continuous learning |
| **Assistant-Orchestrator Agent** | Manages agent-to-agent handoffs, routing logic, task triggers | Route from Inbound Call Agent to human, trigger Text Nurturer Agent, manage escalation | Multi-agent orchestration platforms improve cohesion and avoid silos |

---

## 🤖 Detailed Agent Specifications

### 1. Call Qualifier Agent

**POML Key**: `{{ callQualifier }}`

**Role**: Outbound qualification calls to assess lead intent and book appointments

**Input Schema**:
```typescript
{
  leadList: string[];
  callScript: string;
  qualificationCriteria: {
    timeline: "immediate" | "3-6_months" | "6-12_months" | "exploratory";
    motivation: string[];
    budget: number;
  };
  scheduleAppointment: boolean;
}
```

**Output Schema**:
```typescript
{
  callId: string;
  leadId: string;
  qualified: boolean;
  intent: "hot" | "warm" | "cold";
  timeline: string;
  motivation: string;
  appointmentBooked: boolean;
  nextAction: "schedule_call" | "text_follow_up" | "disqualify";
}
```

**KPI Targets**:
- Qualification Rate: >60%
- Appointment Booking Rate: >30%
- Average Call Duration: 3-5 minutes
- Intent Detection Accuracy: >85%

**POML Example**:
```xml
<poml>
  <role>Outbound sales qualification specialist</role>
  <task>Qualify {{ leadList }} and book appointments</task>
  
  <instructions>
    1. {{ callQualifier }} calls {{ leadList }}
    2. Use {{ coldCallScript }} for introduction
    3. Assess timeline, motivation, budget
    4. If qualified AND timeline < 3 months:
       - Book appointment
       - Add to {{ campaignName }}
    5. Else: Schedule {{ textNurturer }} follow-up
  </instructions>
  
  <output-format>
    Qualification report with intent scores and booked appointments
  </output-format>
</poml>
```

---

### 2. Inbound Call Responder Agent

**POML Key**: `{{ inboundCallResponder }}`

**Role**: Handles incoming calls, qualifies leads, and routes to appropriate next step

**Input Schema**:
```typescript
{
  callerId: string;
  propertyAddress?: string;
  leadSource: string;
  routingRules: {
    hotLeadThreshold: number;
    humanHandoffTriggers: string[];
  };
}
```

**Output Schema**:
```typescript
{
  callId: string;
  leadId: string;
  propertyInfo: object;
  qualification: "hot" | "warm" | "cold";
  routedTo: "human_agent" | "text_nurturer" | "campaign";
  transcriptSummary: string;
}
```

**KPI Targets**:
- Answer Rate: >95%
- Hot Lead Capture: >40%
- Human Handoff Rate: <20%
- Lead Loss Prevention: >90%

**POML Example**:
```xml
<poml>
  <role>Inbound call receptionist and qualifier</role>
  <task>Answer call from {{ caller }} and qualify lead</task>
  
  <instructions>
    1. {{ inboundCallResponder }} answers call
    2. Greet caller, ask about {{ propertyAddress }}
    3. {{ getPropertyData }} for {{ propertyAddress }}
    4. Qualify using {{ sellerIntentScore }}
    5. If {{ sellerIntentScore }} > 70:
       - Route to human agent immediately
    6. Else:
       - {{ textNurturer }} sends follow-up
       - Add to {{ campaignName }}
  </instructions>
  
  <output-format>
    Call summary with qualification and routing decision
  </output-format>
</poml>
```

---

### 3. Text Nurturer Agent

**POML Key**: `{{ textNurturer }}`

**Role**: SMS/WhatsApp nurture sequences for warm and idle leads

**Input Schema**:
```typescript
{
  leadList: string[];
  messageTemplate: string;
  schedule: {
    frequency: "daily" | "weekly" | "bi-weekly";
    touchpoints: number;
  };
  personalization: {
    variables: string[];
    dynamicContent: boolean;
  };
}
```

**Output Schema**:
```typescript
{
  campaignId: string;
  sentCount: number;
  deliveredCount: number;
  responseCount: number;
  responseRate: number;
  hotLeads: string[];
}
```

**KPI Targets**:
- Delivery Rate: >95%
- Response Rate: >25%
- Engagement Lift: >300% vs. no nurture
- Cost Per Response: <$2

**POML Example**:
```xml
<poml>
  <role>SMS nurture specialist</role>
  <task>Nurture {{ leadList }} via personalized text sequences</task>
  
  <context>
    <var name="leadList">{{ leadList }}</var>
    <var name="propertyType">{{ propertyType }}</var>
    <var name="location">{{ location }}</var>
  </context>
  
  <instructions>
    1. {{ textNurturer }} sends {{ followUpScript }}
    2. Personalize with {{ propertyType }} and {{ location }}
    3. Day 1: Initial outreach
    4. Day 3: Value proposition
    5. Day 7: Case study
    6. Track {{ responseRate }}
    7. If response: {{ callQualifier }} follows up
  </instructions>
  
  <output-format>
    Nurture campaign report with responses and hot leads
  </output-format>
</poml>
```

---

### 4. Multi-Channel Outreach Agent

**POML Key**: `{{ multiChannelOutreach }}`

**Role**: Orchestrates Email + Text + Voice + Social sequences

**Input Schema**:
```typescript
{
  leadList: string[];
  channels: ("email" | "sms" | "voice" | "social")[];
  sequence: {
    day: number;
    channel: string;
    template: string;
    condition?: string;
  }[];
  variables: Record<string, string>;
}
```

**Output Schema**:
```typescript
{
  campaignId: string;
  channelPerformance: {
    channel: string;
    sent: number;
    delivered: number;
    opened: number;
    responded: number;
  }[];
  overallResponseRate: number;
  bestPerformingChannel: string;
}
```

**KPI Targets**:
- Cross-Channel Lift: >150% vs. single channel
- Overall Response Rate: >35%
- Channel Optimization Time: <48 hours
- Cost Per Lead: 40% reduction

**POML Example**:
```xml
<poml>
  <role>Multi-channel campaign manager</role>
  <task>Execute coordinated outreach for {{ leadList }}</task>
  
  <instructions>
    1. {{ multiChannelOutreach }} builds sequence:
       - Day 1: {{ emailTemplate }}
       - Day 2: {{ textOutreach }} if not opened
       - Day 4: {{ callQualifier }} if no response
       - Day 7: Social DM via {{ socialEngagement }}
    
    2. Personalize all with {{ propertyType }}, {{ location }}, {{ leadScore }}
    
    3. {{ trackPerformance }} by channel
    
    4. Optimize: Prioritize best-performing channel
    
    5. Hot leads → {{ campaignOrchestrator }} for immediate follow-up
  </instructions>
  
  <output-format>
    Multi-channel performance report with lead status
  </output-format>
</poml>
```

---

### 5. Social Engagement & Follow-Up Agent

**POML Key**: `{{ socialEngagement }}`

**Role**: LinkedIn, Facebook Messenger, Instagram DM outreach

**Input Schema**:
```typescript
{
  leadList: string[];
  platform: "linkedin" | "facebook" | "instagram";
  dmSequence: {
    message: string;
    timing: number;
  }[];
  qualificationTriggers: string[];
}
```

**Output Schema**:
```typescript
{
  campaignId: string;
  dmsSent: number;
  responsesReceived: number;
  conversationsQualified: number;
  nextStepActions: {
    leadId: string;
    action: "call" | "text" | "email" | "disqualify";
  }[];
}
```

**KPI Targets**:
- DM Response Rate: >15%
- Conversation Start Rate: >20%
- Qualification Rate from Social: >10%
- New Touchpoint Coverage: +30%

**POML Example**:
```xml
<poml>
  <role>Social media outreach specialist</role>
  <task>Engage {{ leadList }} via LinkedIn DMs</task>
  
  <instructions>
    1. {{ socialEngagement }} sends DM sequence on LinkedIn
    2. Message 1: Personalized connection + value prop
    3. Message 2 (if response): Qualification questions
    4. If qualified via DM:
       - {{ callQualifier }} schedules call
    5. If no response after 3 DMs:
       - {{ textNurturer }} tries SMS
  </instructions>
  
  <output-format>
    Social engagement report with qualified leads
  </output-format>
</poml>
```

---

### 6. Lookalike Audience Builder Agent

**POML Key**: `{{ lookalikeBuilder }}`

**Role**: Builds targeted audiences using similarity scoring and embeddings

**Input Schema**:
```typescript
{
  seedList: string[];
  candidateUniverse: string[];
  similarityThreshold: number;
  maxAudienceSize: number;
  features: string[];
}
```

**Output Schema**:
```typescript
{
  audienceId: string;
  seedCount: number;
  candidatesScored: number;
  audienceSize: number;
  avgSimilarityScore: number;
  audienceExport: string[];
}
```

**KPI Targets**:
- Similarity Accuracy: >90%
- Audience Build Time: <5 minutes for 100K candidates
- Conversion Lift: >200% vs. random targeting
- Precision @ 1000: >85%

**POML Example**:
```xml
<poml>
  <role>AI-powered audience targeting specialist</role>
  <task>Build lookalike audience from {{ seedList }}</task>
  
  <instructions>
    1. {{ lookalikeBuilder }} generates embeddings for {{ seedList }}
    2. {{ scoreLookalike }} on all candidates in universe
    3. {{ filter }} where similarityScore >= 0.85
    4. Take top 1000 by score
    5. {{ segment }} by {{ location }} and {{ propertyType }}
    6. {{ exportAudience }} to {{ campaignOrchestrator }}
  </instructions>
  
  <output-format>
    Lookalike audience with similarity scores and segmentation
  </output-format>
</poml>
```

---

### 7. Campaign Orchestrator Agent

**POML Key**: `{{ campaignOrchestrator }}`

**Role**: End-to-end campaign automation from import to analysis

**Input Schema**:
```typescript
{
  campaignName: string;
  leadListSource: string;
  enrichmentConfig: object;
  outreachChannels: string[];
  schedule: object;
  kpiTargets: object;
}
```

**Output Schema**:
```typescript
{
  campaignId: string;
  status: "active" | "paused" | "completed";
  leadsProcessed: number;
  outreachSent: number;
  responsesReceived: number;
  conversions: number;
  roi: number;
}
```

**KPI Targets**:
- Campaign Setup Time: <15 minutes
- Automation Coverage: >90% of workflows
- ROI Tracking Accuracy: >95%
- Process Efficiency Gain: >300%

**POML Example**:
```xml
<poml>
  <role>Campaign automation orchestrator</role>
  <task>Execute full campaign {{ campaignName }}</task>
  
  <instructions>
    1. {{ campaignOrchestrator }} imports {{ leadList }}
    
    2. {{ leadEnrichment }} enriches all leads
    
    3. {{ lookalikeBuilder }} expands audience
    
    4. {{ segment }} by {{ sellerIntentScore }}:
       - Hot (80+): {{ callQualifier }} immediate
       - Warm (50-79): {{ multiChannelOutreach }}
       - Cold (<50): {{ textNurturer }} long-term
    
    5. {{ trackPerformance }} daily
    
    6. {{ performanceFeedback }} updates models
    
    7. Auto-optimize channel mix based on {{ responseRate }}
  </instructions>
  
  <output-format>
    Campaign dashboard with ROI, conversions, and optimizations
  </output-format>
</poml>
```

---

### 8. Lead Data Enrichment Agent

**POML Key**: `{{ leadEnrichment }}`

**Role**: Automates skip tracing, enrichment, and data validation

**Input Schema**:
```typescript
{
  leadList: string[];
  enrichmentFields: string[];
  validationRules: object;
  enrichmentProviders: string[];
}
```

**Output Schema**:
```typescript
{
  enrichmentId: string;
  totalLeads: number;
  enrichedLeads: number;
  enrichmentRate: number;
  newFieldsAdded: string[];
  dataQualityScore: number;
}
```

**KPI Targets**:
- Enrichment Rate: >85%
- Data Accuracy: >95%
- Processing Time: <1 minute per 1000 leads
- Cost Per Enriched Lead: <$0.50

**POML Example**:
```xml
<poml>
  <role>Data enrichment and validation specialist</role>
  <task>Enrich {{ leadList }} with complete contact data</task>
  
  <instructions>
    1. {{ leadEnrichment }} processes {{ leadList }}
    2. {{ bulkEnrich }} missing fields:
       - Phone numbers
       - Email addresses
       - Property ownership data
       - {{ estimatedEquityPercentage }}
       - {{ ownerTimeInProperty }}
    3. Validate all contact data
    4. {{ filter }} invalid/incomplete records
    5. Return enriched {{ leadList }}
  </instructions>
  
  <output-format>
    Enriched lead list with completeness score
  </output-format>
</poml>
```

---

### 9. Performance Feedback Agent

**POML Key**: `{{ performanceFeedback }}`

**Role**: Captures conversions and feeds back into ML models

**Input Schema**:
```typescript
{
  leadId: string;
  conversionEvent: "appointment" | "contract" | "close";
  conversionValue: number;
  campaignId: string;
  touchpoints: object[];
}
```

**Output Schema**:
```typescript
{
  feedbackId: string;
  modelUpdated: boolean;
  newThresholds: object;
  predictedImpact: string;
  recommendedAdjustments: string[];
}
```

**KPI Targets**:
- Feedback Loop Time: <24 hours
- Model Improvement Rate: +5% per month
- Prediction Accuracy Lift: >15%
- Attribution Accuracy: >90%

**POML Example**:
```xml
<poml>
  <role>ML model optimizer and feedback processor</role>
  <task>Update models based on conversion for {{ leadId }}</task>
  
  <instructions>
    1. {{ performanceFeedback }} receives conversion event
    2. Map {{ leadId }} to original {{ seedList }}
    3. Update {{ scoreLookalike }} model with outcome
    4. Adjust {{ sellerIntentScore }} thresholds
    5. Recalibrate {{ leadScore }} weights
    6. {{ lookalikeBuilder }} uses updated model
    7. Generate optimization report
  </instructions>
  
  <output-format>
    Model update summary with predicted performance improvements
  </output-format>
</poml>
```

---

### 10. Assistant-Orchestrator Agent

**POML Key**: `{{ assistantOrchestrator }}`

**Role**: Manages agent-to-agent handoffs and routing logic

**Input Schema**:
```typescript
{
  triggerEvent: string;
  sourceAgent: string;
  leadId: string;
  context: object;
  routingRules: object;
}
```

**Output Schema**:
```typescript
{
  routingId: string;
  sourceAgent: string;
  targetAgent: string;
  handoffCompleted: boolean;
  context Preserved: boolean;
  nextActions: string[];
}
```

**KPI Targets**:
- Handoff Success Rate: >98%
- Context Preservation: 100%
- Average Handoff Time: <2 seconds
- Agent Coordination Efficiency: >95%

**POML Example**:
```xml
<poml>
  <role>Multi-agent coordination and routing manager</role>
  <task>Orchestrate agent handoffs for {{ leadId }}</task>
  
  <instructions>
    1. {{ assistantOrchestrator }} receives event from {{ inboundCallResponder }}
    
    2. Check {{ sellerIntentScore }}:
       - If Hot (80+): Route to human agent
       - If Warm (50-79): {{ textNurturer }} schedules follow-up
       - If Cold (<50): {{ campaignOrchestrator }} long-term nurture
    
    3. Preserve full context:
       - Call transcript
       - Property data from {{ getPropertyData }}
       - Intent signals
    
    4. Trigger next agent with context
    
    5. Monitor handoff completion
    
    6. {{ trackPerformance }} agent coordination
  </instructions>
  
  <output-format>
    Routing log with agent transitions and context flow
  </output-format>
</poml>
```

---

## 🔗 Agent Orchestration Patterns

### Pattern 1: Inbound Lead → Qualification → Nurture
```
{{ inboundCallResponder }} 
  → {{ assistantOrchestrator }} 
  → IF hot: Human Agent
  → IF warm: {{ textNurturer }}
  → IF cold: {{ campaignOrchestrator }}
```

### Pattern 2: Campaign Launch → Multi-Channel → Follow-up
```
{{ campaignOrchestrator }}
  → {{ leadEnrichment }}
  → {{ lookalikeBuilder }}
  → {{ multiChannelOutreach }}
  → {{ assistantOrchestrator }}
  → {{ callQualifier }} OR {{ textNurturer }}
```

### Pattern 3: Feedback Loop → Model Improvement
```
Conversion Event
  → {{ performanceFeedback }}
  → Updates {{ lookalikeBuilder }} model
  → Improves {{ scoreLookalike }} accuracy
  → Better {{ campaignOrchestrator }} targeting
```

---

## 📚 Additional Resources

- **A2A Protocol**: https://github.com/a2aproject/A2A
- **POML Docs**: https://microsoft.github.io/poml/
- **MCP Integration**: https://modelcontextprotocol.io
- **AI Orchestration Best Practices**: https://www.domo.com/learn/article/best-ai-orchestration-platforms

---

## 🎯 Implementation Priority

### Phase 1 (High Impact, Core Functions)
1. Campaign Orchestrator Agent
2. Lead Data Enrichment Agent
3. Multi-Channel Outreach Agent
4. Lookalike Audience Builder Agent

### Phase 2 (Outreach Expansion)
5. Call Qualifier Agent
6. Text Nurturer Agent
7. Inbound Call Responder Agent

### Phase 3 (Advanced Features)
8. Social Engagement Agent
9. Performance Feedback Agent
10. Assistant-Orchestrator Agent

---

**Total: 20 AI Agents** ready for DealScale Intelligence Suite 🚀

