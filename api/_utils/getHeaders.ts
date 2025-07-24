import type { AxiosRequestConfig } from "axios";
import axios from "axios";
export const BASE_URL = "https://services.leadconnectorhq.com";
export const API_VERSION = "2021-07-28";
export const AUTH_HEADER = "Authorization";

export const token = "your-agency-access-token";

export interface LocationTokenRequest {
	companyId: string;
	locationId: string;
}

export interface InstalledLocationsParams {
	appId: string;
	companyId: string;
	isInstalled?: boolean;
	limit?: number;
	onTrial?: boolean;
	planId?: string;
	query?: string;
	skip?: number;
}
export const clientCredentials: AccessTokenRequest = {
	client_id: "your-client-id",
	client_secret: "your-client-secret",
	grant_type: "authorization_code", // Now TypeScript knows this is the correct literal type
	code: "your-authorization-code",
	redirect_uri: "https://myapp.com/oauth/callback/gohighlevel",
};

export const installedLocationsParams: InstalledLocationsParams = {
	appId: "your-app-id",
	companyId: "your-company-id",
	limit: 20, // Use a number here
};
// Helper function to set up headers
export const getHeaders = (token: string): AxiosRequestConfig => ({
	headers: {
		[AUTH_HEADER]: `Bearer ${token}`,
		Version: API_VERSION,
		"Content-Type": "application/json",
	},
});

export interface AccessTokenRequest {
	client_id: string;
	client_secret: string;
	grant_type: "authorization_code" | "refresh_token";
	code?: string;
	refresh_token?: string;
	user_type?: "Company" | "Location";
	redirect_uri?: string;
}

export const getAccessToken = async (
	data: AccessTokenRequest,
): Promise<unknown> => {
	const url = `${BASE_URL}/oauth/token`;
	const response = await axios.post(url, data, {
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
	});
	return response.data;
};
