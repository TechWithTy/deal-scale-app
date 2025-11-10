"use client";

import { useEffect, useMemo, useRef } from "react";

import {
	DEFAULT_PLAYLIST_URI,
	SNAP_MARGIN,
	WIDGET_WIDTH,
} from "@/components/ui/floating-music-widget/constants";
import {
	type MusicWidgetPosition,
	useMusicPreferencesStore,
} from "@/lib/stores/musicPreferences";
import { calculateSnapAnchor, snapToEdge } from "@/lib/utils/snapToEdge";

export function useFloatingMusicPortal(): HTMLElement | null {
	return useMemo(() => {
		if (typeof document === "undefined") return null;
		const fallback = document.body;
		if (!fallback) return null;
		const host = document.getElementById("floating-ui-root");
		if (host) return host;
		const created = document.createElement("div");
		created.id = "floating-ui-root";
		created.style.position = "fixed";
		created.style.top = "0";
		created.style.left = "0";
		created.style.width = "100%";
		created.style.height = "100%";
		created.style.pointerEvents = "none";
		fallback.append(created);
		return created;
	}, []);
}

export function useFloatingMusicDebug(): {
	debugEnabled: boolean;
	debugPlaylist: string;
	shouldRender: boolean;
	effectiveProvider: "spotify" | "internal" | null;
	effectivePlaylistUri: string;
	preferences: StoredMusicPreferences;
} {
	const { preferences, setEnabled, setProvider, setPlaylistUri } =
		useMusicPreferencesStore((state) => ({
			preferences: state.preferences,
			setEnabled: state.setEnabled,
			setProvider: state.setProvider,
			setPlaylistUri: state.setPlaylistUri,
		}));

	const debugFlag = process.env.NEXT_PUBLIC_MUSIC_WIDGET_DEBUG;
	const debugEnabled =
		typeof debugFlag === "string" &&
		["1", "true", "yes", "on"].includes(debugFlag.toLowerCase());
	const debugPlaylist =
		process.env.NEXT_PUBLIC_MUSIC_WIDGET_DEBUG_PLAYLIST ?? DEFAULT_PLAYLIST_URI;

	const debugInitializedRef = useRef(false);

	useEffect(() => {
		if (!debugEnabled) {
			debugInitializedRef.current = false;
			return;
		}
		if (debugInitializedRef.current) return;
		debugInitializedRef.current = true;
		if (!preferences.enabled) setEnabled(true);
		if (preferences.provider !== "spotify") setProvider("spotify");
		if (preferences.playlistUri !== debugPlaylist)
			setPlaylistUri(debugPlaylist);
	}, [
		debugEnabled,
		debugPlaylist,
		preferences.enabled,
		preferences.playlistUri,
		preferences.provider,
		setEnabled,
		setPlaylistUri,
		setProvider,
	]);

	const effectiveProvider = debugEnabled ? "spotify" : preferences.provider;
	const effectivePlaylistUri =
		(debugEnabled ? debugPlaylist : preferences.playlistUri) ??
		DEFAULT_PLAYLIST_URI;
	const shouldRender = preferences.enabled;

	return {
		debugEnabled,
		debugPlaylist,
		shouldRender,
		effectiveProvider,
		effectivePlaylistUri,
		preferences,
	};
}

export function clampToViewport(
	position: MusicWidgetPosition,
	width: number,
	height: number,
): MusicWidgetPosition {
	if (typeof window === "undefined") return position;
	const snapped = snapToEdge(
		position,
		{ width, height },
		{
			viewportWidth: window.innerWidth,
			viewportHeight: window.innerHeight,
		},
		{ threshold: 0, margin: SNAP_MARGIN },
	);
	const anchor = calculateSnapAnchor(
		snapped,
		window.innerWidth,
		window.innerHeight,
		width,
		height,
	);
	return { ...snapped, anchor } as MusicWidgetPosition;
}
