"use client";

import { mockUserProfile } from "@/constants/_faker/profile/userProfile";
import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
import { getCreditsBalance } from "@/lib/api/public-api-dashboard";
// ! useUsageData: Custom hook for fetching usage/subscription data
import { useEffect, useState } from "react";

type CreditBucket = UserProfileSubscription["aiCredits"];

function getNumber(value: unknown) {
	const number = Number(value);
	return Number.isFinite(number) ? number : undefined;
}

function getRecord(value: unknown): Record<string, unknown> {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};
}

function mergeBucket(current: CreditBucket, source: unknown): CreditBucket {
	const record = getRecord(source);
	const total =
		getNumber(record.total) ??
		getNumber(record.total_credits) ??
		getNumber(record.lifetime_earned) ??
		getNumber(record.earned);
	const spent =
		getNumber(record.spent) ??
		getNumber(record.total_spent) ??
		getNumber(record.used) ??
		getNumber(record.used_credits);
	const available =
		getNumber(record.available) ??
		getNumber(record.available_credits) ??
		(typeof source === "number" ? source : undefined);
	const allotted = total ?? (available !== undefined && spent !== undefined ? available + spent : undefined);

	return {
		allotted: allotted ?? current.allotted,
		resetInDays: current.resetInDays,
		used: spent ?? current.used,
	};
}

export function mergeCreditsIntoSubscription(
	subscription: UserProfileSubscription,
	payload: unknown,
): UserProfileSubscription {
	const record = getRecord(payload);
	const balances = getRecord(record.balances);
	const breakdown = getRecord(record.credit_breakdown);

	return {
		...subscription,
		aiCredits: mergeBucket(subscription.aiCredits, balances.ai ?? breakdown.ai),
		leads: mergeBucket(subscription.leads, balances.lead ?? balances.leads ?? breakdown.lead),
		skipTraces: mergeBucket(
			subscription.skipTraces,
			balances.skip_trace ?? balances.skipTraces ?? breakdown.skip_trace,
		),
	};
}

export const useUsageData = (
	fallbackSubscription?: UserProfileSubscription | null,
	token?: string,
) => {
	const fallback = fallbackSubscription ?? mockUserProfile?.subscription ?? null;
	const [data, setData] = useState<UserProfileSubscription | null>(fallback);
	const [loading, setLoading] = useState(true);
	const [source, setSource] = useState<"fallback" | "live">("fallback");

	useEffect(() => {
		let isMounted = true;

		async function loadUsage() {
			setLoading(true);

			if (!token || !fallback) {
				if (isMounted) {
					setData(fallback);
					setSource("fallback");
					setLoading(false);
				}
				return;
			}

			try {
				const payload = await getCreditsBalance(token);
				if (isMounted) {
					setData(mergeCreditsIntoSubscription(fallback, payload));
					setSource("live");
				}
			} catch (error) {
				console.warn("Failed to load public API credits; using fallback.", error);
				if (isMounted) {
					setData(fallback);
					setSource("fallback");
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		}

		loadUsage();
		return () => {
			isMounted = false;
		};
	}, [fallback, token]);

	return { data, loading, source };
};
