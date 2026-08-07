import { publicApiFetch } from "@/lib/api/public-api-client";
export type PublicApiSavedAssetScope = "organization" | "personal";
export type PublicApiSavedAssetType =
	| "campaign_template"
	| "saved_search"
	| "workflow_template";

export type PublicApiSavedAsset = {
	asset_type: PublicApiSavedAssetType;
	created_at: string;
	definition: Record<string, unknown>;
	description?: string | null;
	id: string;
	name: string;
	organization_id?: string;
	owner_id?: string;
	schema_version: number;
	scope: PublicApiSavedAssetScope;
	updated_at: string;
	version: number;
};

export type PublicApiSavedAssetsPage = {
	items?: PublicApiSavedAsset[];
	limit?: number;
	offset?: number;
	total?: number;
};

export type PublicApiSavedAssetInput = {
	definition: Record<string, unknown>;
	description?: string;
	name: string;
	scope?: PublicApiSavedAssetScope;
};

type SavedAssetRoute =
	| "campaign-templates"
	| "saved-searches"
	| "workflow-templates";

type SavedAssetParams = {
	limit?: number;
	offset?: number;
	scope?: PublicApiSavedAssetScope;
};

function withQuery(pathname: string, params?: SavedAssetParams) {
	if (!params) return pathname;
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined) continue;
		search.set(key, String(value));
	}
	const query = search.toString();
	return query ? `${pathname}?${query}` : pathname;
}

function routePath(route: SavedAssetRoute) {
	return `/api/v1/${route}`;
}

function idPath(route: SavedAssetRoute, id: string) {
	return `${routePath(route)}/${encodeURIComponent(id)}`;
}

function deletePath(route: SavedAssetRoute, id: string, version?: number) {
	const pathname = idPath(route, id);
	return typeof version === "number"
		? `${pathname}?version=${version}`
		: pathname;
}

export function listSavedSearches(params?: SavedAssetParams, token?: string) {
	return publicApiFetch<PublicApiSavedAssetsPage>(
		withQuery(routePath("saved-searches"), params),
		{ token },
	);
}

export function createSavedSearchPublicApi(
	body: PublicApiSavedAssetInput,
	token?: string,
) {
	return publicApiFetch<PublicApiSavedAsset>(routePath("saved-searches"), {
		body,
		method: "POST",
		token,
	});
}

export function updateSavedSearchPublicApi(
	id: string,
	body: Partial<PublicApiSavedAssetInput>,
	token?: string,
) {
	return publicApiFetch<PublicApiSavedAsset>(idPath("saved-searches", id), {
		body,
		method: "PATCH",
		token,
	});
}

export function deleteSavedSearchPublicApi(
	id: string,
	version?: number,
	token?: string,
) {
	return publicApiFetch<unknown>(deletePath("saved-searches", id, version), {
		method: "DELETE",
		token,
	});
}

export function listCampaignTemplates(
	params?: SavedAssetParams,
	token?: string,
) {
	return publicApiFetch<PublicApiSavedAssetsPage>(
		withQuery(routePath("campaign-templates"), params),
		{ token },
	);
}

export function createCampaignTemplatePublicApi(
	body: PublicApiSavedAssetInput,
	token?: string,
) {
	return publicApiFetch<PublicApiSavedAsset>(routePath("campaign-templates"), {
		body,
		method: "POST",
		token,
	});
}

export function updateCampaignTemplatePublicApi(
	id: string,
	body: Partial<PublicApiSavedAssetInput>,
	token?: string,
) {
	return publicApiFetch<PublicApiSavedAsset>(idPath("campaign-templates", id), {
		body,
		method: "PATCH",
		token,
	});
}

export function deleteCampaignTemplatePublicApi(
	id: string,
	version?: number,
	token?: string,
) {
	return publicApiFetch<unknown>(
		deletePath("campaign-templates", id, version),
		{
			method: "DELETE",
			token,
		},
	);
}

export function listWorkflowTemplates(
	params?: SavedAssetParams,
	token?: string,
) {
	return publicApiFetch<PublicApiSavedAssetsPage>(
		withQuery(routePath("workflow-templates"), params),
		{ token },
	);
}

export function createWorkflowTemplatePublicApi(
	body: PublicApiSavedAssetInput,
	token?: string,
) {
	return publicApiFetch<PublicApiSavedAsset>(routePath("workflow-templates"), {
		body,
		method: "POST",
		token,
	});
}

export function updateWorkflowTemplatePublicApi(
	id: string,
	body: Partial<PublicApiSavedAssetInput>,
	token?: string,
) {
	return publicApiFetch<PublicApiSavedAsset>(idPath("workflow-templates", id), {
		body,
		method: "PATCH",
		token,
	});
}

export function deleteWorkflowTemplatePublicApi(
	id: string,
	version?: number,
	token?: string,
) {
	return publicApiFetch<unknown>(
		deletePath("workflow-templates", id, version),
		{
			method: "DELETE",
			token,
		},
	);
}
