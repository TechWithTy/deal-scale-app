import type {
	FacebookOAuthData,
	InstagramOAuthData,
	LinkedInOAuthData,
	TwitterOAuthData,
} from "@/types/userProfile/connectedAccounts";
import { faker } from "@faker-js/faker";

export const generateFacebookOAuthData = (): FacebookOAuthData => ({
	accessToken: faker.string.alphanumeric(32), // Fake access token
	refreshToken: faker.string.alphanumeric(32), // Fake refresh token
	expiresIn: faker.number.int({ min: 3600, max: 7200 }), // Token expiry in seconds
	tokenType: "Bearer", // Standard token type
	scope: "public_profile,email", // OAuth scope
	profileId: faker.string.uuid(), // Facebook user profile ID
	pageId: faker.helpers.maybe(() => faker.string.uuid()), // Optional Page ID
});

export const generateLinkedInOAuthData = (): LinkedInOAuthData => ({
	accessToken: faker.string.alphanumeric(32),
	refreshToken: faker.string.alphanumeric(32),
	expiresIn: faker.number.int({ min: 3600, max: 7200 }),
	tokenType: "Bearer",
	scope: "r_liteprofile,r_emailaddress", // LinkedIn-specific scopes
	id: faker.string.uuid(), // LinkedIn user ID
	companyId: faker.helpers.maybe(() => faker.string.uuid()), // Optional company ID
});

export const generateInstagramOAuthData = (): InstagramOAuthData => ({
	accessToken: faker.string.alphanumeric(32),
	refreshToken: faker.string.alphanumeric(32),
	expiresIn: faker.number.int({ min: 3600, max: 7200 }),
	tokenType: "Bearer",
	scope: "user_profile,user_media", // Instagram-specific scopes
	id: faker.string.uuid(), // Instagram user ID
	username: faker.internet.username(), // Instagram username
});

export const generateTwitterOAuthData = (): TwitterOAuthData => ({
	accessToken: faker.string.alphanumeric(32),
	refreshToken: faker.string.alphanumeric(32),
	expiresIn: faker.number.int({ min: 3600, max: 7200 }),
	tokenType: "Bearer",
	scope: "read,write", // Twitter-specific scopes
	id: faker.string.uuid(), // Twitter user ID
	handle: `@${faker.internet.username()}`, // Twitter handle
});
