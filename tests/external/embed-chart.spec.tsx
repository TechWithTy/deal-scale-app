import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mountDealScaleChart, unmountDealScaleCharts } from "external/embed";

vi.mock("@/components/external/embed-chart-frame", async () => {
	const React = await import("react");
	const { useLiveChartData } = await import("@/lib/hooks/useLiveChartData");
	const { createElement, useEffect } = React;

	const EmbedChartFrame = ({
		config,
		onError,
	}: {
		config: unknown;
		onError?: (error: Error) => void;
	}) => {
		const state = useLiveChartData(config as any);

		useEffect(() => {
			if (state.status === "error" && state.error && onError) {
				onError(state.error);
			}
		}, [state.status, state.error, onError]);

		if (state.status !== "success" || !state.data) {
			return createElement("div", { "data-testid": "chart-loading" }, "Loading chart");
		}

		const latest =
			state.data.series[0]?.points[state.data.series[0].points.length - 1]?.y ?? 0;

		return createElement(
			"div",
			{ "data-testid": "chart-latest", "data-value": latest },
			`Latest value: ${latest}`,
		);
	};

	return { EmbedChartFrame };
});

const SAMPLE_RESPONSE = {
	chartId: "pipeline-volume",
	type: "bar" as const,
	version: "2025-11-07T16:00:00Z",
	interval: 30000,
	series: [
		{
			id: "desktop",
			label: "Desktop",
			color: "hsl(var(--chart-1))",
			points: [
				{ x: "2025-11-01", y: 200 },
				{ x: "2025-11-02", y: 250 },
			],
		},
	],
	meta: {
		title: "Pipeline Volume",
		description: "Last 60 days",
		unit: "leads",
	},
};

const mountHost = (refreshInterval = "30000") => {
	const host = document.createElement("div");
	host.dataset.dealscaleChart = "";
	host.dataset.chartId = "pipeline-volume";
	host.dataset.chartType = "bar";
	host.dataset.refreshInterval = refreshInterval;
	document.body.appendChild(host);
	return host;
};

describe("embeddable charts bootstrap (polling)", () => {
	beforeEach(() => {
		(global.fetch as unknown) = vi
			.fn()
			.mockResolvedValue(
				new Response(JSON.stringify(SAMPLE_RESPONSE), {
					status: 200,
					headers: { "Content-Type": "application/json", ETag: `"v1"` },
				}),
			);
	});

	afterEach(() => {
		unmountDealScaleCharts();
		cleanup();
		vi.clearAllMocks();
	document.body.innerHTML = "";
	});

	it("renders a loading state until configuration resolves", async () => {
		const host = mountHost();
		mountDealScaleChart({ selector: "[data-dealscale-chart]" });

		expect(await screen.findByTestId("chart-loading")).toBeInTheDocument();
		expect(await screen.findByTestId("chart-latest")).toHaveTextContent(
			/Latest value: 250/i,
		);
		expect(host).toHaveAttribute("data-chart-mounted", "true");
	});

	it("polls the live endpoint on the provided interval", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(
				new Response(JSON.stringify(SAMPLE_RESPONSE), {
					status: 200,
					headers: { "Content-Type": "application/json", ETag: `"v1"` },
				}),
			);
		(global.fetch as unknown) = fetchMock;

		mountHost("50");
		mountDealScaleChart({ selector: "[data-dealscale-chart]" });

	await waitFor(() => {
		expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(1);
	});
	await waitFor(() => {
		expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2);
	});
	});

	it("updates rendered metrics when new data arrives", async () => {
		let callCount = 0;
		(global.fetch as unknown) = vi.fn().mockImplementation(() => {
			callCount += 1;
			const value = 200 + callCount * 50;
			return Promise.resolve(
				new Response(
					JSON.stringify({
						...SAMPLE_RESPONSE,
						series: [
							{
								...SAMPLE_RESPONSE.series[0],
								points: [{ x: "2025-11-01", y: value }],
							},
						],
					}),
					{
						status: 200,
						headers: {
							"Content-Type": "application/json",
							ETag: `"v${callCount}"`,
						},
					},
				),
			);
		});

		const host = mountHost("50");
		mountDealScaleChart({ selector: "[data-dealscale-chart]" });

		await waitFor(() =>
			expect(screen.getByTestId("chart-latest")).toHaveTextContent(
				/Latest value: 300/i,
			),
		);
		expect(callCount).toBeGreaterThanOrEqual(2);
		expect(host.querySelectorAll('[data-testid="chart-latest"]')).toHaveLength(1);
	});
});

