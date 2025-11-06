/**
 * Subscription Plans Configuration
 * Defines all available subscription tiers with features and pricing
 */

export interface SubscriptionPlanFeatures {
	aiCredits: number;
	leads: number;
	skipTraces: number;
	webhooks: number;
	advancedAnalytics: boolean;
	prioritySupport: boolean;
	customIntegrations: boolean;
	teamMembers: number;
}

export interface SubscriptionPlan {
	id: string;
	name: string;
	displayName: string;
	description: string;
	monthlyPrice: number;
	yearlyPrice: number;
	features: SubscriptionPlanFeatures;
	popular?: boolean;
	recommended?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
	{
		id: "none",
		name: "None",
		displayName: "Free Plan",
		description: "Get started with basic features",
		monthlyPrice: 0,
		yearlyPrice: 0,
		features: {
			aiCredits: 0,
			leads: 0,
			skipTraces: 0,
			webhooks: 0,
			advancedAnalytics: false,
			prioritySupport: false,
			customIntegrations: false,
			teamMembers: 1,
		},
	},
	{
		id: "early-adopter",
		name: "Early Adopter",
		displayName: "Early Adopter",
		description: "Perfect for getting started with AI-powered lead generation",
		monthlyPrice: 1200,
		yearlyPrice: 12000,
		popular: true,
		features: {
			aiCredits: 1200,
			leads: 200,
			skipTraces: 50,
			webhooks: 3,
			advancedAnalytics: true,
			prioritySupport: false,
			customIntegrations: false,
			teamMembers: 3,
		},
	},
	{
		id: "basic",
		name: "Basic",
		displayName: "Basic",
		description: "Ideal for small teams scaling their outreach",
		monthlyPrice: 2400,
		yearlyPrice: 24000,
		recommended: true,
		features: {
			aiCredits: 2400,
			leads: 500,
			skipTraces: 100,
			webhooks: 5,
			advancedAnalytics: true,
			prioritySupport: true,
			customIntegrations: false,
			teamMembers: 5,
		},
	},
	{
		id: "enterprise",
		name: "Enterprise",
		displayName: "Enterprise",
		description: "For large teams with advanced requirements",
		monthlyPrice: 5000,
		yearlyPrice: 50000,
		features: {
			aiCredits: 5000,
			leads: 1000,
			skipTraces: 300,
			webhooks: 10,
			advancedAnalytics: true,
			prioritySupport: true,
			customIntegrations: true,
			teamMembers: 15,
		},
	},
];

/**
 * Get plan by name or ID
 */
export function getPlanById(id: string): SubscriptionPlan | undefined {
	return SUBSCRIPTION_PLANS.find(
		(plan) =>
			plan.id === id.toLowerCase() || plan.name.toLowerCase() === id.toLowerCase(),
	);
}

/**
 * Get next tier for upgrade recommendations
 */
export function getNextTier(
	currentPlanId: string,
): SubscriptionPlan | undefined {
	const currentIndex = SUBSCRIPTION_PLANS.findIndex(
		(plan) => plan.id === currentPlanId.toLowerCase(),
	);
	if (currentIndex === -1 || currentIndex >= SUBSCRIPTION_PLANS.length - 1) {
		return undefined;
	}
	return SUBSCRIPTION_PLANS[currentIndex + 1];
}

/**
 * Get upgrade options (all plans above current)
 */
export function getUpgradeOptions(
	currentPlanId: string,
): SubscriptionPlan[] {
	const currentIndex = SUBSCRIPTION_PLANS.findIndex(
		(plan) => plan.id === currentPlanId.toLowerCase(),
	);
	if (currentIndex === -1) {
		return SUBSCRIPTION_PLANS.slice(1); // Return all paid plans
	}
	return SUBSCRIPTION_PLANS.slice(currentIndex + 1);
}

