/**
 * User Prompts Store
 * Manages saved and template prompts for AI generation
 * Based on MIT Sloan prompt engineering best practices
 */

import { create } from "zustand";

export type PromptCategory =
	| "audience_search"
	| "campaign"
	| "outreach"
	| "enrichment"
	| "analytics"
	| "workflow"
	| "custom";

export interface PromptTemplate {
	id: string;
	name: string;
	description: string;
	category: PromptCategory;
	content: string;
	variables: string[];
	tags: string[];
	isBuiltIn: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface UserPrompt {
	id: string;
	name: string;
	content: string;
	category: PromptCategory;
	variables: string[];
	tags: string[];
	favorite: boolean;
	usageCount: number;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Built-in Prompt Templates
 * Based on MIT Sloan prompt engineering best practices
 * Reference: https://mitsloanedtech.mit.edu/ai/basics/effective-prompts/
 */
const BUILT_IN_TEMPLATES: PromptTemplate[] = [
	// === MASTER LOOKALIKE PROMPT ===
	{
		id: "master_lookalike_orchestration",
		name: "🌟 Master Look-Alike Orchestration",
		description:
			"Complete A2A + MCP orchestrated pipeline with multi-agent workflow",
		category: "audience_search",
		content: `<poml>
  <meta>
    <title>DealScale A2A MCP Orchestrated Look-Alike Pipeline</title>
    <version>2.0</version>
    <author>DealScale Intelligence Suite</author>
  </meta>

  <!-- 1️⃣ GLOBAL CONTEXT -->
  <context>
    <role>You are the Master Coordination Agent inside DealScale's Multi-Agent Control Plane (MCP).</role>
    <goal>
      Use collaborative agent-to-agent communication (A2A protocol) to generate,
      enrich, and activate look-alike audiences across outreach channels.
    </goal>
  </context>

  <!-- 2️⃣ SHARED MEMORY -->
  <memory>
    <store name="leadData" persist="true" />
    <store name="campaignContext" persist="true" />
    <store name="modelState" persist="true" />
  </memory>

  <!-- 3️⃣ VARIABLES -->
  <variables>
    {{ tenantId }}
    {{ leadList }}
    {{ leadSource }}
    {{ campaignName }}
    {{ skipTraceStatus }}
    {{ leadScore }}
    {{ contactStatus }}
    {{ propertyType }}
    {{ location }}
    {{ budget }}
    {{ ownerTimeInProperty }}
    {{ estimatedEquityPercentage }}
    {{ isOutOfStateOwner }}
    {{ sellerIntentScore }}
  </variables>

  <!-- 4️⃣ MCP-REGISTERED FUNCTIONS (TOOLS) -->
  <functions>
    <function id="analyzeLeadList" endpoint="leads.analyze" />
    <function id="bulkEnrich" endpoint="leads.enrich" />
    <function id="scoreLookalike" endpoint="audience.similarity" />
    <function id="filterProspects" endpoint="audience.filter" />
    <function id="exportAudience" endpoint="audience.export" />
    <function id="callOutreach" endpoint="outreach.call" />
    <function id="textOutreach" endpoint="outreach.text" />
    <function id="trackPerformance" endpoint="campaign.performance" />
  </functions>

  <!-- 5️⃣ A2A AGENTS REGISTRY -->
  <agents>
    <agent name="DataEngineer" role="Lead Enrichment" capability="call bulkEnrich" />
    <agent name="AudienceArchitect" role="Look-Alike Generation" capability="call scoreLookalike, filterProspects" />
    <agent name="CampaignOrchestrator" role="Cross-channel Sequencing" capability="call exportAudience, trackPerformance" />
    <agent name="CallQualifier" role="Voice Outreach" capability="call callOutreach" />
    <agent name="TextNurturer" role="SMS/WhatsApp Nurture" capability="call textOutreach" />
    <agent name="FeedbackLoop" role="Learning & Optimization" capability="call trackPerformance" />
  </agents>

  <!-- 6️⃣ SALES SCRIPT LIBRARY (AS PROMPT MODULES) -->
  <scripts>
    <script id="voice.qualify">
      Hi {{ prospectFirstName }}, this is {{ agentName }} from DealScale. I noticed your property at {{ propertyAddress }} in {{ location }}.
      You've owned it {{ ownerTimeInProperty }} years — are you open to exploring an off-market option while buyer demand is high?
    </script>
    <script id="sms.followup">
      Hi {{ prospectFirstName }}, it's {{ agentName }} at DealScale.
      We're helping owners in {{ location }} find off-market offers — quick 10-min chat this week?
    </script>
  </scripts>

  <!-- 7️⃣ MCP A2A WORKFLOW -->
  <workflow id="lookalike_orchestration">
    <phase id="1" label="Ingest & Analyze">
      <call agent="DataEngineer" function="analyzeLeadList" with="leadList={{ leadList }}" />
      <save to="leadData" />
    </phase>

    <phase id="2" label="Enrich">
      <handoff from="DataEngineer" to="AudienceArchitect" protocol="A2A">
        <context-ref>leadData</context-ref>
        <call function="bulkEnrich" with="leadList={{ leadList }}" />
        <output to="leadData.enriched" />
      </handoff>
    </phase>

    <phase id="3" label="Generate Look-Alike Audience">
      <call agent="AudienceArchitect" function="scoreLookalike" with="seedListID={{ leadList }}, filters:{location:'{{ location }}', propertyType:'{{ propertyType }}'}" />
      <save to="modelState.similarity" />
      <call function="filterProspects" with="filterRules:{equity:>{{ estimatedEquityPercentage }}, ownerTime:>{{ ownerTimeInProperty }}}" />
      <output to="campaignContext.audience" />
    </phase>

    <phase id="4" label="Export & Launch">
      <handoff from="AudienceArchitect" to="CampaignOrchestrator" protocol="A2A">
        <context-ref>campaignContext.audience</context-ref>
        <call function="exportAudience" with="audienceID={{ campaignContext.audience }}, platform:'CRM'" />
      </handoff>
      <parallel>
        <call agent="CallQualifier" function="callOutreach" with="script=voice.qualify, leadListID={{ campaignContext.audience }}" />
        <call agent="TextNurturer" function="textOutreach" with="message=sms.followup, leadListID={{ campaignContext.audience }}" />
      </parallel>
    </phase>

    <phase id="5" label="Feedback & Optimization">
      <handoff from="CampaignOrchestrator" to="FeedbackLoop" protocol="A2A">
        <context-ref>campaignContext</context-ref>
        <call function="trackPerformance" with="campaignID={{ campaignName }}" />
      </handoff>
      <prompt>
        You are the Optimization Analyst.
        Analyze performance results in {{ campaignContext.performance }}.
        If conversionRate < 5%, decrease similarity threshold by 0.03.
        If responseRate < 10%, widen {{ location }} radius by 10 mi.
        Return updated config JSON.
      </prompt>
      <save to="modelState.optimizedConfig" />
    </phase>

    <phase id="6" label="Self-Retrain">
      <call agent="AudienceArchitect" function="scoreLookalike"
            with="seedListID={{ positiveConversions }}, retrain=true, tenantId={{ tenantId }}" />
      <output to="modelState.newModelVersion" />
    </phase>
  </workflow>

  <!-- 8️⃣ A2A FEEDBACK CHANNELS -->
  <feedback>
    <channel source="FeedbackLoop" target="AudienceArchitect" trigger="model.performanceUpdate" />
    <channel source="FeedbackLoop" target="DataEngineer" trigger="enrichmentGapDetected" />
  </feedback>

  <!-- 9️⃣ OUTPUT CONTRACT -->
  <output-format>
    <summary>
      • Audience size & similarity distribution
      • Outreach engagement metrics (call/text/social)
      • Model performance delta & retrain schedule
    </summary>
    <data json="modelState.optimizedConfig" />
  </output-format>
</poml>`,
		variables: [
			"tenantId",
			"leadList",
			"leadSource",
			"campaignName",
			"skipTraceStatus",
			"leadScore",
			"contactStatus",
			"propertyType",
			"location",
			"budget",
			"ownerTimeInProperty",
			"estimatedEquityPercentage",
			"isOutOfStateOwner",
			"sellerIntentScore",
			"prospectFirstName",
			"agentName",
			"propertyAddress",
		],
		tags: [
			"master",
			"orchestration",
			"a2a",
			"mcp",
			"complete-pipeline",
			"featured",
		],
		isBuiltIn: true,
	},

	// === LOOKALIKE AUDIENCE SEARCH PROMPTS (10) ===
	{
		id: "baseline_lookalike_wholesaler",
		name: "Baseline Look-Alike (Wholesalers)",
		description:
			"Real estate wholesaler lookalike search with equity and intent focus",
		category: "audience_search",
		content: `You are a real-estate data intelligence analyst at DealScale.

Using these lead variables:
• Lead Source: {{ leadSource }}
• Campaign Name: {{ campaignName }}
• Lead List: {{ leadList }}
• Location: {{ location }}
• Property Type: {{ propertyType }}
• Budget: {{ budget }}
• Estimated Equity %: {{ estimatedEquityPercentage }}
• Owner Time in Property: {{ ownerTimeInProperty }} years
• Seller Intent Score: {{ sellerIntentScore }}
• Skip Trace Status: {{ skipTraceStatus }}

Task: Generate a **look-alike audience search configuration** that identifies new property owners similar to our top 10 performing leads from {{ leadList }}.

Guidelines:
- Prioritize owners with equity above {{ estimatedEquityPercentage }}%.
- Focus within a 25-mile radius of {{ location }}.
- Filter by property type {{ propertyType }}.
- Use "ownerTimeInProperty" and "intentScore" similarity.
- Return the top 3 data sources (MLS, public records, ads).

Output Format:
1️⃣ Target Audience Description
2️⃣ Search Filters (as JSON-style key:value pairs)
3️⃣ Estimated Audience Size (numeric)
4️⃣ Recommended Outreach Strategy (email/text/call ratio)`,
		variables: [
			"leadSource",
			"campaignName",
			"leadList",
			"location",
			"propertyType",
			"budget",
			"estimatedEquityPercentage",
			"ownerTimeInProperty",
			"sellerIntentScore",
			"skipTraceStatus",
		],
		tags: ["wholesaler", "equity", "intent", "lookalike"],
		isBuiltIn: true,
	},
	{
		id: "investor_focused_lookalike",
		name: "Investor-Focused Look-Alike",
		description: "Investment property lookalike with market velocity analysis",
		category: "audience_search",
		content: `You are an investment intelligence specialist for DealScale's AI platform.

Given:
• Location = {{ location }}
• Property Type = {{ propertyType }}
• Avg Deal Value = {{ budget }}
• Lead Score = {{ leadScore }}
• Seller Intent Score = {{ sellerIntentScore }}
• Estimated Equity % = {{ estimatedEquityPercentage }}

Task:
Find property owners **most similar to our recently closed off-market deals**, based on ownership duration, equity, and local market velocity.

Return:
1. Audience description (who & where)
2. Filters:
   - ownerTimeInProperty ± 2 years of avg seed group
   - estimatedEquityPercentage ≥ 75%
   - locationRadius ≤ 15mi
3. Size & reach estimate
4. Confidence score for similarity
5. Suggested campaign type (Direct Call / AI Text / Social Retarget)`,
		variables: [
			"location",
			"propertyType",
			"budget",
			"leadScore",
			"sellerIntentScore",
			"estimatedEquityPercentage",
			"ownerTimeInProperty",
		],
		tags: ["investor", "closed-deals", "market-velocity", "lookalike"],
		isBuiltIn: true,
	},
	{
		id: "agent_broker_crm_lookalike",
		name: "Agent/Broker CRM Look-Alike",
		description: "CRM-integrated lookalike search with vector similarity",
		category: "audience_search",
		content: `You are a CRM-integrated AI targeting engineer for DealScale.

Input:
- leadSource = {{ leadSource }}
- contactStatus = {{ contactStatus }}
- leadScore = {{ leadScore }}
- campaignName = {{ campaignName }}

Goal:
Identify **CRM contacts** who resemble high-performing past clients and sync them into a new campaign called {{ campaignName }}-Expansion.

Process:
1. Filter CRM dataset where:
   • leadScore ≥ 70
   • contactStatus = "Engaged"
2. Vector search using top 10 "Closed Deal" embeddings
3. Return look-alike IDs ranked by cosine similarity ≥ 0.8

Output:
• JSON array of top matches with similarity score
• "Audience Summary" in plain English
• Recommended channel activation (SMS, Voice, Email)`,
		variables: ["leadSource", "contactStatus", "leadScore", "campaignName"],
		tags: ["agent", "broker", "crm", "vector-search", "lookalike"],
		isBuiltIn: true,
	},
	{
		id: "geo_targeted_ad_export",
		name: "Geo-Targeted Look-Alike (Ad Export)",
		description: "Geographic expansion with ad platform export optimization",
		category: "audience_search",
		content: `You are a geographic AI analyst at DealScale.

Inputs:
• Base Lead List = {{ leadList }}
• Primary Location = {{ location }}
• Geo Radius = 30 miles
• Property Type = {{ propertyType }}
• Lead Source = {{ leadSource }}
• Campaign = {{ campaignName }}

Task:
Use our existing {{ leadList }} embeddings to find 5,000+ new records in adjacent ZIPs with **similar property characteristics and seller behaviors**.
Optimize for ad export (Facebook & Google).

Output:
1. Audience Description (e.g., "Absentee owners of single-family homes in Aurora/Denver with 5–15 yrs ownership")
2. Target Filters (zipCodes, propertyType, equityRange, ownerDuration)
3. Estimated Audience Volume (Facebook/Google readiness)
4. Recommended Export Platform(s)`,
		variables: [
			"leadList",
			"location",
			"propertyType",
			"leadSource",
			"campaignName",
		],
		tags: ["geo-targeting", "facebook", "google", "ads", "export", "lookalike"],
		isBuiltIn: true,
	},
	{
		id: "high_intent_feedback_loop",
		name: "High-Intent Seller (AI Feedback Loop)",
		description: "Feedback-driven lookalike with conversation quality scoring",
		category: "audience_search",
		content: `You are a lead-scoring analyst for DealScale's Intelligence Suite.

Use feedback from recent conversations:
• Positive Call Outcomes = tracked metric
• AI Conversation Score = quality metric
• Off-Market Likelihood Model = active_model:off_market
• Seller Intent Indicators = {{ sellerIntentScore }}

Task:
Find a new audience **similar to our last 20 qualified sellers** who scored above 0.85 in the "Off-Market Likelihood Model."
Combine conversational tone, sentiment, and property signals.

Output Format:
1. Semantic Profile Summary (describe behavioral similarities)
2. Top Feature Weights (intent, equity, sentiment)
3. Suggested Search Query (structured for vector search)
4. Export Command (workflow trigger JSON)`,
		variables: ["sellerIntentScore", "leadList", "campaignName"],
		tags: ["feedback-loop", "intent", "conversation", "ml-model", "lookalike"],
		isBuiltIn: true,
	},
	{
		id: "enterprise_multitenant_lookalike",
		name: "Enterprise Multi-Tenant Look-Alike",
		description: "Tenant-isolated lookalike search for brokerages",
		category: "audience_search",
		content: `You are a DealScale enterprise AI personalization engineer.

Tenant ID: {{ tenantId }}
Market Region: {{ location }}
Seed Leads: {{ leadList }}
Tenant Model: off_market_model_v1.3

Task:
Generate **private, tenant-specific look-alike audiences** using the tenant's own embeddings.
Do not use other tenant data.

Steps:
1. Vectorize {{ leadList }} embeddings
2. Query tenant partition with cosine similarity threshold ≥ 0.78
3. Filter by propertyType, location radius (50 mi), and ownership tenure
4. Rank top 500 candidates
5. Output personalized export path

Output:
• Summary: "Top 500 similar sellers for {{ tenantId }}"
• Filters used
• Similarity distribution (histogram or range)
• Export confirmation path`,
		variables: [
			"tenantId",
			"location",
			"leadList",
			"propertyType",
			"ownerTimeInProperty",
		],
		tags: ["enterprise", "multi-tenant", "privacy", "brokerage", "lookalike"],
		isBuiltIn: true,
	},
	{
		id: "autonomous_audience_builder",
		name: "Autonomous Audience Builder",
		description: "Fully automated lookalike generation with deduplication",
		category: "audience_search",
		content: `You are the Autonomous Audience Builder Agent within DealScale's Intelligence Suite.

Given:
• Seed dataset = {{ leadList }}
• Enrichment fields: {{ ownerTimeInProperty }}, {{ estimatedEquityPercentage }}, {{ isOutOfStateOwner }}, {{ sellerIntentScore }}
• Model type = off_market_model_v2.0
• Target campaign = {{ campaignName }}

Task:
- Automatically generate a new audience of similar leads.
- Ensure 80%+ semantic similarity across enrichment and behavioral dimensions.
- Deduplicate results and tag "lookalike:true".

Return:
1. Count of new leads found
2. Top 5 similarity drivers
3. Confidence interval (low/avg/high)
4. Auto-generated description (plain English)
5. Workflow trigger block for enrichment & export`,
		variables: [
			"leadList",
			"ownerTimeInProperty",
			"estimatedEquityPercentage",
			"isOutOfStateOwner",
			"sellerIntentScore",
			"campaignName",
		],
		tags: [
			"autonomous",
			"automation",
			"deduplication",
			"ml-model",
			"lookalike",
		],
		isBuiltIn: true,
	},
	{
		id: "skip_trace_enriched_lookalike",
		name: "Skip Trace Enriched Look-Alike",
		description: "Lookalike search prioritizing skip-traced and enriched leads",
		category: "audience_search",
		content: `You are a data enrichment specialist at DealScale.

Variables:
• Lead List: {{ leadList }}
• Skip Trace Status: {{ skipTraceStatus }}
• Location: {{ location }}
• Property Type: {{ propertyType }}
• Estimated Equity %: {{ estimatedEquityPercentage }}
• Owner Time in Property: {{ ownerTimeInProperty }} years

Task:
Build a **skip-trace enriched lookalike audience** where all leads have complete contact data and property intelligence.

Process:
1. {{ analyzeLeadList }} for {{ leadList }} where {{ skipTraceStatus }} = "complete"
2. {{ scoreLookalike }} using enriched data dimensions
3. {{ filter }} candidates with:
   - {{ estimatedEquityPercentage }} > 40%
   - {{ ownerTimeInProperty }} > 5 years
   - Valid phone + email (skip-traced)
4. Rank by similarity and data completeness

Output:
• Enriched audience count
• Data completeness score (0-100)
• Top similarity features
• Ready-to-contact lead list`,
		variables: [
			"leadList",
			"skipTraceStatus",
			"location",
			"propertyType",
			"estimatedEquityPercentage",
			"ownerTimeInProperty",
		],
		tags: ["skip-trace", "enrichment", "data-quality", "lookalike"],
		isBuiltIn: true,
	},
	{
		id: "absentee_owner_lookalike",
		name: "Absentee Owner Look-Alike",
		description: "Target out-of-state owners similar to successful conversions",
		category: "audience_search",
		content: `You are a motivated seller specialist at DealScale.

Focus: Out-of-state property owners (absentee landlords)

Variables:
• Location: {{ location }}
• Is Out-of-State Owner: {{ isOutOfStateOwner }}
• Owner Time in Property: {{ ownerTimeInProperty }} years
• Estimated Equity %: {{ estimatedEquityPercentage }}
• Property Type: {{ propertyType }}
• Seller Intent Score: {{ sellerIntentScore }}

Task:
Find **absentee owners** similar to our best converting leads—tired landlords ready to exit.

Criteria:
1. {{ isOutOfStateOwner }} = true
2. {{ ownerTimeInProperty }} > 7 years
3. {{ estimatedEquityPercentage }} > 50%
4. {{ propertyType }} IN ['single_family', 'duplex', 'condo']
5. {{ sellerIntentScore }} > 60

Output:
• Absentee owner count by state
• Avg equity and ownership duration
• Motivation indicators (high-intent signals)
• Recommended outreach: Call → Text → Email sequence`,
		variables: [
			"location",
			"isOutOfStateOwner",
			"ownerTimeInProperty",
			"estimatedEquityPercentage",
			"propertyType",
			"sellerIntentScore",
		],
		tags: ["absentee", "out-of-state", "motivated", "landlord", "lookalike"],
		isBuiltIn: true,
	},
	{
		id: "equity_rich_lookalike",
		name: "Equity-Rich Look-Alike",
		description: "High-equity property owners for wholesale opportunities",
		category: "audience_search",
		content: `You are a wholesale deal analyst at DealScale.

Goal: Find equity-rich property owners similar to our best wholesale deals

Variables:
• Lead List: {{ leadList }}
• Estimated Equity %: {{ estimatedEquityPercentage }}
• Property Type: {{ propertyType }}
• Location: {{ location }}
• Budget: {{ budget }}
• Vertical: {{ vertical }}

Task:
{{ lookalikeBuilder }} identifies owners with 50%+ equity, {{ propertyType }} match, and {{ vertical }}-appropriate deal size.

Filters:
1. {{ estimatedEquityPercentage }} ≥ 50%
2. {{ propertyType }} = ['single_family', 'multi_family']
3. {{ location }} within target market
4. {{ budget }} range: $150K - $400K
5. No recent sales (ownership stable)

Output:
• Equity-rich audience count
• Avg equity percentage
• Deal opportunity score (1-100)
• Estimated wholesale margin potential`,
		variables: [
			"leadList",
			"estimatedEquityPercentage",
			"propertyType",
			"location",
			"budget",
			"vertical",
		],
		tags: ["equity", "wholesale", "opportunity", "margin", "lookalike"],
		isBuiltIn: true,
	},
	{
		id: "marketing_copy_lookalike",
		name: "Marketing Copy (Look-Alike Feature)",
		description: "Promotional content explaining the lookalike engine",
		category: "audience_search",
		content: `You are a product marketer for DealScale.
Create a promotional blurb explaining the Look-Alike Audience Engine using these data points:

• User uploads lead list ({{ leadList }})
• System analyzes {{ leadSource }}, {{ location }}, {{ propertyType }}, {{ estimatedEquityPercentage }}, {{ sellerIntentScore }}
• Generates look-alike audience in minutes

Tone: inspiring, professional, data-backed.

Output:
- Headline (10 words max)
- Sub-headline (20 words)
- 1-paragraph explanation (max 100 words)`,
		variables: [
			"leadList",
			"leadSource",
			"location",
			"propertyType",
			"estimatedEquityPercentage",
			"sellerIntentScore",
		],
		tags: ["marketing", "copy", "feature-explanation", "lookalike"],
		isBuiltIn: true,
	},

	// === SIMPLE AUDIENCE SEARCH TEMPLATES ===
	{
		id: "simple_investor_search",
		name: "Simple Investor Search",
		description: "Quick search for cash investors in a specific location",
		category: "audience_search",
		content: `Find cash investors in {{location}} looking for {{propertyType}} properties.

Target criteria:
- Budget: {{budget}}
- Equity preference: {{estimatedEquityPercentage}}% or higher
- Lead score: {{leadScore}} minimum

Return a list of potential investors with contact info.`,
		variables: [
			"location",
			"propertyType",
			"budget",
			"estimatedEquityPercentage",
			"leadScore",
		],
		tags: ["simple", "investor", "search", "quick-start"],
		isBuiltIn: true,
	},
	{
		id: "simple_wholesaler_search",
		name: "Simple Wholesaler Search",
		description: "Quick search for distressed properties for wholesalers",
		category: "audience_search",
		content: `Find distressed {{propertyType}} properties in {{location}} suitable for wholesaling.

Look for:
- High equity: {{estimatedEquityPercentage}}% minimum
- Motivated sellers: {{sellerIntentScore}} score
- Owner time: {{ownerTimeInProperty}} years or more

Output: List of properties with owner contact details.`,
		variables: [
			"propertyType",
			"location",
			"estimatedEquityPercentage",
			"sellerIntentScore",
			"ownerTimeInProperty",
		],
		tags: ["simple", "wholesaler", "distressed", "quick-start"],
		isBuiltIn: true,
	},
	{
		id: "simple_location_search",
		name: "Simple Location-Based Search",
		description: "Quick geographic search for properties in target area",
		category: "audience_search",
		content: `Search for {{propertyType}} properties in {{location}}.

Filter by:
- Property type: {{propertyType}}
- Location: {{location}}
- Lead source: {{leadSource}}

Return properties in this area with owner contact information.`,
		variables: ["propertyType", "location", "leadSource"],
		tags: ["simple", "location", "geographic", "quick-start"],
		isBuiltIn: true,
	},
	{
		id: "simple_absentee_search",
		name: "Simple Absentee Owner Search",
		description: "Quick search for out-of-state property owners",
		category: "audience_search",
		content: `Find absentee (out-of-state) owners in {{location}}.

Criteria:
- Is out-of-state owner: {{isOutOfStateOwner}} = true
- Property type: {{propertyType}}
- Ownership duration: {{ownerTimeInProperty}} years minimum

Return list of absentee owners with contact details.`,
		variables: [
			"location",
			"isOutOfStateOwner",
			"propertyType",
			"ownerTimeInProperty",
		],
		tags: ["simple", "absentee", "out-of-state", "quick-start"],
		isBuiltIn: true,
	},
	{
		id: "simple_equity_search",
		name: "Simple High-Equity Search",
		description: "Quick search for high-equity property owners",
		category: "audience_search",
		content: `Find property owners with high equity in {{location}}.

Target:
- Equity percentage: {{estimatedEquityPercentage}}% or higher
- Property type: {{propertyType}}
- Location: {{location}}

Return owners sorted by equity percentage.`,
		variables: ["location", "estimatedEquityPercentage", "propertyType"],
		tags: ["simple", "equity", "high-value", "quick-start"],
		isBuiltIn: true,
	},
	{
		id: "simple_contact_status_search",
		name: "Simple Contact Status Search",
		description: "Quick search by lead engagement status",
		category: "audience_search",
		content: `Find leads based on {{contactStatus}} in {{leadList}}.

Filter:
- Contact status: {{contactStatus}}
- Lead score: {{leadScore}} minimum
- Response rate: {{responseRate}}

Return engaged leads ready for follow-up.`,
		variables: ["contactStatus", "leadList", "leadScore", "responseRate"],
		tags: ["simple", "contact", "engagement", "quick-start"],
		isBuiltIn: true,
	},

	// === WORKFLOW & AUTOMATION TEMPLATES ===
	{
		id: "master_automation_orchestrator",
		name: "🌟 Master Automation Orchestrator",
		description:
			"Full n8n/Make.com workflow automation with MCP + A2A protocol",
		category: "workflow",
		content: `<poml>
  <meta>
    <title>DealScale Master Automation Orchestrator</title>
    <version>2.0</version>
    <author>DealScale Intelligence Suite</author>
    <description>
      Full-featured prompt for automated creation, orchestration, and execution of workflows 
      using DealScale's MCP + 2A protocol, compatible with n8n/Make JSON workflow translation.
    </description>
  </meta>

  <!-- 🌍 GLOBAL CONTEXT -->
  <context>
    <role>
      You are the DealScale Automation Architect Agent.
      Your job is to dynamically design, generate, and deploy both basic and advanced workflows 
      across data ingestion, enrichment, look-alike audience generation, and multi-channel outreach.
    </role>
    <goal>
      Build adaptive, event-driven automation pipelines integrating:
      • MCP function calls  
      • 2A agent hand-offs  
      • n8n/Make nodes and triggers  
      • AI prompt orchestration (call/text/social)  
      • Feedback-driven retraining and optimization.
    </goal>
  </context>

  <!-- 🧠 PERSISTENT MEMORY -->
  <memory>
    <store name="leadData" persist="true" />
    <store name="audienceState" persist="true" />
    <store name="campaignContext" persist="true" />
    <store name="modelState" persist="true" />
    <store name="performanceState" persist="true" />
  </memory>

  <!-- 🔡 VARIABLES -->
  <variables>
    {{tenantId}} {{leadList}} {{leadSource}} {{campaignName}} {{vertical}}
    {{skipTraceStatus}} {{leadScore}} {{contactStatus}} {{propertyType}} {{location}} {{budget}}
    {{ownerTimeInProperty}} {{isOutOfStateOwner}} {{estimatedEquityPercentage}} {{sellerIntentScore}}
    {{sellerIntentIndicators}} {{responseRate}} {{conversionRate}} {{positiveConversions}} {{performanceDashboard}}
    {{workflowPlatform}} <!-- n8n or make -->
  </variables>

  <!-- ⚙️ REGISTERED MCP FUNCTIONS -->
  <functions>
    <function id="analyzeLeadList" endpoint="leads.analyze" />
    <function id="bulkEnrich" endpoint="leads.enrich" />
    <function id="dedupeLeads" endpoint="leads.dedupe" />
    <function id="scoreLookalike" endpoint="audience.similarity" />
    <function id="filterProspects" endpoint="audience.filter" />
    <function id="exportAudience" endpoint="audience.export" />
    <function id="createCampaign" endpoint="campaign.create" />
    <function id="updateCampaign" endpoint="campaign.update" />
    <function id="trackPerformance" endpoint="campaign.performance" />
    <function id="callOutreach" endpoint="outreach.call" />
    <function id="textOutreach" endpoint="outreach.text" />
    <function id="socialOutreach" endpoint="outreach.social" />
    <function id="webSearchProspects" endpoint="prospects.websearch" />
  </functions>

  <!-- 🤖 AGENT REGISTRY -->
  <agents>
    <agent name="DataEngineer" role="Enrichment" capabilities="bulkEnrich,dedupeLeads" />
    <agent name="AudienceArchitect" role="Audience Generation" capabilities="scoreLookalike,filterProspects,exportAudience" />
    <agent name="CampaignOrchestrator" role="Campaign Design" capabilities="createCampaign,updateCampaign,trackPerformance" />
    <agent name="CallQualifier" role="Voice Outreach" capabilities="callOutreach" />
    <agent name="TextNurturer" role="SMS Nurture" capabilities="textOutreach" />
    <agent name="SocialEngager" role="Social Outreach" capabilities="socialOutreach" />
    <agent name="FeedbackLoop" role="Optimization" capabilities="trackPerformance,scoreLookalike" />
  </agents>

  <!-- 🧰 AUTOMATION LAYER INTEGRATION -->
  <automation>
    <platform>{{workflowPlatform}}</platform> <!-- n8n or make -->
    <mappings>
      <trigger event="new_lead" node="Webhook Trigger" />
      <trigger event="schedule_daily" node="Cron Trigger" />
      <call tool="HTTP Request" mapsTo="bulkEnrich,scoreLookalike,createCampaign" />
      <branch node="If/Router" purpose="conditional logic" />
      <set node="Set/Function" purpose="variable mapping" />
      <execute node="Execute Workflow" purpose="sub-flow orchestration" />
      <notify node="Slack/Email" purpose="alerts" />
    </mappings>
  </automation>

  <!-- 🎤 SALES SCRIPTS -->
  <scripts>
    <script id="call.qualify">
      Hi {{prospectFirstName}}, this is {{agentName}} with DealScale. 
      I saw your property at {{propertyAddress}} in {{location}}.
      You've owned it {{ownerTimeInProperty}} years — are you open to an off-market option?
    </script>
    <script id="sms.followup">
      Hi {{prospectFirstName}}, {{agentName}} at DealScale here.  
      We're helping owners in {{location}} find off-market offers — open to a quick chat this week?
    </script>
  </scripts>

  <!-- 🧩 MASTER WORKFLOW -->
  <workflow id="master_automation">
    <!-- 1️⃣ TRIGGER & INGEST -->
    <phase id="1" label="Ingest Lead & Trigger Flow">
      <trigger event="new_lead" platform="{{workflowPlatform}}" />
      <call agent="DataEngineer" function="analyzeLeadList" with="leadList={{leadList}}" />
      <save to="leadData.raw" />
      <call function="dedupeLeads" with="leadList={{leadList}}" />
      <save to="leadData.cleaned" />
    </phase>

    <!-- 2️⃣ ENRICHMENT -->
    <phase id="2" label="Enrich Lead Data">
      <handoff from="DataEngineer" to="AudienceArchitect" protocol="2A">
        <context-ref>leadData.cleaned</context-ref>
        <call function="bulkEnrich" with="leadList={{leadList}}" />
        <output to="leadData.enriched" />
      </handoff>
    </phase>

    <!-- 3️⃣ LOOK-ALIKE CREATION -->
    <phase id="3" label="Look-Alike Audience Creation">
      <call agent="AudienceArchitect" function="scoreLookalike"
            with="seedListID={{leadList}}, tenantId={{tenantId}}, filters:{location:'{{location}}', propertyType:'{{propertyType}}'}" />
      <save to="audienceState.raw" />
      <call function="filterProspects" with="similarityScores={{audienceState.raw}}, rules:{equity:>{{estimatedEquityPercentage}}, intent:>{{sellerIntentScore}}}" />
      <output to="audienceState.final" />
    </phase>

    <!-- 4️⃣ CAMPAIGN CREATION -->
    <phase id="4" label="Create Campaign">
      <handoff from="AudienceArchitect" to="CampaignOrchestrator" protocol="2A">
        <context-ref>audienceState.final</context-ref>
        <prompt>
          Build campaign {{campaignName}} for tenant {{tenantId}}.
          Use channel mix (Call/SMS/Social) based on vertical {{vertical}} and budget {{budget}}.
          Optimize for responseRate > 15% and conversionRate > 5%.
        </prompt>
        <call function="createCampaign" with="campaignName={{campaignName}}, tenantId={{tenantId}}, audienceID={{audienceState.final}}" />
        <save to="campaignContext.id" />
      </handoff>
    </phase>

    <!-- 5️⃣ OUTREACH -->
    <phase id="5" label="Outreach Activation">
      <parallel>
        <call agent="CallQualifier" function="callOutreach" with="campaignID={{campaignContext.id}}, leadListID={{audienceState.final}}, scriptTemplate='call.qualify'" />
        <call agent="TextNurturer" function="textOutreach" with="campaignID={{campaignContext.id}}, messageTemplate='sms.followup'" />
        <call agent="SocialEngager" function="socialOutreach" with="campaignID={{campaignContext.id}}, messageTemplate='sms.followup'" />
      </parallel>
    </phase>

    <!-- 6️⃣ PERFORMANCE & FEEDBACK -->
    <phase id="6" label="Track Performance">
      <handoff from="CampaignOrchestrator" to="FeedbackLoop" protocol="2A">
        <call function="trackPerformance" with="campaignID={{campaignContext.id}}" />
        <output to="performanceState.metrics" />
      </handoff>
      <prompt>
        Evaluate performance:
        - responseRate={{responseRate}}, conversionRate={{conversionRate}}
        - If conversionRate < 5%, increase qualification criteria.
        - If responseRate < 10%, expand {{location}} radius by 10mi.
        Return updated optimization JSON.
      </prompt>
      <save to="modelState.optimizedConfig" />
    </phase>

    <!-- 7️⃣ MODEL RETRAIN -->
    <phase id="7" label="Self-Retrain">
      <call agent="FeedbackLoop" function="scoreLookalike"
            with="seedListID={{positiveConversions}}, retrain=true, tenantId={{tenantId}}, config={{modelState.optimizedConfig}}" />
      <output to="modelState.newModelVersion" />
    </phase>

    <!-- 8️⃣ WORKFLOW DEPLOYMENT -->
    <phase id="8" label="Deploy Workflow to Platform">
      <prompt>
        Generate automation JSON for {{workflowPlatform}}.

        If workflowPlatform = 'n8n':
          Map each <phase> to nodes:
            - Trigger: Webhook/Cron Node
            - Calls: HTTP Request Nodes
            - Branches: IF/Router Nodes
            - Parallel: SplitInBatches/ExecuteWorkflow Nodes
            - Save states as Set Nodes
        If workflowPlatform = 'make':
          Map each <phase> to modules:
            - Trigger: Webhook/Scheduler
            - Action: HTTP/JSON
            - Router: Filter Modules
            - Parallel: Routers
            - Variable persistence via Set Variable modules
        Output ready-to-deploy JSON blueprint.
      </prompt>
      <output as="automationJSON" />
    </phase>
  </workflow>

  <!-- 🔁 FEEDBACK CHANNELS -->
  <feedback>
    <channel source="FeedbackLoop" target="AudienceArchitect" trigger="model.performanceUpdate" />
    <channel source="FeedbackLoop" target="DataEngineer" trigger="enrichmentGapDetected" />
    <channel source="CampaignOrchestrator" target="TextNurturer" trigger="scriptPerformanceLow" />
  </feedback>

  <!-- 📤 OUTPUT CONTRACT -->
  <output-format>
    <summary>
      • Audience built, campaign deployed, and automation JSON exported.  
      • Performance feedback integrated, retraining triggered if criteria met.  
      • Deployment blueprint compatible with both n8n and Make.com.
    </summary>
    <data>
      {
        "audience": {{audienceState.final}},
        "campaignID": {{campaignContext.id}},
        "performance": {{performanceState.metrics}},
        "optimizedConfig": {{modelState.optimizedConfig}},
        "modelVersion": {{modelState.newModelVersion}},
        "automationJSON": {{automationJSON}}
      }
    </data>
  </output-format>
</poml>`,
		variables: [
			"tenantId",
			"leadList",
			"leadSource",
			"campaignName",
			"vertical",
			"skipTraceStatus",
			"leadScore",
			"contactStatus",
			"propertyType",
			"location",
			"budget",
			"ownerTimeInProperty",
			"isOutOfStateOwner",
			"estimatedEquityPercentage",
			"sellerIntentScore",
			"sellerIntentIndicators",
			"responseRate",
			"conversionRate",
			"positiveConversions",
			"performanceDashboard",
			"workflowPlatform",
			"prospectFirstName",
			"agentName",
			"propertyAddress",
		],
		tags: [
			"workflow",
			"automation",
			"n8n",
			"make",
			"orchestration",
			"a2a",
			"mcp",
			"master",
			"featured",
		],
		isBuiltIn: true,
	},

	// === KESTRA WORKFLOW TEMPLATES (POML Format) ===
	{
		id: "kestra_poml_lead_ingestion",
		name: "Kestra: Lead Ingestion & Deduplication",
		description: "POML template for lead ingestion and deduplication flow",
		category: "workflow",
		content: `<poml>
  <meta>
    <title>Lead Ingestion & Deduplication</title>
    <version>1.0</version>
  </meta>

  <context>
    <role>You are the DataEngineer Agent.</role>
    <goal>Trigger when new leads are imported, deduplicate them, and store results.</goal>
  </context>

  <variables>
    {{tenantId}} {{leadList}} {{leadSource}}
  </variables>

  <workflow id="lead_ingestion">
    <phase id="1" label="Trigger & Deduplication">
      <trigger event="new_lead" platform="kestra" />
      <call function="dedupeLeads"
            with="leadList={{leadList}}, tenantId={{tenantId}}" />
      <save to="leadData.cleaned" />
    </phase>

    <phase id="2" label="Analysis & Log">
      <call function="analyzeLeadList"
            with="leadList={{leadData.cleaned}}, tenantId={{tenantId}}" />
      <prompt>
        Generate a Kestra YAML with:
        - id: dealscale__{{tenantId}}__lead_ingestion
        - trigger: Webhook
        - task sequence: dedupeLeads → analyzeLeadList → log
      </prompt>
    </phase>
  </workflow>
</poml>`,
		variables: ["tenantId", "leadList", "leadSource"],
		tags: ["kestra", "poml", "ingestion", "deduplication"],
		isBuiltIn: true,
	},
	{
		id: "kestra_poml_enrichment",
		name: "Kestra: Lead Enrichment (Skip Trace)",
		description: "POML template for skip trace and property data enrichment",
		category: "workflow",
		content: `<poml>
  <meta>
    <title>Lead Enrichment Workflow</title>
    <version>1.0</version>
  </meta>

  <context>
    <role>You are the Enrichment Agent.</role>
    <goal>Enrich cleaned leads with owner and property details via skip-trace API.</goal>
  </context>

  <variables>
    {{tenantId}} {{leadList}} {{skipTraceStatus}}
  </variables>

  <workflow id="lead_enrichment">
    <phase id="1" label="Call Skip Trace">
      <call function="bulkEnrich"
            with="leadList={{leadList}}, tenantId={{tenantId}}" />
      <save to="leadData.enriched" />
    </phase>

    <phase id="2" label="Validate Results">
      <if condition="{{skipTraceStatus}} == 'complete'">
        <prompt>
          Create Kestra task chain:
          - HTTP Request (POST /v1/leads/enrich)
          - Slack Notification on success
        </prompt>
      </if>
      <else>
        <prompt>
          Include retry logic in Kestra YAML:
          retry:
            maxAttempt: 3
            delay: PT10S
        </prompt>
      </else>
    </phase>
  </workflow>
</poml>`,
		variables: ["tenantId", "leadList", "skipTraceStatus"],
		tags: ["kestra", "poml", "enrichment", "skip-trace"],
		isBuiltIn: true,
	},
	{
		id: "kestra_poml_lookalike",
		name: "Kestra: Look-Alike Audience Generation",
		description: "POML template for similarity-based audience creation",
		category: "workflow",
		content: `<poml>
  <meta>
    <title>Look-Alike Audience Generator</title>
    <version>1.0</version>
  </meta>

  <context>
    <role>You are the AudienceArchitect Agent.</role>
    <goal>Generate a look-alike audience using enriched seed leads.</goal>
  </context>

  <variables>
    {{tenantId}} {{leadList}} {{location}} {{propertyType}} {{estimatedEquityPercentage}} {{ownerTimeInProperty}}
  </variables>

  <workflow id="lookalike_generation">
    <phase id="1" label="Compute Similarities">
      <call function="scoreLookalike"
            with="seedListID={{leadList}}, tenantId={{tenantId}}" />
      <save to="audienceState.raw" />
    </phase>

    <phase id="2" label="Filter & Export">
      <call function="filterProspects"
            with="similarityScores={{audienceState.raw}}, filters:{location:'{{location}}', propertyType:'{{propertyType}}'}" />
      <call function="exportAudience"
            with="audience={{audienceState.filtered}}" />
      <save to="audienceState.final" />
    </phase>

    <phase id="3" label="Compile to Kestra Flow">
      <prompt>
        Output Kestra YAML:
        - id: dealscale__{{tenantId}}__lookalike_generation
        - tasks: scoreLookalike → filterProspects → exportAudience
        - outputs: audienceCount = {{audienceState.final.length}}
      </prompt>
    </phase>
  </workflow>
</poml>`,
		variables: [
			"tenantId",
			"leadList",
			"location",
			"propertyType",
			"estimatedEquityPercentage",
			"ownerTimeInProperty",
		],
		tags: ["kestra", "poml", "lookalike", "audience"],
		isBuiltIn: true,
	},
	{
		id: "kestra_poml_campaign",
		name: "Kestra: Campaign Creation & Activation",
		description: "POML template for multi-channel campaign orchestration",
		category: "workflow",
		content: `<poml>
  <meta>
    <title>Campaign Creation</title>
    <version>1.0</version>
  </meta>

  <context>
    <role>You are the CampaignOrchestrator Agent.</role>
    <goal>Create and activate AI-powered campaigns with call, text, and social outreach.</goal>
  </context>

  <variables>
    {{tenantId}} {{campaignName}} {{audienceState.final}} {{budget}} {{vertical}}
  </variables>

  <workflow id="campaign_activation">
    <phase id="1" label="Create Campaign">
      <call function="createCampaign"
            with="tenantId={{tenantId}}, campaignName={{campaignName}}, audienceID={{audienceState.final}}" />
      <save to="campaignContext.id" />
    </phase>

    <phase id="2" label="Activate Multi-Channel Outreach">
      <parallel>
        <call agent="CallQualifier" function="callOutreach"
              with="campaignID={{campaignContext.id}}" />
        <call agent="TextNurturer" function="textOutreach"
              with="campaignID={{campaignContext.id}}" />
        <call agent="SocialEngager" function="socialOutreach"
              with="campaignID={{campaignContext.id}}" />
      </parallel>
    </phase>

    <phase id="3" label="Compile to Kestra">
      <prompt>
        Generate Kestra flow:
        - id: dealscale__{{tenantId}}__campaign_activation
        - uses Parallel block for call/text/social
        - outputs: campaignID = {{campaignContext.id}}
      </prompt>
    </phase>
  </workflow>
</poml>`,
		variables: [
			"tenantId",
			"campaignName",
			"audienceState",
			"budget",
			"vertical",
		],
		tags: ["kestra", "poml", "campaign", "multi-channel"],
		isBuiltIn: true,
	},
	{
		id: "kestra_poml_feedback",
		name: "Kestra: Feedback & Optimization",
		description:
			"POML template for performance monitoring and model retraining",
		category: "workflow",
		content: `<poml>
  <meta>
    <title>Performance Feedback</title>
    <version>1.0</version>
  </meta>

  <context>
    <role>You are the FeedbackLoop Agent.</role>
    <goal>Track campaign performance and trigger retraining when below threshold.</goal>
  </context>

  <variables>
    {{tenantId}} {{campaignContext.id}} {{conversionRate}} {{responseRate}} {{positiveConversions}}
  </variables>

  <workflow id="feedback_loop">
    <phase id="1" label="Track Performance">
      <call function="trackPerformance"
            with="campaignID={{campaignContext.id}}, tenantId={{tenantId}}" />
      <save to="performanceState.metrics" />
    </phase>

    <phase id="2" label="Optimize">
      <if condition="{{conversionRate}} &lt; 5">
        <call function="scoreLookalike"
              with="seedListID={{positiveConversions}}, retrain=true, tenantId={{tenantId}}" />
        <save to="modelState.newModelVersion" />
      </if>
      <else>
        <prompt>Model performing well, skip retrain.</prompt>
      </else>
    </phase>

    <phase id="3" label="Kestra Compilation">
      <prompt>
        Compile Kestra flow:
        - trigger: Scheduled
        - switch cases: if conversionRate &lt; 5 retrain → else end
      </prompt>
    </phase>
  </workflow>
</poml>`,
		variables: [
			"tenantId",
			"campaignContext",
			"conversionRate",
			"responseRate",
			"positiveConversions",
		],
		tags: ["kestra", "poml", "feedback", "optimization"],
		isBuiltIn: true,
	},
	{
		id: "kestra_poml_agent_memory",
		name: "Kestra: Agent Memory Initialization",
		description:
			"POML template for persistent AI agent memory across workflows",
		category: "workflow",
		content: `<poml>
  <meta>
    <title>Agent Memory Initialization</title>
    <version>1.0</version>
  </meta>

  <context>
    <role>You are the Orchestration Memory Manager Agent.</role>
    <goal>Initialize AI agent memory for persistent session context across workflows.</goal>
  </context>

  <variables>
    {{tenantId}} {{memoryKey}}
  </variables>

  <workflow id="agent_memory">
    <phase id="1" label="Initialize Memory">
      <call function="io.kestra.plugin.ai.memory.KestraKVStore"
            with="memoryId={{memoryKey}}, messages:[{role:'system', content:'Session memory for tenant {{tenantId}}'}]" />
    </phase>

    <phase id="2" label="Compile">
      <prompt>
        Output Kestra YAML using:
        - task type: io.kestra.plugin.ai.memory.KestraKVStore
        - namespace: dealscale.{{tenantId}}
      </prompt>
    </phase>
  </workflow>
</poml>`,
		variables: ["tenantId", "memoryKey"],
		tags: ["kestra", "poml", "memory", "agent"],
		isBuiltIn: true,
	},

	{
		id: "model_audit_improvement",
		name: "AI Model Audit & Improvement",
		description: "Self-evaluation prompt for lookalike model optimization",
		category: "analytics",
		content: `You are the internal evaluator for DealScale's Look-Alike Model v2.1.

Inputs:
• Positive Conversions: conversion count
• Avg Similarity Score: {{ leadScore }} average
• Model Drift Index: tracking metric
• Training Data Size: {{ leadList }} record count

Task:
Analyze recent model performance and suggest:
1. Top 3 areas of improvement
2. Retraining criteria (new data needed)
3. Predicted performance gain after retraining

Output:
- Summary Report (3-5 bullet points)
- JSON "improvement_plan" object`,
		variables: ["leadScore", "leadList", "responseRate"],
		tags: ["model", "audit", "ml-optimization", "improvement", "analytics"],
		isBuiltIn: true,
	},

	// === CAMPAIGN CREATION PROMPTS (8) ===
	{
		id: "master_campaign_orchestration",
		name: "🌟 Master Campaign Orchestrator",
		description:
			"Complete MCP A2A campaign pipeline with multi-agent orchestration",
		category: "campaign",
		content: `<poml>
  <!-- 🧾 META -->
  <meta>
    <title>DealScale MCP A2A Master Orchestrator</title>
    <version>1.0.0</version>
    <author>DealScale Intelligence Suite</author>
    <description>
      Master prompt for orchestrating look-alike audience generation, campaign creation,
      enrichment, and multi-channel outreach using MCP + Agent-to-Agent (A2A) protocol.
    </description>
  </meta>

  <!-- 🌍 GLOBAL CONTEXT -->
  <context>
    <role>
      You are the Master Coordination Agent inside DealScale's MCP (Multi-Agent Control Plane).
    </role>
    <goal>
      Use collaborative agent-to-agent (A2A) orchestration, tools, and data to:
      1) generate look-alike audiences,
      2) design optimized campaigns,
      3) launch AI-powered outreach,
      4) learn from performance and continuously improve.
    </goal>
  </context>

  <!-- 🧠 SHARED MEMORY STORES -->
  <memory>
    <store name="leadData" persist="true" />
    <store name="campaignContext" persist="true" />
    <store name="audienceState" persist="true" />
    <store name="modelState" persist="true" />
    <store name="performanceState" persist="true" />
  </memory>

  <!-- 🔡 VARIABLES (PLATFORM-WIDE) -->
  <variables>
    <!-- Lead & campaign context -->
    {{ tenantId }}
    {{ leadList }}
    {{ leadSource }}
    {{ campaignName }}
    {{ vertical }}

    <!-- Data & enrichment state -->
    {{ skipTraceStatus }}
    {{ leadScore }}
    {{ contactStatus }}

    <!-- Property / targeting features -->
    {{ propertyType }}
    {{ location }}
    {{ budget }}

    <!-- Seller intent & ownership features -->
    {{ ownerTimeInProperty }}
    {{ isOutOfStateOwner }}
    {{ estimatedEquityPercentage }}
    {{ sellerIntentScore }}

    <!-- Feedback & performance -->
    {{ responseRate }}
  </variables>

  <!-- ⚙️ MCP FUNCTIONS / TOOLS -->
  <functions>
    <!-- Lead & data operations -->
    <function id="analyzeLeadList" endpoint="leads.analyze" />
    <function id="bulkEnrich" endpoint="leads.enrich" />

    <!-- Audience & similarity -->
    <function id="scoreLookalike" endpoint="audience.similarity" />
    <function id="filterProspects" endpoint="audience.filter" />
    <function id="exportAudience" endpoint="audience.export" />

    <!-- Campaign lifecycle -->
    <function id="createCampaign" endpoint="campaign.create" />
    <function id="trackPerformance" endpoint="campaign.performance"/>

    <!-- Outreach channels -->
    <function id="callOutreach" endpoint="outreach.call" />
    <function id="textOutreach" endpoint="outreach.text" />
    <function id="socialOutreach" endpoint="outreach.social" />

    <!-- External / web data -->
    <function id="webSearchProspects" endpoint="prospects.websearch" />
  </functions>

  <!-- 🤖 AGENT REGISTRY (A2A) -->
  <agents>
    <agent name="DataEngineer"
           role="Lead Enrichment & Hygiene"
           capabilities="bulkEnrich,analyzeLeadList" />
    <agent name="AudienceArchitect"
           role="Look-Alike Audience Builder"
           capabilities="scoreLookalike,filterProspects,exportAudience" />
    <agent name="CampaignOrchestrator"
           role="Campaign Design & Activation"
           capabilities="createCampaign,trackPerformance" />
    <agent name="CallQualifier"
           role="Voice Outreach & Qualification"
           capabilities="callOutreach" />
    <agent name="InboundResponder"
           role="Inbound Call Handling"
           capabilities="callOutreach" />
    <agent name="TextNurturer"
           role="SMS/WhatsApp Nurture"
           capabilities="textOutreach" />
    <agent name="SocialEngager"
           role="Social DM & Engagement"
           capabilities="socialOutreach" />
    <agent name="FeedbackLoop"
           role="Performance Analysis & Optimization"
           capabilities="trackPerformance,scoreLookalike" />
  </agents>

  <!-- 🎤 SALES SCRIPTS / MESSAGE MODULES -->
  <scripts>
    <script id="voice.qualifier">
      Hi {{ prospectFirstName }}, this is {{ agentName }} with DealScale.
      I saw your property at {{ propertyAddress }} in {{ location }} and noticed you've owned it for
      about {{ ownerTimeInProperty }} years.
      Are you open to exploring an off-market option while buyer demand is strong in your area?
    </script>
    <script id="sms.nurture">
      Hi {{ prospectFirstName }}, {{ agentName }} at DealScale here.
      We're helping owners in {{ location }} who've had their property for {{ ownerTimeInProperty }} yrs
      get off-market offers. Open to a 10-min chat this week?
    </script>
    <script id="email.intro">
      Subject: Owners in {{ location }} are getting off-market offers
      Hi {{ prospectFirstName }},
      I'm {{ agentName }} at DealScale. Because you own {{ propertyAddress }} and have held it for
      {{ ownerTimeInProperty }}+ years, we'd like to show you your equity potential
      and off-market options—no obligation.
      Would you like a free, personalized off-market value estimate?
      Best,
      {{ agentName }}
    </script>
  </scripts>

  <!-- 🧩 MASTER WORKFLOW (A2A + MCP) -->
  <workflow id="dealscale_master">
    <!-- 1️⃣ INGEST & ANALYZE -->
    <phase id="1" label="Ingest & Analyze Lead List">
      <call agent="DataEngineer"
            function="analyzeLeadList"
            with="leadList={{ leadList }}, tenantId={{ tenantId }}" />
      <save to="leadData.summary" />
    </phase>

    <!-- 2️⃣ ENRICH -->
    <phase id="2" label="Enrich & Skip Trace">
      <handoff from="DataEngineer" to="AudienceArchitect" protocol="A2A">
        <context-ref>leadData.cleaned</context-ref>
        <call function="bulkEnrich"
              with="leadListID={{ leadList }}, tenantId={{ tenantId }}, skipTraceStatus={{ skipTraceStatus }}" />
        <output to="leadData.enriched" />
      </handoff>
    </phase>

    <!-- 3️⃣ BUILD LOOK-ALIKE AUDIENCE -->
    <phase id="3" label="Look-Alike Audience Generation">
      <call agent="AudienceArchitect"
            function="scoreLookalike"
            with="
              seedListID={{ leadList }},
              tenantId={{ tenantId }},
              filters:{
                location:'{{ location }}',
                propertyType:'{{ propertyType }}',
                ownerTimeInProperty:{{ ownerTimeInProperty }},
                estimatedEquityPercentage:{{ estimatedEquityPercentage }},
                sellerIntentScore:{{ sellerIntentScore }}
              }" />
      <save to="audienceState.similarityRaw" />
      <call agent="AudienceArchitect"
            function="filterProspects"
            with="
              similarityScores={{ audienceState.similarityRaw }},
              rules:{
                equity_min: {{ estimatedEquityPercentage }},
                owner_time_min: {{ ownerTimeInProperty }},
                exclude_contact_status:['closed','lost']
              }" />
      <output to="audienceState.lookalikeAudience" />
    </phase>

    <!-- 4️⃣ CREATE CAMPAIGN FROM AUDIENCE -->
    <phase id="4" label="Campaign Creation & Config">
      <handoff from="AudienceArchitect" to="CampaignOrchestrator" protocol="A2A">
        <context-ref>audienceState.lookalikeAudience</context-ref>
        <call function="createCampaign"
              with="tenantId={{ tenantId }},
                    campaignName={{ campaignName }},
                    audienceID={{ audienceState.lookalikeAudience }}" />
        <output to="campaignContext.id" />
      </handoff>
    </phase>

    <!-- 5️⃣ LAUNCH OUTREACH (CALL + TEXT + SOCIAL) -->
    <phase id="5" label="Outreach Execution">
      <parallel>
        <call agent="CallQualifier"
              function="callOutreach"
              with="campaignID={{ campaignContext.id }},
                    leadListID={{ audienceState.lookalikeAudience }},
                    scriptTemplate='voice.qualifier'" />
        <call agent="TextNurturer"
              function="textOutreach"
              with="campaignID={{ campaignContext.id }},
                    leadListID={{ audienceState.lookalikeAudience }},
                    messageTemplate='sms.nurture'" />
        <call agent="SocialEngager"
              function="socialOutreach"
              with="campaignID={{ campaignContext.id }},
                    leadListID={{ audienceState.lookalikeAudience }},
                    messageTemplate='email.intro'" />
      </parallel>
    </phase>

    <!-- 6️⃣ FEEDBACK & OPTIMIZATION -->
    <phase id="6" label="Performance Feedback & Optimization">
      <handoff from="CampaignOrchestrator" to="FeedbackLoop" protocol="A2A">
        <context-ref>campaignContext</context-ref>
        <call function="trackPerformance"
              with="campaignID={{ campaignContext.id }}, tenantId={{ tenantId }}" />
        <output to="performanceState.metrics" />
      </handoff>
      <prompt>
        You are the Feedback-Driven Optimization Agent.
        Evaluate:
        - responseRate = {{ responseRate }}
        - performanceMetrics = {{ performanceState.metrics }}

        Rules:
        - If conversionRate < 5%, increase similarity threshold strictness
        - If responseRate < 10%, widen {{ location }} radius by 10 miles
        - Return updated config JSON
      </prompt>
      <save to="modelState.optimizedConfig" />
    </phase>

    <!-- 7️⃣ SELF-RETRAIN LOOK-ALIKE MODEL -->
    <phase id="7" label="Self-Retrain Look-Alike Model">
      <call agent="FeedbackLoop"
            function="scoreLookalike"
            with="tenantId={{ tenantId }}, retrain=true" />
      <output to="modelState.newModelVersion" />
    </phase>
  </workflow>

  <!-- 🔁 FEEDBACK CHANNELS (A2A) -->
  <feedback>
    <channel source="FeedbackLoop"
             target="AudienceArchitect"
             trigger="model.performanceUpdate" />
    <channel source="FeedbackLoop"
             target="DataEngineer"
             trigger="enrichmentGapDetected" />
    <channel source="CampaignOrchestrator"
             target="CallQualifier"
             trigger="scriptPerformanceLow" />
  </feedback>

  <!-- 📤 OUTPUT CONTRACT -->
  <output-format>
    <summary>
      • Final look-alike audience size and similarity distribution
      • Campaign plan & channel mix used
      • Outreach performance: responseRate, conversions, appointments set
      • Optimization config applied & new model version (if any)
    </summary>
    <data>
      {
        "audienceID": {{ audienceState.lookalikeAudience }},
        "campaignID": {{ campaignContext.id }},
        "performance": {{ performanceState.metrics }},
        "optimizedConfig": {{ modelState.optimizedConfig }},
        "modelVersion": {{ modelState.newModelVersion }}
      }
    </data>
  </output-format>
</poml>`,
		variables: [
			"tenantId",
			"leadList",
			"leadSource",
			"campaignName",
			"vertical",
			"skipTraceStatus",
			"leadScore",
			"contactStatus",
			"propertyType",
			"location",
			"budget",
			"ownerTimeInProperty",
			"isOutOfStateOwner",
			"estimatedEquityPercentage",
			"sellerIntentScore",
			"responseRate",
			"prospectFirstName",
			"agentName",
			"propertyAddress",
		],
		tags: [
			"master",
			"campaign",
			"orchestration",
			"a2a",
			"mcp",
			"complete-pipeline",
			"featured",
		],
		isBuiltIn: true,
	},
	{
		id: "baseline_campaign_creation",
		name: "Baseline Campaign Creation",
		description:
			"Dynamic campaign builder with audience filters and channel mix",
		category: "campaign",
		content: `<poml>
  <role>You are the Campaign Creation AI inside DealScale's Intelligence Suite.</role>
  <task>Generate an optimized campaign plan using the following variables.</task>
  <variables>
    {{ leadSource }}
    {{ campaignName }}
    {{ leadList }}
    {{ location }}
    {{ propertyType }}
    {{ budget }}
    {{ ownerTimeInProperty }}
    {{ isOutOfStateOwner }}
    {{ estimatedEquityPercentage }}
    {{ sellerIntentScore }}
  </variables>
  <prompt>
    Build a campaign named **{{ campaignName }}** targeting property owners in **{{ location }}** with:
    - Property type: {{ propertyType }}
    - Ownership duration: {{ ownerTimeInProperty }} years
    - Equity: ≥ {{ estimatedEquityPercentage }}%
    - Intent score: ≥ {{ sellerIntentScore }}

    Recommend:
    1️⃣ Audience filters
    2️⃣ Channel mix (Call / SMS / Social %)
    3️⃣ Message type (educational / urgency / value-driven)
    4️⃣ Campaign goal (book appointments, get replies, collect interest)
    5️⃣ Success KPIs
  </prompt>
  <output-format>
    JSON object: { "filters": [], "channels": {}, "messageType": "", "goal": "", "KPIs": {} }
  </output-format>
</poml>`,
		variables: [
			"leadSource",
			"campaignName",
			"leadList",
			"location",
			"propertyType",
			"budget",
			"ownerTimeInProperty",
			"isOutOfStateOwner",
			"estimatedEquityPercentage",
			"sellerIntentScore",
		],
		tags: ["campaign", "creation", "baseline", "filters", "channels"],
		isBuiltIn: true,
	},
	{
		id: "lookalike_campaign",
		name: "Campaign from Look-Alike Audience",
		description:
			"Create campaign targeting lookalike audience with similarity scoring",
		category: "campaign",
		content: `<poml>
  <role>You are the Look-Alike Campaign Architect.</role>
  <task>Use enriched and scored lead data to create a new campaign targeting look-alike audiences.</task>
  <variables>
    {{ leadList }}
    {{ location }}
    {{ propertyType }}
    {{ leadScore }}
    {{ sellerIntentScore }}
    {{ campaignName }}
  </variables>
  <prompt>
    Identify prospects similar to the top 10% of leads in {{ leadList }}.
    - Match on propertyType, location proximity, and sellerIntentScore ±10%.
    - Exclude already-contacted leads.
    - Generate campaign blueprint {{ campaignName }}_LookAlike.

    Output a configuration JSON with:
    • Search query filters
    • Expected audience size
    • Primary communication channels
    • Outreach timing schedule
  </prompt>
  <output-format>
    JSON object: { "audience_query": "", "expected_size": "", "channels": [], "schedule": {} }
  </output-format>
</poml>`,
		variables: [
			"leadList",
			"location",
			"propertyType",
			"leadScore",
			"sellerIntentScore",
			"campaignName",
		],
		tags: ["campaign", "lookalike", "similarity", "audience-expansion"],
		isBuiltIn: true,
	},
	{
		id: "predictive_campaign",
		name: "Predictive Campaign (Intent + Equity)",
		description:
			"AI-powered predictive outreach using intent and equity metrics",
		category: "campaign",
		content: `<poml>
  <role>You are the Predictive Campaign Planner for DealScale.</role>
  <task>Design a predictive outreach campaign using AI intent and equity metrics.</task>
  <variables>
    {{ leadList }}
    {{ estimatedEquityPercentage }}
    {{ sellerIntentScore }}
    {{ leadScore }}
    {{ budget }}
  </variables>
  <prompt>
    Create a campaign that prioritizes:
    - Leads with high sellerIntentScore (≥ 0.7)
    - Equity between {{ estimatedEquityPercentage }}%–100%
    - LeadScore ≥ 75

    Determine:
    1. Recommended campaign cadence (calls per week, texts per day)
    2. Dynamic segmentation rules (intent tiers)
    3. Personalized message angle (equity leverage, market trends)
  </prompt>
  <output-format>
    JSON object: { "cadence": {}, "segments": [], "messageAngle": "" }
  </output-format>
</poml>`,
		variables: [
			"leadList",
			"estimatedEquityPercentage",
			"sellerIntentScore",
			"leadScore",
			"budget",
		],
		tags: ["campaign", "predictive", "intent", "equity", "ai-powered"],
		isBuiltIn: true,
	},
	{
		id: "multi_channel_campaign_sequences",
		name: "Multi-Channel Campaign Sequences",
		description: "3-channel outreach strategy with budget allocation",
		category: "campaign",
		content: `<poml>
  <role>You are a Multi-Channel Campaign Strategist for DealScale.</role>
  <task>Design a 3-channel outreach campaign for the provided variables.</task>
  <variables>
    {{ campaignName }}
    {{ leadList }}
    {{ location }}
    {{ leadSource }}
    {{ budget }}
    {{ contactStatus }}
  </variables>
  <prompt>
    Develop a campaign named {{ campaignName }} targeting {{ leadList }} in {{ location }} from {{ leadSource }}.
    - Allocate outreach across Call, SMS, and Social channels.
    - Adjust volume based on {{ budget }}.
    - Adapt messaging to contactStatus (new, engaged, cold).

    Provide:
    • Channel distribution plan (%)
    • Message template type per channel
    • Daily/weekly activity pacing
    • Expected engagement benchmarks
  </prompt>
  <output-format>
    JSON object: { "channels": {}, "templates": {}, "schedule": {}, "benchmarks": {} }
  </output-format>
</poml>`,
		variables: [
			"campaignName",
			"leadList",
			"location",
			"leadSource",
			"budget",
			"contactStatus",
		],
		tags: ["campaign", "multi-channel", "outreach", "budget", "sequences"],
		isBuiltIn: true,
	},
	{
		id: "enterprise_multitenant_campaign",
		name: "Enterprise Campaign (Multi-Tenant RLS)",
		description:
			"Tenant-specific campaign with row-level security and vector personalization",
		category: "campaign",
		content: `<poml>
  <role>You are the Enterprise Campaign Builder Agent within DealScale's Multi-Tenant AI system.</role>
  <task>Create a tenant-specific campaign with Row Level Security and vector personalization.</task>
  <variables>
    {{ tenantId }}
    {{ campaignName }}
    {{ leadList }}
    {{ location }}
    {{ propertyType }}
    {{ budget }}
  </variables>
  <prompt>
    Build a private campaign for tenant {{ tenantId }}:
    - Use data from {{ leadList }} partition.
    - Generate tenant-specific vectors.
    - Only access rows where tenant_id = {{ tenantId }}.
    - Target {{ propertyType }} properties in {{ location }}.
    - Allocate spend dynamically based on {{ budget }}.

    Output configuration:
    1. Secure RLS filters
    2. Personalized vector embeddings summary
    3. Campaign objectives and performance metrics
  </prompt>
  <output-format>
    JSON object: { "RLS_filters": {}, "vectorSummary": {}, "objectives": {}, "KPIs": {} }
  </output-format>
</poml>`,
		variables: [
			"tenantId",
			"campaignName",
			"leadList",
			"location",
			"propertyType",
			"budget",
		],
		tags: ["campaign", "enterprise", "multi-tenant", "rls", "security"],
		isBuiltIn: true,
	},
	{
		id: "feedback_optimized_campaign_creation",
		name: "Auto-Optimized Campaign (Feedback Loop)",
		description: "Generate optimized campaign from prior performance data",
		category: "campaign",
		content: `<poml>
  <role>You are the Feedback-Driven Campaign Optimizer Agent using A2A protocol.</role>
  <task>Review prior campaign data and generate a new optimized campaign plan.</task>
  <variables>
    {{ campaignName }}
    {{ leadSource }}
    {{ responseRate }}
  </variables>
  <prompt>
    Evaluate performance from {{ campaignName }}:
    - ResponseRate: {{ responseRate }}%
    - Identify underperforming segments from {{ leadSource }}

    Adjust:
    • Similarity threshold (if conv < 5%)
    • Geo radius (if resp < 10%)
    • Outreach timing based on historical engagement hours

    Return an updated campaign blueprint that improves KPIs by ≥15%.
  </prompt>
  <output-format>
    JSON object: { "updatedFilters": {}, "timingAdjustments": {}, "expectedLift": "" }
  </output-format>
</poml>`,
		variables: ["campaignName", "leadSource", "responseRate"],
		tags: ["campaign", "optimization", "feedback-loop", "a2a", "performance"],
		isBuiltIn: true,
	},
	{
		id: "campaign_activation_workflow",
		name: "Campaign Activation Workflow",
		description: "Convert campaign config into executable MCP pipeline",
		category: "campaign",
		content: `<poml>
  <role>You are the Campaign Activator Agent in DealScale's MCP Orchestrator.</role>
  <task>Convert the campaign configuration into an actionable pipeline using registered MCP functions.</task>
  <variables>
    {{ campaignName }}
    {{ leadList }}
    {{ tenantId }}
  </variables>
  <workflow>
    <step id="1" label="Create Campaign Record">
      <call function="analyzeLeadList" with="leadList={{ leadList }}" />
    </step>
    <step id="2" label="Build Audience">
      <call function="scoreLookalike" with="seedListID={{ leadList }}, tenantId={{ tenantId }}" />
    </step>
    <step id="3" label="Launch Outreach">
      <parallel>
        <call agent="CallQualifier" function="callOutreach" />
        <call agent="TextNurturer" function="textOutreach" />
      </parallel>
    </step>
    <step id="4" label="Track Campaign">
      <call function="trackPerformance" with="campaignID={{ campaignName }}" />
    </step>
  </workflow>
  <output-format>
    Campaign status log and performance summary
  </output-format>
</poml>`,
		variables: ["campaignName", "leadList", "tenantId"],
		tags: ["campaign", "activation", "workflow", "mcp", "pipeline"],
		isBuiltIn: true,
	},

	// === SIMPLE CAMPAIGN TEMPLATES ===
	{
		id: "simple_sms_campaign",
		name: "Simple SMS Campaign",
		description: "Quick text message campaign setup",
		category: "campaign",
		content: `Create a simple SMS campaign for {{leadList}}.

Campaign: {{campaignName}}
Target: {{leadList}} in {{location}}
Budget: {{budget}}

Set up:
1. Campaign name and goal
2. SMS message template with {{prospectFirstName}} personalization
3. Sending schedule (time and frequency)
4. Expected response rate

Keep it simple and focused on text outreach only.`,
		variables: [
			"leadList",
			"campaignName",
			"location",
			"budget",
			"prospectFirstName",
		],
		tags: ["simple", "campaign", "sms", "text"],
		isBuiltIn: true,
	},
	{
		id: "simple_call_campaign",
		name: "Simple Call Campaign",
		description: "Quick voice outreach campaign setup",
		category: "campaign",
		content: `Create a simple call campaign for {{leadList}}.

Campaign: {{campaignName}}
Target audience: {{leadList}}
Location: {{location}}

Configure:
1. Campaign objective
2. Call script using {{prospectFirstName}} and {{propertyAddress}}
3. Calling hours and attempts
4. Success criteria

Focus on voice outreach only.`,
		variables: [
			"leadList",
			"campaignName",
			"location",
			"prospectFirstName",
			"propertyAddress",
		],
		tags: ["simple", "campaign", "call", "voice"],
		isBuiltIn: true,
	},
	{
		id: "simple_investor_campaign",
		name: "Simple Investor Outreach Campaign",
		description: "Quick campaign targeting cash investors",
		category: "campaign",
		content: `Set up investor outreach campaign for {{location}}.

Target:
- Cash investors looking for {{propertyType}}
- Budget range: {{budget}}
- Location: {{location}}

Create campaign plan:
1. Audience description
2. Primary channel (call or text)
3. Key message angle
4. Timeline (days to run)`,
		variables: ["location", "propertyType", "budget"],
		tags: ["simple", "campaign", "investor", "quick"],
		isBuiltIn: true,
	},
	{
		id: "simple_followup_campaign",
		name: "Simple Follow-Up Campaign",
		description: "Quick re-engagement campaign for non-responders",
		category: "campaign",
		content: `Create a follow-up campaign for {{leadList}} who haven't responded.

Current status: {{contactStatus}}
Original campaign: {{campaignName}}

Plan:
1. Select best channel for follow-up
2. Craft re-engagement message
3. Set timing (days after first contact)
4. Define success metric

Keep it brief and focused.`,
		variables: ["leadList", "contactStatus", "campaignName"],
		tags: ["simple", "campaign", "followup", "nurture"],
		isBuiltIn: true,
	},
	{
		id: "simple_location_campaign",
		name: "Simple Location-Based Campaign",
		description: "Quick geographic-targeted campaign",
		category: "campaign",
		content: `Create a location-based campaign for {{location}}.

Target:
- Location: {{location}}
- Property type: {{propertyType}}
- Lead source: {{leadSource}}

Setup:
1. Campaign goal
2. Geographic targeting parameters
3. Outreach message focusing on local market
4. Expected reach

Simple geographic focus only.`,
		variables: ["location", "propertyType", "leadSource"],
		tags: ["simple", "campaign", "location", "geographic"],
		isBuiltIn: true,
	},
	{
		id: "simple_test_campaign",
		name: "Simple Test Campaign",
		description: "Quick small-scale test campaign setup",
		category: "campaign",
		content: `Set up a small test campaign from {{leadList}}.

Parameters:
- Test size: 50-100 leads from {{leadList}}
- Campaign name: {{campaignName}}
- Budget: {{budget}}

Configure:
1. Select test audience subset
2. Choose one channel (call, text, or email)
3. Define success metric
4. Set 3-5 day test duration

Quick test to validate before scaling.`,
		variables: ["leadList", "campaignName", "budget"],
		tags: ["simple", "campaign", "test", "ab-test"],
		isBuiltIn: true,
	},

	// === OTHER PROMPT CATEGORIES ===
	{
		id: "multi_channel_outreach",
		name: "Multi-Channel Outreach Message",
		description: "Create 3-touch sequence: Email, SMS, and Call script",
		category: "outreach",
		content: `You are a high-impact outreach writer working with DealScale.
Given the variables:
• prospectFirstName = {{ prospectFirstName }}
• location = {{ location }}
• propertyAddress = {{ propertyAddress }}
• ownerTimeInProperty = {{ ownerTimeInProperty }} years
• vertical = {{ vertical }}

Task: Create a **three-touch outreach sequence** (Email, SMS, Call script) tailored to the above prospect for an off-market property exit. Use a friendly, professional tone, include personalization, and end each with a clear next-step CTA.

Output format:
• Email Subject + Body
• SMS Message
• Call Script`,
		variables: [
			"prospectFirstName",
			"location",
			"propertyAddress",
			"ownerTimeInProperty",
			"vertical",
		],
		tags: ["outreach", "email", "sms", "call", "sequence"],
		isBuiltIn: true,
	},

	// === SIMPLE OUTREACH TEMPLATES ===
	{
		id: "simple_sms_message",
		name: "Simple SMS Message",
		description: "Quick personalized SMS message template",
		category: "outreach",
		content: `Create a short SMS message for {{prospectFirstName}}.

Details:
- Property: {{propertyAddress}} in {{location}}
- Owner name: {{prospectFirstName}}
- Agent: {{agentName}}

Write a friendly 2-3 sentence SMS asking if they're interested in an off-market offer. Include a call-to-action.`,
		variables: [
			"prospectFirstName",
			"propertyAddress",
			"location",
			"agentName",
		],
		tags: ["simple", "sms", "text", "quick"],
		isBuiltIn: true,
	},
	{
		id: "simple_call_script",
		name: "Simple Call Script",
		description: "Quick personalized call script template",
		category: "outreach",
		content: `Create a brief call script for {{prospectFirstName}}.

Context:
- Prospect: {{prospectFirstName}}
- Property: {{propertyAddress}}
- Location: {{location}}
- Agent: {{agentName}}

Write a 30-second introduction script. Include:
- Greeting
- Reason for call
- Value proposition
- Question to engage`,
		variables: [
			"prospectFirstName",
			"propertyAddress",
			"location",
			"agentName",
		],
		tags: ["simple", "call", "phone", "script"],
		isBuiltIn: true,
	},
	{
		id: "simple_email_template",
		name: "Simple Email Template",
		description: "Quick personalized email template",
		category: "outreach",
		content: `Write a short email to {{prospectFirstName}}.

Details:
- Recipient: {{prospectFirstName}}
- Property: {{propertyAddress}} in {{location}}
- From: {{agentName}}

Create:
- Subject line (under 50 characters)
- Email body (3-4 sentences)
- Call-to-action

Keep it professional and personalized.`,
		variables: [
			"prospectFirstName",
			"propertyAddress",
			"location",
			"agentName",
		],
		tags: ["simple", "email", "template", "quick"],
		isBuiltIn: true,
	},
	{
		id: "simple_followup_message",
		name: "Simple Follow-Up Message",
		description: "Quick follow-up message after no response",
		category: "outreach",
		content: `Create a follow-up message for {{prospectFirstName}} who hasn't responded.

Context:
- First contact was {{contactStatus}} days ago
- Property: {{propertyAddress}}
- Agent: {{agentName}}

Write a brief, friendly follow-up that:
- References previous contact
- Adds new value/urgency
- Makes it easy to respond`,
		variables: [
			"prospectFirstName",
			"contactStatus",
			"propertyAddress",
			"agentName",
		],
		tags: ["simple", "followup", "nurture", "quick"],
		isBuiltIn: true,
	},
	{
		id: "data_enrichment_plan",
		name: "Data Enrichment Recommendation",
		description: "Strategic plan for enriching lead data with skip trace",
		category: "enrichment",
		content: `You are a data enrichment strategist for DealScale.
Input data:
• A lead list named {{ leadList }} with records
• Known fields: leadSource, contactStatus, skipTraceStatus
• Missing/high-priorities: ownerTimeInProperty, estimatedEquityPercentage, isOutOfStateOwner

Task: Recommend an **enrichment plan** with:
1. Which additional data fields to collect (list)
2. Suggested skip-trace provider(s) + API workflow
3. Estimated lift (qualitative) in conversion if enriched
4. Timeline and cost estimate

Output as a structured list.`,
		variables: [
			"leadList",
			"leadSource",
			"contactStatus",
			"skipTraceStatus",
			"ownerTimeInProperty",
			"estimatedEquityPercentage",
			"isOutOfStateOwner",
		],
		tags: ["enrichment", "skip-trace", "data", "planning"],
		isBuiltIn: true,
	},

	// === SIMPLE ENRICHMENT TEMPLATES ===
	{
		id: "simple_skip_trace",
		name: "Simple Skip Trace Request",
		description: "Quick skip trace enrichment for a lead list",
		category: "enrichment",
		content: `Enrich {{leadList}} with skip trace data.

Current status: {{skipTraceStatus}}

Add:
- Phone numbers
- Email addresses
- Property details

Return enriched lead count and data completeness percentage.`,
		variables: ["leadList", "skipTraceStatus"],
		tags: ["simple", "skip-trace", "enrichment", "quick"],
		isBuiltIn: true,
	},
	{
		id: "simple_property_data",
		name: "Simple Property Data Lookup",
		description: "Quick property details enrichment",
		category: "enrichment",
		content: `Get property details for {{propertyAddress}} in {{location}}.

Fetch:
- Property type: {{propertyType}}
- Estimated value
- Owner tenure: {{ownerTimeInProperty}}
- Equity: {{estimatedEquityPercentage}}%

Return: Property summary with owner info.`,
		variables: [
			"propertyAddress",
			"location",
			"propertyType",
			"ownerTimeInProperty",
			"estimatedEquityPercentage",
		],
		tags: ["simple", "property", "lookup", "quick"],
		isBuiltIn: true,
	},
	{
		id: "simple_contact_info",
		name: "Simple Contact Info Enrichment",
		description: "Quick contact information lookup for leads",
		category: "enrichment",
		content: `Find contact information for leads in {{leadList}}.

Current data:
- Lead source: {{leadSource}}
- Skip trace status: {{skipTraceStatus}}

Get:
- Valid phone numbers
- Valid email addresses
- Mailing addresses

Return: Contact data completeness score and updated records.`,
		variables: ["leadList", "leadSource", "skipTraceStatus"],
		tags: ["simple", "contact", "phone", "email"],
		isBuiltIn: true,
	},
	{
		id: "simple_owner_details",
		name: "Simple Owner Details Lookup",
		description: "Quick owner information enrichment",
		category: "enrichment",
		content: `Get owner details for properties in {{leadList}}.

Find:
- Owner name
- How long owned: {{ownerTimeInProperty}}
- Out-of-state: {{isOutOfStateOwner}}
- Equity: {{estimatedEquityPercentage}}%

Return: Owner profile summary for each property.`,
		variables: [
			"leadList",
			"ownerTimeInProperty",
			"isOutOfStateOwner",
			"estimatedEquityPercentage",
		],
		tags: ["simple", "owner", "details", "quick"],
		isBuiltIn: true,
	},
	{
		id: "campaign_performance_review",
		name: "Campaign Performance Analysis",
		description:
			"Analyze campaign metrics and provide actionable recommendations",
		category: "analytics",
		content: `You are a campaign analytics consultant for DealScale.
Campaign: {{ campaignName }}
Metrics: leadVolume, contactRate, conversionRate, costPerLead, budgetSpent
Target goal: conversion rate and CPA targets

Task: Analyze campaign performance and provide:
1. Three key insights (what worked, what didn't)
2. Two actionable recommendations (what to adjust)
3. Forecast impacts of recommended changes (quantitative if possible)

Output in bullet format, with section headings: Insights, Recommendations, Forecast.`,
		variables: ["campaignName", "responseRate", "budget", "leadList"],
		tags: ["analytics", "performance", "optimization", "kpi"],
		isBuiltIn: true,
	},

	// === SIMPLE ANALYTICS TEMPLATES ===
	{
		id: "simple_response_rate_check",
		name: "Simple Response Rate Check",
		description: "Quick analysis of campaign response rates",
		category: "analytics",
		content: `Analyze the response rate for {{campaignName}}.

Current metrics:
- Response rate: {{responseRate}}%
- Lead count: from {{leadList}}
- Contact status distribution: {{contactStatus}}

Provide:
1. Is the response rate good, average, or poor?
2. One quick recommendation to improve it
3. Expected improvement percentage`,
		variables: ["campaignName", "responseRate", "leadList", "contactStatus"],
		tags: ["simple", "analytics", "response-rate", "quick-check"],
		isBuiltIn: true,
	},
	{
		id: "simple_lead_quality_score",
		name: "Simple Lead Quality Score",
		description: "Quick assessment of lead list quality",
		category: "analytics",
		content: `Evaluate the quality of {{leadList}}.

Check:
- Average lead score: {{leadScore}}
- Skip trace status: {{skipTraceStatus}}
- Seller intent: {{sellerIntentScore}}

Output:
- Overall quality grade (A-F)
- Top strength
- Top weakness`,
		variables: [
			"leadList",
			"leadScore",
			"skipTraceStatus",
			"sellerIntentScore",
		],
		tags: ["simple", "analytics", "quality", "scoring"],
		isBuiltIn: true,
	},
	{
		id: "simple_budget_analysis",
		name: "Simple Budget Analysis",
		description: "Quick budget utilization and efficiency check",
		category: "analytics",
		content: `Analyze budget efficiency for {{campaignName}}.

Data:
- Budget allocated: {{budget}}
- Leads contacted: from {{leadList}}
- Response rate: {{responseRate}}%

Calculate:
- Cost per response
- Is budget being used efficiently?
- Recommendation: increase, decrease, or maintain budget`,
		variables: ["campaignName", "budget", "leadList", "responseRate"],
		tags: ["simple", "analytics", "budget", "efficiency"],
		isBuiltIn: true,
	},
	{
		id: "simple_conversion_tracker",
		name: "Simple Conversion Tracker",
		description: "Quick conversion rate analysis and comparison",
		category: "analytics",
		content: `Track conversion performance for {{campaignName}}.

Metrics:
- Response rate: {{responseRate}}%
- Contact status: {{contactStatus}}
- Lead score: {{leadScore}}

Analyze:
1. Current conversion trend (improving/declining/stable)
2. Compare to industry benchmark (5-10% typical)
3. One action to boost conversions`,
		variables: ["campaignName", "responseRate", "contactStatus", "leadScore"],
		tags: ["simple", "analytics", "conversion", "tracking"],
		isBuiltIn: true,
	},
	{
		id: "simple_audience_insights",
		name: "Simple Audience Insights",
		description: "Quick demographic and property analysis of audience",
		category: "analytics",
		content: `Provide quick insights on {{leadList}} audience.

Analyze:
- Property type distribution: {{propertyType}}
- Location concentration: {{location}}
- Equity levels: {{estimatedEquityPercentage}}%
- Owner tenure: {{ownerTimeInProperty}} years

Summarize:
- Who is this audience? (in 1 sentence)
- Best outreach approach (call/text/email)
- Estimated conversion potential (high/medium/low)`,
		variables: [
			"leadList",
			"propertyType",
			"location",
			"estimatedEquityPercentage",
			"ownerTimeInProperty",
		],
		tags: ["simple", "analytics", "audience", "insights"],
		isBuiltIn: true,
	},
	{
		id: "simple_roi_calculator",
		name: "Simple ROI Calculator",
		description: "Quick return on investment calculation for campaigns",
		category: "analytics",
		content: `Calculate ROI for {{campaignName}}.

Input:
- Budget spent: {{budget}}
- Leads generated: from {{leadList}}
- Response rate: {{responseRate}}%

Calculate and return:
- Cost per lead
- Cost per response
- Simple ROI assessment (positive/negative/break-even)
- Recommendation: continue, optimize, or pause`,
		variables: ["campaignName", "budget", "leadList", "responseRate"],
		tags: ["simple", "analytics", "roi", "calculator"],
		isBuiltIn: true,
	},
	{
		id: "agent_routing_workflow",
		name: "Agent Routing Workflow",
		description: "Create multi-agent orchestration and handoff logic",
		category: "workflow",
		content: `You are an orchestration engineer at DealScale.
We have multiple agents: {{ inboundCallResponder }}, {{ textNurturer }}, {{ multiChannelOutreach }}.
Current event: lead just submitted "contact form" from {{ leadSource }} in {{ location }}.
Lead data: ownerTimeInProperty = {{ ownerTimeInProperty }}, skipTraceStatus = {{ skipTraceStatus }}.

Task: Create a **routing workflow** that determines which agent(s) to trigger, in what sequence, and what outcome actions (tagging, notification, CRM update).

Output:
• Step-by-step workflow (agent, condition, triggering event)
• Timing / scheduling rules
• CRM/DB updates required`,
		variables: [
			"inboundCallResponder",
			"textNurturer",
			"multiChannelOutreach",
			"leadSource",
			"location",
			"ownerTimeInProperty",
			"skipTraceStatus",
		],
		tags: ["workflow", "orchestration", "routing", "agents"],
		isBuiltIn: true,
	},

	// === SIMPLE WORKFLOW TEMPLATES (n8n, Make, Kestra) ===
	{
		id: "simple_n8n_lead_enrichment",
		name: "n8n: Simple Lead Enrichment",
		description: "Quick n8n workflow for lead enrichment on webhook trigger",
		category: "workflow",
		content: `<poml version="1.0">
  <workflow name="Lead Enrichment Pipeline">
    <trigger type="webhook">
      <event>lead.created</event>
    </trigger>
    
    <phase name="enrichment">
      <task>{{enrichLead}} with premium data</task>
      <task>Validate email and phone</task>
    </phase>
    
    <phase name="notification">
      <task>{{sendWebhook}} to {{webhookUrl}}</task>
      <task>{{updateCRM}} with enriched data</task>
    </phase>
    
    <output>
      <return>enriched_lead_data</return>
    </output>
  </workflow>
</poml>`,
		variables: ["enrichLead", "sendWebhook", "webhookUrl", "updateCRM"],
		tags: ["n8n", "simple", "enrichment", "webhook"],
		isBuiltIn: true,
	},
	{
		id: "simple_make_lead_sync",
		name: "Make.com: CRM Lead Sync",
		description: "Quick Make scenario to sync leads from webhook to CRM",
		category: "workflow",
		content: `<poml version="1.0">
  <workflow name="CRM Lead Sync">
    <trigger type="webhook">
      <event>new.lead</event>
    </trigger>
    
    <phase name="process">
      <task>Parse {{leadList}} data</task>
      <task>{{updateCRM}} with {{leadSource}} info</task>
    </phase>
    
    <phase name="notify">
      <task>Send notification to {{webhookUrl}}</task>
    </phase>
  </workflow>
</poml>`,
		variables: ["leadList", "leadSource", "updateCRM", "webhookUrl"],
		tags: ["make", "simple", "crm", "sync"],
		isBuiltIn: true,
	},
	{
		id: "simple_kestra_daily_report",
		name: "Kestra: Daily Campaign Report",
		description:
			"Scheduled Kestra workflow for daily campaign performance reports",
		category: "workflow",
		content: `<poml version="1.0">
  <workflow name="Daily Campaign Report">
    <trigger type="schedule">
      <cron>0 9 * * *</cron>
    </trigger>
    
    <phase name="fetch">
      <task>{{trackPerformance}} for {{campaignName}}</task>
      <task>Calculate metrics and trends</task>
    </phase>
    
    <phase name="report">
      <task>Generate report PDF</task>
      <task>{{sendWebhook}} to {{webhookUrl}}</task>
    </phase>
  </workflow>
</poml>`,
		variables: [
			"trackPerformance",
			"campaignName",
			"sendWebhook",
			"webhookUrl",
		],
		tags: ["kestra", "simple", "report", "scheduled"],
		isBuiltIn: true,
	},
	{
		id: "simple_n8n_multi_channel",
		name: "n8n: Multi-Channel Outreach",
		description: "Simple n8n workflow for coordinated SMS and email outreach",
		category: "workflow",
		content: `<poml version="1.0">
  <workflow name="Multi-Channel Outreach">
    <trigger type="webhook">
      <event>campaign.start</event>
    </trigger>
    
    <phase name="outreach">
      <parallel>
        <task>{{textOutreach}} to {{leadList}}</task>
        <task>Email outreach to {{leadList}}</task>
      </parallel>
    </phase>
    
    <phase name="track">
      <task>{{trackPerformance}} for {{campaignName}}</task>
    </phase>
  </workflow>
</poml>`,
		variables: ["textOutreach", "leadList", "campaignName", "trackPerformance"],
		tags: ["n8n", "simple", "multi-channel", "outreach"],
		isBuiltIn: true,
	},
	{
		id: "simple_make_lead_scoring",
		name: "Make.com: Lead Scoring Automation",
		description: "Quick Make workflow to score and route leads automatically",
		category: "workflow",
		content: `<poml version="1.0">
  <workflow name="Lead Scoring & Routing">
    <trigger type="webhook">
      <event>lead.updated</event>
    </trigger>
    
    <phase name="score">
      <task>Calculate {{leadScore}} based on criteria</task>
      <task>Evaluate {{sellerIntentScore}}</task>
    </phase>
    
    <phase name="route">
      <if condition="leadScore > 70">
        <task>Route to sales team via {{webhookUrl}}</task>
      </if>
      <else>
        <task>Add to nurture campaign</task>
      </else>
    </phase>
  </workflow>
</poml>`,
		variables: ["leadScore", "sellerIntentScore", "webhookUrl"],
		tags: ["make", "simple", "scoring", "routing"],
		isBuiltIn: true,
	},
	{
		id: "simple_kestra_lead_import",
		name: "Kestra: CSV Lead Import",
		description: "Simple Kestra flow for processing CSV lead imports",
		category: "workflow",
		content: `<poml version="1.0">
  <workflow name="CSV Lead Import">
    <trigger type="file">
      <path>/uploads/leads.csv</path>
    </trigger>
    
    <phase name="process">
      <task>Parse CSV file</task>
      <task>{{bulkEnrich}} {{leadList}} data</task>
      <task>Deduplicate records</task>
    </phase>
    
    <phase name="save">
      <task>Save to database with {{tenantId}}</task>
      <task>Notify via {{webhookUrl}}</task>
    </phase>
  </workflow>
</poml>`,
		variables: ["leadList", "bulkEnrich", "tenantId", "webhookUrl"],
		tags: ["kestra", "simple", "csv", "import"],
		isBuiltIn: true,
	},
	{
		id: "simple_make_webhook_to_campaign",
		name: "Make.com: Webhook to Campaign",
		description: "Simple Make scenario to create campaign from webhook data",
		category: "workflow",
		content: `<poml version="1.0">
  <workflow name="Webhook to Campaign">
    <trigger type="webhook">
      <event>lead.batch.ready</event>
    </trigger>
    
    <phase name="prepare">
      <task>Parse {{leadList}} from webhook</task>
      <task>{{analyzeLeadList}} for quality</task>
    </phase>
    
    <phase name="create">
      <task>{{createCampaign}} with {{campaignName}}</task>
      <task>{{textOutreach}} to {{leadList}}</task>
    </phase>
  </workflow>
</poml>`,
		variables: [
			"leadList",
			"analyzeLeadList",
			"createCampaign",
			"campaignName",
			"textOutreach",
		],
		tags: ["make", "simple", "webhook", "campaign"],
		isBuiltIn: true,
	},
	{
		id: "make_poml_enrichment_flow",
		name: "Make.com: Advanced Lead Enrichment",
		description: "Advanced Make scenario with skip trace and validation",
		category: "workflow",
		content: `<poml version="1.0">
  <meta>
    <title>Make.com Advanced Lead Enrichment</title>
    <version>1.0</version>
  </meta>

  <context>
    <role>You are the DataEngineer Agent for Make.com workflows.</role>
    <goal>Enrich leads with skip trace data and validate completeness.</goal>
  </context>

  <variables>
    {{leadList}} {{tenantId}} {{skipTraceStatus}} {{leadScore}}
  </variables>

  <workflow id="make_enrichment">
    <phase id="1" label="Trigger & Fetch">
      <trigger type="webhook" endpoint="/make/enrich" />
      <call function="analyzeLeadList" with="leadList={{leadList}}" />
      <save to="leadData.raw" />
    </phase>

    <phase id="2" label="Enrich">
      <call function="bulkEnrich" with="leadList={{leadList}}, tenantId={{tenantId}}" />
      <save to="leadData.enriched" />
    </phase>

    <phase id="3" label="Validate & Score">
      <if condition="{{skipTraceStatus}} == 'complete'">
        <call function="scoreLookalike" with="seedList={{leadData.enriched}}" />
        <save to="leadData.scored" />
      </if>
      <else>
        <task>Flag for manual review</task>
      </else>
    </phase>

    <phase id="4" label="Export">
      <call function="exportAudience" with="audience={{leadData.scored}}" />
      <task>Send notification to {{webhookUrl}}</task>
    </phase>
  </workflow>
</poml>`,
		variables: [
			"leadList",
			"tenantId",
			"skipTraceStatus",
			"leadScore",
			"webhookUrl",
		],
		tags: ["make", "advanced", "enrichment", "skip-trace", "poml"],
		isBuiltIn: true,
	},
	{
		id: "make_poml_campaign_activation",
		name: "Make.com: Campaign Activation Flow",
		description: "Advanced Make scenario for multi-channel campaign activation",
		category: "workflow",
		content: `<poml version="1.0">
  <meta>
    <title>Make.com Campaign Activation</title>
    <version>1.0</version>
  </meta>

  <context>
    <role>You are the CampaignOrchestrator Agent for Make.com.</role>
    <goal>Launch multi-channel campaigns with call, text, and email coordination.</goal>
  </context>

  <variables>
    {{campaignName}} {{leadList}} {{budget}} {{location}}
  </variables>

  <workflow id="make_campaign">
    <phase id="1" label="Create Campaign">
      <call function="createCampaign" 
            with="name={{campaignName}}, audience={{leadList}}, budget={{budget}}" />
      <save to="campaignContext.id" />
    </phase>

    <phase id="2" label="Multi-Channel Launch">
      <parallel>
        <call agent="CallQualifier" function="callOutreach" 
              with="campaignID={{campaignContext.id}}" />
        <call agent="TextNurturer" function="textOutreach" 
              with="campaignID={{campaignContext.id}}" />
      </parallel>
    </phase>

    <phase id="3" label="Track & Optimize">
      <call function="trackPerformance" 
            with="campaignID={{campaignContext.id}}" />
      <save to="performanceState.metrics" />
    </phase>
  </workflow>
</poml>`,
		variables: ["campaignName", "leadList", "budget", "location"],
		tags: ["make", "advanced", "campaign", "multi-channel", "poml"],
		isBuiltIn: true,
	},
	{
		id: "make_poml_lookalike_builder",
		name: "Make.com: Look-Alike Audience Builder",
		description:
			"Advanced Make scenario for similarity-based audience generation",
		category: "workflow",
		content: `<poml version="1.0">
  <meta>
    <title>Make.com Look-Alike Builder</title>
    <version>1.0</version>
  </meta>

  <context>
    <role>You are the AudienceArchitect Agent for Make.com.</role>
    <goal>Generate look-alike audiences using similarity scoring.</goal>
  </context>

  <variables>
    {{leadList}} {{location}} {{propertyType}} {{estimatedEquityPercentage}}
  </variables>

  <workflow id="make_lookalike">
    <phase id="1" label="Analyze Seed">
      <call function="analyzeLeadList" with="seedList={{leadList}}" />
      <save to="audienceState.seed" />
    </phase>

    <phase id="2" label="Score Similarities">
      <call function="scoreLookalike" 
            with="seedList={{leadList}}, filters:{location:'{{location}}', propertyType:'{{propertyType}}'}" />
      <save to="audienceState.raw" />
    </phase>

    <phase id="3" label="Filter & Rank">
      <call function="filterProspects" 
            with="scores={{audienceState.raw}}, minEquity={{estimatedEquityPercentage}}" />
      <save to="audienceState.final" />
    </phase>

    <phase id="4" label="Export">
      <call function="exportAudience" with="audience={{audienceState.final}}" />
    </phase>
  </workflow>
</poml>`,
		variables: [
			"leadList",
			"location",
			"propertyType",
			"estimatedEquityPercentage",
		],
		tags: ["make", "advanced", "lookalike", "audience", "poml"],
		isBuiltIn: true,
	},
	{
		id: "simple_make_daily_sync",
		name: "Make.com: Daily CRM Sync",
		description: "Scheduled Make scenario for daily CRM synchronization",
		category: "workflow",
		content: `<poml version="1.0">
  <workflow name="Daily CRM Sync">
    <trigger type="schedule">
      <cron>0 8 * * *</cron>
    </trigger>
    
    <phase name="fetch">
      <task>Get updated leads from {{leadList}}</task>
      <task>Filter by {{contactStatus}}</task>
    </phase>
    
    <phase name="sync">
      <task>{{updateCRM}} with changes</task>
      <task>Log sync results</task>
    </phase>
  </workflow>
</poml>`,
		variables: ["leadList", "contactStatus", "updateCRM"],
		tags: ["make", "simple", "scheduled", "crm"],
		isBuiltIn: true,
	},
];

/**
 * User Prompts Store State
 */
interface UserPromptsState {
	// Templates (built-in + custom)
	templates: PromptTemplate[];
	setTemplates: (templates: PromptTemplate[]) => void;
	addTemplate: (template: Omit<PromptTemplate, "id" | "isBuiltIn">) => void;
	updateTemplate: (id: string, updates: Partial<PromptTemplate>) => void;
	deleteTemplate: (id: string) => void;

	// User's saved prompts
	savedPrompts: UserPrompt[];
	setSavedPrompts: (prompts: UserPrompt[]) => void;
	savePrompt: (
		prompt: Omit<UserPrompt, "id" | "createdAt" | "updatedAt">,
	) => void;
	updatePrompt: (id: string, updates: Partial<UserPrompt>) => void;
	deletePrompt: (id: string) => void;
	toggleFavorite: (id: string) => void;
	incrementUsage: (id: string) => void;

	// Filtering & search
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	selectedCategory: PromptCategory | "all";
	setSelectedCategory: (category: PromptCategory | "all") => void;

	// Get filtered templates
	getFilteredTemplates: () => PromptTemplate[];
	getFilteredPrompts: () => UserPrompt[];
	getTemplateById: (id: string) => PromptTemplate | undefined;
	getPromptById: (id: string) => UserPrompt | undefined;

	// Reset
	reset: () => void;
}

/**
 * User Prompts Store
 */
export const useUserPromptsStore = create<UserPromptsState>((set, get) => ({
	// Built-in templates
	templates: BUILT_IN_TEMPLATES,
	setTemplates: (templates) => set({ templates }),

	addTemplate: (template) => {
		const newTemplate: PromptTemplate = {
			...template,
			id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			isBuiltIn: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		set((state) => ({
			templates: [...state.templates, newTemplate],
		}));
	},

	updateTemplate: (id, updates) => {
		set((state) => ({
			templates: state.templates.map((t) =>
				t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t,
			),
		}));
	},

	deleteTemplate: (id) => {
		set((state) => ({
			templates: state.templates.filter((t) => t.id !== id && t.isBuiltIn),
		}));
	},

	// User's saved prompts
	savedPrompts: [],
	setSavedPrompts: (savedPrompts) => set({ savedPrompts }),

	savePrompt: (prompt) => {
		const newPrompt: UserPrompt = {
			...prompt,
			id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		set((state) => ({
			savedPrompts: [...state.savedPrompts, newPrompt],
		}));
	},

	updatePrompt: (id, updates) => {
		set((state) => ({
			savedPrompts: state.savedPrompts.map((p) =>
				p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p,
			),
		}));
	},

	deletePrompt: (id) => {
		set((state) => ({
			savedPrompts: state.savedPrompts.filter((p) => p.id !== id),
		}));
	},

	toggleFavorite: (id) => {
		set((state) => ({
			savedPrompts: state.savedPrompts.map((p) =>
				p.id === id ? { ...p, favorite: !p.favorite } : p,
			),
		}));
	},

	incrementUsage: (id) => {
		set((state) => ({
			savedPrompts: state.savedPrompts.map((p) =>
				p.id === id ? { ...p, usageCount: p.usageCount + 1 } : p,
			),
		}));
	},

	// Filtering & search
	searchQuery: "",
	setSearchQuery: (searchQuery) => set({ searchQuery }),

	selectedCategory: "all",
	setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

	// Get filtered templates
	getFilteredTemplates: () => {
		const { templates, searchQuery, selectedCategory } = get();

		return templates.filter((template) => {
			const matchesCategory =
				selectedCategory === "all" || template.category === selectedCategory;

			const matchesSearch =
				!searchQuery ||
				template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				template.description
					?.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				template.tags.some((tag) =>
					tag.toLowerCase().includes(searchQuery.toLowerCase()),
				);

			return matchesCategory && matchesSearch;
		});
	},

	getFilteredPrompts: () => {
		const { savedPrompts, searchQuery, selectedCategory } = get();

		return savedPrompts.filter((prompt) => {
			const matchesCategory =
				selectedCategory === "all" || prompt.category === selectedCategory;

			const matchesSearch =
				!searchQuery ||
				prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				prompt.tags.some((tag) =>
					tag.toLowerCase().includes(searchQuery.toLowerCase()),
				);

			return matchesCategory && matchesSearch;
		});
	},

	getTemplateById: (id) => {
		return get().templates.find((t) => t.id === id);
	},

	getPromptById: (id) => {
		return get().savedPrompts.find((p) => p.id === id);
	},

	// Reset
	reset: () =>
		set({
			templates: BUILT_IN_TEMPLATES,
			savedPrompts: [],
			searchQuery: "",
			selectedCategory: "all",
		}),
}));
