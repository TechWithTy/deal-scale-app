import type { AdminUser } from "@/components/tables/super-users/types";
import { getUserById, users } from "@/lib/mock-db";
import type { User } from "@/types/user";

export interface AdminActivityEvent {
	id: string;
	at: string;
	message: string;
}

export interface AdminDirectoryUser extends AdminUser {
	name: string;
	tier: User["tier"];
	quotas: User["quotas"];
	subscription: User["subscription"];
	permissionMatrix: User["permissions"];
	permissionList: User["permissionList"];
	isBetaTester?: boolean;
	isPilotTester?: boolean;
	isFreeTier?: boolean;
}

interface DirectoryMetadata {
	phone?: string;
	status?: AdminUser["status"];
	role?: AdminUser["role"];
	suspensionDate?: string;
	unsuspendDate?: string;
}

const DIRECTORY_METADATA: Record<string, DirectoryMetadata> = {
	"1": {
		phone: "+1 (555) 010-0001",
		status: "active",
		role: "admin",
	},
	"2": {
		phone: "+1 (555) 010-0002",
		status: "active",
		role: "user",
	},
	"3": {
		phone: "+1 (555) 010-0003",
		status: "suspended",
		role: "user",
		suspensionDate: "2024-05-12",
		unsuspendDate: "2024-06-12",
	},
	"4": {
		phone: "+1 (555) 010-0004",
		status: "active",
		role: "platform_admin",
	},
	"5": {
		phone: "+1 (555) 010-0005",
		status: "active",
		role: "platform_support",
	},
};

const DIRECTORY_ACTIVITY: Record<string, AdminActivityEvent[]> = {
	"1": [
		{
			id: "health-check",
			at: "2024-05-01T10:30:00.000Z",
			message: "Reviewed enterprise account health dashboard.",
		},
		{
			id: "permissions-audit",
			at: "2024-04-28T15:10:00.000Z",
			message: "Audited platform permissions for support readiness.",
		},
	],
	"2": [
		{
			id: "welcome-call",
			at: "2024-05-03T17:45:00.000Z",
			message: "Completed onboarding success review with customer.",
		},
		{
			id: "dashboard-review",
			at: "2024-04-30T13:05:00.000Z",
			message: "Verified dashboard widgets with starter user.",
		},
	],
	"3": [
		{
			id: "limit-check",
			at: "2024-05-08T11:20:00.000Z",
			message: "Proactively paused workspace for quota investigation.",
		},
		{
			id: "support-followup",
			at: "2024-05-07T09:15:00.000Z",
			message: "Coordinated follow-up for verification documents.",
		},
	],
	"4": [
		{
			id: "impersonation-test",
			at: "2024-05-09T19:00:00.000Z",
			message: "Validated impersonation flow across admin touchpoints.",
		},
	],
	"5": [
		{
			id: "support-shift",
			at: "2024-05-10T02:30:00.000Z",
			message: "Started overnight support shift readiness checklist.",
		},
		{
			id: "troubleshooting-review",
			at: "2024-05-06T21:45:00.000Z",
			message: "Documented knowledge base updates for impersonation assists.",
		},
	],
};

function splitName(fullName: string) {
	const trimmed = fullName.trim();
	if (!trimmed) {
		return { firstName: undefined, lastName: undefined };
	}
	const parts = trimmed.split(/\s+/);
	const [first, ...rest] = parts;
	const firstName = first ?? "";
	const lastName = rest.length > 0 ? rest.join(" ") : "";
	return {
		firstName: firstName || undefined,
		lastName: lastName || undefined,
	};
}

function mapRole(role: User["role"], override?: AdminUser["role"]) {
	if (override) return override;
	switch (role) {
		case "manager":
		case "member":
			return "user";
		case "support":
			return "support";
		default:
			return role as AdminUser["role"];
	}
}

function toCredits(user: User): NonNullable<AdminUser["credits"]> {
	const { aiCredits, leads, skipTraces } = user.subscription;
	return {
		ai: { allotted: aiCredits.allotted, used: aiCredits.used },
		leads: { allotted: leads.allotted, used: leads.used },
		skipTraces: { allotted: skipTraces.allotted, used: skipTraces.used },
	};
}

function decorateUser(user: User): AdminDirectoryUser {
	const metadata = DIRECTORY_METADATA[user.id] ?? {};
	const names = splitName(user.name);
	const credits = toCredits(user);
	return {
		id: user.id,
		email: user.email,
		firstName: names.firstName,
		lastName: names.lastName,
		phone: metadata.phone,
		role: mapRole(user.role, metadata.role),
		status: metadata.status ?? "active",
		suspensionDate: metadata.suspensionDate,
		unsuspendDate: metadata.unsuspendDate,
		credits,
		name: user.name,
		tier: user.tier,
		quotas: user.quotas,
		subscription: user.subscription,
		permissionMatrix: user.permissions,
		permissionList: user.permissionList,
		isBetaTester: user.isBetaTester,
		isPilotTester: user.isPilotTester,
		isFreeTier: user.isFreeTier,
	};
}

export function listAdminUsers(): AdminUser[] {
	return users.map((user) => {
		const decorated = decorateUser(user);
		return {
			id: decorated.id,
			email: decorated.email,
			firstName: decorated.firstName,
			lastName: decorated.lastName,
			phone: decorated.phone,
			role: decorated.role,
			status: decorated.status,
			suspensionDate: decorated.suspensionDate,
			unsuspendDate: decorated.unsuspendDate,
			credits: decorated.credits,
		} satisfies AdminUser;
	});
}

export function getAdminDirectoryUser(id: string): AdminDirectoryUser | null {
	const user = getUserById(id);
	if (!user) return null;
	return decorateUser(user);
}

export function getAdminActivityLog(id: string): AdminActivityEvent[] {
	return DIRECTORY_ACTIVITY[id] ?? [];
}
