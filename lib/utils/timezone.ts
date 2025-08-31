import { find } from "geo-tz";

/**
 * Return all matching IANA timezones for a coordinate pair.
 * Most places return a single timezone string.
 */
export function getTimezonesForCoords(lat: number, lng: number): string[] {
	try {
		return find(lat, lng);
	} catch {
		return [];
	}
}

/**
 * Return the first timezone for given coordinates or undefined if none found.
 */
export function getPrimaryTimezoneForCoords(
	lat: number,
	lng: number,
): string | undefined {
	const zones = getTimezonesForCoords(lat, lng);
	return zones[0];
}
