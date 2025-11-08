import React, { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";

import { EmbedCommandPaletteFrame } from "@/components/external/embed-command-palette-frame";
import {
	ensureStylesheet,
	normalizeError,
	renderConfigError,
	type MountOptions,
} from "external/embed/shared";
import {
	parseCommandPaletteHost,
	type CommandPaletteEmbedConfig,
} from "./config";

const DEFAULT_SELECTOR = "[data-dealscale-command-palette]";
const mountedPalettes = new Map<
	Element,
	{ root: Root; config: CommandPaletteEmbedConfig }
>();

function renderHost(host: Element, options: MountOptions) {
	try {
		const config = parseCommandPaletteHost(host);
		host.replaceChildren();
		host.setAttribute("data-command-palette-mounted", "true");
		const root = createRoot(host);
		root.render(
			<StrictMode>
				<EmbedCommandPaletteFrame config={config} />
			</StrictMode>,
		);
		mountedPalettes.set(host, { root, config });
		return config;
	} catch (error) {
		const resolved = normalizeError(error);
		renderConfigError(host, resolved, "Invalid command palette configuration", {
			flag: "data-command-palette-error",
			message: "data-command-palette-error-message",
		});
		if (process.env.NODE_ENV !== "production") {
			// eslint-disable-next-line no-console
			console.error("Deal Scale command palette mount error:", resolved);
		}
		options.onError?.(resolved);
		return null;
	}
}

export function mountDealScaleCommandPalette(options: MountOptions = {}) {
	if (typeof window === "undefined") {
		return;
	}

	ensureStylesheet(
		"dealscale-command-palette-style",
		"/embed/deal-scale-command-palette.css",
	);

	const selector = options.selector ?? DEFAULT_SELECTOR;
	const hosts = document.querySelectorAll<Element>(selector);

	hosts.forEach((host) => {
		if (mountedPalettes.has(host)) {
			return;
		}
		renderHost(host, options);
	});
}

export function remountDealScaleCommandPalette(
	host: Element,
	options: MountOptions = {},
) {
	unmountDealScaleCommandPalette(host);
	renderHost(host, options);
}

export function unmountDealScaleCommandPalette(host: Element) {
	const mounted = mountedPalettes.get(host);
	if (!mounted) {
		return;
	}

	mounted.root.unmount();
	host.removeAttribute("data-command-palette-mounted");
	host.removeAttribute("data-command-palette-error");
	mountedPalettes.delete(host);
}

export function unmountDealScaleCommandPalettes() {
	mountedPalettes.forEach((_value, host) => {
		unmountDealScaleCommandPalette(host);
	});
}

declare global {
	interface Window {
		mountDealScaleCommandPalette?: (
			options?: MountOptions,
		) => void;
		remountDealScaleCommandPalette?: (
			host: Element,
			options?: MountOptions,
		) => void;
		unmountDealScaleCommandPalettes?: () => void;
	}
}

if (typeof window !== "undefined") {
	window.mountDealScaleCommandPalette = mountDealScaleCommandPalette;
	window.remountDealScaleCommandPalette = remountDealScaleCommandPalette;
	window.unmountDealScaleCommandPalettes = unmountDealScaleCommandPalettes;
}

