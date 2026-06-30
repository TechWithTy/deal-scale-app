/**
 * React Query hook for fetching and managing leads data
 *
 * Features:
 * - Automatic caching with 5-minute stale time
 * - Background refetching
 * - Pagination support
 * - Filter support
 * - Request deduplication
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useLeads({
 *   page: 1,
 *   pageSize: 50,
 *   status: 'active'
 * });
 * ```
 */

import {
	deleteLead,
	getLeadLists,
	updateLead,
} from "@/lib/api/public-api-core-resources";
import { normalizePublicApiLeadLists } from "@/lib/leads/public-api-lead-normalizers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Lead filter options
 */
export interface LeadFilters {
	page?: number;
	pageSize?: number;
	status?: string;
	search?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

/**
 * Lead data structure (adjust to match your actual type)
 */
export interface Lead {
	id: string;
	name: string;
	status: string;
	created_at: string;
	// Add more fields as needed
}

/**
 * Response structure from the leads API
 */
interface LeadsResponse {
	data: Lead[];
	total: number;
	page: number;
	pageSize: number;
}

type LeadQueryOptions = {
	token?: string;
};

function toPublicApiParams(filters: LeadFilters) {
	return {
		limit: filters.pageSize,
		page: filters.page,
		q: filters.search,
		sort_by: filters.sortBy,
		sort_order: filters.sortOrder,
		status: filters.status,
	};
}

function normalizeLeadRow(lead: unknown): Lead {
	const record =
		lead && typeof lead === "object" ? (lead as Record<string, unknown>) : {};
	return {
		created_at:
			typeof record.lastUpdate === "string"
				? record.lastUpdate
				: new Date().toISOString(),
		id: typeof record.id === "string" ? record.id : "public-api-lead",
		name:
			typeof record.name === "string" && record.name.trim()
				? record.name
				: "Public API Lead",
		status:
			typeof record.status === "string" && record.status.trim()
				? record.status
				: "New Lead",
	};
}

/**
 * Fetches leads from the API
 */
async function fetchLeads(
	filters: LeadFilters = {},
	options: LeadQueryOptions = {},
): Promise<LeadsResponse> {
	const rows = normalizePublicApiLeadLists(
		await getLeadLists(toPublicApiParams(filters), options.token),
	);
	const data = rows.flatMap((row) => row.leads.map(normalizeLeadRow));

	return {
		data,
		page: filters.page ?? 1,
		pageSize: filters.pageSize ?? data.length,
		total: data.length,
	};
}

/**
 * Hook to fetch leads with caching and pagination
 *
 * @param filters - Filter options for leads query
 * @returns React Query result with leads data
 */
export function useLeads(
	filters: LeadFilters = {},
	options: LeadQueryOptions = {},
) {
	return useQuery({
		queryKey: ["leads", filters, options.token ?? null],
		queryFn: () => fetchLeads(filters, options),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		// Enable query only if needed (optional)
		// enabled: Boolean(filters.status),
	});
}

/**
 * Hook to update a lead with optimistic updates
 */
export function useUpdateLead(options: LeadQueryOptions = {}) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) =>
			updateLead(id, data, options.token),
		// Optimistic update: immediately update the UI before the server responds
		onMutate: async ({ id, data }) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["leads"] });

			// Snapshot previous value
			const previousLeads = queryClient.getQueryData(["leads"]);

			// Optimistically update to the new value
			queryClient.setQueryData(["leads"], (old: LeadsResponse | undefined) => {
				if (!old) return old;
				return {
					...old,
					data: old.data.map((lead) =>
						lead.id === id ? { ...lead, ...data } : lead,
					),
				};
			});

			return { previousLeads };
		},
		// If mutation fails, use the context returned from onMutate to roll back
		onError: (err, variables, context) => {
			if (context?.previousLeads) {
				queryClient.setQueryData(["leads"], context.previousLeads);
			}
		},
		// Always refetch after error or success
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["leads"] });
		},
	});
}

/**
 * Hook to delete a lead
 */
export function useDeleteLead(options: LeadQueryOptions = {}) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteLead(id, options.token),
		onSuccess: () => {
			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: ["leads"] });
		},
	});
}

/**
 * Hook to prefetch the next page of leads
 * Useful for pagination - prefetch before user clicks "next"
 */
export function usePrefetchLeads(
	filters: LeadFilters = {},
	options: LeadQueryOptions = {},
) {
	const queryClient = useQueryClient();

	return () => {
		queryClient.prefetchQuery({
			queryKey: ["leads", filters, options.token ?? null],
			queryFn: () => fetchLeads(filters, options),
			staleTime: 5 * 60 * 1000,
		});
	};
}
