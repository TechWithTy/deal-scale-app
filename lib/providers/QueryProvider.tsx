/**
 * React Query Provider
 *
 * Provides global data fetching, caching, and synchronization for the app.
 *
 * Features:
 * - Automatic caching with 5-minute stale time
 * - Background refetching
 * - Request deduplication
 * - Optimistic updates
 * - Devtools in development
 *
 * @see https://tanstack.com/query/latest
 */

"use client";

import {
	QueryClient,
	QueryClientProvider,
	isServer,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

/**
 * Creates a new QueryClient instance with optimized defaults
 */
function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// With SSR, we usually want to set some default staleTime
				// to avoid refetching immediately on the client
				staleTime: 5 * 60 * 1000, // 5 minutes
				gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
				retry: 2,
				retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
				refetchOnWindowFocus: false,
				refetchOnReconnect: true,
			},
			mutations: {
				retry: 1,
			},
		},
	});
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Gets or creates a QueryClient instance
 * - Server: Creates a new instance per request
 * - Client: Reuses the same instance
 */
function getQueryClient() {
	if (isServer) {
		// Server: always make a new query client
		return makeQueryClient();
	}
	// Browser: make a new query client if we don't already have one
	if (!browserQueryClient) browserQueryClient = makeQueryClient();
	return browserQueryClient;
}

/**
 * QueryProvider component that wraps the app with React Query
 *
 * @example
 * ```tsx
 * <QueryProvider>
 *   <App />
 * </QueryProvider>
 * ```
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{/* Show React Query DevTools in development */}
			{process.env.NODE_ENV === "development" && (
				<ReactQueryDevtools
					initialIsOpen={false}
					buttonPosition="bottom-left"
				/>
			)}
		</QueryClientProvider>
	);
}
