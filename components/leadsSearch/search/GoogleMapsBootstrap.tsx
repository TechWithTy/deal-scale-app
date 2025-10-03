"use client";

import * as React from "react";

type Props = { children?: React.ReactNode };

type GoogleBootstrapWindow = typeof window & {
	google?: typeof google;
	__googleMapsReady?: boolean;
};

const GoogleMapsContext = React.createContext(false);

export function useGoogleMapsReady() {
	return React.useContext(GoogleMapsContext);
}

function buildSrc(key: string, mapId?: string) {
	const params = new URLSearchParams();
	if (key) params.set("key", key);
	// Load core libs used across the app; Places is required for Autocomplete
	params.set("libraries", "places,geometry,marker,drawing");
	// Use modern loader
	params.set("v", "weekly");
	params.set("loading", "async");
	if (mapId) params.set("map_ids", mapId);
	return `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
}

export default function GoogleMapsBootstrap({ children }: Props) {
	const [ready, setReady] = React.useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		const w = window as GoogleBootstrapWindow;
		return Boolean(w.__googleMapsReady || w.google?.maps?.places);
	});

	React.useEffect(() => {
		if (typeof window === "undefined" || ready) return;
		const w = window as GoogleBootstrapWindow;

		if (w.__googleMapsReady || w.google?.maps?.places) {
			w.__googleMapsReady = true;
			setReady(true);
			return;
		}

		const apiKey =
			process.env.NEXT_PUBLIC_GMAPS_KEY ||
			process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
			"";
		const mapId =
			process.env.NEXT_PUBLIC_GMAPS_MAP_ID ||
			process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ||
			undefined;

		if (!apiKey) return;

		let cancelled = false;
		let activeScript: HTMLScriptElement | null = null;

		const markReady = () => {
			if (cancelled) return;
			w.__googleMapsReady = true;
			setReady(true);
		};

		const handleLoad = () => {
			markReady();
			if (activeScript) {
				activeScript.dataset.loaded = "true";
			}
		};

		const handleError = () => {
			if (cancelled) return;
			activeScript?.removeEventListener("load", handleLoad);
		};

		const existing = document.querySelector(
			'script[src^="https://maps.googleapis.com/maps/api/js?"]',
		) as HTMLScriptElement | null;

		if (existing) {
			activeScript = existing;
			if (existing.dataset.loaded === "true" || w.google?.maps?.places) {
				markReady();
				return;
			}
			existing.addEventListener("load", handleLoad, { once: true });
			existing.addEventListener("error", handleError, { once: true });

			return () => {
				cancelled = true;
				existing.removeEventListener("load", handleLoad);
				existing.removeEventListener("error", handleError);
			};
		}

		activeScript = document.createElement("script");
		activeScript.src = buildSrc(apiKey, mapId);
		activeScript.async = true;
		activeScript.defer = true;
		activeScript.dataset.googleMapsBootstrap = "true";
		activeScript.addEventListener("load", handleLoad, { once: true });
		activeScript.addEventListener("error", handleError, { once: true });
		document.head.appendChild(activeScript);

		return () => {
			cancelled = true;
			activeScript?.removeEventListener("load", handleLoad);
			activeScript?.removeEventListener("error", handleError);
		};
	}, [ready]);

	const value = ready;

	return (
		<GoogleMapsContext.Provider value={value}>
			{(children as React.ReactElement) ?? null}
		</GoogleMapsContext.Provider>
	);
}
