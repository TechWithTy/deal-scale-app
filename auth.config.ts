import type { NextAuthConfig } from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";

const authConfig = {
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_ID ?? "",
			clientSecret: process.env.GITHUB_SECRET ?? "",
		}),
		CredentialProvider({
			credentials: {
				email: {
					type: "email",
				},
				password: {
					type: "password",
				},
			},
			async authorize(credentials, req) {
				const user = {
					id: "1",
					name: "John",
					email: credentials?.email as string,
				};
				if (user) {
					// Any object returned will be saved in `user` property of the JWT
					return user;
				}
				// If you return null then an error will be displayed advising the user to check their details.
				return null;
			},
		}),
	],
	pages: {
		signIn: "/", //sigin page
	},
} satisfies NextAuthConfig;

export default authConfig;
