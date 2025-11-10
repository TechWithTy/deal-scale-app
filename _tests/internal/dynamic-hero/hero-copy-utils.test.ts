import { describe, expect, test } from "vitest";

import { resolveHeroCopy } from "@external/dynamic-hero";

describe("resolveHeroCopy", () => {
	test("sanitizes values and applies template defaults", () => {
		const result = resolveHeroCopy({
			values: {
				problem: "juggling tools—every day",
				solution: "automating your pipeline",
				fear: "competitors win",
				socialProof: "Join 200+ teams.",
				benefit: "Launch your first campaign",
				time: "5",
			},
		});

		expect(result.title).toContain("juggling tools-");
		expect(result.rotations.problems).toEqual(["juggling tools-every day"]);
	});

	test("fills missing chips with fallbacks", () => {
		const result = resolveHeroCopy(
			{
				values: {
					problem: "juggling tools",
					solution: "automating your pipeline",
					fear: "competitors win",
					socialProof: "Join 200+ teams.",
					benefit: "Launch your first campaign",
					time: "5",
				},
			},
			{
				fallbackPrimaryChip: {
					label: "Primary Chip",
					variant: "secondary",
				},
				fallbackSecondaryChip: {
					label: "Secondary Chip",
					variant: "outline",
				},
			},
		);

		expect(result.chips.primary?.label).toBe("Primary Chip");
		expect(result.chips.secondary?.label).toBe("Secondary Chip");
	});
});

