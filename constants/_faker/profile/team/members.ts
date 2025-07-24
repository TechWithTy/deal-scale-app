import type { TeamMember } from "@/types/userProfile";
import { faker } from "@faker-js/faker";
import { APP_TESTING_MODE } from "../../../data";

// Helper function to generate a mock team member
const generateMockTeamMember = (): TeamMember => ({
	id: faker.string.uuid(),
	firstName: faker.person.firstName(),
	lastName: faker.person.lastName(),
	email: faker.internet.email(),
	role: faker.helpers.arrayElement(["admin", "member"]),
	permissions: {
		canGenerateLeads: faker.datatype.boolean(),
		canStartCampaigns: faker.datatype.boolean(),
		canViewReports: faker.datatype.boolean(),
		canManageTeam: faker.datatype.boolean(),
		canManageSubscription: faker.datatype.boolean(),
		canAccessAI: faker.datatype.boolean(),
		canEditCompanyProfile: faker.datatype.boolean(),
		canMoveCompanyTasks: faker.datatype.boolean(),
	},
	NotificationPreferences: {
		emailNotifications: faker.datatype.boolean(),
		smsNotifications: faker.datatype.boolean(),
		notifyForNewLeads: faker.datatype.boolean(),
		notifyForCampaignUpdates: faker.datatype.boolean(),
	},
	twoFactorAuth: {
		isEnabled: faker.datatype.boolean(),
		methods: {
			sms: faker.datatype.boolean(),
			email: faker.datatype.boolean(),
			authenticatorApp: faker.datatype.boolean(),
		},
		lastUpdatedAt: faker.datatype.boolean() ? faker.date.past() : undefined,
	},
});

// Generate a list of mock team members
export const generateMockTeamMembers = (count: number): TeamMember[] => {
	return Array.from({ length: count }, () => generateMockTeamMember());
};

// Example usage
export const mockTeamMembers = APP_TESTING_MODE && generateMockTeamMembers(5);
