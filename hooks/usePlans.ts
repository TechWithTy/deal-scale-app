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
	type PlanTier,
	mockPlans,
} from "@/lib/mock/plans";
import { getPaymentPricingTiers } from "@/lib/api/public-api-dashboard";
import { extractCreditPricingCatalog } from "@/lib/payments/public-api-credit-pricing";
import { useEffect, useState } from "react";

interface UsePlansResult {
	plans: PlanTier[];
	loading: boolean;
	isLive: boolean;
	error: Error | null;
}

function toCreditPlans(payload: unknown): PlanTier[] {
	const catalog = extractCreditPricingCatalog(payload);
	return catalog.tiers.map((tier) => ({
		credits: {
			ai: tier.credits,
			leads: 0,
			skipTraces: 0,
		},
		cta: "Buy Credits",
		description:
			tier.savings > 0
				? `${catalog.currency} ${tier.price.toLocaleString()} with ${tier.savings.toLocaleString()} savings`
				: `${catalog.currency} ${tier.price.toLocaleString()}`,
		features: [
			`${tier.credits.toLocaleString()} credits`,
			`${catalog.currency} ${tier.pricePerCredit.toFixed(2)} per credit`,
		],
		id: tier.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
		name: tier.name,
		price: tier.price,
		priceSuffix: "one-time",
	}));
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
				const fetchedPlans = toCreditPlans(await getPaymentPricingTiers());
				if (!mounted) return;

				if (fetchedPlans.length > 0) {
					setPlans(fetchedPlans);
					setIsLive(true);
				} else {
					setPlans(mockPlans);
					setIsLive(false);
				}
			} catch (err) {
				if (mounted) {
					console.warn(
						"Failed to fetch public API pricing tiers, using mock data:",
						err,
					);
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
