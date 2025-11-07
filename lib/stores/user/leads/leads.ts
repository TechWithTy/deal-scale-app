import { MockUserProfile } from "@/constants/_faker/profile/userProfile";
import type { LeadStatus, LeadTypeGlobal } from "@/types/_dashboard/leads";
import { create } from "zustand";

interface UserLeadsState {
	leads: LeadTypeGlobal[];
	filtered: LeadTypeGlobal[];
	filterByStatus: (status: "all" | LeadStatus) => void;
	filterByFollowUpRange: (startISO: string, endISO: string) => void;
	filterByCampaignId: (campaignId: string) => void;
	resetFilters: () => void;
	count: () => number;
}

const seedLeads: LeadTypeGlobal[] = MockUserProfile?.companyInfo?.leads ?? [];

export const useUserLeadsStore = create<UserLeadsState>((set, get) => ({
	leads: seedLeads,
	filtered: seedLeads,

	filterByStatus: (status) => {
		const { leads } = get();
		const filtered =
			status === "all" ? leads : leads.filter((l) => l.status === status);
		set({ filtered });
	},

	filterByFollowUpRange: (startISO, endISO) => {
		const { leads } = get();
		const start = new Date(startISO).getTime();
		const end = new Date(endISO).getTime();
		const filtered = leads.filter((l) => {
			const f = l.followUp ? new Date(l.followUp).getTime() : undefined;
			return typeof f === "number" && f >= start && f <= end;
		});
		set({ filtered });
	},

	filterByCampaignId: (campaignId) => {
		const { leads } = get();
		const filtered = leads.filter((l) => l.campaignID === campaignId);
		set({ filtered });
	},

	resetFilters: () => set((s) => ({ filtered: s.leads })),
	count: () => get().filtered.length,
}));
