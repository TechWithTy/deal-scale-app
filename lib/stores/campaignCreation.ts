import { create } from "zustand";

// * Campaign Creation Store for multi-step modal context
export interface CampaignCreationState {
	// Step 1: Channel Selection
	primaryChannel: "email" | "call" | "text" | "social" | null;
	setPrimaryChannel: (channel: "email" | "call" | "text" | "social") => void;

	// Campaign Name
	campaignName: string;
	setCampaignName: (name: string) => void;

	// Step 2: Area & Lead List
	areaMode: "zip" | "leadList";
	setAreaMode: (mode: "zip" | "leadList") => void;
	selectedLeadListId: string;
	setSelectedLeadListId: (id: string) => void;
	campaignArea: string;
	setCampaignArea: (area: string) => void;
	leadCount: number;
	includeWeekends: boolean;
	setIncludeWeekends: (v: boolean) => void;
	setLeadCount: (count: number) => void;

	// Step 3: Timing Preferences
	daysSelected: number;
	setDaysSelected: (days: number) => void;

	startDate: Date;
	setStartDate: (date: Date) => void;
	endDate: Date | null;
	setEndDate: (date: Date | null) => void;
	reachBeforeBusiness: boolean;
	setReachBeforeBusiness: (v: boolean) => void;
	reachAfterBusiness: boolean;
	setReachAfterBusiness: (v: boolean) => void;
	reachOnWeekend: boolean;
	setReachOnWeekend: (v: boolean) => void;

	// Utility: Reset
	reset: () => void;
}

export const useCampaignCreationStore = create<CampaignCreationState>(
	(set) => ({
		primaryChannel: null,
		setPrimaryChannel: (primaryChannel) => set({ primaryChannel }),
		campaignName: "",
		setCampaignName: (campaignName) => set({ campaignName }),
		areaMode: "leadList",
		setAreaMode: (areaMode) => set({ areaMode }),
		selectedLeadListId: "",
		setSelectedLeadListId: (selectedLeadListId) => set({ selectedLeadListId }),
		campaignArea: "",
		setCampaignArea: (campaignArea) => set({ campaignArea }),
		leadCount: 0,
		setLeadCount: (leadCount) => set({ leadCount }),
		includeWeekends: false,
		setIncludeWeekends: (includeWeekends) => set({ includeWeekends }),
		daysSelected: 7,
		setDaysSelected: (daysSelected) => set({ daysSelected }),

		startDate: new Date(),
		setStartDate: (startDate) => set({ startDate }),
		endDate: null,
		setEndDate: (endDate) => set({ endDate }),
		reachBeforeBusiness: false,
		setReachBeforeBusiness: (reachBeforeBusiness) =>
			set({ reachBeforeBusiness }),
		reachAfterBusiness: false,
		setReachAfterBusiness: (reachAfterBusiness) => set({ reachAfterBusiness }),
		reachOnWeekend: false,
		setReachOnWeekend: (reachOnWeekend) => set({ reachOnWeekend }),
		reset: () =>
			set({
				primaryChannel: null,
				campaignName: "",
				areaMode: "leadList",
				selectedLeadListId: "",
				campaignArea: "",
				leadCount: 0,
				daysSelected: 7,

				startDate: new Date(),
				endDate: null,
				reachBeforeBusiness: false,
				reachAfterBusiness: false,
				reachOnWeekend: false,
			}),
	}),
);
