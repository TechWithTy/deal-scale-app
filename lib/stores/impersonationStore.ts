import { create } from "zustand";
import { z } from "zod";
import type { Session } from "next-auth";
import type {
	ImpersonationIdentity,
	ImpersonationSessionPayload,
} from "@/types/impersonation";
import type { User } from "@/types/user";
import {
	startImpersonationSession,
	stopImpersonationSession,
} from "@/lib/admin/impersonation-service";
import { withAnalytics } from "./_middleware/analytics";
import { useUserStore } from "./userStore";

// Helper function to trigger NextAuth session update
async function triggerSessionUpdate(update: {
	impersonation?: {
		impersonator?: ImpersonationIdentity | null;
		impersonatedUser?: ImpersonationIdentity | null;
	};
	user?: Record<string, unknown>;
}) {
	if (typeof window !== "undefined") {
		// Trigger NextAuth session update
		await fetch("/api/auth/session", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(update),
		});
	}
}

interface ImpersonationState {
	isImpersonating: boolean;
	impersonatedUser: ImpersonationIdentity | null;
	impersonator: ImpersonationIdentity | null;
	originalCredits: {
		ai: { used: number; allotted: number };
		leads: { used: number; allotted: number };
		skipTraces: { used: number; allotted: number };
	} | null;
	hydrateFromSession: (session: Session | null) => void;
	startImpersonation: (params: {
		userId: string;
	}) => Promise<ImpersonationSessionPayload>;
	stopImpersonation: () => Promise<void>;
	reset: () => void;
}

const identitySchema = z.object({
	id: z.string().min(1, "Missing user identifier"),
	name: z.string().nullish(),
	email: z.string().email().nullish(),
});

const impersonationResponseSchema = z.object({
	impersonatedUser: identitySchema,
	impersonator: identitySchema,
	impersonatedUserData: z.custom<User>().optional(), // Full user data
});

const createInitialState = (): Pick<
	ImpersonationState,
	"isImpersonating" | "impersonatedUser" | "impersonator" | "originalCredits"
> => ({
	isImpersonating: false,
	impersonatedUser: null,
	impersonator: null,
	originalCredits: null,
});

function normalizeIdentity(
	value: Partial<ImpersonationIdentity> | null | undefined,
): ImpersonationIdentity | null {
	if (!value) return null;
	const fallbackId = value.id ?? value.email ?? null;
	if (!fallbackId) return null;
	return {
		id: fallbackId,
		name: value.name ?? null,
		email: value.email ?? null,
	} satisfies ImpersonationIdentity;
}

export const useImpersonationStore = create<ImpersonationState>(
	withAnalytics<ImpersonationState>("impersonation", (set, get, api) => ({
		...createInitialState(),
		hydrateFromSession: (session) => {
			const impersonator = normalizeIdentity(
				session?.impersonator as Partial<ImpersonationIdentity>,
			);
			if (!impersonator) {
				set(createInitialState());
				return;
			}

			const userIdentity = normalizeIdentity({
				id: session?.user?.id as string | undefined,
				name: session?.user?.name ?? null,
				email: session?.user?.email ?? null,
			} satisfies Partial<ImpersonationIdentity>);

			set({
				isImpersonating: true,
				impersonator,
				impersonatedUser: userIdentity ?? null,
			});
		},
		startImpersonation: async ({ userId }) => {
			// Track original credits before impersonation starts
			const currentCredits = useUserStore.getState().credits;
			console.log("=== IMPERSONATION START DEBUG ===");
			console.log("Recording original credits:", currentCredits);

			const parsed = impersonationResponseSchema.safeParse(
				await startImpersonationSession({ userId }),
			);
			if (!parsed.success) {
				console.error("Failed to parse impersonation response:", parsed.error);
				throw new Error("Invalid impersonation response payload");
			}

			console.log(
				"Impersonation started successfully for user:",
				parsed.data.impersonatedUser,
			);
			console.log("Impersonator:", parsed.data.impersonator);

			// Update NextAuth session with impersonation data
			await triggerSessionUpdate({
				impersonation: {
					impersonator: parsed.data.impersonator,
					impersonatedUser: parsed.data.impersonatedUser,
				},
				user: parsed.data.impersonatedUserData as unknown as Record<
					string,
					unknown
				>, // Pass full user data
			});

			set({
				isImpersonating: true,
				impersonator: parsed.data.impersonator,
				impersonatedUser: parsed.data.impersonatedUser,
				originalCredits: currentCredits,
			});
			console.log("Original credits stored in state:", currentCredits);
			console.log("=== IMPERSONATION START DEBUG END ===");
			return parsed.data;
		},
		stopImpersonation: async () => {
			// Refund credits used during impersonation
			const currentCredits = useUserStore.getState().credits;
			console.log("=== IMPERSONATION STOP STORE DEBUG ===");
			set((state) => {
				console.log("Impersonation state in store:", {
					isImpersonating: state.isImpersonating,
					originalCredits: state.originalCredits,
					impersonatedUser:
						state.impersonatedUser?.name || state.impersonatedUser?.email,
				});

				if (state.originalCredits) {
					const originalCredits = state.originalCredits; // Extract to variable for type safety
					console.log(
						"Refunding credits from:",
						originalCredits,
						"to current:",
						currentCredits,
					);

					// Refund the credits by setting used back to original values
					useUserStore.setState((userState) => ({
						credits: {
							...userState.credits,
							ai: {
								...userState.credits.ai,
								used: originalCredits.ai.used,
							},
							leads: {
								...userState.credits.leads,
								used: originalCredits.leads.used,
							},
							skipTraces: {
								...userState.credits.skipTraces,
								used: originalCredits.skipTraces.used,
							},
						},
						quotas: {
							...userState.quotas,
							ai: {
								...userState.quotas.ai,
								used: originalCredits.ai.used,
							},
							leads: {
								...userState.quotas.leads,
								used: originalCredits.leads.used,
							},
							skipTraces: {
								...userState.quotas.skipTraces,
								used: originalCredits.skipTraces.used,
							},
						},
					}));

					console.log("Credits refunded successfully");
				} else {
					console.warn("No original credits found for refund!");
				}
				return createInitialState();
			});

			// Update NextAuth session to clear impersonation data (outside set callback)
			await triggerSessionUpdate({
				impersonation: {
					impersonator: null,
					impersonatedUser: null,
				},
			});

			await stopImpersonationSession();
			console.log("Impersonation session stopped in backend");
			console.log("=== IMPERSONATION STOP STORE DEBUG END ===");
		},
		reset: () => set(createInitialState()),
	})),
);
