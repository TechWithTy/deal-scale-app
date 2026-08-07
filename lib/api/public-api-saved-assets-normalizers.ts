import type { PublicApiSavedAsset } from "@/lib/api/public-api-saved-assets";
import type {
	SavedCampaignTemplate,
	SavedSearch,
	SavedWorkflow,
} from "@/types/userProfile";

function toDate(value: string | undefined) {
	return value ? new Date(value) : new Date();
}

export function toSavedSearch(asset: PublicApiSavedAsset): SavedSearch {
	return {
		id: asset.id,
		name: asset.name,
		description: asset.description ?? undefined,
		searchCriteria: asset.definition,
		createdAt: toDate(asset.created_at),
		updatedAt: toDate(asset.updated_at),
	};
}

export function toCampaignTemplate(
	asset: PublicApiSavedAsset,
): SavedCampaignTemplate {
	return {
		id: asset.id,
		name: asset.name,
		description: asset.description ?? undefined,
		campaignConfig: asset.definition as SavedCampaignTemplate["campaignConfig"],
		createdAt: toDate(asset.created_at),
		updatedAt: toDate(asset.updated_at),
	};
}

export function toWorkflowTemplate(asset: PublicApiSavedAsset): SavedWorkflow {
	const definition = asset.definition as Partial<SavedWorkflow>;
	return {
		id: asset.id,
		name: asset.name,
		description: asset.description ?? undefined,
		platform: definition.platform ?? "n8n",
		workflowConfig: definition.workflowConfig ?? asset.definition,
		aiPrompt: definition.aiPrompt,
		generatedByAI: definition.generatedByAI,
		createdAt: toDate(asset.created_at),
		updatedAt: toDate(asset.updated_at),
		monetization: definition.monetization,
	};
}
