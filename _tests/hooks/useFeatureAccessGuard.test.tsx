import { renderHook, act } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useFeatureAccessGuard } from "@/hooks/useFeatureAccessGuard";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import { useUserStore } from "@/lib/stores/userStore";
import { useSessionStore } from "@/lib/stores/user/useSessionStore";

const resetStores = () => {
	act(() => {
		useUserProfileStore.setState({ userProfile: null } as any);
		useUserStore.setState({
			role: undefined,
			tier: undefined,
			permissionList: [],
			permissionMatrix: {},
		} as any);
		useSessionStore.setState({ user: null, impersonator: null });
	});
};

const minimalSubscription = () => ({
	id: "sub-1",
	name: "",
	type: "monthly" as const,
	status: "active" as const,
	price: "$0",
	aiCredits: { allotted: 0, used: 0, resetInDays: 0 },
	leads: { allotted: 0, used: 0, resetInDays: 0 },
	skipTraces: { allotted: 0, used: 0, resetInDays: 0 },
	renewalDate: "",
	createdAt: "",
	planDetails: "",
});

describe("useFeatureAccessGuard tier resolution", () => {
	afterEach(() => {
		resetStores();
	});

	it("falls back to user store tier when subscription plan is missing", () => {
		act(() => {
			useUserProfileStore.setState(
				{
					userProfile: {
						subscription: minimalSubscription(),
					},
				} as any,
				true,
			);
			useUserStore.setState({ tier: "Starter" });
		});

		const { result } = renderHook(() =>
			useFeatureAccessGuard("navigation.aiAssistants"),
		);

		expect(result.current.userTier).toBe("Starter");
		expect(result.current.allowed).toBe(true);
	});

	it("respects required tier when neither subscription nor session meet it", () => {
		act(() => {
			useUserProfileStore.setState(
				{
					userProfile: {
						subscription: minimalSubscription(),
					},
				} as any,
				true,
			);
			useUserStore.setState({ tier: "Basic" });
		});

		const { result } = renderHook(() =>
			useFeatureAccessGuard("navigation.aiAssistants"),
		);

		expect(result.current.allowed).toBe(false);
		expect(result.current.requiredTier).toBe("Starter");
	});

	it("uses session tier fallback when user store tier is unset", () => {
		act(() => {
			useUserProfileStore.setState(
				{
					userProfile: {
						subscription: minimalSubscription(),
					},
				} as any,
				true,
			);
			useSessionStore.setState({
				user: { tier: "Enterprise" } as any,
				impersonator: null,
			});
		});

		const { result } = renderHook(() =>
			useFeatureAccessGuard("navigation.aiAssistants"),
		);

		expect(result.current.userTier).toBe("Enterprise");
		expect(result.current.allowed).toBe(true);
	});
});

