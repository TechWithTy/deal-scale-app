import type { PermissionAction, PermissionResource, User } from "../types/user";

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
	},
];

export const getUserByEmail = (email: string): User | undefined => {
	return users.find((user) => user.email === email);
};
