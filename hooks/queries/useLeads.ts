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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

/**
 * Fetches leads from the API
 */
async function fetchLeads(filters: LeadFilters = {}): Promise<LeadsResponse> {
	const params = new URLSearchParams();

	if (filters.page) params.append("page", filters.page.toString());
	if (filters.pageSize) params.append("pageSize", filters.pageSize.toString());
	if (filters.status) params.append("status", filters.status);
	if (filters.search) params.append("search", filters.search);
	if (filters.sortBy) params.append("sortBy", filters.sortBy);
	if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

	const response = await fetch(`/api/leads?${params.toString()}`);

	if (!response.ok) {
		throw new Error("Failed to fetch leads");
	}

	return response.json();
}

/**
 * Hook to fetch leads with caching and pagination
 *
 * @param filters - Filter options for leads query
 * @returns React Query result with leads data
 */
export function useLeads(filters: LeadFilters = {}) {
	return useQuery({
		queryKey: ["leads", filters],
		queryFn: () => fetchLeads(filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		// Enable query only if needed (optional)
		// enabled: Boolean(filters.status),
	});
}

/**
 * Hook to update a lead with optimistic updates
 */
export function useUpdateLead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<Lead> }) => {
			const response = await fetch(`/api/leads/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to update lead");
			}

			return response.json();
		},
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
export function useDeleteLead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/leads/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete lead");
			}

			return response.json();
		},
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
export function usePrefetchLeads(filters: LeadFilters = {}) {
	const queryClient = useQueryClient();

	return () => {
		queryClient.prefetchQuery({
			queryKey: ["leads", filters],
			queryFn: () => fetchLeads(filters),
			staleTime: 5 * 60 * 1000,
		});
	};
}
