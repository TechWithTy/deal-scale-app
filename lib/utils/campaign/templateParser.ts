import type { SavedCampaignTemplate } from "@/types/userProfile";

/**
 * Extract campaign configuration from AI-generated POML prompt
 */
export function parseCampaignFromAIPrompt(
	prompt: string,
): Partial<SavedCampaignTemplate["campaignConfig"]> {
	const config: Partial<SavedCampaignTemplate["campaignConfig"]> = {
		channels: extractChannelsFromPrompt(prompt),
		audience: extractAudienceFromPrompt(prompt),
		budget: extractBudgetFromPrompt(prompt),
	};

	return config;
}

/**
 * Extract channels (call, sms, email, social) from prompt
 */
export function extractChannelsFromPrompt(prompt: string): string[] {
	const channels: string[] = [];
	const lowerPrompt = prompt.toLowerCase();

	// Check for explicit channel mentions
	if (
		lowerPrompt.includes("call") ||
		lowerPrompt.includes("voice") ||
		lowerPrompt.includes("phone")
	) {
		channels.push("call");
	}
	if (
		lowerPrompt.includes("sms") ||
		lowerPrompt.includes("text") ||
		lowerPrompt.includes("message")
	) {
		channels.push("sms");
	}
	if (lowerPrompt.includes("email")) {
		channels.push("email");
	}
	if (
		lowerPrompt.includes("social") ||
		lowerPrompt.includes("facebook") ||
		lowerPrompt.includes("linkedin") ||
		lowerPrompt.includes("instagram") ||
		lowerPrompt.includes("twitter")
	) {
		channels.push("social");
	}

	// If no channels found, default to all
	return channels.length > 0 ? channels : ["call", "sms", "email"];
}

/**
 * Extract audience configuration from prompt
 */
export function extractAudienceFromPrompt(prompt: string): any {
	const audience: any = {
		filters: {},
		targeting: {},
	};

	// Extract location
	const locationMatch =
		prompt.match(/location[:\s]+([^,\n]+)/i) ||
		prompt.match(/\{\{location\}\}/i);
	if (locationMatch) {
		audience.filters.location = locationMatch[1]?.trim() || "{{location}}";
	}

	// Extract property type
	const propertyTypeMatch =
		prompt.match(/property[_\s]?type[:\s]+([^,\n]+)/i) ||
		prompt.match(/\{\{propertyType\}\}/i);
	if (propertyTypeMatch) {
		audience.filters.propertyType =
			propertyTypeMatch[1]?.trim() || "{{propertyType}}";
	}

	// Extract lead score
	const leadScoreMatch =
		prompt.match(/lead[_\s]?score[:\s>]+(\d+)/i) ||
		prompt.match(/\{\{leadScore\}\}/i);
	if (leadScoreMatch) {
		audience.filters.minLeadScore = leadScoreMatch[1]
			? Number.parseInt(leadScoreMatch[1], 10)
			: 70;
	}

	// Extract budget
	const budgetMatch =
		prompt.match(/budget[:\s$]+(\d+)/i) || prompt.match(/\{\{budget\}\}/i);
	if (budgetMatch) {
		audience.filters.budget = budgetMatch[1]
			? Number.parseInt(budgetMatch[1], 10)
			: null;
	}

	return audience;
}

/**
 * Extract budget from prompt
 */
export function extractBudgetFromPrompt(prompt: string): number | undefined {
	// Look for budget mentions
	const budgetMatch = prompt.match(
		/budget[:\s$]*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
	);
	if (budgetMatch && budgetMatch[1]) {
		// Remove commas and parse
		const budgetStr = budgetMatch[1].replace(/,/g, "");
		return Number.parseFloat(budgetStr);
	}

	return undefined;
}

/**
 * Map saved template to campaign wizard state
 */
export function mapTemplateToCampaignWizard(
	template: SavedCampaignTemplate,
): any {
	return {
		name: template.name,
		description: template.description,
		channels: template.campaignConfig.channels || [],
		audience: template.campaignConfig.audience || {},
		messaging: template.campaignConfig.messaging || {},
		schedule: template.campaignConfig.schedule || {},
		budget: template.campaignConfig.budget,
		// Pass through AI metadata
		_aiGenerated: template.campaignConfig.generatedByAI,
		_aiPrompt: template.campaignConfig.aiPrompt,
	};
}

/**
 * Extract messaging/script preferences from prompt
 */
export function extractMessagingFromPrompt(prompt: string): any {
	const messaging: any = {
		tone: "professional",
		personalization: [],
	};

	// Extract tone
	if (
		prompt.toLowerCase().includes("casual") ||
		prompt.toLowerCase().includes("friendly")
	) {
		messaging.tone = "casual";
	} else if (
		prompt.toLowerCase().includes("urgent") ||
		prompt.toLowerCase().includes("direct")
	) {
		messaging.tone = "urgent";
	}

	// Extract personalization variables
	const variableMatches = prompt.matchAll(/\{\{(\w+)\}\}/g);
	for (const match of variableMatches) {
		if (!messaging.personalization.includes(match[1])) {
			messaging.personalization.push(match[1]);
		}
	}

	return messaging;
}

/**
 * Extract schedule configuration from prompt
 */
export function extractScheduleFromPrompt(prompt: string): any {
	const schedule: any = {
		startDate: null,
		frequency: "daily",
		timeWindow: {},
	};

	// Extract frequency
	if (prompt.toLowerCase().includes("weekly")) {
		schedule.frequency = "weekly";
	} else if (prompt.toLowerCase().includes("monthly")) {
		schedule.frequency = "monthly";
	}

	// Extract time preferences
	if (
		prompt.toLowerCase().includes("morning") ||
		prompt.toLowerCase().includes("9am") ||
		prompt.toLowerCase().includes("10am")
	) {
		schedule.timeWindow.start = "09:00";
		schedule.timeWindow.end = "12:00";
	} else if (
		prompt.toLowerCase().includes("afternoon") ||
		prompt.toLowerCase().includes("1pm") ||
		prompt.toLowerCase().includes("2pm")
	) {
		schedule.timeWindow.start = "13:00";
		schedule.timeWindow.end = "17:00";
	}

	return schedule;
}
