"use client";

import * as React from "react";

type Props = { children?: React.ReactNode };

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
	React.useEffect(() => {
		if (typeof window === "undefined") return;
		const w = window as any;
		// Already present and Places loaded
		if (w.google?.maps?.places) return;

		const apiKey =
			process.env.NEXT_PUBLIC_GMAPS_KEY ||
			process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
			"";
		const mapId =
			process.env.NEXT_PUBLIC_GMAPS_MAP_ID ||
			process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ||
			undefined;

		// Avoid injecting if no key; LocationInput will still show validation, but no crash
		if (!apiKey) return;

		// Prevent duplicate tags
		const existing = document.querySelector(
			'script[src^="https://maps.googleapis.com/maps/api/js?"]',
		) as HTMLScriptElement | null;
		if (existing) return;

		const script = document.createElement("script");
		script.src = buildSrc(apiKey, mapId);
		script.async = true;
		script.defer = true;
		document.head.appendChild(script);

		return () => {
			// Keep the script for the session; do not remove to avoid reloading libraries
		};
	}, []);

	return (children as React.ReactElement) ?? null;
}
