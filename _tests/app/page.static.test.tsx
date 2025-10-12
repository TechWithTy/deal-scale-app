import { describe, expect, it } from "vitest";

describe("HomePage static generation", () => {
	it("exports static caching hints for the marketing page", async () => {
		const mod = await import("@/app/page");
		expect(mod.dynamic).toBe("force-static");
		expect(mod.revalidate).toBeGreaterThan(0);
		expect(mod.fetchCache).toBe("force-cache");
		expect(mod.runtime).toBe("edge");
	});
});
