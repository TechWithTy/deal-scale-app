import React, { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";

import { EmbedChartFrame } from "@/components/external/embed-chart-frame";
import { parseHostElement, type HostEmbedConfig } from "external/embed/config";
import {
	ensureStylesheet,
	normalizeError,
	renderConfigError,
	type MountOptions,
} from "external/embed/shared";

const DEFAULT_SELECTOR = "[data-dealscale-chart]";
const mountedCharts = new Map<Element, { root: Root; config: HostEmbedConfig }>();

function renderHost(
	host: Element,
	options: MountOptions,
): HostEmbedConfig | null {
	try {
		const config = parseHostElement(host);
		host.replaceChildren();
		host.setAttribute("data-theme", config.theme);
		const root = createRoot(host);
		host.setAttribute("data-chart-mounted", "true");
		root.render(
			<StrictMode>
				<EmbedChartFrame
					config={config}
					onError={(error) => {
						host.setAttribute("data-chart-error", "true");
						options.onError?.(error);
					}}
				/>
			</StrictMode>,
		);
		mountedCharts.set(host, { root, config });
		return config;
	} catch (error) {
		const resolved = normalizeError(error);
		renderConfigError(host, resolved, "Invalid chart configuration", {
			flag: "data-chart-error",
			message: "data-chart-error-message",
		});
		if (process.env.NODE_ENV !== "production") {
			// eslint-disable-next-line no-console
			console.error("Deal Scale embed mount error:", resolved);
		}
		options.onError?.(resolved);
		return null;
	}
}

export function mountDealScaleChart(options: MountOptions = {}) {
	if (typeof window === "undefined") {
		return;
	}

	ensureStylesheet("dealscale-embed-style", "/embed/deal-scale-charts.css");

	const selector = options.selector ?? DEFAULT_SELECTOR;
	const hosts = document.querySelectorAll<Element>(selector);

	hosts.forEach((host) => {
		if (mountedCharts.has(host)) {
			return;
		}

		renderHost(host, options);
	});
}

export function remountDealScaleChart(host: Element, options: MountOptions = {}) {
	unmountDealScaleChart(host);
	renderHost(host, options);
}

export function unmountDealScaleChart(host: Element) {
	const mounted = mountedCharts.get(host);
	if (!mounted) {
		return;
	}

	mounted.root.unmount();
	host.removeAttribute("data-chart-mounted");
	host.removeAttribute("data-chart-error");
	mountedCharts.delete(host);
}

export function unmountDealScaleCharts() {
	mountedCharts.forEach((_value, host) => {
		unmountDealScaleChart(host);
	});
}

export type { HostEmbedConfig };


