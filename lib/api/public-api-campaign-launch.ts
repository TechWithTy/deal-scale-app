import { createCampaign } from "@/lib/api/public-api-dashboard";

export type PublicApiCampaignType = "email" | "mixed" | "sms" | "social" | "voice";
export type PublicApiCampaignStatus =
	| "active"
	| "cancelled"
	| "completed"
	| "draft"
	| "paused";

export type PublicApiCampaignCreate = {
	ai_prompt?: string | null;
	auto_start?: boolean;
	campaign_metadata?: Record<string, unknown> | null;
	campaign_type: PublicApiCampaignType;
	description?: string | null;
	enrichment_sources?: string[] | null;
	name: string;
	n8n_webhook_url?: string | null;
	status?: PublicApiCampaignStatus;
	target_count?: number | null;
	workflow_config?: Record<string, unknown> | null;
};

type PublicApiCampaignLaunchResponse = {
	campaign_id?: string;
	status?: PublicApiCampaignStatus;
	[key: string]: unknown;
};

type BuildCampaignPayloadInput = {
	areaMode?: string | null;
	campaignName?: string | null;
	endDate?: Date | null;
	estimatedCredits?: number;
	leadCount?: number;
	localCampaignId: string;
	primaryChannel?: string | null;
	selectedLeadListAId?: string | null;
	selectedLeadListId?: string | null;
	startDate?: Date | null;
};

export function toPublicApiCampaignType(channel?: string | null): PublicApiCampaignType {
	switch ((channel ?? "").toLowerCase()) {
		case "call":
			return "voice";
		case "text":
			return "sms";
		case "email":
			return "email";
		case "facebook":
		case "linkedin":
		case "social":
			return "social";
		default:
			return "mixed";
	}
}

export function buildPublicApiCampaignPayload({
	areaMode,
	campaignName,
	endDate,
	estimatedCredits,
	leadCount,
	localCampaignId,
	primaryChannel,
	selectedLeadListAId,
	selectedLeadListId,
	startDate,
}: BuildCampaignPayloadInput): PublicApiCampaignCreate {
	const safeLeadCount = Number.isFinite(leadCount)
		? Math.max(0, Number(leadCount))
		: 0;
	const name = (campaignName ?? "").trim() || "New Campaign";

	return {
		auto_start: true,
		campaign_metadata: {
			areaMode: areaMode ?? null,
			estimatedCredits: estimatedCredits ?? 0,
			localCampaignId,
			primaryChannel: primaryChannel ?? null,
			selectedLeadListAId: selectedLeadListAId || null,
			selectedLeadListId: selectedLeadListId || null,
		},
		campaign_type: toPublicApiCampaignType(primaryChannel),
		name,
		status: "active",
		target_count: safeLeadCount,
		workflow_config: {
			endDate: endDate?.toISOString() ?? null,
			startDate: startDate?.toISOString() ?? null,
		},
	};
}

const CAMPAIGN_ID_MAP_KEY = "dealScale:publicApiCampaignIdMap";

function readCampaignIdMap(): Record<string, string> {
	if (typeof window === "undefined") return {};
	try {
		const raw = window.localStorage.getItem(CAMPAIGN_ID_MAP_KEY);
		return raw ? (JSON.parse(raw) as Record<string, string>) : {};
	} catch {
		return {};
	}
}

export function persistPublicApiCampaignId(
	localCampaignId: string,
	publicApiCampaignId: string,
) {
	if (typeof window === "undefined" || !localCampaignId || !publicApiCampaignId) {
		return;
	}
	const current = readCampaignIdMap();
	window.localStorage.setItem(
		CAMPAIGN_ID_MAP_KEY,
		JSON.stringify({ ...current, [localCampaignId]: publicApiCampaignId }),
	);
}

export function getPublicApiCampaignId(localCampaignId: string) {
	return readCampaignIdMap()[localCampaignId] ?? localCampaignId;
}

function getCampaignIdFromResponse(response: unknown) {
	return response && typeof response === "object"
		? (response as PublicApiCampaignLaunchResponse).campaign_id
		: undefined;
}

export async function launchPublicApiCampaign(
	input: BuildCampaignPayloadInput & { token: string },
) {
	const { token, ...payloadInput } = input;
	const response = await createCampaign(
		buildPublicApiCampaignPayload(payloadInput),
		token,
	);
	const publicCampaignId = getCampaignIdFromResponse(response);
	if (publicCampaignId) {
		persistPublicApiCampaignId(input.localCampaignId, publicCampaignId);
	}
	return response;
}
