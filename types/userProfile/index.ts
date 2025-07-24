import type VoiceClone from "@/public/lottie/RecordingButton.json";
import type { GetSubAccountPathParams } from "@/types/goHighLevel/subAccounts";
import type {
	BillingHistoryItem,
	PaymentDetails,
} from "../../constants/_faker/profile/userData";
import type { UserProfileSubscription } from "../../constants/_faker/profile/userSubscription";
import type { CallCampaign, SocialMediaCampaign } from "../_dashboard/campaign";
import type { KanbanState, TaskTracking } from "../_dashboard/kanban";
import type { LeadList } from "../_dashboard/leadList";
import type { LeadTypeGlobal } from "../_dashboard/leads";
import type {
	EmailCampaign,
	EmailCampaignAnalytics,
} from "../goHighLevel/email";
import type {
	GHLTextMessageCampaign,
	TextMessageCampaignAnalytics,
} from "../goHighLevel/text";
import type { CallCampaignAnalytics } from "../vapiAi/api/calls/get";
import type {
	FacebookOAuthData,
	InstagramOAuthData,
	LinkedInOAuthData,
	OAuthData,
	TwitterOAuthData,
} from "./connectedAccounts";
import type { AssistantVoice } from "../vapiAi/api/assistant/create";
import type { VoiceResponse } from "../elevenLabs/api/voices";

type HexColor = `#${string}`;
export interface LeadPreferences {
	preferredLocation: string[]; // Array of preferred locations
	industry: string; // Preferred industry for leads
	minLeadQuality: number; // Minimum lead quality (1-100)
	maxBudget: number; // Maximum budget user is willing to spend on leads
}

// Saved Searches & Lead Lists
export interface SavedSearch {
	id: string; // Unique identifier for the saved search
	name: string; // Name of the saved search
	searchCriteria: Record<string, unknown>; // The filters/criteria applied for this saved search
	createdAt: Date; // Date the search was saved
	updatedAt: Date;
	priority?: boolean;
}

export interface Integration {
	platform: string; // Name of the platform, e.g., 'Salesforce', 'HubSpot'
	apiKey: string; // API key or credentials for integration
	status: "connected" | "disconnected"; // Integration status
}
// Two-Factor Authentication (2FA) Type
export interface TwoFactorAuth {
	methods: {
		sms: boolean; // SMS-based 2FA
		email: boolean; // Email-based 2FA
		authenticatorApp: boolean; // Authenticator app like Google Authenticator
	};
	isEnabled?: boolean;
	lastUpdatedAt?: Date; // Timestamp of the last update
}

// UserPermissions for team members
export interface UserPermissions {
	canGenerateLeads: boolean; // Whether the team member can generate leads
	canStartCampaigns: boolean; // Whether the team member can start campaigns
	canViewReports: boolean; // Whether the team member can view reports
	canManageTeam: boolean; // Whether the team member can manage other team members
	canManageSubscription: boolean; // Whether the team member can manage the subscription or billing
	canAccessAI: boolean; // Whether the team member can access AI-based tools
	canMoveCompanyTasks: boolean;
	canEditCompanyProfile: boolean; // Whether the team member can edit company profile information
}

export interface NotificationPreferences {
	emailNotifications: boolean; // Whether the user wants to receive email notifications
	smsNotifications: boolean; // Whether the user wants SMS notifications
	notifyForNewLeads: boolean; // Notify when new leads are available
	notifyForCampaignUpdates: boolean; // Notify when campaigns are updated
}
// Team Member Type
export interface TeamMember {
	id: string; // Unique identifier for the team member
	firstName: string;
	lastName: string;
	email: string;
	role: "admin" | "member"; // Roles for team members, can be extended with more roles
	permissions: UserPermissions; // UserPermissions granted to the team member
	NotificationPreferences?: NotificationPreferences;
	twoFactorAuth?: TwoFactorAuth;
	activityLog?: ActivityLog;
}

// Campaigns for Company
export interface CompanyCampaignsUserProfile {
	textCampaigns: GHLTextMessageCampaign[];
	emailCampaigns: EmailCampaign[];
	socialCampaigns: SocialMediaCampaign[];
	callCampaigns: CallCampaign[];
}

