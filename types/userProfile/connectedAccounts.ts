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
