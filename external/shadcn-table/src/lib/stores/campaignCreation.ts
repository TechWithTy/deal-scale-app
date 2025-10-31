import { createWithEqualityFn } from "zustand/traditional";

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
	primaryChannel: "directmail" | "call" | "text" | "social" | null;
	setPrimaryChannel: (
		channel: "directmail" | "call" | "text" | "social",
	) => void;

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
	// A/B testing for lead lists (match usage in modal)
	abTestingEnabled: boolean;
	setAbTestingEnabled: (v: boolean) => void;
	selectedLeadListAId: string;
	setSelectedLeadListAId: (id: string) => void;
	selectedLeadListBId: string;
	setSelectedLeadListBId: (id: string) => void;
	campaignArea: string;
	setCampaignArea: (area: string) => void;
	leadCount: number;
	includeWeekends: boolean;
	setIncludeWeekends: (v: boolean) => void;
	setLeadCount: (count: number) => void;

	// Validation helpers
	isLeadListSelectionValid: () => boolean;

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
    countVoicemailAsAnswered: boolean;
    setCountVoicemailAsAnswered: (v: boolean) => void;

    // Voicemail selection (UI + presets)
    preferredVoicemailMessageId: string;
    setPreferredVoicemailMessageId: (id: string) => void;
    preferredVoicemailVoiceId: string;
    setPreferredVoicemailVoiceId: (id: string) => void;

	// Text/SMS settings
	textSignature: string;
	setTextSignature: (sig: string) => void;
	smsCanSendImages: boolean;
	setSmsCanSendImages: (v: boolean) => void;
	smsCanSendVideos: boolean;
	setSmsCanSendVideos: (v: boolean) => void;
	smsCanSendLinks: boolean;
	setSmsCanSendLinks: (v: boolean) => void;
	smsMediaSource: "ai" | "stock" | "hybrid";
	setSmsMediaSource: (v: "ai" | "stock" | "hybrid") => void;

	// TCPA and Voicemail preferences
	tcpaNotOptedIn: boolean;
	setTcpaNotOptedIn: (v: boolean) => void;
	doVoicemailDrops: boolean;
	setDoVoicemailDrops: (v: boolean) => void;

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

	// Utility: Reset
	reset: () => void;
}

export const useCampaignCreationStore = createWithEqualityFn<CampaignCreationState>(
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
		// A/B testing defaults
		abTestingEnabled: false,
		setAbTestingEnabled: (abTestingEnabled) => set({ abTestingEnabled }),
		selectedLeadListAId: "",
		setSelectedLeadListAId: (selectedLeadListAId) =>
			set({ selectedLeadListAId }),
		selectedLeadListBId: "",
		setSelectedLeadListBId: (selectedLeadListBId) =>
			set({ selectedLeadListBId }),
		campaignArea: "",
		setCampaignArea: (campaignArea) => set({ campaignArea }),
		leadCount: 0,
		setLeadCount: (leadCount) => set({ leadCount }),
		includeWeekends: false,
		setIncludeWeekends: (includeWeekends) => set({ includeWeekends }),

		// Validation helpers
		isLeadListSelectionValid: () => {
			const s = get();
			if (s.areaMode !== "leadList") return true;
			if (!s.abTestingEnabled)
				return Boolean(s.selectedLeadListId || s.selectedLeadListAId);
			return Boolean(s.selectedLeadListAId && s.selectedLeadListBId);
		},

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
		setReachOnWeekend: (reachOnWeekend: boolean) => set({ reachOnWeekend }),
		reachOnHolidays: false,
		setReachOnHolidays: (reachOnHolidays: boolean) => set({ reachOnHolidays }),
		countVoicemailAsAnswered: false,
    setCountVoicemailAsAnswered: (countVoicemailAsAnswered: boolean) =>
        set({ countVoicemailAsAnswered }),

    // Voicemail selection
    preferredVoicemailMessageId: "",
    setPreferredVoicemailMessageId: (preferredVoicemailMessageId: string) =>
        set({ preferredVoicemailMessageId }),
    preferredVoicemailVoiceId: "",
    setPreferredVoicemailVoiceId: (preferredVoicemailVoiceId: string) =>
        set({ preferredVoicemailVoiceId }),

	// Text/SMS settings
	textSignature: "",
	setTextSignature: (textSignature: string) => set({ textSignature }),
	smsCanSendImages: true,
	setSmsCanSendImages: (smsCanSendImages: boolean) => set({ smsCanSendImages }),
	smsCanSendVideos: true,
	setSmsCanSendVideos: (smsCanSendVideos: boolean) => set({ smsCanSendVideos }),
	smsCanSendLinks: true,
	setSmsCanSendLinks: (smsCanSendLinks: boolean) => set({ smsCanSendLinks }),
	smsMediaSource: "hybrid",
	setSmsMediaSource: (smsMediaSource: "ai" | "stock" | "hybrid") => set({ smsMediaSource }),

		// TCPA and Voicemail preferences
		tcpaNotOptedIn: false,
		setTcpaNotOptedIn: (tcpaNotOptedIn: boolean) => set({ tcpaNotOptedIn }),
		doVoicemailDrops: false,
		setDoVoicemailDrops: (doVoicemailDrops: boolean) => set({ doVoicemailDrops }),

		// Dial attempt preferences
		minDailyAttempts: 1,
		setMinDailyAttempts: (minDailyAttempts: number) => set({ minDailyAttempts }),
		maxDailyAttempts: 3,
		setMaxDailyAttempts: (maxDailyAttempts: number) => set({ maxDailyAttempts }),

		// Timezone handling
		getTimezoneFromLeadLocation: true,
		setGetTimezoneFromLeadLocation: (getTimezoneFromLeadLocation: boolean) =>
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
				abTestingEnabled: false,
				selectedLeadListAId: "",
				selectedLeadListBId: "",
				campaignArea: "",
				leadCount: 0,
				includeWeekends: false,

                // Step 3
                daysSelected: 7,
                startDate: new Date(),
                endDate: null,
                availableSenderNumbers: [
                    "+15551230001",
                    "+15551230002",
                    "+15551230003",
                    "+15551230004",
                ],
                selectedSenderNumbers: [],
                numberSelectionStrategy: "round_robin",
                reachOnHolidays: false,
                minDailyAttempts: 1,
                maxDailyAttempts: 3,
                countVoicemailAsAnswered: false,
                tcpaNotOptedIn: false,
                doVoicemailDrops: false,
                getTimezoneFromLeadLocation: true,
                preferredVoicemailMessageId: "",
                preferredVoicemailVoiceId: "",
                textSignature: "",
                smsCanSendImages: true,
                smsCanSendVideos: true,
                smsCanSendLinks: true,
                smsMediaSource: "hybrid",
            }),
	}),
);
