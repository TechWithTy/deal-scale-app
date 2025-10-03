import type { NextAuthConfig } from "next-auth";
import type { User as NextAuthUser } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail } from "@/lib/mock-db";
import {
	ensureValidTier,
	type SubscriptionTier,
} from "@/constants/subscription/tiers";
import type {
	PermissionAction,
	PermissionMatrix,
	PermissionResource,
	User,
	UserQuotas,
	UserRole,
} from "@/types/user";

const VALID_ROLES: UserRole[] = [
        "admin",
        "manager",
        "member",
        "support",
        "platform_admin",
        "platform_support",
];

const PERMISSION_RESOURCES: PermissionResource[] = [
	"users",
	"leads",
	"campaigns",
	"reports",
	"team",
	"subscription",
	"ai",
	"tasks",
	"companyProfile",
];

const PERMISSION_ACTIONS: PermissionAction[] = [
	"create",
	"read",
	"update",
	"delete",
];

function toMatrixFromList(
	list: string[] | undefined,
): PermissionMatrix | undefined {
	if (!list || list.length === 0) return undefined;
	const matrix: PermissionMatrix = {};
	for (const entry of list) {
		const [resourceRaw, actionRaw] = entry.split(":");
		if (!resourceRaw || !actionRaw) continue;
		const resource = resourceRaw.trim() as PermissionResource;
		const action = actionRaw.trim() as PermissionAction;
		if (!PERMISSION_RESOURCES.includes(resource)) continue;
		if (!PERMISSION_ACTIONS.includes(action)) continue;
		const actions = matrix[resource] ?? [];
		if (!actions.includes(action)) {
			actions.push(action);
			matrix[resource] = actions;
		}
	}
	return matrix;
}

function toMatrixFromObject(value: unknown): PermissionMatrix | undefined {
	if (!value || typeof value !== "object") return undefined;
	const matrix: PermissionMatrix = {};
	for (const [resourceKey, actionsValue] of Object.entries(value)) {
		if (!PERMISSION_RESOURCES.includes(resourceKey as PermissionResource))
			continue;
		const arr = Array.isArray(actionsValue)
			? actionsValue
			: typeof actionsValue === "string"
				? [actionsValue]
				: [];
		const normalized = arr
			.map((action) => String(action).trim())
			.filter((action): action is PermissionAction =>
				PERMISSION_ACTIONS.includes(action as PermissionAction),
			);
		if (normalized.length) {
			matrix[resourceKey as PermissionResource] = Array.from(
				new Set(normalized),
			);
		}
	}
	return Object.keys(matrix).length ? matrix : undefined;
}

function flattenMatrix(matrix: PermissionMatrix): string[] {
	return Object.entries(matrix).flatMap(
		([resource, actions]) =>
			actions?.map((action) => `${resource}:${action}`) ?? [],
	);
}

function mergeMatrix(
	base: PermissionMatrix,
	override?: PermissionMatrix,
): PermissionMatrix {
	if (!override) return base;
	const result: PermissionMatrix = { ...base };
	for (const [resource, actions] of Object.entries(override)) {
		if (!actions || actions.length === 0) continue;
		const existing = new Set(result[resource as PermissionResource] ?? []);
		for (const action of actions) existing.add(action);
		result[resource as PermissionResource] = Array.from(existing);
	}
	return result;
}

function normalizeQuotas(
	base: UserQuotas,
	overrides: {
		aiAllotted?: number;
		aiUsed?: number;
		leadsAllotted?: number;
		leadsUsed?: number;
		skipAllotted?: number;
		skipUsed?: number;
	},
): UserQuotas {
	const clamp = (used: number | undefined, allotted: number | undefined) => {
		if (allotted === undefined || used === undefined) return used;
		return Math.min(used, allotted);
	};
	const aiAllotted = overrides.aiAllotted ?? base.ai.allotted;
	const aiUsed = clamp(overrides.aiUsed, aiAllotted) ?? base.ai.used;
	const leadsAllotted = overrides.leadsAllotted ?? base.leads.allotted;
	const leadsUsed =
		clamp(overrides.leadsUsed, leadsAllotted) ?? base.leads.used;
	const skipAllotted = overrides.skipAllotted ?? base.skipTraces.allotted;
	const skipUsed =
		clamp(overrides.skipUsed, skipAllotted) ?? base.skipTraces.used;
	return {
		ai: { ...base.ai, allotted: aiAllotted, used: aiUsed },
		leads: { ...base.leads, allotted: leadsAllotted, used: leadsUsed },
		skipTraces: { ...base.skipTraces, allotted: skipAllotted, used: skipUsed },
	};
}

