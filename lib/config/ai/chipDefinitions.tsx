/**
 * Centralized AI Chip Definitions
 * Single source of truth for variables, tools, agents, scripts, resources, and automations
 * Used across all AI generators (Campaign, Workflow, Search)
 */

import React from "react";
import type { ChipDefinition } from "@/components/reusables/ai/InlineChipEditor";
import {
	Target,
	Database,
	Users,
	TrendingUp,
	Zap,
	MapPin,
	DollarSign,
	Home,
	Clock,
	PieChart,
	ThumbsUp,
	Calendar,
	Building,
	Briefcase,
	Filter,
	MessageSquare,
	Phone,
	Mail,
	FileText,
	Megaphone,
	Brain,
	Cpu,
	Workflow,
	Repeat,
	RefreshCw,
	PlayCircle,
	Layers,
	Search as SearchIcon,
	Settings,
	Activity,
	Cloud,
} from "lucide-react";

// Platform Variables - Common across all generators
export const PLATFORM_VARIABLES: ChipDefinition[] = [
	{
		key: "campaignName",
		label: "Campaign Name",
		description: "Campaign identifier",
		type: "variable",
		icon: <Target className="h-3 w-3" />,
	},
	{
		key: "leadSource",
		label: "Lead Source",
		description: "Where leads came from",
		type: "variable",
		icon: <Database className="h-3 w-3" />,
	},
	{
		key: "leadList",
		label: "Lead List",
		description: "Target audience list",
		type: "variable",
		icon: <Users className="h-3 w-3" />,
	},
	{
		key: "leadScore",
		label: "Lead Score",
		description: "Quality score",
		type: "variable",
		icon: <TrendingUp className="h-3 w-3" />,
	},
	{
		key: "contactStatus",
		label: "Contact Status",
		description: "Last contact",
		type: "variable",
		icon: <Zap className="h-3 w-3" />,
	},
	{
		key: "location",
		label: "Location",
		description: "Geographic area",
		type: "variable",
		icon: <MapPin className="h-3 w-3" />,
	},
	{
		key: "budget",
		label: "Budget",
		description: "Campaign budget",
		type: "variable",
		icon: <DollarSign className="h-3 w-3" />,
	},
	{
		key: "propertyType",
		label: "Property Type",
		description: "Property category",
		type: "variable",
		icon: <Home className="h-3 w-3" />,
	},
	{
		key: "ownerTimeInProperty",
		label: "Owner Time in Property",
		description: "Years owner has held property",
		type: "variable",
		icon: <Clock className="h-3 w-3" />,
	},
	{
		key: "estimatedEquityPercentage",
		label: "Estimated Equity %",
		description: "Estimated equity percentage",
		type: "variable",
		icon: <PieChart className="h-3 w-3" />,
	},
	{
		key: "sellerIntentScore",
		label: "Seller Intent Score",
		description: "Motivation level",
		type: "variable",
		icon: <Target className="h-3 w-3" />,
	},
	{
		key: "responseRate",
		label: "Response Rate",
		description: "Engagement level",
		type: "variable",
		icon: <TrendingUp className="h-3 w-3" />,
	},
	{
		key: "prospectFirstName",
		label: "Prospect First Name",
		description: "Lead's first name",
		type: "variable",
		icon: <Users className="h-3 w-3" />,
	},
	{
		key: "propertyAddress",
		label: "Property Address",
		description: "Property location",
		type: "variable",
		icon: <MapPin className="h-3 w-3" />,
	},
	{
		key: "agentName",
		label: "Agent Name",
		description: "Sales agent name",
		type: "variable",
		icon: <Users className="h-3 w-3" />,
	},
	{
		key: "skipTraceStatus",
		label: "Skip Trace Status",
		description: "Enrichment status",
		type: "variable",
		icon: <SearchIcon className="h-3 w-3" />,
	},
	{
		key: "isOutOfStateOwner",
		label: "Is Out-of-State Owner",
		description: "Owner lives out of state",
		type: "variable",
		icon: <MapPin className="h-3 w-3" />,
	},
	{
		key: "lastContactedDaysAgo",
		label: "Last Contacted (Days Ago)",
		description: "Days since last contact",
		type: "variable",
		icon: <Calendar className="h-3 w-3" />,
	},
	{
		key: "tenantId",
		label: "Tenant ID",
		description: "Multi-tenant identifier",
		type: "variable",
		icon: <Building className="h-3 w-3" />,
	},
	{
		key: "dealClosedCount",
		label: "Deal Closed Count",
		description: "Number of deals closed",
		type: "variable",
		icon: <Target className="h-3 w-3" />,
	},
	{
		key: "vertical",
		label: "Vertical",
		description: "User type (wholesaler/agent/investor)",
		type: "variable",
		icon: <Briefcase className="h-3 w-3" />,
	},
	{
		key: "company",
		label: "Company Info",
		description: "Company information and branding",
		type: "variable",
		icon: <Settings className="h-3 w-3" />,
	},
	{
		key: "webhookUrl",
		label: "Webhook URL",
		description: "Webhook endpoint URL",
		type: "variable",
		icon: <Zap className="h-3 w-3" />,
	},
];

