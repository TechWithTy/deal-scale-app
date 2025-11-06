/**
 * Unified pricing tiers configuration for DealScale.io
 *
 * Includes Subscription, Success-Based, and One-Time pricing models.
 * This file provides mock data that will be replaced with live API calls
 * when /api/plans endpoint becomes available.
 *
 * @see hooks/usePlans.ts for automatic mock-to-live detection
 */

export type PricingCategory = "subscription" | "successBased" | "oneTime";
export type BillingCycle = "monthly" | "yearly";

export interface BillingOptions {
	monthly: { price: number };
	yearly: {
		price: number;
		original: number;
		discount: string;
		label: string;
	};
}

export interface SubscriptionCredits {
	ai: number | "Unlimited";
	skipTrace: number | "Unlimited";
	leads: number | "Unlimited";
}

export interface SubscriptionTier {
	id: string;
	name: string;
	billing: BillingOptions;
	credits: SubscriptionCredits;
	addOn: string;
	features: string[];
	tags?: string[];
	planFeatures?: PlanFeature[];
}

export interface PlanFeature {
	name: string;
	unlocked: boolean;
	category?: string;
	link?: string;
}

export interface SuccessBasedTier {
	id: string;
	name: string;
	type: "Success-Based";
	structure: string;
	perks: string[];
	notes?: string;
}

export interface OneTimeTier {
	id: string;
	name: string;
	type: "One-Time";
	price: number;
	unit: string;
	conditions: string[];
	notes?: string;
}

export interface PricingTiers {
	subscription: SubscriptionTier[];
	successBased: SuccessBasedTier[];
	oneTime: OneTimeTier[];
}

