import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { produce } from "immer";
import { v4 as uuidv4 } from "uuid";

import type { UserProfile } from "@/types/userProfile";
import type { LeadList } from "@/types/_dashboard/leadList";
import type { LeadTypeGlobal } from "@/types/_dashboard/leads";

interface UserProfileState {
	userProfile: UserProfile | null;
	error: string | null;
	setUserProfile: (profile: UserProfile) => void;
	updateUserProfile: (updatedData: Partial<UserProfile>) => void;
	resetUserProfile: () => void;
	addLeadList: (newList: LeadList) => string; // Returns the new list's ID
	addLeadToList: (listId: string, lead: LeadTypeGlobal) => void;
	// Credits helpers
	getAvailableSkipTraceCredits: () => number;
	canAffordSkipTrace: (cost: number) => boolean;
	deductSkipTraceCredits: (cost: number) => boolean; // returns success
	refundSkipTraceCredits: (amount: number) => void;
}

export const useUserProfileStore = create<UserProfileState>()(
	devtools(
		persist(
			(set, get) => ({
				userProfile: null,
				error: null,

				setUserProfile: (profile) => set({ userProfile: profile, error: null }),

				updateUserProfile: (updatedData) =>
					set(
						produce((state: UserProfileState) => {
							if (state.userProfile) {
								state.userProfile = { ...state.userProfile, ...updatedData };
							}
						}),
					),

				resetUserProfile: () => set({ userProfile: null, error: null }),

				addLeadList: (newList: LeadList) => {
					set(
						produce((state: UserProfileState) => {
							if (state.userProfile?.companyInfo) {
								if (!state.userProfile.companyInfo.leadLists) {
									state.userProfile.companyInfo.leadLists = [];
								}
								state.userProfile.companyInfo.leadLists.push(newList);
							}
						}),
					);
					return newList.id;
				},

				addLeadToList: (listId: string, lead: LeadTypeGlobal) => {
					set(
						produce((state: UserProfileState) => {
							if (state.userProfile?.companyInfo?.leadLists) {
								const list = state.userProfile.companyInfo.leadLists.find(
									(l) => l.id === listId,
								);
								if (list) {
									list.leads.push(lead);
								}
							}
						}),
					);
				},

				// Credits helpers (skip trace)
				getAvailableSkipTraceCredits: () => {
					const s = get().userProfile;
					const st = s?.subscription?.skipTraces;
					if (st) {
						const allotted = st.allotted ?? 0;
						const used = st.used ?? 0;
						return Math.max(0, allotted - used);
					}
					// Fallback: some environments track a single AI credits pool
					const ai = s?.subscription?.aiCredits as
						| { allotted?: number; used?: number }
						| undefined;
					if (ai) {
						const allotted = ai.allotted ?? 0;
						const used = ai.used ?? 0;
						return Math.max(0, allotted - used);
					}
					return 0;
				},
				canAffordSkipTrace: (cost: number) => {
					const available = get().getAvailableSkipTraceCredits();
					return cost <= available;
				},
				deductSkipTraceCredits: (cost: number) => {
					const can = get().canAffordSkipTrace(cost);
					if (!can) return false;
					set(
						produce((state: UserProfileState) => {
							if (!state.userProfile) return;
							// Ensure subscription exists
							let sub = state.userProfile.subscription as
								| UserProfile["subscription"]
								| undefined;
							if (!sub) {
								sub = {} as UserProfile["subscription"];
								state.userProfile.subscription = sub;
							}
							// Ensure skipTraces exists with required shape (seed from aiCredits if present)
							let st = sub.skipTraces;
							if (!st) {
								const ai = sub.aiCredits as
									| { allotted?: number; used?: number }
									| undefined;
								const seededAllotted = ai?.allotted ?? 0;
								const seededUsed = ai?.used ?? 0;
								st = {
									allotted: seededAllotted,
									used: seededUsed,
									resetInDays: 30,
								};
								sub.skipTraces = st;
							}
							// Apply deduction
							st.used = (st.used ?? 0) + cost;
						}),
					);
					return true;
				},
				refundSkipTraceCredits: (amount: number) => {
					set(
						produce((state: UserProfileState) => {
							if (!state.userProfile) return;
							// Ensure subscription exists
							let sub = state.userProfile.subscription as
								| UserProfile["subscription"]
								| undefined;
							if (!sub) {
								sub = {} as UserProfile["subscription"];
								state.userProfile.subscription = sub;
							}
							// Ensure skipTraces exists with required shape
							let st = sub.skipTraces;
							if (!st) {
								st = { allotted: 0, used: 0, resetInDays: 30 };
								sub.skipTraces = st;
							}
							// Apply refund
							const cur = st.used ?? 0;
							st.used = Math.max(0, cur - Math.max(0, amount));
						}),
					);
				},
			}),
			{
				name: "user-profile-store",
				storage: createJSONStorage(() => localStorage),
			},
		),
		{ name: "UserProfileStoreDevtools" },
	),
);