// AI Tools
export const PLATFORM_TOOLS: ChipDefinition[] = [
	{
		key: "analyzeLeadList",
		label: "Analyze Lead List",
		description: "Analyze lead quality and attributes",
		type: "tool",
		icon: <PieChart className="h-3 w-3" />,
	},
	{
		key: "filterProspects",
		label: "Filter Prospects",
		description: "Apply filters to narrow audience",
		type: "tool",
		icon: <Filter className="h-3 w-3" />,
	},
	{
		key: "scoreLookalike",
		label: "Score Look-Alike",
		description: "Compute similarity scores",
		type: "tool",
		icon: <Target className="h-3 w-3" />,
	},
	{
		key: "exportAudience",
		label: "Export Audience",
		description: "Export to external platforms",
		type: "tool",
		icon: <FileText className="h-3 w-3" />,
	},
	{
		key: "textOutreach",
		label: "Text Outreach",
		description: "Send automated SMS",
		type: "tool",
		icon: <MessageSquare className="h-3 w-3" />,
	},
	{
		key: "callOutreach",
		label: "Call Outreach",
		description: "Schedule voice calls",
		type: "tool",
		icon: <Phone className="h-3 w-3" />,
	},
	{
		key: "bulkEnrich",
		label: "Bulk Enrich",
		description: "Trigger skip tracing",
		type: "tool",
		icon: <Database className="h-3 w-3" />,
	},
	{
		key: "createCampaign",
		label: "Create Campaign",
		description: "Set up new campaign",
		type: "tool",
		icon: <Megaphone className="h-3 w-3" />,
	},
	{
		key: "trackPerformance",
		label: "Track Performance",
		description: "Fetch performance metrics",
		type: "tool",
		icon: <TrendingUp className="h-3 w-3" />,
	},
	{
		key: "enrichLead",
		label: "Enrich Lead",
		description: "Enrich lead data with additional information",
		type: "tool",
		icon: <Database className="h-3 w-3" />,
	},
	{
		key: "sendWebhook",
		label: "Send Webhook",
		description: "Send data to webhook endpoint",
		type: "tool",
		icon: <Zap className="h-3 w-3" />,
	},
	{
		key: "updateCRM",
		label: "Update CRM",
		description: "Update CRM with lead/campaign data",
		type: "tool",
		icon: <Cloud className="h-3 w-3" />,
	},
];

