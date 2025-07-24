// ! Mock API for returning fake map marker coordinates
// Usage: import { fetchFakeMapMarkers } from "@/constants/_faker/_api/mockMapApi";
// fetchFakeMapMarkers({ bounds: { ... } }).then(setMarkers)

import type { Coordinate } from "@/types/_dashboard/maps";

export interface FetchFakeMapMarkersParams {
	// Optionally accept bounds or shape info for realism
	bounds?: { north: number; south: number; east: number; west: number };
	count?: number;
}

// Utility to generate random lat/lng within bounds
function randomLatLng(bounds: {
	north: number;
	south: number;
	east: number;
	west: number;
}): Coordinate {
	const lat = bounds.south + Math.random() * (bounds.north - bounds.south);
	const lng = bounds.west + Math.random() * (bounds.east - bounds.west);
	return { lat, lng };
}

/**
 * Simulate an API call that returns an array of fake coordinates
 * @param params FetchFakeMapMarkersParams
 * @returns Promise<Coordinate[]>
 */
export function fetchFakeMapMarkers(
	params: FetchFakeMapMarkersParams,
): Promise<Coordinate[]> {
	const {
		bounds = { north: 40.8, south: 40.6, east: -73.8, west: -74.1 }, // NYC area as default
		count = 10,
	} = params || {};
	const fakeMarkers: Coordinate[] = Array.from({ length: count }, () =>
		randomLatLng(bounds),
	);
	// Simulate network delay
	return new Promise((resolve) => {
		setTimeout(() => resolve(fakeMarkers), 600);
	});
}
