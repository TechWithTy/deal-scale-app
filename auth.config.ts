import type { NextAuthConfig } from "next-auth";
import type { User as NextAuthUser } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
import type { ImpersonationIdentity } from "@/types/impersonation";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail } from "@/lib/mock-db";
import { isAdminAreaAuthorized } from "@/lib/admin/roles";
import {
	ensureValidTier,
	type SubscriptionTier,
} from "@/constants/subscription/tiers";
import {
	deriveQuickStartDefaults,
	mergeQuotaOverrides,
	normalizeTesterFlags,
	resolveDemoLogoUrl,
} from "@/lib/demo/normalizeDemoPayload";
import type {
	PermissionAction,
	PermissionMatrix,
	PermissionResource,
	User,
	UserQuotas,
	UserRole,
} from "@/types/user";
import type { ImpersonationSessionPayload } from "@/types/impersonation";

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

type ExtendedJWT = JWT & {
        role?: UserRole;
        tier?: SubscriptionTier;
        permissions?: string[];
        permissionMatrix?: PermissionMatrix;
        permissionList?: string[];
        quotas?: UserQuotas;
        subscription?: UserProfileSubscription;
        isBetaTester?: boolean;
        isPilotTester?: boolean;
        isFreeTier?: boolean;
        demoConfig?: DemoConfig;
		quickStartDefaults?: {
                personaId?: "investor" | "wholesaler" | "loan_officer" | "agent";
                goalId?: string;
        };
        impersonator?: ImpersonationIdentity | null;
};

type ExtendedUserLike = {
        id?: string;
        role?: string;
        tier?: SubscriptionTier;
        permissions?: string[];
        permissionMatrix?: PermissionMatrix;
        permissionList?: string[];
        quotas?: UserQuotas;
        subscription?: UserProfileSubscription;
        isBetaTester?: boolean;
        isPilotTester?: boolean;
        isFreeTier?: boolean;
        demoConfig?: DemoConfig;
		quickStartDefaults?: {
                personaId?: "investor" | "wholesaler" | "loan_officer" | "agent";
                goalId?: string;
        };
        name?: string | null;
        email?: string | null;
};

type SessionUserLike = {
        id?: string;
        role?: UserRole;
        tier?: SubscriptionTier;
        permissions?: string[];
        permissionMatrix?: PermissionMatrix;
        permissionList?: string[];
        quotas?: UserQuotas;
        subscription?: UserProfileSubscription;
        isBetaTester?: boolean;
        isPilotTester?: boolean;
        isFreeTier?: boolean;
        demoConfig?: DemoConfig;
		quickStartDefaults?: {
                personaId?: "investor" | "wholesaler" | "loan_officer" | "agent";
                goalId?: string;
        };
        name?: string | null;
        email?: string | null;
};

function applyExtendedUserToToken(
        token: ExtendedJWT,
        userData: ExtendedUserLike,
): void {
        if (userData.name) {
                token.name = userData.name;
        }
        if (userData.email) {
                token.email = userData.email;
        }
        token.role = userData.role as UserRole | undefined;
        token.tier = userData.tier;
        token.permissions = userData.permissions;
        token.permissionMatrix = userData.permissionMatrix;
        token.permissionList = userData.permissionList ?? userData.permissions;
        token.quotas = userData.quotas;
        token.subscription = userData.subscription;
        token.isBetaTester = userData.isBetaTester;
        token.isPilotTester = userData.isPilotTester;
        token.isFreeTier = userData.isFreeTier;
        token.demoConfig = userData.demoConfig;
	token.quickStartDefaults = userData.quickStartDefaults;
        if (userData.id) {
                token.sub = userData.id;
        }
}

