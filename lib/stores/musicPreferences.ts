"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
	DEFAULT_WIDGET_HEIGHTS,
	DEFAULT_WIDGET_WIDTH,
	MAX_WIDGET_HEIGHTS,
	MIN_WIDGET_HEIGHTS,
	WIDGET_MAX_WIDTH,
	WIDGET_MIN_WIDTH,
} from "@/components/ui/floating-music-widget/constants";
import type { SnapAnchor } from "@/lib/utils/snapToEdge";
import type {
	VoicePaletteOption,
	VoiceSessionHistoryEntry,
} from "@/types/focus";

export type MusicWidgetMode = "music" | "voice";

export interface MusicWidgetPosition {
	x: number;
	y: number;
	anchor: SnapAnchor;
}

export interface StoredMusicPreferences {
	enabled: boolean;
	provider: "spotify" | "internal" | null;
	playlistUri: string | null;
	volume: number;
}

export type MusicWidgetHeights = Record<MusicWidgetMode, number>;

interface MusicPreferencesState {
	preferences: StoredMusicPreferences;
	widgetPosition: MusicWidgetPosition | null;
	widgetHeights: MusicWidgetHeights;
	widgetWidth: number;
	isSyncing: boolean;
	lastSyncedAt: number | null;
	mode: MusicWidgetMode;
	sessionHistory: VoiceSessionHistoryEntry[];
	setEnabled: (enabled: boolean) => void;
	setProvider: (provider: "spotify" | "internal" | null) => void;
	setPlaylistUri: (uri: string | null) => void;
	setVolume: (volume: number) => void;
	setMode: (mode: MusicWidgetMode) => void;
	setWidgetHeight: (mode: MusicWidgetMode, height: number) => void;
	setWidgetWidth: (width: number) => void;
	setWidgetPosition: (
		position: MusicWidgetPosition,
		options?: { sync?: boolean },
	) => Promise<void>;
	syncWidgetPosition: () => Promise<void>;
	addSessionHistory: (entry: VoicePaletteOption) => void;
	clearSessionHistory: () => void;
	reset: () => void;
}

function createDefaultPreferences(): StoredMusicPreferences {
	const debugEnabled = process.env.NEXT_PUBLIC_MUSIC_WIDGET_DEBUG === "true";
	const debugPlaylist =
		process.env.NEXT_PUBLIC_MUSIC_WIDGET_DEBUG_PLAYLIST ??
		"spotify:playlist:37i9dQZF1DX8Uebhn9wzrS";
	return {
		enabled: debugEnabled,
		provider: debugEnabled ? "spotify" : null,
		playlistUri: debugEnabled ? debugPlaylist : null,
		volume: debugEnabled ? 0.35 : 0.5,
	};
}

function createDefaultState(): Pick<
	MusicPreferencesState,
	| "preferences"
	| "widgetPosition"
	| "isSyncing"
	| "lastSyncedAt"
	| "mode"
	| "widgetHeights"
	| "widgetWidth"
	| "sessionHistory"
> {
	return {
		preferences: createDefaultPreferences(),
		widgetPosition: null,
		widgetHeights: { ...DEFAULT_WIDGET_HEIGHTS },
		widgetWidth: DEFAULT_WIDGET_WIDTH,
		isSyncing: false,
		lastSyncedAt: null,
		mode: "music",
		sessionHistory: [],
	};
}

export const MUSIC_PREFERENCES_STORAGE_KEY = "dealscale:music-preferences";

async function syncPositionToServer(
	position: MusicWidgetPosition,
): Promise<void> {
	await fetch("/api/music/widget-position", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ position }),
	});
}

export const useMusicPreferencesStore = create<MusicPreferencesState>()(
	persist(
		(set, get) => ({
			...createDefaultState(),
			setEnabled: (enabled) =>
				set((state) => ({
					preferences: { ...state.preferences, enabled },
				})),
			setProvider: (provider) =>
				set((state) => ({
					preferences: { ...state.preferences, provider },
				})),
			setPlaylistUri: (playlistUri) =>
				set((state) => ({
					preferences: { ...state.preferences, playlistUri },
				})),
			setVolume: (volume) =>
				set((state) => ({
					preferences: { ...state.preferences, volume },
				})),
			setWidgetPosition: async (position, options = {}) => {
				set({ widgetPosition: position });
				if (options.sync) {
					await get().syncWidgetPosition();
				}
			},
			setWidgetHeight: (mode, height) =>
				set((state) => {
					const min = MIN_WIDGET_HEIGHTS[mode];
					const max = MAX_WIDGET_HEIGHTS[mode];
					const clamped = Math.min(Math.max(height, min), max);
					return {
						widgetHeights: { ...state.widgetHeights, [mode]: clamped },
					};
				}),
			setWidgetWidth: (width) =>
				set((state) => {
					const clamped = Math.min(
						Math.max(width, WIDGET_MIN_WIDTH),
						WIDGET_MAX_WIDTH,
					);
					return { widgetWidth: clamped };
				}),
			syncWidgetPosition: async () => {
				const { widgetPosition } = get();
				if (!widgetPosition) return;
				set({ isSyncing: true });
				try {
					await syncPositionToServer(widgetPosition);
					set({ lastSyncedAt: Date.now() });
				} catch (error) {
					console.error("Failed to sync widget position", error);
				} finally {
					set({ isSyncing: false });
				}
			},
			setMode: (mode) => set({ mode }),
			addSessionHistory: (entry) =>
				set((state) => {
					const filtered = state.sessionHistory.filter(
						(item) => item.id !== entry.id,
					);
					const next: VoiceSessionHistoryEntry = {
						...entry,
						lastUsed: Date.now(),
					};
					return {
						sessionHistory: [next, ...filtered].slice(0, 8),
					};
				}),
			clearSessionHistory: () => set({ sessionHistory: [] }),
			reset: () => set(createDefaultState()),
		}),
		{
			name: MUSIC_PREFERENCES_STORAGE_KEY,
			storage: createJSONStorage(() => localStorage),
		},
	),
);

export function resetMusicPreferencesStore(): void {
	useMusicPreferencesStore.setState(createDefaultState());
}
