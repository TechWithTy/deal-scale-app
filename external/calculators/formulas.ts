"use strict";

export interface CalculationMetadata {
	type: string;
	version: string;
}

export interface CalculationResult<I, R> {
	inputs: I;
	results: R;
	metadata: CalculationMetadata;
}

const DEFAULT_METADATA_VERSION = "1.0";

const currency = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

const percent = new Intl.NumberFormat("en-US", {
	style: "percent",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export function calculateFixFlipROI(inputs: {
	arv: number;
	purchasePrice: number;
	rehabCost: number;
	holdingCost: number;
	sellingFees: number;
}): CalculationResult<
	typeof inputs,
	{
		totalInvestment: number;
		profit: number;
		roiPercent: number;
		breakEvenARV: number;
	}
> {
	const totalInvestment =
		(inputs.purchasePrice || 0) +
		(inputs.rehabCost || 0) +
		(inputs.holdingCost || 0) +
		(inputs.sellingFees || 0);
	const profit = (inputs.arv || 0) - totalInvestment;
	const roiPercent =
		totalInvestment === 0 ? 0 : (profit / totalInvestment) * 100;

	return {
		inputs,
		results: {
			totalInvestment,
			profit,
			roiPercent,
			breakEvenARV: totalInvestment,
		},
		metadata: { type: "fix_flip", version: DEFAULT_METADATA_VERSION },
	};
}

export function calculateRentalCashFlow(inputs: {
	monthlyRent: number;
	vacancyRate: number;
	monthlyExpenses: number;
	loanPayment: number;
	propertyValue: number;
	downPayment: number;
}): CalculationResult<
	typeof inputs,
	{
		effectiveRent: number;
		monthlyCashFlow: number;
		annualCashFlow: number;
		capRate: number;
		cashOnCashReturn: number;
	}
> {
	const effectiveRent =
		(inputs.monthlyRent || 0) * (1 - (inputs.vacancyRate || 0) / 100);
	const monthlyCashFlow =
		effectiveRent - ((inputs.monthlyExpenses || 0) + (inputs.loanPayment || 0));
	const annualCashFlow = monthlyCashFlow * 12;
	const capRate =
		(inputs.propertyValue || 0) === 0
			? 0
			: (annualCashFlow / (inputs.propertyValue || 0)) * 100;
	const reserves = (inputs.monthlyExpenses || 0) * 6;
	const totalInvested = (inputs.downPayment || 0) + reserves;
	const cashOnCashReturn =
		totalInvested === 0 ? 0 : (annualCashFlow / totalInvested) * 100;

	return {
		inputs,
		results: {
			effectiveRent,
			monthlyCashFlow,
			annualCashFlow,
			capRate,
			cashOnCashReturn,
		},
		metadata: { type: "rental_cashflow", version: DEFAULT_METADATA_VERSION },
	};
}

export function calculateBRRRR(inputs: {
	purchasePrice: number;
	rehabCost: number;
	rent: number;
	arv: number;
	refinanceLTV: number;
	loanRate: number;
	termYears: number;
	closingCosts: number;
}): CalculationResult<
	typeof inputs,
	{
		totalCost: number;
		refinanceAmount: number;
		cashOut: number;
		retainedEquity: number;
		roiPercent: number;
		monthlyPayment: number;
		noi: number;
	}
> {
	const totalCost =
		(inputs.purchasePrice || 0) +
		(inputs.rehabCost || 0) +
		(inputs.closingCosts || 0);
	const refinanceAmount =
		(inputs.arv || 0) * ((inputs.refinanceLTV || 0) / 100);
	const cashOut = refinanceAmount - totalCost;
	const retainedEquity = (inputs.arv || 0) - refinanceAmount;
	const roiPercent = totalCost === 0 ? 0 : (cashOut / totalCost) * 100;

	const ratePerMonth = (inputs.loanRate || 0) / 100 / 12;
	const totalPayments = (inputs.termYears || 0) * 12;
	const monthlyPayment =
		ratePerMonth === 0 || totalPayments === 0
			? 0
			: (refinanceAmount * ratePerMonth) /
				(1 - Math.pow(1 + ratePerMonth, -totalPayments));

	const noi = (inputs.rent || 0) * 12 * 0.65;

	return {
		inputs,
		results: {
			totalCost,
			refinanceAmount,
			cashOut,
			retainedEquity,
			roiPercent,
			monthlyPayment,
			noi,
		},
		metadata: { type: "brrrr", version: DEFAULT_METADATA_VERSION },
	};
}

export type DealComparisonInput = Array<{
	id: string;
	arv: number;
	cost: number;
	rent: number;
	cashFlow: number;
	roiPercent: number;
	capRate: number;
}>;

export function compareDeals(
	deals: DealComparisonInput,
): CalculationResult<
	DealComparisonInput,
	Array<DealComparisonInput[number] & { efficiencyScore: number }>
> {
	const scoredDeals = deals.map((deal) => {
		const efficiencyScore =
			(deal.roiPercent || 0) * 0.4 +
			(deal.capRate || 0) * 0.3 +
			((deal.cashFlow || 0) / Math.max(deal.cost || 1, 1)) * 0.3;

		return { ...deal, efficiencyScore };
	});

	const ranked = scoredDeals.sort(
		(left, right) => right.efficiencyScore - left.efficiencyScore,
	);

	return {
		inputs: deals,
		results: ranked,
		metadata: { type: "deal_comparison", version: DEFAULT_METADATA_VERSION },
	};
}

export async function estimateOfferPrice(inputs: {
	comps: Array<{ price: number }>;
	repairCost: number;
	desiredProfit: number;
	arv: number;
	aiConfidence?: number;
}): Promise<
	CalculationResult<
		typeof inputs,
		{
			averageCompPrice: number;
			baseMAO: number;
			adjustedOffer: number;
			aiConfidence: number;
		}
	>
> {
	const aiConfidence =
		inputs.aiConfidence === undefined ? 0.8 : inputs.aiConfidence;
	const compPrices = inputs.comps
		.map((comp) => comp.price)
		.filter((value) => Number.isFinite(value));
	const averageCompPrice =
		compPrices.length === 0
			? 0
			: compPrices.reduce((total, price) => total + price, 0) /
				compPrices.length;

	const baseMAO =
		(inputs.arv || 0) * 0.7 -
		(inputs.repairCost || 0) -
		(inputs.desiredProfit || 0);

	const confidenceAdjustment = (aiConfidence - 0.8) * 0.1;
	const adjustedOffer = baseMAO * (1 + confidenceAdjustment);

	return {
		inputs: { ...inputs, aiConfidence },
		results: {
			averageCompPrice,
			baseMAO,
			adjustedOffer,
			aiConfidence,
		},
		metadata: { type: "offer_estimator", version: DEFAULT_METADATA_VERSION },
	};
}

export function calculateLTV(inputs: {
	loanAmount: number;
	propertyValue: number;
}): CalculationResult<typeof inputs, { ltvPercent: number }> {
	const ltvPercent =
		(inputs.propertyValue || 0) === 0
			? 0
			: ((inputs.loanAmount || 0) / (inputs.propertyValue || 0)) * 100;

	return {
		inputs,
		results: { ltvPercent },
		metadata: { type: "ltv", version: DEFAULT_METADATA_VERSION },
	};
}

export function calculateDSCR(inputs: {
	noi: number;
	annualDebtService: number;
}): CalculationResult<typeof inputs, { dscr: number }> {
	const dscr =
		(inputs.annualDebtService || 0) === 0
			? 0
			: (inputs.noi || 0) / (inputs.annualDebtService || 0);

	return {
		inputs,
		results: { dscr },
		metadata: { type: "dscr", version: DEFAULT_METADATA_VERSION },
	};
}

export function calculateCommissionSplit(inputs: {
	salePrice: number;
	commissionRate: number;
	agentSplit: number;
	teamFee?: number;
}): CalculationResult<
	typeof inputs,
	{
		totalCommission: number;
		agentCommission: number;
		brokerCommission: number;
	}
> {
	const totalCommission =
		(inputs.salePrice || 0) * ((inputs.commissionRate || 0) / 100);
	const teamFee = inputs.teamFee || 0;
	const agentCommission =
		totalCommission * ((inputs.agentSplit || 0) / 100) - teamFee;
	const brokerCommission = totalCommission - agentCommission;

	return {
		inputs,
		results: {
			totalCommission,
			agentCommission,
			brokerCommission,
		},
		metadata: { type: "commission_split", version: DEFAULT_METADATA_VERSION },
	};
}

export function estimateClosingCosts(inputs: {
	salePrice: number;
	propertyTaxes: number;
	titleFees: number;
	transferTaxRate: number;
	miscFees?: number;
}): CalculationResult<
	typeof inputs,
	{
		transferTax: number;
		totalClosingCosts: number;
		netProceeds: number;
	}
> {
	const transferTax =
		(inputs.salePrice || 0) * ((inputs.transferTaxRate || 0) / 100);
	const totalClosingCosts =
		(inputs.propertyTaxes || 0) +
		(inputs.titleFees || 0) +
		transferTax +
		(inputs.miscFees || 0);
	const netProceeds = (inputs.salePrice || 0) - totalClosingCosts;

	return {
		inputs,
		results: {
			transferTax,
			totalClosingCosts,
			netProceeds,
		},
		metadata: { type: "closing_costs", version: DEFAULT_METADATA_VERSION },
	};
}

export const formatCurrency = (value: number) => currency.format(value);
export const formatPercent = (value: number) => percent.format(value / 100);
