/**
 * A2A Agent Registry
 * Mock agents for development - replace with real A2A discovery
 */

import type { Agent } from "./types";

/**
 * Mock A2A Agents
 * In production, these would be discovered via A2A protocol agent discovery
 * https://a2a-protocol.org/specification/agent-discovery/
 */
export const MOCK_AGENTS: Agent[] = [
	// Analysis Agents
	{
		id: "agent_market_analyst",
		name: "Market Analyst",
		description: "Analyzes real estate market trends, pricing, and demand",
		type: "a2a",
		status: "online",
		category: "analysis",
		endpoint: "https://api.dealscale.io/agents/market-analyst",
		agentCardUrl: "https://api.dealscale.io/agents/market-analyst/card.json",
		skills: ["market_analysis", "trend_prediction", "price_forecasting"],
		icon: "📊",
		responseTime: 2500,
		capabilities: {
			streaming: true,
			async: true,
			fileSupport: false,
			maxTaskDuration: 300,
		},
	},
	{
		id: "agent_deal_evaluator",
		name: "Deal Evaluator",
		description: "Evaluates property deals, calculates ROI, and assesses risks",
		type: "a2a",
		status: "online",
		category: "evaluation",
		endpoint: "https://api.dealscale.io/agents/deal-evaluator",
		agentCardUrl: "https://api.dealscale.io/agents/deal-evaluator/card.json",
		skills: ["deal_evaluation", "roi_calculation", "risk_assessment"],
		icon: "💰",
		responseTime: 1800,
		capabilities: {
			streaming: false,
			async: true,
			fileSupport: true,
			maxTaskDuration: 180,
		},
	},
	{
		id: "agent_property_inspector",
		name: "Property Inspector",
		description:
			"Analyzes property data, identifies issues, and estimates repair costs",
		type: "a2a",
		status: "online",
		category: "analysis",
		endpoint: "https://api.dealscale.io/agents/property-inspector",
		agentCardUrl:
			"https://api.dealscale.io/agents/property-inspector/card.json",
		skills: ["property_inspection", "repair_estimation", "condition_analysis"],
		icon: "🏠",
		responseTime: 3200,
		capabilities: {
			streaming: true,
			async: true,
			fileSupport: true,
			maxTaskDuration: 600,
		},
	},

	// Communication Agents
	{
		id: "agent_negotiator",
		name: "Negotiator",
		description:
			"Crafts negotiation strategies and generates persuasive communication",
		type: "a2a",
		status: "online",
		category: "communication",
		endpoint: "https://api.dealscale.io/agents/negotiator",
		agentCardUrl: "https://api.dealscale.io/agents/negotiator/card.json",
		skills: ["negotiation", "persuasion", "objection_handling"],
		icon: "🤝",
		responseTime: 2000,
		capabilities: {
			streaming: true,
			async: false,
			fileSupport: false,
			maxTaskDuration: 120,
		},
	},
	{
		id: "agent_copywriter",
		name: "Marketing Copywriter",
		description: "Generates marketing copy, emails, and property descriptions",
		type: "a2a",
		status: "online",
		category: "communication",
		endpoint: "https://api.dealscale.io/agents/copywriter",
		agentCardUrl: "https://api.dealscale.io/agents/copywriter/card.json",
		skills: ["copywriting", "email_generation", "property_descriptions"],
		icon: "✍️",
		responseTime: 1500,
		capabilities: {
			streaming: true,
			async: false,
			fileSupport: false,
			maxTaskDuration: 90,
		},
	},

	// Research Agents
	{
		id: "agent_comp_researcher",
		name: "Comp Researcher",
		description: "Researches comparable properties and generates CMA reports",
		type: "a2a",
		status: "online",
		category: "research",
		endpoint: "https://api.dealscale.io/agents/comp-researcher",
		agentCardUrl: "https://api.dealscale.io/agents/comp-researcher/card.json",
		skills: ["comp_research", "cma_generation", "property_comparison"],
		icon: "🔍",
		responseTime: 4000,
		capabilities: {
			streaming: true,
			async: true,
			fileSupport: true,
			maxTaskDuration: 600,
		},
	},
	{
		id: "agent_title_researcher",
		name: "Title Researcher",
		description: "Researches property titles, liens, and ownership history",
		type: "a2a",
		status: "online",
		category: "research",
		endpoint: "https://api.dealscale.io/agents/title-researcher",
		agentCardUrl: "https://api.dealscale.io/agents/title-researcher/card.json",
		skills: ["title_research", "lien_check", "ownership_history"],
		icon: "📜",
		responseTime: 5000,
		capabilities: {
			streaming: false,
			async: true,
			fileSupport: true,
			maxTaskDuration: 900,
		},
	},

	// Automation Agents
	{
		id: "agent_workflow_orchestrator",
		name: "Workflow Orchestrator",
		description:
			"Orchestrates multi-step workflows across multiple agents and tools",
		type: "a2a",
		status: "online",
		category: "automation",
		endpoint: "https://api.dealscale.io/agents/workflow-orchestrator",
		agentCardUrl:
			"https://api.dealscale.io/agents/workflow-orchestrator/card.json",
		skills: [
			"workflow_orchestration",
			"task_delegation",
			"pipeline_management",
		],
		icon: "⚙️",
		responseTime: 1000,
		capabilities: {
			streaming: true,
			async: true,
			fileSupport: true,
			maxTaskDuration: 1800,
		},
	},
	{
		id: "agent_data_enricher",
		name: "Data Enricher",
		description: "Enriches lead and property data from multiple sources",
		type: "a2a",
		status: "online",
		category: "automation",
		endpoint: "https://api.dealscale.io/agents/data-enricher",
		agentCardUrl: "https://api.dealscale.io/agents/data-enricher/card.json",
		skills: ["data_enrichment", "skip_trace", "contact_discovery"],
		icon: "💎",
		responseTime: 3500,
		capabilities: {
			streaming: false,
			async: true,
			fileSupport: true,
			maxTaskDuration: 600,
		},
	},
];

/**
 * Get all agents
 */
export const getAgents = (): Agent[] => {
	return MOCK_AGENTS;
};

/**
 * Get agents by category
 */
export const getAgentsByCategory = (category: Agent["category"]): Agent[] => {
	return MOCK_AGENTS.filter((agent) => agent.category === category);
};

/**
 * Get agent by ID
 */
export const getAgentById = (id: string): Agent | undefined => {
	return MOCK_AGENTS.find((agent) => agent.id === id);
};

/**
 * Get online agents only
 */
export const getOnlineAgents = (): Agent[] => {
	return MOCK_AGENTS.filter((agent) => agent.status === "online");
};

/**
 * Search agents by skill
 */
export const searchAgentsBySkill = (skill: string): Agent[] => {
	return MOCK_AGENTS.filter((agent) =>
		agent.skills?.some((s) => s.toLowerCase().includes(skill.toLowerCase())),
	);
};

/**
 * Get agent key for POML usage
 * Converts "Market Analyst" → "marketAnalyst"
 */
export const getAgentKey = (agent: Agent): string => {
	return agent.name
		.split(" ")
		.map((word, index) =>
			index === 0
				? word.toLowerCase()
				: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
		)
		.join("");
};
