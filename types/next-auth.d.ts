import type { ImpersonationIdentity } from "@/types/impersonation";
import type {
	DemoConfig,
	PermissionMatrix,
	UserQuotas,
	UserRole,
	UserTier,
} from "@/types/user";
import type { DefaultSession } from "next-auth";
import type { JWT as NextAuthJWT } from "next-auth/jwt";

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
			quickStartDefaults?: {
				personaId?: "investor" | "wholesaler" | "lender" | "agent";
				goalId?: string;
			};
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
		quickStartDefaults?: {
			personaId?: "investor" | "wholesaler" | "lender" | "agent";
			goalId?: string;
		};
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
		quickStartDefaults?: {
			personaId?: "investor" | "wholesaler" | "lender" | "agent";
			goalId?: string;
		};
	}
}
