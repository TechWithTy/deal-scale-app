import { create } from "zustand";

export type LeadSourceOption = "csv-upload" | "saved-search" | "integrations";

export type MarketTimelineOption =
	| "immediate"
	| "next-30-days"
	| "this-quarter"
	| "later";

export interface LaunchChecklist {
	readonly sandboxValidated: boolean;
	readonly complianceReviewComplete: boolean;
	readonly notificationsEnabled: boolean;
	readonly goLiveApproved: boolean;
}

export interface CaptureOptions {
	readonly enableWidget: boolean;
	readonly enableExtension: boolean;
	readonly autoResponderEnabled: boolean;
	readonly forwardingNumber: string;
	readonly notifyEmail: string;
}

interface QuickStartWizardDataState {
	readonly leadSource: LeadSourceOption;
	readonly csvFileName: string | null;
	readonly csvRecordEstimate: number | null;
	readonly targetMarkets: readonly string[];
	readonly selectedIntegrations: readonly string[];
	readonly savedSearchName: string;
	readonly leadNotes: string;
	readonly marketFilters: readonly string[];
	readonly budgetRange: readonly [number, number];
	readonly timeline: MarketTimelineOption;
	readonly marketNotes: string;
	readonly reviewNotes: string;
	readonly launchChecklist: LaunchChecklist;
	readonly captureOptions: CaptureOptions;
	readonly setLeadSource: (leadSource: LeadSourceOption) => void;
	readonly setCsvDetails: (payload: {
		readonly fileName: string | null;
		readonly recordEstimate?: number | null;
	}) => void;
	readonly addTargetMarket: (market: string) => void;
	readonly removeTargetMarket: (market: string) => void;
	readonly toggleIntegrationSource: (integration: string) => void;
	readonly setSavedSearchName: (name: string) => void;
	readonly setLeadNotes: (notes: string) => void;
	readonly toggleMarketFilter: (filter: string) => void;
	readonly setBudgetRange: (range: [number, number]) => void;
	readonly setTimeline: (timeline: MarketTimelineOption) => void;
	readonly setMarketNotes: (notes: string) => void;
	readonly setReviewNotes: (notes: string) => void;
	readonly toggleLaunchChecklist: (key: keyof LaunchChecklist) => void;
	readonly setCaptureOption: (
		key: keyof CaptureOptions,
		value: CaptureOptions[keyof CaptureOptions],
	) => void;
	readonly reset: () => void;
}

const createInitialState = () => ({
	leadSource: "csv-upload" as const,
	csvFileName: null,
	csvRecordEstimate: null,
	targetMarkets: [] as string[],
	selectedIntegrations: [] as string[],
	savedSearchName: "",
	leadNotes: "",
	marketFilters: [] as string[],
	budgetRange: [50000, 250000] as [number, number],
	timeline: "immediate" as const,
	marketNotes: "",
	reviewNotes: "",
	launchChecklist: {
		sandboxValidated: false,
		complianceReviewComplete: false,
		notificationsEnabled: true,
		goLiveApproved: false,
	} satisfies LaunchChecklist,
	captureOptions: {
		enableWidget: true,
		enableExtension: false,
		autoResponderEnabled: true,
		forwardingNumber: "",
		notifyEmail: "",
	} satisfies CaptureOptions,
});

export const useQuickStartWizardDataStore = create<QuickStartWizardDataState>(
	(set) => ({
		...createInitialState(),
		setLeadSource: (leadSource) => set({ leadSource }),
		setCsvDetails: ({ fileName, recordEstimate = null }) =>
			set({ csvFileName: fileName, csvRecordEstimate: recordEstimate }),
		addTargetMarket: (market) =>
			set((state) => {
				const trimmed = market.trim();
				if (!trimmed) {
					return state;
				}

				if (state.targetMarkets.includes(trimmed)) {
					return state;
				}

				return {
					...state,
					targetMarkets: [...state.targetMarkets, trimmed],
				};
			}),
		removeTargetMarket: (market) =>
			set((state) => ({
				...state,
				targetMarkets: state.targetMarkets.filter((entry) => entry !== market),
			})),
		toggleIntegrationSource: (integration) =>
			set((state) => {
				const exists = state.selectedIntegrations.includes(integration);
				return {
					...state,
					selectedIntegrations: exists
						? state.selectedIntegrations.filter(
								(entry) => entry !== integration,
							)
						: [...state.selectedIntegrations, integration],
				};
			}),
		setSavedSearchName: (name) => set({ savedSearchName: name }),
		setLeadNotes: (notes) => set({ leadNotes: notes }),
		toggleMarketFilter: (filter) =>
			set((state) => {
				const exists = state.marketFilters.includes(filter);
				return {
					...state,
					marketFilters: exists
						? state.marketFilters.filter((entry) => entry !== filter)
						: [...state.marketFilters, filter],
				};
			}),
		setBudgetRange: (range) => {
			const [first, second] = range;
			const sorted: [number, number] =
				first <= second ? [first, second] : [second, first];
			set({ budgetRange: sorted });
		},
		setTimeline: (timeline) => set({ timeline }),
		setMarketNotes: (notes) => set({ marketNotes: notes }),
		setReviewNotes: (notes) => set({ reviewNotes: notes }),
		toggleLaunchChecklist: (key) =>
			set((state) => ({
				...state,
				launchChecklist: {
					...state.launchChecklist,
					[key]: !state.launchChecklist[key],
				},
			})),
		setCaptureOption: (key, value) =>
			set((state) => ({
				...state,
				captureOptions: {
					...state.captureOptions,
					[key]: value,
				},
			})),
		reset: () => set(createInitialState()),
	}),
);
