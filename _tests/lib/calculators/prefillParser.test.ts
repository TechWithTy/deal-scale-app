import { describe, expect, it } from "vitest";

import {
	getActiveCalculatorId,
	parseCalculatorSearchParams,
} from "external/calculators/utils";

const KNOWN_CALCULATORS = [
	"fix-flip-roi",
	"rental-cashflow",
	"wholesale",
];

describe("parseCalculatorSearchParams", () => {
	it("extracts namespaced parameters for known calculators", () => {
		const query =
			"calc=fix-flip-roi&fix-flip-roi[arv]=350000&fix-flip-roi[purchasePrice]=200000&unknown[param]=123";
		const map = parseCalculatorSearchParams(query, KNOWN_CALCULATORS);

		expect(map["fix-flip-roi"]).toEqual({
			arv: "350000",
			purchasePrice: "200000",
		});
		expect(map["wholesale"]).toBeUndefined();
	});

	it("ignores calculators that are not registered", () => {
		const query = "other[foo]=bar";
		const map = parseCalculatorSearchParams(query, KNOWN_CALCULATORS);
		expect(map).toEqual({});
	});
});

describe("getActiveCalculatorId", () => {
	it("returns the calc parameter when it matches a known calculator", () => {
		const query = "calc=rental-cashflow&something=else";
		expect(getActiveCalculatorId(query, KNOWN_CALCULATORS)).toBe(
			"rental-cashflow",
		);
	});

	it("returns undefined when calc parameter is missing or invalid", () => {
		expect(getActiveCalculatorId("", KNOWN_CALCULATORS)).toBeUndefined();
		expect(
			getActiveCalculatorId("calc=unknown", KNOWN_CALCULATORS),
		).toBeUndefined();
	});
});














