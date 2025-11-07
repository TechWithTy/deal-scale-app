export interface OAuthService {
	name: string;
	oauthType: string;
	component: React.ElementType;
	required: boolean;
}
// Define an interface for the OAuth data
export interface OAuthData {
	accessToken: string;
	refreshToken?: string;
	expiresIn: number;
	tokenType: string;
	scope: string;
	[key: string]: unknown; // To allow additional properties if needed
}

export interface FacebookOAuthData extends OAuthData {
	profileId: string; // Facebook-specific field
	pageId?: string; // Optional Facebook Page ID
}

export interface LinkedInOAuthData extends OAuthData {
	id: string; // LinkedIn-specific field
	companyId?: string; // Optional LinkedIn company ID
}

export interface InstagramOAuthData extends OAuthData {
	id: string; // Instagram-specific field
	username: string; // Instagram username
}

export interface TwitterOAuthData extends OAuthData {
	id: string; // Twitter-specific field
	handle: string; // Twitter handle (e.g., @username)
}

export interface GoHighLevelOAuthData extends OAuthData {
	locationId: string; // GoHighLevel location ID
	companyId?: string; // Optional company ID
	userId?: string; // Optional user ID
}

export interface LoftyCRMOAuthData extends OAuthData {
	accountId: string; // Lofty CRM account ID
	teamId?: string; // Optional team ID
	agentId?: string; // Optional agent ID
}

export interface N8nOAuthData extends OAuthData {
	instanceUrl: string; // n8n instance URL
	workflowId?: string; // Optional workflow ID
	webhookUrl?: string; // Optional webhook URL
}

export interface DiscordOAuthData extends OAuthData {
	userId: string; // Discord user ID
	username: string; // Discord username
	discriminator?: string; // Discord discriminator (legacy, may be "0")
	guildId?: string; // Optional Discord server/guild ID
	botToken?: string; // Optional bot token for advanced integrations
}

export interface KestraOAuthData extends OAuthData {
	tenantId: string; // Kestra tenant ID
	namespaceId?: string; // Optional namespace ID
	apiEndpoint: string; // Kestra API endpoint URL
	workflowTemplateId?: string; // Optional workflow template ID
}
