import { create } from "zustand";

interface ImpersonationState {
	isImpersonating: boolean;
	adminToken: string | null;
	userName: string | null;
	userId: string | null;
	startImpersonation: (params: {
		adminToken: string;
		userName: string;
		userId: string;
	}) => void;
	endImpersonation: () => void;
}

export const useImpersonationStore = create<ImpersonationState>((set) => ({
	isImpersonating: false,
	adminToken: null,
	userName: null,
	userId: null,
	startImpersonation: ({ adminToken, userName, userId }) =>
		set({ isImpersonating: true, adminToken, userName, userId }),
	endImpersonation: () =>
		set({
			isImpersonating: false,
			adminToken: null,
			userName: null,
			userId: null,
		}),
}));
