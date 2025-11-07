import { createWithEqualityFn } from "zustand/traditional";
import { withAnalytics } from "./_middleware/analytics";

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

export interface WorkflowOption {
	id: string;
	name: string;
}

const MOCK_WORKFLOWS: WorkflowOption[] = [
	{ id: "wf1", name: "Default: Nurture 7-day" },
	{ id: "wf2", name: "Aggressive: 3-day blitz" },
	{ id: "wf3", name: "Custom: Follow-up only" },
];

export interface SalesScriptOption {
	id: string;
	name: string;
	description?: string;
	content?: string;
	type?: "call" | "sms" | "email" | "voicemail";
}

const MOCK_SALES_SCRIPTS: SalesScriptOption[] = [
	{
		id: "outbound_call_qualification",
		name: "Outbound Call Qualification",
		description: "Professional qualification call for off-market sellers",
		type: "call",
		content: `<poml>
  <role>You are a highly professional sales agent for DealScale, focused on helping real estate owners sell off-market.</role>
  <task>Conduct a qualification call with a property owner using the provided lead variables.</task>
  <let>
    {{prospectFirstName}} = prospect.firstName
    {{agentName}} = user.name
    {{propertyAddress}} = lead.propertyAddress
    {{location}} = lead.location
    {{ownerTimeInProperty}} = lead.ownerTimeInProperty
    {{nextStepTime}} = "morning or afternoon"
  </let>
  <script>
    "Hi {{prospectFirstName}}, this is {{agentName}} with DealScale. I saw your property at {{propertyAddress}} in {{location}} and noticed you've owned it for {{ownerTimeInProperty}} years. Are you open to exploring a fast, off-market exit while demand is high in your area?"

    [If yes:]
    "Great. Could you share your timeline for selling, and whether your priority is speed, price, or minimal hassle?"

    [If no or maybe:]
    "I understand. Would it be okay if I send you what similar homes in your neighborhood have recently achieved, and we check back in about 3-6 months when it makes sense for you?"

    "Thanks for your time – I'll send you a summary of your options today, and we'll set a quick 15-minute follow-up. Does {{nextStepTime}} work better for you?"
  </script>
  <output-format>
    Provide the next-step booking status (yes/no) and schedule slot.
  </output-format>
</poml>`,
	},
	{
		id: "sms_text_outreach",
		name: "SMS Text Outreach",
		description: "Concise SMS for warm prospect engagement",
		type: "sms",
		content: `<poml>
  <role>You are a direct but friendly text outreach specialist for DealScale.</role>
  <task>Send a concise SMS message to initiate engagement with a warm prospect.</task>
  <let>
    {{prospectFirstName}} = prospect.firstName
    {{agentName}} = user.name
    {{location}} = lead.location
    {{ownerTimeInProperty}} = lead.ownerTimeInProperty
  </let>
  <script>
    Hi {{prospectFirstName}}, this is {{agentName}} at DealScale. I saw you own a property in {{location}} for about {{ownerTimeInProperty}} yrs. We're working with buyers who purchase off-market — would you be open to a quick 10-min chat this week? Reply "YES" and I'll send two time options.
  </script>
  <follow-up>
    If no reply in 48 hours:
    "Just following up – if you've got 2-mins today I can show you a recent deal we closed in {{location}} and how much equity the seller had. Want me to send it?"
  </follow-up>
  <output-format>
    Return reply status ("YES", "NO", or no reply) and recommended next message.
  </output-format>
</poml>`,
	},
	{
		id: "email_outreach_sequence",
		name: "Email Outreach Sequence",
		description: "2-step personalized email sequence for property owners",
		type: "email",
		content: `<poml>
  <role>You are a strategic email outreach consultant for DealScale, crafting personalised emails to property-owners.</role>
  <task>Send a 2-step email sequence to a prospect with property information and an off-market offer value proposition.</task>
  <let>
    {{prospectFirstName}} = prospect.firstName
    {{agentName}} = user.name
    {{propertyAddress}} = lead.propertyAddress
    {{location}} = lead.location
    {{ownerTimeInProperty}} = lead.ownerTimeInProperty
  </let>

  <email-#1>
    <subject>Owners in {{location}} are getting off-market offers — is your property next?</subject>
    <body>
      Hi {{prospectFirstName}},

      I hope your week's going well. I'm {{agentName}} with DealScale — we specialise in helping property-owners in {{location}} who've held their homes for {{ownerTimeInProperty}} + years. Because you own {{propertyAddress}}, I wanted to see if you'd consider a no-listing, off-market exit option.

      If you're open to a quick 10-minute call, I'll share what similar homes in your neighborhood are currently selling for — no obligation.

      Best,
      {{agentName}}
    </body>
  </email-#1>

  <email-#2>
    <subject>How much equity you might have in {{propertyAddress}}</subject>
    <body>
      Hi {{prospectFirstName}},

      Here's a quick snapshot: Homes like yours in {{location}} with similar ownership duration just sold for ~$xxx,xxx above asking in under 30 days.

      If you'd like, I can prepare a free personalized off-market value estimate for your property. Would you like me to send it?

      Regards,
      {{agentName}}
    </body>
  </email-#2>

  <output-format>
    Provide which email was sent (1 or 2) and track open/reply status.
  </output-format>
</poml>`,
	},
];

