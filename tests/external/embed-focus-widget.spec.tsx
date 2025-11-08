import React from "react";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
	mountDealScaleFocusWidget,
	remountDealScaleFocusWidget,
	unmountDealScaleFocusWidgets,
} from "external/embed/focus";
import { EmbedFocusWidget } from "@/components/external/embed-focus-widget";

const createHost = (attributes: Record<string, string> = {}) => {
	const host = document.createElement("div");
	host.dataset.dealscaleFocus = "";
	Object.entries(attributes).forEach(([key, value]) => {
		host.setAttribute(`data-${key}`, value);
	});
	document.body.append(host);
	return host;
};

const originalFetch = global.fetch;
const originalMediaDevices = navigator.mediaDevices;

describe("focus widget embed bootstrap", () => {
	afterEach(() => {
		unmountDealScaleFocusWidgets();
		cleanup();
		document.body.innerHTML = "";
		document.head.innerHTML = "";
		vi.clearAllMocks();
	});

	it("mounts the focus widget and injects stylesheet", () => {
		const host = createHost({ mode: "music" });

		mountDealScaleFocusWidget();

		expect(host).toHaveAttribute("data-focus-mounted", "true");
		expect(
			document.querySelector('link[data-dealscale-focus-style]'),
		).toBeTruthy();
	});

	it("supports remounting specific hosts", () => {
		const host = createHost({ mode: "music" });
		mountDealScaleFocusWidget();

		const spy = vi.spyOn(host, "replaceChildren");
		remountDealScaleFocusWidget(host);
		expect(spy).toHaveBeenCalled();
	});

	it("invokes onError for invalid configuration", () => {
		const host = createHost({ mode: "invalid" });
		const onError = vi.fn();
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		mountDealScaleFocusWidget({ onError });

		expect(onError).toHaveBeenCalledWith(
			expect.objectContaining({ message: expect.stringContaining("Invalid") }),
		);
		expect(host).toHaveAttribute("data-focus-error", "true");
		errorSpy.mockRestore();
	});
});

describe("EmbedFocusWidget component behaviour", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
		document.body.innerHTML = "";
	global.fetch = originalFetch;
		Object.defineProperty(window.navigator, "mediaDevices", {
			configurable: true,
			value: originalMediaDevices,
		});
	});

	it("renders music iframe and toggles modes", () => {
		render(
			<EmbedFocusWidget
				config={{
					mode: "music",
					theme: "dark",
					playlist: "spotify:playlist:37i9dQZF1DX8Uebhn9wzrS",
					openOnLoad: true,
					advancedConfig: {},
				}}
			/>,
		);

		expect(screen.getAllByRole("button", { name: /close/i })[0]).toBeDefined();
		expect(screen.getByTitle("Focus playlist")).toHaveAttribute(
			"src",
			expect.stringContaining("open.spotify.com"),
		);

		fireEvent.click(screen.getByRole("button", { name: /voice/i }));
		expect(
			screen
				.getByRole("button", { name: /voice/i })
				.getAttribute("aria-pressed"),
		).toBe("true");
	});

	it("fetches voice agents and handles failure states", async () => {
		const agents = [
			{ id: "1", name: "Closer", status: "online" },
			{ id: "2", name: "Coach" },
		];
		const fetchMock = vi.fn();
		fetchMock.mockResolvedValueOnce(
			new Response("nope", { status: 500, statusText: "Server error" }),
		);
		(global.fetch as unknown) = fetchMock;

		const onError = vi.fn();
		render(
			<EmbedFocusWidget
				config={{
					mode: "voice",
					theme: "light",
					playlist: "https://example.com/frame",
					openOnLoad: true,
					voiceWebhook: "https://api.example.com/agents",
					advancedConfig: { agentLimit: 2 },
				}}
				onError={onError}
			/>,
		);

		await waitFor(() =>
			expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument(),
		);
		expect(onError).toHaveBeenCalledTimes(1);
		expect(fetchMock).toHaveBeenCalledTimes(1);

		fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify(agents), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		fireEvent.click(screen.getByRole("button", { name: /try again/i }));

		await waitFor(() =>
			expect(screen.getByText("Closer")).toBeInTheDocument(),
		);
		expect(screen.getByText("Coach")).toBeInTheDocument();
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("requests permissions for media controls", async () => {
		const getDisplayMedia = vi.fn().mockResolvedValue({});
		const getUserMedia = vi.fn().mockRejectedValue(new Error("denied"));
		Object.defineProperty(window.navigator, "mediaDevices", {
			configurable: true,
			value: {
				getDisplayMedia,
				getUserMedia,
			},
		});

		const onError = vi.fn();
		render(
			<EmbedFocusWidget
				config={{
					mode: "voice",
					theme: "light",
					playlist: "https://example.com/frame",
					openOnLoad: true,
					advancedConfig: {},
				}}
				onError={onError}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: /share screen/i }));

		await waitFor(() => expect(getDisplayMedia).toHaveBeenCalled());
		expect(screen.getByText(/Screen sharing ready/i)).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: /share camera/i }));

		await waitFor(() => expect(getUserMedia).toHaveBeenCalled());
		await waitFor(() => expect(onError).toHaveBeenCalled());
		expect(screen.getByText(/Camera access blocked/i)).toBeInTheDocument();
	});
});

