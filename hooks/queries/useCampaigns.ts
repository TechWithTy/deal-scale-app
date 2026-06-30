/**
 * React Query hook for fetching and managing campaigns data
 *
 * Features:
 * - Automatic caching
 * - Real-time refetching for active campaigns
 * - Batch queries for stats
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useCampaigns();
 * const { data: stats } = useCampaignStats(campaignId);
 * ```
 */

import {
	createCampaign,
	getCampaignStatus,
} from "@/lib/api/public-api-dashboard";
import {
	getCampaigns,
	updateCampaign,
} from "@/lib/api/public-api-core-resources";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Campaign {
	id: string;
	name: string;
	status: "draft" | "active" | "paused" | "completed";
	created_at: string;
	// Add more fields as needed
}

interface CampaignStats {
	sent: number;
	delivered: number;
	opened: number;
	clicked: number;
	replied: number;
}

type CampaignQueryOptions = {
	token?: string;
};

function asRecord(value: unknown): Record<string, unknown> {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};
}

function asArray(payload: unknown) {
	if (Array.isArray(payload)) return payload;
	const record = asRecord(payload);
	for (const key of ["campaigns", "items", "results", "data"]) {
		const value = record[key];
		if (Array.isArray(value)) return value;
	}
	return [];
}

function text(value: unknown, fallback = "") {
	return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function number(value: unknown, fallback = 0) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCampaign(item: unknown, index: number): Campaign {
	const record = asRecord(item);
	return {
		created_at: text(
			record.created_at ?? record.started_at,
			new Date().toISOString(),
		),
		id: text(
			record.campaign_id ?? record.id,
			`public-api-campaign-${index + 1}`,
		),
		name: text(record.name, `Public API Campaign ${index + 1}`),
		status: text(record.status, "draft") as Campaign["status"],
	};
}

function normalizeCampaignStats(payload: unknown): CampaignStats {
	const record = asRecord(payload);
	const stats = asRecord(record.stats ?? record.metrics ?? record);
	return {
		clicked: number(stats.clicked ?? stats.clicks),
		delivered: number(stats.delivered),
		opened: number(stats.opened ?? stats.opens),
		replied: number(stats.replied ?? stats.replies),
		sent: number(stats.sent),
	};
}

/**
 * Fetches all campaigns
 */
async function fetchCampaigns(
	options: CampaignQueryOptions = {},
): Promise<Campaign[]> {
	return asArray(await getCampaigns({ limit: 50 }, options.token)).map(
		normalizeCampaign,
	);
}

/**
 * Fetches campaign statistics
 */
async function fetchCampaignStats(
	campaignId: string,
	options: CampaignQueryOptions = {},
): Promise<CampaignStats> {
	return normalizeCampaignStats(
		await getCampaignStatus(campaignId, options.token),
	);
}

/**
 * Hook to fetch all campaigns
 */
export function useCampaigns(options: CampaignQueryOptions = {}) {
	return useQuery({
		queryKey: ["campaigns", options.token ?? null],
		queryFn: () => fetchCampaigns(options),
		staleTime: 2 * 60 * 1000, // 2 minutes (shorter for more frequent updates)
		gcTime: 10 * 60 * 1000,
	});
}

/**
 * Hook to fetch campaign stats with polling for active campaigns
 */
export function useCampaignStats(
	campaignId: string | null,
	isActive = false,
	options: CampaignQueryOptions = {},
) {
	return useQuery({
		queryKey: ["campaign-stats", campaignId, options.token ?? null],
		queryFn: () => fetchCampaignStats(campaignId!, options),
		enabled: Boolean(campaignId),
		staleTime: 30 * 1000, // 30 seconds
		// Poll every 30 seconds if campaign is active
		refetchInterval: isActive ? 30 * 1000 : false,
		refetchIntervalInBackground: false,
	});
}

/**
 * Hook to batch fetch multiple campaign stats
 * More efficient than individual requests
 */
export async function batchFetchCampaignData(
	campaignIds: string[],
	options: CampaignQueryOptions = {},
) {
	const [campaigns, ...stats] = await Promise.all([
		fetchCampaigns(options),
		...campaignIds.map((id) => fetchCampaignStats(id, options)),
	]);

	return {
		campaigns,
		stats: Object.fromEntries(
			campaignIds.map((id, index) => [id, stats[index]]),
		),
	};
}

/**
 * Hook to create a new campaign
 */
export function useCreateCampaign(options: CampaignQueryOptions = {}) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Partial<Campaign>) =>
			createCampaign(data, options.token),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
		},
	});
}

/**
 * Hook to update a campaign
 */
export function useUpdateCampaign(options: CampaignQueryOptions = {}) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<Campaign> }) =>
			updateCampaign(id, data, options.token),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
			queryClient.invalidateQueries({
				queryKey: ["campaign-stats", variables.id],
			});
		},
	});
}
