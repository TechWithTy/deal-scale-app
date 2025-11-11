import { act, fireEvent, render, screen } from "@testing-library/react";
import React, { type CSSProperties, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	VOICE_HEIGHT,
	VOICE_MAX_HEIGHT,
	WIDGET_MAX_WIDTH,
	WIDGET_MINIMIZED_HEIGHT,
	WIDGET_WIDTH,
} from "@/components/ui/floating-music-widget/constants";
import {
	resetMusicPreferencesStore,
	useMusicPreferencesStore,
} from "@/lib/stores/musicPreferences";

vi.mock("lottie-react", () => {
	return {
		__esModule: true,
		default: vi.fn(() => <div data-testid="voice-lottie" />),
	};
});

vi.mock("@/components/ui/typewriter-effect", () => ({
	TypewriterEffect: () => <div data-testid="typewriter" />,
}));

vi.mock("react-rnd", () => {
	let capturedProps: MockRndProps | null = null;
	function Rnd(props: MockRndProps) {
		capturedProps = props;
		const { children, style, ...rest } = props;
		const testId = (rest["data-testid"] as string | undefined) ?? "mock-rnd";
		return (
			<div data-testid={testId} style={style}>
				{typeof children === "function" ? children({}) : children}
			</div>
		);
	}
	Object.assign(Rnd, {
		__capturedProps: () => capturedProps,
	});
	return { Rnd };
});

type MockRndProps = {
	children?: ReactNode | ((args: Record<string, never>) => ReactNode);
	style?: CSSProperties;
	"data-testid"?: string;
	position?: { x: number; y: number };
	size?: { width: number; height: number };
	onResize?: (
		event: unknown,
		direction: unknown,
		ref: HTMLElement,
		delta: { height: number; width: number },
		position: { x: number; y: number },
	) => void;
	onResizeStop?: (
		event: unknown,
		direction: unknown,
		ref: HTMLElement,
		delta: { height: number; width: number },
		position: { x: number; y: number },
	) => void;
} & Record<string, unknown>;