// AI Agents (A2A Protocol)
export const AI_AGENTS: ChipDefinition[] = [
	{
		key: "CallQualifier",
		label: "Call Qualifier Agent",
		description: "Voice outreach qualification",
		type: "agent",
		icon: <Phone className="h-3 w-3" />,
	},
	{
		key: "TextNurturer",
		label: "Text Nurturer Agent",
		description: "SMS nurture campaigns",
		type: "agent",
		icon: <MessageSquare className="h-3 w-3" />,
	},
	{
		key: "CampaignOrchestrator",
		label: "Campaign Orchestrator Agent",
		description: "Campaign management",
		type: "agent",
		icon: <Megaphone className="h-3 w-3" />,
	},
	{
		key: "MultiChannelAgent",
		label: "Multi-Channel Agent",
		description: "Coordinate across channels",
		type: "agent",
		icon: <Layers className="h-3 w-3" />,
	},
	{
		key: "PerformanceFeedback",
		label: "Performance Feedback Agent",
		description: "Optimize campaigns",
		type: "agent",
		icon: <TrendingUp className="h-3 w-3" />,
	},
	{
		key: "marketAnalyst",
		label: "Market Analyst Agent",
		description: "Analyzes market trends and pricing",
		type: "agent",
		icon: <TrendingUp className="h-3 w-3" />,
	},
	{
		key: "dealEvaluator",
		label: "Deal Evaluator Agent",
		description: "Evaluates property deals and ROI",
		type: "agent",
		icon: <DollarSign className="h-3 w-3" />,
	},
	{
		key: "propertyInspector",
		label: "Property Inspector Agent",
		description: "Analyzes property data",
		type: "agent",
		icon: <Home className="h-3 w-3" />,
	},
	{
		key: "negotiator",
		label: "Negotiator Agent",
		description: "Crafts negotiation strategies",
		type: "agent",
		icon: <MessageSquare className="h-3 w-3" />,
	},
	{
		key: "copywriter",
		label: "Marketing Copywriter Agent",
		description: "Generates marketing copy",
		type: "agent",
		icon: <FileText className="h-3 w-3" />,
	},
	{
		key: "workflowOrchestrator",
		label: "Workflow Orchestrator Agent",
		description: "Orchestrates multi-step workflows",
		type: "agent",
		icon: <Cpu className="h-3 w-3" />,
	},
	{
		key: "dataEnricher",
		label: "Data Enricher Agent",
		description: "Enriches lead and property data",
		type: "agent",
		icon: <Database className="h-3 w-3" />,
	},
];

// Resources
export const PLATFORM_RESOURCES: ChipDefinition[] = [
	{
		key: "campaignScript",
		label: "Campaign Script",
		description: "Messaging template",
		type: "resource",
		icon: <FileText className="h-3 w-3" />,
	},
	{
		key: "audienceSegment",
		label: "Audience Segment",
		description: "Target group",
		type: "resource",
		icon: <Users className="h-3 w-3" />,
	},
	{
		key: "performanceReport",
		label: "Performance Report",
		description: "Analytics data",
		type: "resource",
		icon: <PieChart className="h-3 w-3" />,
	},
	{
		key: "getLeadList",
		label: "Get Lead List",
		description: "Fetch lead list data",
		type: "resource",
		icon: <Database className="h-3 w-3" />,
	},
	{
		key: "getCampaignData",
		label: "Get Campaign Data",
		description: "Retrieve campaign metrics",
		type: "resource",
		icon: <Activity className="h-3 w-3" />,
	},
	{
		key: "getPropertyData",
		label: "Get Property Data",
		description: "Fetch property information",
		type: "resource",
		icon: <Home className="h-3 w-3" />,
	},
];

