import type { User } from "@/types/user";

export interface ImpersonationIdentity {
	id: string;
	name?: string | null;
	email?: string | null;
}

export interface ImpersonationSessionPayload {
	impersonator: ImpersonationIdentity;
	impersonatedUser: ImpersonationIdentity;
	impersonatedUserData?: User; // Full user data for the impersonated user
}
