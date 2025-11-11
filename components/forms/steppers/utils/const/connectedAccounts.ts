import type { UserProfile } from "@/types/userProfile";
import type {
	AppleHealthOAuthData,
	DaylioOAuthData,
	DiscordOAuthData,
	FacebookOAuthData,
	GoHighLevelOAuthData,
	InstagramOAuthData,
	KestraOAuthData,
	HabiticaOAuthData,
	LinkedInOAuthData,
	LoftyCRMOAuthData,
	MakeOAuthData,
	N8nOAuthData,
	SpotifyOAuthData,
	TwilioOAuthData,
	TwitterOAuthData,
} from "@/types/userProfile/connectedAccounts";

// CompanyInfo interface to include social media tags
export interface CompanyInfo {
	socialMediaTags?: string[]; // Tags associated with social media campaigns
}

// Interface for Initial OAuth Setup Data
export interface InitialOauthSetupData {
	connectedAccounts: {
		facebook?: FacebookOAuthData | null;
		instagram?: InstagramOAuthData | null;
		linkedIn?: LinkedInOAuthData | null;
		twitter?: TwitterOAuthData | null;
		goHighLevel?: GoHighLevelOAuthData | null;
		loftyCRM?: LoftyCRMOAuthData | null;
		n8n?: N8nOAuthData | null;
		discord?: DiscordOAuthData | null;
		kestra?: KestraOAuthData | null;
		spotify?: SpotifyOAuthData | null;
		twilio?: TwilioOAuthData | null;
		appleHealth?: AppleHealthOAuthData | null;
		daylio?: DaylioOAuthData | null;
		make?: MakeOAuthData | null;
		habitica?: HabiticaOAuthData | null;
	};
	socialMediaTags: string[]; // Social media tags associated with the company's campaigns
	aiProvider?: {
		primary: string;
		fallback: string;
		routing: string;
	};
}

// Function to extract both OAuth data and social media tags
export const extractOAuthDataFromUserProfile = (
	profile?: UserProfile, // Optional UserProfile type
): InitialOauthSetupData => {
	return {
		connectedAccounts: {
			facebook: profile?.connectedAccounts?.facebook || null,
			instagram: profile?.connectedAccounts?.instagram || null,
			twitter: profile?.connectedAccounts?.twitter || null,
			linkedIn: profile?.connectedAccounts?.linkedIn || null,
			goHighLevel: profile?.connectedAccounts?.goHighLevel || null,
			loftyCRM: profile?.connectedAccounts?.loftyCRM || null,
			n8n: profile?.connectedAccounts?.n8n || null,
			discord: profile?.connectedAccounts?.discord || null,
			kestra: profile?.connectedAccounts?.kestra || null,
			spotify: profile?.connectedAccounts?.spotify || null,
			twilio: profile?.connectedAccounts?.twilio || null,
			appleHealth: profile?.connectedAccounts?.appleHealth || null,
			daylio: profile?.connectedAccounts?.daylio || null,
			make: profile?.connectedAccounts?.make || null,
			habitica: profile?.connectedAccounts?.habitica || null,
		},
		socialMediaTags: profile?.companyInfo?.socialMediaTags || [],
		aiProvider: profile?.meta?.aiProvider as any,
	};
};
