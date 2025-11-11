import type { SubscriptionTier } from "@/constants/subscription/tiers";
import type {
	PermissionMatrix,
	User,
	UserQuotas,
	UserRole,
} from "@/types/user";

export interface ImpersonationIdentity {
	id: string;
	name?: string | null;
	email?: string | null;
}

export interface ImpersonationSessionUserSnapshot {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	tier: SubscriptionTier;
	permissions: string[];
	permissionMatrix: PermissionMatrix;
	permissionList: string[];
	quotas: UserQuotas;
	subscription: User["subscription"];
	isBetaTester?: boolean;
	isPilotTester?: boolean;
}

export interface ImpersonationSessionPayload {
	impersonator: ImpersonationIdentity;
	impersonatedUser: ImpersonationIdentity;
	impersonatedUserData: ImpersonationSessionUserSnapshot;
	impersonatorUserData: ImpersonationSessionUserSnapshot;
}
