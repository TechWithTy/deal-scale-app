import type { DefaultSession } from "next-auth";
import type { JWT as NextAuthJWT } from "next-auth/jwt";
import type {
	DemoConfig,
	PermissionMatrix,
	UserQuotas,
	UserRole,
	UserTier,
} from "@/types/user";
import type { ImpersonationIdentity } from "@/types/impersonation";

declare module "next-auth" {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		impersonator?: ImpersonationIdentity | null;
		user: {
			id?: string;
			role?: UserRole;
			tier?: UserTier;
			permissions?: string[];
			permissionMatrix?: PermissionMatrix;
			permissionList?: string[];
			quotas?: UserQuotas;
			isBetaTester?: boolean;
			isPilotTester?: boolean;
			demoConfig?: DemoConfig;
		} & DefaultSession["user"];
	}

	interface User {
		id?: string;
		role?: UserRole;
		tier?: UserTier;
		permissions?: string[];
		permissionMatrix?: PermissionMatrix;
		permissionList?: string[];
		quotas?: UserQuotas;
		isBetaTester?: boolean;
		isPilotTester?: boolean;
		demoConfig?: DemoConfig;
	}
}

declare module "next-auth/jwt" {
	/** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
	interface JWT extends NextAuthJWT {
		impersonator?: ImpersonationIdentity | null;
		role?: UserRole;
		tier?: UserTier;
		permissions?: string[];
		permissionMatrix?: PermissionMatrix;
		permissionList?: string[];
		quotas?: UserQuotas;
		isBetaTester?: boolean;
		isPilotTester?: boolean;
		demoConfig?: DemoConfig;
	}
}
