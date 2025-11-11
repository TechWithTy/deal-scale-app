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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

/**
 * Fetches all campaigns
 */
async function fetchCampaigns(): Promise<Campaign[]> {
	const response = await fetch("/api/campaigns");

	if (!response.ok) {
		throw new Error("Failed to fetch campaigns");
	}

	return response.json();
}

/**
 * Fetches campaign statistics
 */
async function fetchCampaignStats(campaignId: string): Promise<CampaignStats> {
	const response = await fetch(`/api/campaigns/${campaignId}/stats`);

	if (!response.ok) {
		throw new Error("Failed to fetch campaign stats");
	}

	return response.json();
}

/**
 * Hook to fetch all campaigns
 */
export function useCampaigns() {
	return useQuery({
		queryKey: ["campaigns"],
		queryFn: fetchCampaigns,
		staleTime: 2 * 60 * 1000, // 2 minutes (shorter for more frequent updates)
		gcTime: 10 * 60 * 1000,
	});
}

/**
 * Hook to fetch campaign stats with polling for active campaigns
 */
export function useCampaignStats(campaignId: string | null, isActive = false) {
	return useQuery({
		queryKey: ["campaign-stats", campaignId],
		queryFn: () => fetchCampaignStats(campaignId!),
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
export async function batchFetchCampaignData(campaignIds: string[]) {
	const [campaigns, ...stats] = await Promise.all([
		fetchCampaigns(),
		...campaignIds.map((id) => fetchCampaignStats(id)),
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
export function useCreateCampaign() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: Partial<Campaign>) => {
			const response = await fetch("/api/campaigns", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to create campaign");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
		},
	});
}

/**
 * Hook to update a campaign
 */
export function useUpdateCampaign() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: { id: string; data: Partial<Campaign> }) => {
			const response = await fetch(`/api/campaigns/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to update campaign");
			}

			return response.json();
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
			queryClient.invalidateQueries({
				queryKey: ["campaign-stats", variables.id],
			});
		},
	});
}
