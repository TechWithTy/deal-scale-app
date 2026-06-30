import {
	type PublicApiLoginResponse,
	type PublicApiProspectingSearchParams,
	type PublicApiProspectingSearchResponse,
	type PublicApiProspectingSourcesResponse,
	type PublicApiRequestOptions,
	type PublicApiSignupRequest,
	type PublicApiUser,
	publicApiFetch,
} from "@/lib/api/public-api-client";

const DEFAULT_API_BASE_URL = "https://api.dealscale.io";

export function getPublicApiBaseUrl() {
	return (
		process.env.DEAL_SCALE_API_BASE_URL ||
		process.env.NEXT_PUBLIC_DEAL_SCALE_API_BASE_URL ||
		DEFAULT_API_BASE_URL
	).replace(/\/+$/, "");
}

function absolutePublicApiPath(pathname: string) {
	if (/^https?:\/\//i.test(pathname)) {
		return pathname;
	}
	return `${getPublicApiBaseUrl()}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function publicApiServerFetch<T>(
	pathname: string,
	options: PublicApiRequestOptions = {},
) {
	return publicApiFetch<T>(absolutePublicApiPath(pathname), options);
}

export function loginPublicApiServer(email: string, password: string) {
	return publicApiServerFetch<PublicApiLoginResponse>("/api/v1/auth/login", {
		body: { email, password },
		method: "POST",
	});
}

export function signupPublicApiServer(body: PublicApiSignupRequest) {
	return publicApiServerFetch<PublicApiLoginResponse>("/api/v1/auth/signup", {
		body,
		method: "POST",
	});
}

export function logoutPublicApiServer(token?: string) {
	return publicApiServerFetch<{ message?: string; success?: boolean }>(
		"/api/v1/auth/logout",
		{ method: "POST", token },
	);
}

export function getCurrentUserProfileServer(token?: string) {
	return publicApiServerFetch<PublicApiUser>("/api/v1/auth/me", { token });
}

export function getProspectingSourcesServer(token?: string) {
	return publicApiServerFetch<PublicApiProspectingSourcesResponse>(
		"/api/v1/prospecting/sources",
		{ token },
	);
}

export function searchProspectingServer(
	params: PublicApiProspectingSearchParams,
	token?: string,
) {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null || value === "") {
			continue;
		}
		search.set(key, String(value));
	}

	return publicApiServerFetch<PublicApiProspectingSearchResponse>(
		`/api/v1/prospecting/search?${search.toString()}`,
		{ token },
	);
}
