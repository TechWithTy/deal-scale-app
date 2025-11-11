import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { UserProfile } from "@/types/userProfile";
import { useQuickStartROIProfile } from "@/hooks/useQuickStartROIProfile";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";

vi.mock("next-auth/react", () => ({
	useSession: () => ({
		data: {
			user: {
				quickStartDefaults: {
					personaId: "agent",
					goalId: "agent-sphere",
				},
				subscription: {
					name: "Enterprise",
					type: "monthly",
					leads: { allotted: 120, used: 0, resetInDays: 30 },
					aiCredits: { allotted: 0, used: 0, resetInDays: 30 },
					skipTraces: { allotted: 0, used: 0, resetInDays: 30 },
					id: "sub",
					stripeSubscriptionID: "stripe",
					price: "$0",
					status: "active",
					planDetails: "Enterprise",
					renewalDate: "",
					createdAt: "",
				},
			},
		},
	}),
}));

const createMockProfile = (): UserProfile =>
	({
		id: "user",
		subscription: {
			id: "sub",
			stripeSubscriptionID: "stripe",
			name: "Enterprise",
			type: "monthly",
			status: "active",
			price: "$0",
			aiCredits: { allotted: 0, used: 0, resetInDays: 30 },
			leads: { allotted: 240, used: 0, resetInDays: 30 },
			skipTraces: { allotted: 0, used: 0, resetInDays: 30 },
			renewalDate: "",
			createdAt: "",
			planDetails: "Enterprise",
		},
		firstName: "Test",
		lastName: "User",
		email: "test@example.com",
		personalNum: "",
		country: "",
		state: "",
		city: "",
		updatedAt: new Date(),
		createdAt: new Date(),
		connectedAccounts: {
			hubSpot: { accountId: "hub", accountName: "HubSpot" },
		} as unknown as UserProfile["connectedAccounts"],
		leadPreferences: {
			preferredLocation: [],
			industry: "",
			minLeadQuality: 0,
			maxBudget: 1500,
		},
		savedSearches: [],
		savedCampaignTemplates: [],
		workflowPlatforms: [],
		savedWorkflows: [],
		notificationPreferences: {
			emailNotifications: true,
			smsNotifications: true,
			notifyForNewLeads: true,
			notifyForCampaignUpdates: true,
		},
		integrations: [],
		companyInfo: {
			companyName: "Acme",
			assets: { logo: "" },
			socialMediaTags: [],
			companyLogo: undefined,
			GHLID: { businessId: "biz", subAccountId: "sub" },
			campaigns: {} as unknown,
			forwardingNumber: "",
			outreachEmail: "",
			leads: [],
			leadLists: [],
			KanbanTasks: {} as unknown,
			clientType: "agent",
		} as unknown as UserProfile["companyInfo"],
		aIKnowledgebase: {} as UserProfile["aIKnowledgebase"],
		billingHistory: [],
		paymentDetails: {} as UserProfile["paymentDetails"],
		twoFactorAuth: { methods: { sms: false, email: false, authenticatorApp: false } },
		teamMembers: [
			{
				id: "team-1",
				firstName: "Alex",
				lastName: "Morgan",
				email: "alex@example.com",
				role: "admin",
				permissions: {
					canGenerateLeads: true,
					canStartCampaigns: true,
					canViewReports: true,
					canManageTeam: true,
					canManageSubscription: true,
					canAccessAI: true,
					canMoveCompanyTasks: true,
					canEditCompanyProfile: true,
				},
			},
			{
				id: "team-2",
				firstName: "Jamie",
				lastName: "Rivera",
				email: "jamie@example.com",
				role: "member",
				permissions: {
					canGenerateLeads: true,
					canStartCampaigns: true,
					canViewReports: true,
					canManageTeam: false,
					canManageSubscription: false,
					canAccessAI: true,
					canMoveCompanyTasks: true,
					canEditCompanyProfile: false,
				},
			},
		],
		activityLog: [],
		securitySettings: { lastLoginTime: null, password: "", passwordUpdatedAt: null },
		quickStartDefaults: {
			personaId: "agent",
			goalId: "agent-expansion",
		},
	}) as UserProfile;

describe("useQuickStartROIProfile", () => {
	beforeEach(() => {
		useQuickStartWizardDataStore.setState({
			personaId: "agent",
			goalId: "agent-sphere",
		});
	});

	afterEach(() => {
		useQuickStartWizardDataStore.getState().reset();
		useUserProfileStore.getState().resetUserProfile();
	});

	it("combines wizard persona/goal with session defaults", () => {
		const { result } = renderHook(() => useQuickStartROIProfile());

		expect(result.current.metadata.personaId).toBe("agent");
		expect(result.current.metadata.goalId).toBe("agent-sphere");
		expect(result.current.metadata.personaTitle).toBe("Agent / Team");
	});

	it("derives overrides from user profile context", () => {
		const profile = createMockProfile();
		useUserProfileStore.getState().setUserProfile(profile);

		const { result } = renderHook(() => useQuickStartROIProfile());

		expect(result.current.metadata.companySizeLabel).toBe("2-person growth team");
		expect(result.current.metadata.crmName).toBe("HubSpot");
		expect(result.current.profile.dealsPerMonth).toBeGreaterThan(5);
		expect(result.current.profile.avgDealValue).toBeGreaterThan(0);
	});
});

