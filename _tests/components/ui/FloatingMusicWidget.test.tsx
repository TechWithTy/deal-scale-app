import { act, render, screen } from "@testing-library/react";
import React, { type CSSProperties, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WIDGET_WIDTH } from "@/components/ui/floating-music-widget/constants";
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
		expect(captured?.size).toEqual({ width: WIDGET_WIDTH, height: 180 });
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
		expect(useMusicPreferencesStore.getState().widgetHeights.music).toBe(260);
		expect(useMusicPreferencesStore.getState().widgetWidth).toBe(350);
	});

	it("shows CSP fallback notice when Spotify embed blocked", async () => {
		vi.useFakeTimers();
		const warnSpy = vi
			.spyOn(console, "warn")
			.mockImplementation(() => undefined);
		await act(async () => {
			useMusicPreferencesStore.getState().setEnabled(true);
			useMusicPreferencesStore.getState().setProvider("spotify");
		});
		const { default: FloatingMusicWidget } = await import(
			"@/components/ui/FloatingMusicWidget"
		);
		render(<FloatingMusicWidget />);
		await act(async () => {
			vi.advanceTimersByTime(3200);
		});
		const fallback = await screen.findByText(
			/Spotify embed blocked by Content Security Policy/i,
		);
		expect(fallback).toBeInTheDocument();
		warnSpy.mockRestore();
		vi.useRealTimers();
	});
});
