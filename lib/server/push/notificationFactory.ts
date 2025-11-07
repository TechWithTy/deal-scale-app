import { buildLeadDetailPath } from "@/lib/server/leads/leadListService";
import type { PushNotificationPayload } from "./schema";

interface LeadNotificationOptions {
	listId: string;
	leadId: string;
	leadName: string;
	context?: string;
}

export function createLeadReadyNotification(
	options: LeadNotificationOptions,
): PushNotificationPayload {
	const { listId, leadId, leadName, context } = options;
	const url = buildLeadDetailPath(
		listId,
		leadId,
		context ? { context } : undefined,
	);
	return {
		title: `Lead ready: ${leadName}`,
		body: `Review fresh intelligence for ${leadName}.`,
		url,
		data: {
			context: context ?? "lead-alert",
			listId,
			leadId,
			entity: "lead",
		},
		tag: `lead-${leadId}`,
		actions: [
			{
				action: "view",
				title: "Open lead",
			},
		],
	};
}

interface CampaignNotificationOptions {
	campaignId: string;
	campaignName: string;
	context?: string;
	resultsPath?: string;
}

export function createCampaignUpdateNotification(
	options: CampaignNotificationOptions,
): PushNotificationPayload {
	const { campaignId, campaignName, context, resultsPath } = options;
	const params = new URLSearchParams();
	params.set("campaignId", campaignId);
	if (context) params.set("context", context);
	const url = resultsPath ?? `/dashboard/campaigns?${params.toString()}`;
	return {
		title: `Campaign update: ${campaignName}`,
		body: "A campaign you manage has new results ready.",
		url,
		data: {
			campaignId,
			context: context ?? "campaign-update",
			entity: "campaign",
		},
		tag: `campaign-${campaignId}`,
		actions: [
			{
				action: "view",
				title: "Open campaign",
			},
		],
	};
}
