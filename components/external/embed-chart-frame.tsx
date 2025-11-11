"use client";

import React, { useEffect } from "react";

import { EmbedChart } from "@/components/external/embed-chart";
import type { HostEmbedConfig } from "external/embed/config";
import { useLiveChartData } from "@/lib/hooks/useLiveChartData";

type EmbedChartFrameProps = {
	config: HostEmbedConfig;
	onError?: (error: Error) => void;
};

export function EmbedChartFrame({ config, onError }: EmbedChartFrameProps) {
	const { status, data, error, refresh } = useLiveChartData({
		chartId: config.chartId,
		chartType: config.chartType,
		refreshInterval: config.refreshInterval,
		authToken: config.authToken,
		timezone: config.timezone,
		endpoint: config.endpoint,
	});

	useEffect(() => {
		if (error) {
			onError?.(error);
		}
	}, [error, onError]);

	if (status === "error") {
		return (
			<div className="deal-scale-embed-error" role="alert">
				<h3>Unable to load chart</h3>
				<p>{error?.message ?? "An unexpected error occurred."}</p>
				<button type="button" onClick={refresh}>
					Try again
				</button>
			</div>
		);
	}

	if (!data) {
		return (
			<div
				className="deal-scale-embed-loading"
				role="status"
				aria-live="polite"
			>
				<span>Loading chart…</span>
			</div>
		);
	}

	return (
		<EmbedChart
			data={data}
			config={config}
			onRefresh={refresh}
			isLoading={status === "loading"}
		/>
	);
}
