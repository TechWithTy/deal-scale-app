export interface ImpersonationIdentity {
	id: string;
	name?: string | null;
	email?: string | null;
}

export interface ImpersonationSessionPayload {
	impersonator: ImpersonationIdentity;
	impersonatedUser: ImpersonationIdentity;
}
