// Import pricing configurations
import { callCosts, type CallPricingPlan } from "../pricing/call_costs";
import { smsCosts, type SmsPricingPlan } from "../pricing/sms_costs";
import { socialCosts, type SocialPricingPlan } from "../pricing/social_costs";
import {
	directMailCosts,
	type DirectMailPricingPlan,
} from "../pricing/directmail_costs";

interface CampaignSettings {
	primaryChannel: string | null;
	leadCount: number;
	minDailyAttempts: number;
	maxDailyAttempts: number;
	dailyLimit?: number;
	includeWeekends: boolean;
	doVoicemailDrops: boolean;
	transferEnabled: boolean;
	transferType?: string;
	startDate?: Date;
	endDate?: Date | null;
	daysSelected: number;
	campaignName?: string;
	availableAgents?: Array<{
		id: string;
		name: string;
		email: string;
		status: string;
	}>;
	plan?: "basic" | "starter" | "enterprise";
	messageType?: "sms" | "imessage";
	socialPlatform?: "facebook" | "linkedin" | "instagram";
	directMailType?: "postcard" | "letter" | "check" | "ai_triggered";
	features?: {
		webhooks?: number;
		mailTracking?: boolean;
		analytics?: boolean;
		integrations?: boolean;
		userRoles?: boolean;
		customEnvelopes?: boolean;
		specialtyMailers?: boolean;
		hipaaCompliant?: boolean;
	};
}

