"use client";

import * as React from "react";

type Props = { children?: React.ReactNode };

type GoogleBootstrapWindow = typeof window & {
	google?: typeof google;
	__googleMapsReady?: boolean;
	__googleMapsImportPromise?: Promise<void>;
	__googleMapsFallbackAttempted?: boolean;
};

const GoogleMapsContext = React.createContext(false);

export function useGoogleMapsReady() {
	return React.useContext(GoogleMapsContext);
}

function buildSrc(key: string, mapId?: string, options?: { async?: boolean }) {
	const { async = true } = options ?? {};
	const params = new URLSearchParams();
	if (key) params.set("key", key);
	// Load core libs used across the app; Places is required for Autocomplete
	params.set("libraries", "places,geometry,marker,drawing");
	if (async) {
		// Pin to the weekly channel while opting into the async loader so Google
		// serves the modern, performance-optimised bootstrap script.
		params.set("loading", "async");
	}
	params.set("v", "weekly");
	if (mapId) params.set("map_ids", mapId);
	return `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
}

export default function GoogleMapsBootstrap({ children }: Props) {
	const [ready, setReady] = React.useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		const w = window as GoogleBootstrapWindow;
		return Boolean(
			w.__googleMapsReady || (w.google?.maps?.Map && w.google?.maps?.places),
		);
	});

	React.useEffect(() => {
		if (typeof window === "undefined" || ready) return;
		const w = window as GoogleBootstrapWindow;

		const IMPORT_LIBRARIES = [
			"maps",
			"places",
			"marker",
			"geometry",
			"drawing",
		] as const;

		let cancelled = false;
		let activeScript: HTMLScriptElement | null = null;

		const ensureLibraries = async () => {
			if (
				!w.google?.maps ||
				typeof w.google.maps.importLibrary !== "function"
			) {
				return;
			}

			if (!w.__googleMapsImportPromise) {
				const importLibrary = w.google.maps.importLibrary as (
					name: string,
				) => Promise<unknown>;

				// Import core maps library first to ensure legacy API compatibility
				const mapsLib = await importLibrary("maps");

				// Ensure legacy API structure is available for @react-google-maps/api compatibility
				if (mapsLib && typeof mapsLib === "object" && "Map" in mapsLib) {
					w.google.maps.Map = (mapsLib as any).Map;
					w.google.maps.Marker = (mapsLib as any).Marker;
					w.google.maps.LatLngBounds = (mapsLib as any).LatLngBounds;
					w.google.maps.LatLng = (mapsLib as any).LatLng;
					w.google.maps.InfoWindow = (mapsLib as any).InfoWindow;
					w.google.maps.Polyline = (mapsLib as any).Polyline;
					w.google.maps.Polygon = (mapsLib as any).Polygon;
					w.google.maps.Rectangle = (mapsLib as any).Rectangle;
					w.google.maps.Circle = (mapsLib as any).Circle;
				}

				const [primary, ...secondary] = IMPORT_LIBRARIES.slice(1); // Skip 'maps' as we already imported it
				w.__googleMapsImportPromise = Promise.all(
					secondary.map((library) =>
						// ! Optional libs may fail if disabled for the key;
						// swallow those errors to avoid breaking map rendering.
						importLibrary(library).catch(() => undefined),
					),
				)
					.then(() => undefined)
					.catch((error) => {
						w.__googleMapsImportPromise = undefined;
						throw error;
					});
			}

			return w.__googleMapsImportPromise;
		};

		const apiKey =
			process.env.NEXT_PUBLIC_GMAPS_KEY ||
			process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
			"";
		const mapId =
			process.env.NEXT_PUBLIC_GMAPS_MAP_ID ||
			process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ||
			undefined;

		if (!apiKey) return;

		const finalizeReady = () => {
			if (cancelled) return;
			w.__googleMapsReady = true;
			setReady(true);
			if (activeScript) {
				activeScript.dataset.loaded = "true";
			}
		};

		let fallbackToLegacy: () => void = () => {};

		const handleLoad = () => {
			ensureLibraries()
				.then(finalizeReady)
				.catch(() => {
					fallbackToLegacy();
				});
		};

		const handleError = () => {
			if (cancelled) return;
			activeScript?.removeEventListener("load", handleLoad);
		};

		fallbackToLegacy = () => {
			if (cancelled || w.__googleMapsFallbackAttempted) return;
			w.__googleMapsFallbackAttempted = true;
			w.__googleMapsReady = false;

			if (activeScript) {
				activeScript.removeEventListener("load", handleLoad);
				activeScript.removeEventListener("error", handleError);
				activeScript.dataset.loaded = "failed";
			}

			const fallbackScript = document.createElement("script");
			fallbackScript.src = buildSrc(apiKey, mapId, { async: false });
			fallbackScript.async = true;
			fallbackScript.defer = true;
			fallbackScript.dataset.googleMapsBootstrap = "fallback";
			fallbackScript.addEventListener("load", handleLoad, { once: true });
			fallbackScript.addEventListener("error", handleError, { once: true });
			document.head.appendChild(fallbackScript);
			activeScript = fallbackScript;
		};

		if (
			w.__googleMapsReady ||
			(w.google?.maps?.Map && w.google?.maps?.places)
		) {
			ensureLibraries()
				.then(finalizeReady)
				.catch(() => {
					fallbackToLegacy();
				});
			return;
		}

		const existing = document.querySelector(
			'script[src^="https://maps.googleapis.com/maps/api/js?"]',
		) as HTMLScriptElement | null;

		if (existing) {
			activeScript = existing;
			if (
				existing.dataset.loaded === "true" ||
				(w.google?.maps?.Map && w.google?.maps?.places)
			) {
				ensureLibraries()
					.then(finalizeReady)
					.catch(() => {
						fallbackToLegacy();
					});
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
