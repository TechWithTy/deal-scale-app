import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";

import {
	VoiceModePanel,
	type VoiceMediaEvent,
} from "@/components/ui/floating-music-widget/VoiceModePanel";
import { resetMusicPreferencesStore } from "@/lib/stores/musicPreferences";

vi.mock("motion/react", () => ({
	motion: {
		button: (props: React.ComponentPropsWithoutRef<"button">) => (
			<button {...props} />
		),
	},
}));

vi.mock("lottie-react", () => ({
	__esModule: true,
	default: () => <div data-testid="lottie" />,
}));

vi.mock("@/components/ui/track-command-palette", () => ({
	TrackCommandPalette: ({
		onSelect,
	}: {
		onSelect?: (option: {
			id: string;
			name: string;
			category: string;
			types: string[];
			description?: string;
		}) => void;
	}) => (
		<button
			type="button"
			data-testid="track-command-palette"
			onClick={() =>
				onSelect?.({
					id: "agent-001",
					name: "Test Agent",
					category: "AI Voices",
					types: ["clone"],
					description: "Test description",
				})
			}
		>
			Switch voice agent
		</button>
	),
}));

vi.mock("@/components/ui/typewriter-effect", () => ({
	TypewriterEffect: ({ words }: { words: Array<{ text: string }> }) => (
		<div data-testid="typewriter">{words.map((word) => word.text).join(" ")}</div>
	),
}));

const originalMediaDevices = navigator.mediaDevices;

const mockStream = () => ({
	getTracks: () => [
		{
			stop: vi.fn(),
		},
	],
});

describe("VoiceModePanel media permissions", () => {
	let dispatchSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		dispatchSpy = vi.spyOn(window, "dispatchEvent");
		resetMusicPreferencesStore();
	});

	afterEach(() => {
		dispatchSpy.mockRestore();
		resetMusicPreferencesStore();
		if (originalMediaDevices) {
			Object.defineProperty(navigator, "mediaDevices", {
				value: originalMediaDevices,
				configurable: true,
				writable: true,
			});
		} else {
			// biome-ignore lint/suspicious/noPrototypeBuiltins: removing for test cleanup
			if (navigator.hasOwnProperty("mediaDevices")) {
				// @ts-expect-error - allow cleanup for test shim
				delete navigator.mediaDevices;
			}
		}
		vi.clearAllMocks();
	});

	const renderPanel = (
		onMediaEvent?: (event: VoiceMediaEvent) => void,
		onRequestBrowserAccess?: () => void,
	) =>
		render(
			<VoiceModePanel
				isAnimating
				onToggleAnimation={vi.fn()}
				voiceLottieRef={{ current: { play: vi.fn(), pause: vi.fn() } } as any}
				onMediaEvent={onMediaEvent}
				onRequestBrowserAccess={onRequestBrowserAccess}
			/>,
		);

	it("requests screen share and reports success", async () => {
		const getDisplayMedia = vi.fn().mockResolvedValue(mockStream());
		const mediaDevices = {
			getDisplayMedia,
			getUserMedia: vi.fn(),
		};
		Object.defineProperty(navigator, "mediaDevices", {
			value: mediaDevices,
			configurable: true,
			writable: true,
		});
		const onMediaEvent = vi.fn();

		renderPanel(onMediaEvent);

		const shareScreenButton = screen.getByRole("button", { name: /share screen/i });
		fireEvent.click(shareScreenButton);

		await screen.findByText(/screen sharing enabled/i);

		expect(getDisplayMedia).toHaveBeenCalled();
		expect(onMediaEvent).toHaveBeenCalledWith({
			type: "screen-share",
			status: "pending",
		});
		expect(onMediaEvent).toHaveBeenCalledWith({
			type: "screen-share",
			status: "granted",
		});
		await waitFor(() =>
			expect(dispatchSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "dealScale:focusWidget:mediaEvent",
				}),
			),
		);
	});

	it("fires browser access callback after press-and-hold", () => {
		vi.useFakeTimers();
		const onBrowserAccess = vi.fn();

		renderPanel(undefined, onBrowserAccess);

		const browserButton = screen.getByLabelText(
			/press and hold to enable browser assistance/i,
		);
		fireEvent.pointerDown(browserButton);
		vi.advanceTimersByTime(1500);
		fireEvent.pointerUp(browserButton);

		expect(onBrowserAccess).toHaveBeenCalledTimes(1);

		vi.useRealTimers();
	});

	it("handles webcam permission denial and retries", async () => {
		const error = new Error("User denied camera access");
		const getUserMedia = vi
			.fn()
			.mockRejectedValueOnce(error)
			.mockResolvedValueOnce(mockStream());
		const mediaDevices = {
			getDisplayMedia: vi.fn(),
			getUserMedia,
		};
		Object.defineProperty(navigator, "mediaDevices", {
			value: mediaDevices,
			configurable: true,
			writable: true,
		});
		const onMediaEvent = vi.fn();

		renderPanel(onMediaEvent);

		const webcamButton = screen.getAllByRole("button", {
			name: /share webcam/i,
		})[0];
		fireEvent.click(webcamButton);

		await screen.findByText(/webcam access blocked/i);

		const retryButton = screen.getAllByRole("button", { name: /try again/i })[0];
		fireEvent.click(retryButton);

		await screen.findByText(/webcam streaming/i);
		expect(getUserMedia).toHaveBeenCalledTimes(2);
	});
});

