import { describe, expect, it } from "vitest";

describe("buildCacheControl", () => {
	it("creates a cache directive with s-maxage and stale-while-revalidate", async () => {
		const mod = await import("@/utils/http/cacheControl");
		const value = mod.buildCacheControl({
			cacheability: "public",
			maxAge: 900,
			sMaxAge: 86400,
			staleWhileRevalidate: 86400,
		});

		expect(value).toBe(
			"public, max-age=900, s-maxage=86400, stale-while-revalidate=86400",
		);
	});
});
