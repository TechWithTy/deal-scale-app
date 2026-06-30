import type { TeamMember, UserPermissions } from "@/types/userProfile";

const defaultPermissions: UserPermissions = {
	canAccessAI: false,
	canEditCompanyProfile: false,
	canGenerateLeads: false,
	canManageSubscription: false,
	canManageTeam: false,
	canMoveCompanyTasks: false,
	canStartCampaigns: false,
	canViewReports: false,
};

const roleValues = new Set<TeamMember["role"]>([
	"admin",
	"member",
	"platform_admin",
	"platform_support",
	"support",
]);

function asRecord(value: unknown): Record<string, unknown> {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};
}

function asString(value: unknown) {
	return typeof value === "string" ? value : undefined;
}

function asBoolean(value: unknown) {
	return typeof value === "boolean" ? value : false;
}

function splitName(name?: string) {
	const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
	return {
		firstName: parts[0],
		lastName: parts.length > 1 ? parts.slice(1).join(" ") : undefined,
	};
}

function normalizeRole(value: unknown): TeamMember["role"] {
	const role = asString(value);
	if (role === "owner") return "admin";
	if (role === "guest") return "member";
	return role && roleValues.has(role as TeamMember["role"])
		? (role as TeamMember["role"])
		: "member";
}

function normalizePermissions(value: unknown): UserPermissions {
	const record = asRecord(value);
	return {
		canAccessAI: asBoolean(record.canAccessAI ?? record.can_access_ai),
		canEditCompanyProfile: asBoolean(
			record.canEditCompanyProfile ?? record.can_edit_company_profile,
		),
		canGenerateLeads: asBoolean(
			record.canGenerateLeads ?? record.can_generate_leads,
		),
		canManageSubscription: asBoolean(
			record.canManageSubscription ?? record.can_manage_subscription,
		),
		canManageTeam: asBoolean(record.canManageTeam ?? record.can_manage_team),
		canMoveCompanyTasks: asBoolean(
			record.canMoveCompanyTasks ?? record.can_move_company_tasks,
		),
		canStartCampaigns: asBoolean(
			record.canStartCampaigns ?? record.can_start_campaigns,
		),
		canViewReports: asBoolean(record.canViewReports ?? record.can_view_reports),
	};
}

export function mapPublicApiTeamMember(value: unknown): TeamMember | null {
	const record = asRecord(value);
	const id = asString(record.id ?? record.member_id ?? record.user_id);
	const email = asString(record.email);
	if (!id || !email) return null;

	const fullName = asString(record.name ?? record.full_name ?? record.fullName);
	const names = splitName(fullName);
	return {
		email,
		firstName:
			asString(record.firstName ?? record.first_name ?? record.given_name) ??
			names.firstName ??
			"",
		id,
		lastName:
			asString(record.lastName ?? record.last_name ?? record.family_name) ??
			names.lastName ??
			"",
		permissions: {
			...defaultPermissions,
			...normalizePermissions(record.permissions),
		},
		phone: asString(record.phone ?? record.phone_number ?? record.phoneNumber),
		role: normalizeRole(record.role),
	};
}

function extractArray(payload: unknown): unknown[] {
	if (Array.isArray(payload)) return payload;
	const record = asRecord(payload);
	for (const key of ["members", "team_members", "results", "items", "data"]) {
		const value = record[key];
		if (Array.isArray(value)) return value;
	}
	const nestedData = asRecord(record.data);
	for (const key of ["members", "team_members", "results", "items"]) {
		const value = nestedData[key];
		if (Array.isArray(value)) return value;
	}
	return [];
}

export function extractPublicApiTeamMembers(payload: unknown): TeamMember[] {
	return extractArray(payload).flatMap((item) => {
		const mapped = mapPublicApiTeamMember(item);
		return mapped ? [mapped] : [];
	});
}
