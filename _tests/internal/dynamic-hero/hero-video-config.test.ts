import { describe, expect, test } from "vitest";

import { heroVideoConfigSchema } from "@external/dynamic-hero";

describe("heroVideoConfigSchema", () => {
	test("returns default provider when not specified", () => {
		const result = heroVideoConfigSchema.parse({
			src: "https://example.com/video",
		});

		expect(result.provider).toBe("youtube");
	});

	test("rejects invalid video URLs", () => {
		expect(() =>
			heroVideoConfigSchema.parse({
				src: "not-a-valid-url",
			}),
		).toThrowError(/Invalid url/);
	});
});

