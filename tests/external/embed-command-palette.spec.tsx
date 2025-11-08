import { cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
	mountDealScaleCommandPalette,
	remountDealScaleCommandPalette,
	unmountDealScaleCommandPalettes,
} from "external/embed/command-palette";

vi.mock("@/components/external/embed-command-palette-frame", async () => {
	const React = await import("react");
	return {
		EmbedCommandPaletteFrame: ({ config }: { config: unknown }) =>
			React.createElement(
				"div",
				{
					"data-testid": "command-palette-frame",
					"data-variant": (config as { variant: string }).variant,
				},
				"Command palette ready",
			),
	};
});

const createHost = (attributes: Record<string, string> = {}) => {
	const host = document.createElement("div");
	host.dataset.dealscaleCommandPalette = "";
	Object.entries(attributes).forEach(([key, value]) => {
		host.setAttribute(`data-${key}`, value);
	});
	document.body.append(host);
	return host;
};

describe("command palette embed bootstrap", () => {
	const originalError = console.error;

	afterEach(() => {
		unmountDealScaleCommandPalettes();
		cleanup();
		document.head.innerHTML = "";
		document.body.innerHTML = "";
		if (window.DealActionBar) {
			window.DealActionBar = undefined;
		}
		console.error = originalError;
		vi.clearAllMocks();
	});

	it("mounts the command palette and injects stylesheet", () => {
		const host = createHost({
			variant: "floating",
			token: "TEST_TOKEN",
		});

		mountDealScaleCommandPalette();

		expect(host).toHaveAttribute("data-command-palette-mounted", "true");
		expect(
			document.querySelector('link[data-dealscale-command-palette-style]'),
		).toBeTruthy();
	});

	it("re-renders when remount is requested", () => {
		const host = createHost();
		mountDealScaleCommandPalette();

		const renderSpy = vi.spyOn(
			document.querySelector(
				"[data-dealscale-command-palette]",
			) as Element,
			"replaceChildren",
		);

		remountDealScaleCommandPalette(host);
		expect(renderSpy).toHaveBeenCalled();
		expect(host).toHaveAttribute("data-command-palette-mounted", "true");
	});

	it("surfaces configuration errors through onError callback", () => {
		const host = createHost({ variant: "invalid" });
		const onError = vi.fn();
		console.error = vi.fn();

		mountDealScaleCommandPalette({ onError });

		expect(onError).toHaveBeenCalledWith(
			expect.objectContaining({ message: expect.stringContaining("Invalid") }),
		);
		expect(host).toHaveAttribute("data-command-palette-error", "true");
		expect(
			host.querySelector(".deal-scale-embed-error"),
		).toHaveTextContent(/invalid command palette configuration/i);
	});
});

