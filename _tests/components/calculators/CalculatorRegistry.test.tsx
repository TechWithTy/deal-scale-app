import { describe, expect, it } from "vitest";

import { calculatorDefinitions } from "external/calculators";

describe("calculatorDefinitions registry", () => {
	it("includes core calculators with stable identifiers", () => {
		const ids = calculatorDefinitions.map((calculator) => calculator.id);
		expect(ids).toEqual([
			"amortization",
			"wholesale",
			"fix-flip-roi",
			"rental-cashflow",
			"brrrr",
			"deal-comparison",
			"offer-estimator",
			"ltv",
			"dscr",
			"commission-split",
			"closing-costs",
		]);
	});

	it("exposes user-facing metadata for navigation", () => {
		const titles = calculatorDefinitions.map((calculator) => calculator.title);
		expect(titles).toEqual([
			"Amortization Calculator",
			"Wholesale Calculator",
			"Fix & Flip ROI Calculator",
			"Rental Cash Flow Calculator",
			"BRRRR Calculator",
			"Deal Comparison Calculator",
			"Offer Price Estimator",
			"Loan-to-Value Calculator",
			"DSCR Calculator",
			"Commission Split Calculator",
			"Closing Cost Estimator",
		]);
	});
});

