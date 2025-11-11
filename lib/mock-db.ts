import type { PermissionAction, PermissionResource, User } from "../types/user";
import type { QuickStartDefaults } from "../types/userProfile";
import { deriveQuickStartDefaults } from "./demo/normalizeDemoPayload";

const fullCrud: PermissionAction[] = ["create", "read", "update", "delete"];
const adminPermissions: Record<PermissionResource, PermissionAction[]> = {
	users: fullCrud,
	leads: fullCrud,
	campaigns: fullCrud,
	reports: ["read"],
	team: fullCrud,
	subscription: ["read", "update"],
	ai: ["create", "read", "update"],
	tasks: fullCrud,
	companyProfile: ["read", "update"],
};

const supportPermissions: Record<PermissionResource, PermissionAction[]> = {
	users: ["read", "update"],
	leads: ["read"],
	campaigns: ["read"],
	reports: ["read"],
	team: ["read"],
	subscription: ["read"],
	ai: ["read"],
	tasks: ["read"],
	companyProfile: ["read"],
};

function flattenPermissionMatrix(
	matrix: Record<PermissionResource, PermissionAction[]>,
): string[] {
	return Object.entries(matrix).flatMap(([resource, actions]) =>
		actions.map((action) => `${resource}:${action}`),
	);
}

/**
 * Converts clientType to QuickStart persona ID
 * This ensures QuickStart Wizard auto-selects the appropriate persona
 */
function createQuickStartDefaults(
	clientType: "investor" | "wholesaler" | "agent" | "loan_officer" | undefined,
): QuickStartDefaults | undefined {
	if (!clientType) return undefined;

	const mapping = {
		investor: "investor",
		wholesaler: "wholesaler",
		agent: "agent",
		loan_officer: "lender",
	} as const;

	const personaId = mapping[clientType];
	return personaId ? { personaId } : undefined;
}

const adminDemoConfig = {
	companyName: "Acme Real Estate Group",
	companyLogo: "https://via.placeholder.com/200x60/3b82f6/ffffff?text=ACME",
	website: "https://acme-realestate.example.com",
	email: "contact@acme-realestate.example.com",
	phoneNumber: "(555) 123-4567",
	address: "123 Main Street",
	city: "San Francisco",
	state: "CA",
	zipCode: "94105",
	industry: "Real Estate",
	clientType: "agent" as const,
	goal: "Generate 50+ qualified leads per month for luxury properties",
	social: {
		facebook: "https://facebook.com/acmerealestate",
		instagram: "https://instagram.com/acmerealestate",
		linkedin: "https://linkedin.com/company/acme-real-estate",
		twitter: "https://twitter.com/acmerealestate",
		youtube: "https://youtube.com/@acmerealestate",
	},
	brandColor: "#3b82f6",
	brandColorSecondary: "#1e40af",
	brandColorAccent: "#60a5fa",
	notes: "Enterprise real estate client with 50+ agents",
};

const starterDemoConfig = {
	companyName: "Sunrise Homes LLC",
	companyLogo: "https://via.placeholder.com/200x60/f59e0b/ffffff?text=Sunrise",
	website: "https://sunrisehomes.example.com",
	email: "info@sunrisehomes.example.com",
	phoneNumber: "(555) 234-5678",
	address: "456 Oak Avenue",
	city: "Austin",
	state: "TX",
	zipCode: "78701",
	industry: "Real Estate",
	clientType: "wholesaler" as const,
	goal: "Distribute new contracts to VIP buyers fast",
	social: {
		facebook: "https://facebook.com/sunrisehomes",
		instagram: "https://instagram.com/sunrisehomestx",
		linkedin: "https://linkedin.com/company/sunrise-homes",
	},
	brandColor: "#f59e0b",
	brandColorSecondary: "#d97706",
	brandColorAccent: "#fbbf24",
	notes: "Small real estate startup, 3-5 agents",
};

const basicDemoConfig = {
	companyName: "Metro Property Investors",
	companyLogo: "https://via.placeholder.com/200x60/10b981/ffffff?text=METRO",
	website: "https://metroprop.example.com",
	email: "john@metroprop.example.com",
	phoneNumber: "(555) 345-6789",
	address: "789 Pine Street",
	city: "Seattle",
	state: "WA",
	zipCode: "98101",
	industry: "Real Estate Investment",
	clientType: "investor" as const,
	goal: "Find off-market multifamily deals with 15%+ ROI",
	social: {
		linkedin: "https://linkedin.com/company/metro-property-investors",
		youtube: "https://youtube.com/@metropropertyinvestors",
	},
	brandColor: "#10b981",
	brandColorSecondary: "#059669",
	brandColorAccent: "#34d399",
	notes: "Individual investor testing the platform",
};

const quickStartFallback = (
	defaults: QuickStartDefaults | null | undefined,
	backup: QuickStartDefaults,
): QuickStartDefaults => defaults ?? backup;

