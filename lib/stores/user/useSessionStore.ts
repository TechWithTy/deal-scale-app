"use client";

import type { Session } from "next-auth";
import { create } from "zustand";

import type { ImpersonationIdentity } from "@/types/impersonation";
import { withAnalytics } from "../_middleware/analytics";

type SessionUser = Session["user"];

interface SessionState {
	user: SessionUser | null;
	impersonator: ImpersonationIdentity | null;
	setFromSession: (session: Session | null) => void;
	setSessionUser: (user: SessionUser | null) => void;
	setImpersonator: (impersonator: ImpersonationIdentity | null) => void;
	clear: () => void;
}

export const useSessionStore = create<SessionState>()(
	withAnalytics<SessionState>("session", (set) => ({
		user: null,
		impersonator: null,
		setFromSession: (session) =>
			set({
				user: session?.user ?? null,
				impersonator: session?.impersonator ?? null,
			}),
		setSessionUser: (user) => set({ user }),
		setImpersonator: (impersonator) => set({ impersonator }),
		clear: () => set({ user: null, impersonator: null }),
	})),
);
