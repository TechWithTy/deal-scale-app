import type { TeamMember } from "@/types/userProfile";
import { faker } from "@faker-js/faker";
import { APP_TESTING_MODE } from "../../../data";

// Fixed array of mock team members for consistent IDs and profiles

export const mockTeamMembers: TeamMember[] = [
	{
		id: "7d8824fd-603f-4805-9fbc-f5b22e54a610",
		firstName: "Jane",
		lastName: "Doe",
		email: "jane.doe@example.com",
		role: "admin",
		permissions: {
			canGenerateLeads: true,
			canStartCampaigns: true,
			canViewReports: true,
			canManageTeam: true,
			canManageSubscription: true,
			canAccessAI: true,
			canEditCompanyProfile: true,
			canMoveCompanyTasks: true,
		},
		NotificationPreferences: {
			emailNotifications: true,
			smsNotifications: false,
			notifyForNewLeads: true,
			notifyForCampaignUpdates: true,
		},
		twoFactorAuth: {
			isEnabled: true,
			methods: { sms: true, email: true, authenticatorApp: false },
		},
	},
	{
		id: "b8b2e7b2-2d5a-4e4e-8d1c-2a2b2b2b2b2b",
		firstName: "John",
		lastName: "Smith",
		email: "john.smith@example.com",
		role: "member",
		permissions: {
			canGenerateLeads: false,
			canStartCampaigns: true,
			canViewReports: true,
			canManageTeam: false,
			canManageSubscription: false,
			canAccessAI: true,
			canEditCompanyProfile: false,
			canMoveCompanyTasks: false,
		},
		NotificationPreferences: {
			emailNotifications: true,
			smsNotifications: true,
			notifyForNewLeads: false,
			notifyForCampaignUpdates: true,
		},
		twoFactorAuth: {
			isEnabled: false,
			methods: { sms: false, email: false, authenticatorApp: false },
		},
	},
	// Add more fixed team members as needed
];