export const users: User[] = [
	{
		id: "1",
		name: "Admin User",
		email: "admin@example.com",
		password: "password123",
		role: "admin",
		tier: "Enterprise",
		isBetaTester: true,
		isPilotTester: true,
		permissions: adminPermissions,
		permissionList: flattenPermissionMatrix(adminPermissions),
		quotas: {
			ai: { allotted: 1000, used: 250, resetInDays: 7 },
			leads: { allotted: 500, used: 120, resetInDays: 30 },
			skipTraces: { allotted: 200, used: 50, resetInDays: 30 },
		},
		subscription: {
			aiCredits: { allotted: 1000, used: 250, resetInDays: 7 },
			leads: { allotted: 500, used: 120, resetInDays: 30 },
			skipTraces: { allotted: 200, used: 50, resetInDays: 30 },
		},
		demoConfig: adminDemoConfig,
		quickStartDefaults: quickStartFallback(
			deriveQuickStartDefaults({ demoConfig: adminDemoConfig }),
			{ personaId: "agent", goalId: "agent-sphere" },
		),
	},
	{
		id: "2",
		name: "Starter User",
		email: "starter@example.com",
		password: "password123",
		role: "member",
		tier: "Starter",
		isBetaTester: true,
		isPilotTester: false,
		permissions: {
			leads: ["read", "create"],
			campaigns: ["read"],
		},
		permissionList: ["leads:read", "leads:create", "campaigns:read"],
		quotas: {
			ai: { allotted: 100, used: 25, resetInDays: 30 },
			leads: { allotted: 50, used: 12, resetInDays: 30 },
			skipTraces: { allotted: 20, used: 5, resetInDays: 30 },
		},
		subscription: {
			aiCredits: { allotted: 100, used: 25, resetInDays: 30 },
			leads: { allotted: 50, used: 12, resetInDays: 30 },
			skipTraces: { allotted: 20, used: 5, resetInDays: 30 },
		},
		demoConfig: starterDemoConfig,
		quickStartDefaults: quickStartFallback(
			deriveQuickStartDefaults({
				demoConfig: starterDemoConfig,
				fallback: {
					personaId: "wholesaler",
					goalId: "wholesaler-dispositions",
				},
			}),
			{ personaId: "wholesaler", goalId: "wholesaler-dispositions" },
		),
	},
	{
		id: "3",
		name: "Basic User",
		email: "free@example.com",
		password: "password123",
		role: "member",
		tier: "Basic",
		isBetaTester: false,
		isPilotTester: false,
		permissions: {
			leads: ["read"],
		},
		permissionList: ["leads:read"],
		quotas: {
			ai: { allotted: 10, used: 2, resetInDays: 30 },
			leads: { allotted: 5, used: 1, resetInDays: 30 },
			skipTraces: { allotted: 2, used: 0, resetInDays: 30 },
		},
		subscription: {
			aiCredits: { allotted: 10, used: 2, resetInDays: 30 },
			leads: { allotted: 5, used: 1, resetInDays: 30 },
			skipTraces: { allotted: 2, used: 0, resetInDays: 30 },
		},
		demoConfig: basicDemoConfig,
		quickStartDefaults: quickStartFallback(
			deriveQuickStartDefaults({
				demoConfig: basicDemoConfig,
				fallback: { personaId: "investor", goalId: "investor-pipeline" },
			}),
			{ personaId: "investor", goalId: "investor-pipeline" },
		),
	},
	{
		id: "4",
		name: "Platform Admin",
		email: "platform.admin@example.com",
		password: "password123",
		role: "platform_admin",
		tier: "Enterprise",
		isBetaTester: true,
		isPilotTester: false,
		permissions: adminPermissions,
		permissionList: flattenPermissionMatrix(adminPermissions),
		quotas: {
			ai: { allotted: 1200, used: 150, resetInDays: 7 },
			leads: { allotted: 600, used: 80, resetInDays: 30 },
			skipTraces: { allotted: 240, used: 30, resetInDays: 30 },
		},
		subscription: {
			aiCredits: { allotted: 1200, used: 150, resetInDays: 7 },
			leads: { allotted: 600, used: 80, resetInDays: 30 },
			skipTraces: { allotted: 240, used: 30, resetInDays: 30 },
		},
		quickStartDefaults: { personaId: "investor", goalId: "investor-pipeline" }, // Default for platform admin
	},
	{
		id: "5",
		name: "Platform Support",
		email: "platform.support@example.com",
		password: "password123",
		role: "platform_support",
		tier: "Enterprise",
		isBetaTester: false,
		isPilotTester: false,
		permissions: supportPermissions,
		permissionList: flattenPermissionMatrix(supportPermissions),
		quotas: {
			ai: { allotted: 400, used: 90, resetInDays: 30 },
			leads: { allotted: 200, used: 40, resetInDays: 30 },
			skipTraces: { allotted: 100, used: 25, resetInDays: 30 },
		},
		subscription: {
			aiCredits: { allotted: 400, used: 90, resetInDays: 30 },
			leads: { allotted: 200, used: 40, resetInDays: 30 },
			skipTraces: { allotted: 100, used: 25, resetInDays: 30 },
		},
		quickStartDefaults: { personaId: "agent", goalId: "agent-sphere" }, // Default for platform support
	},
];

export const getUserByEmail = (email: string): User | undefined => {
	return users.find((user) => user.email === email);
};

export const getUserById = (id: string): User | undefined => {
	return users.find((user) => user.id === id);
};
