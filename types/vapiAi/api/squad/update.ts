// types/vapiAi/api/squad/update.ts

export interface UpdateSquadRequest {
	name?: string; // Optional, the name of the squad
	members?: {
		assistantId: string;
		assistant: Record<string, string>; // Assistant details
		assistantOverrides?: Record<string, string>; // Optional overrides for this assistant
	}[];
	membersOverrides?: Partial<{
		assistant: Record<string, string>;
		voice: Record<string, string>;
	}>;
}

// Response type for updating a squad (usually just reflects the updated squad)
export interface UpdateSquadResponse {
	id: string;
	name: string;
	members: {
		assistantId: string;
		assistant: Record<string, string>;
		assistantOverrides?: Record<string, string>;
	}[];
	membersOverrides?: Partial<Record<string, string>>;
	orgId: string;
	createdAt: string; // ISO 8601 date-time string
	updatedAt: string; // ISO 8601 date-time string
}
