export type AdminUserRole =
	| "user"
	| "admin"
	| "support"
	| "platform_admin"
	| "platform_support";

export interface AdminUserCreditsBucket {
	allotted: number;
	used: number;
}

export interface AdminUserCredits {
	ai: AdminUserCreditsBucket;
	leads: AdminUserCreditsBucket;
	skipTraces: AdminUserCreditsBucket;
}

export interface AdminUser {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	phone?: string;
	role: AdminUserRole;
	status?:
		| "active"
		| "pending"
		| "disabled"
		| "failed"
		| "suspended"
		| "banned";
	suspensionDate?: string;
	unsuspendDate?: string;
	credits?: AdminUserCredits;
}
