import type { DefaultSession } from "next-auth";
import type { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user: {
			/** The user's role. */
			role?: string;
			/** The user's permissions. */
			permissions?: string[];
		} & DefaultSession["user"];
	}

	interface User {
		role?: string;
	}
}

declare module "next-auth/jwt" {
	/** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
	interface JWT extends NextAuthJWT {
		/** The user's role. */
		role?: string;
		/** The user's permissions. */
		permissions?: string[];
	}
}
