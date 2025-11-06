import type { TeamMember } from "@/types/userProfile";
import { NEXT_PUBLIC_APP_TESTING_MODE } from "../../../data";

// Fixed array of mock team members for consistent IDs and profiles

const TEAM_MEMBERS: TeamMember[] = [
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
		platformIntegration: {
			callTransferBufferTime: 15,
			textBufferPeriod: 3,
			autoResponseEnabled: true,
			workingHoursStart: "08:00",
			workingHoursEnd: "18:00",
			timezone: "America/New_York",
			maxConcurrentConversations: 10,
			enableCallRecording: true,
			enableTextNotifications: true,
			enableEmailNotifications: true,
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
		platformIntegration: {
			callTransferBufferTime: 30,
			textBufferPeriod: 5,
			autoResponseEnabled: false,
			workingHoursStart: "09:00",
			workingHoursEnd: "17:00",
			timezone: "America/Los_Angeles",
			maxConcurrentConversations: 5,
			enableCallRecording: false,
			enableTextNotifications: true,
			enableEmailNotifications: true,
		},
	},
	// Add more fixed team members as needed
];

export const generateMockTeamMembers = (): TeamMember[] =>
	TEAM_MEMBERS.map((m) => ({ ...m }));

// Always export an array so callers can safely use array methods without union type guards
// When NEXT_PUBLIC_APP_TESTING_MODE is off, return an empty array instead of false
export const mockTeamMembers: TeamMember[] = NEXT_PUBLIC_APP_TESTING_MODE
	? TEAM_MEMBERS
	: [];
