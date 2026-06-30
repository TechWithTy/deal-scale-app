import {
	extractCreditStats,
	extractCreditTransactions,
} from "@/lib/credits/public-api-credit-activity";
import { describe, expect, it } from "vitest";

describe("public API credit activity adapters", () => {
	it("normalizes credit statistics", () => {
		expect(
			extractCreditStats({
				total_used: 25,
				total_purchased: 100,
				total_available: 75,
				overall_usage_percentage: 25,
			}),
		).toEqual({
			available: 75,
			purchased: 100,
			usagePercentage: 25,
			used: 25,
		});
	});

	it("normalizes transaction history", () => {
		expect(
			extractCreditTransactions([
				{
					id: "tx-1",
					credit_type: "ai",
					amount: -10,
					balance_after: 90,
					reason: "campaign",
					created_at: "2026-06-29T12:00:00Z",
				},
			]),
		).toEqual([
			{
				amount: -10,
				balanceAfter: 90,
				createdAt: "2026-06-29T12:00:00Z",
				creditType: "ai",
				id: "tx-1",
				reason: "campaign",
			},
		]);
	});
});
