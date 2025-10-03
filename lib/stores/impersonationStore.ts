import { create } from "zustand";
import { z } from "zod";
import type { Session } from "next-auth";
import type {
	ImpersonationIdentity,
	ImpersonationSessionPayload,
} from "@/types/impersonation";
import {
	startImpersonationSession,
	stopImpersonationSession,
} from "@/lib/admin/impersonation-service";
import { withAnalytics } from "./_middleware/analytics";

interface ImpersonationState {
	isImpersonating: boolean;
	impersonatedUser: ImpersonationIdentity | null;
	impersonator: ImpersonationIdentity | null;
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
});

const createInitialState = (): Pick<
	ImpersonationState,
	"isImpersonating" | "impersonatedUser" | "impersonator"
> => ({
	isImpersonating: false,
	impersonatedUser: null,
	impersonator: null,
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

export const useImpersonationStore = create<ImpersonationState>()(
	withAnalytics<ImpersonationState>("impersonation", (set) => ({
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
			const parsed = impersonationResponseSchema.safeParse(
				await startImpersonationSession({ userId }),
			);
			if (!parsed.success) {
				throw new Error("Invalid impersonation response payload");
			}

			set({
				isImpersonating: true,
				impersonator: parsed.data.impersonator,
				impersonatedUser: parsed.data.impersonatedUser,
			});
			return parsed.data;
		},
		stopImpersonation: async () => {
			await stopImpersonationSession();
			set(createInitialState());
		},
		reset: () => set(createInitialState()),
	})),
);
