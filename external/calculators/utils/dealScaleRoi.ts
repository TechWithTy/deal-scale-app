import {
	dealScaleBenchmarkPresets,
	dealScalePlanPricing,
	type DealScalePlanId,
	type DealScalePlanPricing,
} from "../constants/dealScalePricing";

const personaBaseDeals: Record<string, number> = {
	wholesaler: 8,
	agent: 12,
	investor: 6,
	loan_officer: 15,
};

const goalMultipliers: Record<string, number> = {
	"wholesaler-deals": 1.2,
	"agent-sphere": 1.0,
	"investor-portfolio": 0.8,
	"loan-origination": 1.3,
};

const personaDealValues: Record<string, number> = {
	wholesaler: 8000,
	agent: 12000,
	investor: 45000,
	loan_officer: 6000,
};

export { dealScalePlanPricing, dealScaleBenchmarkPresets };
export type { DealScalePlanId, DealScalePlanPricing };

export type DealScaleBenchmarkKey = keyof typeof dealScaleBenchmarkPresets;

export interface DealScaleRoiMetrics {
	totalRevenue: number;
	totalCost: number;
	roi: number;
	averageDealValue: number;
	costPerLead: number;
	costPerConversion: number;
}

export interface DealScaleManualInputs {
	plan: DealScalePlanId;
	leadsGenerated: number;
	conversionRate: number;
	avgDealValue: number;
	callsMade: number;
	smsThreads: number;
	socialThreads: number;
}

export interface DealScaleProfileInputs {
	personaId?: string;
	goalId?: string;
	tier?: string;
	dealsPerMonth: number;
	avgDealValue: number;
	months: number;
	profitMarginPercent: number;
	monthlyOverhead: number;
	hoursPerDeal: number;
}

export interface DealScaleProfileRoiMetrics extends DealScaleRoiMetrics {
	netProfit: number;
	actualProfit: number;
	totalTimeSaved: number;
	campaignCost: number;
	includedCredits: number;
	campaignOverage: number;
	leadsNeeded: number;
	totalDeals: number;
	totalTouches: number;
	calls: number;
	smsMessages: number;
	socialResponses: number;
}

function toNumber(value: number | string): number {
	if (typeof value === "number") return Number.isFinite(value) ? value : 0;
	if (value.trim() === "") return 0;
	const sanitized = Number.parseFloat(value);
	return Number.isFinite(sanitized) ? sanitized : 0;
}

export function estimateDealsPerMonth(
	personaId?: string,
	goalId?: string,
): number {
	const base =
		personaId && personaBaseDeals[personaId] ? personaBaseDeals[personaId] : 10;
	const multiplier =
		goalId && goalMultipliers[goalId] ? goalMultipliers[goalId] : 1;
	return Math.round(base * multiplier);
}

export function estimateDealValue(personaId?: string): number {
	if (personaId && personaDealValues[personaId]) {
		return personaDealValues[personaId];
	}
	return 10000;
}

export function normalizeTierToPlanId(tier?: string): DealScalePlanId {
	const normalized = tier?.toLowerCase();
	if (normalized === "starter") return "starter";
	if (normalized === "enterprise") return "enterprise";
	return "basic";
}

export function computeDealScaleManualRoi(
	inputs: DealScaleManualInputs,
): DealScaleRoiMetrics {
	const plan = dealScalePlanPricing[inputs.plan];
	const leads = toNumber(inputs.leadsGenerated);
	const conversionRate = toNumber(inputs.conversionRate);
	const dealValue = toNumber(inputs.avgDealValue);
	const calls = toNumber(inputs.callsMade);
	const sms = toNumber(inputs.smsThreads);
	const social = toNumber(inputs.socialThreads);

	const conversions = (leads * conversionRate) / 100;
	const callCost = calls * plan.callCostPer5Min;
	const smsCost = sms * plan.smsCostPerMessage;
	const socialCost = social * plan.socialResponseCost;

	const totalCost = plan.monthlyPrice + callCost + smsCost + socialCost;
	const totalRevenue = conversions * dealValue;
	const roi =
		totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
	const costPerLead = leads > 0 ? totalCost / leads : 0;
	const costPerConversion = conversions > 0 ? totalCost / conversions : 0;

	return {
		totalRevenue,
		totalCost,
		roi,
		averageDealValue: dealValue,
		costPerLead,
		costPerConversion,
	};
}

export function computeDealScaleProfileRoi(
	inputs: DealScaleProfileInputs,
): DealScaleProfileRoiMetrics {
	const planId = normalizeTierToPlanId(inputs.tier);
	const plan = dealScalePlanPricing[planId];

	const dealsPerMonth =
		inputs.dealsPerMonth > 0
			? inputs.dealsPerMonth
			: estimateDealsPerMonth(inputs.personaId, inputs.goalId);
	const dealValue =
		inputs.avgDealValue > 0
			? inputs.avgDealValue
			: estimateDealValue(inputs.personaId);
	const months = Math.max(1, Math.min(inputs.months, 36));
	const profitMargin = Math.min(Math.max(inputs.profitMarginPercent, 0), 100);
	const monthlyOverhead = Math.max(inputs.monthlyOverhead, 0);
	const hoursPerDeal = Math.max(inputs.hoursPerDeal, 0);

	const totalDeals = dealsPerMonth * months;
	const grossRevenue = totalDeals * dealValue;
	const revenueProfit = grossRevenue * (profitMargin / 100);

	const leadsNeeded = totalDeals * 5;
	const totalTouches = leadsNeeded * 10;
	const calls = Math.round(totalTouches * 0.3);
	const smsMessages = Math.round(totalTouches * 0.5);
	const socialResponses = Math.round(totalTouches * 0.2);

	const callCost = calls * plan.callCostPer5Min;
	const smsCost = smsMessages * plan.smsCostPerMessage;
	const socialCost = socialResponses * plan.socialResponseCost;
	const totalCampaignCost = callCost + smsCost + socialCost;

	const subscriptionCost = plan.monthlyPrice * months;
	const includedCredits = plan.aiCreditsPerMonth * months;
	const campaignOverage =
		totalCampaignCost > includedCredits
			? totalCampaignCost - includedCredits
			: 0;
	const overheadCost = monthlyOverhead * months;

	const totalCost = subscriptionCost + campaignOverage + overheadCost;
	const netProfit = revenueProfit - totalCost;
	const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
	const costPerLead = leadsNeeded > 0 ? totalCost / leadsNeeded : 0;
	const costPerConversion = totalDeals > 0 ? totalCost / totalDeals : 0;
	const totalTimeSaved = totalDeals * hoursPerDeal * 0.7;

	return {
		totalRevenue: grossRevenue,
		totalCost,
		roi,
		averageDealValue: dealValue,
		costPerLead,
		costPerConversion,
		netProfit,
		actualProfit: revenueProfit,
		totalTimeSaved,
		campaignCost: totalCampaignCost,
		includedCredits,
		campaignOverage,
		leadsNeeded,
		totalDeals,
		totalTouches,
		calls,
		smsMessages,
		socialResponses,
	};
}
