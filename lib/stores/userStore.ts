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
	setUser: (session: any) => void;
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
		if (!session?.user) return;

		set({
			role: session.user.role,
			permissions: session.user.permissions || [],
			credits: {
				ai: {
					used: session.user.subscription?.aiCredits?.used || 0,
					allotted: session.user.subscription?.aiCredits?.allotted || 0,
				},
				leads: {
					used: session.user.subscription?.leads?.used || 0,
					allotted: session.user.subscription?.leads?.allotted || 0,
				},
				skipTraces: {
					used: session.user.subscription?.skipTraces?.used || 0,
					allotted: session.user.subscription?.skipTraces?.allotted || 0,
				},
			},
		});
	},
}));
