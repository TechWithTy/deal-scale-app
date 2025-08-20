import type { MapInit } from "../types";

export function buildMapOptions(init: MapInit): google.maps.MapOptions {
	return {
		center: init.center,
		zoom: init.zoom ?? 12,
		gestureHandling: "greedy",
		mapTypeControl: false,
		streetViewControl: false,
		fullscreenControl: true,
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

export function assertApiLoaded(): asserts window is Window & {
	google: typeof google;
} {
	if (!("google" in window)) {
		throw new Error("Google Maps API not loaded");
	}
}
