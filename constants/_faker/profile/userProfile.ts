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
import { APP_TESTING_MODE, mockGeneratedLeads } from "@/constants/data";
import type {
	EmailCampaign,
	EmailCampaignAnalytics,
} from "@/types/goHighLevel/email";
import type {
	GHLTextMessageCampaign,
	TextMessageCampaignAnalytics,
} from "@/types/goHighLevel/text";
import type { AIKnowledgebase, UserProfile } from "@/types/userProfile";
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
	const safeTeamMembers = (
		Array.isArray(mockTeamMembers) ? mockTeamMembers : []
	) as unknown[];
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
			{
				id: faker.string.uuid(),
				name: "High-Quality Leads", // Static or faker.commerce.productName()
				searchCriteria: {
					quality: "high",
					location: faker.location.city(),
				},
				createdAt: faker.date.recent(),
				updatedAt: faker.date.recent(),
				priority: faker.datatype.boolean(),
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

		teamMembers: safeTeamMembers as any,

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
	};
};

export const mockUserProfile: UserProfile | false =
	APP_TESTING_MODE && generateMockUserProfile();

export const MockUserProfile: UserProfile | false = mockUserProfile;
