import { State } from "country-state-city";

const countryCode = "US";

/**
 * Given an ISO code like "AZ", return the state name like "Arizona".
 * Returns "" if no match is found.
 */
export function getStateNameByIsoCode(stateIsoCode: string): string {
	const states = State.getStatesOfCountry(countryCode);
	if (!states) return "";

	// Find the state object where isoCode matches (case-insensitive)
	const found = states.find(
		(st) => st.isoCode.toLowerCase() === stateIsoCode.toLowerCase(),
	);

	// Return the matched state name or fallback to empty string
	return found?.name || "";
}
