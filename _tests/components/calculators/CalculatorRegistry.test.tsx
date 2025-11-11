import { describe, expect, it } from "vitest";

import { calculatorDefinitions } from "external/calculators";

describe("calculatorDefinitions registry", () => {
	it("includes core calculators with stable identifiers", () => {
		const ids = calculatorDefinitions.map((calculator) => calculator.id);

		expect(ids).toContain("amortization");
		expect(ids).toContain("wholesale");
	});

	it("exposes user-facing metadata for navigation", () => {
		const titles = calculatorDefinitions.map((calculator) => calculator.title);

		expect(titles).toContain("Amortization Calculator");
		expect(titles).toContain("Wholesale Calculator");
	});
});

