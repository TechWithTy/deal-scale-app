"use client";

import {
	type PublicApiSavedAsset,
	createCampaignTemplatePublicApi,
	createSavedSearchPublicApi,
	createWorkflowTemplatePublicApi,
	deleteCampaignTemplatePublicApi,
	deleteSavedSearchPublicApi,
	deleteWorkflowTemplatePublicApi,
	updateCampaignTemplatePublicApi,
	updateSavedSearchPublicApi,
	updateWorkflowTemplatePublicApi,
} from "@/lib/api/public-api-saved-assets";
import type {
	SavedCampaignTemplate,
	SavedSearch,
	SavedWorkflow,
} from "@/types/userProfile";
import { useSessionStore } from "./useSessionStore";

export type AssetKind = "campaignTemplate" | "savedSearch" | "workflowTemplate";

const VERSION_STORAGE_KEY = "dealScale:publicApiSavedAssetVersions";

function getToken() {
	return useSessionStore.getState().publicApi?.accessToken;
}

function readVersions() {
	if (typeof window === "undefined") return {};
	try {
		return JSON.parse(
			window.localStorage.getItem(VERSION_STORAGE_KEY) ?? "{}",
		) as Record<string, number>;
	} catch {
		return {};
	}
}

function versionKey(kind: AssetKind, id: string) {
	return `${kind}:${id}`;
}

function getVersion(kind: AssetKind, id: string) {
	return readVersions()[versionKey(kind, id)];
}

function rememberVersion(kind: AssetKind, asset: PublicApiSavedAsset) {
	if (typeof window === "undefined") return;
	const versions = readVersions();
	versions[versionKey(kind, asset.id)] = asset.version;
	window.localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(versions));
}

function forgetVersion(kind: AssetKind, id: string) {
	if (typeof window === "undefined") return;
	const versions = readVersions();
	delete versions[versionKey(kind, id)];
	window.localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(versions));
}

function reportSavedAssetError(action: string, error: unknown) {
	console.warn(`[SavedAssetsPublicApi] ${action} failed`, error);
}

function hasDefinedValues(body: Record<string, unknown>) {
	return Object.values(body).some((value) => value !== undefined);
}

export function syncCreateSavedSearch(search: SavedSearch) {
	const token = getToken();
	if (!token) return;
	void createSavedSearchPublicApi(
		{
			name: search.name,
			description: search.description,
			definition: search.searchCriteria,
			scope: "personal",
		},
		token,
	)
		.then((asset) => rememberVersion("savedSearch", asset))
		.catch((error) => reportSavedAssetError("create saved search", error));
}

export function syncUpdateSavedSearch(id: string, patch: Partial<SavedSearch>) {
	const token = getToken();
	if (!token) return;
	const body = {
		name: patch.name,
		description: patch.description,
		definition: patch.searchCriteria,
	};
	if (!hasDefinedValues(body)) return;
	void updateSavedSearchPublicApi(id, body, token)
		.then((asset) => rememberVersion("savedSearch", asset))
		.catch((error) => reportSavedAssetError("update saved search", error));
}

export function syncDeleteSavedSearch(id: string) {
	const token = getToken();
	if (!token) return;
	void deleteSavedSearchPublicApi(id, getVersion("savedSearch", id), token)
		.then(() => forgetVersion("savedSearch", id))
		.catch((error) => reportSavedAssetError("delete saved search", error));
}

export function syncCreateCampaignTemplate(template: SavedCampaignTemplate) {
	const token = getToken();
	if (!token) return;
	void createCampaignTemplatePublicApi(
		{
			name: template.name,
			description: template.description,
			definition: template.campaignConfig,
			scope: "organization",
		},
		token,
	)
		.then((asset) => rememberVersion("campaignTemplate", asset))
		.catch((error) => reportSavedAssetError("create campaign template", error));
}

export function syncUpdateCampaignTemplate(
	id: string,
	patch: Partial<SavedCampaignTemplate>,
) {
	const token = getToken();
	if (!token) return;
	const body = {
		name: patch.name,
		description: patch.description,
		definition: patch.campaignConfig,
	};
	if (!hasDefinedValues(body)) return;
	void updateCampaignTemplatePublicApi(id, body, token)
		.then((asset) => rememberVersion("campaignTemplate", asset))
		.catch((error) => reportSavedAssetError("update campaign template", error));
}

export function syncDeleteCampaignTemplate(id: string) {
	const token = getToken();
	if (!token) return;
	void deleteCampaignTemplatePublicApi(
		id,
		getVersion("campaignTemplate", id),
		token,
	)
		.then(() => forgetVersion("campaignTemplate", id))
		.catch((error) => reportSavedAssetError("delete campaign template", error));
}

export function syncCreateWorkflowTemplate(workflow: SavedWorkflow) {
	const token = getToken();
	if (!token) return;
	void createWorkflowTemplatePublicApi(
		{
			name: workflow.name,
			description: workflow.description,
			definition: workflow as unknown as Record<string, unknown>,
			scope: "personal",
		},
		token,
	)
		.then((asset) => rememberVersion("workflowTemplate", asset))
		.catch((error) => reportSavedAssetError("create workflow template", error));
}

export function syncUpdateWorkflowTemplate(
	id: string,
	patch: Partial<SavedWorkflow>,
) {
	const token = getToken();
	if (!token) return;
	const body = {
		name: patch.name,
		description: patch.description,
		definition: patch as Record<string, unknown>,
	};
	if (!hasDefinedValues(body)) return;
	void updateWorkflowTemplatePublicApi(id, body, token)
		.then((asset) => rememberVersion("workflowTemplate", asset))
		.catch((error) => reportSavedAssetError("update workflow template", error));
}

export function syncDeleteWorkflowTemplate(id: string) {
	const token = getToken();
	if (!token) return;
	void deleteWorkflowTemplatePublicApi(
		id,
		getVersion("workflowTemplate", id),
		token,
	)
		.then(() => forgetVersion("workflowTemplate", id))
		.catch((error) => reportSavedAssetError("delete workflow template", error));
}

export function rememberSavedAssetVersion(
	kind: AssetKind,
	asset: PublicApiSavedAsset,
) {
	rememberVersion(kind, asset);
}
