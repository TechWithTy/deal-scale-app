import { State, City } from "country-state-city";

const usStates = State.getStatesOfCountry("US");

export const isValidUSState = (input: string): boolean => {
	const normalizedInput = input.trim().toLowerCase();
	return usStates.some(
		(state) =>
			state.name.toLowerCase() === normalizedInput ||
			state.isoCode.toLowerCase() === normalizedInput,
	);
};

export const isValidUSCity = (input: string, stateCode?: string): boolean => {
	const normalizedInput = input.trim().toLowerCase();
	const cities = stateCode
		? City.getCitiesOfState("US", stateCode)
		: City.getAllCities();

	return cities.some((city) => city.name.toLowerCase() === normalizedInput);
};

export const isValidZipCode = (zip: string): boolean => {
	const normalized = zip.trim();
	return /^\d{5}$/.test(normalized) && normalized !== "00000";
};

export const isLikelyAddress = (input: string): boolean => {
	// Simple heuristic: check for a number followed by a space and text.
	return /\d+\s+[a-zA-Z]/.test(input);
};