const authConfig = {
	pages: {
		signIn: "/signin",
	},
	providers: [
		Credentials({
			// Optional: define fields for better DX on default sign-in page
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
				// Optional overrides from TestUsers UI
				role: { label: "Role", type: "text", required: false },
				tier: { label: "Tier", type: "text", required: false },
				permissions: {
					label: "Permissions JSON",
					type: "text",
					required: false,
				},
				aiAllotted: { label: "AI Allotted", type: "number", required: false },
				aiUsed: { label: "AI Used", type: "number", required: false },
				leadsAllotted: {
					label: "Leads Allotted",
					type: "number",
					required: false,
				},
				leadsUsed: { label: "Leads Used", type: "number", required: false },
                                skipAllotted: {
                                        label: "Skip Allotted",
                                        type: "number",
                                        required: false,
                                },
                                skipUsed: { label: "Skip Used", type: "number", required: false },
                                isBetaTester: {
                                        label: "Beta Tester",
                                        type: "text",
                                        required: false,
                                },
                                isPilotTester: {
                                        label: "Pilot Tester",
                                        type: "text",
                                        required: false,
                                },
                        },
                        async authorize(credentials) {
				const email = credentials?.email as string | undefined;
				const password = credentials?.password as string | undefined;

				if (!email || !password) return null;

				const user = getUserByEmail(email);
				if (!user) return null;

				// Simple mock validation against in-memory users
				if (user.password !== password) return null;

				// build a mutable copy
				const roleOverride = (credentials?.role as string | undefined)?.trim();
				const tierOverride = (credentials?.tier as string | undefined)?.trim();

				let permsOverrideMatrix: PermissionMatrix | undefined;
				let permsOverrideList: string[] | undefined;
				try {
					const raw = credentials?.permissions as string | undefined;
					if (raw) {
						const parsed = JSON.parse(raw) as unknown;
						permsOverrideMatrix =
							toMatrixFromObject(parsed) ??
							toMatrixFromList(
								Array.isArray(parsed) ? (parsed as string[]) : undefined,
							);
						if (permsOverrideMatrix) {
							permsOverrideList = flattenMatrix(permsOverrideMatrix);
						}
					}
				} catch (_) {
					permsOverrideMatrix = undefined;
					permsOverrideList = undefined;
				}
                                const num = (v: unknown) => {
                                        const n = Number(v);
                                        return Number.isFinite(n) && n >= 0 ? n : undefined;
                                };
                                const bool = (value: unknown): boolean | undefined => {
                                        if (typeof value === "boolean") return value;
                                        if (typeof value === "number") {
                                                if (Number.isNaN(value)) return undefined;
                                                return value !== 0;
                                        }
                                        if (typeof value === "string") {
                                                const normalized = value.trim().toLowerCase();
                                                if (!normalized) return undefined;
                                                if (["true", "1", "yes", "on"].includes(normalized)) {
                                                        return true;
                                                }
                                                if (["false", "0", "no", "off"].includes(normalized)) {
                                                        return false;
                                                }
                                        }
                                        return undefined;
                                };
                                const aiAllotted = num(credentials?.aiAllotted);
                                const aiUsed = num(credentials?.aiUsed);
                                const leadsAllotted = num(credentials?.leadsAllotted);
                                const leadsUsed = num(credentials?.leadsUsed);
                                const skipAllotted = num(credentials?.skipAllotted);
                                const skipUsed = num(credentials?.skipUsed);
                                const betaOverride = bool(credentials?.isBetaTester);
                                const pilotOverride = bool(credentials?.isPilotTester);

				const overrides = {
					aiAllotted,
					aiUsed,
					leadsAllotted,
					leadsUsed,
					skipAllotted,
					skipUsed,
				};

				const updatedQuotas = normalizeQuotas(user.quotas, overrides);

				const sub = user.subscription;
				const updatedSub = {
					...sub,
					aiCredits: {
						...sub.aiCredits,
						allotted: updatedQuotas.ai.allotted,
						used: updatedQuotas.ai.used,
					},
					leads: {
						...sub.leads,
						allotted: updatedQuotas.leads.allotted,
						used: updatedQuotas.leads.used,
					},
					skipTraces: {
						...sub.skipTraces,
						allotted: updatedQuotas.skipTraces.allotted,
						used: updatedQuotas.skipTraces.used,
					},
				};

				const mergedMatrix = mergeMatrix(user.permissions, permsOverrideMatrix);
				const permissionList = permsOverrideList ?? flattenMatrix(mergedMatrix);

				const role = VALID_ROLES.includes(roleOverride as UserRole)
					? (roleOverride as UserRole)
					: user.role;
                                const tier: SubscriptionTier = tierOverride
                                        ? ensureValidTier(tierOverride)
                                        : user.tier;
                                const isBetaTester = betaOverride ?? Boolean(user.isBetaTester);
                                const isPilotTester = pilotOverride ?? Boolean(user.isPilotTester);

                                return {
                                        id: user.id,
                                        name: user.name,
                                        email: user.email,
                                        role,
                                        tier,
                                        permissions: permissionList,
                                        permissionMatrix: mergedMatrix,
                                        permissionList,
                                        quotas: updatedQuotas,
                                        subscription: updatedSub,
                                        isBetaTester,
                                        isPilotTester,
                                } as NextAuthUser;
                        },
                }),
	],
	callbacks: {
		/** Protect routes in middleware via NextAuth helper */
		authorized({ auth, request }) {
			const isLoggedIn = Boolean(auth?.user);
			// Only allow authenticated users into /dashboard
			if (request.nextUrl.pathname.startsWith("/dashboard")) {
				if (isLoggedIn) return true;
				const signInUrl = new URL("/signin", request.nextUrl);
				signInUrl.searchParams.set("callbackUrl", request.nextUrl.href);
				return Response.redirect(signInUrl);
			}
			return true;
		},
		async jwt({ token, user }) {
			if (user) {
				// Persist role/permissions/subscription on initial sign-in
                                const u = user as {
                                        role?: string;
                                        tier?: SubscriptionTier;
                                        permissions?: string[];
                                        permissionMatrix?: PermissionMatrix;
                                        permissionList?: string[];
                                        quotas?: UserQuotas;
                                        subscription?: UserProfileSubscription;
                                        isBetaTester?: boolean;
                                        isPilotTester?: boolean;
                                };
                                (
                                        token as JWT & {
                                                role?: UserRole;
                                                tier?: SubscriptionTier;
                                                permissions?: string[];
                                                permissionMatrix?: PermissionMatrix;
                                                permissionList?: string[];
                                                quotas?: UserQuotas;
                                                subscription?: UserProfileSubscription;
                                        }
                                ).role = u.role as UserRole | undefined;
				(
					token as JWT & {
						role?: string;
						tier?: SubscriptionTier;
						permissions?: string[];
						permissionMatrix?: PermissionMatrix;
						permissionList?: string[];
						quotas?: UserQuotas;
						subscription?: UserProfileSubscription;
					}
				).tier = u.tier;
				(
					token as JWT & {
						role?: string;
						tier?: SubscriptionTier;
						permissions?: string[];
						permissionMatrix?: PermissionMatrix;
						permissionList?: string[];
						quotas?: UserQuotas;
						subscription?: UserProfileSubscription;
					}
				).permissions = u.permissions;
				(
					token as JWT & {
						role?: string;
						tier?: SubscriptionTier;
						permissions?: string[];
						permissionMatrix?: PermissionMatrix;
						permissionList?: string[];
						quotas?: UserQuotas;
						subscription?: UserProfileSubscription;
					}
				).permissionMatrix = u.permissionMatrix;
				(
					token as JWT & {
						role?: string;
						tier?: SubscriptionTier;
						permissions?: string[];
						permissionMatrix?: PermissionMatrix;
						permissionList?: string[];
						quotas?: UserQuotas;
						subscription?: UserProfileSubscription;
					}
				).permissionList = u.permissionList ?? u.permissions;
				(
					token as JWT & {
						role?: string;
						tier?: SubscriptionTier;
						permissions?: string[];
						permissionMatrix?: PermissionMatrix;
						permissionList?: string[];
						quotas?: UserQuotas;
						subscription?: UserProfileSubscription;
					}
				).quotas = u.quotas;
                                (
                                        token as JWT & {
                                                role?: string;
                                                tier?: SubscriptionTier;
                                                permissions?: string[];
                                                permissionMatrix?: PermissionMatrix;
                                                permissionList?: string[];
                                                quotas?: UserQuotas;
                                                subscription?: UserProfileSubscription;
                                        }
                                ).subscription = u.subscription;
                                (
                                        token as JWT & {
                                                isBetaTester?: boolean;
                                                isPilotTester?: boolean;
                                        }
                                ).isBetaTester = u.isBetaTester;
                                (
                                        token as JWT & {
                                                isBetaTester?: boolean;
                                                isPilotTester?: boolean;
                                        }
                                ).isPilotTester = u.isPilotTester;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
                                const t = token as JWT & {
                                        role?: string;
                                        tier?: SubscriptionTier;
                                        permissions?: string[];
                                        permissionMatrix?: PermissionMatrix;
                                        permissionList?: string[];
                                        quotas?: UserQuotas;
                                        subscription?: UserProfileSubscription;
                                        isBetaTester?: boolean;
                                        isPilotTester?: boolean;
                                };
				session.user.role = t.role as UserRole | undefined;
				session.user.tier = t.tier as SubscriptionTier | undefined;
				session.user.permissions = t.permissions as string[] | undefined;
				(
					session.user as {
						permissionMatrix?: PermissionMatrix;
						permissionList?: string[];
						quotas?: UserQuotas;
					}
				).permissionMatrix = t.permissionMatrix;
				(
					session.user as {
						permissionMatrix?: PermissionMatrix;
						permissionList?: string[];
						quotas?: UserQuotas;
					}
				).permissionList = t.permissionList ?? t.permissions;
				(
					session.user as {
						permissionMatrix?: PermissionMatrix;
						permissionList?: string[];
						quotas?: UserQuotas;
					}
				).quotas = t.quotas;
                                // Expose subscription to the client session for dashboard credits
                                (
                                        session.user as { subscription?: UserProfileSubscription }
                                ).subscription = t.subscription;
                                (
                                        session.user as { isBetaTester?: boolean }
                                ).isBetaTester = t.isBetaTester;
                                (
                                        session.user as { isPilotTester?: boolean }
                                ).isPilotTester = t.isPilotTester;
			}
			return session;
		},
	},
} satisfies NextAuthConfig;

export default authConfig;
