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
];

export const getUserByEmail = (email: string): User | undefined => {
	return users.find((user) => user.email === email);
};
