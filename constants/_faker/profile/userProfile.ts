import { mockCallCampaignAnalytics } from "@/constants/_faker/analytics/call";
import { mockEmailCampaignAnalytics } from "@/constants/_faker/analytics/email";
import { mockTextMessageCampaignAnalytics } from "@/constants/_faker/analytics/text";
import { mockCallCampaignData } from "@/constants/_faker/calls/callCampaign";
import { mockGeneratedSampleEmailCampaigns } from "@/constants/_faker/emails/emailCampaign";
import {
	mockBillingHistory,
	mockPaymentDetails,
} from "@/constants/_faker/profile/userData";
import { mockSocialMediaCampaigns } from "@/constants/_faker/social/socialCampaigns";
import { mockTextCampaigns } from "@/constants/_faker/texts/textCampaign";
import { mockLeadListData } from "@/constants/dashboard/leadList";
import {
	NEXT_PUBLIC_APP_TESTING_MODE,
	mockGeneratedLeads,
} from "@/constants/data";
import type {
	EmailCampaign,
	EmailCampaignAnalytics,
} from "@/types/goHighLevel/email";
import type {
	GHLTextMessageCampaign,
	TextMessageCampaignAnalytics,
} from "@/types/goHighLevel/text";
import type {
	AIKnowledgebase,
	TeamMember,
	UserProfile,
} from "@/types/userProfile";
import type { UserProfileSubscription } from "./userSubscription";
import type { CallCampaignAnalytics } from "@/types/vapiAi/api/calls/get";
import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import type { LeadList } from "@/types/_dashboard/leadList";
import type {
	CallCampaign,
	SocialMediaCampaign,
} from "@/types/_dashboard/campaign";
import { faker } from "@faker-js/faker"; // Import Faker.js for random data generation
import { generateKanbanState, mockKanbanState } from "../kanban";
import { mockTeamMembers } from "./team/members";
import { generateTaskTracking, mockTrackingData } from "./team/tasks";
import { mockSubscriptions } from "./userSubscription";
import { generateMockAssistantVoice } from "../_api/vapi/assistant";
import { generateConnectedAccounts } from "./connectedAccounts";

// Updated aIKnowledgebase object with Faker.js dynamic values

// Example object adhering to AIKnowledgebase interface with Faker.js data
const aIKnowledgebase: AIKnowledgebase = {
	emailTemplate: "../../staticFiles/email-inlined.html", // Static or faker.lorem.sentence()
	salesScript: "../../staticFiles/voiceCloneScript.txt", // Static or faker.lorem.sentence()
	assignedAssistantID: faker.helpers.arrayElement(["ai", "female", "male"]), // Randomly chosen from the array
	assignedSquadID: faker.string.uuid(), // Random UUID for the assigned squad
	preferredProvider: faker.helpers.arrayElement([
		"openai",
		"claude",
		"gemini",
		"dealscale",
	]),

	recordings: {
		customVoiceID: faker.string.uuid(),
		voiceClone: {
			audioFile: faker.system.filePath(), // Path to cloned voice audio file (generated dynamically)
			clonedVoiceID: faker.string.uuid(), // Unique ID for the cloned voice
		},
		voices: Array.from({ length: 3 }, generateMockAssistantVoice),
		voicemailFile: faker.system.filePath(), // Path to voicemail audio file (generated dynamically)
	},

	aiAvatar: {
		avatarKandidFile: faker.system.filePath(), // Path to Kandid avatar file (generated dynamically)
		avatarMotionFile: faker.system.filePath(), // Path to avatar motion file (generated dynamically)
		videoDetails: {
			title: faker.lorem.words(3), // Example video title
			description: faker.lorem.sentence(), // Example video description
			ctaText: "Click here", // Call-to-action text (static value)
			ctaLink: faker.internet.url(), // Example call-to-action URL link
		},
	},

	background: {
		// Correctly added 'background' at the root level
		backgroundVideoFile: faker.system.filePath(), // Path to background video file
		backgroundMusic: faker.music.songName(), // Random song name from Faker.js
		colorScheme: {
			primaryColor: "#FF5733", // Example hex color for primary color
			secondaryColor: "#33FF57", // Example hex color for secondary color
			accentColor: "#5733FF", // Optional accent color in hex format
		},
	},
};