function applyTokenToSessionUser(
        sessionUser: SessionUserLike & Record<string, unknown>,
        token: ExtendedJWT,
): void {
        if (typeof token.name === "string") {
                sessionUser.name = token.name;
        }
        if (typeof token.email === "string") {
                sessionUser.email = token.email;
        }
        sessionUser.role = token.role as UserRole | undefined;
        sessionUser.tier = token.tier as SubscriptionTier | undefined;
        sessionUser.permissions = token.permissions as string[] | undefined;
        sessionUser.permissionMatrix = token.permissionMatrix;
        sessionUser.permissionList = token.permissionList ?? token.permissions;
        sessionUser.quotas = token.quotas;
        sessionUser.subscription = token.subscription;
        sessionUser.isBetaTester = token.isBetaTester;
        sessionUser.isPilotTester = token.isPilotTester;
        sessionUser.isFreeTier = token.isFreeTier;
        sessionUser.demoConfig = token.demoConfig;
	sessionUser.quickStartDefaults = token.quickStartDefaults;
        if (typeof token.sub === "string" && token.sub) {
                sessionUser.id = token.sub;
        }
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
				isFreeTier: {
					label: "Free Tier",
					type: "text",
					required: false,
				},
                        },
			async authorize(credentials) {
				const email = credentials?.email as string | undefined;
				const password = credentials?.password as string | undefined;

				if (!email || !password) return null;

				// Check if this is a custom demo user
				const isCustomUser = credentials?.isCustomUser === "true";
				let user: User | undefined;

				if (isCustomUser && credentials?.customUserData) {
					try {
						const customData = JSON.parse(credentials.customUserData as string);
						// Build a User object from custom data
						user = {
							id: customData.id,
							name: customData.name,
							email: customData.email,
							password: customData.password,
							role: customData.role,
							tier: customData.tier,
							permissions: customData.permissions,
							permissionList: customData.permissionList,
							quotas: {
								ai: customData.aiCredits,
								leads: customData.leadsCredits,
								skipTraces: customData.skipTracesCredits,
							},
							subscription: {
								aiCredits: customData.aiCredits,
								leads: customData.leadsCredits,
								skipTraces: customData.skipTracesCredits,
							},
							isBetaTester: customData.isBetaTester,
							isPilotTester: customData.isPilotTester,
							isFreeTier: customData.isFreeTier,
							demoConfig: customData.demoConfig,
						};
					} catch (error) {
						console.error("Failed to parse custom user data:", error);
						return null;
					}
				} else {
					user = getUserByEmail(email);
				}

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
                                const freeTierOverride = bool(credentials?.isFreeTier);

		const quotaOverrides: Record<string, unknown> = {
			aiAllotted,
			aiUsed,
			leadsAllotted,
			leadsUsed,
			skipAllotted,
			skipUsed,
		};

		const customPayloadRaw = credentials?.customUserData as string | undefined;
		let customPayload: Partial<User> | null = null;
		if (customPayloadRaw) {
			try {
				customPayload = JSON.parse(customPayloadRaw) as Partial<User>;
			} catch (_error) {
				customPayload = null;
			}
		}

		if (customPayload?.quotas) {
			quotaOverrides.aiAllotted =
				customPayload.quotas.ai?.allotted ?? quotaOverrides.aiAllotted;
			quotaOverrides.aiUsed =
				customPayload.quotas.ai?.used ?? quotaOverrides.aiUsed;
			quotaOverrides.leadsAllotted =
				customPayload.quotas.leads?.allotted ?? quotaOverrides.leadsAllotted;
			quotaOverrides.leadsUsed =
				customPayload.quotas.leads?.used ?? quotaOverrides.leadsUsed;
			quotaOverrides.skipAllotted =
				customPayload.quotas.skipTraces?.allotted ?? quotaOverrides.skipAllotted;
			quotaOverrides.skipUsed =
				customPayload.quotas.skipTraces?.used ?? quotaOverrides.skipUsed;
		}

		const updatedQuotas = mergeQuotaOverrides({
			base: user.quotas,
			overrides: quotaOverrides,
		});

				const mergedMatrix = mergeMatrix(user.permissions, permsOverrideMatrix);
				const permissionList = permsOverrideList ?? flattenMatrix(mergedMatrix);

				const role = VALID_ROLES.includes(roleOverride as UserRole)
					? (roleOverride as UserRole)
					: user.role;
		const tierCandidate = customPayload?.tier ?? tierOverride;
		const tier: SubscriptionTier = tierCandidate
			? ensureValidTier(tierCandidate)
			: user.tier;
		const sub = {
			...user.subscription,
			...(customPayload?.subscription ?? {}),
		};
		const normalizedSubscriptionName =
			typeof customPayload?.subscription?.name === "string" &&
			customPayload.subscription.name.trim().length > 0
				? customPayload.subscription.name
				: typeof sub.name === "string" && sub.name.trim().length > 0
					? sub.name
					: tier;
		const updatedSub = {
			...sub,
			name: normalizedSubscriptionName,
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
		const testerFlags = normalizeTesterFlags({
			isBetaTester: customPayload?.isBetaTester ?? betaOverride,
			isPilotTester: customPayload?.isPilotTester ?? pilotOverride,
			fallback: {
				isBetaTester: Boolean(user.isBetaTester),
				isPilotTester: Boolean(user.isPilotTester),
			},
		});
		const isFreeTier =
			customPayload?.isFreeTier ?? freeTierOverride ?? user.isFreeTier ?? false;

		const resolvedDemoConfig = customPayload?.demoConfig
			? {
				...user.demoConfig,
				...customPayload.demoConfig,
				companyLogo: resolveDemoLogoUrl({
					demoConfig: customPayload.demoConfig,
					fallback: user.demoConfig?.companyLogo,
				}),
			}
			: user.demoConfig;

		const derivedQuickStart = deriveQuickStartDefaults({
			demoConfig: resolvedDemoConfig,
			fallback:
				customPayload?.quickStartDefaults ?? user.quickStartDefaults ?? undefined,
		});

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
			isBetaTester: testerFlags.isBetaTester,
			isPilotTester: testerFlags.isPilotTester,
			isFreeTier,
			demoConfig: resolvedDemoConfig,
			quickStartDefaults: derivedQuickStart ?? undefined,
		} as NextAuthUser;
	},
                }),
	],
	callbacks: {
		/** Protect routes in middleware via NextAuth helper */
                authorized({ auth, request }) {
                        const isLoggedIn = Boolean(auth?.user);
                        const pathname = request.nextUrl.pathname;

                        if (pathname.startsWith("/admin")) {
                                if (!isLoggedIn) {
                                        const signInUrl = new URL("/signin", request.nextUrl);
                                        signInUrl.searchParams.set(
                                                "callbackUrl",
                                                request.nextUrl.href,
                                        );
                                        return Response.redirect(signInUrl);
                                }

                                if (!isAdminAreaAuthorized(auth?.user?.role)) {
                                        const dashboardUrl = new URL(
                                                "/dashboard",
                                                request.nextUrl,
                                        );
                                        return Response.redirect(dashboardUrl);
                                }

                                return true;
                        }

                        // Only allow authenticated users into /dashboard
                        if (pathname.startsWith("/dashboard")) {
                                if (isLoggedIn) return true;
                                const signInUrl = new URL("/signin", request.nextUrl);
                                signInUrl.searchParams.set("callbackUrl", request.nextUrl.href);
                                return Response.redirect(signInUrl);
                        }
			return true;
		},
		async jwt({ token, user, trigger, session }) {
			const extendedToken = token as ExtendedJWT;
			if (user) {
				const userData = user as ExtendedUserLike & { subscription?: UserProfileSubscription };
				applyExtendedUserToToken(extendedToken, userData);
				extendedToken.impersonator = null;
			}

			if (trigger === "update" && session) {
				const update = session as {
					user?: ExtendedUserLike;
					impersonation?: { 
						impersonator?: ImpersonationIdentity | null;
						impersonatedUser?: ImpersonationIdentity | null;
					};
				};
				if (update.user) {
					applyExtendedUserToToken(extendedToken, update.user);
				}
				if (Object.prototype.hasOwnProperty.call(update, "impersonation")) {
					// Update user data when impersonating
					if (update.impersonation?.impersonatedUser) {
						const impersonatedUser = update.impersonation.impersonatedUser;
						// Update token with impersonated user data
						extendedToken.role = impersonatedUser.role || extendedToken.role;
						extendedToken.tier = impersonatedUser.tier || extendedToken.tier;
						extendedToken.permissions = impersonatedUser.permissions || extendedToken.permissions;
						extendedToken.quotas = impersonatedUser.quotas || extendedToken.quotas;
						extendedToken.subscription = impersonatedUser.subscription || extendedToken.subscription;
						extendedToken.isBetaTester = impersonatedUser.isBetaTester ?? extendedToken.isBetaTester;
						extendedToken.isPilotTester = impersonatedUser.isPilotTester ?? extendedToken.isPilotTester;
						extendedToken.demoConfig = impersonatedUser.demoConfig || extendedToken.demoConfig;
						if (impersonatedUser.id) {
							extendedToken.sub = impersonatedUser.id;
						}
					}
					extendedToken.impersonator = update.impersonation?.impersonator ?? null;
				}
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				const extendedToken = token as ExtendedJWT;
				applyTokenToSessionUser(
					session.user as SessionUserLike & Record<string, unknown>,
					extendedToken,
				);
				session.impersonator = extendedToken.impersonator ?? null;
			}
			return session;
		},
	},
} satisfies NextAuthConfig;

export default authConfig;
