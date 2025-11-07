"use client";

import { mockAnalyticsData } from "@/constants/_faker/analytics/charts";
import { useEffect, useState } from "react";
import type { AnalyticsData } from "../types/analytics";

interface UseAnalyticsDataReturn {
	data: AnalyticsData | null;
	loading: boolean;
	error: Error | null;
	refetch: () => void;
}

export function useAnalyticsData(): UseAnalyticsDataReturn {
	const [data, setData] = useState<AnalyticsData | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);

			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 500));

			// TODO: Replace with actual API call
			// const response = await fetch('/api/analytics');
			// const data = await response.json();

			setData(mockAnalyticsData);
		} catch (err) {
			setError(
				err instanceof Error
					? err
					: new Error("Failed to fetch analytics data"),
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();

		// Auto-refresh every 15 minutes (900000 ms)
		const interval = setInterval(fetchData, 900000);

		return () => clearInterval(interval);
	}, []);

	return {
		data,
		loading,
		error,
		refetch: fetchData,
	};
}