// connected accounts will be generated lazily inside generateMockUserProfile
const fallbackSubscription: UserProfileSubscription = {
	id: "0",
	stripeSubscriptionID: "",
	name: "None",
	type: "monthly",
	status: "inactive",
	price: "$0",
	aiCredits: { allotted: 0, used: 0, resetInDays: 0 },
	leads: { allotted: 0, used: 0, resetInDays: 0 },
	skipTraces: { allotted: 0, used: 0, resetInDays: 0 },
	renewalDate: "",
	createdAt: "",
	planDetails: "",
};

export const generateMockUserProfile = (): UserProfile => {
	const subs = (
		Array.isArray(mockSubscriptions) ? mockSubscriptions : []
	) as UserProfileSubscription[];
	const subscription = subs[1] ?? subs[0] ?? fallbackSubscription;

	const safeLeads = (
		Array.isArray(mockGeneratedLeads) ? mockGeneratedLeads : []
	) as LeadTypeGlobal[];
	const safeLeadLists = (
		Array.isArray(mockLeadListData) ? mockLeadListData : []
	) as LeadList[];
	const safeTextCampaigns = (
		Array.isArray(mockTextCampaigns) ? mockTextCampaigns : []
	) as GHLTextMessageCampaign[];
	const safeEmailCampaigns = (
		Array.isArray(mockGeneratedSampleEmailCampaigns)
			? mockGeneratedSampleEmailCampaigns
			: []
	) as EmailCampaign[];
	const safeSocialCampaigns = (
		Array.isArray(mockSocialMediaCampaigns) ? mockSocialMediaCampaigns : []
	) as SocialMediaCampaign[];
	const safeCallCampaigns = (
		Array.isArray(mockCallCampaignData) ? mockCallCampaignData : []
	) as CallCampaign[];
	const safeTeamMembers: TeamMember[] = Array.isArray(mockTeamMembers)
		? mockTeamMembers
		: [];
	const safeKanban = mockKanbanState || generateKanbanState(0);
	const safeTracking = mockTrackingData || generateTaskTracking(0);
	const analytics = [
		mockCallCampaignAnalytics,
		mockTextMessageCampaignAnalytics,
		mockEmailCampaignAnalytics,
	].filter(Boolean) as (
		| EmailCampaignAnalytics
		| CallCampaignAnalytics
		| TextMessageCampaignAnalytics
	)[];

	const connectedAccounts = generateConnectedAccounts();

	// Mocking a user profile with Faker.js
	return {
		id: faker.string.uuid(), // Generates a UUID, // Generate unique ID
		subscription: subscription,
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
		email: faker.internet.email(),
		state: faker.location.state(),
		city: faker.location.city(),
		createdAt: faker.date.past(),
		updatedAt: faker.date.recent(),
		country: faker.location.country(),
		personalNum: "3325436201",
		connectedAccounts: connectedAccounts,
		leadPreferences: {
			preferredLocation: [faker.location.city(), faker.location.city()],
			industry: "Real Estate", // Static or use faker.commerce.department()
			minLeadQuality: faker.number.int({ min: 60, max: 100 }),
			maxBudget: faker.number.int({ min: 1000, max: 10000 }),
		},
		savedSearches: [
			// ⭐ PRIORITY 1: Real Estate Investors (High-Intent Buyers)
			{
				id: "lookalike_priority_1",
				name: "💰 Cash Investors - High Intent",
				searchCriteria: {},
				createdAt: new Date("2024-10-01"),
				updatedAt: new Date("2024-11-05"),
				priority: true, // ⭐ Favorited
				lookalikeConfig: {
					seedListId: safeLeadLists[0]?.id || "seed_investors_1",
					seedListName:
						safeLeadLists[0]?.listName || "Louisville - On Market / 3+ Beds",
					seedLeadCount: safeLeadLists[0]?.records || 720,
					similarityThreshold: 85,
					targetSize: 500,
					salesTargeting: {
						buyerPersona: ["investor"],
						motivationLevel: ["hot"],
						investmentExperience: "professional",
						budgetRange: {
							min: 100000,
							max: 2000000,
						},
						creditScoreRange: {
							min: 700,
						},
						cashBuyerOnly: true,
						portfolioSize: "20-50",
					},
					propertyFilters: {
						propertyTypes: ["single-family", "multi-family"],
						propertyStatus: ["off-market"],
						priceRange: {
							min: 75000,
							max: 750000,
						},
					},
					geoFilters: {
						states: ["FL", "TX", "AZ", "GA", "NC"],
					},
					generalOptions: {
						dncCompliance: true,
						tcpaOptInRequired: true,
						requirePhone: true,
						requireEmail: true,
						enrichmentLevel: "premium",
						enrichmentRequired: true,
					},
				},
			},
			// ⭐ PRIORITY 2: Wholesalers (Deal Hunters)
			{
				id: "lookalike_priority_2",
				name: "🏚️ Wholesalers - Distressed Properties",
				searchCriteria: {},
				createdAt: new Date("2024-10-05"),
				updatedAt: new Date("2024-11-04"),
				priority: true, // ⭐ Favorited
				lookalikeConfig: {
					seedListId: safeLeadLists[1]?.id || "seed_wholesalers_1",
					seedListName:
						safeLeadLists[1]?.listName ||
						"New York - Notice Of Default / Lis Pendens",
					seedLeadCount: safeLeadLists[1]?.records || 899,
					similarityThreshold: 75,
					targetSize: 1000,
					salesTargeting: {
						buyerPersona: ["wholesaler"],
						motivationLevel: ["hot", "warm"],
						purchaseTimeline: "0-3months",
						budgetRange: {
							min: 25000,
							max: 300000,
						},
						cashBuyerOnly: true,
					},
					propertyFilters: {
						propertyTypes: ["single-family", "multi-family"],
						propertyStatus: ["pre-foreclosure", "foreclosure"],
						distressedSignals: ["pre-foreclosure", "tax-lien", "vacant"],
						equityPosition: ["<20%", "20-50%"],
						priceRange: {
							max: 300000,
						},
					},
					geoFilters: {
						states: ["OH", "MI", "IN", "PA", "IL"],
					},
					generalOptions: {
						dncCompliance: true,
						tcpaOptInRequired: true,
						requirePhone: true,
						enrichmentLevel: "hybrid",
					},
				},
			},
			// ⭐ PRIORITY 3: Agents & Brokers (Sphere Building)
			{
				id: "lookalike_priority_3",
				name: "🏡 Agents/Brokers - Sphere Expansion",
				searchCriteria: {},
				createdAt: new Date("2024-10-10"),
				updatedAt: new Date("2024-11-03"),
				priority: true, // ⭐ Favorited
				lookalikeConfig: {
					seedListId: safeLeadLists[2]?.id || "seed_agents_1",
					seedListName:
						safeLeadLists[2]?.listName ||
						"Seattle - Probate / Inheritance Only",
					seedLeadCount: safeLeadLists[2]?.records || 992,
					similarityThreshold: 70,
					targetSize: 2000,
					salesTargeting: {
						buyerPersona: ["agent", "owner-occupant"],
						motivationLevel: ["warm", "hot"],
						purchaseTimeline: "3-6months",
						budgetRange: {
							min: 200000,
							max: 800000,
						},
						creditScoreRange: {
							min: 650,
						},
					},
					propertyFilters: {
						propertyTypes: ["single-family", "condo"],
						propertyStatus: ["active", "off-market"],
						priceRange: {
							min: 200000,
							max: 800000,
						},
						bedrooms: {
							min: 3,
							max: 5,
						},
					},
					geoFilters: {
						states: ["WA", "OR", "CA", "CO", "TX"],
					},
					generalOptions: {
						dncCompliance: true,
						tcpaOptInRequired: true,
						requirePhone: true,
						requireEmail: true,
						enrichmentLevel: "premium",
						dataRecencyDays: 30,
					},
				},
			},
			{
				id: "lookalike_template_1",
				name: "🎯 High-Value Investors",
				searchCriteria: {},
				createdAt: new Date("2024-01-15"),
				updatedAt: new Date("2024-01-15"),
				priority: false,
				lookalikeConfig: {
					seedListId: safeLeadLists[0]?.id || "seed_default_1",
					seedListName:
						safeLeadLists[0]?.listName || "Louisville - On Market / 3+ Beds",
					seedLeadCount: safeLeadLists[0]?.records || 720,
					similarityThreshold: 85,
					targetSize: 500,
					salesTargeting: {
						buyerPersona: ["investor"],
						motivationLevel: ["hot"],
						investmentExperience: "experienced",
						budgetRange: {
							min: 100000,
							max: 1000000,
						},
						creditScoreRange: {
							min: 700,
						},
						cashBuyerOnly: true,
					},
					propertyFilters: {
						propertyTypes: ["single-family", "multi-family"],
						priceRange: {
							min: 50000,
							max: 500000,
						},
					},
					geoFilters: {},
					generalOptions: {
						dncCompliance: true,
						tcpaOptInRequired: true,
						requirePhone: true,
						enrichmentLevel: "premium",
						enrichmentRequired: true,
					},
				},
			},
			{
				id: "lookalike_template_2",
				name: "🏘️ Distressed Property Buyers",
				searchCriteria: {},
				createdAt: new Date("2024-01-20"),
				updatedAt: new Date("2024-01-20"),
				priority: false,
				lookalikeConfig: {
					seedListId: safeLeadLists[1]?.id || "seed_default_2",
					seedListName:
						safeLeadLists[1]?.listName || "New York - Notice Of Default",
					seedLeadCount: safeLeadLists[1]?.records || 899,
					similarityThreshold: 75,
					targetSize: 1000,
					salesTargeting: {
						buyerPersona: ["wholesaler"],
						motivationLevel: ["warm", "hot"],
						purchaseTimeline: "0-3months",
					},
					propertyFilters: {
						propertyTypes: ["single-family"],
						distressedSignals: [
							"pre-foreclosure",
							"tax-lien",
							"code-violation",
						],
						equityPosition: ["<20%", "20-50%"],
					},
					geoFilters: {},
					generalOptions: {
						dncCompliance: true,
						tcpaOptInRequired: true,
						requirePhone: true,
						enrichmentLevel: "none",
					},
				},
			},
			{
				id: "lookalike_template_3",
				name: "💰 First-Time Home Buyers",
				searchCriteria: {},
				createdAt: new Date("2024-02-01"),
				updatedAt: new Date("2024-02-01"),
				priority: false,
				lookalikeConfig: {
					seedListId: safeLeadLists[2]?.id || "seed_default_3",
					seedListName:
						safeLeadLists[2]?.listName ||
						"Seattle - Probate / Inheritance Only",
					seedLeadCount: safeLeadLists[2]?.records || 992,
					similarityThreshold: 70,
					targetSize: 2000,
					salesTargeting: {
						buyerPersona: ["owner-occupant"],
						motivationLevel: ["warm"],
						investmentExperience: "first-time",
						budgetRange: {
							min: 150000,
							max: 400000,
						},
						creditScoreRange: {
							min: 650,
						},
					},
					propertyFilters: {
						propertyTypes: ["single-family", "condo"],
						priceRange: {
							min: 150000,
							max: 400000,
						},
						bedrooms: {
							min: 2,
							max: 4,
						},
					},
					geoFilters: {},
					generalOptions: {
						dncCompliance: true,
						tcpaOptInRequired: true,
						requirePhone: true,
						enrichmentLevel: "premium",
						enrichmentRequired: true,
					},
				},
			},
			{
				id: "lookalike_template_4",
				name: "🏢 Commercial Real Estate Investors",
				searchCriteria: {},
				createdAt: new Date("2024-02-10"),
				updatedAt: new Date("2024-02-10"),
				priority: false,
				lookalikeConfig: {
					seedListId: safeLeadLists[3]?.id || "seed_default_4",
					seedListName:
						safeLeadLists[3]?.listName ||
						"Cleveland - 2+ Units / VA Or FHA Loan",
					seedLeadCount: safeLeadLists[3]?.records || 1100,
					similarityThreshold: 80,
					targetSize: 300,
					salesTargeting: {
						buyerPersona: ["investor"],
						motivationLevel: ["hot"],
						investmentExperience: "professional",
						budgetRange: {
							min: 500000,
						},
						cashBuyerOnly: true,
						portfolioSize: "50+",
					},
					propertyFilters: {
						propertyTypes: ["multi-family", "commercial"],
						priceRange: {
							min: 500000,
						},
					},
					geoFilters: {},
					generalOptions: {
						dncCompliance: true,
						tcpaOptInRequired: true,
						requirePhone: true,
						enrichmentLevel: "premium",
						enrichmentRequired: true,
					},
				},
			},
			{
				id: "lookalike_template_5",
				name: "🌴 Vacation Home Seekers",
				searchCriteria: {},
				createdAt: new Date("2024-02-15"),
				updatedAt: new Date("2024-02-15"),
				priority: false,
				lookalikeConfig: {
					seedListId: safeLeadLists[4]?.id || "seed_default_5",
					seedListName:
						safeLeadLists[4]?.listName || "Phoenix - Luxury Properties",
					seedLeadCount: safeLeadLists[4]?.records || 450,
					similarityThreshold: 75,
					targetSize: 750,
					salesTargeting: {
						buyerPersona: ["owner-occupant"],
						motivationLevel: ["warm"],
						budgetRange: {
							min: 250000,
							max: 800000,
						},
					},
					propertyFilters: {
						propertyTypes: ["single-family", "condo"],
						priceRange: {
							min: 250000,
							max: 800000,
						},
					},
					geoFilters: {
						states: ["FL", "CA", "AZ", "HI"],
					},
					generalOptions: {
						dncCompliance: true,
						tcpaOptInRequired: true,
						requirePhone: true,
						enrichmentLevel: "none",
					},
				},
			},
		],
		savedCampaignTemplates: [
			{
				id: faker.string.uuid(),
				name: "High Equity Investor Outreach",
				description:
					"AI-generated multi-channel campaign targeting high equity investors",
				campaignConfig: {
					channels: ["call", "sms", "email"],
					audience: {
						targetList: "High Equity Leads",
						filters: ["equityPercentage > 50", "location: California"],
					},
					messaging: {
						emailSubject: "Exclusive Investment Opportunity",
						emailBody: "We have an exclusive off-market property...",
						smsMessage: "Hi {{firstName}}, interested in {{propertyAddress}}?",
					},
					schedule: {
						startDate: faker.date.future(),
						endDate: faker.date.future(),
					},
					budget: 5000,
					aiPrompt:
						"Create a multi-channel campaign targeting high equity investors in California with personalized messaging focused on exclusive opportunities.",
					generatedByAI: true,
					aiSuggested: false,
				},
				priority: true,
				useCount: 12,
				createdAt: faker.date.past(),
				updatedAt: faker.date.recent(),
				monetization: {
					enabled: true,
					priceMultiplier: 2.5,
					isPublic: true,
					acceptedTerms: true,
				},
			},
			{
				id: faker.string.uuid(),
				name: "Absentee Owner Follow-Up",
				description: "Suggested campaign for re-engaging absentee owners",
				campaignConfig: {
					channels: ["sms", "call"],
					audience: {
						targetList: "Absentee Owners",
					},
					messaging: {},
					schedule: {},
					aiPrompt:
						"Create a follow-up campaign for absentee owners who showed initial interest",
					generatedByAI: false,
					aiSuggested: true,
				},
				priority: false,
				useCount: 5,
				createdAt: faker.date.past(),
				updatedAt: faker.date.past(),
				monetization: {
					enabled: false,
					priceMultiplier: 1.5,
					isPublic: false,
					acceptedTerms: true,
				},
			},
			{
				id: faker.string.uuid(),
				name: "Manual Wholesaler Outreach",
				description: "Custom manual campaign for wholesaler network",
				campaignConfig: {
					channels: ["call"],
					audience: {
						targetList: "Wholesaler Network",
					},
					messaging: {},
					schedule: {},
					generatedByAI: false,
					aiSuggested: false,
				},
				priority: false,
				useCount: 3,
				createdAt: faker.date.past(),
				updatedAt: faker.date.past(),
			},
		],
		workflowPlatforms: [
			{
				platform: "n8n",
				connected: true,
				instanceUrl: "https://n8n.example.com",
				connectedAt: faker.date.past(),
			},
			{
				platform: "make",
				connected: false,
			},
			{
				platform: "kestra",
				connected: false,
			},
		],
		savedWorkflows: [
			{
				id: faker.string.uuid(),
				name: "Lead Enrichment Pipeline",
				description:
					"AI-generated workflow for automated lead enrichment with skip trace",
				platform: "n8n",
				workflowConfig: {
					nodes: [
						{ id: "1", type: "webhook", name: "Lead Created Trigger" },
						{ id: "2", type: "function", name: "Enrich Lead Data" },
						{ id: "3", type: "webhook", name: "Update CRM" },
					],
					connections: [
						{ from: "1", to: "2" },
						{ from: "2", to: "3" },
					],
				},
				aiPrompt: `<poml version="1.0">
  <workflow name="Lead Enrichment Pipeline">
    <trigger type="webhook">
      <event>lead.created</event>
    </trigger>
    <phase name="enrichment">
      <task>{{enrichLead}} with premium data</task>
      <task>Validate email and phone</task>
    </phase>
    <phase name="notification">
      <task>{{sendWebhook}} to {{webhookUrl}}</task>
      <task>{{updateCRM}} with enriched data</task>
    </phase>
  </workflow>
</poml>`,
				generatedByAI: true,
				createdAt: faker.date.past(),
				updatedAt: faker.date.recent(),
				monetization: {
					enabled: true,
					priceMultiplier: 3,
					isPublic: true,
					acceptedTerms: true,
				},
			},
			{
				id: faker.string.uuid(),
				name: "Daily CRM Sync",
				description: "Suggested workflow for daily synchronization with CRM",
				platform: "n8n",
				workflowConfig: {
					nodes: [
						{ id: "1", type: "schedule", name: "Daily Trigger" },
						{ id: "2", type: "function", name: "Fetch Leads" },
						{ id: "3", type: "webhook", name: "Sync to CRM" },
					],
					connections: [
						{ from: "1", to: "2" },
						{ from: "2", to: "3" },
					],
				},
				aiPrompt:
					"Create a daily workflow to sync leads from DealScale to my CRM",
				generatedByAI: false,
				createdAt: faker.date.past(),
				updatedAt: faker.date.past(),
				monetization: {
					enabled: false,
					priceMultiplier: 1,
					isPublic: false,
					acceptedTerms: true,
				},
			},
			{
				id: faker.string.uuid(),
				name: "Campaign Activation Flow",
				description: "Manual workflow for campaign activation and tracking",
				platform: "n8n",
				workflowConfig: {
					nodes: [
						{ id: "1", type: "webhook", name: "Campaign Created" },
						{ id: "2", type: "function", name: "Build Audience" },
						{ id: "3", type: "function", name: "Launch Outreach" },
					],
					connections: [
						{ from: "1", to: "2" },
						{ from: "2", to: "3" },
					],
				},
				generatedByAI: false,
				createdAt: faker.date.past(),
				updatedAt: faker.date.past(),
			},
		],
		notificationPreferences: {
			emailNotifications: faker.datatype.boolean(),
			smsNotifications: faker.datatype.boolean(),
			notifyForNewLeads: faker.datatype.boolean(),
			notifyForCampaignUpdates: faker.datatype.boolean(),
		},
		integrations: [
			{
				platform: "Salesforce", // Static
				apiKey: faker.string.uuid(), // Random UUID
				status: faker.helpers.arrayElement(["connected", "disconnected"]), // Random status
			},
		],

		companyInfo: {
			companyName: faker.company.name(),
			webhook: faker.internet.url(),
			socialMediaTags: faker.lorem
				.words(3)
				.split(" ")
				.map((word) => `#${word}`),
			companyLogo: faker.image.avatarGitHub(), // Static, can be a URL or file path
			GHLID: { locationId: faker.string.uuid() }, // Random location ID
			assets: {
				logo: faker.image.avatar(), // Generates a random logo image URL (300x300 size)
				favicon: faker.image.urlLoremFlickr(), // Generates a random favicon image URL (64x64 size)
				banner: faker.image.urlLoremFlickr(), // Generates a random banner image URL (1200x300 size)
				ghlAssets: Array.from({ length: 5 }, () =>
					faker.image.urlLoremFlickr(),
				), // Generates an array of 5 random image URLs
			},

			campaigns: {
				textCampaigns: safeTextCampaigns,
				emailCampaigns: safeEmailCampaigns,
				socialCampaigns: safeSocialCampaigns,
				callCampaigns: safeCallCampaigns,
			},
			KanbanTasks: safeKanban,
			forwardingNumber: "3325436201",
			outreachEmail: faker.internet.email(),
			explainerVideo: faker.internet.url(),
			campaignAnalytics: [...analytics] as (
				| EmailCampaignAnalytics
				| CallCampaignAnalytics
				| TextMessageCampaignAnalytics
			)[],
			leads: safeLeads,
			leadLists: safeLeadLists, // Assuming lead lists are generated or static
		},

		aIKnowledgebase: aIKnowledgebase,

		billingHistory: [
			{
				invoice: faker.string.uuid(),
				amount: faker.finance.amount(),
				status: faker.helpers.arrayElement(["Paid", "Unpaid"]),
				date: faker.date.past(),
			},
		],
		paymentDetails: {
			cardLastFour: faker.finance.creditCardNumber().slice(-4), // Extracts the last 4 digits
			expiry: faker.date
				.future()
				.toLocaleDateString("en-US", { month: "2-digit", year: "2-digit" }), // Outputs in MM/YY format
			cardType: faker.finance.creditCardIssuer(), // Card issuer (Visa, MasterCard, etc.)
		},

		twoFactorAuth: {
			methods: {
				sms: faker.datatype.boolean(),
				email: faker.datatype.boolean(),
				authenticatorApp: faker.datatype.boolean(),
			},
		},

		teamMembers: safeTeamMembers,

		activityLog: [
			{
				action: faker.helpers.arrayElement(["created", "updated", "deleted"]),
				timestamp: faker.date.recent(),
				performedBy: faker.person.firstName(),
				taskTracking: safeTracking,
				userAgent: faker.system.networkInterface() + faker.internet.userAgent(),
			},
		],

		securitySettings: {
			lastLoginTime: faker.date.recent(),
			password: faker.string.uuid(),
			passwordUpdatedAt: faker.date.past(),
		},
		quickStartDefaults: {
			personaId: "investor",
			goalId: "investor-pipeline",
		},
	};
};

export const mockUserProfile: UserProfile | undefined =
	NEXT_PUBLIC_APP_TESTING_MODE ? generateMockUserProfile() : undefined;

export const MockUserProfile: UserProfile | undefined = mockUserProfile;
