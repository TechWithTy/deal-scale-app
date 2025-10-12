import { create } from "zustand";
import type { Session } from "next-auth";
import type {
	ImpersonationIdentity,
	ImpersonationSessionPayload,
	ImpersonationSessionUserSnapshot,
} from "@/types/impersonation";
import {
	startImpersonationSession,
	stopImpersonationSession,
} from "@/lib/admin/impersonation-service";
import {
	identitySchema,
	impersonationResponseSchema,
} from "@/lib/impersonation/session-schemas";
import { withAnalytics } from "./_middleware/analytics";
import { useUserStore } from "./userStore";

async function triggerSessionUpdate(update: {
	impersonation?: {
		impersonator?: ImpersonationIdentity | null;
		impersonatedUser?: ImpersonationIdentity | null;
	};
	user?: ImpersonationSessionUserSnapshot | null;
}) {
	if (typeof window === "undefined") return;

	await fetch("/api/auth/session", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(update),
	});
}

interface CreditSnapshot {
	ai: { used: number; allotted: number };
	leads: { used: number; allotted: number };
	skipTraces: { used: number; allotted: number };
}

interface ImpersonationState {
	isImpersonating: boolean;
	impersonatedUser: ImpersonationIdentity | null;
	impersonator: ImpersonationIdentity | null;
	originalCredits: CreditSnapshot | null;
	originalUserData: ImpersonationSessionUserSnapshot | null;
	hydrateFromSession: (session: Session | null) => void;
	startImpersonation: (params: {
		userId: string;
	}) => Promise<ImpersonationSessionPayload>;
	stopImpersonation: () => Promise<void>;
	reset: () => void;
}

const createInitialState = (): Pick<
	ImpersonationState,
	| "isImpersonating"
	| "impersonatedUser"
	| "impersonator"
	| "originalCredits"
	| "originalUserData"
> => ({
	isImpersonating: false,
	impersonatedUser: null,
	impersonator: null,
	originalCredits: null,
	originalUserData: null,
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
	withAnalytics<ImpersonationState>("impersonation", (set, get) => ({
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

			await triggerSessionUpdate({
				impersonation: {
					impersonator: parsed.data.impersonator,
					impersonatedUser: parsed.data.impersonatedUser,
				},
				user: parsed.data.impersonatedUserData,
			});

			set({
				isImpersonating: true,
				impersonator: parsed.data.impersonator,
				impersonatedUser: parsed.data.impersonatedUser,
				originalCredits: currentCredits,
				originalUserData: parsed.data.impersonatorUserData,
			});
			console.log("Original credits stored in state:", currentCredits);
			console.log("=== IMPERSONATION START DEBUG END ===");
			return parsed.data;
		},
		stopImpersonation: async () => {
			const currentCredits = useUserStore.getState().credits;
			const { originalUserData } = get();
			console.log("=== IMPERSONATION STOP STORE DEBUG ===");

			await stopImpersonationSession();

			set((state) => {
				console.log("Impersonation state in store:", {
					isImpersonating: state.isImpersonating,
					originalCredits: state.originalCredits,
					impersonatedUser:
						state.impersonatedUser?.name || state.impersonatedUser?.email,
				});

				if (state.originalCredits) {
					const originalCredits = state.originalCredits;
					console.log(
						"Refunding credits from:",
						originalCredits,
						"to current:",
						currentCredits,
					);

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

			const sessionUpdate: {
				impersonation: {
					impersonator: null;
					impersonatedUser: null;
				};
				user?: ImpersonationSessionUserSnapshot;
			} = {
				impersonation: {
					impersonator: null,
					impersonatedUser: null,
				},
			};
			if (originalUserData) {
				sessionUpdate.user = originalUserData;
			}

			await triggerSessionUpdate(sessionUpdate);
			console.log("Impersonation session stopped in backend");
			console.log("=== IMPERSONATION STOP STORE DEBUG END ===");
		},
		reset: () => set(createInitialState()),
	})),
);