interface CampaignCostResult {
	CampaignName: string;
	Channel: string;
	LeadsTargeted: number;
	TotalDays: number;
	TotalAttempts: number;
	CallCost: number;
	SmsCost: number;
	SocialCost: number;
	DirectMailCost: number;
	TotalCost: number;
	AgentsAvailable: number;
	Plan: string;
	TotalBillableCredits: number;
	Margin: number;
}
export function calculateCampaignCost(
	campaignSettings: CampaignSettings,
): CampaignCostResult {
	// Load Settings with safe defaults
	const channel = campaignSettings.primaryChannel || "call";
	const leadCount = campaignSettings.leadCount || 0;
	const minDailyAttempts = campaignSettings.minDailyAttempts || 1;
	const maxDailyAttempts = campaignSettings.maxDailyAttempts || 3;
	const dailyLimit = campaignSettings.dailyLimit || 1000;
	const includeWeekends = campaignSettings.includeWeekends ?? false;
	const doVoicemailDrops = campaignSettings.doVoicemailDrops ?? false;
	const transferEnabled = campaignSettings.transferEnabled ?? false;
	const startDate = campaignSettings.startDate;
	const endDate = campaignSettings.endDate;
	const daysSelected = campaignSettings.daysSelected || 1;
	const campaignName = campaignSettings.campaignName || "Unnamed Campaign";
	const availableAgents = campaignSettings.availableAgents || [];
	const plan = campaignSettings.plan || "starter";
	const messageType = campaignSettings.messageType || "sms";
	const socialPlatform = campaignSettings.socialPlatform || "facebook";
	const directMailType = campaignSettings.directMailType || "postcard";

	// Calculate Campaign Duration
	let totalDays: number;
	if (!endDate && startDate) {
		totalDays = daysSelected;
	} else if (startDate && endDate) {
		const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
		totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
	} else {
		totalDays = daysSelected;
	}

	// Exclude weekends if not included
	if (!includeWeekends && startDate && endDate) {
		let currentDate = new Date(startDate);
		let weekendDays = 0;

		while (currentDate <= endDate) {
			if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
				// Sunday or Saturday
				weekendDays++;
			}
			currentDate.setDate(currentDate.getDate() + 1);
		}

		totalDays = totalDays - weekendDays;
	}

	// Initialize Costs
	let totalCost = 0;
	let callCost = 0;
	let smsCost = 0;
	let socialCost = 0;
	let directMailCost = 0;

	// Load unit costs from pricing configurations (plan-based)
	const callPricing = callCosts.plans[plan] || callCosts.default;
	const smsPricing =
		smsCosts[messageType]?.plans[plan] || smsCosts[messageType]?.default;
	const socialPricing = socialCosts.plans[plan] || socialCosts.default;
	const platformPricing =
		socialCosts.platforms[socialPlatform] || socialPricing;
	const directMailPricing =
		directMailCosts.plans[plan] || directMailCosts.default;
	const directMailTypePricing = directMailCosts.types[directMailType] || {
		baseCost: directMailPricing.customerPricePerEvent,
	};

	// Attempts & Contact Logic
	const avgDailyAttempts = (minDailyAttempts + maxDailyAttempts) / 2;
	const maxPossibleAttempts = leadCount * avgDailyAttempts;
	const maxDailyLimitedAttempts = dailyLimit * totalDays;
	const totalContactAttempts = Math.min(
		maxPossibleAttempts,
		maxDailyLimitedAttempts,
	);

	console.log("Attempts Debug:", {
		avgDailyAttempts,
		maxPossibleAttempts,
		maxDailyLimitedAttempts,
		totalContactAttempts,
		leadCount,
		totalDays,
		dailyLimit,
	});

	// Channel Costing Rules with Plan-Based Pricing
	if (channel === "call" && leadCount > 0) {
		// Base call cost (per 5 minutes)
		callCost = totalContactAttempts * callPricing.customerPricePerFiveMinutes;
		console.log("Call cost calculated:", {
			totalContactAttempts,
			callPricing: callPricing.customerPricePerFiveMinutes,
			callCost,
		});

		// Voicemail drops cost (assume half the regular call cost)
		if (doVoicemailDrops) {
			callCost +=
				totalContactAttempts * 0.5 * callPricing.customerPricePerFiveMinutes;
			console.log("Added voicemail cost:", callCost);
		}

		// Transfer costs (assume partial AI handling before transfer)
		if (transferEnabled) {
			callCost +=
				totalContactAttempts * 0.5 * callPricing.customerPricePerFiveMinutes;
			console.log("Added transfer cost:", callCost);
		}
	}

	if (channel === "text" && leadCount > 0) {
		// SMS or iMessage costs (per 10 messages)
		smsCost =
			totalContactAttempts * (smsPricing?.customerPricePerTenMessages || 0.01);
	}

	if (channel === "social" && leadCount > 0) {
		// Social media DM costs (per 10 messages)
		socialCost =
			totalContactAttempts *
			(platformPricing?.customerPricePerTenMessages ||
				socialPricing?.customerPricePerTenMessages ||
				0.02);
	}

	if ((channel === "directmail" || channel === "email") && leadCount > 0) {
		// Direct mail costs with AI-triggered events
		if (directMailType === "ai_triggered") {
			// For AI-triggered, we use the direct mail event pricing
			directMailCost = leadCount * directMailPricing.customerPricePerEvent;
		} else {
			// Standard direct mail types - use the type-specific base cost
			const typeConfig =
				directMailCosts.types[
					directMailType as keyof typeof directMailCosts.types
				];
			if (typeConfig && "baseCost" in typeConfig) {
				directMailCost = leadCount * typeConfig.baseCost;
			} else {
				// Fallback to default pricing
				directMailCost = leadCount * directMailPricing.customerPricePerEvent;
			}
		}
	}

	// Feature-based cost adjustments
	let featureCost = 0;
	const features = campaignSettings.features || {};

	// Webhook costs (if using more than plan allowance)
	const webhookAllowance = directMailCosts.features?.webhooks?.[plan] || 0;
	if (features.webhooks && features.webhooks > webhookAllowance) {
		featureCost += (features.webhooks - webhookAllowance) * 0.01; // $0.01 per additional webhook
	}

	// Premium feature costs
	if (features.customEnvelopes) featureCost += 0.05; // $0.05 per lead for custom envelopes
	if (features.specialtyMailers) featureCost += 0.1; // $0.10 per lead for specialty mailers
	if (features.hipaaCompliant) featureCost += 0.15; // $0.15 per lead for HIPAA compliance

	// Aggregate all costs
	totalCost = callCost + smsCost + socialCost + directMailCost + featureCost;

	console.log("Final Cost Debug:", {
		callCost,
		smsCost,
		socialCost,
		directMailCost,
		featureCost,
		totalCost,
	});

	// Fallback calculation if no costs were calculated (e.g., no leads or invalid channel)
	if (totalCost === 0 && leadCount > 0) {
		// Provide a minimum cost estimate based on lead count
		totalCost = leadCount * 0.01; // $0.01 per lead minimum
		console.log("Applied fallback cost:", totalCost);
	}

	// Calculate total billable credits (for customer billing)
	const totalBillableCredits = Math.ceil(totalCost * 100); // 1 credit = $0.01

	console.log("Billable Credits:", totalBillableCredits);

	// Output
	return {
		CampaignName: campaignName,
		Channel: channel || "unknown",
		LeadsTargeted: leadCount,
		TotalDays: totalDays,
		TotalAttempts: totalContactAttempts,
		CallCost: callCost,
		SmsCost: smsCost,
		SocialCost: socialCost,
		DirectMailCost: directMailCost,
		TotalCost: totalCost,
		AgentsAvailable: availableAgents.length,
		Plan: plan,
		TotalBillableCredits: totalBillableCredits,
		Margin:
			callPricing.margin ||
			smsPricing?.margin ||
			socialPricing.margin ||
			directMailPricing.margin ||
			0.85,
	};
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
}

/**
 * Get estimated credits needed for campaign
 * This function now returns the pre-calculated billable credits from the cost calculator
 */
export function getEstimatedCredits(campaignCost: CampaignCostResult): number {
	return campaignCost.TotalBillableCredits;
}
