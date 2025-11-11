import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";

import {
	PhoneModePanel,
	VideoModePanel,
	VoiceModePanel,
	type VoiceMediaEvent,
} from "@/components/ui/floating-music-widget/VoiceModePanel";
import {
	resetMusicPreferencesStore,
	useMusicPreferencesStore,
} from "@/lib/stores/musicPreferences";
import {
	resetAIChatStore,
	useAIChatStore,
} from "@/lib/stores/user/ai/chat";

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

vi.mock("@/lib/stores/user/prompts", () => {
	const templates = [
		{
			id: "workflow-template-1",
			name: "Workflow Kickoff",
			description: "Bootstrap a workflow",
			category: "workflow",
			content: "Start workflow sequence...",
			variables: [],
			tags: ["workflow", "automation"],
			isBuiltIn: true,
		},
	];
	const savedPrompts = [
		{
			id: "campaign-prompt-1",
			name: "Campaign Touchpoint",
			content: "Draft touchpoint...",
			category: "campaign",
			variables: [],
			tags: ["campaign", "follow-up"],
			favorite: false,
			usageCount: 0,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];
	return {
		useUserPromptsStore: (selector: (state: any) => unknown) =>
			selector({
				templates,
				savedPrompts,
			}),
	};
});

const originalMediaDevices = navigator.mediaDevices;
const originalClipboard = navigator.clipboard;

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
	resetAIChatStore();
	});

	afterEach(() => {
		dispatchSpy.mockRestore();
		resetMusicPreferencesStore();
	resetAIChatStore();
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
		if (originalClipboard) {
			Object.defineProperty(navigator, "clipboard", {
				value: originalClipboard,
				configurable: true,
			});
		} else if ("clipboard" in navigator) {
			// @ts-expect-error - test cleanup
			delete navigator.clipboard;
		}
		vi.clearAllMocks();
	});

	const renderPanel = (
		onMediaEvent?: (event: VoiceMediaEvent) => void,
		onRequestBrowserAccess?: () => void,
		onClipboardPaste?: (content: string) => void,
		onAgentSelect?: (agentId: string) => void,
	) =>
		render(
			<VoiceModePanel
				isAnimating
				onToggleAnimation={vi.fn()}
				voiceLottieRef={{ current: { play: vi.fn(), pause: vi.fn() } } as any}
				onAgentSelect={onAgentSelect}
				onClipboardPaste={onClipboardPaste}
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

	it("surfaces asset and prompt quick picks from the library", () => {
		renderPanel();

	const resourcesTrigger = screen.getAllByRole("button", {
		name: /resources & files/i,
	})[0];
		fireEvent.click(resourcesTrigger);

		const assetButton = screen.getByRole("button", {
			name: /market intro asset/i,
		});
		fireEvent.click(assetButton);

		let history = useMusicPreferencesStore.getState().sessionHistory;
		expect(history[0]?.id).toBe("prompt-market-intro");

	const promptsTrigger = screen.getAllByRole("button", {
		name: /sales scripts & prompts/i,
	})[0];
		fireEvent.click(promptsTrigger);

		const promptButton = screen.getByRole("button", {
			name: /campaign touchpoint/i,
		});
		fireEvent.click(promptButton);

		history = useMusicPreferencesStore.getState().sessionHistory;
		expect(history[0]?.id).toBe("prompt-campaign-prompt-1");
	});

it("renders the voice status indicator and reacts to state changes", async () => {
	renderPanel();

	await screen.findAllByText(/Streaming DealScale insights in real time/i);

	act(() => {
		useMusicPreferencesStore
			.getState()
			.setVoiceStatus("reconnecting", {
				force: true,
				message: "Reconnecting to voice pipeline…",
			});
	});

	await waitFor(() => {
		expect(useMusicPreferencesStore.getState().voiceStatus).toBe(
			"reconnecting",
		);
	});

	await waitFor(() =>
		expect(useMusicPreferencesStore.getState().voiceStatus).toBe(
			"reconnecting",
		),
	);
});

it("renders video mode without voice controls", () => {
	render(
		<VideoModePanel
			onAgentSelect={vi.fn()}
			onMediaEvent={vi.fn()}
			onRequestBrowserAccess={vi.fn()}
		/>,
	);
	expect(screen.queryByTestId("voice-lottie")).toBeNull();
	expect(screen.getAllByText(/live/i)[0]).toBeInTheDocument();
});

it("handles phone call lifecycle", async () => {
	const onMediaEvent = vi.fn();
	render(
		<PhoneModePanel
			onAgentSelect={vi.fn()}
			onMediaEvent={onMediaEvent}
			onRequestBrowserAccess={vi.fn()}
		/>,
	);

fireEvent.click(screen.getByRole("button", { name: /place call/i }));

	expect(
		await screen.findByText(/Dialing secure line/i),
	).toBeInTheDocument();

	expect(
		await screen.findByText(/Call connected/i, {
			selector: "strong",
		}),
	).toBeInTheDocument();
	expect(onMediaEvent).toHaveBeenCalledWith({ type: "call", status: "pending" });
	expect(onMediaEvent).toHaveBeenCalledWith({ type: "call", status: "granted" });
});

it("delivers sms updates in phone mode", async () => {
	render(
		<PhoneModePanel
			onAgentSelect={vi.fn()}
			onMediaEvent={vi.fn()}
			onRequestBrowserAccess={vi.fn()}
		/>,
	);

	fireEvent.click(screen.getAllByRole("button", { name: /send sms/i })[0]);
	expect(
		await screen.findByText(/Sending SMS/i),
	).toBeInTheDocument();

	expect(
		await screen.findByText(/SMS delivered/i, {
			selector: "strong",
		}),
	).toBeInTheDocument();
});

it("activates a session thread when selected", () => {
	const now = new Date().toISOString();
	useAIChatStore.setState({
		threads: [
			{
				id: "thread-1",
				title: "Demo Session",
				messages: [],
				createdAt: now,
				updatedAt: now,
			},
		],
		currentThreadId: undefined,
	});

	renderPanel();

	const sessionsTrigger = screen.getAllByRole("button", {
		name: /my sessions/i,
	})[0];
	fireEvent.click(sessionsTrigger);

	const sessionButton = screen.getAllByRole("button", {
		name: /demo session\s+updated now/i,
	})[0];
	fireEvent.click(sessionButton);

	expect(useAIChatStore.getState().currentThreadId).toBe("thread-1");
});

it("toggles session bookmarks from the quick strip", () => {
	const now = new Date().toISOString();
	useAIChatStore.setState({
		threads: [
			{
				id: "thread-2",
				title: "Bookmarkable Session",
				messages: [],
				createdAt: now,
				updatedAt: now,
			},
		],
		currentThreadId: undefined,
	});

	renderPanel();

	const bookmarkTrigger = screen.getAllByRole("button", {
		name: /my sessions/i,
	})[0];
	fireEvent.click(bookmarkTrigger);

	const bookmarkButton = screen.getAllByLabelText(
		/bookmark bookmarkable session/i,
	)[0];
	fireEvent.click(bookmarkButton);

	expect(
		useMusicPreferencesStore
			.getState()
			.bookmarkedSessionIds.includes("thread-2"),
	).toBe(true);

	const removeButton = screen.getAllByLabelText(
		/remove bookmark for bookmarkable session/i,
	)[0];
	fireEvent.click(removeButton);

	expect(
		useMusicPreferencesStore
			.getState()
			.bookmarkedSessionIds.includes("thread-2"),
	).toBe(false);
});

it("pastes clipboard content and notifies listeners", async () => {
	const readText = vi.fn().mockResolvedValue("Deal summary for briefing");
	Object.defineProperty(navigator, "clipboard", {
		value: { readText },
		configurable: true,
	});

	renderPanel();

	const clipboardButton = screen.getAllByRole("button", {
		name: /paste clipboard content/i,
	})[0];

	fireEvent.click(clipboardButton);

	await waitFor(() =>
		expect(dispatchSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "dealScale:focusWidget:clipboardPaste",
				detail: expect.objectContaining({
					content: "Deal summary for briefing",
				}),
			}),
		),
	);
	expect(readText).toHaveBeenCalledTimes(1);
	await screen.findByText(/clipboard status: success/i);
});

it("surfaces an error when clipboard api is unavailable", async () => {
	if ("clipboard" in navigator) {
		// @ts-expect-error - test cleanup
		delete navigator.clipboard;
	}

	renderPanel();

	const clipboardButton = screen.getAllByRole("button", {
		name: /paste clipboard content/i,
	})[0];

	fireEvent.click(clipboardButton);

	await screen.findByText(/clipboard status: error/i);
	expect(dispatchSpy).not.toHaveBeenCalledWith(
		expect.objectContaining({
			type: "dealScale:focusWidget:clipboardPaste",
		}),
	);
});
});

