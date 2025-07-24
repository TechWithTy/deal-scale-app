import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const authConfig = {
	providers: [
		Credentials({
			async authorize(credentials) {
				if (credentials) {
					return { id: "1", name: "Mock User", email: "user@example.com" };
				}
				return null;
			},
		}),
	],
} satisfies NextAuthConfig;

export default authConfig;
