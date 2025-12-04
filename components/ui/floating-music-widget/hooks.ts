"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
	const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
	const createdRef = useRef(false);

	useEffect(() => {
		if (typeof document === "undefined") return;
		const fallback = document.body;
		if (!fallback) return;

		let host = document.getElementById("floating-ui-root") as HTMLElement;
		if (!host) {
			host = document.createElement("div");
			host.id = "floating-ui-root";
			host.style.position = "fixed";
			host.style.top = "0";
			host.style.left = "0";
			host.style.width = "100%";
			host.style.height = "100%";
			host.style.pointerEvents = "none";
			fallback.append(host);
			createdRef.current = true;
		}
		setPortalNode(host);

		return () => {
			// Only cleanup if we created it and it still exists
			if (createdRef.current && host && host.parentNode === fallback) {
				try {
					fallback.removeChild(host);
					createdRef.current = false;
				} catch (e) {
					// Element may have already been removed
					console.debug(
						"[FocusWidget] Portal cleanup: element already removed",
						e,
					);
				}
			}
		};
	}, []);

	return portalNode;
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