export interface ActivityLog {
	action: string; // Action performed, e.g., 'created', 'updated'
	timestamp: Date; // When the action was performed
	performedBy: string; // Who performed the action
	taskTracking: TaskTracking;
	userAgent?: string;
}

export interface SecuritySettings {
	lastLoginTime: Date | null; // Date of last login
	password: string;
	passwordUpdatedAt: Date | null; // When the password was last updated
}

export type CampaignAnalytics =
	| EmailCampaignAnalytics
	| TextMessageCampaignAnalytics
	| CallCampaignAnalytics;

// Company Info Type
export interface CompanyInfo {
	companyName: string;
	assets: {
		logo: string | File;
		favicon?: string | File;
		banner?: string | File;
		ghlAssets?: string[];
	};
	webhook?: string;
	socialMediaTags: string[];

	companyLogo: string | undefined;
	GHLID: GetSubAccountPathParams;
	campaigns: CompanyCampaignsUserProfile;
	forwardingNumber: string;
	outreachEmail: string;
	explainerVideo?: string;
	campaignAnalytics: CampaignAnalytics[]; // Array of analytics for user's campaigns
	leads: LeadTypeGlobal[];
	leadLists: LeadList[]; // Array of lead lists
	KanbanTasks: KanbanState;
}

// AI Knowledgebase Type

// Correct AIKnowledgebase interface with the 'background' property
export interface AIKnowledgebase {
	emailTemplate?: string; // Optional email field
	salesScript?: string; // Optional sales script field
	assignedAssistantID: string; // e.g., 'female', 'male', 'ai'
	assignedSquadID: string; // UUID for the assigned squad
	recordings: {
		customVoiceID: string;
		voiceClone?: {
			// Optional voice clone object
			audioFile: string; // Path to the audio file for the voice clone
			clonedVoiceID: string; // Unique identifier for the cloned voice
			clonedVoiceResponse?: VoiceResponse;
		};
		voiceCreation?: {
			// Optional voice creation object
			createdVoiceID: string; // Unique identifier for the created voice
			createdVoiceResponse?: VoiceResponse;
		};
		voicemailFile: string; // Path to the voicemail file
		voices: AssistantVoice[];
	};

	aiAvatar?: {
		// Optional AI avatar object
		avatarKandidFile: string; // Path to the Kandid avatar file
		avatarMotionFile: string; // Path to the avatar motion file
		videoDetails: {
			// Video details for the avatar
			title: string; // Title of the video
			description: string; // Description of the video
			ctaText: string; // Call-to-action text
			ctaLink: string; // Call-to-action URL link
		};
	};
	background?: {
		// Optional background object (fix here)
		backgroundVideoFile: string; // Path to the background video file
		backgroundMusic: string; // Path to the background music file
		colorScheme: {
			primaryColor: HexColor; // Primary color as a hex code
			secondaryColor: HexColor; // Secondary color as a hex code
			accentColor?: HexColor; // Optional accent color as a hex code
		};
	};
}

export interface UserProfile {
	id: string;
	userName?: string;
	subscription: UserProfileSubscription; // Subscription information
	firstName: string;
	lastName: string;
	email: string;
	personalNum: string;
	country: string;
	state: string;
	city: string;
	updatedAt: Date;
	createdAt: Date;

	connectedAccounts: {
		facebook?: FacebookOAuthData;
		instagram?: InstagramOAuthData;
		linkedIn?: LinkedInOAuthData;
		twitter?: TwitterOAuthData;
	}; // List of connected accounts
	// New fields
	leadPreferences: LeadPreferences; // Preferences for lead generation
	savedSearches: SavedSearch[]; // Array of saved searches
	notificationPreferences: NotificationPreferences; // User notification settings
	integrations: Integration[]; // Array of connected platforms for integration
	companyInfo: CompanyInfo;
	aIKnowledgebase: AIKnowledgebase;
	billingHistory: BillingHistoryItem[]; // Billing history records
	paymentDetails: PaymentDetails; // Payment details like card info
	twoFactorAuth: TwoFactorAuth; // 2FA information
	teamMembers: TeamMember[]; // List of team members with permissions
	activityLog?: ActivityLog[]; // Log of user activities
	securitySettings?: SecuritySettings; // Security settings such as last login
}
