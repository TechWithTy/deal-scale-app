import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { getUserByEmail } from "./lib/mock-db";
import type { User } from "./types/user";

const authConfig = {
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_ID ?? "",
			clientSecret: process.env.GITHUB_SECRET ?? "",
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials || !credentials.email || !credentials.password) {
					return null;
				}
				console.log("Authorize credentials:", credentials);
				const user = getUserByEmail(credentials.email as string);
				console.log("User found:", user);

				if (user && user.password === credentials.password) {
					// * Note: We are returning the user object here, which will be available in the jwt callback.
					return {
						id: user.id,
						name: user.name,
						email: user.email,
						role: user.role,
						permissions: user.permissions,
					};
				}

				return null;
			},
		}),
	],
	pages: {
		signIn: "/", //signin page
	},
	callbacks: {
		async jwt({ token, user }) {
			// * Note: The user object is only available on the first sign-in.
			if (user) {
				const customUser = user as User;
				token.role = customUser.role;
				token.permissions = customUser.permissions;
			}
			return token;
		},
		async session({ session, token }) {
			// * Note: We are extending the session user object with the role and permissions from the token.
			if (session?.user) {
				session.user.role = token.role;
				session.user.permissions = token.permissions;
			}
			return session;
		},
	},
} satisfies NextAuthConfig;

export default authConfig;
