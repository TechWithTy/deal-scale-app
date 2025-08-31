import { create } from "zustand";

// Types for agent selection
export interface Agent {
	id: string;
	name: string;
	email: string;
	status: "active" | "inactive" | "away";
}

// Mock data for available agents
const MOCK_AGENTS: Agent[] = [
	{
		id: "1",
		name: "John Doe",
		email: "john@example.com",
		status: "active",
	},
	{
		id: "2",
		name: "Jane Smith",
		email: "jane@example.com",
		status: "active",
	},
	{
		id: "3",
		name: "Mike Johnson",
		email: "mike@example.com",
		status: "away",
	},
];

// * Campaign Creation Store for multi-step modal context
export interface CampaignCreationState {
	// Step 1: Channel Selection
	primaryChannel: "email" | "call" | "text" | "social" | null;
	setPrimaryChannel: (channel: "email" | "call" | "text" | "social") => void;

	// Campaign Name
	campaignName: string;
	setCampaignName: (name: string) => void;

	// Agent Selection
	selectedAgentId: string | null;
	setSelectedAgentId: (id: string | null) => void;
	availableAgents: Agent[];
	setAvailableAgents: (agents: Agent[]) => void;

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
	reachOnHolidays: boolean;
	setReachOnHolidays: (v: boolean) => void;
	// Dial attempt preferences per day
	minDailyAttempts: number;
	setMinDailyAttempts: (v: number) => void;
	maxDailyAttempts: number;
	setMaxDailyAttempts: (v: number) => void;

	// Timezone handling
	getTimezoneFromLeadLocation: boolean;
	setGetTimezoneFromLeadLocation: (v: boolean) => void;

	// Number Pooling (Calls/Text)
	numberPoolingEnabled: boolean;
	setNumberPoolingEnabled: (v: boolean) => void;
	messagingServiceSid: string;
	setMessagingServiceSid: (sid: string) => void;
	senderPoolNumbersCsv: string; // CSV of E.164 numbers
	setSenderPoolNumbersCsv: (csv: string) => void;
	smartEncodingEnabled: boolean;
	setSmartEncodingEnabled: (v: boolean) => void;
	optOutHandlingEnabled: boolean;
	setOptOutHandlingEnabled: (v: boolean) => void;
	perNumberDailyLimit: number; // >=1 recommended
	setPerNumberDailyLimit: (n: number) => void;

	// Sender pool UI/data
	availableSenderNumbers: string[]; // connected numbers (mocked for now)
	setAvailableSenderNumbers: (nums: string[]) => void;
	selectedSenderNumbers: string[];
	setSelectedSenderNumbers: (nums: string[]) => void;
	numberSelectionStrategy: "round_robin" | "sticky_by_lead" | "random";
	setNumberSelectionStrategy: (
		s: "round_robin" | "sticky_by_lead" | "random",
	) => void;

	// Runtime usage tracking (per day)
	senderUsageToday: Record<string, number>; // "+1555...": count
	lastUsageResetDate: string; // YYYY-MM-DD
	resetDailySenderUsageIfNeeded: () => void;
	// Pick a number according to strategy and limits. If messagingServiceSid is set, return undefined to delegate.
	pickSenderNumber: (opts: { leadKey?: string }) => string | undefined;

	// Utility: Reset
	reset: () => void;
}

