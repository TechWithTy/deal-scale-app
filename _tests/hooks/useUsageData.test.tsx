import {
	mergeCreditsIntoSubscription,
	useUsageData,
} from "@/components/reusables/modals/user/usage/useUsageData";
import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const creditsApiMock = vi.hoisted(() => ({
	getCreditsBalance: vi.fn(),
}));

vi.mock("@/lib/api/public-api-dashboard", () => creditsApiMock);

const fallback: UserProfileSubscription = {
	aiCredits: { allotted: 100, resetInDays: 7, used: 25 },
	createdAt: "",
	id: "sub-1",
	leads: { allotted: 50, resetInDays: 7, used: 10 },
	name: "Starter",
	planDetails: "",
	price: "$100",
	renewalDate: "",
	skipTraces: { allotted: 20, resetInDays: 7, used: 5 },
	status: "active",
	stripeSubscriptionID: "",
	type: "monthly",
};

describe("useUsageData", () => {
	beforeEach(() => {
		creditsApiMock.getCreditsBalance.mockReset();
	});

	it("merges public API credit balances into the fallback subscription", () => {
		const result = mergeCreditsIntoSubscription(fallback, {
			balances: {
				ai: { available: 70, spent: 30, total: 100 },
				lead: { available_credits: 40, lifetime_earned: 55, total_spent: 15 },
				skip_trace: 12,
			},
		});

		expect(result.aiCredits).toEqual({ allotted: 100, resetInDays: 7, used: 30 });
		expect(result.leads).toEqual({ allotted: 55, resetInDays: 7, used: 15 });
		expect(result.skipTraces).toEqual({
			allotted: 20,
			resetInDays: 7,
			used: 5,
		});
	});

	it("uses fallback data without a public API token", async () => {
		const { result } = renderHook(() => useUsageData(fallback));

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.source).toBe("fallback");
		expect(result.current.data?.aiCredits.used).toBe(25);
		expect(creditsApiMock.getCreditsBalance).not.toHaveBeenCalled();
	});

	it("loads public API credits when a token is available", async () => {
		creditsApiMock.getCreditsBalance.mockResolvedValue({
			balances: {
				ai: { available: 90, spent: 10, total: 100 },
			},
		});

		const { result } = renderHook(() => useUsageData(fallback, "token-123"));

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.source).toBe("live");
		expect(result.current.data?.aiCredits.used).toBe(10);
		expect(creditsApiMock.getCreditsBalance).toHaveBeenCalledWith("token-123");
	});
});
