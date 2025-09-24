import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { produce } from "immer";
import { v4 as uuidv4 } from "uuid";

import type { UserProfile } from "@/types/userProfile";
import type { LeadList } from "@/types/_dashboard/leadList";
import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
// Aggregated nested domain stores (AI, campaigns, leads, skip trace, company, credits, permissions, session)
import { useAISettingsStore } from "./ai/ai";
import { useAIActionsStore } from "./ai/actions";
import { useAIChatStore } from "./ai/chat";
import { useAIReportsStore } from "./ai/reports";
import { useAITasksStore } from "./ai/tasks";
import { useUserCampaignsStore } from "./campaigns/campaigns";
import { useUserCampaignReportsStore } from "./campaigns/reports";
import { useUserLeadsStore } from "./leads/leads";
import { useUserLeadsReportsStore } from "./leads/reports";
import { useSavedSearchesStore } from "./leads/savedSearches";
import { useSkipTraceStore } from "./skip_trace/skipTraceStore";
import { useSkipTraceReportsStore } from "./skip_trace/reports";
import { useCompanyStore } from "./company";
import { useUserCreditsStore } from "./credits";
import { usePermissionsStore } from "./permissions";
import { useSessionStore } from "./useSessionStore";
import { useUserSubscriptionStore } from "./subscription";

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

// Re-export nested domain stores for single-top access from userProfile module
export {
  useAISettingsStore,
  useAIActionsStore,
  useAIChatStore,
  useAIReportsStore,
  useAITasksStore,
  useUserCampaignsStore,
  useUserCampaignReportsStore,
  useUserLeadsStore,
  useUserLeadsReportsStore,
  useSavedSearchesStore,
  useSkipTraceStore,
  useSkipTraceReportsStore,
  useCompanyStore,
  useUserCreditsStore,
  usePermissionsStore,
  useSessionStore,
  useUserSubscriptionStore,
};

// Optional: grouped access with nested namespaces for DX
export const UserStores = {
  profile: useUserProfileStore,
  session: useSessionStore,
  ai: {
    settings: useAISettingsStore,
    actions: useAIActionsStore,
    chat: useAIChatStore,
    reports: useAIReportsStore,
    tasks: useAITasksStore,
  },
  campaigns: {
    store: useUserCampaignsStore,
    reports: useUserCampaignReportsStore,
  },
  leads: {
    store: useUserLeadsStore,
    reports: useUserLeadsReportsStore,
    savedSearches: useSavedSearchesStore,
  },
  skipTrace: {
    store: useSkipTraceStore,
    reports: useSkipTraceReportsStore,
  },
  company: useCompanyStore,
  credits: useUserCreditsStore,
  permissions: usePermissionsStore,
  subscription: useUserSubscriptionStore,
} as const;