describe("FloatingMusicWidget", () => {
	beforeEach(() => {
		resetMusicPreferencesStore();
		localStorage.clear();
		document.body.innerHTML = '<div id="floating-ui-root"></div>';
		vi.restoreAllMocks();
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(JSON.stringify({ success: true }), {
				status: 200,
			}) as Response,
		);
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	it("does not render when music feature is disabled", async () => {
		const { default: FloatingMusicWidget } = await import(
			"@/components/ui/FloatingMusicWidget"
		);
		render(<FloatingMusicWidget />);
		expect(screen.queryByTestId("floating-music-widget")).toBeNull();
	});

	it("renders iframe when enabled and uses top-left default", async () => {
		await act(async () => {
			useMusicPreferencesStore.getState().setEnabled(true);
		});
		const { default: FloatingMusicWidget } = await import(
			"@/components/ui/FloatingMusicWidget"
		);
		render(<FloatingMusicWidget />);
		const widget = await screen.findByTestId("floating-music-widget");
		expect(widget).toBeTruthy();

		const { Rnd } = await import("react-rnd");
		const captured = (
			Rnd as unknown as {
				__capturedProps: () => MockRndProps | null;
			}
		).__capturedProps();
		expect(captured?.position).toEqual({ x: 16, y: 16 });
		expect(captured?.size).toEqual({
			width: WIDGET_WIDTH,
			height: VOICE_HEIGHT,
		});
	});

	it("updates width and height on resize stop", async () => {
		await act(async () => {
			useMusicPreferencesStore.getState().setEnabled(true);
		});
		const { default: FloatingMusicWidget } = await import(
			"@/components/ui/FloatingMusicWidget"
		);
		render(<FloatingMusicWidget />);
		const { Rnd } = await import("react-rnd");
		const captured = (
			Rnd as unknown as {
				__capturedProps: () => MockRndProps | null;
			}
		).__capturedProps();
		const resizeStop = captured?.onResizeStop;
		expect(resizeStop).toBeTypeOf("function");
		const ref = {
			offsetHeight: 260,
			offsetWidth: 350,
		} as unknown as HTMLElement;
		await act(async () => {
			resizeStop?.(
				null,
				"bottomRight",
				ref,
				{ height: 0, width: 0 },
				{ x: 24, y: 32 },
			);
		});
		expect(useMusicPreferencesStore.getState().widgetHeights.voice).toBe(260);
		expect(useMusicPreferencesStore.getState().widgetWidth).toBe(350);
	});

	it("shows CSP fallback notice when Spotify embed blocked", async () => {
		vi.useFakeTimers();
		const warnSpy = vi
			.spyOn(console, "warn")
			.mockImplementation(() => undefined);
		const loadSpy = vi
			.spyOn(HTMLIFrameElement.prototype, "addEventListener")
			.mockImplementation(function addEventListener(type, listener, options) {
				if (type === "load") {
					return;
				}
				return EventTarget.prototype.addEventListener.call(
					this,
					type,
					listener as EventListenerOrEventListenerObject,
					options,
				);
			});
		await act(async () => {
			useMusicPreferencesStore.getState().setEnabled(true);
			useMusicPreferencesStore.getState().setMode("music");
			useMusicPreferencesStore.getState().setProvider("spotify");
		});
		const { default: FloatingMusicWidget } = await import(
			"@/components/ui/FloatingMusicWidget"
		);
		render(<FloatingMusicWidget />);
		await act(async () => {
			vi.advanceTimersByTime(3200);
			await Promise.resolve();
		});
		vi.useRealTimers();
		const fallback = await screen.findByText(
			/Spotify embed blocked by Content Security Policy/i,
		);
		expect(fallback).toBeInTheDocument();
		expect(warnSpy).toHaveBeenCalled();
		loadSpy.mockRestore();
		warnSpy.mockRestore();
		vi.useRealTimers();
	});

	it("minimizes and restores via header controls", async () => {
		await act(async () => {
			useMusicPreferencesStore.getState().setEnabled(true);
		});
		const { default: FloatingMusicWidget } = await import(
			"@/components/ui/FloatingMusicWidget"
		);
		render(<FloatingMusicWidget />);

		const minimizeButton = await screen.findByRole("button", {
			name: /minimize focus widget/i,
		});

		await act(async () => {
			fireEvent.click(minimizeButton);
		});

		expect(useMusicPreferencesStore.getState().widgetView.voice).toBe(
			"minimized",
		);
		{
			const { Rnd } = await import("react-rnd");
			const captured = (
				Rnd as unknown as {
					__capturedProps: () => MockRndProps | null;
				}
			).__capturedProps();
			expect(captured?.size).toEqual({
				width: WIDGET_WIDTH,
				height: WIDGET_MINIMIZED_HEIGHT,
			});
		}

		await act(async () => {
			fireEvent.click(minimizeButton);
		});

		expect(useMusicPreferencesStore.getState().widgetView.voice).toBe(
			"default",
		);
		{
			const { Rnd } = await import("react-rnd");
			const captured = (
				Rnd as unknown as {
					__capturedProps: () => MockRndProps | null;
				}
			).__capturedProps();
			expect(captured?.size).toEqual({
				width: WIDGET_WIDTH,
				height: VOICE_HEIGHT,
			});
		}
	});

	it("maximizes and restores via header controls", async () => {
		await act(async () => {
			useMusicPreferencesStore.getState().setEnabled(true);
		});
		const { default: FloatingMusicWidget } = await import(
			"@/components/ui/FloatingMusicWidget"
		);
		render(<FloatingMusicWidget />);

		const maximizeButton = await screen.findByRole("button", {
			name: /maximize focus widget/i,
		});

		await act(async () => {
			fireEvent.click(maximizeButton);
		});

		expect(useMusicPreferencesStore.getState().widgetView.voice).toBe(
			"maximized",
		);
		expect(useMusicPreferencesStore.getState().widgetWidth).toBe(
			WIDGET_MAX_WIDTH,
		);
		expect(useMusicPreferencesStore.getState().widgetHeights.voice).toBe(
			VOICE_MAX_HEIGHT,
		);

		const restoreButton = await screen.findByRole("button", {
			name: /restore focus widget size/i,
		});

		await act(async () => {
			fireEvent.click(restoreButton);
		});

		expect(useMusicPreferencesStore.getState().widgetView.voice).toBe(
			"default",
		);
		expect(useMusicPreferencesStore.getState().widgetWidth).toBe(WIDGET_WIDTH);
		expect(useMusicPreferencesStore.getState().widgetHeights.voice).toBe(
			VOICE_HEIGHT,
		);
	});

	it("closes the widget via the header control", async () => {
		await act(async () => {
			useMusicPreferencesStore.getState().setEnabled(true);
		});
		const { default: FloatingMusicWidget } = await import(
			"@/components/ui/FloatingMusicWidget"
		);
		render(<FloatingMusicWidget />);

		const closeButton = await screen.findByRole("button", {
			name: /close focus widget/i,
		});

		await act(async () => {
			fireEvent.click(closeButton);
		});

		expect(useMusicPreferencesStore.getState().preferences.enabled).toBe(false);
		expect(screen.queryByTestId("floating-music-widget")).toBeNull();
	});
});
