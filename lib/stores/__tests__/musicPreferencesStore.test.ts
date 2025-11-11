import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	MAX_WIDGET_HEIGHTS,
	MIN_WIDGET_HEIGHTS,
	WIDGET_MAX_WIDTH,
	WIDGET_MIN_WIDTH,
	WIDGET_WIDTH,
} from "@/components/ui/floating-music-widget/constants";

type MusicPreferencesModule = typeof import("@/lib/stores/musicPreferences");

async function loadModule(): Promise<MusicPreferencesModule> {
	return import("@/lib/stores/musicPreferences");
}

function clearDebugEnv(): void {
	process.env.NEXT_PUBLIC_MUSIC_WIDGET_DEBUG = undefined;
	process.env.NEXT_PUBLIC_MUSIC_WIDGET_DEBUG_PLAYLIST = undefined;
}

describe("musicPreferences store", () => {
	beforeEach(() => {
		localStorage.clear();
		clearDebugEnv();
		vi.resetModules();
	});

	afterEach(() => {
		clearDebugEnv();
		vi.restoreAllMocks();
	});

	it("provides default preferences", async () => {
		const { useMusicPreferencesStore, resetMusicPreferencesStore } =
			await loadModule();
		const state = useMusicPreferencesStore.getState();
		expect(state.preferences.enabled).toBe(false);
		expect(state.preferences.provider).toBeNull();
		expect(state.preferences.volume).toBe(0.5);
		expect(state.widgetPosition).toBeNull();
		expect(state.widgetHeights.music).toBeGreaterThan(0);
		expect(state.widgetHeights.voice).toBeGreaterThan(0);
		expect(state.widgetHeights.video).toBeGreaterThan(0);
		expect(state.widgetWidth).toBe(WIDGET_WIDTH);
		expect(state.mode).toBe("voice");
		expect(state.bookmarkedSessionIds).toEqual([]);
		expect(state.widgetView.video).toBe("default");
		resetMusicPreferencesStore();
	});

	it("updates enabled flag", async () => {
		const { useMusicPreferencesStore, resetMusicPreferencesStore } =
			await loadModule();
		useMusicPreferencesStore.getState().setEnabled(true);
		expect(useMusicPreferencesStore.getState().preferences.enabled).toBe(true);
		resetMusicPreferencesStore();
	});

	it("persists widget position and syncs to backend", async () => {
		const {
			MUSIC_PREFERENCES_STORAGE_KEY,
			useMusicPreferencesStore,
			resetMusicPreferencesStore,
		} = await loadModule();
		const mockResponse = new Response(JSON.stringify({ success: true }), {
			status: 200,
		});
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(mockResponse as unknown as Response);

		const position = { x: 320, y: 180, anchor: "top-left" as const };
		await useMusicPreferencesStore
			.getState()
			.setWidgetPosition(position, { sync: true });

		const persisted = localStorage.getItem(MUSIC_PREFERENCES_STORAGE_KEY);
		expect(persisted).toBeTruthy();
		if (!persisted) throw new Error("expected persisted value");
		const parsed = JSON.parse(persisted) as {
			state: { widgetPosition: typeof position };
		};
		expect(parsed.state.widgetPosition).toEqual(position);

		expect(fetchSpy).toHaveBeenCalledWith(
			"/api/music/widget-position",
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					"Content-Type": "application/json",
				}),
				body: JSON.stringify({ position }),
			}),
		);
		resetMusicPreferencesStore();
	});

	it("switches widget mode and persists", async () => {
		const {
			MUSIC_PREFERENCES_STORAGE_KEY,
			useMusicPreferencesStore,
			resetMusicPreferencesStore,
		} = await loadModule();
		useMusicPreferencesStore.getState().setMode("phone");
		expect(useMusicPreferencesStore.getState().mode).toBe("phone");
		const persisted = localStorage.getItem(MUSIC_PREFERENCES_STORAGE_KEY);
		expect(persisted).toBeTruthy();
		if (!persisted) throw new Error("expected persisted value");
		const parsed = JSON.parse(persisted) as { state: { mode: string } };
		expect(parsed.state.mode).toBe("voice");
		resetMusicPreferencesStore();
	});

	it("enables mock focus music in debug mode", async () => {
		process.env.NEXT_PUBLIC_MUSIC_WIDGET_DEBUG = "true";
		process.env.NEXT_PUBLIC_MUSIC_WIDGET_DEBUG_PLAYLIST =
			"spotify:playlist:debug";
		vi.resetModules();
		const { useMusicPreferencesStore, resetMusicPreferencesStore } =
			await loadModule();
		const state = useMusicPreferencesStore.getState();
		expect(state.preferences.enabled).toBe(true);
		expect(state.preferences.provider).toBe("spotify");
		expect(state.preferences.playlistUri).toBe("spotify:playlist:debug");
		expect(state.preferences.volume).toBe(0.35);
		expect(state.mode).toBe("voice");
		resetMusicPreferencesStore();
	});

	it("clamps widget height updates", async () => {
		const { useMusicPreferencesStore, resetMusicPreferencesStore } =
			await loadModule();
		useMusicPreferencesStore.getState().setWidgetHeight("music", 600);
		expect(useMusicPreferencesStore.getState().widgetHeights.music).toBe(
			MAX_WIDGET_HEIGHTS.music,
		);
		useMusicPreferencesStore.getState().setWidgetHeight("voice", 40);
		expect(useMusicPreferencesStore.getState().widgetHeights.voice).toBe(
			MIN_WIDGET_HEIGHTS.voice,
		);
		useMusicPreferencesStore.getState().setWidgetHeight("video", 1000);
		expect(useMusicPreferencesStore.getState().widgetHeights.video).toBe(
			MAX_WIDGET_HEIGHTS.video,
		);
		useMusicPreferencesStore.getState().setWidgetHeight("video", 40);
		expect(useMusicPreferencesStore.getState().widgetHeights.video).toBe(
			MIN_WIDGET_HEIGHTS.video,
		);
		resetMusicPreferencesStore();
	});

	it("clamps widget width updates", async () => {
		const { useMusicPreferencesStore, resetMusicPreferencesStore } =
			await loadModule();
		useMusicPreferencesStore.getState().setWidgetWidth(999);
		expect(useMusicPreferencesStore.getState().widgetWidth).toBe(
			WIDGET_MAX_WIDTH,
		);
		useMusicPreferencesStore.getState().setWidgetWidth(120);
		expect(useMusicPreferencesStore.getState().widgetWidth).toBe(
			WIDGET_MIN_WIDTH,
		);
		resetMusicPreferencesStore();
	});

	it("toggles session bookmarks", async () => {
		const { useMusicPreferencesStore, resetMusicPreferencesStore } =
			await loadModule();
		useMusicPreferencesStore.getState().toggleSessionBookmark("session-1");
		expect(
			useMusicPreferencesStore
				.getState()
				.bookmarkedSessionIds.includes("session-1"),
		).toBe(true);
		useMusicPreferencesStore.getState().toggleSessionBookmark("session-1");
		expect(
			useMusicPreferencesStore
				.getState()
				.bookmarkedSessionIds.includes("session-1"),
		).toBe(false);
		resetMusicPreferencesStore();
	});

	it("updates widget view state", async () => {
		const { useMusicPreferencesStore, resetMusicPreferencesStore } =
			await loadModule();
		expect(useMusicPreferencesStore.getState().widgetView.voice).toBe(
			"default",
		);
		expect(useMusicPreferencesStore.getState().widgetView.video).toBe(
			"default",
		);
		useMusicPreferencesStore.getState().setWidgetView("voice", "minimized");
		expect(useMusicPreferencesStore.getState().widgetView.voice).toBe(
			"minimized",
		);
		useMusicPreferencesStore.getState().setWidgetView("voice", "maximized");
		expect(useMusicPreferencesStore.getState().widgetView.voice).toBe(
			"maximized",
		);
		useMusicPreferencesStore.getState().setWidgetView("video", "maximized");
		expect(useMusicPreferencesStore.getState().widgetView.video).toBe(
			"maximized",
		);
		useMusicPreferencesStore.getState().setWidgetView("video", "default");
		useMusicPreferencesStore.getState().setWidgetView("phone", "minimized");
		expect(useMusicPreferencesStore.getState().widgetView.phone).toBe(
			"minimized",
		);
		resetMusicPreferencesStore();
	});
});
