export type PermissionAction = "create" | "read" | "update" | "delete";

export type PermissionResource =
	| "users"
	| "leads"
	| "campaigns"
	| "reports"
	| "team"
	| "subscription"
	| "ai"
	| "tasks"
	| "companyProfile";

export type PermissionMatrix = {
	[resource in PermissionResource]?: PermissionAction[];
};

export interface UserQuotaBucket {
	allotted: number;
	used: number;
	resetInDays?: number;
}

export interface UserQuotas {
	ai: UserQuotaBucket;
	leads: UserQuotaBucket;
	skipTraces: UserQuotaBucket;
}

export type UserRole = "admin" | "manager" | "member";

export type UserTier = "Free" | "Starter" | "Enterprise";

export interface User {
	id: string;
	name: string;
	email: string;
	password?: string;
	role: UserRole;
	tier: UserTier;
	permissions: PermissionMatrix;
	permissionList: string[]; // Derived list (e.g., ["leads:read"]) for legacy checks
	quotas: UserQuotas;
	subscription: {
		aiCredits: { allotted: number; used: number; resetInDays: number };
		leads: { allotted: number; used: number; resetInDays: number };
		skipTraces: { allotted: number; used: number; resetInDays: number };
	};
}
