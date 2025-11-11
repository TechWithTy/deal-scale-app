import { AmortizationCalculator } from "./components/AmortizationCalculator";
import { BRRRRCalculator } from "./components/BRRRRCalculator";
import { ClosingCostCalculator } from "./components/ClosingCostCalculator";
import { CommissionSplitCalculator } from "./components/CommissionSplitCalculator";
import { DealComparisonCalculator } from "./components/DealComparisonCalculator";
import { DSCRCalculator } from "./components/DSCRCalculator";
import { FixFlipROICalculator } from "./components/FixFlipROICalculator";
import { LTVCalculator } from "./components/LTVCalculator";
import { OfferEstimatorCalculator } from "./components/OfferEstimatorCalculator";
import { RentalCashFlowCalculator } from "./components/RentalCashFlowCalculator";
import { WholesaleCalculator } from "./components/WholesaleCalculator";
import type { CalculatorDefinition } from "./types";

export const calculatorDefinitions: CalculatorDefinition[] = [
	{
		id: "amortization",
		title: "Amortization Calculator",
		description:
			"Estimate the monthly mortgage payment for a property by adjusting principal, term, and interest assumptions.",
		category: "Financing",
		keywords: ["mortgage", "monthly payment", "loan"],
		Component: AmortizationCalculator,
	},
	{
		id: "wholesale",
		title: "Wholesale Calculator",
		description:
			"Quickly derive the maximum allowable offer (MAO) by combining ARV, rehab costs, assignment fee, and desired profit margin.",
		category: "Investment Strategy",
		keywords: ["mao", "assignment", "deal analysis"],
		Component: WholesaleCalculator,
	},
	{
		id: "fix-flip-roi",
		title: "Fix & Flip ROI Calculator",
		description:
			"Analyze total investment, profit, and ROI for fix-and-flip scenarios.",
		category: "Investment Strategy",
		keywords: ["fix and flip", "roi", "profit"],
		Component: FixFlipROICalculator,
	},
	{
		id: "rental-cashflow",
		title: "Rental Cash Flow Calculator",
		description:
			"Evaluate rental income, cash flow, cap rate, and cash-on-cash return.",
		category: "Operations",
		keywords: ["cash flow", "cap rate", "rental"],
		Component: RentalCashFlowCalculator,
	},
	{
		id: "brrrr",
		title: "BRRRR Calculator",
		description:
			"Model cash out, retained equity, NOI, and refinance payments for BRRRR deals.",
		category: "Investment Strategy",
		keywords: ["brrrr", "refinance", "cash out"],
		Component: BRRRRCalculator,
	},
	{
		id: "deal-comparison",
		title: "Deal Comparison Calculator",
		description:
			"Rank deals using ROI, cap rate, and cash flow efficiency scoring.",
		category: "Analysis",
		keywords: ["deal ranking", "comparison", "analysis"],
		Component: DealComparisonCalculator,
	},
	{
		id: "offer-estimator",
		title: "Offer Price Estimator",
		description:
			"Blend comparables with MAO and AI confidence to fine-tune offer price guidance.",
		category: "Acquisition",
		keywords: ["offer", "mao", "comps"],
		Component: OfferEstimatorCalculator,
	},
	{
		id: "ltv",
		title: "Loan-to-Value Calculator",
		description:
			"Determine loan-to-value ratios to guide financing conversations.",
		category: "Financing",
		keywords: ["ltv", "leverage"],
		Component: LTVCalculator,
	},
	{
		id: "dscr",
		title: "DSCR Calculator",
		description:
			"Calculate debt service coverage ratios for income-producing assets.",
		category: "Financing",
		keywords: ["dscr", "coverage"],
		Component: DSCRCalculator,
	},
	{
		id: "commission-split",
		title: "Commission Split Calculator",
		description: "Break down commissions between agents, brokers, and teams.",
		category: "Operations",
		keywords: ["commission", "split"],
		Component: CommissionSplitCalculator,
	},
	{
		id: "closing-costs",
		title: "Closing Cost Estimator",
		description:
			"Project closing costs and seller net proceeds with transfer taxes and fees.",
		category: "Operations",
		keywords: ["closing costs", "net proceeds"],
		Component: ClosingCostCalculator,
	},
];

export function getCalculatorById(id: string) {
	return calculatorDefinitions.find((calculator) => calculator.id === id);
}

export function getCalculatorComponent(id: string) {
	return getCalculatorById(id)?.Component ?? null;
}

export function groupCalculatorsByCategory(
	items: CalculatorDefinition[] = calculatorDefinitions,
) {
	const grouped = new Map<string, CalculatorDefinition[]>();

	for (const definition of items) {
		if (!grouped.has(definition.category)) {
			grouped.set(definition.category, []);
		}
		grouped.get(definition.category)?.push(definition);
	}

	return Array.from(grouped.entries())
		.sort(([leftCategory], [rightCategory]) =>
			leftCategory.localeCompare(rightCategory),
		)
		.map(([category, definitions]) => ({
			category,
			items: definitions.sort((left, right) =>
				left.title.localeCompare(right.title),
			),
		}));
}