export const useCampaignCreationStore = create<CampaignCreationState>(
	(set, get) => ({
		// Step 1: Channel Selection
		primaryChannel: null,
		setPrimaryChannel: (primaryChannel) => set({ primaryChannel }),

		// Campaign Name
		campaignName: "",
		setCampaignName: (campaignName) => set({ campaignName }),

		// Agent selection
		selectedAgentId: null,
		setSelectedAgentId: (selectedAgentId) => set({ selectedAgentId }),
		availableAgents: MOCK_AGENTS,
		setAvailableAgents: (availableAgents) => set({ availableAgents }),

		// Step 2: Area & Lead List
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

		// Step 3: Timing Preferences
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
		reachOnHolidays: false,
		setReachOnHolidays: (reachOnHolidays) => set({ reachOnHolidays }),
		// Dial attempt preferences
		minDailyAttempts: 1,
		setMinDailyAttempts: (minDailyAttempts) => set({ minDailyAttempts }),
		maxDailyAttempts: 3,
		setMaxDailyAttempts: (maxDailyAttempts) => set({ maxDailyAttempts }),

		// Timezone handling
		getTimezoneFromLeadLocation: true,
		setGetTimezoneFromLeadLocation: (getTimezoneFromLeadLocation) =>
			set({ getTimezoneFromLeadLocation }),

		// Number Pooling (Calls/Text)
		numberPoolingEnabled: false,
		setNumberPoolingEnabled: (numberPoolingEnabled) =>
			set({ numberPoolingEnabled }),
		messagingServiceSid: "",
		setMessagingServiceSid: (messagingServiceSid) =>
			set({ messagingServiceSid }),
		senderPoolNumbersCsv: "",
		setSenderPoolNumbersCsv: (senderPoolNumbersCsv) =>
			set({ senderPoolNumbersCsv }),
		smartEncodingEnabled: true,
		setSmartEncodingEnabled: (smartEncodingEnabled) =>
			set({ smartEncodingEnabled }),
		optOutHandlingEnabled: true,
		setOptOutHandlingEnabled: (optOutHandlingEnabled) =>
			set({ optOutHandlingEnabled }),
		perNumberDailyLimit: 75,
		setPerNumberDailyLimit: (perNumberDailyLimit) =>
			set({ perNumberDailyLimit }),

		// Sender pool UI/data
		availableSenderNumbers: [
			"+15551230001",
			"+15551230002",
			"+15551230003",
			"+15551230004",
		],
		setAvailableSenderNumbers: (availableSenderNumbers) =>
			set({ availableSenderNumbers }),
		selectedSenderNumbers: [],
		setSelectedSenderNumbers: (selectedSenderNumbers) =>
			set({ selectedSenderNumbers }),
		numberSelectionStrategy: "round_robin",
		setNumberSelectionStrategy: (numberSelectionStrategy) =>
			set({ numberSelectionStrategy }),

		// Runtime usage tracking
		senderUsageToday: {},
		lastUsageResetDate: new Date().toISOString().slice(0, 10),
		resetDailySenderUsageIfNeeded: () =>
			set((state) => {
				const today = new Date().toISOString().slice(0, 10);
				if (state.lastUsageResetDate !== today) {
					return { senderUsageToday: {}, lastUsageResetDate: today };
				}
				return {} as Partial<CampaignCreationState>;
			}),
		pickSenderNumber: ({ leadKey }) => {
			// Delegate to Messaging Service if configured
			const s = get();
			if (s.messagingServiceSid) return undefined;
			// Ensure usage is fresh
			(s.resetDailySenderUsageIfNeeded as () => void)();
			const pool = s.selectedSenderNumbers.length
				? s.selectedSenderNumbers
				: s.availableSenderNumbers;
			if (!pool.length) return undefined;
			const usage = s.senderUsageToday || {};
			const limit = s.perNumberDailyLimit || 75;

			const eligible = pool.filter((n) => (usage[n] || 0) < limit);
			if (!eligible.length) return undefined;

			let chosen = eligible[0];
			switch (s.numberSelectionStrategy) {
				case "random":
					chosen = eligible[Math.floor(Math.random() * eligible.length)];
					break;
				case "sticky_by_lead":
					if (leadKey) {
						// Simple stable mapping: hash leadKey to index
						let hash = 0;
						for (let i = 0; i < leadKey.length; i++)
							hash = (hash * 31 + leadKey.charCodeAt(i)) >>> 0;
						chosen = eligible[hash % eligible.length];
						break;
					}
				// fallback to round robin
				case "round_robin":
				default:
					// pick the number with the least usage
					chosen = eligible.reduce((a, b) =>
						(usage[a] || 0) <= (usage[b] || 0) ? a : b,
					);
			}

			// increment usage
			set({
				senderUsageToday: { ...usage, [chosen]: (usage[chosen] || 0) + 1 },
			});
			return chosen;
		},

		// Reset function
		reset: () =>
			set({
				// Step 1
				primaryChannel: null,
				campaignName: "",

				// Agent Selection
				selectedAgentId: null,
				availableAgents: MOCK_AGENTS,

				// Step 2
				areaMode: "leadList",
				selectedLeadListId: "",
				campaignArea: "",
				leadCount: 0,
				includeWeekends: false,

				// Step 3
				daysSelected: 7,
				startDate: new Date(),
				endDate: null,
				reachBeforeBusiness: false,
				reachAfterBusiness: false,
				reachOnWeekend: false,
				reachOnHolidays: false,
				minDailyAttempts: 1,
				maxDailyAttempts: 3,
				getTimezoneFromLeadLocation: true,
				// Number Pooling
				numberPoolingEnabled: false,
				messagingServiceSid: "",
				senderPoolNumbersCsv: "",
				smartEncodingEnabled: true,
				optOutHandlingEnabled: true,
				perNumberDailyLimit: 75,
				availableSenderNumbers: [
					"+15551230001",
					"+15551230002",
					"+15551230003",
					"+15551230004",
				],
				selectedSenderNumbers: [],
				numberSelectionStrategy: "round_robin",
				senderUsageToday: {},
				lastUsageResetDate: new Date().toISOString().slice(0, 10),
			}),
	}),
);
