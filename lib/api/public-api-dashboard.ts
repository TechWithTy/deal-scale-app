import {
	type PublicApiRequestOptions,
	publicApiFetch,
} from "@/lib/api/public-api-client";

type QueryValue = boolean | number | string | undefined;
type QueryParams = Record<string, QueryValue>;

function withQuery(pathname: string, params?: QueryParams) {
	if (!params) return pathname;
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === "") continue;
		search.set(key, String(value));
	}
	const query = search.toString();
	return query ? `${pathname}?${query}` : pathname;
}

function withToken(token?: string): Pick<PublicApiRequestOptions, "token"> {
	return token ? { token } : {};
}

export function getCreditsBalance(token?: string) {
	return publicApiFetch<unknown>("/api/v1/credits/balance", withToken(token));
}
export function getCreditsHistory(params?: QueryParams, token?: string) {
	return publicApiFetch<unknown>(
		withQuery("/api/v1/credits/history", params),
		withToken(token),
	);
}
export function getCreditsStats(token?: string) {
	return publicApiFetch<unknown>("/api/v1/credits/stats", withToken(token));
}
export function getExpiringCredits(token?: string) {
	return publicApiFetch<unknown>("/api/v1/credits/expiring", withToken(token));
}
export function useCredits(body: unknown, token?: string) {
	return publicApiFetch<unknown>("/api/v1/credits/use", {
		body,
		method: "POST",
		token,
	});
}
export function transferCredits(body: unknown, token?: string) {
	return publicApiFetch<unknown>("/api/v1/credits/transfer", {
		body,
		method: "POST",
		token,
	});
}
export function createCampaign(body: unknown, token?: string) {
	return publicApiFetch<unknown>("/api/v1/campaigns/", {
		body,
		method: "POST",
		token,
	});
}
export function getCampaignStatus(campaignId: string, token?: string) {
	return publicApiFetch<unknown>(
		`/api/v1/campaigns/${encodeURIComponent(campaignId)}/status`,
		withToken(token),
	);
}
export function getTeamOrganization(token?: string) {
	return publicApiFetch<unknown>("/api/v1/team/organization", withToken(token));
}
export function updateTeamOrganization(body: unknown, token?: string) {
	return publicApiFetch<unknown>("/api/v1/team/organization", {
		body,
		method: "PATCH",
		token,
	});
}

export function getTeamMembers(token?: string) {
	return publicApiFetch<unknown>("/api/v1/team/members", withToken(token));
}

export function updateTeamMember(
	memberId: string,
	body: unknown,
	token?: string,
) {
	return publicApiFetch<unknown>(
		`/api/v1/team/members/${encodeURIComponent(memberId)}`,
		{ body, method: "PATCH", token },
	);
}

export function deleteTeamMember(memberId: string, token?: string) {
	return publicApiFetch<unknown>(
		`/api/v1/team/members/${encodeURIComponent(memberId)}`,
		{ method: "DELETE", token },
	);
}

export function getTeamInvites(token?: string) {
	return publicApiFetch<unknown>("/api/v1/team/invites", withToken(token));
}

export function createTeamInvite(body: unknown, token?: string) {
	return publicApiFetch<unknown>("/api/v1/team/invites", {
		body,
		method: "POST",
		token,
	});
}

export function acceptTeamInvite(body: unknown, token?: string) {
	return publicApiFetch<unknown>("/api/v1/team/invites/accept", {
		body,
		method: "POST",
		token,
	});
}

export function getTeamActivity(params?: QueryParams, token?: string) {
	return publicApiFetch<unknown>(
		withQuery("/api/v1/team/activity", params),
		withToken(token),
	);
}

export function searchAdminUsers(params?: QueryParams, token?: string) {
	return publicApiFetch<unknown>(
		withQuery("/api/v1/admin/users/search", params),
		withToken(token),
	);
}

export function adjustAdminUserCredits(
	userId: string,
	body: unknown,
	token?: string,
) {
	return publicApiFetch<unknown>(
		`/api/v1/admin/users/${encodeURIComponent(userId)}/adjust-credits`,
		{ body, method: "POST", token },
	);
}

export function retryAdminUserProvisioning(userId: string, token?: string) {
	return publicApiFetch<unknown>(
		`/api/v1/admin/users/${encodeURIComponent(userId)}/retry-provisioning`,
		{ method: "POST", token },
	);
}

export function impersonateAdminUser(userId: string, token?: string) {
	return publicApiFetch<unknown>(
		`/api/v1/admin/users/${encodeURIComponent(userId)}/impersonate`,
		{ method: "POST", token },
	);
}

export function endAdminUserImpersonation(userId: string, token?: string) {
	return publicApiFetch<unknown>(
		`/api/v1/admin/users/${encodeURIComponent(userId)}/end-impersonation`,
		{ method: "POST", token },
	);
}

export function getAdminUserLogs(userId: string, token?: string) {
	return publicApiFetch<unknown>(
		`/api/v1/admin/users/${encodeURIComponent(userId)}/logs`,
		withToken(token),
	);
}

export function getPaymentPricingTiers(token?: string) {
	return publicApiFetch<unknown>(
		"/api/v1/payments/pricing/tiers",
		withToken(token),
	);
}

export function getPaymentPricing(credits: number, token?: string) {
	return publicApiFetch<unknown>(
		`/api/v1/payments/pricing/${encodeURIComponent(String(credits))}`,
		withToken(token),
	);
}

export function getPaymentBalances(token?: string) {
	return publicApiFetch<unknown>("/api/v1/payments/balances", withToken(token));
}

export function createPaymentCheckout(body: unknown, token?: string) {
	return publicApiFetch<unknown>("/api/v1/payments/checkout", {
		body,
		method: "POST",
		token,
	});
}

export function getCart(token?: string) {
	return publicApiFetch<unknown>("/api/v1/cart", withToken(token));
}

export function clearCart(token?: string) {
	return publicApiFetch<unknown>("/api/v1/cart", { method: "DELETE", token });
}

export function getCartProducts(token?: string) {
	return publicApiFetch<unknown>("/api/v1/cart/products", withToken(token));
}

export function addCartItem(body: unknown, token?: string) {
	return publicApiFetch<unknown>("/api/v1/cart/items", {
		body,
		method: "POST",
		token,
	});
}

export function updateCartItem(itemId: string, body: unknown, token?: string) {
	return publicApiFetch<unknown>(
		`/api/v1/cart/items/${encodeURIComponent(itemId)}`,
		{ body, method: "PUT", token },
	);
}

export function deleteCartItem(itemId: string, token?: string) {
	return publicApiFetch<unknown>(
		`/api/v1/cart/items/${encodeURIComponent(itemId)}`,
		{ method: "DELETE", token },
	);
}

export function checkoutCart(body: unknown, token?: string) {
	return publicApiFetch<unknown>("/api/v1/cart/checkout", {
		body,
		method: "POST",
		token,
	});
}

export function getCartCheckoutStatus(
	checkoutSessionId: string,
	token?: string,
) {
	return publicApiFetch<unknown>(
		`/api/v1/cart/checkout/${encodeURIComponent(checkoutSessionId)}/status`,
		withToken(token),
	);
}
