"use client";

import {
	type PublicApiSavedAsset,
	listCampaignTemplates,
	listSavedSearches,
	listWorkflowTemplates,
} from "@/lib/api/public-api-saved-assets";
import {
	toCampaignTemplate,
	toSavedSearch,
	toWorkflowTemplate,
} from "@/lib/api/public-api-saved-assets-normalizers";
import {
	type AssetKind,
	rememberSavedAssetVersion,
} from "./savedAssetsPublicApiSync";
import { useUserProfileStore } from "./userProfile";

export async function hydrateSavedAssetsFromPublicApi(token: string) {
	const [savedSearches, campaignTemplates, workflowTemplates] =
		await Promise.all([
			listSavedSearches({ limit: 100 }, token),
			listCampaignTemplates({ limit: 100 }, token),
			listWorkflowTemplates({ limit: 100 }, token),
		]);

	for (const [kind, items] of [
		["savedSearch", savedSearches.items ?? []],
		["campaignTemplate", campaignTemplates.items ?? []],
		["workflowTemplate", workflowTemplates.items ?? []],
	] as const satisfies readonly [AssetKind, PublicApiSavedAsset[]][]) {
		for (const asset of items) {
			rememberSavedAssetVersion(kind, asset);
		}
	}

	useUserProfileStore.getState().updateUserProfile({
		savedSearches: (savedSearches.items ?? []).map(toSavedSearch),
		savedCampaignTemplates: (campaignTemplates.items ?? []).map(
			toCampaignTemplate,
		),
		savedWorkflows: (workflowTemplates.items ?? []).map(toWorkflowTemplate),
	});
}
