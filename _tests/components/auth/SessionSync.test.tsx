import React from "react";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { beforeEach, afterEach, afterAll, describe, expect, it, vi } from "vitest";

const previousTestingMode = process.env.NEXT_PUBLIC_APP_TESTING_MODE;
process.env.NEXT_PUBLIC_APP_TESTING_MODE = "true";

vi.mock("next-auth/react", () => ({
	useSession: vi.fn(),
}));

vi.mock("@/constants/_faker/profile/userProfile", () => ({
	MockUserProfile: {
		firstName: "Mock",
		lastName: "User",
		email: "mock@example.com",
		companyInfo: {
			companyName: "Mock Co",
			companyLogo: "",
			assets: { logo: "", favicon: "", banner: "", ghlAssets: [] },
			webhook: "",
			socialMediaTags: [] as string[],
			GHLID: { locationId: "mock-location" },
			campaigns: {
				textCampaigns: [],
				emailCampaigns: [],
				socialCampaigns: [],
				callCampaigns: [],
			},
			KanbanTasks: [],
			forwardingNumber: "",
			outreachEmail: "",
			campaignAnalytics: [],
			leads: [],
			leadLists: [],
		},
		subscription: {
			aiCredits: { allotted: 0, used: 0, resetInDays: 30 },
			leads: { allotted: 0, used: 0, resetInDays: 30 },
			skipTraces: { allotted: 0, used: 0, resetInDays: 30 },
		},
		quickStartDefaults: { personaId: "agent", goalId: "agent-sphere" },
		billingHistory: [],
		paymentDetails: { cardLastFour: "0000", expiry: "", cardType: "" },
		twoFactorAuth: {
			methods: { sms: false, email: false, authenticatorApp: false },
		},
		teamMembers: [],
		activityLog: [],
		securitySettings: {
			lastLoginTime: new Date(),
			password: "",
			passwordUpdatedAt: null,
		},
		aIKnowledgebase: { articles: [], totalArticles: 0, topics: [] },
	},
}));

import SessionSync from "@/components/auth/SessionSync";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import { useUserStore } from "@/lib/stores/userStore";
import { useSession } from "next-auth/react";

const resetStores = () => {
	act(() => {
		useUserStore.getState().setUser(null);
		useUserProfileStore.getState().resetUserProfile();
	});
};

describe("SessionSync", () => {
	beforeEach(() => {
		resetStores();
		localStorage.clear();
	});

	afterEach(() => {
		cleanup();
	});

	afterAll(() => {
		if (previousTestingMode === undefined) {
			delete process.env.NEXT_PUBLIC_APP_TESTING_MODE;
		} else {
			process.env.NEXT_PUBLIC_APP_TESTING_MODE = previousTestingMode;
		}
	});

	it("hydrates the profile store from demo session data", async () => {
		const demoSession = {
			user: {
				id: "demo-user",
				email: "demo@example.com",
				role: "member",
				tier: "Starter",
				permissions: ["leads:read"],
				permissionMatrix: { leads: ["read"] },
				quickStartDefaults: {
					personaId: "agent",
					goalId: "agent-sphere",
				},
				quotas: {
					ai: { allotted: 100, used: 10, resetInDays: 7 },
					leads: { allotted: 50, used: 5, resetInDays: 30 },
					skipTraces: { allotted: 20, used: 2, resetInDays: 30 },
				},
				subscription: {
					aiCredits: { allotted: 100, used: 10, resetInDays: 7 },
					leads: { allotted: 50, used: 5, resetInDays: 30 },
					skipTraces: { allotted: 20, used: 2, resetInDays: 30 },
				},
				demoConfig: {
					companyName: "Acme Realty",
					companyLogo: "https://example.com/logo.svg",
					phoneNumber: "(555) 000-1111",
					email: "contact@acme.example.com",
					social: {
						facebook: "https://facebook.com/acme",
						linkedin: "https://linkedin.com/acme",
					},
				},
			},
		} as any;

		vi.mocked(useSession).mockReturnValue({
			data: demoSession,
			status: "authenticated",
		} as any);

		render(<SessionSync />);

		await waitFor(() => {
			const profile = useUserProfileStore.getState().userProfile;
			expect(profile?.companyInfo.companyName).toBe("Acme Realty");
			expect(profile?.quickStartDefaults?.goalId).toBe("agent-sphere");
		});
	});

	it("clears hydrated state when the session ends", async () => {
		const demoSession = {
			user: {
				id: "demo-user",
				role: "member",
				email: "demo@example.com",
				permissions: [],
				permissionMatrix: {},
				demoConfig: { companyName: "Staging" },
			},
		} as any;

		vi.mocked(useSession).mockReturnValueOnce({
			data: demoSession,
			status: "authenticated",
		} as any);

		const { rerender } = render(<SessionSync />);

		await waitFor(() => {
			expect(useUserProfileStore.getState().userProfile).not.toBeNull();
		});

		vi.mocked(useSession).mockReturnValue({ data: null, status: "unauthenticated" } as any);
		rerender(<SessionSync />);

		await waitFor(() => {
			expect(useUserProfileStore.getState().userProfile).toBeNull();
		});
	});
});
