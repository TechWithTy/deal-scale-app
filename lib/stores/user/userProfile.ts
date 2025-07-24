import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
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
}

export const useUserProfileStore = create<UserProfileState>()(
	devtools(
		persist(
			(set) => ({
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
			}),
			{
				name: "user-profile-store",
				getStorage: () => localStorage,
			},
		),
		{ name: "UserProfileStoreDevtools" },
	),
);
