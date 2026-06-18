import { describe, expect, it } from "vitest";

import {
	matchesResourceQuery,
	normalizeResourceQuery,
} from "@/components/resources/resourceSearch";

describe("resourceSearch", () => {
	it("normalizes search queries", () => {
		expect(normalizeResourceQuery("  Mentors  ")).toBe("mentors");
	});

	it("matches any of the provided fields case-insensitively", () => {
		expect(
			matchesResourceQuery("market", ["Training Videos", "Market Analysis"]),
		).toBe(true);
	});

	it("returns true for empty queries", () => {
		expect(matchesResourceQuery("   ", ["anything"])).toBe(true);
	});

	it("returns false when no fields match", () => {
		expect(matchesResourceQuery("discord", ["training", "video"])).toBe(false);
	});
});
