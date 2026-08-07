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
	role?: UserRole;
	tier?: SubscriptionTier;
	permissions?: string[];
	permissionMatrix?: PermissionMatrix;
	permissionList?: string[];
	quotas?: UserQuotas;
	subscription?: User["subscription"];
	isBetaTester?: boolean;
	isPilotTester?: boolean;
	isFreeTier?: boolean;
	demoConfig?: User["demoConfig"];
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
	isFreeTier?: boolean;
}

export interface ImpersonationPublicApiTokens {
	accessToken: string;
	expiresAt?: number;
	refreshToken?: string;
	sessionId?: string;
	tokenType?: string;
}

export interface ImpersonationRestoreState {
	publicApi: ImpersonationPublicApiTokens;
	user: ImpersonationSessionUserSnapshot;
}

export interface ImpersonationSessionPayload {
	impersonator: ImpersonationIdentity;
	impersonatedUser: ImpersonationIdentity;
	impersonatedUserData: ImpersonationSessionUserSnapshot;
	impersonatorUserData: ImpersonationSessionUserSnapshot;
	publicApi?: ImpersonationPublicApiTokens;
	sessionId?: string;
}
