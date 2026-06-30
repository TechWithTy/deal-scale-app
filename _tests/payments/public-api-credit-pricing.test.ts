import {
	extractCheckoutUrl,
	extractCreditPricingCatalog,
} from "@/lib/payments/public-api-credit-pricing";
import { describe, expect, it } from "vitest";

describe("public API credit pricing adapter", () => {
	it("normalizes the production pricing response", () => {
		const catalog = extractCreditPricingCatalog({
			tiers: [
				{
					name: "500+ Credits",
					credits: 500,
					price: 40,
					discount: 20,
					price_per_credit: 0.08,
					savings: 10,
				},
				{ name: "invalid", credits: 0, price: -1 },
			],
			currency: "usd",
			available_credit_types: [
				{ value: "ai", display: "AI Credits" },
				{ value: "", display: "Invalid" },
			],
		});

		expect(catalog).toEqual({
			currency: "USD",
			creditTypes: [{ value: "ai", display: "AI Credits" }],
			tiers: [
				{
					name: "500+ Credits",
					credits: 500,
					price: 40,
					discount: 20,
					pricePerCredit: 0.08,
					savings: 10,
				},
			],
		});
	});

	it("returns an empty catalog for malformed responses", () => {
		expect(extractCreditPricingCatalog({ tiers: "invalid" })).toEqual({
			currency: "USD",
			creditTypes: [],
			tiers: [],
		});
	});

	it("accepts secure checkout URLs only", () => {
		expect(
			extractCheckoutUrl({
				session_url: "https://checkout.stripe.com/c/pay/session",
			}),
		).toBe("https://checkout.stripe.com/c/pay/session");
		expect(extractCheckoutUrl({ url: "javascript:alert(1)" })).toBeNull();
		expect(extractCheckoutUrl({ session_url: 123 })).toBeNull();
	});
});
