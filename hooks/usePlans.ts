/**
 * Custom hook for fetching pricing plans with automatic mock-to-live detection
 *
 * This hook automatically detects if live API endpoints are available and
 * transitions from mock data to live API calls seamlessly.
 *
 * @example
 * ```tsx
 * const { plans, loading, isLive } = usePlans();
 * ```
 */

import {
	mockPlans,
	checkLiveApiAvailable,
	type PlanTier,
} from "@/lib/mock/plans";
import { useEffect, useState } from "react";

interface UsePlansResult {
	plans: PlanTier[];
	loading: boolean;
	isLive: boolean;
	error: Error | null;
}

/**
 * Hook to fetch plans from mock data or live API
 * Automatically detects API availability and switches modes
 */
export function usePlans(): UsePlansResult {
	const [plans, setPlans] = useState<PlanTier[]>(mockPlans);
	const [loading, setLoading] = useState(true);
	const [isLive, setIsLive] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		let mounted = true;

		async function fetchPlans() {
			try {
				// Check if live API is available
				const liveApiAvailable = await checkLiveApiAvailable();

				if (liveApiAvailable && mounted) {
					// Fetch from live API
					const baseUrl =
						typeof window !== "undefined" ? window.location.origin : "";
					const response = await fetch(`${baseUrl}/api/plans`);

					if (!response.ok) {
						throw new Error(`API returned ${response.status}`);
					}

					const data = await response.json();
					const fetchedPlans: PlanTier[] = Array.isArray(data)
						? data
						: data.plans || data.items || [];

					if (mounted && fetchedPlans.length > 0) {
						setPlans(fetchedPlans);
						setIsLive(true);
						console.log(
							"Live DealScale API detected. Using dynamic pricing from api.dealscale.io",
						);
					} else if (mounted) {
						// Fallback to mock if API returns empty array
						setPlans(mockPlans);
						setIsLive(false);
					}
				} else if (mounted) {
					// Use mock data
					setPlans(mockPlans);
					setIsLive(false);
				}
			} catch (err) {
				if (mounted) {
					console.warn("Failed to fetch plans from API, using mock data:", err);
					setPlans(mockPlans);
					setIsLive(false);
					setError(err instanceof Error ? err : new Error(String(err)));
				}
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		}

		fetchPlans();

		return () => {
			mounted = false;
		};
	}, []);

	return { plans, loading, isLive, error };
}
