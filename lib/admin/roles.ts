import type { UserRole } from "@/types/user";

const ADMIN_ACCESS_ROLE_VALUES = [
	"admin",
	"support",
	"platform_admin",
	"platform_support",
] as const satisfies readonly UserRole[];

export type AdminAreaRole = (typeof ADMIN_ACCESS_ROLE_VALUES)[number];
export type PlatformAdminRole = Extract<UserRole, "platform_admin">;
export type PlatformSupportRole = Extract<UserRole, "platform_support">;
export type ClassicAdminRole = Extract<UserRole, "admin">;
export type ClassicSupportRole = Extract<UserRole, "support">;

const ADMIN_ACCESS_ROLE_SET = new Set<string>(ADMIN_ACCESS_ROLE_VALUES);

const ROLE_LABEL_KEYS = [
	"admin",
	"manager",
	"member",
	"support",
	"platform_admin",
	"platform_support",
	"user",
] as const;

type RoleLabelKey = (typeof ROLE_LABEL_KEYS)[number];

const ROLE_LABELS: Record<RoleLabelKey, string> = {
	admin: "Admin",
	manager: "Manager",
	member: "Member",
	support: "Support Agent",
	platform_admin: "Platform Admin",
	platform_support: "Platform Support",
	user: "User",
};

export function isPlatformAdminRole(role: unknown): role is PlatformAdminRole {
	return role === "platform_admin";
}

export function isPlatformSupportRole(
	role: unknown,
): role is PlatformSupportRole {
	return role === "platform_support";
}

export function isClassicAdminRole(role: unknown): role is ClassicAdminRole {
	return role === "admin";
}

export function isClassicSupportRole(
	role: unknown,
): role is ClassicSupportRole {
	return role === "support";
}

export function isAdminAreaAuthorized(
	role: string | null | undefined,
): role is AdminAreaRole {
	return typeof role === "string" && ADMIN_ACCESS_ROLE_SET.has(role);
}

export function formatAdminRole(role: string | null | undefined): string {
	if (!role) return "Unknown";
	return ROLE_LABELS[role as RoleLabelKey] ?? role;
}
