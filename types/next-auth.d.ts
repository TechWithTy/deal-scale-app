import type { DefaultSession } from "next-auth";
import type { JWT as NextAuthJWT } from "next-auth/jwt";
import type {
	PermissionMatrix,
	UserQuotas,
	UserRole,
	UserTier,
} from "@/types/user";

declare module "next-auth" {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user: {
			role?: UserRole;
			tier?: UserTier;
			permissions?: string[];
			permissionMatrix?: PermissionMatrix;
			permissionList?: string[];
			quotas?: UserQuotas;
			isBetaTester?: boolean;
			isPilotTester?: boolean;
		} & DefaultSession["user"];
	}

	interface User {
		role?: UserRole;
		tier?: UserTier;
		permissions?: string[];
		permissionMatrix?: PermissionMatrix;
		permissionList?: string[];
		quotas?: UserQuotas;
		isBetaTester?: boolean;
		isPilotTester?: boolean;
	}
}

declare module "next-auth/jwt" {
	/** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
	interface JWT extends NextAuthJWT {
		role?: UserRole;
		tier?: UserTier;
		permissions?: string[];
		permissionMatrix?: PermissionMatrix;
		permissionList?: string[];
		quotas?: UserQuotas;
		isBetaTester?: boolean;
		isPilotTester?: boolean;
	}
}