// * Campaign Creation Store for multi-step modal context
export interface CampaignCreationState {
	// Step 1: Channel Selection
	primaryChannel: "directmail" | "call" | "text" | "email" | "social" | null;
	setPrimaryChannel: (
		channel: "directmail" | "call" | "text" | "email" | "social",
	) => void;

	// Campaign Name
	campaignName: string;
	setCampaignName: (name: string) => void;

	// Agent Selection
	selectedAgentId: string | null;
	setSelectedAgentId: (id: string | null) => void;
	availableAgents: Agent[];
	setAvailableAgents: (agents: Agent[]) => void;

	selectedWorkflowId: string | null;
	setSelectedWorkflowId: (id: string | null) => void;
	availableWorkflows: WorkflowOption[];
	setAvailableWorkflows: (workflows: WorkflowOption[]) => void;

	selectedSalesScriptId: string | null;
	setSelectedSalesScriptId: (id: string | null) => void;
	availableSalesScripts: SalesScriptOption[];
	setAvailableSalesScripts: (scripts: SalesScriptOption[]) => void;

	// Campaign Goal (Finalize step prefill)
	campaignGoal: string;
	setCampaignGoal: (goal: string) => void;

	// Voicemail selection (UI + presets)
	preferredVoicemailMessageId: string; // e.g., vm_professional, vm_friendly
	setPreferredVoicemailMessageId: (id: string) => void;
	preferredVoicemailVoiceId: string; // e.g., voice_emma, voice_paul
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
	/** If true, append the selected agent name to the signature */
	smsAppendAgentName: boolean;
	setSmsAppendAgentName: (v: boolean) => void;
	/** Preferred media sourcing for text messaging */
	smsMediaSource: "ai" | "stock" | "hybrid";
	setSmsMediaSource: (v: "ai" | "stock" | "hybrid") => void;

	// Step 2: Area & Lead List
	areaMode: "zip" | "leadList";
	setAreaMode: (mode: "zip" | "leadList") => void;
	selectedLeadListId: string;
	setSelectedLeadListId: (id: string) => void;
	// A/B testing for lead lists
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
	// Dial attempt preferences per day
	minDailyAttempts: number;
	setMinDailyAttempts: (v: number) => void;
	maxDailyAttempts: number;
	setMaxDailyAttempts: (v: number) => void;
	countVoicemailAsAnswered: boolean;
	setCountVoicemailAsAnswered: (v: boolean) => void;

