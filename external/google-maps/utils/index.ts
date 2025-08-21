import type { MapInit } from "../types";

export function buildMapOptions(init: MapInit): google.maps.MapOptions {
	return {
		center: init.center,
		zoom: init.zoom ?? 12,
		gestureHandling: "greedy",
		mapTypeControl: false,
		streetViewControl: false,
		fullscreenControl: true,
		// Align with dashboard map styling if mapId is configured
		mapId: process.env.NEXT_PUBLIC_GMAPS_MAP_ID,
	};
}

export function fitToPin(
	map: google.maps.Map,
	coords: google.maps.LatLngLiteral,
) {
	const bounds = new google.maps.LatLngBounds();
	bounds.extend(coords);
	map.fitBounds(bounds);
}

export function parseLatLng(latStr: string, lngStr: string) {
	const lat = Number(latStr);
	const lng = Number(lngStr);
	if (Number.isFinite(lat) && Number.isFinite(lng))
		return { lat, lng } as const;
	return null;
}

export function assertApiLoaded(): void {
	const w = globalThis as unknown as { google?: typeof google };
	if (
		!w.google ||
		!(w.google as any).maps ||
		typeof (w.google as any).maps.Map !== "function"
	) {
		throw new Error("Google Maps API not loaded (maps namespace missing)");
	}
}
