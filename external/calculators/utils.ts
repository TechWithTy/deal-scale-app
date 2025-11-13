"use strict";

export type CalculatorPrefillMap = Record<string, Record<string, string>>;

export function parseCalculatorSearchParams(
	queryString: string,
	validCalculatorIds: string[],
): CalculatorPrefillMap {
	const params = new URLSearchParams(queryString);
	const validIds = new Set(validCalculatorIds);
	const result: CalculatorPrefillMap = {};

	for (const [key, value] of params.entries()) {
		const match = key.match(/^([\w-]+)\[([^\]]+)\]$/);
		if (!match) continue;
		const [, calculatorId, field] = match;
		if (!validIds.has(calculatorId)) continue;

		if (!result[calculatorId]) {
			result[calculatorId] = {};
		}
		result[calculatorId][field] = value;
	}

	return result;
}

export function getActiveCalculatorId(
	queryString: string,
	validCalculatorIds: string[],
): string | undefined {
	const params = new URLSearchParams(queryString);
	const requested = params.get("calc") || undefined;
	if (!requested) return undefined;
	return validCalculatorIds.includes(requested) ? requested : undefined;
}