export const pricingTiers: PricingTiers = {
	subscription: [
		{
			id: "basic",
			name: "Basic",
			billing: {
				monthly: { price: 500 },
				yearly: {
					price: 4250,
					original: 5000,
					discount: "15%",
					label: "Per Year + 2 Months Free",
				},
			},
			credits: { ai: 4800, skipTrace: 1200, leads: 4800 },
			addOn: "$75/mo per Additional Seat",
			features: ["Standard Campaign Goals"],
			tags: ["Save 15%", "Limited Time 50% Off"],
			planFeatures: [
				{
					name: "AI Calls",
					unlocked: true,
					link: "https://www.dealscale.io/features/ai-inbound-agent",
				},
				{ name: "Basic Lead Summary", unlocked: true },
				{ name: "Standard KPIs", unlocked: true },
				{ name: "Look-alike Audience Generation", unlocked: true },
				{ name: "Skip Trace Enrichment", unlocked: true },
				{ name: "Intelligent Conversations", unlocked: false },
				{ name: "Smart Lead Summary", unlocked: false },
				{
					name: "AI Inbound Agent",
					unlocked: false,
					link: "https://www.dealscale.io/features/ai-inbound-agent",
				},
			],
		},
		{
			id: "starter",
			name: "Starter",
			billing: {
				monthly: { price: 2000 },
				yearly: {
					price: 17000,
					original: 20000,
					discount: "15%",
					label: "Per Year + 2 Months Free",
				},
			},
			credits: { ai: 24000, skipTrace: 6000, leads: 24000 },
			addOn: "$50/mo per Additional Seat",
			features: [
				"AI Powered Kanban Board",
				"Voice Cloning & Custom Voicemail",
				"Custom Campaign Goals",
			],
			tags: ["Most Popular", "Save 15%"],
			planFeatures: [
				{
					name: "AI Calls",
					unlocked: true,
					link: "https://www.dealscale.io/features/ai-inbound-agent",
				},
				{ name: "Intelligent Conversations", unlocked: true },
				{ name: "Smart Lead Summary", unlocked: true },
				{ name: "Detailed KPIs & Stats", unlocked: true },
				{ name: "Rapid Campaign Delivery", unlocked: true },
				{ name: "Look-alike Audience Generation", unlocked: true },
				{ name: "Skip Trace Enrichment", unlocked: true },
				{ name: "AI Powered Kanban Board", unlocked: true },
				{ name: "Voice Cloning", unlocked: true },
				{
					name: "AI Inbound Agent",
					unlocked: false,
					link: "https://www.dealscale.io/features/ai-inbound-agent",
				},
			],
		},
		{
			id: "enterprise",
			name: "Enterprise",
			billing: {
				monthly: { price: 10000 },
				yearly: {
					price: 100000,
					original: 120000,
					discount: "17%",
					label: "Per Year + 2 Months Free",
				},
			},
			credits: { ai: 84000, skipTrace: "Unlimited", leads: "Unlimited" },
			addOn: "Unlimited User Seats",
			features: [
				"Everything in Starter",
				"Priority Zip Code Access",
				"AI Inbound Call Agent",
				"Customizable Workflows",
				"API Key Access",
				"White-label Options",
				"Dedicated Account Manager",
			],
			tags: ["Save 17%"],
			planFeatures: [
				{
					name: "AI Calls",
					unlocked: true,
					link: "https://www.dealscale.io/features/ai-inbound-agent",
				},
				{ name: "Intelligent Conversations", unlocked: true },
				{ name: "Smart Lead Summary", unlocked: true },
				{ name: "Detailed KPIs & Stats", unlocked: true },
				{ name: "Rapid Campaign Delivery", unlocked: true },
				{ name: "Look-alike Audience Generation", unlocked: true },
				{ name: "Skip Trace Enrichment", unlocked: true },
				{ name: "Advanced Analytics", unlocked: true },
				{ name: "Priority Support", unlocked: true },
				{ name: "Custom Integrations", unlocked: true },
				{
					name: "AI Inbound Agent",
					unlocked: true,
					link: "https://www.dealscale.io/features/ai-inbound-agent",
				},
				{ name: "Priority Zip Code Access", unlocked: true },
				{ name: "API Key Access", unlocked: true },
				{ name: "White-label Options", unlocked: true },
				{ name: "Dedicated Account Manager", unlocked: true },
			],
		},
	],
	successBased: [
		{
			id: "commission_partner",
			name: "Commission Partner",
			type: "Success-Based",
			structure: "35–50% of buyer-side commission per closed transaction",
			perks: [
				"Application & Qualification Required",
				"For high-volume agents, teams, and brokers",
				"No Subscription or Platform Fees",
				"Unlimited AI & Data Credits",
				"Full Feature Access",
			],
			notes: "Partnership model designed to maximize agent ROI",
		},
	],
	oneTime: [
		{
			id: "pay_per_lead",
			name: "Pay-Per-Lead",
			type: "One-Time",
			price: 200,
			unit: "per qualified lead delivered",
			conditions: [
				"Subject to Zip Code Availability & Qualification",
				"Pay only for sales-ready appointments",
				"Requires intake process for hot transfers",
				"No Subscription or Platform Fees",
			],
			notes: "Pricing may vary based on market demand",
		},
	],
};

/**
 * Legacy interface for backward compatibility
 * @deprecated Use pricingTiers instead
 */
export interface PlanTier {
	id: string;
	name: string;
	price: number;
	priceSuffix?: string;
	description: string;
	features: string[];
	credits?: {
		ai: number;
		leads: number;
		skipTraces: number;
	};
	planFeatures?: PlanFeature[];
	stripePaymentLink?: string;
	cta?: string;
}

/**
 * Check if live API endpoint is available
 * @returns Promise that resolves to true if /api/plans is reachable
 */
export async function checkLiveApiAvailable(): Promise<boolean> {
	try {
		const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
		const response = await fetch(`${baseUrl}/api/plans`, {
			method: "HEAD",
			signal: AbortSignal.timeout(2000), // 2 second timeout
		});
		return response.ok;
	} catch {
		return false;
	}
}
