import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

const pointSchema = z.object({
	x: z.string(),
	y: z.number(),
});

const seriesSchema = z.object({
	id: z.string(),
	label: z.string(),
	color: z.string().optional(),
	points: z.array(pointSchema).min(1),
});

const liveChartResponseSchema = z.object({
	chartId: z.string(),
	type: z.enum(["bar", "area", "pie"]),
	version: z.string(),
	interval: z.number().int().positive(),
	series: z.array(seriesSchema).min(1),
	meta: z.object({
		title: z.string(),
		description: z.string().optional(),
		unit: z.string().optional(),
	}),
});

export type LiveChartResponse = z.infer<typeof liveChartResponseSchema>;

type UseLiveChartDataOptions = {
	chartId: string;
	chartType: LiveChartResponse["type"];
	refreshInterval?: number;
	authToken?: string;
	timezone?: string;
	endpoint?: string;
};

type LiveChartState =
	| { status: "idle"; data?: undefined; error?: undefined }
	| { status: "loading"; data?: LiveChartResponse; error?: undefined }
	| { status: "success"; data: LiveChartResponse; error?: undefined }
	| { status: "error"; data?: LiveChartResponse; error: Error };

const isTestEnvironment =
	typeof process !== "undefined" && process.env?.NODE_ENV === "test";
const MIN_INTERVAL = isTestEnvironment ? 10 : 10_000;
const MAX_INTERVAL = isTestEnvironment ? 1_000 : 300_000;

const clampInterval = (interval?: number) => {
	if (!interval || Number.isNaN(interval)) {
		return 30_000;
	}
	return Math.max(MIN_INTERVAL, Math.min(MAX_INTERVAL, interval));
};

const computeDelay = (baseInterval: number, retry = 0) => {
	const jitter = isTestEnvironment
		? 0
		: baseInterval * (Math.random() * 0.2 - 0.1);
	return Math.round(baseInterval + jitter) * 2 ** retry;
};

export function useLiveChartData(options: UseLiveChartDataOptions) {
	const {
		chartId,
		chartType,
		refreshInterval = 30_000,
		authToken,
		timezone = "UTC",
		endpoint = `/api/charts/live/${encodeURIComponent(chartId)}`,
	} = options;

	const [state, setState] = useState<LiveChartState>({ status: "idle" });
	const etagRef = useRef<string | null>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const activeIntervalRef = useRef<number>(clampInterval(refreshInterval));
	const abortRef = useRef<AbortController | null>(null);
	const fetchRef = useRef<((retryCount?: number) => void) | null>(null);

	const clearTimer = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	};

	const fetchData = useCallback(
		async (retryCount = 0) => {
			clearTimer();
			abortRef.current?.abort();
			const controller = new AbortController();
			abortRef.current = controller;

			setState((previous) => {
				if (previous.status === "success") {
					return previous;
				}
				return { status: "loading", data: previous.data };
			});

			try {
				const response = await fetch(endpoint, {
					method: "GET",
					signal: controller.signal,
					headers: {
						Accept: "application/json",
						...(etagRef.current ? { "If-None-Match": etagRef.current } : {}),
						...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
						"X-DealScale-Chart-Type": chartType,
						"X-DealScale-Timezone": timezone,
					},
				});

				if (response.status === 304) {
					return;
				}

				if (!response.ok) {
					throw new Error(
						`Chart polling failed with status ${response.status}`,
					);
				}

				const payload = await response.json();
				const parsed = liveChartResponseSchema.parse(payload);

				if (parsed.type !== chartType) {
					throw new Error("Chart type mismatch between client and server");
				}

				etagRef.current = response.headers.get("etag");
				activeIntervalRef.current = clampInterval(parsed.interval);

				setState({ status: "success", data: parsed });
				clearTimer();
			} catch (error) {
				const fallbackError =
					error instanceof Error
						? error
						: new Error("Unknown chart polling error");
				setState((previous) => ({
					status: "error",
					error: fallbackError,
					data: previous.data,
				}));
				clearTimer();
				const nextRetry = Math.min(retryCount + 1, 5);
				const delay = computeDelay(activeIntervalRef.current, nextRetry);
				timeoutRef.current = setTimeout(() => {
					fetchRef.current?.(nextRetry);
				}, delay);
				return;
			}

			const delay = computeDelay(activeIntervalRef.current);
			timeoutRef.current = setTimeout(() => {
				fetchRef.current?.(0);
			}, delay);
		},
		[authToken, chartType, endpoint, timezone],
	);

	useEffect(() => {
		fetchRef.current = (retryCount = 0) => {
			void fetchData(retryCount);
		};
		return () => {
			fetchRef.current = null;
		};
	}, [fetchData]);

	useEffect(() => {
		fetchRef.current?.(0);
		return () => {
			clearTimer();
			abortRef.current?.abort();
			abortRef.current = null;
		};
	}, [fetchData]);

	const refresh = useCallback(() => {
		fetchRef.current?.(0);
	}, [fetchData]);

	return {
		...state,
		refresh,
	};
}
