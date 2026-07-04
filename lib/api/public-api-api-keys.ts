import { publicApiFetch } from "@/lib/api/public-api-client";

export type PublicApiScope = {
	description?: string;
	scope: string;
};

export type PublicApiScopesResponse = {
	description?: string;
	scopes?: PublicApiScope[];
	user_default_scopes?: string[];
};

export type PublicApiKeyListItem = {
	created_at?: string | null;
	expires_at?: string | null;
	id?: string;
	is_active?: boolean;
	key_id?: string;
	key_prefix?: string;
	last_used_at?: string | null;
	metadata?: Record<string, unknown>;
	name?: string;
	scopes?: string[];
};

export type PublicApiKeyCreateResponse = {
	api_key?: string;
	expires_at?: string | null;
	key_id?: string;
	name?: string;
	scopes?: string[];
	warning?: string;
};

export function getApiKeyScopes(token?: string) {
	return publicApiFetch<PublicApiScopesResponse>("/api/v1/api-keys/scopes", {
		token,
	});
}

export function listApiKeys(token?: string) {
	return publicApiFetch<PublicApiKeyListItem[]>("/api/v1/api-keys/", {
		token,
	});
}

export function createApiKey(
	body: { name: string; scopes: string[]; expires_at?: string | null },
	token?: string,
) {
	return publicApiFetch<PublicApiKeyCreateResponse>("/api/v1/api-keys/", {
		body,
		method: "POST",
		token,
	});
}

export function revokeApiKey(keyId: string, token?: string) {
	return publicApiFetch<unknown>(
		`/api/v1/api-keys/${encodeURIComponent(keyId)}`,
		{
			method: "DELETE",
			token,
		},
	);
}
