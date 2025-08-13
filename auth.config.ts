import type { NextAuthConfig } from "next-auth";
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
			},
			async authorize(credentials) {
				const email = credentials?.email as string | undefined;
				const password = credentials?.password as string | undefined;

				if (!email || !password) return null;

				const user = getUserByEmail(email);
				if (!user) return null;

				// Simple mock validation against in-memory users
				if (user.password !== password) return null;

				return {
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
					permissions: user.permissions,
				} as any;
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
				// Persist role/permissions on initial sign-in
				token.role = (user as any).role;
				token.permissions = (user as any).permissions;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.role = token.role as string | undefined;
				session.user.permissions = token.permissions as string[] | undefined;
			}
			return session;
		},
	},
} satisfies NextAuthConfig;

export default authConfig;
