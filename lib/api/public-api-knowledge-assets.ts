import { publicApiFetch } from "@/lib/api/public-api-client";

export type PublicApiKnowledgeAssetType =
	| "email_knowledge"
	| "sales_script"
	| "voice_asset"
	| "voicemail_recording";

export type PublicApiKnowledgeAssetStatus =
	| "deleted"
	| "failed"
	| "processing"
	| "ready"
	| "uploaded";

export type PublicApiKnowledgeAssetScope = "organization" | "personal";

export type PublicApiKnowledgeAssetMetadata = {
	language?: string | null;
	provider_linked?: boolean;
	provider_metadata?: Record<string, boolean | number | string | null>;
	source?: string | null;
	tags?: string[];
};

export type PublicApiKnowledgeAsset = {
	asset_type: PublicApiKnowledgeAssetType;
	checksum_sha256?: string | null;
	created_at: string;
	description?: string | null;
	id: string;
	metadata: PublicApiKnowledgeAssetMetadata;
	mime_type: string;
	name: string;
	organization_id: string;
	original_filename?: string | null;
	owner_id: string;
	processing_error_code?: string | null;
	processing_error_message?: string | null;
	provider?: string | null;
	provider_resource_id?: string | null;
	schema_version: number;
	scope: PublicApiKnowledgeAssetScope;
	size_bytes: number;
	status: PublicApiKnowledgeAssetStatus;
	updated_at: string;
	version: number;
};

export type PublicApiKnowledgeAssetsPage = {
	items?: PublicApiKnowledgeAsset[];
	limit?: number;
	offset?: number;
	total?: number;
};

export type PublicApiKnowledgeAssetInput = {
	asset_type: PublicApiKnowledgeAssetType;
	checksum_sha256?: string;
	description?: string;
	metadata?: PublicApiKnowledgeAssetMetadata;
	mime_type: string;
	name: string;
	original_filename?: string;
	provider?: string;
	provider_resource_id?: string;
	schema_version?: number;
	scope?: PublicApiKnowledgeAssetScope;
	size_bytes?: number;
};

export type PublicApiKnowledgeAssetUpdate = {
	description?: string;
	metadata?: PublicApiKnowledgeAssetMetadata;
	name?: string;
	schema_version?: number;
	scope?: PublicApiKnowledgeAssetScope;
	status?: PublicApiKnowledgeAssetStatus;
	version: number;
};

type KnowledgeAssetParams = {
	asset_type?: PublicApiKnowledgeAssetType;
	limit?: number;
	offset?: number;
	scope?: PublicApiKnowledgeAssetScope;
	status?: PublicApiKnowledgeAssetStatus;
};

function withQuery(pathname: string, params?: KnowledgeAssetParams) {
	if (!params) return pathname;
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined) continue;
		search.set(key, String(value));
	}
	const query = search.toString();
	return query ? `${pathname}?${query}` : pathname;
}

function assetPath(assetId?: string) {
	return assetId
		? `/api/v1/knowledge-assets/${encodeURIComponent(assetId)}`
		: "/api/v1/knowledge-assets";
}

export function listKnowledgeAssets(
	params?: KnowledgeAssetParams,
	token?: string,
) {
	return publicApiFetch<PublicApiKnowledgeAssetsPage>(
		withQuery(assetPath(), params),
		{ token },
	);
}

export function createKnowledgeAsset(
	body: PublicApiKnowledgeAssetInput,
	token?: string,
) {
	return publicApiFetch<PublicApiKnowledgeAsset>(assetPath(), {
		body,
		method: "POST",
		token,
	});
}

export function getKnowledgeAsset(assetId: string, token?: string) {
	return publicApiFetch<PublicApiKnowledgeAsset>(assetPath(assetId), { token });
}

export function updateKnowledgeAsset(
	assetId: string,
	body: PublicApiKnowledgeAssetUpdate,
	token?: string,
) {
	return publicApiFetch<PublicApiKnowledgeAsset>(assetPath(assetId), {
		body,
		method: "PATCH",
		token,
	});
}

export function processKnowledgeAsset(
	assetId: string,
	version: number,
	token?: string,
) {
	return publicApiFetch<PublicApiKnowledgeAsset>(
		`${assetPath(assetId)}/process`,
		{ body: { version }, method: "POST", token },
	);
}

export function getKnowledgeAssetDownloadUrl(assetId: string, token?: string) {
	return publicApiFetch<{
		asset_id: string;
		download_url: string;
		expires_at: string;
	}>(`${assetPath(assetId)}/download-url`, { token });
}

export function deleteKnowledgeAsset(
	assetId: string,
	version: number,
	token?: string,
) {
	return publicApiFetch<unknown>(
		`${assetPath(assetId)}?version=${encodeURIComponent(String(version))}`,
		{ method: "DELETE", token },
	);
}
