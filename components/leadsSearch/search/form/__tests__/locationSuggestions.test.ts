import { describe, expect, it } from "vitest";

import {
	GOAL_OPTIONS,
	PERSONA_OPTIONS,
	deriveSuggestion,
	suggestZip,
} from "../locationSuggestions";

describe("suggestZip", () => {
	it("returns mapped zip for investor cashflow", () => {
		expect(suggestZip("investor", "cashflow")).toBe("78201");
	});

	it("returns mapped zip for wholesaler seller leads", () => {
		expect(suggestZip("wholesaler", "seller_leads")).toBe("60629");
	});

	it("falls back to default when goal is unknown", () => {
		expect(suggestZip("agent", "unknown" as never)).toBe("30301");
	});
});

describe("metadata", () => {
	it("provides persona descriptions", () => {
		const investor = PERSONA_OPTIONS.find(
			(option) => option.value === "investor",
		);
		expect(investor?.description).toMatch(/cap rates/i);
	});

	it("lists goal options", () => {
		expect(GOAL_OPTIONS.map((option) => option.value)).toContain("referrals");
	});
});

describe("deriveSuggestion", () => {
	it("returns personalized message with recommended zip", () => {
		const result = deriveSuggestion("investor", "cashflow");
		expect(result.zip).toBe("78201");
		expect(result.message).toMatch(/Investor/i);
		expect(result.message).toMatch(/Cash Flow/i);
		expect(result.message).toMatch(/78201/);
	});

	it("falls back gracefully when goal is invalid", () => {
		const result = deriveSuggestion("agent", "unknown-goal");
		expect(result.zip).toBe("30301");
		expect(result.message).toMatch(/Agent/i);
		expect(result.message).toMatch(/30301/);
	});
});
