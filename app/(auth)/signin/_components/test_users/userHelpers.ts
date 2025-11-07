"use client";

import {
	formatAdminRole,
	isClassicAdminRole,
	isClassicSupportRole,
	isPlatformAdminRole,
	isPlatformSupportRole,
} from "@/lib/admin/roles";
import type {
	PermissionMatrix,
	UserRole,
	User as UserType,
} from "@/types/user";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

// Extend the User type to ensure password is required for test users
export type TestUser = Omit<UserType, "password"> & {
	password: string; // Make password required for test users
};

export type Credits = { allotted: number; used: number; resetInDays: number };

export type EditableUser = TestUser & {
	aiCredits: Credits;
	leadsCredits: Credits;
	skipTracesCredits: Credits;
	newPermission?: string;
};

const CLASSIC_ADMIN_LABEL = "Classic";

const ADMIN_PERMISSION_PRESET = [
	"users:create",
	"users:read",
	"users:update",
	"users:delete",
];

const SUPPORT_PERMISSION_PRESET = ["users:read", "users:update"];

const MEMBER_PERMISSION_PRESET = ["users:read"];

const MANAGER_PERMISSION_PRESET = ["users:read", "users:update"];

const ROLE_PERMISSION_PRESETS: Record<UserRole, readonly string[]> = {
	admin: ADMIN_PERMISSION_PRESET,
	manager: MANAGER_PERMISSION_PRESET,
	member: MEMBER_PERMISSION_PRESET,
	support: SUPPORT_PERMISSION_PRESET,
	platform_admin: ADMIN_PERMISSION_PRESET,
	platform_support: SUPPORT_PERMISSION_PRESET,
};

export type RoleSelectOption = { value: UserRole; label: string };

const TEST_USER_ROLE_ORDER: UserRole[] = [
	"platform_admin",
	"platform_support",
	"admin",
	"support",
	"member",
];

const normalizeBaseRoleLabel = (role: UserRole): string => {
	const label = formatAdminRole(role);
	return label === "Support Agent" ? "Support" : label;
};

const getRoleTypePrefix = (role: UserRole): string | null => {
	if (isClassicAdminRole(role) || isClassicSupportRole(role)) {
		return CLASSIC_ADMIN_LABEL;
	}

	return null;
};

const isAdminLikeRole = (role: UserType["role"]): boolean =>
	isClassicAdminRole(role) || isPlatformAdminRole(role);

const buildPermissionMatrix = (
	permissions: readonly string[],
): PermissionMatrix => {
	return permissions.reduce<PermissionMatrix>((acc, entry) => {
		const [resource, action] = entry.split(":");

		if (!resource || !action) {
			return acc;
		}

		const currentActions = acc[resource as keyof PermissionMatrix] ?? [];
		return {
			...acc,
			[resource]: currentActions.includes(action)
				? currentActions
				: [...currentActions, action],
		} as PermissionMatrix;
	}, {} as PermissionMatrix);
};

export const getPermissionPresetForRole = (
	role: UserRole,
): readonly string[] => {
	return ROLE_PERMISSION_PRESETS[role] ?? ROLE_PERMISSION_PRESETS.member;
};

export const getPermissionsForRole = (role: UserRole) => {
	const preset = getPermissionPresetForRole(role);

	return {
		list: [...preset],
		matrix: buildPermissionMatrix(preset),
	};
};

export const getRoleLabelForTestUser = (role: UserRole): string => {
	const baseLabel = normalizeBaseRoleLabel(role);

	if (isPlatformAdminRole(role) || isPlatformSupportRole(role)) {
		return baseLabel;
	}

	const prefix = getRoleTypePrefix(role);

	if (!prefix) {
		return baseLabel;
	}

	return `${prefix} ${baseLabel}`;
};

export const ROLE_SELECT_OPTIONS: RoleSelectOption[] = TEST_USER_ROLE_ORDER.map(
	(role) => ({
		value: role,
		label: getRoleLabelForTestUser(role),
	}),
);

export const handleLogin = async (user: EditableUser) => {
	try {
		// Check if this is a custom user (starts with "custom-")
		const isCustomUser = user.id.startsWith("custom-");

		await signIn("credentials", {
			email: user.email,
			password: user.password,
			// propagate current UI selections into credentials for authorize()
			role: user.role,
			tier: user.tier,
			permissions: JSON.stringify(user.permissions),
			aiAllotted: String(user.aiCredits.allotted),
			aiUsed: String(user.aiCredits.used),
			leadsAllotted: String(user.leadsCredits.allotted),
			leadsUsed: String(user.leadsCredits.used),
			skipAllotted: String(user.skipTracesCredits.allotted),
			skipUsed: String(user.skipTracesCredits.used),
			isBetaTester: String(Boolean(user.isBetaTester)),
			isPilotTester: String(Boolean(user.isPilotTester)),
			// Pass custom user data if applicable
			isCustomUser: String(isCustomUser),
			customUserData: isCustomUser ? JSON.stringify(user) : undefined,
			callbackUrl: "/dashboard",
			redirect: true,
		});
	} catch (error) {
		toast.error("An error occurred during login");
		console.error("Login error:", error);
	}
};

// Quick add common permissions via chips
export const COMMON_PERMISSIONS = [
	"users:create",
	"users:read",
	"users:update",
	"users:delete",
] as const;

export const initializeEditableUsers = (testUsers: TestUser[]) =>
	testUsers.map((u) => {
		const permissions = getPermissionsForRole(u.role);
		const permissionList = u.permissionList?.length
			? [...u.permissionList]
			: permissions.list;
		const permissionMatrix =
			u.permissions && Object.keys(u.permissions).length > 0
				? Object.fromEntries(
						Object.entries(u.permissions).map(([resource, actions]) => [
							resource,
							Array.isArray(actions) ? [...actions] : [],
						]),
					)
				: permissions.matrix;

		return {
			...u,
			isBetaTester: Boolean(u.isBetaTester),
			isPilotTester: Boolean(u.isPilotTester),
			aiCredits:
				// Prefer subscription credits if available (UserType includes subscription)
				u.subscription?.aiCredits ??
				(isAdminLikeRole(u.role)
					? { allotted: 1000, used: 250, resetInDays: 7 }
					: { allotted: 500, used: 100, resetInDays: 7 }),
			leadsCredits:
				u.subscription?.leads ??
				(isAdminLikeRole(u.role)
					? { allotted: 500, used: 120, resetInDays: 30 }
					: { allotted: 100, used: 20, resetInDays: 30 }),
			skipTracesCredits:
				u.subscription?.skipTraces ??
				(isAdminLikeRole(u.role)
					? { allotted: 200, used: 50, resetInDays: 30 }
					: { allotted: 50, used: 10, resetInDays: 30 }),
			permissionList,
			permissions: permissionMatrix,
		};
	});
