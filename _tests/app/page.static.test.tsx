import { describe, expect, it } from "vitest";

describe("HomePage static generation", () => {
	it("exports static caching hints for the marketing page", async () => {
		const mod = await import("@/app/page");
		expect(mod.dynamic).toBe("force-dynamic");
		expect(mod.runtime).toBe("nodejs");
		expect(mod.revalidate).toBeUndefined();
		expect(mod.fetchCache).toBeUndefined();
	});
});
