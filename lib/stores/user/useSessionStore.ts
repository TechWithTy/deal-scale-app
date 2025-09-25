"use client";

import type { UserProfile } from "@/types/userProfile";
import { create } from "zustand";
import { withAnalytics } from "../_middleware/analytics";

interface SessionState {
	user: UserProfile | null; // ✅ Holds user context
	setSessionUser: (user: UserProfile) => void; // ✅ Allows setting user data
	clearUser: () => void; // ✅ Allows clearing session
}

export const useSessionStore = create<SessionState>(
	withAnalytics<SessionState>("session", (set) => ({
		user: null, // ✅ Initially no user

		setSessionUser: (user) => set({ user }),

		clearUser: () => set({ user: null }),
	})),
);
