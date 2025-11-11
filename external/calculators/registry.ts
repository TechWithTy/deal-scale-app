import { AmortizationCalculator } from "./components/AmortizationCalculator";
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