// Automations & Workflows
export const PLATFORM_AUTOMATIONS: ChipDefinition[] = [
	{
		key: "campaignSequence",
		label: "Campaign Sequence",
		description: "Multi-touch automation",
		type: "automation",
		icon: <Workflow className="h-3 w-3" />,
	},
	{
		key: "followUpFlow",
		label: "Follow-Up Flow",
		description: "Automated follow-ups",
		type: "automation",
		icon: <Repeat className="h-3 w-3" />,
	},
	{
		key: "leadNurture",
		label: "Lead Nurture",
		description: "Drip campaign",
		type: "automation",
		icon: <PlayCircle className="h-3 w-3" />,
	},
	{
		key: "kestraWorkflow",
		label: "Kestra Workflow",
		description: "Trigger a Kestra workflow",
		type: "automation",
		icon: <Workflow className="h-3 w-3" />,
	},
	{
		key: "n8nWorkflow",
		label: "n8n Workflow",
		description: "Trigger an n8n workflow",
		type: "automation",
		icon: <Workflow className="h-3 w-3" />,
	},
	{
		key: "makeScenario",
		label: "Make.com Scenario",
		description: "Trigger a Make.com scenario",
		type: "automation",
		icon: <Workflow className="h-3 w-3" />,
	},
	{
		key: "leadIngestionFlow",
		label: "Lead Ingestion Flow",
		description: "New lead enrichment workflow",
		type: "automation",
		icon: <Workflow className="h-3 w-3" />,
	},
];

/**
 * Get chips filtered by context (campaign, workflow, or search)
 */
export function getChipsForContext(
	context: "campaign" | "workflow" | "search",
): {
	variables: ChipDefinition[];
	tools: ChipDefinition[];
	agents: ChipDefinition[];
	scripts: ChipDefinition[];
	resources: ChipDefinition[];
	automations: ChipDefinition[];
} {
	// Base chips - available to all contexts
	const baseChips = {
		variables: PLATFORM_VARIABLES,
		tools: PLATFORM_TOOLS,
		agents: AI_AGENTS,
		scripts: [] as ChipDefinition[], // Dynamic from store
		resources: PLATFORM_RESOURCES,
		automations: PLATFORM_AUTOMATIONS,
	};

	// Context-specific filtering/additions
	switch (context) {
		case "campaign":
			return {
				...baseChips,
				// Campaign-specific: Add campaign-focused variables
				variables: [...baseChips.variables],
				// Campaign-specific tools
				tools: baseChips.tools.filter(
					(t) =>
						t.key === "analyzeLeadList" ||
						t.key === "filterProspects" ||
						t.key === "textOutreach" ||
						t.key === "callOutreach" ||
						t.key === "createCampaign" ||
						t.key === "trackPerformance",
				),
			};

		case "workflow":
			return {
				...baseChips,
				// Workflow-specific: Prioritize workflow/automation variables
				variables: baseChips.variables.filter(
					(v) =>
						v.key === "leadList" ||
						v.key === "campaign" ||
						v.key === "company" ||
						v.key === "webhookUrl" ||
						v.key === "leadSource" ||
						v.key === "location",
				),
				// Workflow-specific tools
				tools: baseChips.tools.filter(
					(t) =>
						t.key === "enrichLead" ||
						t.key === "sendWebhook" ||
						t.key === "updateCRM" ||
						t.key === "bulkEnrich",
				),
				// Workflow-specific automations
				automations: baseChips.automations.filter(
					(a) =>
						a.key === "kestraWorkflow" ||
						a.key === "n8nWorkflow" ||
						a.key === "makeScenario" ||
						a.key === "leadIngestionFlow",
				),
			};

		case "search":
			return {
				...baseChips,
				// Search-specific: Prioritize lead/property variables
				variables: baseChips.variables.filter(
					(v) =>
						v.key === "leadScore" ||
						v.key === "location" ||
						v.key === "propertyType" ||
						v.key === "ownerTimeInProperty" ||
						v.key === "estimatedEquityPercentage" ||
						v.key === "sellerIntentScore" ||
						v.key === "skipTraceStatus",
				),
				// Search-specific tools
				tools: baseChips.tools.filter(
					(t) =>
						t.key === "analyzeLeadList" ||
						t.key === "filterProspects" ||
						t.key === "scoreLookalike" ||
						t.key === "exportAudience",
				),
			};

		default:
			return baseChips;
	}
}
