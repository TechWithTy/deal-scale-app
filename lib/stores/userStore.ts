import { create } from "zustand";

interface UserCredits {
	used: number;
	allotted: number;
}

interface UserState {
	role?: string;
	permissions: string[];
	credits: {
		ai: UserCredits;
		leads: UserCredits;
		skipTraces: UserCredits;
	};
	setUser: (
		session: {
			user?: {
				role?: string;
				permissions?: string[];
				subscription?: {
					aiCredits?: UserCredits;
					leads?: UserCredits;
					skipTraces?: UserCredits;
				};
			};
		} | null,
	) => void;
	consumeLeads: (amount: number) => void;
	consumeAI: (amount: number) => void;
}

const initialState = {
	role: undefined,
	permissions: [],
	credits: {
		ai: { used: 0, allotted: 0 },
		leads: { used: 0, allotted: 0 },
		skipTraces: { used: 0, allotted: 0 },
	},
};

export const useUserStore = create<UserState>((set) => ({
	...initialState,
	setUser: (session) => {
		if (!session?.user) {
			// reset to initial state on sign out or missing user
			set({ ...initialState });
			return;
		}

		const u = session.user;
		set({
			role: u.role,
			permissions: u.permissions || [],
			credits: {
				ai: {
					used: u.subscription?.aiCredits?.used || 0,
					allotted: u.subscription?.aiCredits?.allotted || 0,
				},
				leads: {
					used: u.subscription?.leads?.used || 0,
					allotted: u.subscription?.leads?.allotted || 0,
				},
				skipTraces: {
					used: u.subscription?.skipTraces?.used || 0,
					allotted: u.subscription?.skipTraces?.allotted || 0,
				},
			},
		});
	},
	consumeLeads: (amount) => {
		const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
		if (safeAmount === 0) return;
		set((state) => {
			const current = state.credits.leads;
			const remaining = Math.max(0, current.allotted - current.used);
			const delta = Math.min(remaining, safeAmount);
			return {
				credits: {
					...state.credits,
					leads: {
						...current,
						used: Math.min(current.allotted, current.used + delta),
					},
				},
			};
		});
	},
	consumeAI: (amount) => {
		const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
		if (safeAmount === 0) return;
		set((state) => {
			const current = state.credits.ai;
			const remaining = Math.max(0, current.allotted - current.used);
			const delta = Math.min(remaining, safeAmount);
			return {
				credits: {
					...state.credits,
					ai: {
						...current,
						used: Math.min(current.allotted, current.used + delta),
					},
				},
			};
		});
	},
}));

export const useRemainingLeads = () =>
	useUserStore((state) => {
		const current = state.credits.leads;
		return Math.max(0, current.allotted - current.used);
	});

export const useRemainingAI = () =>
	useUserStore((state) => {
		const current = state.credits.ai;
		return Math.max(0, current.allotted - current.used);
	});
