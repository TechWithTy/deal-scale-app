import React, { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";

import { EmbedFocusWidget } from "@/components/external/embed-focus-widget";
import {
	ensureStylesheet,
	normalizeError,
	renderConfigError,
	type MountOptions,
} from "external/embed/shared";
import { parseFocusHost, type FocusEmbedConfig } from "./config";

const DEFAULT_SELECTOR = "[data-dealscale-focus]";
const mountedFocusWidgets = new Map<
	Element,
	{ root: Root; config: FocusEmbedConfig }
>();

function renderHost(host: Element, options: MountOptions) {
	try {
		const config = parseFocusHost(host);
		host.replaceChildren();
		host.setAttribute("data-focus-mounted", "true");
		const root = createRoot(host);
		root.render(
			<StrictMode>
				<EmbedFocusWidget
					config={config}
					onError={(error) => options.onError?.(error)}
				/>
			</StrictMode>,
		);
		mountedFocusWidgets.set(host, { root, config });
		return config;
	} catch (error) {
		const resolved = normalizeError(error);
		renderConfigError(host, resolved, "Invalid focus widget configuration", {
			flag: "data-focus-error",
			message: "data-focus-error-message",
		});
		if (process.env.NODE_ENV !== "production") {
			// eslint-disable-next-line no-console
			console.error("Deal Scale focus widget mount error:", resolved);
		}
		options.onError?.(resolved);
		return null;
	}
}

export function mountDealScaleFocusWidget(options: MountOptions = {}) {
	if (typeof window === "undefined") {
		return;
	}

	ensureStylesheet("dealscale-focus-style", "/embed/deal-scale-focus.css");

	const selector = options.selector ?? DEFAULT_SELECTOR;
	const hosts = document.querySelectorAll<Element>(selector);

	hosts.forEach((host) => {
		if (mountedFocusWidgets.has(host)) {
			return;
		}
		renderHost(host, options);
	});
}

export function remountDealScaleFocusWidget(
	host: Element,
	options: MountOptions = {},
) {
	unmountDealScaleFocusWidget(host);
	renderHost(host, options);
}

export function unmountDealScaleFocusWidget(host: Element) {
	const mounted = mountedFocusWidgets.get(host);
	if (!mounted) {
		return;
	}
	mounted.root.unmount();
	host.removeAttribute("data-focus-mounted");
	host.removeAttribute("data-focus-error");
	mountedFocusWidgets.delete(host);
}

export function unmountDealScaleFocusWidgets() {
	mountedFocusWidgets.forEach((_value, host) => {
		unmountDealScaleFocusWidget(host);
	});
}

declare global {
	interface Window {
		mountDealScaleFocusWidget?: (options?: MountOptions) => void;
		remountDealScaleFocusWidget?: (
			host: Element,
			options?: MountOptions,
		) => void;
		unmountDealScaleFocusWidgets?: () => void;
	}
}

if (typeof window !== "undefined") {
	window.mountDealScaleFocusWidget = mountDealScaleFocusWidget;
	window.remountDealScaleFocusWidget = remountDealScaleFocusWidget;
	window.unmountDealScaleFocusWidgets = unmountDealScaleFocusWidgets;
}