	// TCPA and Voicemail preferences
	tcpaNotOptedIn: boolean;
	setTcpaNotOptedIn: (v: boolean) => void;
	doVoicemailDrops: boolean;
	setDoVoicemailDrops: (v: boolean) => void;

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

export const useCampaignCreationStore =
	createWithEqualityFn<CampaignCreationState>(
		withAnalytics<CampaignCreationState>("campaign_creation", (set, get) => ({
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

			selectedWorkflowId: null,
			setSelectedWorkflowId: (selectedWorkflowId) =>
				set({ selectedWorkflowId }),
			availableWorkflows: MOCK_WORKFLOWS,
			setAvailableWorkflows: (availableWorkflows) =>
				set({ availableWorkflows }),

			selectedSalesScriptId: null,
			setSelectedSalesScriptId: (selectedSalesScriptId) =>
				set({ selectedSalesScriptId }),
			availableSalesScripts: MOCK_SALES_SCRIPTS,
			setAvailableSalesScripts: (availableSalesScripts) =>
				set({ availableSalesScripts }),

			// Campaign Goal default/draft
			campaignGoal: "",
			setCampaignGoal: (campaignGoal) => set({ campaignGoal }),

			// Voicemail selection
			preferredVoicemailMessageId: "",
			setPreferredVoicemailMessageId: (preferredVoicemailMessageId) =>
				set({ preferredVoicemailMessageId }),
			preferredVoicemailVoiceId: "",
			setPreferredVoicemailVoiceId: (preferredVoicemailVoiceId) =>
				set({ preferredVoicemailVoiceId }),

			// Text/SMS settings
			textSignature: "",
			setTextSignature: (textSignature) => set({ textSignature }),
			smsCanSendImages: true,
			setSmsCanSendImages: (smsCanSendImages) => set({ smsCanSendImages }),
			smsCanSendVideos: true,
			setSmsCanSendVideos: (smsCanSendVideos) => set({ smsCanSendVideos }),
			smsCanSendLinks: true,
			setSmsCanSendLinks: (smsCanSendLinks) => set({ smsCanSendLinks }),
			smsAppendAgentName: true,
			setSmsAppendAgentName: (smsAppendAgentName) =>
				set({ smsAppendAgentName }),
			smsMediaSource: "hybrid",
			setSmsMediaSource: (smsMediaSource) => set({ smsMediaSource }),

			// Step 2: Area & Lead List
			areaMode: "leadList",
			setAreaMode: (areaMode) => set({ areaMode }),
			selectedLeadListId: "",
			setSelectedLeadListId: (selectedLeadListId) =>
				set({ selectedLeadListId }),
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
			setReachAfterBusiness: (reachAfterBusiness) =>
				set({ reachAfterBusiness }),
			reachOnWeekend: false,
			setReachOnWeekend: (reachOnWeekend) => set({ reachOnWeekend }),
			reachOnHolidays: false,
			setReachOnHolidays: (reachOnHolidays) => set({ reachOnHolidays }),
			// Dial attempt preferences
			minDailyAttempts: 1,
			setMinDailyAttempts: (minDailyAttempts) => set({ minDailyAttempts }),
			maxDailyAttempts: 3,
			setMaxDailyAttempts: (maxDailyAttempts) => set({ maxDailyAttempts }),
			countVoicemailAsAnswered: false,
			setCountVoicemailAsAnswered: (countVoicemailAsAnswered) =>
				set({ countVoicemailAsAnswered }),

			// TCPA and Voicemail preferences
			tcpaNotOptedIn: false,
			setTcpaNotOptedIn: (tcpaNotOptedIn) => set({ tcpaNotOptedIn }),
			doVoicemailDrops: false,
			setDoVoicemailDrops: (doVoicemailDrops) => set({ doVoicemailDrops }),

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
					case "random": {
						chosen = eligible[Math.floor(Math.random() * eligible.length)];
						break;
					}
					case "sticky_by_lead": {
						if (leadKey) {
							// Simple stable mapping: hash leadKey to index
							let hash = 0;
							for (let i = 0; i < leadKey.length; i++)
								hash = (hash * 31 + leadKey.charCodeAt(i)) >>> 0;
							chosen = eligible[hash % eligible.length];
							break;
						}
						// No leadKey provided; fall back to round-robin logic explicitly (no switch fallthrough)
						chosen = eligible.reduce((a, b) =>
							(usage[a] || 0) <= (usage[b] || 0) ? a : b,
						);
						break;
					}
					case "round_robin": {
						// pick the number with the least usage
						chosen = eligible.reduce((a, b) =>
							(usage[a] || 0) <= (usage[b] || 0) ? a : b,
						);
						break;
					}
					default: {
						// default to least-used number when strategy is unrecognized
						chosen = eligible.reduce((a, b) =>
							(usage[a] || 0) <= (usage[b] || 0) ? a : b,
						);
						break;
					}
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

					selectedWorkflowId: null,
					availableWorkflows: MOCK_WORKFLOWS,

					selectedSalesScriptId: null,
					availableSalesScripts: MOCK_SALES_SCRIPTS,
					campaignGoal: "",
					preferredVoicemailMessageId: "",
					preferredVoicemailVoiceId: "",
					textSignature: "",
					smsCanSendImages: true,
					smsCanSendVideos: true,
					smsCanSendLinks: true,
					smsAppendAgentName: true,
					smsMediaSource: "hybrid",

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
					reachBeforeBusiness: false,
					reachAfterBusiness: false,
					reachOnWeekend: false,
					reachOnHolidays: false,
					minDailyAttempts: 1,
					maxDailyAttempts: 3,
					countVoicemailAsAnswered: false,
					tcpaNotOptedIn: false,
					doVoicemailDrops: false,
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
		})),
	);
