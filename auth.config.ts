import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail } from "@/lib/mock-db";

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
				let permsOverride: string[] | undefined;
				try {
					const raw = credentials?.permissions as string | undefined;
					permsOverride = raw ? (JSON.parse(raw) as string[]) : undefined;
				} catch (_) {
					permsOverride = undefined;
				}
				const num = (v: unknown) => {
					const n = Number(v);
					return Number.isFinite(n) && n >= 0 ? n : undefined;
				};
				const aiAllotted = num(credentials?.aiAllotted);
				let aiUsed = num(credentials?.aiUsed);
				const leadsAllotted = num(credentials?.leadsAllotted);
				let leadsUsed = num(credentials?.leadsUsed);
				const skipAllotted = num(credentials?.skipAllotted);
				let skipUsed = num(credentials?.skipUsed);

				// clamp used to allotted when both exist
				if (
					aiAllotted !== undefined &&
					aiUsed !== undefined &&
					aiUsed > aiAllotted
				)
					aiUsed = aiAllotted;
				if (
					leadsAllotted !== undefined &&
					leadsUsed !== undefined &&
					leadsUsed > leadsAllotted
				)
					leadsUsed = leadsAllotted;
				if (
					skipAllotted !== undefined &&
					skipUsed !== undefined &&
					skipUsed > skipAllotted
				)
					skipUsed = skipAllotted;

				const sub = user.subscription;
				const updatedSub = {
					...sub,
					aiCredits: {
						...sub.aiCredits,
						allotted: aiAllotted ?? sub.aiCredits.allotted,
						used: aiUsed ?? sub.aiCredits.used,
					},
					leads: {
						...sub.leads,
						allotted: leadsAllotted ?? sub.leads.allotted,
						used: leadsUsed ?? sub.leads.used,
					},
					skipTraces: {
						...sub.skipTraces,
						allotted: skipAllotted ?? sub.skipTraces.allotted,
						used: skipUsed ?? sub.skipTraces.used,
					},
				};

				return {
					id: user.id,
					name: user.name,
					email: user.email,
					role:
						roleOverride &&
						(roleOverride === "admin" || roleOverride === "user")
							? roleOverride
							: user.role,
					permissions:
						permsOverride && Array.isArray(permsOverride)
							? permsOverride
							: user.permissions,
					subscription: updatedSub,
				} as unknown as {
					id: string;
					name: string;
					email: string;
					role: string;
					permissions: string[];
					subscription: UserProfileSubscription;
				};
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
					permissions?: string[];
					subscription?: UserProfileSubscription;
				};
				(
					token as JWT & {
						role?: string;
						permissions?: string[];
						subscription?: UserProfileSubscription;
					}
				).role = u.role;
				(
					token as JWT & {
						role?: string;
						permissions?: string[];
						subscription?: UserProfileSubscription;
					}
				).permissions = u.permissions;
				(
					token as JWT & {
						role?: string;
						permissions?: string[];
						subscription?: UserProfileSubscription;
					}
				).subscription = u.subscription;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				const t = token as JWT & {
					role?: string;
					permissions?: string[];
					subscription?: UserProfileSubscription;
				};
				session.user.role = t.role as string | undefined;
				session.user.permissions = t.permissions as string[] | undefined;
				// Expose subscription to the client session for dashboard credits
				(
					session.user as { subscription?: UserProfileSubscription }
				).subscription = t.subscription;
			}
			return session;
		},
	},
} satisfies NextAuthConfig;

export default authConfig;
